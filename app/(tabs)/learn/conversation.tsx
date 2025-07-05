import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { closeLearnSocket, connectLearnSocket, isSocketConnected, sendLearnMessage } from '../../utils/websocket';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
  audioUri?: string;
}

interface ConversationState {
  messages: Message[];
  currentStep: 'waiting' | 'listening' | 'processing' | 'speaking' | 'error' | 'playing_intro' | 'playing_await_next' | 'playing_retry' | 'playing_feedback' | 'word_by_word';
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
  isPlayingFeedback: boolean; // New state for tracking feedback playing animation
  currentMessageText: string; // New state for tracking current message to display above animation
  isNoSpeechDetected: boolean; // New state for tracking no speech detected animation
  // New states for word-by-word speaking
  isWordByWordSpeaking: boolean; // New state for tracking word-by-word speaking animation
  currentSentence: {
    english: string;
    urdu: string;
    words: string[];
  } | null;
  currentWordIndex: number;
  isDisplayingSentence: boolean;
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
    isPlayingFeedback: false,
    currentMessageText: '',
    isNoSpeechDetected: false,
    isWordByWordSpeaking: false,
    currentSentence: null,
    currentWordIndex: 0,
    isDisplayingSentence: false,
  });

  const previousStepRef = useRef<ConversationState["currentStep"]>('waiting');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const introSoundRef = useRef<Audio.Sound | null>(null);
  const retrySoundRef = useRef<Audio.Sound | null>(null);
  const feedbackSoundRef = useRef<Audio.Sound | null>(null);
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
      !state.isPlayingFeedback &&
      !state.isWordByWordSpeaking &&
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
  }, [state.currentStep, state.messages, state.isConnected, autoStart, state.lastStopWasSilence, state.isIntroAudioPlaying, state.isAwaitNextPlaying, state.isRetryPlaying, state.isPlayingFeedback, state.isWordByWordSpeaking]);

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

  const playFeedbackAudio = async () => {
    try {
      console.log('Playing feedback audio...');
      // Set up feedback state but keep processing animation until audio arrives
      setState(prev => ({ 
        ...prev, 
        currentStep: 'playing_feedback',
        isPlayingFeedback: true,
        isProcessingAudio: true, // Keep processing animation until audio arrives
        // Don't clear currentMessageText - keep the feedback message
      }));

      // Unload any previous feedback sound
      if (feedbackSoundRef.current) {
        await feedbackSoundRef.current.unloadAsync();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // The feedback audio will be received via handleAudioData
      // This function just sets up the state for when audio arrives
    } catch (error) {
      console.error('Failed to set up feedback audio:', error);
      // If feedback audio setup fails, continue conversation anyway
      setState(prev => ({ 
        ...prev, 
        currentStep: 'waiting',
        isPlayingFeedback: false,
        isProcessingAudio: false, // Stop processing animation on error
        currentMessageText: '', // Clear the message when feedback ends
      }));
      setTimeout(() => {
        startRecording();
      }, 1000);
    }
  };



  // Function to play word-by-word audio
  const playWordByWord = async (words: string[]) => {
    try {
      console.log('🎤 Starting word-by-word speaking...');
      setState(prev => ({
        ...prev,
        currentStep: 'word_by_word',
        isWordByWordSpeaking: true,
        isProcessingAudio: false,
        currentWordIndex: 0,
      }));

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        console.log(`🗣️ Speaking word ${i + 1}/${words.length}: "${word}"`);
        setState(prev => ({
          ...prev,
          currentWordIndex: i,
          currentMessageText: `Speaking: "${word}"`,
        }));
        // Speak the word using Expo Speech
        Speech.speak(word, {
          language: 'en-US',
          rate: 0.5,
          pitch: 1.0,
        });
        // Wait for the word to finish (approximate, since expo-speech doesn't have a finish event)
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      console.log('✅ Word-by-word speaking completed');
      setState(prev => ({
        ...prev,
        isWordByWordSpeaking: false,
        currentMessageText: '',
        currentStep: 'waiting', // Reset to waiting state
      }));

      // Send completion signal to backend after 2 seconds
      setTimeout(() => {
        console.log('🔄 Sending word-by-word completion signal to backend...');
        sendLearnMessage(JSON.stringify({
          type: 'word_by_word_complete',
          sentence: state.currentSentence?.english || ''
        }));
      }, 2000); // Wait 2 seconds before sending signal
    } catch (error) {
      console.error('Failed to play word-by-word:', error);
      setState(prev => ({
        ...prev,
        isWordByWordSpeaking: false,
        currentMessageText: '',
      }));
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
  
    // Keep processing animation active until audio data arrives
    // Only stop processing for specific steps that don't involve AI speaking
    setState(prev => ({
      ...prev,
      isListening: false,
      isVoiceDetected: false,
      isPlayingIntro: false,
      isContinuingConversation: false,
      isPlayingRetry: false,
      isPlayingFeedback: false,
      currentMessageText: data.response || 'AI response',
      isNoSpeechDetected: false,
      // Keep isProcessingAudio true for now - it will be set to false in handleAudioData
      // Keep isAISpeaking false for now - it will be set to true in handleAudioData
    }));
  
    // 🟡 Step 1: Handle `no_speech` step
    if (data.step === 'no_speech') {
      console.log('🟡 No speech detected from backend');
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        currentStep: 'waiting',
        isProcessingAudio: false, // Stop processing animation for no_speech
        lastStopWasSilence: true, // ✅ Triggers "No speech detected" UI
      }));
      return; // 🛑 Don't proceed further
    }
  
    // 🟢 Step 2: Default message update (for regular AI responses that will have audio)
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      currentStep: data.step === 'retry' ? 'waiting' : 'waiting',
      lastStopWasSilence: false, // ✅ Reset silence flag for other steps
      // Keep isProcessingAudio true for regular AI responses that will have audio
    }));
  
    // 🔁 Step 3: Handle retry playback
    if (data.step === 'retry') {
      console.log('🔁 Received retry step, playing retry audio...');
      setState(prev => ({
        ...prev,
        isProcessingAudio: false, // Stop processing animation for retry
      }));
      setTimeout(() => {
        playRetryAudio();
      }, 500);
    }
  
    // 🔁 Step 4: Handle await_next playback
    if (data.step === 'await_next') {
      console.log('✅ Received await_next step, waiting for audio data...');
      setState(prev => ({
        ...prev,
        currentStep: 'playing_await_next',
        isProcessingAudio: false, // Stop processing animation for await_next
        isAwaitNextPlaying: true,
        isContinuingConversation: true,
        currentMessageText: data.response || 'Feedback text', // Use the actual feedback text from backend
      }));
    }

    // 🔁 Step 5: Handle feedback_step playback
    if (data.step === 'feedback_step') {
      console.log('📝 Received feedback_step, playing feedback audio...');
      // Keep processing animation active - it will be managed in playFeedbackAudio and handleAudioData
      setTimeout(() => {
        playFeedbackAudio();
      }, 500);
    }

    // 🎤 Step 6: Handle repeat_prompt step (word-by-word speaking)
    if (data.step === 'repeat_prompt') {
      console.log('🎤 Received repeat_prompt step, starting word-by-word speaking...');
      
      // Store the sentence information
      const sentenceInfo = {
        english: data.english_sentence || '',
        urdu: data.urdu_sentence || '',
        words: data.words || [],
      };

      setState(prev => ({
        ...prev,
        currentSentence: sentenceInfo,
        isDisplayingSentence: true,
        isProcessingAudio: false, // Stop processing animation
        currentMessageText: 'Repeat after me:',
      }));

      // Start word-by-word speaking after a short delay
      setTimeout(() => {
        playWordByWord(sentenceInfo.words);
      }, 1000);
    }

    // 🎤 Step 6.5: Handle full sentence audio after word-by-word
    if (data.step === 'full_sentence_audio') {
      console.log('🎤 Received full sentence audio after word-by-word...');
      // This will be handled by the existing audio flow
      setState(prev => ({
        ...prev,
        isDisplayingSentence: false, // Hide sentence display
        currentSentence: null,
      }));
    }
  
    // 📜 Step 7: Auto-scroll UI
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
  
      // Check if we're currently in feedback mode or await_next mode
      if (state.currentStep === 'playing_feedback') {
        setState(prev => ({
          ...prev,
          currentAudioUri: audioUri,
          currentStep: 'speaking',
          isProcessingAudio: false, // Stop processing animation when feedback audio starts
          isAISpeaking: true,
          isPlayingFeedback: true, // Keep feedback flag for audio completion logic
        }));
      } else if (state.currentStep === 'playing_await_next') {
        setState(prev => ({
          ...prev,
          currentAudioUri: audioUri,
          currentStep: 'speaking',
          isProcessingAudio: false, // Stop processing animation
          isAISpeaking: true,
          isAwaitNextPlaying: true, // Keep await_next flag for audio completion logic
        }));
      } else if (state.currentStep === 'waiting' && state.isDisplayingSentence) {
        // Full sentence audio after word-by-word
        setState(prev => ({
          ...prev,
          currentAudioUri: audioUri,
          currentStep: 'speaking',
          isProcessingAudio: false, // Stop processing animation
          isAISpeaking: true,
          isDisplayingSentence: false, // Hide sentence display
          currentSentence: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          currentAudioUri: audioUri,
          currentStep: 'speaking',
          isProcessingAudio: false, // Stop processing animation
          isAISpeaking: true,
        }));
      }
  
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
      isPlayingFeedback: false,
      isAwaitNextPlaying: false,
      currentMessageText: '',
      isNoSpeechDetected: false,
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
          // Use setState callback to access current state
          setState(prev => {
            // Check what type of audio just finished to determine next action
            if (prev.isPlayingFeedback) {
              // Feedback audio finished - stay on same sentence and restart listening
              console.log('📝 Feedback audio finished, staying on same sentence...');
              console.log('🔄 Starting recording again for the same sentence...');
              
              // Start listening again for the same sentence after a delay
              setTimeout(() => {
                startRecording();
              }, 1000);
              
              return {
                ...prev, 
                currentStep: 'waiting',
                isAISpeaking: false,
                isPlayingFeedback: false,
                currentMessageText: '', // Clear the message when feedback ends
              };
            } else if (prev.isAwaitNextPlaying) {
              // Await next audio finished - restart conversation from beginning
              console.log('✅ Await next audio finished, restarting conversation...');
              console.log('🔄 Starting fresh conversation...');
              
              // Clear all messages and restart from beginning
              setTimeout(() => {
                console.log('🔄 Clearing messages and restarting conversation...');
                setState(prev => ({
                  ...prev,
                  messages: [], // Clear all messages
                  currentStep: 'waiting',
                  isAISpeaking: false,
                  isAwaitNextPlaying: false,
                  isContinuingConversation: false,
                  currentMessageText: '', // Clear the message when await next ends
                }));
                
                // Start fresh conversation by sending initial audio
                setTimeout(() => {
                  console.log('🎤 Starting fresh recording...');
                  startRecording();
                }, 500);
              }, 1000);
              
              return {
                ...prev, 
                currentStep: 'waiting',
                isAISpeaking: false,
                isAwaitNextPlaying: false,
                isContinuingConversation: false,
                currentMessageText: '', // Clear the message when await next ends
              };
            } else {
              // Regular AI speaking finished
              return {
                ...prev, 
                currentStep: 'waiting',
                isAISpeaking: false,
                currentMessageText: '', // Clear the message when AI speaking ends
              };
            }
          });
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
        isPlayingFeedback: false,
        isAwaitNextPlaying: false,
        isProcessingAudio: false, // Stop processing animation when starting new recording
        currentMessageText: '',
        isNoSpeechDetected: false,
        lastStopWasSilence: false,
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
        isPlayingFeedback: false,
        isAwaitNextPlaying: false,
        isProcessingAudio: false, // Stop processing animation when stopping recording
        currentMessageText: '',
        isNoSpeechDetected: false,
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
          isListening: false,
          isVoiceDetected: false,
          isNoSpeechDetected: true,
          currentMessageText: 'No speech detected. Tap the mic to try again.',
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
        isPlayingFeedback: false,
        isAwaitNextPlaying: false,
        currentMessageText: '',
        isNoSpeechDetected: false,
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
    if (retrySoundRef.current) {
      retrySoundRef.current.unloadAsync();
    }
    if (feedbackSoundRef.current) {
      feedbackSoundRef.current.unloadAsync();
    }
    // Stop Speech
    Speech.stop();
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
      isPlayingFeedback: false,
      isAwaitNextPlaying: false,
      isWordByWordSpeaking: false,
      currentMessageText: '',
      isNoSpeechDetected: false,
      currentSentence: null,
      currentWordIndex: 0,
      isDisplayingSentence: false,
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
      {/* Header Section */}
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.iconGradient}
              >
                <Ionicons name="chatbubbles" size={24} color="#000000" />
              </LinearGradient>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>AI Tutor Conversation</Text>
              <Text style={styles.subtitle}>Real-time learning experience</Text>
            </View>
            <View style={[
              styles.connectionIndicator,
              { backgroundColor: state.isConnected ? '#58D68D' : '#FF6B6B' }
            ]} />
          </View>
        </LinearGradient>
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
          <Text style={styles.processingText}>Audio is processing...</Text>
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
      ) : state.isPlayingFeedback && state.isProcessingAudio ? (
        <View style={styles.processingOverlay}>
          <LottieView
            source={require('../../../assets/animations/sent_audio_for_processing.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>Audio is processing...</Text>
        </View>
      ) : state.isPlayingFeedback ? (
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
      ) : state.isNoSpeechDetected ? (
        <View style={styles.processingOverlay}>
          {state.currentMessageText ? (
            <View style={styles.messageBox}>
              <Text style={styles.currentMessageText}>{state.currentMessageText}</Text>
            </View>
          ) : null}
          <LottieView
            source={require('../../../assets/animations/tap_the_mic_try_again.json')}
            autoPlay
            loop
            style={styles.processingAnimation}
          />
          <Text style={styles.processingText}>No Speech Detected</Text>
        </View>
      ) : state.isDisplayingSentence ? (
        <View style={styles.sentenceOverlay}>
          {/* Sentence Display */}
          <View style={styles.sentenceDisplayContainer}>
            <Text style={styles.sentenceTitle}>Repeat after me:</Text>
            
            {/* English Sentence */}
            <View style={styles.sentenceBox}>
              <Text style={styles.sentenceLabel}>English:</Text>
              <Text style={styles.sentenceText}>{state.currentSentence?.english}</Text>
            </View>
            
            {/* Urdu Sentence */}
            <View style={styles.sentenceBox}>
              <Text style={styles.sentenceLabel}>Urdu:</Text>
              <Text style={styles.sentenceText}>{state.currentSentence?.urdu}</Text>
            </View>
            
            {/* Word-by-word progress */}
            {state.isWordByWordSpeaking && state.currentSentence && (
              <View style={styles.wordProgressContainer}>
                <Text style={styles.wordProgressText}>
                  Word {state.currentWordIndex + 1} of {state.currentSentence.words.length}
                </Text>
                <Text style={styles.currentWordText}>
                  "{state.currentSentence.words[state.currentWordIndex]}"
                </Text>
              </View>
            )}
          </View>
          
          {/* Animation based on state - Hide during word-by-word speaking */}
          {!state.isWordByWordSpeaking && (
            <LottieView
              source={require('../../../assets/animations/listening.json')}
              autoPlay
              loop
              style={styles.processingAnimation}
            />
          )}
          
          <Text style={styles.processingText}>
            {state.isWordByWordSpeaking ? 'Speaking word by word...' : 'Ready to repeat'}
          </Text>
        </View>
      ) : null}

      {/* Center round button and wrong button */}
      <View style={styles.bottomContainer}>
        {/* Wrong (X) button */}
        <TouchableOpacity style={styles.wrongButton} onPress={endConversation}>
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
        {/* Center mic/stop button - Hide during word-by-word and sentence display */}
        {!state.isWordByWordSpeaking && !state.isDisplayingSentence && (
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
                          : state.currentStep === 'playing_feedback'
                            ? styles.centerMicButtonFeedback
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
              disabled={state.currentStep === 'processing' || state.currentStep === 'speaking' || state.currentStep === 'playing_intro' || state.currentStep === 'playing_await_next' || state.currentStep === 'playing_retry' || state.currentStep === 'playing_feedback' || state.currentStep === 'word_by_word'}
              activeOpacity={0.7}
            >
            <LinearGradient
              colors={
                state.currentStep === 'listening' && isTalking
                  ? ['#00C853', '#4CAF50']
                  : state.currentStep === 'listening'
                    ? ['#58D68D', '#45B7A8']
                    : state.currentStep === 'playing_intro'
                      ? ['#58D68D', '#45B7A8']
                      : state.currentStep === 'playing_await_next'
                        ? ['#58D68D', '#45B7A8']
                        : state.currentStep === 'playing_retry'
                          ? ['#58D68D', '#45B7A8']
                          : state.currentStep === 'playing_feedback'
                            ? ['#58D68D', '#45B7A8']
                            : state.currentStep === 'word_by_word'
                              ? ['#58D68D', '#45B7A8']
                              : ['#58D68D', '#45B7A8']
              }
              style={[
                styles.micButtonGradient,
                state.currentStep === 'playing_intro' && styles.introButtonGradient
              ]}
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
                          : state.currentStep === 'playing_feedback'
                            ? 'volume-high'
                            : state.currentStep === 'word_by_word'
                              ? 'volume-high'
                              : 'mic'
                }
                size={state.currentStep === 'playing_intro' ? 52 : 48}
                color="white"
              />
            </LinearGradient>
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
          {state.currentStep === 'playing_feedback' && state.isProcessingAudio && (
            <Text style={styles.processingLabel}>Processing...</Text>
          )}
          {state.currentStep === 'playing_feedback' && !state.isProcessingAudio && (
            <Text style={styles.feedbackLabel}>AI Speaking...</Text>
          )}
          {state.currentStep === 'word_by_word' && (
            <Text style={styles.wordByWordLabel}>Speaking word by word...</Text>
          )}
        </Animated.View>
        )}
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
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  connectionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
  },
  centerMicButtonIdle: {
    backgroundColor: 'transparent',
  },
  centerMicButtonActive: {
    backgroundColor: 'transparent',
  },
  centerMicButtonTalking: {
    backgroundColor: 'transparent',
  },
  centerMicButtonIntro: {
    backgroundColor: 'transparent',
  },
  centerMicButtonAwaitNext: {
    backgroundColor: 'transparent',
  },
  centerMicButtonRetry: {
    backgroundColor: 'transparent',
  },
  centerMicButtonFeedback: {
    backgroundColor: 'transparent',
  },
  wrongButton: {
    position: 'absolute',
    left: 32,
    bottom: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrongButtonContainer: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  tapToSpeakLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '500',
  },
  silenceInfoLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '500',
  },
  introLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: '600',
  },
  awaitNextLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: '600',
  },
  retryLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: '600',
  },
  feedbackLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: '600',
  },
  processingLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '500',
  },
  processingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -160, // Move everything up by 140 pixels
  },
  // Special overlay for sentence display - move content down
  sentenceOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -80, // Move sentence content down by reducing the negative margin
  },
  processingAnimation: {
    width: 200,
    height: 200,
  },
  processingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
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
  wrongButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  introButtonGradient: {
    // No additional styling - clean appearance
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
  // Sentence display styles
  sentenceDisplayContainer: {
    backgroundColor: '#F8F9FA',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 40, // Add top margin to move card down
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  sentenceTitle: {
    fontSize: 18,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sentenceBox: {
    marginBottom: 12,
  },
  sentenceLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: 4,
  },
  sentenceText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    lineHeight: 22,
  },
  wordProgressContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  wordProgressText: {
    fontSize: 14,
    color: '#58D68D',
    fontWeight: '600',
    marginBottom: 4,
  },
  currentWordText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  wordByWordLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: '600',
  },
}); 