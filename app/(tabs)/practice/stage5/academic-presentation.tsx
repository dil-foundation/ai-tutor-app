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
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../../context/AuthContext';
import { useAudioRecorder, useAudioPlayerFixed } from '../../../../hooks';
import BASE_API_URL, { API_ENDPOINTS } from '../../../../config/api';
import { authenticatedFetch } from '../../../../utils/authUtils';
import LottieView from 'lottie-react-native';

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
  topic?: string;
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
  argument_structure_score?: number;
  academic_tone_score?: number;
}

const AcademicPresentationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Animation values - matching storytelling.tsx pattern
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [cardScaleAnim] = useState(new Animated.Value(0.8));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  
  // State management
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState(1);
  const [totalTopics, setTotalTopics] = useState(7);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showEvaluatingAnimation, setShowEvaluatingAnimation] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isExerciseCompleted, setIsExerciseCompleted] = useState(false);
  const [isProgressInitialized, setIsProgressInitialized] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  
  // Audio hooks
  const audioRecorder = useAudioRecorder(180000, async (audioUri) => { // 3 minutes max
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered!');
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

  // Initialize progress tracking
  const initializeProgressTracking = async () => {
    console.log('🔄 [PROGRESS] Initializing progress tracking...');
    if (!user?.id) {
      console.log('⚠️ [PROGRESS] No user ID available, skipping progress initialization');
      return;
    }

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.INITIALIZE_PROGRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          stage_id: 5,
          exercise_id: 2
        }),
      });

      if (response.ok) {
        console.log('✅ [PROGRESS] Progress tracking initialized successfully');
      } else {
        console.log('⚠️ [PROGRESS] Failed to initialize progress tracking');
      }
    } catch (error) {
      console.log('❌ [PROGRESS] Error initializing progress tracking:', error);
    }
  };

  // Load user progress
  const loadUserProgress = async () => {
    console.log('🔄 [PROGRESS] Loading user progress...');
    if (!user?.id) {
      console.log('⚠️ [PROGRESS] No user ID available, skipping progress load');
      return;
    }

    try {
      const response = await authenticatedFetch(`${BASE_API_URL}/api/progress/user-progress/${user.id}/5/2`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [PROGRESS] User progress loaded:', data);
        
        // Set current topic based on progress
        if (data.current_topic_id) {
          setCurrentTopicId(data.current_topic_id);
        }
        
        // Check if exercise is completed
        if (data.completed_topics && data.completed_topics.length >= totalTopics) {
          setIsExerciseCompleted(true);
        }
      } else {
        console.log('⚠️ [PROGRESS] Failed to load user progress');
      }
    } catch (error) {
      console.log('❌ [PROGRESS] Error loading user progress:', error);
    }
  };

  // Load current topic
  const loadCurrentTopic = async () => {
    console.log('🔄 [TOPIC] Loading current topic...');
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.ACADEMIC_PRESENTATION(currentTopicId));
      if (response.ok) {
        const topicData = await response.json();
        console.log('✅ [TOPIC] Topic loaded:', topicData);
        setCurrentTopic(topicData);
      } else {
        console.log('❌ [TOPIC] Failed to load topic');
        Alert.alert('Error', 'Failed to load presentation topic');
      }
    } catch (error) {
      console.log('❌ [TOPIC] Error loading topic:', error);
      Alert.alert('Error', 'Failed to load presentation topic');
    }
  };

  // Load total topics
  const loadTotalTopics = async () => {
    console.log('🔄 [TOPICS] Loading total topics count...');
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.ACADEMIC_PRESENTATIONS);
      if (response.ok) {
        const data = await response.json();
        setTotalTopics(data.topics.length);
        console.log('✅ [TOPICS] Total topics count:', data.topics.length);
      } else {
        console.log('⚠️ [TOPICS] Failed to load topics count');
      }
    } catch (error) {
      console.log('❌ [TOPICS] Error loading topics count:', error);
    }
  };

  // Load topic
  const loadTopic = async (topicId: number) => {
    console.log(`🔄 [TOPIC] Loading topic ${topicId}...`);
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.ACADEMIC_PRESENTATION(topicId));
      if (response.ok) {
        const topicData = await response.json();
        console.log('✅ [TOPIC] Topic loaded:', topicData);
        setCurrentTopic(topicData);
        setCurrentTopicId(topicId);
      } else {
        console.log('❌ [TOPIC] Failed to load topic');
        Alert.alert('Error', 'Failed to load presentation topic');
      }
    } catch (error) {
      console.log('❌ [TOPIC] Error loading topic:', error);
      Alert.alert('Error', 'Failed to load presentation topic');
    }
  };

  // Play topic audio
  const playTopicAudio = async () => {
    console.log('🔄 [AUDIO] Playing topic audio...');
    if (!currentTopic || audioPlayer.state.isPlaying || isAudioLoading) {
      console.log('❌ [AUDIO] No current topic, audio already playing, or audio loading');
      return;
    }

    setIsAudioLoading(true);
    try {
      const response = await authenticatedFetch(`${BASE_API_URL}/api/academic-presentation/${currentTopic.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [AUDIO] Audio data received');
        
        const audioUri = `data:audio/mpeg;base64,${data.audio_base64}`;
        
        console.log('✅ [AUDIO] Audio file saved to:', audioUri);
        
        // Play the audio
        await audioPlayer.loadAudio(audioUri);
        await audioPlayer.playAudio();
        
      } else {
        console.log('❌ [AUDIO] Failed to get audio data');
        Alert.alert('Error', 'Failed to play topic audio');
      }
    } catch (error) {
      console.log('❌ [AUDIO] Error playing audio:', error);
      Alert.alert('Error', 'Failed to play topic audio');
    } finally {
      setIsAudioLoading(false);
    }
  };

  // Handle start recording
  const handleStartRecording = async () => {
    console.log('🔄 [RECORD] Starting recording...');
    try {
      await audioRecorder.startRecording();
      setRecordingStartTime(Date.now());
      console.log('✅ [RECORD] Recording started successfully');
    } catch (error) {
      console.log('❌ [RECORD] Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  // Handle stop recording
  const handleStopRecording = async () => {
    console.log('🔄 [RECORD] Stopping recording...');
    try {
      const audioUri = await audioRecorder.stopRecording();
      setRecordingStartTime(null);
      console.log('✅ [RECORD] Recording stopped, audio URI:', audioUri);
      
      if (audioUri) {
        await processRecording(audioUri);
      }
    } catch (error) {
      console.log('❌ [RECORD] Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // Process recording
  const processRecording = async (audioUri: string) => {
    console.log('🔄 [PROCESS] Processing recording...');
    setIsEvaluating(true);
    setShowEvaluatingAnimation(true);
    
    try {
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('✅ [PROCESS] Audio converted to base64');
      
      // Calculate time spent
      const timeSpent = recordingStartTime ? Math.floor((Date.now() - recordingStartTime) / 1000) : 0;
      setTimeSpent(timeSpent);
      
      // Send for evaluation
      const response = await authenticatedFetch(API_ENDPOINTS.EVALUATE_ACADEMIC_PRESENTATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: audioBase64,
          topic_id: currentTopicId,
          filename: `academic_presentation_${currentTopicId}.mp3`,
          user_id: user?.id || '',
          time_spent_seconds: timeSpent,
          urdu_used: false, // Academic presentations should be in English
        }),
      });
      
      const result = await response.json();
      console.log('✅ [PROCESS] Evaluation result received:', result);
      
      setEvaluationResult(result);
      console.log('✅ [EVAL] Evaluation completed successfully');
      
      // Keep evaluation animation visible until navigation
      // The animation will be hidden when the component unmounts during navigation
      console.log('🔄 [EVAL] Keeping evaluation animation visible while navigating to feedback page...');
      console.log('🔄 [EVAL] Navigation will automatically hide the animation overlay');
      
      if (result.success) {
        // Navigate to feedback screen
        router.push({
          pathname: '/(tabs)/practice/stage5/feedback_8' as any,
          params: {
            evaluationResult: JSON.stringify(result),
            currentTopicId: currentTopicId.toString(),
            totalTopics: totalTopics.toString(),
          }
        });
      } else {
        // Show error message
        Alert.alert('Evaluation Error', result.message || 'Failed to evaluate presentation');
      }
      
    } catch (error) {
      console.log('❌ [PROCESS] Error processing recording:', error);
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
      Alert.alert('Error', 'Failed to process recording');
    }
  };

  // Move to next topic
  const moveToNextTopic = () => {
    console.log('🔄 [TOPIC] Moving to next topic...');
    if (currentTopicId < totalTopics) {
      const nextTopicId = currentTopicId + 1;
      console.log(`✅ [TOPIC] Moving to topic ${nextTopicId}`);
      loadTopic(nextTopicId);
    } else {
      console.log('✅ [TOPIC] All topics completed');
      setIsExerciseCompleted(true);
    }
  };

  // Handle feedback return
  const handleFeedbackReturn = () => {
    console.log('🔄 [FEEDBACK] Returning from feedback...');
    setEvaluationResult(null);
    setShowFeedback(false);
    
    // Check if we should move to next topic
    if (evaluationResult?.evaluation?.completed) {
      moveToNextTopic();
    }
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
      console.log('🔄 [INIT] Initializing Academic Presentation screen...');
      
      // Reset evaluation states on component mount to ensure clean state
      console.log('🔄 [INIT] Component mounting, resetting evaluation states');
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
      setEvaluationResult(null);
      setTimeSpent(0);
      
      // Initialize progress tracking
      await initializeProgressTracking();
      
      // Load total topics count
      await loadTotalTopics();
      
      // Load user progress
      await loadUserProgress();
      
      // Load current topic
      await loadCurrentTopic();
      
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
        Animated.timing(cardScaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
      
      setIsLoading(false);
      setIsProgressInitialized(true);
      console.log('✅ [INIT] Academic Presentation screen initialized');
    };

    initialize();
  }, []);

  // Add focus listener to reset evaluation states when component comes back into focus
  // This handles cases where user navigates back from feedback page or other screens
  // and ensures the evaluation animation doesn't persist
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [FOCUS] Component is now in focus. Resetting evaluation states.');
      
      // Reset all evaluation-related states
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
      setEvaluationResult(null);
      setTimeSpent(0);
      
      // Also check if we have any feedback-related parameters that indicate a return
      if (params.returnFromFeedback || params.tryAgain || params.evaluationResult) {
        console.log('🔄 [FOCUS] Detected feedback return parameters, ensuring clean state');
        // Clear any evaluation-related parameters
        setShowEvaluatingAnimation(false);
        setIsEvaluating(false);
      }
    }, [params.returnFromFeedback, params.tryAgain, params.evaluationResult])
  );

  // Handle next prompt from params
  useEffect(() => {
    if (params.nextTopic === 'true' && isProgressInitialized) {
      console.log('🔄 [PARAMS] Next topic requested from params');
      const nextTopicId = parseInt(params.currentTopicId as string) || currentTopicId + 1;
      loadTopic(nextTopicId);
    }
  }, [params, isProgressInitialized]);

  // Timer effect for recording
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
      // Only stop audio if we're actually navigating away
      if (isNavigatingAway && audioPlayer.state.isPlaying) {
        console.log('🔄 [CLEANUP] Stopping audio playback due to navigation');
        audioPlayer.stopAudio();
      }
      
      // Reset states when component unmounts
      // Note: Don't hide evaluation animation when navigating to feedback page
      // It will be hidden automatically when the component unmounts during navigation
      setEvaluationResult(null);
      setIsEvaluating(false);
    };
  }, [audioPlayer, isNavigatingAway]);

  // Handle back button press
  const handleBackPress = () => {
    // Prevent navigation back during evaluation
    if (isEvaluating || showEvaluatingAnimation) {
      console.log('🎯 [NAVIGATION] Back button pressed during evaluation - ignoring');
      return;
    }
    
    console.log('🎯 [NAVIGATION] Back button pressed, stopping audio if playing');
    if (audioPlayer.state.isPlaying) {
      audioPlayer.stopAudio();
    }
    setIsNavigatingAway(true);
    router.push({ pathname: '/practice/stage5' });
  };

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
                <Ionicons name="school" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Academic Presentation</Text>
              <Text style={styles.headerSubtitle}>Deliver Professional Speeches</Text>
              
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
              {isExerciseCompleted ? (
                <View style={styles.completedContainer}>
                  <Ionicons name="trophy" size={64} color="#58D68D" />
                  <Text style={styles.completedTitle}>🎉 Exercise Completed!</Text>
                  <Text style={styles.completedText}>
                    Congratulations! You have successfully completed all Academic Presentation exercises.
                  </Text>
                  <Text style={styles.completedText}>Excellent work on your professional speaking skills!</Text>
                </View>
              ) : isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Loading presentation topic...</Text>
                </View>
              ) : currentTopic ? (
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.topicContainer}>
                    {/* Presentation Topic */}
                    <Text style={styles.topicText}>{currentTopic.topic}</Text>
                    
                    {/* Urdu Translation */}
                    <Text style={styles.urduText}>{currentTopic.topic_urdu}</Text>
                    
                    {/* Expected Structure */}
                    <View style={styles.structureContainer}>
                      <Text style={styles.structureTitle}>Expected Structure:</Text>
                      <Text style={styles.structureText}>{currentTopic.expected_structure}</Text>
                    </View>
                    
                    {/* Expected Keywords */}
                    <View style={styles.keywordsContainer}>
                      <Text style={styles.keywordsTitle}>Key Concepts to Include:</Text>
                      <View style={styles.keywordsList}>
                        {currentTopic.expected_keywords.map((keyword, index) => (
                          <View key={index} style={styles.keywordChip}>
                            <Text style={styles.keywordText}>
                              {currentTopic.expected_keywords[index]}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Vocabulary Focus */}
                    <View style={styles.vocabularyContainer}>
                      <Text style={styles.vocabularyTitle}>Academic Vocabulary Focus:</Text>
                      <View style={styles.vocabularyList}>
                        {currentTopic.vocabulary_focus.map((vocab, index) => (
                          <View key={index} style={styles.vocabularyChip}>
                            <Text style={styles.vocabularyText}>
                              {currentTopic.vocabulary_focus[index]}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Play Button */}
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={playTopicAudio}
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
                      Listen to the topic and deliver a 3-minute academic presentation
                    </Text>
                    
                    {/* Time Display */}
                    {audioRecorder.state.isRecording && (
                      <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>
                          {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                        </Text>
                        <Text style={styles.timeLabel}>Recording Time</Text>
                      </View>
                    )}
                  </View>
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
              disabled={isEvaluating || audioPlayer.state.isPlaying || isLoading || isExerciseCompleted || isAudioLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={audioRecorder.state.isRecording ? ["#FF6B6B", "#FF5252"] : ["#58D68D", "#45B7A8"]}
                style={styles.speakButtonGradient}
              >
                <Ionicons 
                  name={isEvaluating ? 'hourglass-outline' : audioRecorder.state.isRecording ? 'stop-outline' : 'mic-outline'} 
                  size={24} 
                  color="#fff" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={styles.speakButtonText}>
                  {isEvaluating ? 'Processing...' : audioRecorder.state.isRecording ? 'Recording' : 'Start Presentation'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Evaluating Animation Overlay */}
        {showEvaluatingAnimation && (
          <View style={styles.evaluatingOverlay}>
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
  topicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  topicText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  urduText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  structureContainer: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#58D68D',
  },
  structureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  structureText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
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
    backgroundColor: '#45B7A8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    marginBottom: 16,
  },
  timeContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
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

export default AcademicPresentationScreen; 