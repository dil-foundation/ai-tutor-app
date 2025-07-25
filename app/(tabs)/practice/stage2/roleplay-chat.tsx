import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { 
  Animated, 
  Dimensions, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import LottieView from 'lottie-react-native';
import BASE_API_URL from '../../../../config/api';
import { useAudioPlayerFixed, useAudioRecorder } from '../../../../hooks';
import { useAuth } from '../../../../context/AuthContext';
import LoadingScreen from '../../../../components/LoadingScreen';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audio_base64?: string;
}

type ChatParams = {
  scenarioId: string;
  scenarioTitle: string;
  scenarioContext: string;
  aiCharacter: string;
}

const RoleplayChatScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<ChatParams>();
  const { user, loading: authLoading } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [showEvaluatingAnimation, setShowEvaluatingAnimation] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [showEvaluationResults, setShowEvaluationResults] = useState(false);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Custom hooks
  const audioPlayer = useAudioPlayerFixed();
  const audioRecorder = useAudioRecorder(5000, async (audioUri) => {
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered!');
    if (audioUri) {
      console.log('✅ [AUTO-STOP] Valid audio URI received, processing...');
      await processAudioInput(audioUri);
    } else {
      console.log('⚠️ [AUTO-STOP] No valid audio URI from auto-stop');
      setError('No speech detected. Please try again.');
      setIsProcessing(false);
    }
  });

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Initialize chat session when component mounts
  useEffect(() => {
    if (user && !authLoading && params.scenarioId) {
      initializeChatSession();
    }
  }, [user, authLoading, params.scenarioId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const initializeChatSession = async () => {
    console.log("🔄 [CHAT] Initializing chat session for scenario:", params.scenarioId);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_API_URL}/api/roleplay/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_id: parseInt(params.scenarioId),
          user_id: user?.id
        })
      });

      const result = await response.json();
      console.log("📊 [CHAT] Start session response:", result);

      if (response.ok && result.session_id) {
        setSessionId(result.session_id);
        
        // Add initial AI message
        const initialMessage: Message = {
          id: 'initial',
          role: 'assistant',
          content: result.ai_response,
          timestamp: 'initial',
          audio_base64: result.audio_base64
        };
        
        setMessages([initialMessage]);
        
        // Play initial audio if available
        if (result.audio_base64) {
          await playAudioMessage(result.audio_base64);
        }
        
        console.log("✅ [CHAT] Chat session initialized successfully");
      } else {
        console.log("❌ [CHAT] Failed to initialize session:", result.detail);
        setError('Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error("❌ [CHAT] Error initializing session:", error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioMessage = async (audioBase64: string) => {
    try {
      const audioUri = `data:audio/mpeg;base64,${audioBase64}`;
      await audioPlayer.loadAudio(audioUri);
      await audioPlayer.playAudio();
      console.log("✅ [CHAT] Audio message played successfully");
    } catch (error) {
      console.error("❌ [CHAT] Error playing audio:", error);
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim() || isProcessing || conversationEnded) return;
    
    console.log("🔄 [CHAT] Sending text message:", inputText);
    await sendMessage(inputText, 'text');
    setInputText('');
  };

  const handleStartRecording = async () => {
    if (isProcessing || audioRecorder.state.isRecording || audioPlayer.state.isPlaying || conversationEnded) {
      console.log('⚠️ [CHAT] Cannot start recording - conditions not met');
      return;
    }

    try {
      console.log('🔄 [CHAT] Starting recording...');
      setError(null);
      
      await audioRecorder.startRecording();
      console.log('✅ [CHAT] Recording started successfully');
      
    } catch (error) {
      console.error('❌ [CHAT] Error starting recording:', error);
      setError('Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecorder.state.isRecording) {
      console.log('⚠️ [CHAT] Cannot stop recording - not currently recording');
      return;
    }

    try {
      console.log('🔄 [CHAT] Manually stopping recording...');
      setIsProcessing(true);
      setError(null);
      
      const audioUri = await audioRecorder.stopRecording();
      console.log('🎤 [CHAT] Recording stopped, audio URI:', audioUri);

      if (!audioUri) {
        console.log('⚠️ [CHAT] No audio URI received from recorder');
        setError('No speech detected. Please try again.');
        setIsProcessing(false);
        return;
      }

      await processAudioInput(audioUri);

    } catch (error) {
      console.error('❌ [CHAT] Error during manual recording stop:', error);
      setError('Failed to process recording. Please try again.');
      setIsProcessing(false);
    }
  };

  const processAudioInput = async (audioUri: string) => {
    console.log('🔄 [CHAT] Processing audio input');
    
    try {
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('✅ [CHAT] Audio converted to base64, length:', base64Audio.length);

      await sendMessage('', 'audio', base64Audio);

    } catch (error) {
      console.error('❌ [CHAT] Error processing audio:', error);
      setError('Failed to process audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const sendMessage = async (text: string, inputType: 'text' | 'audio', audioBase64?: string) => {
    console.log("🔄 [CHAT] Sending message, type:", inputType);
    setIsProcessing(true);
    setError(null);

    try {
      const requestBody = {
        session_id: sessionId,
        user_input: text,
        user_id: user?.id,
        input_type: inputType,
        audio_base64: audioBase64
      };

      const response = await fetch(`${BASE_API_URL}/api/roleplay/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log("📊 [CHAT] Response received:", result);

      if (response.ok && result.ai_response) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: text || '[Audio Message]',
          timestamp: 'user'
        };
        
        // Add AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.ai_response,
          timestamp: 'ai',
          audio_base64: result.audio_base64
        };

        setMessages(prev => [...prev, userMessage, aiMessage]);

        // Play AI audio if available
        if (result.audio_base64) {
          await playAudioMessage(result.audio_base64);
        }

        // Check if conversation ended
        if (result.done) {
          console.log("🏁 [CHAT] Conversation ended");
          setConversationEnded(true);
          // Don't automatically evaluate - let user choose when to evaluate
        }

        console.log("✅ [CHAT] Message sent and response received");
      } else {
        console.log("❌ [CHAT] Failed to send message:", result.detail);
        setError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error("❌ [CHAT] Error sending message:", error);
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Removed showEvaluationDialog function - evaluation now happens automatically

  const evaluateConversation = async () => {
    console.log("🔄 [CHAT] Starting conversation evaluation");
    setShowEvaluatingAnimation(true);
    
    try {
      const response = await fetch(`${BASE_API_URL}/api/roleplay/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: user?.id,
          time_spent_seconds: 300, // Estimate 5 minutes
          urdu_used: false
        })
      });

      const result = await response.json();
      console.log("📊 [CHAT] Evaluation result:", result);

      if (response.ok && result.success) {
        handleEvaluationResults(result);
      } else {
        console.log("❌ [CHAT] Evaluation failed:", result.error);
        Alert.alert(
          'Evaluation Failed',
          'Unable to evaluate your conversation. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error("❌ [CHAT] Error evaluating conversation:", error);
      Alert.alert(
        'Evaluation Error',
        'Network error during evaluation. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setShowEvaluatingAnimation(false);
    }
  };

  const handleEvaluationResults = (evaluation: any) => {
    const score = evaluation.overall_score;
    const isGood = score >= 70;
    
    // Show detailed evaluation directly on screen
    showDetailedEvaluation(evaluation);
  };

  const showDetailedEvaluation = (evaluation: any) => {
    setEvaluationResult(evaluation);
    setShowEvaluationResults(true);
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.container}>
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <View style={styles.backButtonCircle}>
                  <Ionicons name="arrow-back" size={24} color="#58D68D" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.titleContainer}>
                <LinearGradient
                  colors={['#58D68D', '#45B7A8']}
                  style={styles.titleGradient}
                >
                  <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.headerTitle}>{params.scenarioTitle}</Text>
                <Text style={styles.headerSubtitle}>Roleplay as {params.aiCharacter}</Text>
              </View>
            </Animated.View>

            {/* Chat Messages */}
            <Animated.View
              style={[
                styles.chatContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Starting conversation...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={initializeChatSession}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.messagesContainer}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.messageRow,
                        message.role === 'user' ? styles.userMessageRow : styles.aiMessageRow,
                      ]}
                    >
                      {message.role === 'assistant' && (
                        <View style={styles.aiAvatarContainer}>
                          <LinearGradient
                            colors={['#58D68D', '#45B7A8']}
                            style={styles.aiAvatarGradient}
                          >
                            <Ionicons name="hardware-chip-outline" size={20} color="#FFFFFF" />
                          </LinearGradient>
                        </View>
                      )}
                      
                      <View
                        style={[
                          styles.messageBubble,
                          message.role === 'user' ? styles.userMessageBubble : styles.aiMessageBubble,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            message.role === 'user' && styles.userMessageText,
                          ]}
                        >
                          {message.content}
                        </Text>
                        
                        {message.role === 'assistant' && message.audio_base64 && (
                          <TouchableOpacity
                            style={styles.playAudioButton}
                            onPress={() => playAudioMessage(message.audio_base64!)}
                            disabled={audioPlayer.state.isPlaying}
                          >
                            <Ionicons 
                              name={audioPlayer.state.isPlaying ? 'volume-high' : 'play'} 
                              size={16} 
                              color="#58D68D" 
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      
                      {message.role === 'user' && (
                        <View style={styles.userAvatarContainer}>
                          <LinearGradient
                            colors={['rgba(88, 214, 141, 0.2)', 'rgba(69, 183, 168, 0.1)']}
                            style={styles.userAvatarGradient}
                          >
                            <Ionicons name="person-outline" size={20} color="#58D68D" />
                          </LinearGradient>
                        </View>
                      )}
                    </View>
                  ))}
                  
                  {isProcessing && (
                    <View style={styles.processingContainer}>
                      <Ionicons name="ellipsis-horizontal" size={24} color="#58D68D" />
                      <Text style={styles.processingText}>AI is typing...</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </Animated.View>

            {/* Input Area */}
            {!isLoading && !error && !conversationEnded && (
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.inputRow}>
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.textInput,
                      inputText.trim() && styles.textInputActive
                    ]}
                    placeholder={inputText.trim() ? "Type your message..." : "Tap mic to speak or type here..."}
                    placeholderTextColor="#999999"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    editable={!isProcessing}
                  />
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={inputText.trim() ? sendTextMessage : () => {
                      if (audioRecorder.state.isRecording) {
                        handleStopRecording();
                      } else {
                        handleStartRecording();
                      }
                    }}
                    disabled={isProcessing || audioPlayer.state.isPlaying}
                  >
                    <LinearGradient
                      colors={
                        inputText.trim() && !isProcessing 
                          ? ['#58D68D', '#45B7A8'] 
                          : audioRecorder.state.isRecording 
                            ? ['#FF6B6B', '#FF5252']
                            : ['#58D68D', '#45B7A8']
                      }
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons 
                        name={
                          inputText.trim() 
                            ? 'send' 
                            : audioRecorder.state.isRecording 
                              ? 'stop' 
                              : 'mic'
                        } 
                        size={20} 
                        color="#FFFFFF" 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {conversationEnded && !showEvaluationResults && (
              <Animated.View
                style={[
                  styles.conversationEndedContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Text style={styles.conversationEndedText}>
                  Conversation completed! Ready to evaluate your performance?
                </Text>
                <TouchableOpacity
                  style={styles.evaluateButton}
                  onPress={evaluateConversation}
                  disabled={showEvaluatingAnimation}
                >
                  <LinearGradient
                    colors={['#58D68D', '#45B7A8']}
                    style={styles.evaluateButtonGradient}
                  >
                    <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.evaluateButtonText}>Evaluate Conversation</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            {showEvaluationResults && evaluationResult && (
              <View style={styles.evaluationResultsOverlay}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <SafeAreaView style={styles.evaluationSafeArea}>
                  <ScrollView 
                    style={styles.evaluationResultsScrollView}
                    contentContainerStyle={styles.evaluationResultsContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Animated.View
                      style={[
                        styles.evaluationResultsContainer,
                        {
                          opacity: fadeAnim,
                          transform: [{ translateY: slideAnim }],
                        },
                      ]}
                    >
                    {/* Header with Performance Badge */}
                    <View style={styles.evaluationHeader}>
                      <LinearGradient
                        colors={['#58D68D', '#45B7A8']}
                        style={styles.evaluationHeaderGradient}
                      >
                        <View style={styles.performanceBadge}>
                          <Ionicons 
                            name={evaluationResult.overall_score >= 70 ? 'trophy' : 'star'} 
                            size={32} 
                            color="#FFFFFF" 
                          />
                        </View>
                        <Text style={styles.evaluationTitle}>
                          {evaluationResult.overall_score >= 70 ? '🎉 Excellent Performance!' : '📈 Good Effort!'}
                        </Text>
                        <Text style={styles.evaluationSubtitle}>
                          Keep practicing to improve your skills!
                        </Text>
                      </LinearGradient>
                    </View>
                    
                    {/* Overall Score Card */}
                    <View style={styles.overallScoreCard}>
                      <Text style={styles.overallScoreLabel}>Overall Score</Text>
                      <View style={styles.scoreCircle}>
                        <LinearGradient
                          colors={['#58D68D', '#45B7A8']}
                          style={styles.scoreCircleGradient}
                        >
                          <Text style={styles.scoreCircleText}>{evaluationResult.overall_score}</Text>
                          <Text style={styles.scoreCircleMax}>/100</Text>
                        </LinearGradient>
                      </View>
                    </View>
                    
                    {/* Detailed Scores Grid */}
                    <View style={styles.scoresSection}>
                      <Text style={styles.scoresSectionTitle}>Detailed Breakdown</Text>
                      <View style={styles.scoresGrid}>
                        <View style={styles.scoreCard}>
                          <View style={styles.scoreCardHeader}>
                            <Ionicons name="chatbubbles-outline" size={20} color="#58D68D" />
                            <Text style={styles.scoreCardTitle}>Conversation Flow</Text>
                          </View>
                          <Text style={styles.scoreCardValue}>{evaluationResult.conversation_flow_score}/100</Text>
                        </View>
                        
                        <View style={styles.scoreCard}>
                          <View style={styles.scoreCardHeader}>
                            <Ionicons name="key-outline" size={20} color="#58D68D" />
                            <Text style={styles.scoreCardTitle}>Keyword Usage</Text>
                          </View>
                          <Text style={styles.scoreCardValue}>{evaluationResult.keywords_used_count}/{evaluationResult.total_keywords_expected}</Text>
                        </View>
                        
                        <View style={styles.scoreCard}>
                          <View style={styles.scoreCardHeader}>
                            <Ionicons name="school-outline" size={20} color="#58D68D" />
                            <Text style={styles.scoreCardTitle}>Grammar & Fluency</Text>
                          </View>
                          <Text style={styles.scoreCardValue}>{evaluationResult.grammar_fluency_score}/100</Text>
                        </View>
                        
                        <View style={styles.scoreCard}>
                          <View style={styles.scoreCardHeader}>
                            <Ionicons name="globe-outline" size={20} color="#58D68D" />
                            <Text style={styles.scoreCardTitle}>Cultural Appropriateness</Text>
                          </View>
                          <Text style={styles.scoreCardValue}>{evaluationResult.cultural_appropriateness_score}/100</Text>
                        </View>
                        
                        <View style={styles.scoreCard}>
                          <View style={styles.scoreCardHeader}>
                            <Ionicons name="heart-outline" size={20} color="#58D68D" />
                            <Text style={styles.scoreCardTitle}>Engagement</Text>
                          </View>
                          <Text style={styles.scoreCardValue}>{evaluationResult.engagement_score}/100</Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* Feedback Section */}
                    <View style={styles.feedbackSection}>
                      <View style={styles.feedbackHeader}>
                        <Ionicons name="bulb-outline" size={24} color="#58D68D" />
                        <Text style={styles.feedbackTitle}>Feedback & Suggestions</Text>
                      </View>
                      <View style={styles.feedbackCard}>
                        <Text style={styles.feedbackText}>{evaluationResult.suggested_improvement}</Text>
                      </View>
                    </View>
                    
                    {/* Back to Scenarios Button */}
                    <View style={styles.backButtonContainer}>
                      <TouchableOpacity
                        style={styles.backToScenariosButton}
                        onPress={() => {
                          // Navigate to roleplay simulation screen to trigger refresh
                          // Add a small delay to ensure evaluation is complete
                          setTimeout(() => {
                            router.push('/(tabs)/practice/stage2/roleplay-simulation');
                          }, 100);
                        }}
                      >
                        <LinearGradient
                          colors={['#58D68D', '#45B7A8']}
                          style={styles.backToScenariosGradient}
                        >
                          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                          <Text style={styles.backToScenariosText}>Back to Scenarios</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                                      </Animated.View>
                  </ScrollView>
                </SafeAreaView>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* Evaluation Overlay */}
        {showEvaluatingAnimation && (
          <View style={styles.evaluatingOverlay}>
            <View style={styles.evaluatingContainer}>
              <LottieView
                source={require('../../../../assets/animations/evaluating.json')}
                autoPlay
                loop={true}
                style={styles.evaluatingAnimation}
              />
              <Text style={styles.evaluatingText}>Evaluating your conversation...</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 60,
    paddingHorizontal: 24,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 0 : 10,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  titleGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiAvatarContainer: {
    marginRight: 12,
  },
  aiAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: {
    backgroundColor: '#58D68D',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  playAudioButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  userAvatarContainer: {
    marginLeft: 12,
  },
  userAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 48,
  },
  processingText: {
    fontSize: 14,
    color: '#58D68D',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginRight: 12,
  },
  textInputActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#58D68D',
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationEndedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  conversationEndedText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  evaluateButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  evaluateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
  },
  evaluateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#58D68D',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#58D68D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  evaluatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  evaluatingContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  evaluatingAnimation: {
    width: 120,
    height: 120,
  },
  evaluatingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '600',
  },

  evaluationResultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  evaluationSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  evaluationResultsScrollView: {
    flex: 1,
  },
  evaluationResultsContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  evaluationResultsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  evaluationHeader: {
    marginBottom: 30,
  },
  evaluationHeaderGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  performanceBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  evaluationTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  evaluationSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  overallScoreCard: {
    alignItems: 'center',
    marginBottom: 30,
  },
  overallScoreLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '600',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCircleGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreCircleMax: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scoresSection: {
    marginBottom: 30,
  },
  scoresSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  scoresGrid: {
    gap: 12,
  },
  scoreCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#58D68D',
  },
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  scoreCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#58D68D',
  },
  feedbackSection: {
    marginBottom: 30,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  feedbackCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#58D68D',
  },
  feedbackText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  backButtonContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  backToScenariosButton: {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 200,
  },
  backToScenariosGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  backToScenariosText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default RoleplayChatScreen; 