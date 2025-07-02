import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import BASE_API_URL from '../../../config/api';
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
}

export default function ConversationScreen() {
  const [state, setState] = useState<ConversationState>({
    messages: [],
    currentStep: 'waiting',
    isConnected: false,
    inputText: '',
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeAudio();
    connectToWebSocket();
    
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
    if (!isSocketConnected()) {
      Alert.alert('Error', 'WebSocket connection is not available');
      return;
    }

    try {
      setState(prev => ({ ...prev, currentStep: 'listening' }));
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ ...prev, currentStep: 'error' }));
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setState(prev => ({ ...prev, currentStep: 'processing' }));
      
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        // Upload audio and get transcription
        await uploadAudioAndSendMessage(uri);
      }
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
            <Text style={styles.statusText}>Listening...</Text>
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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={state.inputText}
          onChangeText={(text) => setState(prev => ({ ...prev, inputText: text }))}
          placeholder="Type your message in Urdu..."
          multiline
          maxLength={500}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.micButton,
              state.currentStep === 'listening' && styles.micButtonActive
            ]}
            onPress={state.currentStep === 'listening' ? stopRecording : startRecording}
            disabled={state.currentStep === 'processing' || state.currentStep === 'speaking'}
          >
            <Ionicons 
              name={state.currentStep === 'listening' ? 'stop' : 'mic'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              !state.inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendTextMessage}
            disabled={!state.inputText.trim() || state.currentStep === 'processing'}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
}); 