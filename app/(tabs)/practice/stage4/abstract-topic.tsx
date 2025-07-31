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
import BASE_API_URL from '../../../../config/api';

const { width, height } = Dimensions.get('window');

interface Topic {
  id: number;
  topic: string;
  topic_urdu: string;
  category: string;
  difficulty: string;
  speaking_duration: string;
  thinking_time: string;
  expected_structure: string;
  key_connectors: string[];
  key_connectors_urdu: string[];
  vocabulary_focus: string[];
  vocabulary_focus_urdu: string[];
  model_response: string;
  model_response_urdu: string;
  evaluation_criteria: any;
  learning_objectives: string[];
}

interface EvaluationResult {
  success: boolean;
  topic?: string;
  key_connectors?: string[];
  vocabulary_focus?: string[];
  user_text?: string;
  evaluation?: any;
  suggested_improvement?: string;
  error?: string;
  message?: string;
  progress_recorded?: boolean;
  unlocked_content?: string[];
  connector_matches?: string[];
  total_connectors?: number;
  matched_connectors_count?: number;
  vocabulary_matches?: string[];
  total_vocabulary?: number;
  matched_vocabulary_count?: number;
  fluency_score?: number;
  grammar_score?: number;
  lexical_richness_score?: number;
  opinion_clarity_score?: number;
  connector_usage_score?: number;
  response_type?: string;
  topic_title?: string;
  topic_category?: string;
}

const AbstractTopicScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Animation values - matching storytelling.tsx pattern
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [cardScaleAnim] = useState(new Animated.Value(0.8));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // State management
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState(1);
  const [totalTopics, setTotalTopics] = useState(5);
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
  const [showThinkingTimer, setShowThinkingTimer] = useState(false);
  const [thinkingTimeLeft, setThinkingTimeLeft] = useState(10);
  const [showSpeakingTimer, setShowSpeakingTimer] = useState(false);
  const [speakingTimeLeft, setSpeakingTimeLeft] = useState(90);
  const [isThinkingPhase, setIsThinkingPhase] = useState(false);
  const [isSpeakingPhase, setIsSpeakingPhase] = useState(false);
  
  // Audio hooks
  const audioRecorder = useAudioRecorder(90000, async (audioUri) => {
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered for abstract topic!');
    if (audioUri) {
      console.log('✅ [AUTO-STOP] Valid audio URI received, starting automatic evaluation...');
      await processRecording(audioUri);
    } else {
      console.log('⚠️ [AUTO-STOP] No valid audio URI from auto-stop');
      setEvaluationResult({
        success: false,
        topic: currentTopic?.topic || '',
        error: 'No audio recorded',
        message: 'Please try recording again'
      });
    }
  });
  
  const audioPlayer = useAudioPlayerFixed();
  
  // Timer refs
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Initialize progress tracking
  const initializeProgressTracking = async () => {
    console.log('🔄 [PROGRESS] Initializing progress tracking for Stage 4 Exercise 1...');
    if (!user?.id) {
      console.log('⚠️ [PROGRESS] No user ID available, skipping progress initialization');
      return;
    }
    
    try {
      await loadUserProgress();
      await loadCurrentTopic();
      setIsProgressInitialized(true);
      console.log('✅ [PROGRESS] Progress tracking initialized successfully');
    } catch (error) {
      console.error('❌ [PROGRESS] Error initializing progress tracking:', error);
    }
  };
  
  // Load user progress
  const loadUserProgress = async () => {
    console.log('🔄 [PROGRESS] Loading user progress...');
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${BASE_API_URL}/api/abstract-topic-progress/${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PROGRESS] User progress loaded successfully');
        console.log('📊 [PROGRESS] Topic progress:', result.topic_progress);
        console.log('📊 [PROGRESS] Overall progress:', result.overall_progress);
      } else {
        console.log('⚠️ [PROGRESS] Failed to load progress:', result.error);
      }
    } catch (error) {
      console.error('❌ [PROGRESS] Error loading user progress:', error);
    }
  };
  
  // Load current topic
  const loadCurrentTopic = async () => {
    console.log('🔄 [TOPIC] Loading current topic...');
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${BASE_API_URL}/api/abstract-topic-current-topic/${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        const topicId = result.current_topic_id;
        const totalTopics = result.total_topics;
        
        console.log(`✅ [TOPIC] Current topic ID: ${topicId}, Total topics: ${totalTopics}`);
        
        setCurrentTopicId(topicId);
        setTotalTopics(totalTopics);
        
        // Load the topic data
        await loadTopic(topicId);
      } else {
        console.log('⚠️ [TOPIC] Failed to load current topic:', result.error);
        // Fallback to topic 1
        await loadTopic(1);
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error loading current topic:', error);
      // Fallback to topic 1
      await loadTopic(1);
    }
  };
  
  // Load topic
  const loadTopic = async (topicId: number) => {
    console.log(`🔄 [TOPIC] Loading topic ${topicId}...`);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BASE_API_URL}/api/abstract-topics/${topicId}`);
      const topic = await response.json();
      
      if (topic.id) {
        setCurrentTopic(topic);
        console.log(`✅ [TOPIC] Topic loaded: ${topic.topic}`);
      } else {
        console.log('❌ [TOPIC] Invalid topic data received');
        Alert.alert('Error', 'Failed to load topic. Please try again.');
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error loading topic:', error);
      Alert.alert('Error', 'Failed to load topic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Play topic audio
  const playTopicAudio = async () => {
    if (!currentTopic) return;
    
    console.log('🔄 [AUDIO] Playing topic audio...');
    setIsPlayingAudio(true);
    
    try {
      const response = await fetch(`${BASE_API_URL}/api/abstract-topic/${currentTopic.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic_id: currentTopic.id }),
      });
      
      const result = await response.json();
      
      if (result.audio_base64) {
        const audioUri = `data:audio/mpeg;base64,${result.audio_base64}`;
        await audioPlayer.loadAudio(audioUri);
        await audioPlayer.playAudio();
        console.log('✅ [AUDIO] Topic audio played successfully');
      }
    } catch (error) {
      console.error('❌ [AUDIO] Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
    } finally {
      setIsPlayingAudio(false);
    }
  };
  
  // Start thinking phase
  const startThinkingPhase = () => {
    console.log('🔄 [THINKING] Starting thinking phase...');
    setIsThinkingPhase(true);
    setShowThinkingTimer(true);
    setThinkingTimeLeft(10);
    
    // Start pulse animation for thinking phase
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    thinkingTimerRef.current = setInterval(() => {
      setThinkingTimeLeft((prev) => {
        if (prev <= 1) {
          // Thinking phase complete, start speaking phase
          clearInterval(thinkingTimerRef.current!);
          setShowThinkingTimer(false);
          setIsThinkingPhase(false);
          pulseAnim.stopAnimation();
          pulseAnim.setValue(1);
          startSpeakingPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Start speaking phase
  const startSpeakingPhase = () => {
    console.log('🔄 [SPEAKING] Starting speaking phase...');
    setIsSpeakingPhase(true);
    setShowSpeakingTimer(true);
    setSpeakingTimeLeft(90);
    
    // Start recording automatically
    handleStartRecording();
    
    speakingTimerRef.current = setInterval(() => {
      setSpeakingTimeLeft((prev) => {
        if (prev <= 1) {
          // Speaking phase complete, stop recording
          clearInterval(speakingTimerRef.current!);
          setShowSpeakingTimer(false);
          setIsSpeakingPhase(false);
          handleStopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle start recording
  const handleStartRecording = async () => {
    console.log('🔄 [RECORDING] Starting recording...');
    setRecordingStartTime(Date.now());
    
    try {
      await audioRecorder.startRecording();
      console.log('✅ [RECORDING] Recording started successfully');
    } catch (error) {
      console.error('❌ [RECORDING] Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };
  
  // Handle stop recording
  const handleStopRecording = async () => {
    console.log('🔄 [RECORDING] Stopping recording...');
    
    try {
      const audioUri = await audioRecorder.stopRecording();
      if (audioUri) {
        console.log('✅ [RECORDING] Recording stopped successfully');
        await processRecording(audioUri);
      } else {
        console.log('⚠️ [RECORDING] No audio URI received');
        setEvaluationResult({
          success: false,
          topic: currentTopic?.topic || '',
          error: 'No audio recorded',
          message: 'Please try recording again'
        });
      }
    } catch (error) {
      console.error('❌ [RECORDING] Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };
  
  // Process recording
  const processRecording = async (audioUri: string) => {
    console.log('🔄 [PROCESSING] Processing recording...');
    setIsEvaluating(true);
    setShowEvaluatingAnimation(true);
    
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    
    try {
      // Calculate time spent
      const endTime = Date.now();
      const timeSpentSeconds = recordingStartTime ? Math.floor((endTime - recordingStartTime) / 1000) : 0;
      setTimeSpent(timeSpentSeconds);
      
      console.log(`📊 [PROCESSING] Time spent: ${timeSpentSeconds} seconds`);
      
      // Convert audio to base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('📊 [PROCESSING] Audio converted to base64');
      
      // Send for evaluation
      const response = await fetch(`${BASE_API_URL}/api/evaluate-abstract-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: audioBase64,
          topic_id: currentTopicId,
          filename: 'abstract_topic_recording.wav',
          user_id: user?.id || '',
          time_spent_seconds: timeSpentSeconds,
          urdu_used: false,
        }),
      });
      
      const result = await response.json();
      console.log('📊 [PROCESSING] Evaluation result:', result);
      
      if (result.success) {
        setEvaluationResult(result);
        console.log('✅ [PROCESSING] Evaluation completed successfully');
      } else {
        setEvaluationResult({
          success: false,
          topic: currentTopic?.topic || '',
          error: result.error || 'evaluation_failed',
          message: result.message || 'Failed to evaluate response'
        });
        console.log('❌ [PROCESSING] Evaluation failed:', result.error);
      }
    } catch (error) {
      console.error('❌ [PROCESSING] Error processing recording:', error);
      setEvaluationResult({
        success: false,
        topic: currentTopic?.topic || '',
        error: 'processing_failed',
        message: 'Failed to process recording. Please try again.'
      });
    } finally {
      setIsEvaluating(false);
      setShowEvaluatingAnimation(false);
      // Stop rotation animation
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  };
  
  // Move to next topic
  const moveToNextTopic = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 [NAVIGATION] Getting next topic from backend...');
      
      // Get the current topic from backend (which should be the next topic after completion)
      const response = await fetch(`${BASE_API_URL}/api/abstract-topic-current-topic/${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        const nextTopicId = result.current_topic_id;
        const totalTopics = result.total_topics;
        
        console.log(`✅ [NAVIGATION] Next topic ID: ${nextTopicId}, Total topics: ${totalTopics}`);
        
        if (nextTopicId <= totalTopics) {
          setCurrentTopicId(nextTopicId);
          setTotalTopics(totalTopics);
          await loadTopic(nextTopicId);
          console.log('🔄 [NAVIGATION] Moving to next topic:', nextTopicId);
        } else {
          console.log('🎉 [NAVIGATION] All topics completed!');
          setIsExerciseCompleted(true);
        }
      } else {
        console.log('❌ [NAVIGATION] Failed to get next topic:', result.error);
        // Fallback: increment manually
        if (currentTopicId < totalTopics) {
          const nextId = currentTopicId + 1;
          setCurrentTopicId(nextId);
          await loadTopic(nextId);
        } else {
          setIsExerciseCompleted(true);
        }
      }
    } catch (error) {
      console.error('❌ [NAVIGATION] Error moving to next topic:', error);
      // Fallback: increment manually
      if (currentTopicId < totalTopics) {
        const nextId = currentTopicId + 1;
        setCurrentTopicId(nextId);
        await loadTopic(nextId);
      } else {
        setIsExerciseCompleted(true);
      }
    }
  };
  
  // Handle feedback return
  const handleFeedbackReturn = async () => {
    if (evaluationResult?.success) {
      await moveToNextTopic();
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
    setThinkingTimeLeft(10);
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
  };
  
  // Start exercise
  const startExercise = () => {
    console.log('🔄 [EXERCISE] Starting abstract topic exercise...');
    startThinkingPhase();
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
  
  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      console.log('🔄 [INIT] Initializing Abstract Topic Screen...');
      
      // Start animations
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
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(cardScaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Initialize progress tracking
      await initializeProgressTracking();
      
      console.log('✅ [INIT] Abstract Topic Screen initialized successfully');
    };
    
    initialize();
    
    // Cleanup timers on unmount
    return () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
      }
      if (speakingTimerRef.current) {
        clearInterval(speakingTimerRef.current);
      }
    };
  }, []);
  
  // Handle feedback return from navigation
  useEffect(() => {
    const handleFeedbackReturn = async () => {
      if (params.evaluationResult) {
        const result = JSON.parse(params.evaluationResult as string);
        setEvaluationResult(result);
        if (result.success) {
          await moveToNextTopic();
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
      setThinkingTimeLeft(10);
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
    };
    
    handleFeedbackReturn();
  }, [params.evaluationResult]);
  
  // Navigate to feedback screen
  useEffect(() => {
    if (evaluationResult && !showFeedback) {
      setShowFeedback(true);
      const feedbackData = JSON.stringify(evaluationResult);
      router.push({
        pathname: '/practice/stage4/feedback_4',
        params: { evaluationResult: feedbackData }
      });
    }
  }, [evaluationResult, showFeedback]);
  
  // Show exercise completion
  if (isExerciseCompleted) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.completionContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.completionCard}
            >
              <View style={styles.completionIcon}>
                <Ionicons name="trophy" size={80} color="#58D68D" />
              </View>
              <Text style={styles.completionTitle}>🎉 Exercise Completed!</Text>
              <Text style={styles.completionSubtitle}>
                Congratulations! You have completed all abstract topics in Stage 4 Exercise 1.
              </Text>
              <Text style={styles.completionText}>
                Great job on mastering abstract topic monologues!
              </Text>
              <TouchableOpacity
                style={styles.completionButton}
                onPress={() => router.back()}
              >
                <LinearGradient
                  colors={['#58D68D', '#45B7A8']}
                  style={styles.completionButtonGradient}
                >
                  <Text style={styles.completionButtonText}>Return to Stage 4</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
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
                <Ionicons name="bulb" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Abstract Topic</Text>
              <Text style={styles.headerSubtitle}>Express Your Opinions</Text>
              
              {/* Topic Counter */}
              <Text style={styles.topicCounter}>
                Topic: {currentTopicId} of {totalTopics}
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
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Loading abstract topic...</Text>
                </View>
              ) : currentTopic ? (
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Timer Display */}
                  {showThinkingTimer && (
                    <Animated.View 
                      style={[
                        styles.timerContainer,
                        { transform: [{ scale: pulseAnim }] }
                      ]}
                    >
                      <LinearGradient
                        colors={['#FF6B6B', '#FF5252']}
                        style={styles.timerGradient}
                      >
                        <Text style={styles.timerLabel}>Thinking Time</Text>
                        <Text style={styles.timerText}>{thinkingTimeLeft}s</Text>
                      </LinearGradient>
                    </Animated.View>
                  )}
                  
                  {showSpeakingTimer && (
                    <View style={styles.timerContainer}>
                      <LinearGradient
                        colors={['#58D68D', '#45B7A8']}
                        style={styles.timerGradient}
                      >
                        <Text style={styles.timerLabel}>Speaking Time</Text>
                        <Text style={styles.timerText}>{speakingTimeLeft}s</Text>
                      </LinearGradient>
                    </View>
                  )}

                  {/* Topic Content */}
                  {!showThinkingTimer && !showSpeakingTimer && (
                    <View style={styles.topicContainer}>
                      {/* Topic Text */}
                      <Text style={styles.topicText}>{currentTopic.topic}</Text>
                      
                      {/* Urdu Translation */}
                      <Text style={styles.urduText}>{currentTopic.topic_urdu}</Text>
                      
                      {/* Key Connectors */}
                      <View style={styles.connectorsContainer}>
                        <Text style={styles.connectorsTitle}>Key Connectors:</Text>
                        <View style={styles.connectorsList}>
                          {currentTopic.key_connectors.slice(0, 4).map((connector, index) => (
                            <View key={index} style={styles.connectorChip}>
                              <Text style={styles.connectorText}>{connector}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      {/* Vocabulary Focus */}
                      <View style={styles.vocabularyContainer}>
                        <Text style={styles.vocabularyTitle}>Vocabulary Focus:</Text>
                        <View style={styles.vocabularyList}>
                          {currentTopic.vocabulary_focus.slice(0, 4).map((word, index) => (
                            <View key={index} style={styles.vocabularyChip}>
                              <Text style={styles.vocabularyText}>{word}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      {/* Play Button */}
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={playTopicAudio}
                        disabled={audioPlayer.state.isPlaying || audioRecorder.state.isRecording}
                      >
                        <LinearGradient
                          colors={["#58D68D", "#45B7A8"]}
                          style={styles.playButtonGradient}
                        >
                                                  <Ionicons 
                          name={audioPlayer.state.isPlaying ? 'volume-high' : 'play'} 
                          size={40} 
                          color="#fff" 
                        />
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <Text style={styles.instructionText}>
                        Listen to the topic and express your opinion for 60-90 seconds
                      </Text>
                    </View>
                  )}
                  
                  {/* Recording State */}
                  {isSpeakingPhase && (
                    <View style={styles.recordingContainer}>
                      <View style={styles.recordingIndicator}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingText}>Recording your response...</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              ) : (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorText}>Failed to load topic</Text>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

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
            {!isThinkingPhase && !isSpeakingPhase && !isEvaluating && (
              <TouchableOpacity
                style={[
                  styles.speakButton,
                  {
                    shadowColor: audioRecorder.state.isRecording ? '#FF6B6B' : '#45B7A8',
                  }
                ]}
                onPress={() => {
                  animateButtonPress();
                  startExercise();
                }}
                disabled={audioPlayer.state.isPlaying || isLoading || isExerciseCompleted}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#58D68D", "#45B7A8"]}
                  style={styles.speakButtonGradient}
                >
                  <Ionicons 
                    name="mic-outline" 
                    size={24} 
                    color="#fff" 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={styles.speakButtonText}>Start Exercise</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {isSpeakingPhase && (
              <TouchableOpacity
                style={[
                  styles.speakButton,
                  {
                    shadowColor: '#FF6B6B',
                  }
                ]}
                onPress={() => {
                  animateButtonPress();
                  handleStopRecording();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FF6B6B", "#FF5252"]}
                  style={styles.speakButtonGradient}
                >
                  <Ionicons 
                    name="stop-outline" 
                    size={24} 
                    color="#fff" 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={styles.speakButtonText}>Stop Recording</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        {/* Evaluating Animation Overlay */}
        {showEvaluatingAnimation && (
          <View style={styles.evaluatingOverlay}>
            <View style={styles.animationContainer}>
              <Animated.View 
                style={[
                  styles.evaluatingIcon,
                  {
                    transform: [{
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }]
                  }
                ]}
              >
                <Ionicons name="sync" size={80} color="#FFFFFF" />
              </Animated.View>
            </View>
            <View style={styles.evaluatingTextContainer}>
              <Text style={styles.evaluatingTitle}>Evaluating...</Text>
              <Text style={styles.evaluatingSubtitle}>Analyzing your response</Text>
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerGradient: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  topicText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  urduText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  connectorsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  connectorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  connectorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  connectorChip: {
    backgroundColor: '#58D68D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  connectorText: {
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
    backgroundColor: '#45B7A8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vocabularyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  playButton: {
    marginBottom: 24,
  },
  playButtonGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  recordingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
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
  evaluatingIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  evaluatingSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completionCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  completionIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#58D68D',
    marginBottom: 12,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  completionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AbstractTopicScreen; 