import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LottieView from 'lottie-react-native';
import { closeLearnSocket, connectLearnSocket, isSocketConnected, sendLearnMessage } from '../../utils/websocket';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
  audioUri?: string;
}

interface ConversationState {
  messages: Message[];
  currentStep: 'waiting' | 'listening' | 'processing' | 'speaking' | 'error' | 'playing_intro' | 'playing_await_next' | 'playing_retry';
  isConnected: boolean;
  inputText: string;
  currentAudioUri?: string;
  lastStopWasSilence: boolean;
  isIntroAudioPlaying: boolean;
  isAwaitNextPlaying: boolean;
  isRetryPlaying: boolean;
  isProcessingAudio: boolean;
  isListening: boolean; // New state for tracking listening animation
  isVoiceDetected: boolean; // New state for tracking voice detected animation
  isAISpeaking: boolean; // New state for tracking AI speaking animation
  isPlayingIntro: boolean; // New state for tracking intro playing animation
  isContinuingConversation: boolean; // New state for tracking continuing conversation animation
  isPlayingRetry: boolean; // New state for tracking retry playing animation
  currentMessageText: string; // New state for tracking current message to display above animation
}

export default function ConversationScreen() {
  const { autoStart } = useLocalSearchParams();
  const router = useRouter();
  const [state, setState] = useState<ConversationState>({
    messages: [],
    currentStep: 'waiting',
    isConnected: false,
    inputText: '',
    lastStopWasSilence: false,
    isIntroAudioPlaying: false,
    isAwaitNextPlaying: false,
    isRetryPlaying: false,
    isProcessingAudio: false,
    isListening: false,
    isVoiceDetected: false,
    isAISpeaking: false,
    isPlayingIntro: false,
    isContinuingConversation: false,
    isPlayingRetry: false,
    currentMessageText: '',
  });

  const previousStepRef = useRef<ConversationState["currentStep"]>('waiting');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const introSoundRef = useRef<Audio.Sound | null>(null);
  const awaitNextSoundRef = useRef<Audio.Sound | null>(null);
  const retrySoundRef = useRef<Audio.Sound | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isTalking, setIsTalking] = useState(false); // True voice activity detection
  const silenceTimerRef = useRef<any>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const micAnim = useRef(new Animated.Value(1)).current;

  // Voice Activity Detection threshold (in dB)
  const VAD_THRESHOLD = -45; // dB, adjust as needed
  const SILENCE_DURATION = 3000; // 3 seconds of silence
  const MIN_SPEECH_DURATION = 500; // Minimum 500ms of speech to be valid


  useEffect(() => {
    initializeAudio();
    connectToWebSocket();
    // Auto-start with intro audio if param is set
    if (autoStart === 'true') {
      setTimeout(() => {
        playIntroAudio();
      }, 500);
    }
    return () => {
      cleanup();
    };
  }, []);

  

  useEffect(() => {
    // Only auto-listen if we just finished speaking (AI audio done) and not during intro, await_next, or retry
    if (
      state.currentStep === 'waiting' &&
      state.isConnected &&
      autoStart === 'true' &&
      !state.lastStopWasSilence &&
      !state.isIntroAudioPlaying &&
      !state.isAwaitNextPlaying &&
      !state.isRetryPlaying &&
      previousStepRef.current === 'speaking' 
    ) {
      if (state.messages.length > 0 && state.messages[state.messages.length - 1].isAI) {
        setTimeout(() => {
          startRecording();
        }, 600);
      }
    }
    // Update previousStepRef after every state change
    previousStepRef.current = state.currentStep;
  }, [state.currentStep, state.messages, state.isConnected, autoStart, state.lastStopWasSilence, state.isIntroAudioPlaying, state.isAwaitNextPlaying, state.isRetryPlaying]);

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

  const playIntroAudio = async () => {
    try {
      console.log('Playing intro audio...');
      setState(prev => ({ 
        ...prev, 
        currentStep: 'playing_intro',
        isIntroAudioPlaying: true,
        isPlayingIntro: true,
        currentMessageText: 'Welcome to your AI tutor conversation!',
      }));

      // Unload any previous intro sound
      if (introSoundRef.current) {
        await introSoundRef.current.unloadAsync();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create sound from the Google Drive URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://dil-lms.s3.us-east-1.amazonaws.com/welcome_message.mp3' },
        { shouldPlay: true }
      );
      introSoundRef.current = sound;

      // Set up playback status update to handle completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('Intro audio finished, starting conversation...');
          setState(prev => ({ 
            ...prev, 
            currentStep: 'waiting',
            isIntroAudioPlaying: false,
            isPlayingIntro: false,
            currentMessageText: '', // Clear the message when intro ends
          }));
          
          // Start the conversation flow after intro audio
          setTimeout(() => {
            startRecording();
          }, 1000);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play intro audio:', error);
      // If intro audio fails, start conversation anyway
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isIntroAudioPlaying: false,
        isPlayingIntro: false,
        currentMessageText: '', // Clear the message when intro ends
      }));
      setTimeout(() => {
        startRecording();
      }, 1000);
    }
  };

  const playAwaitNextAudio = async () => {
    try {
      console.log('Playing await_next audio...');
      setState(prev => ({ 
        ...prev, 
        currentStep: 'playing_await_next',
        isAwaitNextPlaying: true,
        isContinuingConversation: true,
        currentMessageText: 'Nice! Let\'s try another sentence.',
      }));

      // Unload any previous await_next sound
      if (awaitNextSoundRef.current) {
        await awaitNextSoundRef.current.unloadAsync();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create sound from the await_next audio URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://dil-lms.s3.us-east-1.amazonaws.com/try_another_sentence.mp3' }, // Replace with your actual URL for "Nice! Let's try another sentence."
        { shouldPlay: true }
      );
      awaitNextSoundRef.current = sound;

      // Set up playback status update to handle completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('Await next audio finished, continuing conversation...');
          setState(prev => ({ 
            ...prev, 
            currentStep: 'waiting',
            isAwaitNextPlaying: false,
            isContinuingConversation: false,
            currentMessageText: '', // Clear the message when await next ends
          }));
          
          // Continue the conversation loop by starting to listen again
          setTimeout(() => {
            startRecording();
          }, 1000);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play await_next audio:', error);
      // If await_next audio fails, continue conversation anyway
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isAwaitNextPlaying: false,
        isContinuingConversation: false,
        currentMessageText: '', // Clear the message when await next ends
      }));
      setTimeout(() => {
        startRecording();
      }, 1000);
    }
  };

  const playRetryAudio = async () => {
    try {
      console.log('Playing retry audio...');
      setState(prev => ({ 
        ...prev, 
        currentStep: 'playing_retry',
        isRetryPlaying: true,
        isPlayingRetry: true,
        currentMessageText: 'Try again. Please repeat the sentence.',
      }));

      // Unload any previous retry sound
      if (retrySoundRef.current) {
        await retrySoundRef.current.unloadAsync();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create sound from the retry audio URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://dil-lms.s3.us-east-1.amazonaws.com/retry_sentence.mp3' }, // Replace with your actual retry audio URL for "Try again. Please say: 'hello how are you'"
        { shouldPlay: true }
      );
      retrySoundRef.current = sound;

      // Set up playback status update to handle completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('Retry audio finished, continuing conversation...');
          setState(prev => ({ 
            ...prev, 
            currentStep: 'waiting',
            isRetryPlaying: false,
            isPlayingRetry: false,
            currentMessageText: '', // Clear the message when retry ends
          }));
          
          // Continue the conversation by starting to listen again
          setTimeout(() => {
            startRecording();
          }, 1000);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play retry audio:', error);
      // If retry audio fails, continue conversation anyway
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isRetryPlaying: false,
        isPlayingRetry: false,
        currentMessageText: '', // Clear the message when retry ends
      }));
      setTimeout(() => {
        startRecording();
      }, 1000);
    }
  };

  const connectToWebSocket = () => {
    connectLearnSocket(
      (data: any) => handleWebSocketMessage(data),
      (audioBuffer: ArrayBuffer) => handleAudioData(audioBuffer),
      () => handleWebSocketClose()
    );
  
    // Wait for actual connection
    const interval = setInterval(() => {
      if (isSocketConnected()) {
        console.log("✅ Socket verified connected");
        setState(prev => ({ ...prev, isConnected: true }));
        clearInterval(interval);
      }
    }, 500);
  };

  const handleWebSocketMessage = (data: any) => {
    console.log('Received WebSocket message:', data);
  
    const newMessage: Message = {
      id: Date.now().toString(),
      text: data.response || 'AI response',
      isAI: true,
      timestamp: new Date(),
    };
  
    // Stop processing animation and set current message text
    setState(prev => ({
      ...prev,
      isProcessingAudio: false,
      isListening: false,
      isVoiceDetected: false,
      isAISpeaking: false,
      isPlayingIntro: false,
      isContinuingConversation: false,
      isPlayingRetry: false,
      currentMessageText: data.response || 'AI response',
    }));
  
    // 🟡 Step 1: Handle `no_speech` step
    if (data.step === 'no_speech') {
      console.log('🟡 No speech detected from backend');
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        currentStep: 'waiting',
        lastStopWasSilence: true, // ✅ Triggers "No speech detected" UI
      }));
      return; // 🛑 Don't proceed further
    }
  
    // 🟢 Step 2: Default message update
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      currentStep: data.step === 'retry' ? 'waiting' : 'waiting',
      lastStopWasSilence: false, // ✅ Reset silence flag for other steps
    }));
  
    // 🔁 Step 3: Handle retry playback
    if (data.step === 'retry') {
      console.log('🔁 Received retry step, playing retry audio...');
      setTimeout(() => {
        playRetryAudio();
      }, 500);
    }
  
    // 🔁 Step 4: Handle await_next playback
    if (data.step === 'await_next') {
      console.log('✅ Received await_next step, playing next audio...');
      setTimeout(() => {
        playAwaitNextAudio();
      }, 500);
    }
  
    // 📜 Step 5: Auto-scroll UI
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  

  const handleAudioData = async (audioBuffer: ArrayBuffer) => {
    try {
      const base64 = Buffer.from(audioBuffer).toString('base64'); // Convert buffer to base64
      const audioUri = `${FileSystem.cacheDirectory}ai_audio_${Date.now()}.mp3`;
  
      await FileSystem.writeAsStringAsync(audioUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      setState(prev => ({
        ...prev,
        currentAudioUri: audioUri,
        currentStep: 'speaking',
        isAISpeaking: true,
      }));
  
      await playAudio(audioUri);
    } catch (error) {
      console.error('Failed to handle audio data:', error);
    }
  };
  

  const handleWebSocketClose = () => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      currentStep: 'error',
      isProcessingAudio: false, // Stop processing animation on connection error
      isListening: false,
      isVoiceDetected: false,
      isAISpeaking: false,
      isPlayingIntro: false,
      isContinuingConversation: false,
      isPlayingRetry: false,
      currentMessageText: '',
    }));
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  };

  const playAudio = async (audioUri: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setState(prev => ({ 
            ...prev, 
            currentStep: 'waiting',
            isAISpeaking: false,
            currentMessageText: '', // Clear the message when AI speaking ends
          }));
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio:', error);
      setState(prev => ({ ...prev, currentStep: 'waiting' }));
    }
  };

  const startRecording = async () => {
    // Stop and unload any previous recording before starting a new one
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {}
      recordingRef.current = null;
    }

    if (!isSocketConnected()) {
      Alert.alert('Error', 'WebSocket connection is not available');
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        currentStep: 'listening',
        isListening: true,
        isVoiceDetected: false,
        isAISpeaking: false,
        isPlayingIntro: false,
        isContinuingConversation: false,
        isPlayingRetry: false,
        currentMessageText: '',
      }));

      // Helper to clear and set silence timer
      const resetSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          // Use a callback to get current state
          setState(prevState => {
            if (prevState.currentStep === 'listening') {
              setIsTalking(false);
              // Stop listening, do not process audio
              stopRecording(true); // pass true to indicate silence
            }
            return prevState;
          });
        }, SILENCE_DURATION);
      };

      // Enable metering in options
      const options = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      };

      const { recording } = await Audio.Recording.createAsync(
        options,
        (status) => {
          if (status.metering != null && status.isRecording) {
            const currentTime = Date.now();
            
            if (status.metering > VAD_THRESHOLD) {
              // Voice detected
              if (!isTalking) {
                setIsTalking(true);
                speechStartTimeRef.current = currentTime;
                setState(prev => ({ 
                  ...prev, 
                  isVoiceDetected: true,
                  isListening: false,
                }));
              }
              resetSilenceTimer(); // Reset silence timer when talking
            } else {
              // No voice detected
              if (isTalking) {
                setIsTalking(false);
                speechStartTimeRef.current = null;
                setState(prev => ({ 
                  ...prev, 
                  isVoiceDetected: false,
                  isListening: true,
                }));
              }
              // Don't reset timer - let it count down
            }
          }
        },
        200 // update interval ms
      );
      recordingRef.current = recording;
      resetSilenceTimer(); // Start timer in case no voice at all
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ ...prev, currentStep: 'error' }));
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async (stoppedBySilence = false) => {
    if (!recordingRef.current) return;

    try {
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isListening: false,
        isVoiceDetected: false,
        isAISpeaking: false,
        isPlayingIntro: false,
        isContinuingConversation: false,
        isPlayingRetry: false,
        currentMessageText: '',
      }));

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Check if we had enough speech to process
      const hadValidSpeech = speechStartTimeRef.current && 
        (Date.now() - speechStartTimeRef.current) >= MIN_SPEECH_DURATION;

      // Only upload/process if NOT stopped by silence AND had valid speech
      if (uri && hadValidSpeech) {
        await uploadAudioAndSendMessage(uri);
      } else if (stoppedBySilence) {
        console.log('Recording stopped due to silence - no audio sent');
        setState(prev => ({
          ...prev,
          lastStopWasSilence: true,
          currentStep: 'waiting',
        }));
      } else if (!hadValidSpeech) {
        console.log('Recording too short - no audio sent');
        setState(prev => ({ ...prev, currentStep: 'waiting' }));
      }
      
      // Reset speech tracking
      speechStartTimeRef.current = null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setState(prev => ({ ...prev, currentStep: 'error' }));
    }
  };

  const uploadAudioAndSendMessage = async (audioUri: string) => {
    try {
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Construct WebSocket payload with base64 audio
      const messagePayload = {
        audio_base64: base64Audio,
        filename: `recording-${Date.now()}.wav`,
      };
  
      // Send JSON stringified base64 payload via WebSocket
      sendLearnMessage(JSON.stringify(messagePayload));
  
      // Set processing state to show animation
      setState(prev => ({
        ...prev,
        isProcessingAudio: true,
        currentStep: 'processing',
      }));
  
    } catch (error) {
      console.error('Failed to convert/send audio:', error);
      setState(prev => ({ 
        ...prev, 
        currentStep: 'error',
        isProcessingAudio: false, // Stop processing animation on error
        isListening: false,
        isVoiceDetected: false,
        isAISpeaking: false,
        isPlayingIntro: false,
        isContinuingConversation: false,
        isPlayingRetry: false,
        currentMessageText: '',
      }));
    }
  };
  

  const sendTextMessage = () => {
    if (!state.inputText.trim() || !isSocketConnected()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: state.inputText,
      isAI: false,
      timestamp: new Date(),
    };

    sendLearnMessage(state.inputText);
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputText: '',
    }));

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const cleanup = () => {
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync();
    }
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }
    if (introSoundRef.current) {
      introSoundRef.current.unloadAsync();
    }
    if (awaitNextSoundRef.current) {
      awaitNextSoundRef.current.unloadAsync();
    }
    if (retrySoundRef.current) {
      retrySoundRef.current.unloadAsync();
    }
    closeLearnSocket();
    
    // Reset animation states
    setState(prev => ({
      ...prev,
      isProcessingAudio: false,
      isListening: false,
      isVoiceDetected: false,
      isAISpeaking: false,
      isPlayingIntro: false,
      isContinuingConversation: false,
      isPlayingRetry: false,
      currentMessageText: '',
    }));
  };

  const renderMessage = (message: Message) => {
    // Don't render the "Sent audio for processing..." message
    if (message.text === "Sent audio for processing...") {
      return null;
    }
    
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
          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderStatusIndicator = () => {
    switch (state.currentStep) {
      case 'playing_intro':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="volume-high" size={20} color="#007AFF" />
            <Text style={styles.statusText}>Playing Introduction...</Text>
          </View>
        );
      case 'playing_await_next':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="volume-high" size={20} color="#007AFF" />
            <Text style={styles.statusText}>Continuing Conversation...</Text>
          </View>
        );
      case 'playing_retry':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="volume-high" size={20} color="#007AFF" />
            <Text style={styles.statusText}>AI Speaking...</Text>
          </View>
        );
      case 'listening':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>
              {isTalking ? 'Voice Detected' : 'Listening...'}
            </Text>
          </View>
        );
      case 'processing':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>Processing...</Text>
          </View>
        );
      case 'speaking':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="volume-high" size={20} color="#007AFF" />
            <Text style={styles.statusText}>AI Speaking...</Text>
          </View>
        );
      case 'error':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="warning" size={20} color="#FF3B30" />
            <Text style={styles.statusText}>Connection Error</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Function to end conversation and go back
  const endConversation = () => {
    cleanup();
    router.back();
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

  useEffect(() => {
    console.log('Current step:', state.currentStep);
  }, [state.currentStep]);

  // UI for real-time conversation mode
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Tutor Conversation</Text>
        <View style={[
          styles.connectionIndicator,
          { backgroundColor: state.isConnected ? '#34C759' : '#FF3B30' }
        ]} />
      </View>

      {/* Show animation overlays with current message text */}
      {state.isProcessingAudio ? (
        <View style={styles.processingOverlay}>
          {state.currentMessageText ? (
            <View style={styles.messageBox}>
              <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
            </View>
          ) : null}
          <LottieView
            source={require('../../../assets/animations/sent_audio_for_processing.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>Audio is processing</Text>
        </View>
      ) : state.isListening ? (
        <View style={styles.processingOverlay}>
          {state.currentMessageText ? (
            <View style={styles.messageBox}>
              <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
            </View>
          ) : null}
          <LottieView
            source={require('../../../assets/animations/listening.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>Listening</Text>
        </View>
      ) : state.isVoiceDetected ? (
        <View style={styles.processingOverlay}>
          {state.currentMessageText ? (
            <View style={styles.messageBox}>
              <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
            </View>
          ) : null}
          <LottieView
            source={require('../../../assets/animations/voice_detected.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>Voice detecting</Text>
        </View>
      ) : state.isAISpeaking ? (
        <View style={styles.processingOverlay}>
          {state.currentMessageText ? (
            <View style={styles.messageBox}>
              <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
            </View>
          ) : null}
          <LottieView
            source={require('../../../assets/animations/ai_speaking.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>AI Speaking</Text>
        </View>
      ) : state.isPlayingIntro ? (
        <View style={styles.processingOverlay}>
          {state.currentMessageText ? (
            <View style={styles.messageBox}>
              <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
            </View>
          ) : null}
          <LottieView
            source={require('../../../assets/animations/ai_speaking.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>Playing Introduction</Text>
        </View>
      ) : state.isContinuingConversation ? (
        <View style={styles.processingOverlay}>
          {state.currentMessageText ? (
            <View style={styles.messageBox}>
              <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
            </View>
          ) : null}
          <LottieView
            source={require('../../../assets/animations/ai_speaking.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>Continuing conversation</Text>
        </View>
      ) : state.isPlayingRetry ? (
        <View style={styles.processingOverlay}>
          {state.currentMessageText ? (
            <View style={styles.messageBox}>
              <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
            </View>
          ) : null}
          <LottieView
            source={require('../../../assets/animations/ai_speaking.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>AI Speaking</Text>
        </View>
      ) : null}

      {/* Center round button and wrong button */}
      <View style={styles.bottomContainer}>
        {/* Wrong (X) button */}
        <TouchableOpacity style={styles.wrongButton} onPress={endConversation}>
          <Ionicons name="close" size={32} color="#222" />
        </TouchableOpacity>
        {/* Center mic/stop button */}
        <Animated.View style={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          left: 0, right: 0, bottom: 60,
          transform: [{ scale: micAnim }],
        }}>
          <TouchableOpacity
            style={[
              styles.centerMicButton,
              state.currentStep === 'listening' && isTalking
                ? styles.centerMicButtonTalking
                : state.currentStep === 'listening'
                  ? styles.centerMicButtonActive
                  : state.currentStep === 'playing_intro'
                    ? styles.centerMicButtonIntro
                    : state.currentStep === 'playing_await_next'
                      ? styles.centerMicButtonAwaitNext
                      : state.currentStep === 'playing_retry'
                        ? styles.centerMicButtonRetry
                        : styles.centerMicButtonIdle
            ]}
            onPress={() => {
              if (state.currentStep === 'listening') {
                stopRecording();
              } else {
                setState(prev => ({ ...prev, lastStopWasSilence: false }));
                startRecording();
              }
            }}
            disabled={state.currentStep === 'processing' || state.currentStep === 'speaking' || state.currentStep === 'playing_intro' || state.currentStep === 'playing_await_next' || state.currentStep === 'playing_retry'}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                state.currentStep === 'listening' 
                  ? 'stop' 
                  : state.currentStep === 'playing_intro'
                    ? 'volume-high'
                    : state.currentStep === 'playing_await_next'
                      ? 'volume-high'
                      : state.currentStep === 'playing_retry'
                        ? 'volume-high'
                        : 'mic'
              }
              size={48}
              color="white"
            />
          </TouchableOpacity>
          {state.currentStep === 'waiting' && state.lastStopWasSilence && (
            <Text style={styles.silenceInfoLabel}>
              No speech detected{"\n"}Tap the mic to try again.
            </Text>
          )}
          {state.currentStep === 'waiting' && !state.lastStopWasSilence && (
            <Text style={styles.tapToSpeakLabel}>Tap to speak</Text>
          )}
          {state.currentStep === 'playing_intro' && (
            <Text style={styles.introLabel}>Playing Introduction...</Text>
          )}
          {state.currentStep === 'playing_await_next' && (
            <Text style={styles.awaitNextLabel}>Continuing Conversation...</Text>
          )}
          {state.currentStep === 'playing_retry' && (
            <Text style={styles.retryLabel}>AI Speaking...</Text>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  connectionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
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
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    marginVertical: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  micButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: '#FF3B30',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  centerMicButtonIdle: {
    backgroundColor: '#222',
  },
  centerMicButtonActive: {
    backgroundColor: '#2196F3',
  },
  centerMicButtonTalking: {
    backgroundColor: '#00C853', // Green when talking
  },
  centerMicButtonIntro: {
    backgroundColor: '#FF9500', // Orange when playing intro
  },
  centerMicButtonAwaitNext: {
    backgroundColor: '#FF9500', // Orange when playing await_next
  },
  centerMicButtonRetry: {
    backgroundColor: '#FF9500', // Orange when playing retry
  },
  wrongButton: {
    position: 'absolute',
    left: 32,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tapToSpeakLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  silenceInfoLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  introLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  awaitNextLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  retryLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  processingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  processingAnimation: {
    width: 200,
    height: 200,
  },
  processingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '500',
    textAlign: 'center',
  },
  messageBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentMessageText: {
    fontSize: 16,
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 22,
  },
}); 