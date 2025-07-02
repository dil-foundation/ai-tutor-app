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
  currentStep: 'waiting' | 'listening' | 'processing' | 'speaking' | 'error';
  isConnected: boolean;
  inputText: string;
  currentAudioUri?: string;
  lastStopWasSilence: boolean;
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
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
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
    // Auto-start recording if param is set
    if (autoStart === 'true') {
      setTimeout(() => {
        startRecording();
      }, 500);
    }
    return () => {
      cleanup();
    };
  }, []);

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

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      currentStep: data.step === 'retry' ? 'waiting' : 'waiting',
    }));

    // Auto-scroll to bottom
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
          setState(prev => ({ ...prev, currentStep: 'waiting' }));
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
      setState(prev => ({ ...prev, currentStep: 'listening' }));

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
              }
              resetSilenceTimer(); // Reset silence timer when talking
            } else {
              // No voice detected
              if (isTalking) {
                setIsTalking(false);
                speechStartTimeRef.current = null;
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
      setState(prev => ({ ...prev, currentStep: 'waiting' }));

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Check if we had enough speech to process
      const hadValidSpeech = speechStartTimeRef.current && 
        (Date.now() - speechStartTimeRef.current) >= MIN_SPEECH_DURATION;

      // Only upload/process if NOT stopped by silence AND had valid speech
      if (uri && !stoppedBySilence && hadValidSpeech) {
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
  
      const userMessage: Message = {
        id: Date.now().toString(),
        text: "Sent audio for processing...",
        isAI: false,
        timestamp: new Date(),
      };
  
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        currentStep: 'waiting',
      }));
  
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to convert/send audio:', error);
      setState(prev => ({ ...prev, currentStep: 'error' }));
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
    closeLearnSocket();
  };

  const renderMessage = (message: Message) => (
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

  const renderStatusIndicator = () => {
    switch (state.currentStep) {
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

  // After AI responds, auto-start listening again
  useEffect(() => {
    if (state.currentStep === 'waiting' && state.isConnected && autoStart === 'true') {
      // Only auto-listen if last message was from AI
      if (state.messages.length > 0 && state.messages[state.messages.length - 1].isAI) {
        setTimeout(() => {
          startRecording();
        }, 600);
      }
    }
  }, [state.currentStep, state.messages, state.isConnected, autoStart]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

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

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {state.messages.map(renderMessage)}
        {renderStatusIndicator()}
      </ScrollView>

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
            disabled={state.currentStep === 'processing' || state.currentStep === 'speaking'}
            activeOpacity={0.7}
          >
            <Ionicons
              name={state.currentStep === 'listening' ? 'stop' : 'mic'}
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
}); 