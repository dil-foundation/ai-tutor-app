/**
 * English-Only AI Tutor Screen
 * 
 * Features:
 * - ChatGPT-like voice mode experience
 * - Personalized greetings with user's name
 * - Thick accent detection and correction
 * - Broken English detection and correction
 * - Natural conversation flow without processing screens
 * - Prolonged pause detection (7+ seconds)
 * - Friendly, human-like tone
 * 
 * Flow:
 * 1. Greet user by name
 * 2. Listen continuously to user input
 * 3. Detect accent/grammar issues
 * 4. Provide corrections with pronunciation
 * 5. Stay in listening mode for next input
 * 6. Handle prolonged silence with gentle prompts
 */

import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Speech from 'expo-speech';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { closeEnglishOnlySocket, connectEnglishOnlySocket, isEnglishOnlySocketConnected, sendEnglishOnlyMessage } from '../../utils/websocket';
import { useAuth } from '../../../context/AuthContext';
import { getUserDisplayName, getUserFirstNameSync } from '../../../utils/userUtils';
import CHATGPT_TIMING_CONFIG, { getSilenceDuration, logTimingInfo } from '../../../utils/chatgptTimingConfig';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
  audioUri?: string;
  correction?: string;
  feedback?: string;
}

interface EnglishOnlyState {
  messages: Message[];
  currentStep: 'waiting' | 'listening' | 'speaking' | 'error' | 'greeting' | 'pause_detected';
  isConnected: boolean;
  isListening: boolean;
  isAISpeaking: boolean;
  isGreeting: boolean;
  isPauseDetected: boolean;
  currentMessageText: string;
  userName: string;
  silenceStartTime: number | null;
  lastUserInput: string;
  correctionProvided: boolean;
  isNoSpeechDetected: boolean; // New state for tracking no speech detected animation
  isProcessingAudio: boolean; // New state for tracking audio processing
  isNoSpeechAfterProcessing: boolean; // New state for tracking no speech detected after processing
  isUserReminded: boolean;
}

