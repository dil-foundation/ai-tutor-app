import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { 
  Animated, 
  Dimensions, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import BASE_API_URL from '../../../../config/api';
import { useAudioPlayerFixed, useAudioRecorder } from '../../../../hooks';
import { useAuth } from '../../../../context/AuthContext';
import { progressTracker, ProgressHelpers } from '../../../../utils/progressTracker';
import LoadingScreen from '../../../../components/LoadingScreen';

const { width, height } = Dimensions.get('window');

interface Prompt {
  id: number;
  question: string;
  question_urdu: string;
  expected_answers: string[];
  expected_answers_urdu: string[];
  category: string;
  difficulty: string;
}

interface EvaluationResult {
  success: boolean;
  question?: string;
  expected_answers?: string[];
  user_text?: string;
  evaluation?: any;
  suggested_improvement?: string;
  error?: string;
  message?: string;
  progress_recorded?: boolean;
  unlocked_content?: string[];
}

const QuickResponseScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [buttonScale] = useState(new Animated.Value(1));

  // State management
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [currentPromptId, setCurrentPromptId] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [currentTopicId, setCurrentTopicId] = useState(1);

  // Audio hooks
  const audioPlayer = useAudioPlayerFixed();
  const audioRecorder = useAudioRecorder(5000, async (audioUri) => {
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered!');
    if (audioUri) {
      console.log('✅ [AUTO-STOP] Valid audio URI received, starting automatic evaluation...');
      await processRecording(audioUri);
    } else {
      console.log('⚠️ [AUTO-STOP] No valid audio URI from auto-stop');
      setEvaluationResult({
        success: false,
        question: currentPrompt?.question || '',
        expected_answers: currentPrompt?.expected_answers || [],
        error: 'no_speech_detected',
        message: 'No clear speech detected. Please speak more clearly.',
      });
      setIsLoading(false);
    }
  });

  // Refs
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

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

  // Initialize progress tracking
  useEffect(() => {
    if (user?.id) {
      initializeProgressTracking();
      loadUserProgress();
      loadCurrentTopic();
      loadTotalPrompts();
    }
  }, [user?.id]);

  // Load current prompt when topic changes
  useEffect(() => {
    if (currentTopicId > 0) {
      loadPrompt();
    }
  }, [currentTopicId]);

  const initializeProgressTracking = async () => {
    console.log("🔄 [PROGRESS] Initializing progress tracking for Quick Response");
    try {
      const response = await fetch(`${BASE_API_URL}/api/progress/initialize-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id
        })
      });

      const result = await response.json();
      console.log("📊 [PROGRESS] Progress initialization result:", result);

      if (result.success) {
        console.log("✅ [PROGRESS] Progress tracking initialized successfully");
      } else {
        console.log("⚠️ [PROGRESS] Progress initialization failed:", result.error);
      }
    } catch (error) {
      console.error("❌ [PROGRESS] Error initializing progress:", error);
    }
  };

  const loadUserProgress = async () => {
    console.log("🔄 [PROGRESS] Loading user progress for Quick Response");
    try {
      const response = await fetch(`${BASE_API_URL}/api/progress/user-progress/${user?.id}`);
      const result = await response.json();
      console.log("📊 [PROGRESS] User progress result:", result);

      if (result.success) {
        setUserProgress(result.data);
        console.log("✅ [PROGRESS] User progress loaded successfully");
      } else {
        console.log("❌ [PROGRESS] Failed to load user progress:", result.error);
      }
    } catch (error) {
      console.error("❌ [PROGRESS] Error loading user progress:", error);
    }
  };

  const loadCurrentTopic = async () => {
    console.log("🔄 [PROGRESS] Loading current topic for Quick Response");
    try {
      const response = await fetch(`${BASE_API_URL}/api/progress/get-current-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          stage_id: 1,
          exercise_id: 2  // Exercise 2 (Quick Response)
        })
      });

      const result = await response.json();
      console.log("📊 [PROGRESS] Current topic result:", result);

      if (result.success && result.data) {
        const topicId = result.data.current_topic_id || 1;
        setCurrentTopicId(topicId);
        setCurrentPromptId(topicId);
        console.log("✅ [PROGRESS] Current topic loaded:", topicId);
      } else {
        console.log("⚠️ [PROGRESS] No current topic found, using default (1)");
        setCurrentTopicId(1);
        setCurrentPromptId(1);
      }
    } catch (error) {
      console.error("❌ [PROGRESS] Error loading current topic:", error);
      setCurrentTopicId(1);
      setCurrentPromptId(1);
    }
  };

  const loadTotalPrompts = async () => {
    console.log("🔄 [PROMPTS] Loading total prompts count");
    try {
      const response = await fetch(`${BASE_API_URL}/api/prompts`);
      const result = await response.json();
      console.log("📊 [PROMPTS] Total prompts result:", result);

      if (result.prompts) {
        setTotalPrompts(result.prompts.length);
        console.log("✅ [PROMPTS] Total prompts loaded:", result.prompts.length);
      } else {
        console.log("❌ [PROMPTS] Failed to load prompts");
      }
    } catch (error) {
      console.error("❌ [PROMPTS] Error loading total prompts:", error);
    }
  };

  const loadPrompt = async () => {
    console.log("🔄 [PROMPT] Loading prompt with ID:", currentPromptId);
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/prompts/${currentPromptId}`);
      const result = await response.json();
      console.log("📊 [PROMPT] Prompt result:", result);

      if (response.ok) {
        setCurrentPrompt(result);
        console.log("✅ [PROMPT] Prompt loaded successfully:", result.question);
      } else {
        console.log("❌ [PROMPT] Failed to load prompt:", result.detail);
        Alert.alert("Error", "Failed to load prompt. Please try again.");
      }
    } catch (error) {
      console.error("❌ [PROMPT] Error loading prompt:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const playPromptAudio = async () => {
    if (!currentPrompt || isPlaying) return;

    console.log("🔄 [AUDIO] Playing prompt audio for ID:", currentPromptId);
    setIsPlaying(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/quick-response/${currentPromptId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log("📊 [AUDIO] Audio response received");

      if (response.ok && result.audio_base64) {
        const audioUri = `data:audio/mpeg;base64,${result.audio_base64}`;
        await audioPlayer.loadAudio(audioUri);
        await audioPlayer.playAudio();
        console.log("✅ [AUDIO] Audio played successfully");
      } else {
        console.log("❌ [AUDIO] Failed to get audio:", result.detail);
        Alert.alert("Error", "Failed to play audio. Please try again.");
      }
    } catch (error) {
      console.error("❌ [AUDIO] Error playing audio:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStartRecording = async () => {
    if (!currentPrompt || isRecording) return;

    console.log("🔄 [RECORDING] Starting recording for prompt:", currentPromptId);
    setIsRecording(true);
    setRecordingTime(0);
    startTimeRef.current = Date.now();

    try {
      await audioRecorder.startRecording();
      console.log("✅ [RECORDING] Recording started successfully");

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000) as any;
    } catch (error) {
      console.error("❌ [RECORDING] Error starting recording:", error);
      setIsRecording(false);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;

    console.log("🔄 [RECORDING] Stopping recording");
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    try {
      const recordingUri = await audioRecorder.stopRecording();
      console.log("✅ [RECORDING] Recording stopped, URI:", recordingUri);
      
      if (recordingUri) {
        await processRecording(recordingUri);
      }
    } catch (error) {
      console.error("❌ [RECORDING] Error stopping recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    }
  };

  const processRecording = async (audioUri: string) => {
    console.log("🔄 [PROCESSING] Processing recording");
    setIsLoading(true);

    try {
      // Read the audio file
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      console.log("📊 [PROCESSING] Time spent:", timeSpent, "seconds");

      // Send for evaluation
      const response = await fetch(`${BASE_API_URL}/api/evaluate-quick-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: audioBase64,
          prompt_id: currentPromptId,
          filename: `quick_response_${currentPromptId}_${Date.now()}.m4a`,
          user_id: user?.id || '',
          time_spent_seconds: timeSpent,
          urdu_used: false
        })
      });

      const result: EvaluationResult = await response.json();
      console.log("📊 [PROCESSING] Evaluation result:", result);

      if (result.success) {
        setEvaluationResult(result);
        setShowFeedback(true);
        console.log("✅ [PROCESSING] Evaluation completed successfully");
        
        // Move to next prompt if completed
        if (result.evaluation?.completed) {
          setTimeout(() => {
            moveToNextPrompt();
          }, 3000);
        }
      } else {
        console.log("❌ [PROCESSING] Evaluation failed:", result.error);
        Alert.alert("Error", result.message || "Failed to evaluate response. Please try again.");
      }
    } catch (error) {
      console.error("❌ [PROCESSING] Error processing recording:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const moveToNextPrompt = () => {
    if (currentPromptId < totalPrompts) {
      const nextId = currentPromptId + 1;
      setCurrentPromptId(nextId);
      setCurrentTopicId(nextId);
      setEvaluationResult(null);
      setShowFeedback(false);
      console.log("🔄 [PROGRESS] Moving to next prompt:", nextId);
    } else {
      console.log("🎉 [PROGRESS] All prompts completed!");
      Alert.alert(
        "Congratulations!", 
        "You've completed all Quick Response exercises!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getQuestionText = () => {
    if (!currentPrompt) return "";
    return currentPrompt.question;
  };

  const getExpectedAnswersText = () => {
    if (!currentPrompt) return "";
    return currentPrompt.expected_answers.join(", ");
  };

  const getFeedbackText = () => {
    if (!evaluationResult?.evaluation) return "";
    return evaluationResult.evaluation.feedback || "Good effort!";
  };

  const getScore = () => {
    if (!evaluationResult?.evaluation) return 0;
    return evaluationResult.evaluation.score || 0;
  };

  const isCorrect = () => {
    if (!evaluationResult?.evaluation) return false;
    return evaluationResult.evaluation.is_correct || false;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.headerTitle}>Quick Response</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{currentPromptId}/{totalPrompts}</Text>
          </View>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instruction */}
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.instructionContainer}>
              <Ionicons name="flash" size={24} color="#58D68D" />
              <Text style={styles.instructionText}>
                Listen to the question and respond quickly in English.
              </Text>
            </View>
          </Animated.View>

          {/* Question Display */}
          {currentPrompt && (
            <Animated.View
              style={[
                styles.questionContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Ionicons name="help-circle-outline" size={24} color="#58D68D" />
                  <Text style={styles.questionLabel}>Question</Text>
                </View>
                <Text style={styles.questionText}>{getQuestionText()}</Text>
                
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={playPromptAudio}
                  disabled={isPlaying}
                >
                  <LinearGradient
                    colors={['#58D68D', '#45B7A8']}
                    style={styles.playButtonGradient}
                  >
                    {isPlaying ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Ionicons name="play" size={20} color="#FFFFFF" />
                    )}
                    <Text style={styles.playButtonText}>
                      {isPlaying ? "Playing..." : "Play Question"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Expected Answers */}
          {currentPrompt && (
            <Animated.View
              style={[
                styles.answersContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.answersCard}>
                <View style={styles.answersHeader}>
                  <Ionicons name="bulb-outline" size={20} color="#58D68D" />
                  <Text style={styles.answersLabel}>Expected Answers</Text>
                </View>
                <Text style={styles.answersText}>{getExpectedAnswersText()}</Text>
              </View>
            </Animated.View>
          )}

          {/* User Response Display */}
          {evaluationResult && (
            <Animated.View
              style={[
                styles.responseContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.responseCard}>
                <View style={styles.responseHeader}>
                  <Ionicons name="person-outline" size={20} color="#58D68D" />
                  <Text style={styles.responseLabel}>Your Response</Text>
                </View>
                <Text style={styles.responseText}>{evaluationResult.user_text}</Text>
              </View>
            </Animated.View>
          )}

          {/* Feedback Display */}
          {showFeedback && evaluationResult && (
            <Animated.View
              style={[
                styles.feedbackContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={[
                styles.feedbackCard,
                { backgroundColor: isCorrect() ? '#E8F5E8' : '#FFF3E0' }
              ]}>
                <View style={styles.feedbackHeader}>
                  <Ionicons 
                    name={isCorrect() ? "checkmark-circle" : "alert-circle"} 
                    size={24} 
                    color={isCorrect() ? "#4CAF50" : "#FF9800"} 
                  />
                  <Text style={[
                    styles.feedbackLabel,
                    { color: isCorrect() ? "#4CAF50" : "#FF9800" }
                  ]}>
                    {isCorrect() ? "Great Job!" : "Keep Practicing"}
                  </Text>
                </View>
                <Text style={styles.feedbackText}>{getFeedbackText()}</Text>
                <Text style={styles.scoreText}>Score: {getScore()}%</Text>
                {evaluationResult.suggested_improvement && (
                  <Text style={styles.improvementText}>
                    💡 {evaluationResult.suggested_improvement}
                  </Text>
                )}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Recording Button */}
        <Animated.View
          style={[
            styles.recordButtonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonRecording
            ]}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading || !currentPrompt}
          >
            <LinearGradient
              colors={isRecording ? ['#FF6B6B', '#FF5252'] : ['#58D68D', '#45B7A8']}
              style={styles.recordButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="large" />
              ) : (
                <>
                  <Ionicons 
                    name={isRecording ? "stop" : "mic"} 
                    size={32} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.recordButtonText}>
                    {isRecording ? `Recording... ${formatTime(recordingTime * 1000)}` : "Start Recording"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      <View style={styles.particle1} />
      <View style={styles.particle2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  progressContainer: {
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#58D68D',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
    marginHorizontal: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#6C757D',
    marginLeft: 12,
    flex: 1,
  },
  questionContainer: {
    width: '100%',
    marginBottom: 24,
    marginHorizontal: 8,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.1)',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#58D68D',
    marginLeft: 8,
  },
  questionText: {
    fontSize: 20,
    color: '#000000',
    lineHeight: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  playButton: {
    alignSelf: 'center',
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  answersContainer: {
    width: '100%',
    marginBottom: 24,
    marginHorizontal: 8,
  },
  answersCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.1)',
  },
  answersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  answersLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#58D68D',
    marginLeft: 8,
  },
  answersText: {
    fontSize: 16,
    color: '#6C757D',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  responseContainer: {
    width: '100%',
    marginBottom: 24,
    marginHorizontal: 8,
  },
  responseCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.2)',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  responseText: {
    fontSize: 16,
    color: '#1976D2',
    lineHeight: 24,
  },
  feedbackContainer: {
    width: '100%',
    marginBottom: 24,
    marginHorizontal: 8,
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#58D68D',
    textAlign: 'center',
    marginBottom: 8,
  },
  improvementText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  recordButtonContainer: {
    width: '100%',
    paddingBottom: 32,
  },
  recordButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  recordButtonRecording: {
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.4,
  },
  recordButtonGradient: {
    paddingVertical: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.2,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(88, 214, 141, 0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.35,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(69, 183, 168, 0.03)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.65,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(88, 214, 141, 0.04)',
  },
  particle1: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(88, 214, 141, 0.3)',
  },
  particle2: {
    position: 'absolute',
    bottom: height * 0.45,
    right: width * 0.15,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(69, 183, 168, 0.25)',
  },
});

export default QuickResponseScreen; 