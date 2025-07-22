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
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollViewRef = useRef<any>(null);
  const [isTalking, setIsTalking] = useState(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const micAnim = useRef(new Animated.Value(1)).current;
  const isScreenFocusedRef = useRef<boolean>(false);
  const isStoppingRef = useRef(false);

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

  // Handle user response to pause prompt
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
        if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
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
    connectEnglishOnlySocket(
      (data: any) => handleWebSocketMessage(data),
      (audioBuffer: ArrayBuffer) => handleAudioData(audioBuffer),
      () => handleWebSocketClose()
    );

    // Set connection timeout
    const connectionTimeout = setTimeout(() => {
      if (!isEnglishOnlySocketConnected()) {
        console.log('⚠️ WebSocket connection timeout, retrying...');
        setState(prev => ({ 
          ...prev, 
          currentMessageText: 'Connection timeout. Please check your internet connection.',
          currentStep: 'error'
        }));
      }
    }, 10000); // 10 second timeout

    const interval = setInterval(() => {
      if (isEnglishOnlySocketConnected()) {
        console.log("✅ English-Only Socket verified connected");
        setState(prev => ({ ...prev, isConnected: true }));
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

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isListening: false,
      isGreeting: false,
      isPauseDetected: isPausePrompt,
      currentMessageText: data.conversation_text || data.response || 'AI response',
      isAISpeaking: false, // Will be set to true in handleAudioData
      // Update lastUserInput if this is a response to user speech
      lastUserInput: isResponseToUserSpeech ? data.original_text : prev.lastUserInput,
    }));

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

      // Check if this is greeting audio
      const isGreeting = state.isGreeting;

      setState(prev => ({
        ...prev,
        currentAudioUri: audioUri,
        currentStep: 'speaking',
        isAISpeaking: true,
        isListening: false, // Ensure listening is stopped
      }));

      await playAudio(audioUri, isGreeting);
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
      currentMessageText: '',
    }));
  };

  const playAudio = async (audioUri: string, isGreeting = false) => {
    if (!isScreenFocusedRef.current) {
      console.log('Screen not focused, skipping audio playback');
      return;
    }

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
          if (isGreeting) {
            console.log('🎵 Greeting audio finished playing, starting to listen');
            setState(prev => ({
              ...prev, 
              currentStep: 'waiting',
              isAISpeaking: false,
              isGreeting: false,
              currentMessageText: '',
              silenceStartTime: Date.now(),
            }));

            // Start listening after greeting finishes
            setTimeout(() => {
              if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
                console.log('🎤 Starting to listen after greeting finished');
                startRecording();
              }
            }, 800); // 0.8 second delay after greeting
          } else {
            console.log('🎵 AI audio finished playing, preparing to listen again');
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
              console.log('🔍 Is stopping:', isStoppingRef.current);
              
              if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
                console.log('🎤 Starting to listen again after AI finished speaking');
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
      setState(prev => ({ ...prev, currentStep: 'waiting' }));
    }
  };

  const startRecording = async () => {
    // Prevent multiple recording sessions
    if (state.isListening || state.isAISpeaking || state.isGreeting) {
      console.log('🛑 Cannot start recording: already listening, AI speaking, or greeting');
      return;
    }

    // Prevent multiple simultaneous calls
    if (isStoppingRef.current) {
      console.log('🛑 Cannot start recording: currently stopping, will retry in 500ms');
      // Retry after a short delay
      setTimeout(() => {
        if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
          console.log('🔄 Retrying startRecording after stopping delay');
          startRecording();
        }
      }, 500);
      return;
    }

    console.log('🎤 Starting recording process...');

    try {
      console.log('🎤 Setting audio mode for recording...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });
      console.log('✅ Audio mode set successfully');
    } catch (error) {
      console.error('Failed to set audio mode for recording:', error);
      Alert.alert('Error', 'Could not configure audio for recording.');
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isListening: false 
      }));
      return;
    }

    isStoppingRef.current = false;

    console.log('🎤 Checking audio permissions...');
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

    if (!isScreenFocusedRef.current) {
      console.log('Screen not focused, skipping recording start');
      return;
    }

    // Stop any existing recording
    if (recordingRef.current) {
      try {
        console.log('🛑 Stopping existing recording...');
        await recordingRef.current.stopAndUnloadAsync();
        console.log('✅ Existing recording stopped');
      } catch (e) {
        console.log('Error stopping existing recording:', e);
      }
      recordingRef.current = null;
    }

    // Stop any existing audio playback
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.log('Error stopping existing audio:', e);
      }
      soundRef.current = null;
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

      console.log('🎤 Recording started successfully');

      console.log('DEBUG: Recording started. Resetting speech start time.');
      speechStartTimeRef.current = null;

      const resetSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        const silenceTimeout = getSilenceDuration(!!speechStartTimeRef.current);
        const timingType = speechStartTimeRef.current ? 'post-speech' : 'initial';
        
        logTimingInfo('English-Only', silenceTimeout, timingType);
        
        silenceTimerRef.current = setTimeout(() => {
          setState(prevState => {
            if (prevState.currentStep === 'listening' && prevState.isListening) {
              setIsTalking(false);
              console.log(`🎯 SILENCE DETECTED: Timer triggered after ${silenceTimeout}ms, stopping recording.`);
              stopRecording(true);
            }
            return prevState;
          });
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

              if (!isTalking) {
                setIsTalking(true);
                setState(prev => ({ 
                  ...prev, 
                  isListening: false,
                }));
              }
              resetSilenceTimer();
            } else {
              if (isTalking) {
                setIsTalking(false);
                setState(prev => ({ 
                  ...prev, 
                  isListening: true,
                }));
              }
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
        if (isScreenFocusedRef.current && !state.isListening && !state.isAISpeaking) {
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

      if (uri && hadValidSpeech && !stoppedBySilence) {
        console.log("Valid speech detected. Processing audio...");
        await processUserSpeech(uri);
      } else if (stoppedBySilence) {
        console.log('🔇 Recording stopped due to silence, not uploading');
      } else {
        console.log('Recording stopped but speech was too short or invalid.');
      }
      
      speechStartTimeRef.current = null;
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
      currentMessageText: '',
      silenceStartTime: null,
      lastUserInput: '',
      correctionProvided: false,
    }));
    
    speechStartTimeRef.current = null;
    setIsTalking(false);
    
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
      currentMessageText: '',
      silenceStartTime: null,
      lastUserInput: '',
      correctionProvided: false,
    }));
    
    speechStartTimeRef.current = null;
    setIsTalking(false);
    
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
        animation: require('../../../assets/animations/listening.json'),
        text: '',
        showMessage: !!state.currentMessageText
      };
    }
    
    if (state.isAISpeaking) {
      return {
        animation: require('../../../assets/animations/ai_speaking.json'),
        text: '',
        showMessage: !!state.currentMessageText
      };
    }
    
    return {
      animation: require('../../../assets/animations/loading.json'),
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
        {currentAnimation.showMessage && state.currentMessageText ? (
          <View style={styles.messageBox}>
            <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
          </View>
        ) : null}
        
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
            disabled={state.currentStep === 'speaking' || state.currentStep === 'greeting'}
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
    width: 200,
    height: 200,
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