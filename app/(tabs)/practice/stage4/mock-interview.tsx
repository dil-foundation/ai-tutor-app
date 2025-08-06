import React, { useState, useEffect, useRef } from 'react';
import {
  View,
    Text,
    TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../../context/AuthContext';
import { useAudioRecorder, useAudioPlayerFixed } from '../../../../hooks';
import BASE_API_URL, { API_ENDPOINTS } from '../../../../config/api';
import { authenticatedFetch } from '../../../../utils/authUtils';

const { width, height } = Dimensions.get('window');

interface InterviewQuestion {
  id: number;
  question: string;
  question_urdu: string;
  category: string;
  difficulty: string;
  speaking_duration: string;
  thinking_time: string;
  expected_structure: string;
  expected_keywords: string[];
  expected_keywords_urdu: string[];
  vocabulary_focus: string[];
  vocabulary_focus_urdu: string[];
  model_response: string;
  model_response_urdu: string;
  evaluation_criteria: any;
  learning_objectives: string[];
}

interface EvaluationResult {
  success: boolean;
  question?: string;
  expected_keywords?: string[];
  user_text?: string;
  evaluation?: any;
  suggested_improvement?: string;
  error?: string;
  message?: string;
  progress_recorded?: boolean;
  unlocked_content?: string[];
  keyword_matches?: number;
  total_keywords?: number;
  fluency_score?: number;
  grammar_score?: number;
  answer_relevance_score?: number;
  confidence_tone_score?: number;
  interview_vocabulary_score?: number;
}

const MockInterviewScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [cardScaleAnim] = useState(new Animated.Value(0.8));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showEvaluatingAnimation, setShowEvaluatingAnimation] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isExerciseCompleted, setIsExerciseCompleted] = useState(false);
  const [isProgressInitialized, setIsProgressInitialized] = useState(false);
  
  // Timer states
  const [showThinkingTimer, setShowThinkingTimer] = useState(false);
  const [showSpeakingTimer, setShowSpeakingTimer] = useState(false);
  const [isThinkingPhase, setIsThinkingPhase] = useState(false);
  const [isSpeakingPhase, setIsSpeakingPhase] = useState(false);
  const [thinkingTimeLeft, setThinkingTimeLeft] = useState(15);
  const [speakingTimeLeft, setSpeakingTimeLeft] = useState(90);
  
  // Timer refs
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Audio hooks
  const audioRecorder = useAudioRecorder(90000, async (audioUri) => {
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered!');
    
    // Clear any active timers
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    
    // Reset speaking phase states
    setShowSpeakingTimer(false);
    setIsSpeakingPhase(false);
    
    if (audioUri) {
      console.log('✅ [AUTO-STOP] Valid audio URI received, starting automatic evaluation...');
      await processRecording(audioUri);
    } else {
      console.log('⚠️ [AUTO-STOP] No valid audio URI from auto-stop');
      setEvaluationResult({
        success: false,
        question: currentQuestion?.question || '',
        error: 'No audio recorded',
        message: 'Please try recording again'
      });
    }
  });
  const audioPlayer = useAudioPlayerFixed();

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

  // Initialize progress tracking
  const initializeProgressTracking = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 [PROGRESS] Initializing progress tracking for user:', user.id);
      
      const response = await authenticatedFetch(API_ENDPOINTS.INITIALIZE_PROGRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PROGRESS] Progress tracking initialized successfully');
      } else {
        console.log('⚠️ [PROGRESS] Progress tracking initialization failed:', result.error);
      }
    } catch (error) {
      console.error('❌ [PROGRESS] Error initializing progress tracking:', error);
    }
  };

  // Load user progress
  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 [PROGRESS] Loading user progress for user:', user.id);
      
      const response = await authenticatedFetch(API_ENDPOINTS.GET_USER_PROGRESS(user.id));
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ [PROGRESS] User progress loaded successfully');
      } else {
        console.log('⚠️ [PROGRESS] Failed to load user progress:', result.error);
      }
    } catch (error) {
      console.error('❌ [PROGRESS] Error loading user progress:', error);
    }
  };

  // Load current question
  const loadCurrentQuestion = async () => {
    if (!user?.id || currentQuestion) return;
    
    try {
      console.log('🔄 [QUESTION] Loading current question for user:', user.id);
      
      const response = await authenticatedFetch(API_ENDPOINTS.GET_CURRENT_TOPIC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          stage_id: 4,
          exercise_id: 2,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const questionId = result.data.current_topic_id;
        console.log('✅ [QUESTION] Current question loaded:', questionId);
        setCurrentQuestionId(questionId);
        await loadQuestion(questionId);
      } else {
        console.log('⚠️ [QUESTION] Failed to load current question, starting with question 1');
        await loadQuestion(1);
      }
    } catch (error) {
      console.error('❌ [QUESTION] Error loading current question:', error);
      await loadQuestion(1);
    }
  };

  // Load total questions
  const loadTotalQuestions = async () => {
    if (totalQuestions > 0) return;
    
    try {
      console.log('🔄 [QUESTIONS] Loading total questions count');
      
      const response = await authenticatedFetch(API_ENDPOINTS.MOCK_INTERVIEWS);
      const result = await response.json();
      
      if (result.questions) {
        setTotalQuestions(result.questions.length);
        console.log('✅ [QUESTIONS] Total questions loaded:', result.questions.length);
      }
    } catch (error) {
      console.error('❌ [QUESTIONS] Error loading total questions:', error);
      setTotalQuestions(8); // Fallback
    }
  };

  // Load specific question
  const loadQuestion = async (questionId: number) => {
    try {
      setIsLoading(true);
      console.log('🔄 [QUESTION] Loading question with ID:', questionId);
      
      const response = await authenticatedFetch(API_ENDPOINTS.MOCK_INTERVIEW(questionId));
      const result = await response.json();
      
      if (response.ok) {
        setCurrentQuestion(result);
        console.log('✅ [QUESTION] Question loaded successfully:', result.question);
      } else {
        console.log('❌ [QUESTION] Failed to load question:', result.detail);
        Alert.alert('Error', 'Failed to load question. Please try again.');
      }
    } catch (error) {
      console.error('❌ [QUESTION] Error loading question:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Play question audio
  const playQuestionAudio = async () => {
    if (!currentQuestion || audioPlayer.state.isPlaying) return;

    console.log("🔄 [AUDIO] Playing question audio for ID:", currentQuestionId);
    try {
      setIsPlayingAudio(true);
      
      const response = await authenticatedFetch(`${BASE_API_URL}/api/mock-interview/${currentQuestionId}`, {
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
        Alert.alert('Error', 'Failed to play audio. Please try again.');
      }
    } catch (error) {
      console.error("❌ [AUDIO] Error playing audio:", error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Start thinking phase
  const startThinkingPhase = async () => {
    console.log('🔄 [THINKING] Starting thinking phase...');
    
    // Clear any existing timers
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    
    // Reset states
    setShowSpeakingTimer(false);
    setIsSpeakingPhase(false);
    setSpeakingTimeLeft(90);
    
    // Start thinking phase
    setShowThinkingTimer(true);
    setIsThinkingPhase(true);
    setThinkingTimeLeft(15);
    
    // Start thinking timer
    thinkingTimerRef.current = setInterval(() => {
      setThinkingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(thinkingTimerRef.current!);
          thinkingTimerRef.current = null;
          setShowThinkingTimer(false);
          setIsThinkingPhase(false);
          
          // Automatically start speaking phase after thinking
          setTimeout(() => {
            startSpeakingPhase();
          }, 500); // Small delay for smooth transition
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start speaking phase
  const startSpeakingPhase = async () => {
    console.log('🔄 [SPEAKING] Starting speaking phase...');
    
    // Clear any existing timers
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    
    // Start recording first
    try {
      await handleStartRecording();
    } catch (error) {
      console.error('❌ [SPEAKING] Failed to start recording:', error);
      return;
    }
    
    // Start speaking phase
    setShowSpeakingTimer(true);
    setIsSpeakingPhase(true);
    setSpeakingTimeLeft(90);
    
    // Start speaking timer
    speakingTimerRef.current = setInterval(() => {
      setSpeakingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(speakingTimerRef.current!);
          speakingTimerRef.current = null;
          setShowSpeakingTimer(false);
          setIsSpeakingPhase(false);
          
          // Automatically stop recording when time is up
          setTimeout(() => {
            handleStopRecording();
          }, 500); // Small delay for smooth transition
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording
  const handleStartRecording = async () => {
    try {
      console.log('🔄 [RECORD] Starting recording...');
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record your interview response.');
        return;
      }

      await audioRecorder.startRecording();
      setRecordingStartTime(Date.now());
      console.log('✅ [RECORD] Recording started');
    } catch (error) {
      console.error('❌ [RECORD] Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    try {
      console.log('🔄 [RECORD] Stopping recording...');
      
      // Clear speaking timer if it's running
      if (speakingTimerRef.current) {
        clearInterval(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
      
      // Reset speaking phase states
      setShowSpeakingTimer(false);
      setIsSpeakingPhase(false);
      
      const uri = await audioRecorder.stopRecording();
      const endTime = Date.now();
      
      if (recordingStartTime) {
        const timeSpentSeconds = Math.floor((endTime - recordingStartTime) / 1000);
        setTimeSpent(timeSpentSeconds);
        console.log('⏱️ [RECORD] Recording duration:', timeSpentSeconds, 'seconds');
      }
      
      if (uri) {
        console.log('✅ [RECORD] Recording stopped, processing audio...');
        await processRecording(uri);
      } else {
        console.log('❌ [RECORD] No recording URI received');
        Alert.alert('Error', 'No audio recorded. Please try again.');
      }
    } catch (error) {
      console.error('❌ [RECORD] Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  // Process recording
  const processRecording = async (audioUri: string) => {
    if (!currentQuestion || !user?.id) return;
    
    try {
      setIsEvaluating(true);
      setShowEvaluatingAnimation(true);
      console.log('🔄 [EVAL] Processing recording...');
      
      // Stop speaking timer and clear it when evaluation starts
      if (speakingTimerRef.current) {
        clearInterval(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
      setShowSpeakingTimer(false);
      setIsSpeakingPhase(false);
      
      // Start rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
      
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('📊 [EVAL] Audio file size:', audioBase64.length, 'characters');
      
      // Send for evaluation
      const response = await authenticatedFetch(API_ENDPOINTS.EVALUATE_MOCK_INTERVIEW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: audioBase64,
          question_id: currentQuestion.id,
          filename: `mock_interview_${currentQuestion.id}_${Date.now()}.m4a`,
          user_id: user.id,
          time_spent_seconds: timeSpent,
          urdu_used: false,
        }),
      });

      const result: EvaluationResult = await response.json();
      console.log('📊 [EVAL] Evaluation result:', result);
      
      if (result.success !== undefined) {
        setEvaluationResult(result);
        setShowEvaluatingAnimation(false);
        console.log('✅ [EVAL] Evaluation completed successfully');
        
        // Navigate to feedback screen
        router.push({
          pathname: '/(tabs)/practice/stage4/feedback_5' as any,
          params: {
            evaluationResult: JSON.stringify(result),
            currentQuestionId: currentQuestionId.toString(),
            totalQuestions: totalQuestions.toString(),
          }
        });
      } else {
        console.log('❌ [EVAL] Evaluation failed:', result.error);
        setShowEvaluatingAnimation(false);
        
        if (result.error === 'no_speech_detected') {
          Alert.alert(
            'No Speech Detected',
            'Please speak clearly and provide a complete interview response. Try again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', result.message || 'Failed to evaluate your response. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ [EVAL] Error processing recording:', error);
      setShowEvaluatingAnimation(false);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next question
  const moveToNextQuestion = () => {
    if (currentQuestionId < totalQuestions) {
      const nextQuestionId = currentQuestionId + 1;
      setCurrentQuestionId(nextQuestionId);
      setEvaluationResult(null);
      setShowFeedback(false);
      setTimeSpent(0);
      loadQuestion(nextQuestionId);
    } else {
      setIsExerciseCompleted(true);
      Alert.alert(
        'Congratulations! 🎉',
        'You\'ve completed all mock interview questions!',
        [{ text: 'Finish', onPress: () => router.back() }]
      );
    }
  };

  // Handle feedback return
  const handleFeedbackReturn = async () => {
    if (evaluationResult?.success) {
      await moveToNextQuestion();
    }
    setEvaluationResult(null);
    
    // Reset all state to initial values
    setShowFeedback(false);
    setShowEvaluatingAnimation(false);
    setIsEvaluating(false);
    setShowThinkingTimer(false);
    setShowSpeakingTimer(false);
    setIsThinkingPhase(false);
    setIsSpeakingPhase(false);
    setThinkingTimeLeft(15);
    setSpeakingTimeLeft(90);
    setTimeSpent(0);
    setRecordingStartTime(null);
    
    // Stop any ongoing animations
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
    
    // Clear any active timers
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    
    console.log('🔄 [RESET] All state reset to initial values');
  };

  // Animate button press
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

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      // Only initialize progress tracking and load user progress once
      if (!isProgressInitialized) {
        await initializeProgressTracking();
        await loadUserProgress();
        setIsProgressInitialized(true);
      }
      
      await loadTotalQuestions();
      
      // Check if we're coming back from feedback with next question
      if (params.nextQuestion === 'true' && params.currentQuestionId) {
        const nextQuestionId = parseInt(params.currentQuestionId as string);
        setCurrentQuestionId(nextQuestionId);
        await loadQuestion(nextQuestionId);
      } else if (!currentQuestion) {
        // Only load current question if we don't have a question loaded
        await loadCurrentQuestion();
      }
    };
    
    initialize();
  }, [params.nextQuestion, params.currentQuestionId]);

  // Handle feedback return from navigation
  useEffect(() => {
    const handleFeedbackReturn = async () => {
      if (params.evaluationResult) {
        const result = JSON.parse(params.evaluationResult as string);
        setEvaluationResult(result);
        if (result.success) {
          await moveToNextQuestion();
        }
      }
      
      // Reset all state to initial values when returning from feedback
      setShowFeedback(false);
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
      setShowThinkingTimer(false);
      setShowSpeakingTimer(false);
      setIsThinkingPhase(false);
      setIsSpeakingPhase(false);
      setThinkingTimeLeft(15);
      setSpeakingTimeLeft(90);
      setTimeSpent(0);
      setRecordingStartTime(null);
      
      // Stop any ongoing animations
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
      
      // Clear any active timers
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      if (speakingTimerRef.current) {
        clearInterval(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
      
      console.log('🔄 [RESET] All state reset to initial values from navigation');
    };
    
    if (params.evaluationResult && !showFeedback) {
      handleFeedbackReturn();
    }
  }, [params.evaluationResult]);

  // Update time spent during recording
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (audioRecorder.state.isRecording && recordingStartTime) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - recordingStartTime) / 1000);
        setTimeSpent(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [audioRecorder.state.isRecording, recordingStartTime]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Reset states when component unmounts
      setEvaluationResult(null);
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
      
      // Clear timers
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
      }
      if (speakingTimerRef.current) {
        clearInterval(speakingTimerRef.current);
      }
    };
  }, []);

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
            <TouchableOpacity onPress={() => router.push({ pathname: '/practice/stage4' })} style={styles.backButton}>
              <View style={styles.backButtonCircle}>
                <Ionicons name="arrow-back" size={24} color="#58D68D" />
              </View>
        </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.titleGradient}
              >
                <Ionicons name="business" size={32} color="#FFFFFF" />
              </LinearGradient>
        <Text style={styles.headerTitle}>Mock Interview</Text>
              <Text style={styles.headerSubtitle}>Professional Communication</Text>
              
              {/* Question Counter */}
              <Text style={styles.questionCounter}>
                Question: {currentQuestionId} of {totalQuestions}
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
                    Congratulations! You have successfully completed all Mock Interview exercises.
                  </Text>
                  <Text style={styles.completedText}>Great job on your professional communication skills!</Text>
                </View>
              ) : isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Loading interview question...</Text>
                </View>
              ) : currentQuestion ? (
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.questionContainer}>
                    {/* Interview Question */}
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                    
                    {/* Urdu Translation */}
                    <Text style={styles.urduText}>{currentQuestion.question_urdu}</Text>
                    
                    {/* Category and Difficulty */}
                    <View style={styles.metaContainer}>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaText}>{currentQuestion.category}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaText}>{currentQuestion.difficulty}</Text>
                      </View>
                    </View>
                    
                    {/* Expected Keywords */}
                    <View style={styles.keywordsContainer}>
                      <Text style={styles.keywordsTitle}>Key Words to Include:</Text>
                      <View style={styles.keywordsList}>
                        {currentQuestion.expected_keywords.map((keyword, index) => (
                          <View key={index} style={styles.keywordChip}>
                            <Text style={styles.keywordText}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Vocabulary Focus */}
                    <View style={styles.vocabularyContainer}>
                      <Text style={styles.vocabularyTitle}>Professional Vocabulary:</Text>
                      <View style={styles.vocabularyList}>
                        {currentQuestion.vocabulary_focus.map((vocab, index) => (
                          <View key={index} style={styles.vocabularyChip}>
                            <Text style={styles.vocabularyText}>{vocab}</Text>
                          </View>
                        ))}
                      </View>
      </View>

                    {/* Play Button */}
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={playQuestionAudio}
                      disabled={audioPlayer.state.isPlaying || audioRecorder.state.isRecording}
                    >
                      <LinearGradient
                        colors={["#58D68D", "#45B7A8"]}
                        style={styles.playButtonGradient}
                      >
                        <Ionicons 
                          name={audioPlayer.state.isPlaying ? 'volume-high' : 'play'} 
                          size={36} 
                          color="#fff" 
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <Text style={styles.instructionText}>
                      Listen to the question and prepare your professional response
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

          {/* Timer Display */}
          {(showThinkingTimer || showSpeakingTimer) && (
            <Animated.View
              style={[
                styles.timerContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={showThinkingTimer ? ['#F39C12', '#E67E22'] : ['#58D68D', '#45B7A8']}
                style={styles.timerGradient}
              >
                <Ionicons 
                  name={showThinkingTimer ? 'time-outline' : 'mic-outline'} 
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.timerText}>
                  {showThinkingTimer ? `Think: ${thinkingTimeLeft}s` : `Speak: ${speakingTimeLeft}s`}
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Action Button */}
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
              onPress={async () => {
                animateButtonPress();
                
                // Prevent actions during evaluation
                if (isEvaluating) {
                  console.log('⚠️ [BUTTON] Action blocked - evaluation in progress');
                  return;
                }
                
                // Allow stopping during speaking phase
                if (isSpeakingPhase || audioRecorder.state.isRecording) {
                  console.log('🔄 [BUTTON] Stopping recording...');
                  await handleStopRecording();
                  return;
                }
                
                // Prevent actions during thinking phase
                if (isThinkingPhase) {
                  console.log('⚠️ [BUTTON] Action blocked - thinking phase in progress');
                  return;
                }
                
                // Start interview process
                console.log('🔄 [BUTTON] Starting interview process...');
                await startThinkingPhase();
              }}
              disabled={isEvaluating || audioPlayer.state.isPlaying || isLoading || isExerciseCompleted}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isEvaluating ? ["#9B59B6", "#8E44AD"] :
                  isThinkingPhase ? ["#F39C12", "#E67E22"] :
                  isSpeakingPhase ? ["#FF6B6B", "#FF5252"] :
                  ["#58D68D", "#45B7A8"]
                }
                style={styles.speakButtonGradient}
              >
                <Ionicons 
                  name={
                    isEvaluating ? 'hourglass-outline' : 
                    isThinkingPhase ? 'time-outline' : 
                    isSpeakingPhase ? 'stop-outline' : 
                    'play-outline'
                  } 
                  size={24} 
                  color="#fff" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={styles.speakButtonText}>
                  {
                    isEvaluating ? 'Processing...' : 
                    isThinkingPhase ? 'Thinking...' : 
                    isSpeakingPhase ? 'Stop Recording' : 
                    'Start Interview'
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Evaluating Animation Overlay */}
        {showEvaluatingAnimation && (
          <View style={styles.evaluatingOverlay}>
            <View style={styles.animationContainer}>
              <Animated.View
                style={[
                  styles.rotatingIcon,
                  {
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="sync" size={64} color="#58D68D" />
              </Animated.View>
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
  questionCounter: {
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
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  urduText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  metaChip: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#58D68D',
  },
  metaText: {
    color: '#58D68D',
    fontSize: 12,
    fontWeight: '600',
  },
  keywordsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  keywordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: '#58D68D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  keywordText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  vocabularyContainer: {
    width: '100%',
    marginBottom: 24,
  },
  vocabularyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  vocabularyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  vocabularyChip: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vocabularyText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  playButton: {
    marginBottom: 24,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
  },
  timerContainer: {
    position: 'absolute',
    top: height * 0.4,
    alignSelf: 'center',
    zIndex: 100,
  },
  timerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonContainer: {
    width: '100%',
  },
  speakButton: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  speakButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  speakButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    paddingHorizontal: 20,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: height * 0.6,
  },
  rotatingIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
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

export default MockInterviewScreen; 