export default function EnglishOnlyScreen() {
  const { autoStart } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  // Full screen mode - hide status bar and tab bar
  useEffect(() => {
    StatusBar.setHidden(true);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  // Update userName when user data changes
  useEffect(() => {
    const updateUserName = async () => {
      if (user) {
        const displayName = await getUserDisplayName(user, 'there');
        setState(prev => ({
          ...prev,
          userName: displayName
        }));
        console.log('👤 [ENGLISH_ONLY] Updated user name to:', displayName);
      }
    };

    updateUserName();
  }, [user]);

  const [state, setState] = useState<EnglishOnlyState>({
    messages: [],
    currentStep: 'waiting',
    isConnected: false,
    isListening: false,
    isAISpeaking: false,
    isGreeting: false,
    isPauseDetected: false,
    currentMessageText: '',
    userName: getUserFirstNameSync(user, 'there'),
    silenceStartTime: null,
    lastUserInput: '',
    correctionProvided: false,
    isNoSpeechDetected: false,
    isProcessingAudio: false,
    isNoSpeechAfterProcessing: false,
    isUserReminded: false,
  });

  // Track connection attempts to prevent multiple simultaneous connections
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;

  // Custom silence detection for English-Only feature
  const isFirstRecordingRef = useRef(true); // Track if this is the first recording session
  const hasUserSpokenRef = useRef(false); // Track if user has spoken in current session
  const isNewSessionAfterAI = useRef(false); // Track if this is a new session after AI spoke

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollViewRef = useRef<any>(null);
  const isPlayingAudioRef = useRef(false); // Prevent multiple audio sessions
  const [isTalking, setIsTalking] = useState(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const micAnim = useRef(new Animated.Value(1)).current;
  const isScreenFocusedRef = useRef<boolean>(false);
  const isStoppingRef = useRef(false);
  const isProcessingAudioRef = useRef(false); // Track processing state immediately
  const lastMessageStepRef = useRef<string | null>(null);

  // Voice Activity Detection threshold
  const VAD_THRESHOLD = CHATGPT_TIMING_CONFIG.VAD_THRESHOLD;
  const SILENCE_DURATION = CHATGPT_TIMING_CONFIG.POST_SPEECH_SILENCE_DURATION;
  const MIN_SPEECH_DURATION = CHATGPT_TIMING_CONFIG.MIN_SPEECH_DURATION;
  const PROLONGED_PAUSE_DURATION = 7000; // 7 seconds for pause detection

  // iOS Silence Detection Calibration
  const IOS_VAD_OFFSET_DB = 20;
  const IOS_VAD_MIN_THRESHOLD = -90;
  const iOSMeteringCalibration = useRef({
    calibrated: false,
    maxMetering: -160,
    calibrationStart: 0,
    calibrationDuration: 1000,
  });

  const [vadThreshold, setVadThreshold] = useState(Platform.OS === 'ios' ? -70 : -45);

  // Handle screen focus and blur events
  useFocusEffect(
    useCallback(() => {
      console.log('English-Only screen focused - initializing...');
      isScreenFocusedRef.current = true;
      
      initializeAudio();
      
      // Set initial loading state
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        currentMessageText: 'Connecting to server...',
        isConnected: false
      }));
      
      connectToWebSocket();
      
      // Note: Greeting will be handled after WebSocket connection is established

      return () => {
        console.log('English-Only screen losing focus - cleaning up...');
        isScreenFocusedRef.current = false;
        cleanup();
      };
    }, [autoStart])
  );

  // Additional cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('English-Only component unmounting - final cleanup...');
      cleanup();
    };
  }, []);

  // Prolonged pause detection - only after user has spoken at least once
  useEffect(() => {
    if (state.silenceStartTime && !state.isAISpeaking && !state.isListening && state.lastUserInput) {
      const silenceDuration = Date.now() - state.silenceStartTime;
      if (silenceDuration >= PROLONGED_PAUSE_DURATION && !state.isPauseDetected) {
        console.log(`⏰ Pause detection triggered after ${silenceDuration}ms of silence`);
        handleProlongedPause();
      }
    }
  }, [state.silenceStartTime, state.isAISpeaking, state.isListening, state.isPauseDetected, state.lastUserInput]);

  const initializeAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      Alert.alert('Error', 'Failed to initialize audio permissions');
    }
  };

  const playGreeting = async () => {
    if (!isScreenFocusedRef.current) {
      console.log('Screen not focused, skipping greeting');
      return;
    }

    // Check if WebSocket is connected before sending greeting
    if (!isEnglishOnlySocketConnected()) {
      console.log('❌ WebSocket not connected, cannot send greeting');
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isGreeting: false,
        isAISpeaking: false,
        currentMessageText: 'Connecting to server...',
      }));
      return;
    }

    try {
      console.log('🎤 Playing personalized greeting...');
      setState(prev => ({ 
        ...prev, 
        currentStep: 'greeting',
        isGreeting: true,
        isAISpeaking: true,
        isListening: false, // Ensure listening is stopped during greeting
        currentMessageText: `Hi ${state.userName}, I'm your AI English tutor. How can I help?`,
      }));

      // Unload any previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Send greeting request to backend
      sendEnglishOnlyMessage(JSON.stringify({
        type: 'greeting',
        user_name: state.userName,
      }));

      console.log('✅ Greeting request sent to backend');

    } catch (error) {
      console.error('Failed to play greeting:', error);
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isGreeting: false,
        isAISpeaking: false,
        currentMessageText: '',
      }));
    }
  };

  const handleProlongedPause = async () => {
    console.log('⏰ Prolonged pause detected, prompting user...');
    
    // Prevent multiple pause detections
    if (state.isPauseDetected) {
      console.log('⏰ Pause already detected, skipping...');
      return;
    }
    
    setState(prev => ({
      ...prev,
      isPauseDetected: true,
      currentStep: 'speaking',
      isAISpeaking: true,
      currentMessageText: `Would you like to learn anything else, ${state.userName}?`,
    }));

    // Send pause detection message to backend
    sendEnglishOnlyMessage(JSON.stringify({
      type: 'prolonged_pause',
      user_name: state.userName,
    }));
  };

  const handleSilenceAfterAI = async () => {
    console.log('⏰ User silent after AI, prompting with "Would you be there?"');
    
    // Stop current recording if any
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch (error) {
        console.error('Error stopping recording for silence after AI:', error);
      }
    }

    setState(prev => ({
      ...prev,
      isUserReminded: true,
      currentStep: 'speaking',
      isAISpeaking: true,
      currentMessageText: `Would you be there?`,
    }));

    // Send silence after AI message to backend
    sendEnglishOnlyMessage(JSON.stringify({
      type: 'user_silent_after_ai',
      user_name: state.userName,
    }));
  };

  // Handle user response to pause prompt
  const handleFirstTimeSilence = async () => {
    console.log('🔇 Handling first time silence - playing no speech message (frontend only)');
    
    // Stop current recording
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch (error) {
        console.error('Error stopping recording for first time silence:', error);
      }
    }

    // Reset first recording flag since we've handled the silence
    isFirstRecordingRef.current = false;
    console.log('🔄 Silence handled, switching to normal mode');

    // Set state to show no speech detected with animation (like conversation.tsx)
    setState(prev => ({
      ...prev,
      currentStep: 'waiting',
      isAISpeaking: false,
      isListening: false,
      isNoSpeechDetected: true, // Show no speech detected animation
      currentMessageText: 'No speech detected. Please try speaking again.',
    }));

    // Play pre-recorded TTS audio directly in frontend (no backend call)
    await playNoSpeechDetectedAudio();

    console.log('✅ No speech detected handled in frontend only');
  };

  const playNoSpeechDetectedAudio = async () => {
    console.log('🔊 Playing no speech detected audio in frontend...');
    
    try {
      // Use expo-speech to play the audio directly (like conversation.tsx)
      const noSpeechText = 'No speech detected. Please try speaking again.';
      
      // Set state to show AI speaking animation
      setState(prev => ({
        ...prev,
        currentStep: 'speaking',
        isAISpeaking: true,
        isNoSpeechDetected: true,
        currentMessageText: noSpeechText,
      }));

      // Play the audio using expo-speech
      await Speech.speak(noSpeechText, {
        language: 'en-US',
        rate: 0.8,
        pitch: 1.0,
        onDone: () => {
          console.log('🎵 No speech detected audio finished playing, restarting recording');
          setState(prev => ({
            ...prev,
            currentStep: 'waiting',
            isAISpeaking: false,
            isNoSpeechDetected: false, // Clear no speech detected state
            currentMessageText: '',
            silenceStartTime: Date.now(),
          }));

          // Restart recording after no speech detected audio finishes
          setTimeout(() => {
            if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking && !state.isProcessingAudio && !isProcessingAudioRef.current) {
              console.log('🎤 Restarting recording after no speech detected audio finished');
              // Keep existing flags as they are - don't reset isFirstRecording inappropriately
              hasUserSpokenRef.current = false;
              // Don't reset isFirstRecordingRef.current here - it should stay as it was
              // Don't reset isNewSessionAfterAI.current here - it should stay as it was
              console.log('🔄 [NO_SPEECH_DETECTED] Restart recording while preserving flag states');
              startRecording();
            }
          }, 1000); // 1 second delay before restarting recording
        },
        onError: (error: any) => {
          console.error('Error playing no speech detected audio:', error);
          // Fallback: restart recording even if audio fails
          setState(prev => ({
            ...prev,
            currentStep: 'waiting',
            isAISpeaking: false,
            isNoSpeechDetected: false,
            currentMessageText: '',
          }));
          setTimeout(() => {
            if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking && !state.isProcessingAudio && !isProcessingAudioRef.current) {
              // Keep existing flags in error fallback too
              hasUserSpokenRef.current = false;
              console.log('🔄 [NO_SPEECH_DETECTED] Restart recording in onError while preserving flag states');
              startRecording();
            }
          }, 1000);
        }
      });

    } catch (error) {
      console.error('Failed to play no speech detected audio:', error);
      // Fallback: restart recording
      setState(prev => ({
        ...prev,
        currentStep: 'waiting',
        isAISpeaking: false,
        isNoSpeechDetected: false,
        currentMessageText: '',
      }));
      setTimeout(() => {
        if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking && !state.isProcessingAudio && !isProcessingAudioRef.current) {
          startRecording();
        }
      }, 1000);
    }
  };

  const handlePauseResponse = (userResponse: string) => {
    console.log('⏰ User response to pause prompt:', userResponse);
    
    const response = userResponse.toLowerCase().trim();
    
    if (response.includes('yes') || response.includes('continue') || response.includes('more')) {
      console.log('⏰ User wants to continue, resuming conversation...');
      setState(prev => ({
        ...prev,
        isPauseDetected: false,
        currentStep: 'waiting',
        isAISpeaking: false,
        currentMessageText: '',
        silenceStartTime: Date.now(),
      }));
      
      // Start listening again after a short delay
      setTimeout(() => {
        if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking && !state.isProcessingAudio && !isProcessingAudioRef.current) {
          console.log('🎤 Resuming conversation after pause response');
          startRecording();
        }
      }, 1000);
    } else {
      console.log('⏰ User wants to end session, showing mic button...');
      setState(prev => ({
        ...prev,
        isPauseDetected: false,
        currentStep: 'waiting',
        isAISpeaking: false,
        currentMessageText: 'Press the mic button to continue learning!',
        silenceStartTime: null,
      }));
    }
  };

  const connectToWebSocket = () => {
    // Prevent multiple simultaneous connection attempts
    if (connectionAttemptsRef.current >= maxConnectionAttempts) {
      console.log('❌ Max connection attempts reached, stopping retries');
      setState(prev => ({ 
        ...prev, 
        currentMessageText: 'Connection failed. Please check your internet and try again.',
        currentStep: 'error'
      }));
      return;
    }

    connectionAttemptsRef.current++;
    console.log(`🔌 Starting WebSocket connection (attempt ${connectionAttemptsRef.current}/${maxConnectionAttempts})...`);
    
    connectEnglishOnlySocket(
      (data: any) => handleWebSocketMessage(data),
      (audioBuffer: ArrayBuffer) => handleAudioData(audioBuffer),
      () => handleWebSocketClose()
    );

    // Set connection timeout
    const connectionTimeout = setTimeout(() => {
      if (!isEnglishOnlySocketConnected()) {
        console.log(`⚠️ WebSocket connection timeout (attempt ${connectionAttemptsRef.current})`);
        setState(prev => ({ 
          ...prev, 
          currentMessageText: `Connection attempt ${connectionAttemptsRef.current} failed. Retrying...`,
          currentStep: 'error'
        }));
        
        // Retry connection after timeout
        setTimeout(() => {
          if (isScreenFocusedRef.current && !state.isConnected) {
            console.log('🔄 Retrying WebSocket connection...');
            connectToWebSocket();
          }
        }, 2000);
      } else {
        console.log('✅ Connection established before timeout, clearing timeout');
        connectionAttemptsRef.current = 0; // Reset attempts on success
      }
    }, 12000); // 12 second timeout (increased to be less than WebSocket timeout)

    const interval = setInterval(() => {
      if (isEnglishOnlySocketConnected()) {
        console.log("✅ English-Only Socket verified connected");
        connectionAttemptsRef.current = 0; // Reset attempts on successful connection
        setState(prev => ({ 
          ...prev, 
          isConnected: true,
          currentMessageText: '', // Clear any loading/error messages
          currentStep: 'waiting'
        }));
        clearInterval(interval);
        clearTimeout(connectionTimeout);
        
        // Auto-start with greeting if param is set and connection is ready
        if (autoStart === 'true' && isScreenFocusedRef.current) {
          console.log('🎯 Connection established, now playing greeting...');
          setTimeout(() => {
            if (isScreenFocusedRef.current) {
              playGreeting();
            }
          }, 200); // Short delay after connection
        }
      }
    }, 100);
  };

  const handleWebSocketMessage = (data: any) => {
    if (!isScreenFocusedRef.current) {
      console.log('Screen not focused, ignoring WebSocket message');
      return;
    }

    console.log('Received English-Only WebSocket message:', data);

    // Stop any existing recording when AI responds
    if (recordingRef.current && state.isListening) {
      console.log('🛑 Stopping recording because AI is responding');
      stopRecording(false).catch(console.error);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: data.conversation_text || data.response || 'AI response',
      isAI: true,
      timestamp: new Date(),
      correction: data.correction,
      feedback: data.feedback,
    };

    // Track if this is a response to user speech (not greeting or pause)
    const isResponseToUserSpeech = data.step === 'correction' && data.original_text;
    const isPausePrompt = data.step === 'pause_detected';
    const isNoSpeechDetected = data.step === 'no_speech' || data.step === 'no_speech_detected';
    const isNoSpeechAfterProcessing = data.step === 'no_speech_detected_after_processing';
    const isProcessingStarted = data.step === 'processing_started';
    const isUserReminded = data.step === 'user_reminded';

    // Immediately update the last message step ref to prevent race conditions
    lastMessageStepRef.current = data.step;

    // Handle processing_started step - keep processing state until correction
    if (isProcessingStarted) {
      console.log('🔄 Processing started - keeping processing state until correction response');
      isProcessingAudioRef.current = true; // Set ref immediately
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isListening: false,
      isGreeting: false,
      isPauseDetected: isPausePrompt,
      isNoSpeechDetected: isNoSpeechDetected,
      isNoSpeechAfterProcessing: isNoSpeechAfterProcessing,
      isUserReminded: isUserReminded,
      isProcessingAudio: isProcessingStarted, // Keep processing state for processing_started
      currentMessageText: isProcessingStarted ? 'Processing your speech...' : (data.conversation_text || data.response || 'AI response'),
      // Don't set isAISpeaking to false here - let handleAudioData manage it
      // Update lastUserInput if this is a response to user speech
      lastUserInput: isResponseToUserSpeech ? data.original_text : prev.lastUserInput,
    }));

    // Handle no speech detected response from backend
    if (isNoSpeechDetected) {
      // Don't handle no_speech if we're currently processing audio
      if (isProcessingAudioRef.current || state.isProcessingAudio) {
        console.log('🔇 Ignoring no_speech response - currently processing audio (ref: ' + isProcessingAudioRef.current + ', state: ' + state.isProcessingAudio + ')');
        return;
      }
      
      console.log('🔇 Backend detected no speech - playing no speech detected audio');
      // Reset hasUserSpoken flag since backend detected no speech
      hasUserSpokenRef.current = false;
      // Play no speech detected audio and restart recording
      setTimeout(() => {
        if (isScreenFocusedRef.current) {
          playNoSpeechDetectedAudio();
        }
      }, 500); // Short delay before playing audio
    }

    // Handle no speech detected after processing response from backend
    if (isNoSpeechAfterProcessing) {
      console.log('🔇 Backend detected no speech after processing - clearing processing state and preparing for restart');
      // Clear processing state immediately
      isProcessingAudioRef.current = false;
      // Reset hasUserSpoken flag since backend detected no speech after processing
      hasUserSpokenRef.current = false;
      // Don't reset isFirstRecordingRef.current - preserve existing flag state
      console.log('🔄 [NO_SPEECH_AFTER_PROCESSING] Cleared processing state while preserving flag states');
      // The audio will be handled in handleAudioData and playAudio functions
    }

    // Handle final correction response - clear processing state
    if (isResponseToUserSpeech) {
      console.log('✅ Received final correction response, clearing processing state');
      console.log('🔍 [Correction] Clearing isProcessingAudio, proceeding with correction');
      isProcessingAudioRef.current = false; // Clear ref immediately
      setState(prev => ({
        ...prev,
        isProcessingAudio: false, // Clear processing state for final response
      }));
    }

    // Auto-scroll UI
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAudioData = async (audioBuffer: ArrayBuffer) => {
    if (!isScreenFocusedRef.current) {
      console.log('Screen not focused, ignoring audio data');
      return;
    }

    // Stop recording immediately when AI starts speaking
    if (recordingRef.current && state.isListening) {
      console.log('🛑 Stopping recording because AI is about to speak');
      try {
        await stopRecording(false);
      } catch (error) {
        console.error('Error stopping recording for AI speech:', error);
      }
    }

    // iOS Volume Fix
    if (Platform.OS === 'ios') {
      try {
        console.log('iOS: Setting audio mode for playback.');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          shouldDuckAndroid: true,
        });
      } catch (e) {
        console.error("iOS: Failed to set audio mode for playback:", e);
      }
    }

    try {
      const base64 = Buffer.from(audioBuffer).toString('base64');
      const audioUri = `${FileSystem.cacheDirectory}english_only_audio_${Date.now()}.mp3`;

      await FileSystem.writeAsStringAsync(audioUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // If a high-priority audio message arrives, interrupt the current audio.
      // This prevents a race condition where a "no speech" response is ignored
      // because the initial "processing" audio is still playing.
      const isHighPriority = lastMessageStepRef.current === 'no_speech_detected_after_processing' || lastMessageStepRef.current === 'correction';
      if (isHighPriority && isPlayingAudioRef.current) {
        console.log('🎵 [High Priority] Interrupting current audio for new message.');
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        isPlayingAudioRef.current = false;
      }

      // Check if this is greeting audio, no speech detected audio, or processing audio
      const isGreeting = state.isGreeting;
      const isNoSpeechDetected = state.isNoSpeechDetected;
      const isNoSpeechAfterProcessing = state.isNoSpeechAfterProcessing;
      const isUserReminded = state.isUserReminded;
      const isProcessingStarted = isProcessingAudioRef.current || state.isProcessingAudio || state.currentMessageText.includes('Processing your speech');

      console.log(`🎵 [Audio Data] isGreeting: ${isGreeting}, isNoSpeechDetected: ${isNoSpeechDetected}, isNoSpeechAfterProcessing: ${isNoSpeechAfterProcessing}, isUserReminded: ${isUserReminded}, isProcessingStarted: ${isProcessingStarted}, ref: ${isProcessingAudioRef.current}, state: ${state.isProcessingAudio}, currentMessageText: "${state.currentMessageText}"`);

      // Only update state if not already speaking to prevent unnecessary re-renders
      setState(prev => {
        if (prev.isAISpeaking) {
          // Already speaking, just update the audio URI
          return {
            ...prev,
            currentAudioUri: audioUri,
          };
        } else {
          // Not speaking, set all speaking-related states
          // For processing audio, don't set speaking state - keep it in waiting
          if (isProcessingStarted) {
            return {
              ...prev,
              currentAudioUri: audioUri,
              currentStep: 'waiting', // Keep in waiting state for processing
              isAISpeaking: false, // Not AI speaking, just processing feedback
              isListening: false, // Ensure listening is stopped
            };
          } else {
            // Normal AI speaking
            return {
              ...prev,
              currentAudioUri: audioUri,
              currentStep: 'speaking',
              isAISpeaking: true,
              isListening: false, // Ensure listening is stopped
            };
          }
        }
      });

      await playAudio(audioUri, isGreeting, isNoSpeechDetected, isProcessingStarted, isNoSpeechAfterProcessing, isUserReminded);
    } catch (error) {
      console.error('Failed to handle audio data:', error);
    }
  };

  const handleWebSocketClose = () => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      currentStep: 'error',
      isListening: false,
      isAISpeaking: false,
      isGreeting: false,
      isPauseDetected: false,
      isNoSpeechDetected: false,
      isNoSpeechAfterProcessing: false,
      isUserReminded: false,
      currentMessageText: '',
    }));
  };

  const playAudio = async (audioUri: string, isGreeting = false, isNoSpeechDetected = false, isProcessingStarted = false, isNoSpeechAfterProcessing = false, isUserReminded = false) => {
    console.log(`🎵 [PlayAudio] Starting with isGreeting: ${isGreeting}, isNoSpeechDetected: ${isNoSpeechDetected}, isProcessingStarted: ${isProcessingStarted}, isNoSpeechAfterProcessing: ${isNoSpeechAfterProcessing}, isUserReminded: ${isUserReminded}`);
    
    if (!isScreenFocusedRef.current) {
      console.log('Screen not focused, skipping audio playback');
      return;
    }

    // Prevent multiple audio sessions
    // This check is now handled more intelligently in `handleAudioData` to prevent race conditions.
    // if (isPlayingAudioRef.current) {
    //   console.log('Audio already playing, skipping new audio session');
    //   return;
    // }

    isPlayingAudioRef.current = true;

    try {
      // Stop any existing audio playback
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (error) {
          console.log('Error stopping existing audio:', error);
        }
        soundRef.current = null;
      }

      // Clear any existing timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log(`🎵 [Audio Finished] isGreeting: ${isGreeting}, isNoSpeechDetected: ${isNoSpeechDetected}, isProcessingStarted: ${isProcessingStarted}, isNoSpeechAfterProcessing: ${isNoSpeechAfterProcessing}, isUserReminded: ${isUserReminded}`);
          // Reset audio playing flag
          isPlayingAudioRef.current = false;
          
          if (isGreeting) {
            console.log('🎵 [Audio Branch] Greeting audio finished playing, starting to listen');
            setState(prev => ({
              ...prev, 
              currentStep: 'waiting',
              isAISpeaking: false,
              isGreeting: false,
              currentMessageText: '',
              silenceStartTime: Date.now(),
            }));

            // Start listening immediately after greeting finishes
            if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
              console.log('🎤 Starting to listen immediately after greeting finished');
              startRecording();
            }
          } else if (isNoSpeechDetected) {
            console.log('🎵 [Audio Branch] No speech detected audio finished playing, restarting recording');
            setState(prev => ({
              ...prev, 
              currentStep: 'waiting',
              isAISpeaking: false,
              isNoSpeechDetected: false, // Clear no speech detected state
              currentMessageText: '',
              silenceStartTime: Date.now(),
            }));

            // Restart recording after no speech detected audio finishes
            setTimeout(() => {
              if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
                console.log('🎤 Restarting recording after no speech detected audio finished');
                startRecording();
              }
            }, 1000); // 1 second delay before restarting recording
          } else if (isProcessingStarted) {
            console.log('🎵 [Audio Branch] "Please wait" audio finished playing. Now waiting for final backend response.');
            // This was just the initial feedback audio. The main processing is still
            // happening. We only need to update the speaking state.
            // Critically, we DO NOT modify isProcessingAudio or currentMessageText,
            // as that would cause a race condition and overwrite the state set by
            // the final response message (e.g., 'correction' or 'no_speech_detected_after_processing').
            setState(prev => ({
              ...prev, 
              isAISpeaking: false,
            }));
            // Don't restart recording here - wait for the actual response from backend
          } else if (isNoSpeechAfterProcessing) {
            console.log('🎵 [Audio Branch] No speech after processing audio finished playing, restarting recording with 5-second silence detection');
            setState(prev => ({
              ...prev, 
              currentStep: 'waiting',
              isAISpeaking: false,
              isNoSpeechAfterProcessing: false, // Clear no speech after processing state
              currentMessageText: '',
              silenceStartTime: Date.now(),
            }));

            // Restart recording after no speech after processing audio finishes with 5-second silence detection
            setTimeout(() => {
              if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
                console.log('🎤 Restarting recording after no speech after processing audio finished');
                // Don't reset isFirstRecordingRef.current - preserve existing flag state
                hasUserSpokenRef.current = false;
                // Don't reset isNewSessionAfterAI.current - preserve existing flag state  
                console.log('🔄 [NO_SPEECH_AFTER_PROCESSING] Restart recording while preserving flag states');
                
                // Ensure processing state is cleared before starting recording
                setState(prev => ({
                  ...prev,
                  isProcessingAudio: false,
                }));
                isProcessingAudioRef.current = false;
                
                startRecording();
              } else {
                console.log('🛑 Cannot start recording immediately after no speech after processing, will retry in 500ms');
                // Retry after a short delay if conditions aren't met
                setTimeout(() => {
                  if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking && !state.isProcessingAudio && !isProcessingAudioRef.current) {
                    console.log('🔄 Retrying startRecording after no speech after processing');
                    startRecording();
                  }
                }, 500);
              }
            }, 1000); // 1 second delay before restarting recording
          } else if (isUserReminded) {
            console.log('🎵 [Audio Branch] User reminder audio finished, restarting recording with 5-second silence detection');
            setState(prev => ({
              ...prev, 
              currentStep: 'waiting',
              isAISpeaking: false,
              isUserReminded: false, // Clear user reminded state
              currentMessageText: '',
              silenceStartTime: Date.now(),
            }));

            // Restart recording after user reminder with initial 5-second silence detection
            setTimeout(() => {
              if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
                console.log('🎤 Restarting recording after user reminder');
                // Don't reset isFirstRecordingRef.current - preserve existing flag state
                hasUserSpokenRef.current = false;
                // Don't reset isNewSessionAfterAI.current - preserve existing flag state
                console.log('🔄 [USER_REMINDED] Restart recording while preserving flag states');
                startRecording();
              }
            }, 1000); // 1 second delay before restarting recording
          } else {
            console.log('🎵 [Audio Branch] AI audio finished playing, preparing to listen again');
            setState(prev => ({
              ...prev, 
              currentStep: 'waiting',
              isAISpeaking: false,
              currentMessageText: '',
              silenceStartTime: Date.now(),
            }));
            
            // Log state after update
            console.log('📊 State updated after AI audio finished');

            // Start listening again after a short delay
            setTimeout(() => {
              console.log('⏰ Timeout triggered for starting recording after AI speech');
              console.log('🔍 Screen focused:', isScreenFocusedRef.current);
              console.log('🔍 Is listening:', state.isListening);
              console.log('🔍 Is AI speaking:', state.isAISpeaking);
              console.log('🔍 Is processing audio:', state.isProcessingAudio);
              console.log('🔍 Is stopping:', isStoppingRef.current);
              
              if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking && !state.isProcessingAudio && !isProcessingAudioRef.current) {
                console.log('🎤 Starting to listen again after AI finished speaking');
                // DON'T reset isFirstRecording - it should only be true for the very first app load
                // isFirstRecordingRef.current = true; // ❌ REMOVED: This was causing the bug
                // Mark this as a new session after AI spoke
                isNewSessionAfterAI.current = true;
                // Reset hasUserSpoken for the new session after AI
                hasUserSpokenRef.current = false;
                console.log('🔄 Set isNewSessionAfterAI for user_silent_after_ai logic');
                console.log('🔄 Reset hasUserSpoken for new session after AI');
                startRecording();
              } else {
                console.log('🛑 Cannot start recording - conditions not met');
              }
            }, 1200); // 1.2 second delay before listening again
          }
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio:', error);
      isPlayingAudioRef.current = false; // Reset flag on error
      setState(prev => ({ ...prev, currentStep: 'waiting' }));
    }
  };

  const startRecording = async () => {
    // Prevent multiple recording sessions
    if (state.isListening || state.isAISpeaking || state.isGreeting || state.isProcessingAudio || isProcessingAudioRef.current || state.isUserReminded) {
      console.log('🛑 Cannot start recording: already listening, AI speaking, greeting, processing audio, or user reminded (ref: ' + isProcessingAudioRef.current + ')');
      return;
    }

    // Prevent multiple simultaneous calls
    if (isStoppingRef.current) {
      console.log('🛑 Cannot start recording: currently stopping, will retry in 500ms');
      // Retry after a short delay
      setTimeout(() => {
        if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking && !state.isProcessingAudio && !isProcessingAudioRef.current) {
          console.log('🔄 Retrying startRecording after stopping delay');
          startRecording();
        }
      }, 500);
      return;
    }

    console.log('🎤 Starting recording process...');

    try {
      console.log('🎤 Setting audio mode for recording...');
      // Set audio mode with timeout to prevent hanging
      const audioModePromise = Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });
      
      await Promise.race([
        audioModePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Audio mode timeout')), 1000))
      ]);
      console.log('✅ Audio mode set successfully');
    } catch (error) {
      console.error('Failed to set audio mode for recording:', error);
      // Don't show alert for timeout, just continue
      if (error instanceof Error && !error.message?.includes('timeout')) {
        Alert.alert('Error', 'Could not configure audio for recording.');
        setState(prev => ({ 
          ...prev, 
          currentStep: 'waiting',
          isListening: false 
        }));
        return;
      }
    }

    isStoppingRef.current = false;

    console.log('🎤 Checking audio permissions...');
    try {
      const permission = await Audio.getPermissionsAsync();
      if (!permission.granted) {
        console.log('Requesting audio permissions...');
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          console.log('❌ Audio permission denied');
          Alert.alert('Permission Required', 'Microphone access is needed to speak with the tutor.');
          setState(prev => ({ 
            ...prev, 
            currentStep: 'waiting',
            isListening: false 
          }));
          return;
        }
      }
      console.log('✅ Audio permissions granted');
    } catch (error) {
      console.error('Permission check failed:', error);
      // Continue anyway - permissions might already be granted
    }

    if (!isScreenFocusedRef.current) {
      console.log('Screen not focused, skipping recording start');
      return;
    }

    // Quick cleanup - stop existing recording and audio in parallel
    const cleanupPromises = [];
    
    if (recordingRef.current) {
      console.log('🛑 Stopping existing recording...');
      cleanupPromises.push(
        recordingRef.current.stopAndUnloadAsync().catch(e => {
          console.log('Error stopping existing recording:', e);
        })
      );
      recordingRef.current = null;
    }

    if (soundRef.current) {
      console.log('🔇 Stopping existing audio...');
      cleanupPromises.push(
        soundRef.current.stopAsync().then(() => soundRef.current?.unloadAsync()).catch(e => {
          console.log('Error stopping existing audio:', e);
        })
      );
      soundRef.current = null;
    }

    // Wait for cleanup to complete (but don't block if it takes too long)
    if (cleanupPromises.length > 0) {
      try {
        await Promise.race([
          Promise.all(cleanupPromises),
          new Promise(resolve => setTimeout(resolve, 500)) // Max 500ms wait
        ]);
        console.log('✅ Cleanup completed');
      } catch (e) {
        console.log('Cleanup completed with errors:', e);
      }
    }

    if (!isEnglishOnlySocketConnected()) {
      Alert.alert('Error', 'WebSocket connection is not available');
      return;
    }

    // Reset iOS metering calibration
    if (Platform.OS === 'ios') {
      iOSMeteringCalibration.current = {
        calibrated: false,
        maxMetering: -160,
        calibrationStart: Date.now(),
        calibrationDuration: 1000,
      };
    }

    try {
      setState(prev => ({ 
        ...prev, 
        currentStep: 'listening',
        isListening: true,
        isAISpeaking: false,
        isGreeting: false,
        isPauseDetected: false,
        currentMessageText: '',
        silenceStartTime: null,
      }));

      // Log the recording state for debugging
      console.log(`🔄 Recording started - isFirstRecording: ${isFirstRecordingRef.current}, hasUserSpoken: ${hasUserSpokenRef.current}, isNewSessionAfterAI: ${isNewSessionAfterAI.current}`);

      console.log('🎤 Recording started successfully');

      console.log('DEBUG: Recording started. Resetting speech start time.');
      speechStartTimeRef.current = null;

      const resetSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        // Custom silence detection logic for English-Only feature
        let silenceTimeout: number;
        let timingType: 'initial' | 'post-speech' | 'ai-delay' | 'user-delay';
        
        if (isFirstRecordingRef.current && !hasUserSpokenRef.current) {
          // First time recording - 6 seconds silence
          silenceTimeout = 6000; // 6 seconds
          timingType = 'initial';
        } else if (isNewSessionAfterAI.current && !hasUserSpokenRef.current) {
          // New session after AI spoke - 7 seconds silence (play "Would you be there?")
          silenceTimeout = 7000; // 7 seconds
          timingType = 'ai-delay';
        } else if (hasUserSpokenRef.current) {
          // User has spoken in this session - 2 seconds silence (send to backend)
          silenceTimeout = 2000; // 2 seconds
          timingType = 'post-speech';
        } else {
          // Fallback to ChatGPT timing
          silenceTimeout = getSilenceDuration(!!speechStartTimeRef.current);
          timingType = speechStartTimeRef.current ? 'post-speech' : 'initial';
        }
        
        console.log(`🎯 [SILENCE_TIMER] Setting timeout: ${silenceTimeout}ms, type: ${timingType}, isFirstRecording: ${isFirstRecordingRef.current}, hasUserSpoken: ${hasUserSpokenRef.current}, isNewSessionAfterAI: ${isNewSessionAfterAI.current}`);
        
        logTimingInfo('English-Only', silenceTimeout, timingType);
        
        silenceTimerRef.current = setTimeout(() => {
          console.log(`🎯 SILENCE DETECTED: Timer triggered after ${silenceTimeout}ms`);
          console.log(`🔍 Current state - isFirstRecording: ${isFirstRecordingRef.current}, hasUserSpoken: ${hasUserSpokenRef.current}, isNewSessionAfterAI: ${isNewSessionAfterAI.current}`);
          console.log(`🔍 Recording state - currentStep: ${state.currentStep}, recordingRef: ${!!recordingRef.current}`);
          
          // Check if we're still in listening state or if recording is active
          if (state.currentStep === 'listening' || recordingRef.current) {
            setIsTalking(false);
            console.log('🎯 Stopping recording due to silence detection');
            
            // Handle different silence scenarios
            if (isFirstRecordingRef.current && !hasUserSpokenRef.current) {
              // First time silence or new conversation cycle silence - play "No speech detected" message
              console.log('🔇 First recording/new cycle silence detected - playing no speech message');
              handleFirstTimeSilence();
            } else if (isNewSessionAfterAI.current && !hasUserSpokenRef.current) {
              // New session after AI spoke - play "Would you be there?" message
              console.log('🔇 New session after AI silence detected - playing "Would you be there?" message');
              handleSilenceAfterAI();
            } else if (hasUserSpokenRef.current) {
              // Post-speech silence - send to backend for processing
              console.log('🔇 Post-speech silence detected - sending to backend');
              stopRecording(true);
            } else {
              // Fallback case - this should handle restart after no_speech_detected_after_processing
              console.log('🔇 Fallback silence detected - playing no speech message (likely restart after no_speech_detected_after_processing)');
              handleFirstTimeSilence();
            }
          } else {
            console.log('🛑 Silence timer triggered but not in listening state, ignoring');
          }
        }, silenceTimeout);
      };

      const options = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      };

      console.log('🎤 Creating recording instance...');
      const { recording } = await Audio.Recording.createAsync(
        options,
        (status) => {
          if (status.metering != null && status.isRecording && !isStoppingRef.current) {
            const currentTime = Date.now();

            // iOS Metering Calibration
            if (Platform.OS === 'ios') {
              console.log(`iOS Metering: ${status.metering} dB`);
              if (!iOSMeteringCalibration.current.calibrated) {
                if (status.metering > iOSMeteringCalibration.current.maxMetering) {
                  iOSMeteringCalibration.current.maxMetering = status.metering;
                }
                if (currentTime - iOSMeteringCalibration.current.calibrationStart > iOSMeteringCalibration.current.calibrationDuration) {
                  const newThreshold = Math.max(iOSMeteringCalibration.current.maxMetering - IOS_VAD_OFFSET_DB, IOS_VAD_MIN_THRESHOLD);
                  setVadThreshold(newThreshold);
                  iOSMeteringCalibration.current.calibrated = true;
                  console.log(`iOS VAD threshold auto-calibrated to: ${newThreshold}`);
                }
              }
            }

            const threshold = Platform.OS === 'ios' ? vadThreshold : VAD_THRESHOLD;

            if (status.metering > threshold) {
              if (speechStartTimeRef.current === null) {
                speechStartTimeRef.current = currentTime;
                console.log(`DEBUG: Speech start time set to: ${speechStartTimeRef.current}`);
              }

              // Mark that user has spoken in this session
              if (!hasUserSpokenRef.current) {
                hasUserSpokenRef.current = true;
                // Reset first recording flag since user has spoken
                if (isFirstRecordingRef.current) {
                  isFirstRecordingRef.current = false;
                  console.log('🔄 First recording completed - user has spoken, switching to normal mode');
                }
                // Reset new session after AI flag since user has spoken
                if (isNewSessionAfterAI.current) {
                  isNewSessionAfterAI.current = false;
                  console.log('🔄 New session after AI completed - user has spoken, switching to normal mode');
                }
                console.log('🎤 User has spoken in this session');
              }

              if (!isTalking) {
                setIsTalking(true);
                setState(prev => ({ 
                  ...prev, 
                  isListening: false,
                }));
              }
              // Only reset silence timer when user is talking
              resetSilenceTimer();
            } else {
              if (isTalking) {
                setIsTalking(false);
                setState(prev => ({ 
                  ...prev, 
                  isListening: true,
                }));
              }
              // Don't reset silence timer when user is not talking - let it complete
            }
          } else if (Platform.OS === 'ios' && status.isRecording && !isStoppingRef.current) {
            if (!iOSMeteringCalibration.current.calibrated && Date.now() - iOSMeteringCalibration.current.calibrationStart > 2000) {
              if (iOSMeteringCalibration.current.maxMetering <= -159) {
                console.warn('iOS metering not working, using fallback silence timer.');
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                  setIsTalking(false);
                  stopRecording(true);
                }, 3000);
                iOSMeteringCalibration.current.calibrated = true;
              }
            }
          }
        },
        200
      );

      // Verify recording was created successfully
      if (!recording) {
        throw new Error('Recording instance was not created');
      }

      console.log('🎤 Recording instance created successfully');
      recordingRef.current = recording;
      resetSilenceTimer();
      
      console.log('✅ Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      // Reset state on error
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isListening: false,
        isAISpeaking: false,
      }));
      
      // Clear any partial recording
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (e) {
          console.log('Error cleaning up failed recording:', e);
        }
        recordingRef.current = null;
      }
      
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      
      // Retry recording after a short delay
      setTimeout(() => {
        if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking && !state.isProcessingAudio && !isProcessingAudioRef.current) {
          console.log('🔄 Retrying recording after error...');
          startRecording();
        }
      }, 2000);
    }
  };

  const stopRecording = async (stoppedBySilence = false) => {
    if (isStoppingRef.current) {
      console.log('Already stopping recording, skipping...');
      return;
    }

    isStoppingRef.current = true;

    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (!recordingRef.current) {
      console.log('No recording to stop');
      setState(prev => ({ 
        ...prev, 
        isListening: false,
        currentStep: 'waiting'
      }));
      isStoppingRef.current = false;
      return;
    }

    try {
      // Update state immediately
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isListening: false,
        isAISpeaking: false,
        isGreeting: false,
        isPauseDetected: false,
        currentMessageText: '',
      }));

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      const speechStartedAt = speechStartTimeRef.current;
      const speechEndedAt = Date.now();
      const duration = speechStartedAt ? speechEndedAt - speechStartedAt : 0;
      const hadValidSpeech = speechStartedAt && duration >= MIN_SPEECH_DURATION;

      console.log(`DEBUG: Stop recording details - Start: ${speechStartedAt}, End: ${speechEndedAt}, Duration: ${duration}ms`);
      console.log(`Stopping recording. Reason: ${stoppedBySilence ? 'silence' : 'manual'}. Speech duration: ${duration}ms, valid: ${hadValidSpeech}`);

      if (uri && hadValidSpeech) {
        if (stoppedBySilence) {
          // Post-speech silence detected - send to backend for processing
          console.log('🔇 Post-speech silence detected - sending audio to backend for processing');
          await processUserSpeech(uri);
        } else {
          // Manual stop - also process
          console.log("Valid speech detected. Processing audio...");
          await processUserSpeech(uri);
        }
      } else if (stoppedBySilence) {
        console.log('🔇 Recording stopped due to silence, but no valid speech detected');
      } else {
        console.log('Recording stopped but speech was too short or invalid.');
      }
      
      speechStartTimeRef.current = null;
      
      // Don't reset hasUserSpoken flag - keep it true once user has spoken
      // This ensures we only send to backend when user actually speaks
      console.log('🔄 Keeping hasUserSpoken flag as true - user has spoken in this session');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setState(prev => ({ ...prev, currentStep: 'error' }));
    } finally {
      // Always reset the stopping flag
      isStoppingRef.current = false;
      console.log('✅ Recording stop process completed, isStoppingRef reset to false');
    }
  };

  const uploadAudioAndSendMessage = async (audioUri: string) => {
    try {
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const messagePayload = {
        audio_base64: base64Audio,
        filename: `english_only_recording-${Date.now()}.wav`,
        user_name: state.userName,
      };

      sendEnglishOnlyMessage(JSON.stringify(messagePayload));

      setState(prev => ({
        ...prev,
        currentStep: 'waiting',
      }));

    } catch (error) {
      console.error('Failed to convert/send audio:', error);
      setState(prev => ({ 
        ...prev, 
        currentStep: 'error',
        isListening: false,
        isAISpeaking: false,
        isGreeting: false,
        isPauseDetected: false,
        currentMessageText: '',
      }));
    }
  };

  // Enhanced function to handle user speech and pause responses
  const processUserSpeech = async (audioUri: string) => {
    try {
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // If we're in pause detection mode, handle it as a pause response
      if (state.isPauseDetected) {
        // For now, we'll send it to backend for STT and then handle the response
        // In a real implementation, you might want to handle pause responses differently
        console.log('⏰ Processing pause response...');
      }

      // Set processing state to show loading animation
      setState(prev => ({
        ...prev,
        currentStep: 'waiting', // Show loading animation
        isAISpeaking: false, // Not AI speaking yet, just processing
        isListening: false,
        isProcessingAudio: true, // Show processing animation
        currentMessageText: 'Processing your speech...',
      }));

      // Send the audio directly to backend for processing
      const messagePayload = {
        audio_base64: base64Audio,
        filename: `english_only_recording-${Date.now()}.wav`,
        user_name: state.userName,
      };

      console.log('📤 Sending audio to backend for processing...');
      sendEnglishOnlyMessage(JSON.stringify(messagePayload));

      // 🎯 NEW: The backend will now immediately send "processing_started" 
      // with the pre-generated "Please wait... Your audio is processing..." audio
      // This will be handled in handleWebSocketMessage() and handleAudioData()

    } catch (error) {
      console.error('Failed to process user speech:', error);
      setState(prev => ({ 
        ...prev, 
        currentStep: 'error',
        isListening: false,
        isAISpeaking: false,
        isGreeting: false,
        isPauseDetected: false,
        currentMessageText: '',
      }));
    }
  };

  const cleanup = () => {
    console.log('🧹 Starting comprehensive cleanup...');
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (recordingRef.current) {
      console.log('🛑 Stopping recording...');
      recordingRef.current.stopAndUnloadAsync().catch(error => {
        console.warn('Error stopping recording during cleanup:', error);
      });
      recordingRef.current = null;
    }
    
    if (soundRef.current) {
      console.log('🔇 Stopping and unloading sound...');
      soundRef.current.stopAsync().catch(error => {
        console.warn('Error stopping sound:', error);
      });
      soundRef.current.unloadAsync().catch(error => {
        console.warn('Error unloading sound:', error);
      });
      soundRef.current = null;
    }
    
    // Stop Speech synthesis
    console.log('🔇 Stopping speech synthesis...');
    Speech.stop();
    
    console.log('🔌 Closing WebSocket connection...');
    closeEnglishOnlySocket();
    
    setState(prev => ({
      ...prev,
      currentStep: 'waiting',
      isConnected: false,
      isListening: false,
      isAISpeaking: false,
      isGreeting: false,
      isPauseDetected: false,
      isNoSpeechDetected: false,
      isNoSpeechAfterProcessing: false,
      isUserReminded: false,
      currentMessageText: '',
      silenceStartTime: null,
      lastUserInput: '',
      correctionProvided: false,
    }));
    
    speechStartTimeRef.current = null;
    setIsTalking(false);
    connectionAttemptsRef.current = 0; // Reset connection attempts
    isFirstRecordingRef.current = true; // Reset first recording flag
    hasUserSpokenRef.current = false; // Reset user spoken flag
    isPlayingAudioRef.current = false; // Reset audio playing flag
    isProcessingAudioRef.current = false; // Reset processing audio flag
    
    console.log('✅ Cleanup completed');
  };

  const performManualCleanup = () => {
    console.log('🚪 Performing immediate manual cleanup for user exit...');
    
    isScreenFocusedRef.current = false;
    
    if (soundRef.current) {
      soundRef.current.stopAsync().catch(error => {
        console.warn('Error stopping sound:', error);
      });
    }
    
    // Stop Speech synthesis immediately
    console.log('🔇 Stopping speech synthesis immediately...');
    Speech.stop();
    
    if (recordingRef.current) {
      console.log('🛑 Stopping recording immediately...');
      recordingRef.current.stopAndUnloadAsync().catch(error => {
        console.warn('Error stopping recording during manual cleanup:', error);
      });
      recordingRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    console.log('🔌 Closing WebSocket connection immediately...');
    closeEnglishOnlySocket();
    
    setState(prev => ({
      ...prev,
      currentStep: 'waiting',
      isConnected: false,
      isListening: false,
      isAISpeaking: false,
      isGreeting: false,
      isPauseDetected: false,
      isNoSpeechDetected: false,
      isNoSpeechAfterProcessing: false,
      isUserReminded: false,
      currentMessageText: '',
      silenceStartTime: null,
      lastUserInput: '',
      correctionProvided: false,
    }));
    
    speechStartTimeRef.current = null;
    setIsTalking(false);
    isProcessingAudioRef.current = false; // Reset processing audio flag
    
    console.log('✅ Immediate manual cleanup completed');
  };

  const endConversation = () => {
    console.log('🎯 User manually ending conversation via wrong button...');
    performManualCleanup();
    router.replace('/(tabs)/learn');
  };

  // Animate mic button when listening or talking
  useEffect(() => {
    if (state.currentStep === 'listening') {
      Animated.timing(micAnim, {
        toValue: isTalking ? 0.5 : 0.7,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    } else {
      Animated.timing(micAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  }, [state.currentStep, isTalking]);

  // Get current animation state
  const getCurrentAnimation = () => {
    if (state.isListening) {
      return {
        animation: require('../../../assets/animations/ai_speaking_v2.json'),
        text: '',
        showMessage: !!state.currentMessageText
      };
    }
    
    if (isTalking) {
      return {
        animation: require('../../../assets/animations/ai_speaking_v2.json'),
        text: '',
        showMessage: false,
      };
    }

    if (state.isUserReminded) {
      return {
        animation: require('../../../assets/animations/ai_speaking_v2.json'),
        text: '',
        showMessage: !!state.currentMessageText
      };
    }

    if (state.isNoSpeechDetected) {
      return {
        animation: require('../../../assets/animations/ai_speaking_v2.json'),
        text: '',
        showMessage: !!state.currentMessageText
      };
    }
    
    if (state.isNoSpeechAfterProcessing) {
      return {
        animation: require('../../../assets/animations/ai_speaking_v2.json'),
        text: '',
        showMessage: !!state.currentMessageText
      };
    }
    
    if (state.isProcessingAudio) {
      return {
        animation: require('../../../assets/animations/ai_speaking_v2.json'),
        text: 'Processing your speech...',
        showMessage: !!state.currentMessageText
      };
    }
    
    if (state.isAISpeaking) {
      return {
        animation: require('../../../assets/animations/ai_speaking_v2.json'),
        text: '',
        showMessage: !!state.currentMessageText
      };
    }
    
    return {
      animation: require('../../../assets/animations/ai_speaking_v2.json'),
      text: '',
      showMessage: false
    };
  };

  const renderMessage = (message: Message) => {
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        message.isAI ? styles.aiMessage : styles.userMessage
      ]}>
        <View style={[
          styles.messageBubble,
          message.isAI ? styles.aiBubble : styles.userBubble
        ]}>
          <Text style={[
            styles.messageText,
            message.isAI ? styles.aiText : styles.userText
          ]}>
            {message.text}
          </Text>
          {message.correction && (
            <View style={styles.correctionContainer}>
              <Text style={styles.correctionLabel}>Correction:</Text>
              <Text style={styles.correctionText}>{message.correction}</Text>
            </View>
          )}
          {message.feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{message.feedback}</Text>
            </View>
          )}
          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  const currentAnimation = getCurrentAnimation();

  return (
    <View style={styles.container}>
      {/* Connection Indicator Dot - Top Right */}
      <View style={[
        styles.connectionIndicator,
        { backgroundColor: state.isConnected ? '#58D68D' : '#FF6B6B' }
      ]} />

      {/* Animation Overlay */}
      <View style={styles.processingOverlay} pointerEvents="box-none">
        {/* {currentAnimation.showMessage && state.currentMessageText ? (
          <View style={styles.messageBox}>
            <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
          </View>
        ) : null} */}
        
        {currentAnimation.animation && (
          <>
            <LottieView
              source={currentAnimation.animation}
              autoPlay
              loop
              style={styles.processingAnimation}
            />
          </>
        )}
      </View>

      {/* Center round button and wrong button */}
      <View style={styles.bottomContainer}>
        {/* Wrong (X) button - Always accessible */}
        <TouchableOpacity 
          style={styles.wrongButton} 
          onPress={endConversation}
          activeOpacity={0.5}
        >
          <View style={styles.wrongButtonContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={styles.wrongButtonGradient}
            >
              <View style={styles.wrongButtonInner}>
                <Ionicons name="close" size={24} color="#000000" />
              </View>
            </LinearGradient>
            <View style={styles.wrongButtonShadow} />
          </View>
        </TouchableOpacity>

        {/* Center mic/stop button */}
        <Animated.View style={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          left: 0, right: 0, bottom: 40,
          transform: [{ scale: micAnim }],
        }}>
          <TouchableOpacity
            style={[
              styles.centerMicButton,
              state.currentStep === 'listening'
                ? styles.centerMicButtonActive
                : styles.centerMicButtonIdle
            ]}
            onPress={() => {
              if (state.currentStep === 'listening') {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            disabled={state.currentStep === 'speaking' || state.currentStep === 'greeting' || state.isProcessingAudio || isProcessingAudioRef.current}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                state.currentStep === 'listening'
                  ? ['#D32F2F', '#B71C1C']
                  : ['#007AFF', '#5856D6']
              }
              style={styles.micButtonGradient}
            >
              <Ionicons
                name={state.currentStep === 'listening' ? 'stop' : 'mic'}
                size={48}
                color="white"
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      <View style={styles.particle1} />
      <View style={styles.particle2} />
      <View style={styles.particle3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: '#FFFFFF',
  },
  connectionIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1000,
  },
  messageContainer: {
    marginBottom: 12,
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: '#007AFF',
  },
  userBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  aiText: {
    color: 'white',
  },
  userText: {
    color: '#1C1C1E',
  },
  correctionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  correctionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  correctionText: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
  },
  feedbackContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMicButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMicButtonIdle: {
    backgroundColor: 'transparent',
  },
  centerMicButtonActive: {
    backgroundColor: 'transparent',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  wrongButton: {
    position: 'absolute',
    left: 32,
    bottom: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 15,
  },
  wrongButtonContainer: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  wrongButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 0, 0, 0.5)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  wrongButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  wrongButtonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    zIndex: -1,
  },
  micButtonGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -160,
  },
  processingAnimation: {
    width: width * 0.8,    // 80% of screen width
    height: height * 0.4,  // 40% of screen height
    alignSelf: 'center',
  },
  messageBox: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  currentMessageText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.15,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.7,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.015)',
  },
  particle1: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C757D',
    opacity: 0.3,
  },
  particle2: {
    position: 'absolute',
    top: height * 0.6,
    right: width * 0.15,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ADB5BD',
    opacity: 0.2,
  },
  particle3: {
    position: 'absolute',
    bottom: height * 0.3,
    left: width * 0.2,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CED4DA',
    opacity: 0.25,
  },
});