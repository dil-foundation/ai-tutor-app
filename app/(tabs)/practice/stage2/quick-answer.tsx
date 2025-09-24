import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { 
  Animated, 
  Dimensions, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import LottieView from 'lottie-react-native';
import BASE_API_URL, { API_ENDPOINTS } from '../../../../config/api';
import { authenticatedFetch } from '../../../../utils/authUtils';
import { useAudioPlayerFixed, useAudioRecorder } from '../../../../hooks';
import { useAuth } from '../../../../context/AuthContext';
import { progressTracker, ProgressHelpers } from '../../../../utils/progressTracker';
import LoadingScreen from '../../../../components/LoadingScreen';

const { width, height } = Dimensions.get('window');

interface Question {
  id: number;
  question: string;
  question_urdu: string;
  expected_answers: string[];
  expected_answers_urdu: string[];
  keywords: string[];
  keywords_urdu: string[];
  category: string;
  difficulty: string;
  tense: string;
  sentence_structure: string;
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
  answer_accuracy?: number;
  grammar_score?: number;
  fluency_score?: number;
  exercise_completion?: {
    exercise_completed: boolean;
    progress_percentage: number;
    completed_topics: number;
    total_topics: number;
  };
}

const QuickAnswerScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [cardScaleAnim] = useState(new Animated.Value(0.8));
  const [buttonScaleAnim] = useState(new Animated.Value(1));

  // State management
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCongratulationsAnimation, setShowCongratulationsAnimation] = useState(false);
  const [showRetryAnimation, setShowRetryAnimation] = useState(false);
  const [showEvaluatingAnimation, setShowEvaluatingAnimation] = useState(false);

  // Progress tracking state
  const [userProgress, setUserProgress] = useState<any>(null);
  const [isProgressInitialized, setIsProgressInitialized] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [isExerciseCompleted, setIsExerciseCompleted] = useState<boolean>(false);
  const [isTopicLoaded, setIsTopicLoaded] = useState<boolean>(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  // Custom hooks
  const audioPlayer = useAudioPlayerFixed();
  const audioRecorder = useAudioRecorder(8000, async (audioUri) => {
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered!');
    if (audioUri) {
      console.log('✅ [AUTO-STOP] Valid audio URI received, starting automatic evaluation...');
      await processRecording(audioUri);
    } else {
      console.log('⚠️ [AUTO-STOP] No valid audio URI from auto-stop');
      setEvaluationResult({
        success: false,
        question: currentQuestion?.question || '',
        expected_answers: currentQuestion?.expected_answers || [],
        error: 'no_speech_detected',
        message: 'No clear speech detected. Please speak more clearly.',
      });
      setIsProcessing(false);
    }
  });

  // Initialize progress tracking when user is authenticated
  useEffect(() => {
    console.log('🔄 [SCREEN] useEffect triggered - user auth check');
    console.log('📊 [SCREEN] Auth state:', { user: !!user, loading: authLoading, isProgressInitialized });
    
    if (user && !isProgressInitialized) {
      console.log('🔄 [SCREEN] User authenticated, initializing progress tracking...');
      initializeProgressTracking();
    } else if (!user) {
      console.log('ℹ️ [SCREEN] User not authenticated');
    } else {
      console.log('ℹ️ [SCREEN] Progress already initialized');
    }
  }, [user, isProgressInitialized]);

  // Load current question when topic changes
  useEffect(() => {
    if (isTopicLoaded && currentTopicId > 0) {
      loadQuestion();
    }
  }, [isTopicLoaded, currentTopicId]);

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
      Animated.timing(cardScaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Only stop audio if we're actually navigating away
      if (isNavigatingAway && audioPlayer.state.isPlaying) {
        console.log('🔄 [CLEANUP] Stopping audio playback due to navigation');
        audioPlayer.stopAudio();
      }
    };
  }, [audioPlayer, isNavigatingAway]);

  const initializeProgressTracking = async () => {
    console.log("🔄 [PROGRESS] Initializing progress tracking for Quick Answer");
    try {
      if (!user?.id) {
        console.log("❌ [PROGRESS] User ID not available");
        return;
      }
      
      const response = await authenticatedFetch(API_ENDPOINTS.INITIALIZE_PROGRESS, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id
        })
      });

      const result = await response.json();
      console.log("📊 [PROGRESS] Progress initialization result:", result);

      if (result.success) {
        console.log("✅ [PROGRESS] Progress tracking initialized successfully");
        setIsProgressInitialized(true);
        
        console.log('🔄 [SCREEN] Loading current topic, progress, and total questions...');
        await Promise.all([
          loadCurrentTopic(),
          loadUserProgress(),
          loadTotalQuestions()
        ]);
      } else {
        console.log("⚠️ [PROGRESS] Progress initialization failed:", result.error);
      }
    } catch (error) {
      console.error("❌ [PROGRESS] Error initializing progress:", error);
    }
  };

  const loadUserProgress = async () => {
    console.log("🔄 [PROGRESS] Loading user progress for Quick Answer");
    try {
      if (!user?.id) {
        console.log("❌ [PROGRESS] User ID not available");
        return;
      }
      
      const response = await authenticatedFetch(API_ENDPOINTS.GET_USER_PROGRESS(user.id));
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
    console.log("🔄 [PROGRESS] Loading current topic for Quick Answer");
    try {
      if (!user?.id) {
        console.log("❌ [PROGRESS] User ID not available");
        return;
      }
      
      const response = await authenticatedFetch(API_ENDPOINTS.GET_CURRENT_TOPIC, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          stage_id: 2,
          exercise_id: 2  // Exercise 2 (Quick Answer)
        })
      });

      const result = await response.json();
      console.log("📊 [PROGRESS] Current topic result:", result);

      if (result.success && result.data) {
        const topicId = result.data.current_topic_id || 1;
        setCurrentTopicId(topicId);
        setIsTopicLoaded(true);
        console.log("✅ [PROGRESS] Current topic loaded:", topicId);
      } else {
        console.log("⚠️ [PROGRESS] No current topic found, using default (1)");
        setCurrentTopicId(1);
        setIsTopicLoaded(true);
      }
    } catch (error) {
      console.error("❌ [PROGRESS] Error loading current topic:", error);
      setCurrentTopicId(1);
      setIsTopicLoaded(true);
    }
  };

  const loadTotalQuestions = async () => {
    console.log("🔄 [QUESTIONS] Loading total questions count");
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.QUICK_ANSWERS);
      const result = await response.json();
      console.log("📊 [QUESTIONS] Total questions result:", result);

      if (result.questions) {
        setTotalQuestions(result.questions.length);
        console.log("✅ [QUESTIONS] Total questions loaded:", result.questions.length);
      } else {
        console.log("❌ [QUESTIONS] Failed to load questions");
      }
    } catch (error) {
      console.error("❌ [QUESTIONS] Error loading total questions:", error);
    }
  };

  const loadQuestion = async () => {
    console.log("🔄 [QUESTION] Loading question with ID:", currentTopicId);
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.QUICK_ANSWER_QUESTION(currentTopicId));
      const result = await response.json();
      console.log("📊 [QUESTION] Question result:", result);

      if (response.ok) {
        setCurrentQuestion(result);
        console.log("✅ [QUESTION] Question loaded successfully:", result.question);
      } else {
        console.log("❌ [QUESTION] Failed to load question:", result.detail);
        setError('Failed to load question. Please try again.');
      }
    } catch (error) {
      console.error("❌ [QUESTION] Error loading question:", error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const playQuestionAudio = async () => {
    if (!currentQuestion || audioPlayer.state.isPlaying || isAudioLoading) return;

    console.log("🔄 [AUDIO] Playing question audio for ID:", currentTopicId);
    setIsAudioLoading(true);
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.QUICK_ANSWER(currentTopicId), {
        method: 'POST'
      });

      const result = await response.json();
      console.log("📊 [AUDIO] Audio response received");

      if (response.ok && result.audio_base_64) {
        const audioUri = `data:audio/mpeg;base64,${result.audio_base_64}`;
        await audioPlayer.loadAudio(audioUri);
        await audioPlayer.playAudio();
        console.log("✅ [AUDIO] Audio played successfully");
      } else {
        console.log("❌ [AUDIO] Failed to get audio:", result.detail);
        setError('Failed to play audio. Please try again.');
      }
    } catch (error) {
      console.error("❌ [AUDIO] Error playing audio:", error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleStartRecording = async () => {
    if (!currentQuestion || audioRecorder.state.isRecording || audioPlayer.state.isPlaying) {
      console.log('⚠️ [SCREEN] Cannot start recording - conditions not met');
      return;
    }

    try {
      console.log('🔄 [SCREEN] Starting recording...');
      setError(null);
      setEvaluationResult(null);
      
      const startTime = Date.now();
      setRecordingStartTime(startTime);
      console.log('⏱️ [SCREEN] Recording start time recorded:', startTime);
      
      await audioRecorder.startRecording();
      console.log('✅ [SCREEN] Recording started successfully with auto-stop in 5 seconds');
      console.log('🔴 [SCREEN] Button should now be RED (recording state)');
      
    } catch (error) {
      console.error('❌ [SCREEN] Error starting recording:', error);
      setError('Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecorder.state.isRecording) {
      console.log('⚠️ [SCREEN] Cannot stop recording - not currently recording');
      return;
    }

    try {
      console.log('🔄 [SCREEN] Manually stopping recording...');
      setIsProcessing(true);
      setError(null);
      setEvaluationResult(null);
      
      const audioUri = await audioRecorder.stopRecording();
      console.log('🎤 [SCREEN] Recording stopped, audio URI:', audioUri);

      if (!audioUri) {
        console.log('⚠️ [SCREEN] No audio URI received from recorder');
        setEvaluationResult({
          success: false,
          question: currentQuestion?.question || '',
          expected_answers: currentQuestion?.expected_answers || [],
          error: 'no_speech_detected',
          message: 'No clear speech detected. Please speak more clearly.',
        });
        setIsProcessing(false);
        return;
      }

      await processRecording(audioUri);

    } catch (error) {
      console.error('❌ [SCREEN] Error during manual recording stop:', error);
      setError('Failed to process recording. Please try again.');
      setIsProcessing(false);
    }
  };

  const processRecording = async (audioUri: string) => {
    console.log('🔄 [SCREEN] processRecording called');
    
    setShowEvaluatingAnimation(true);
    
    try {
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('✅ [SCREEN] Audio converted to base64, length:', base64Audio.length);

      const timeSpentSeconds = Math.max(1, Math.floor((Date.now() - recordingStartTime) / 1000));
      console.log('⏱️ [SCREEN] Time spent recording:', timeSpentSeconds, 'seconds');

      const evaluationRequest = {
        audio_base64: base64Audio,
        question_id: currentQuestion?.id || 1,
        filename: `quick_answer_${currentTopicId}_${Date.now()}.m4a`,
        user_id: user?.id || '',
        time_spent_seconds: timeSpentSeconds,
        urdu_used: false
      };

      console.log('📡 [SCREEN] Sending evaluation request to:', API_ENDPOINTS.EVALUATE_QUICK_ANSWER);
      
      const evaluationResponse = await authenticatedFetch(API_ENDPOINTS.EVALUATE_QUICK_ANSWER, {
        method: 'POST',
        body: JSON.stringify(evaluationRequest),
      });

      console.log('📥 [SCREEN] Evaluation response status:', evaluationResponse.status);

      if (!evaluationResponse.ok) {
        const errorText = await evaluationResponse.text();
        console.error('❌ [SCREEN] Evaluation request failed:', {
          status: evaluationResponse.status,
          statusText: evaluationResponse.statusText,
          errorText: errorText
        });
        throw new Error(`Failed to evaluate audio: ${evaluationResponse.status} ${evaluationResponse.statusText}`);
      }

      const result: EvaluationResult = await evaluationResponse.json();
      console.log('✅ [SCREEN] Evaluation result received:', {
        success: result.success,
        question: result.question,
        userText: result.user_text,
        error: result.error,
        message: result.message,
        hasEvaluation: !!result.evaluation,
        progressRecorded: result.progress_recorded,
        unlockedContent: result.unlocked_content,
        answerAccuracy: result.answer_accuracy,
        grammarScore: result.grammar_score,
        fluencyScore: result.fluency_score
      });

      setShowEvaluatingAnimation(false);
      setEvaluationResult(result);
      console.log('✅ [SCREEN] Evaluation result set in state');

      if (result.success && result.evaluation && result.evaluation.is_correct) {
        if (result.exercise_completion?.exercise_completed) {
            console.log('🎉 [SCREEN] Exercise fully completed! Backend confirmed.');
            setShowCongratulationsAnimation(true);
            setIsExerciseCompleted(true);
            
            setTimeout(() => {
                setShowCongratulationsAnimation(false);
                Alert.alert("Exercise Completed!", "Great job! You've mastered this exercise.", [
                    { text: "OK", onPress: () => handleBackPress() }
                ]);
            }, 3000);
        } else {
            console.log('🎉 [SCREEN] Correct answer! Showing congratulations animation...');
            setShowCongratulationsAnimation(true);
            
            if (result.unlocked_content && result.unlocked_content.length > 0) {
              console.log('🎉 [SCREEN] Showing unlocked content notification:', result.unlocked_content);
              Alert.alert(
                '🎉 New Content Unlocked!',
                `You've unlocked: ${result.unlocked_content.join(', ')}`,
                [{ text: 'OK' }]
              );
            }
            
            setTimeout(() => {
              console.log('🔄 [SCREEN] Moving to next question after congratulations animation');
              setShowCongratulationsAnimation(false);
              moveToNextQuestion();
            }, 3000);
        }
      } else if (result.success && result.evaluation && !result.evaluation.is_correct) {
        console.log('❌ [SCREEN] Incorrect answer! Showing retry animation...');
        setShowRetryAnimation(true);
        
        setTimeout(() => {
          console.log('🔄 [SCREEN] Hiding retry animation after 3 seconds');
          setShowRetryAnimation(false);
        }, 3000);
      }

    } catch (error) {
      console.error('❌ [SCREEN] Error during recording evaluation:', error);
      setError('Failed to process recording. Please try again.');
      setShowEvaluatingAnimation(false);
    } finally {
      console.log('🏁 [SCREEN] Evaluation process completed');
      setIsProcessing(false);
    }
  };

  const moveToNextQuestion = () => {
    if (currentTopicId < totalQuestions) {
      const nextId = currentTopicId + 1;
      setCurrentTopicId(nextId);
      setEvaluationResult(null);
      console.log("🔄 [PROGRESS] Moving to next question:", nextId);
    } else {
      console.log("🎉 [PROGRESS] All questions completed!");
      setIsExerciseCompleted(true);
      setError('Congratulations! You have completed all Quick Answer exercises!');
    }
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle back button press
  const handleBackPress = () => {
    console.log('🎯 [NAVIGATION] Back button pressed, stopping audio if playing');
    if (audioPlayer.state.isPlaying) {
      audioPlayer.stopAudio();
    }
    setIsNavigatingAway(true);
    router.push({ pathname: '/practice/stage2' });
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
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <View style={styles.backButtonCircle}>
                <Ionicons name="arrow-back" size={24} color="#58D68D" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.titleGradient}
              >
                <Ionicons name="flash" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Quick Answer</Text>
              <Text style={styles.headerSubtitle}>Answer Questions Naturally</Text>
              
              {/* Topic Counter */}
              <Text style={styles.topicCounter}>
                Question: {currentTopicId} of {totalQuestions}
              </Text>
            </View>
          </Animated.View>

          {/* Main Content Card */}
          <Animated.View
            style={[
              styles.mainCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: cardScaleAnim }
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.mainCardGradient}
            >
              {isExerciseCompleted ? (
                <View style={styles.completedContainer}>
                  <Ionicons name="trophy" size={64} color="#58D68D" />
                  <Text style={styles.completedTitle}>🎉 Exercise Completed!</Text>
                  <Text style={styles.completedText}>
                    Congratulations! You have successfully completed all Quick Answer exercises.
                  </Text>
                  <Text style={styles.completedText}>Great job on your progress!</Text>
                </View>
              ) : isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Loading question...</Text>
                </View>
              ) : currentQuestion ? (
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.questionContainer}>
                    {/* Question Icon */}
                    {/* <View style={styles.iconContainer}>
                      <LinearGradient
                        colors={['#58D68D', '#45B7A8']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="help-circle-outline" size={48} color="#FFFFFF" />
                      </LinearGradient>
                    </View> */}
                    
                    {/* Question Text */}
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                    
                    {/* Urdu Translation */}
                    <Text style={styles.urduText}>{currentQuestion.question_urdu}</Text>
                    
                    {/* Expected Answers */}
                    <View style={styles.answersContainer}>
                      <Text style={styles.answersTitle}>Expected Answers:</Text>
                      {currentQuestion.expected_answers.map((answer, index) => (
                        <View key={index} style={styles.answerItem}>
                          <Text style={styles.answerText}>{answer}</Text>
                          <Text style={styles.answerUrduText}>{currentQuestion.expected_answers_urdu[index]}</Text>
                        </View>
                      ))}
                    </View>
                    
                    {/* Keywords */}
                    <View style={styles.keywordsContainer}>
                      <Text style={styles.keywordsTitle}>Keywords to Include:</Text>
                      <Text style={styles.keywordsText}>
                        {currentQuestion.keywords.join(", ")}
                      </Text>
                    </View>
                    
                    {/* Play Button */}
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={playQuestionAudio}
                      disabled={isAudioLoading || audioPlayer.state.isPlaying || audioRecorder.state.isRecording}
                    >
                      <LinearGradient
                        colors={["#58D68D", "#45B7A8"]}
                        style={styles.playButtonGradient}
                      >
                        {isAudioLoading ? (
                          <ActivityIndicator size="large" color="#FFFFFF" />
                        ) : (
                          <Ionicons 
                            name={audioPlayer.state.isPlaying ? 'volume-high' : 'play'} 
                            size={36} 
                            color="#fff" 
                          />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <Text style={styles.instructionText}>
                      Listen to the question and answer naturally
                    </Text>
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorText}>Failed to load question</Text>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Action Button */}
          {!isExerciseCompleted && (
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: buttonScaleAnim }
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.speakButton,
                {
                  shadowColor: audioRecorder.state.isRecording ? '#FF6B6B' : '#45B7A8',
                }
              ]}
              onPress={() => {
                animateButtonPress();
                if (audioRecorder.state.isRecording) {
                  handleStopRecording();
                } else {
                  handleStartRecording();
                }
              }}
              disabled={isProcessing || audioPlayer.state.isPlaying || isLoading || isExerciseCompleted || isAudioLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={audioRecorder.state.isRecording ? ["#FF6B6B", "#FF5252"] : ["#58D68D", "#45B7A8"]}
                style={styles.speakButtonGradient}
              >
                <Ionicons 
                  name={isProcessing ? 'hourglass-outline' : audioRecorder.state.isRecording ? 'stop-outline' : 'mic-outline'} 
                  size={24} 
                  color="#fff" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={styles.speakButtonText}>
                  {isProcessing ? 'Processing...' : audioRecorder.state.isRecording ? 'Listening' : 'Speak Now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          )}
        </View>

        {/* Overlays */}
        {showCongratulationsAnimation && (
          <View style={styles.congratulationsOverlay}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../../../assets/animations/correct_move_to_next_sentence.json')}
                autoPlay
                loop={false}
                style={styles.congratulationsAnimation}
              />
            </View>
            <View style={styles.congratulationsTextContainer}>
              <Text style={styles.congratulationsTitle}>Excellent!!!</Text>
              <Text style={styles.congratulationsSubtitle}>Move on to the next question</Text>
            </View>
          </View>
        )}

        {showRetryAnimation && (
          <View style={styles.congratulationsOverlay}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../../../assets/animations/retry.json')}
                autoPlay
                loop={false}
                style={styles.retryAnimation}
              />
            </View>
            <View style={styles.retryTextContainer}>
              <Text style={styles.retryTitle}>Try Again</Text>
              <Text style={styles.retrySubtitle}>Answer the question naturally</Text>
            </View>
          </View>
        )}

        {showEvaluatingAnimation && (
          <View style={styles.congratulationsOverlay}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../../../assets/animations/evaluating.json')}
                autoPlay
                loop={true}
                style={styles.evaluatingAnimation}
              />
            </View>
            <View style={styles.evaluatingTextContainer}>
              <Text style={styles.evaluatingTitle}>Evaluating...</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 12,
  },
  topicCounter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainCard: {
    width: '100%',
    flex: 1,
    marginBottom: 20,
  },
  mainCardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  completedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#58D68D',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#58D68D',
    textAlign: 'center',
    marginTop: 16,
  },
  questionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 30,
  },
  urduText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 26,
  },
  answersContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.2)',
    width: '100%',
  },
  answersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#58D68D',
    marginBottom: 12,
    textAlign: 'center',
  },
  answerItem: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.1)',
  },
  answerText: {
    fontSize: 16,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  answerUrduText: {
    fontSize: 14,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    opacity: 0.8,
  },
  keywordsContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
    width: '100%',
  },
  keywordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 12,
    textAlign: 'center',
  },
  keywordsText: {
    fontSize: 16,
    color: '#FFC107',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  playButton: {
    marginBottom: 24,
  },
  playButtonGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  instructionText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  speakButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#45B7A8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  speakButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 20,
  },
  speakButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  congratulationsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: height * 0.6,
  },
  congratulationsAnimation: {
    width: Math.min(width * 0.7, height * 0.5),
    height: Math.min(width * 0.7, height * 0.5),
    alignSelf: 'center',
  },
  congratulationsTextContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
    width: '100%',
  },
  congratulationsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  congratulationsSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  retryAnimation: {
    width: Math.min(width * 0.7, height * 0.5),
    height: Math.min(width * 0.7, height * 0.5),
    alignSelf: 'center',
  },
  retryTextContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
    width: '100%',
  },
  retryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  retrySubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  evaluatingAnimation: {
    width: Math.min(width * 0.7, height * 0.5),
    height: Math.min(width * 0.7, height * 0.5),
    alignSelf: 'center',
  },
  evaluatingTextContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
    width: '100%',
  },
  evaluatingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default QuickAnswerScreen; 