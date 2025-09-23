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
  category: string;
  difficulty: string;
  topic_type: string;
  controversy_level: string;
  expected_structure: string;
  expected_keywords: string[];
  vocabulary_focus: string[];
  academic_expressions: string[];
  model_response: string;
  evaluation_criteria: any;
}

interface EvaluationResult {
  success: boolean;
  topic?: string;
  expected_keywords?: string[];
  vocabulary_focus?: string[];
  academic_expressions?: string[];
  user_text?: string;
  evaluation?: any;
  suggested_improvement?: string;
  error?: string;
  message?: string;
  progress_recorded?: boolean;
  unlocked_content?: string[];
  keyword_matches?: number;
  total_keywords?: number;
  academic_expressions_used?: number;
  total_academic_expressions?: number;
  exercise_completion?: {
    exercise_completed: boolean;
    progress_percentage: number;
    completed_topics: number;
    total_topics: number;
  };
}

const CriticalOpinionBuilderScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [cardScaleAnim] = useState(new Animated.Value(0.8));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  
  // State management
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState(1);
  const [totalTopics, setTotalTopics] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showEvaluatingAnimation, setShowEvaluatingAnimation] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isExerciseCompleted, setIsExerciseCompleted] = useState(false);
  const [isProgressInitialized, setIsProgressInitialized] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  
  // Audio hooks
  const audioRecorder = useAudioRecorder(30000, async (audioUri) => {
    if (audioUri) {
      await processRecording(audioUri);
    }
  });
  const audioPlayer = useAudioPlayerFixed();

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(cardScaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  // Initialize progress tracking
  const initializeProgressTracking = async () => {
    if (!user?.id) return;
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.INITIALIZE_PROGRESS, {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id }),
      });
      const result = await response.json();
      if (result.success) {
        console.log('✅ [PROGRESS] Progress tracking initialized');
      }
    } catch (error) {
      console.error('❌ [PROGRESS] Error:', error);
    }
  };

  // Load current topic
  const loadCurrentTopic = async () => {
    if (!user?.id || currentTopic) return;
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.GET_CURRENT_TOPIC, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          stage_id: 6,
          exercise_id: 3,
        }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        const topicId = result.data.current_topic_id;
        setCurrentTopicId(topicId);
        await loadTopic(topicId);
      } else {
        await loadTopic(1);
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error:', error);
      await loadTopic(1);
    }
  };

  // Load total topics
  const loadTotalTopics = async () => {
    if (totalTopics > 0) return;
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.CRITICAL_OPINION_TOPICS);
      const result = await response.json();
      if (result.topics) {
        setTotalTopics(result.topics.length);
      }
    } catch (error) {
      console.error('❌ [TOPICS] Error:', error);
      setTotalTopics(10);
    }
  };

  // Load specific topic
  const loadTopic = async (topicId: number) => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(API_ENDPOINTS.CRITICAL_OPINION_TOPIC(topicId));
      const result = await response.json();
      if (response.ok) {
        setCurrentTopic(result);
      } else {
        Alert.alert('Error', 'Failed to load topic. Please try again.');
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Play topic audio
  const playTopicAudio = async () => {
    if (!currentTopic || audioPlayer.state.isPlaying || isAudioLoading) return;
    setIsAudioLoading(true);
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.CRITICAL_OPINION_BUILDER(currentTopicId), {
        method: 'POST'
      });
      const result = await response.json();
      if (response.ok && result.audio_base64) {
        const audioUri = `data:audio/mpeg;base64,${result.audio_base64}`;
        await audioPlayer.loadAudio(audioUri);
        await audioPlayer.playAudio();
      } else {
        Alert.alert('Error', 'Failed to play audio. Please try again.');
      }
    } catch (error) {
      console.error("❌ [AUDIO] Error:", error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsAudioLoading(false);
    }
  };

  // Start recording
  const handleStartRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission.');
        return;
      }
      await audioRecorder.startRecording();
      setRecordingStartTime(Date.now());
    } catch (error) {
      console.error('❌ [RECORD] Error:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    try {
      const uri = await audioRecorder.stopRecording();
      const endTime = Date.now();
      if (recordingStartTime) {
        const timeSpentSeconds = Math.floor((endTime - recordingStartTime) / 1000);
        setTimeSpent(timeSpentSeconds);
      }
      if (uri) {
        await processRecording(uri);
      } else {
        Alert.alert('Error', 'No audio recorded. Please try again.');
      }
    } catch (error) {
      console.error('❌ [RECORD] Error:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  // Process recording
  const processRecording = async (audioUri: string) => {
    if (!currentTopic || !user?.id) return;
    try {
      setIsEvaluating(true);
      setShowEvaluatingAnimation(true);
      
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const response = await authenticatedFetch(API_ENDPOINTS.EVALUATE_CRITICAL_OPINION, {
        method: 'POST',
        body: JSON.stringify({
          audio_base64: audioBase64,
          topic_id: currentTopic.id,
          filename: `critical_opinion_${currentTopic.id}_${Date.now()}.m4a`,
          user_id: user.id,
          time_spent_seconds: timeSpent,
          urdu_used: false,
        }),
      });

      const result: EvaluationResult = await response.json();
      
      if (result.success) {
        setEvaluationResult(result);
        console.log('✅ [EVAL] Evaluation completed successfully');

        if (result.exercise_completion?.exercise_completed) {
          setIsExerciseCompleted(true);
          // Directly show completion alert and navigate back
          Alert.alert(
            'Congratulations!',
            'You have successfully completed all Critical Opinion Builder exercises.',
            [{ text: 'OK', onPress: () => router.push('/(tabs)/practice/stage6') }]
          );
          // Hide the animation as we are navigating away
          setShowEvaluatingAnimation(false);
          setIsEvaluating(false);
        } else {
          // Keep evaluation animation visible until navigation
          // The animation will be hidden when the component unmounts during navigation
          console.log('🔄 [EVAL] Keeping evaluation animation visible while navigating to feedback page...');
          console.log('🔄 [EVAL] Navigation will automatically hide the animation overlay');
          
          router.push({
            pathname: '/(tabs)/practice/stage6/feedback_12',
            params: {
              evaluationResult: JSON.stringify(result),
              currentTopicId: currentTopicId.toString(),
              totalTopics: totalTopics.toString(),
            }
          });
        }
      } else {
        setShowEvaluatingAnimation(false);
        if (result.error === 'no_speech_detected') {
          Alert.alert('No Speech Detected', 'Please speak clearly and provide a complete opinion.');
        } else {
          Alert.alert('Error', result.message || 'Failed to evaluate your opinion.');
        }
      }
    } catch (error) {
      console.error('❌ [EVAL] Error:', error);
      setShowEvaluatingAnimation(false);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      // Reset evaluation states on component mount to ensure clean state
      console.log('🔄 [INIT] Component mounting, resetting evaluation states');
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
      setEvaluationResult(null);
      setTimeSpent(0);
      
      if (!isProgressInitialized) {
        await initializeProgressTracking();
        setIsProgressInitialized(true);
      }
      
      await loadTotalTopics();
      
      if (params.nextTopic === 'true' && params.currentTopicId) {
        const nextTopicId = parseInt(params.currentTopicId as string);
        setCurrentTopicId(nextTopicId);
        await loadTopic(nextTopicId);
      } else if (!currentTopic) {
        await loadCurrentTopic();
      }
    };
    
    initialize();
  }, [params.nextTopic, params.currentTopicId]);

  // Reset evaluation states when component comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [FOCUS] Component is now in focus. Resetting evaluation states.');
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
      setEvaluationResult(null);
      setTimeSpent(0);
      if (params.returnFromFeedback || params.tryAgain || params.evaluationResult) {
        console.log('🔄 [FOCUS] Detected feedback return parameters, ensuring clean state');
        setShowEvaluatingAnimation(false);
        setIsEvaluating(false);
      }
    }, [params.returnFromFeedback, params.tryAgain, params.evaluationResult])
  );

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
      // Only stop audio if we're actually navigating away
      if (isNavigatingAway && audioPlayer.state.isPlaying) {
        console.log('🔄 [CLEANUP] Stopping audio playback due to navigation');
        audioPlayer.stopAudio();
      }
      
      // Reset states when component unmounts
      // Note: Don't hide evaluation animation when navigating to feedback page
      // It will be hidden automatically when the component unmounts during navigation
      setEvaluationResult(null);
      // setShowEvaluatingAnimation(false); // Removed this line
      setIsEvaluating(false);
    };
  }, [audioPlayer, isNavigatingAway]);

  // Handle back button press
  const handleBackPress = () => {
    if (isEvaluating || showEvaluatingAnimation) {
      console.log('🎯 [NAVIGATION] Back button pressed during evaluation - ignoring');
      return;
    }
    console.log('🎯 [NAVIGATION] Back button pressed, stopping audio if playing');
    if (audioPlayer.state.isPlaying) {
      audioPlayer.stopAudio();
    }
    setIsNavigatingAway(true);
    router.push({ pathname: '/practice/stage6' });
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <View style={styles.backButtonCircle}>
                <Ionicons name="arrow-back" size={24} color="#58D68D" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <LinearGradient colors={['#58D68D', '#45B7A8']} style={styles.titleGradient}>
                <Ionicons name="bulb" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Critical Opinion Builder</Text>
              <Text style={styles.headerSubtitle}>Build Strong Arguments</Text>
              <Text style={styles.topicCounter}>Topic: {currentTopicId} of {totalTopics}</Text>
            </View>
          </Animated.View>

          {/* Main Content Card */}
          <Animated.View style={[styles.mainCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: cardScaleAnim }] }]}>
            <LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']} style={styles.mainCardGradient}>
              {isExerciseCompleted ? (
                <View style={styles.completedContainer}>
                  <Ionicons name="trophy" size={64} color="#58D68D" />
                  <Text style={styles.completedTitle}>🎉 Exercise Completed!</Text>
                  <Text style={styles.completedText}>Congratulations! You have successfully completed all Critical Opinion Builder exercises.</Text>
                </View>
              ) : isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Loading topic...</Text>
                </View>
              ) : currentTopic ? (
                <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.topicContainer}>
                    <Text style={styles.topicText}>{currentTopic.topic}</Text>
                    
                    <View style={styles.structureContainer}>
                      <Text style={styles.structureTitle}>Expected Structure:</Text>
                      <Text style={styles.structureText}>{currentTopic.expected_structure}</Text>
                    </View>
                    
                    <View style={styles.keywordsContainer}>
                      <Text style={styles.keywordsTitle}>Key Words to Include:</Text>
                      <View style={styles.keywordsList}>
                        {currentTopic.expected_keywords.map((keyword, index) => (
                          <View key={index} style={styles.keywordChip}>
                            <Text style={styles.keywordText}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.expressionsContainer}>
                      <Text style={styles.expressionsTitle}>Academic Expressions:</Text>
                      <View style={styles.expressionsList}>
                        {currentTopic.academic_expressions.map((expression, index) => (
                          <View key={index} style={styles.expressionChip}>
                            <Text style={styles.expressionText}>{expression}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity style={styles.playButton} onPress={playTopicAudio} disabled={isAudioLoading || audioPlayer.state.isPlaying || audioRecorder.state.isRecording}>
                      <LinearGradient colors={["#58D68D", "#45B7A8"]} style={styles.playButtonGradient}>
                        {isAudioLoading ? (
                          <ActivityIndicator size="large" color="#FFFFFF" />
                        ) : (
                          <Ionicons name={audioPlayer.state.isPlaying ? 'volume-high' : 'play'} size={36} color="#fff" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <Text style={styles.instructionText}>Listen to the topic and provide your critical opinion</Text>
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
          {!isExerciseCompleted && (
            <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: buttonScaleAnim }] }]}>
              <TouchableOpacity
                style={[styles.voiceButton, { shadowColor: audioRecorder.state.isRecording ? '#FF6B6B' : '#45B7A8' }]}
                onPress={() => {
                  if (audioRecorder.state.isRecording) {
                    handleStopRecording();
                  } else {
                    handleStartRecording();
                  }
                }}
                disabled={isEvaluating || audioPlayer.state.isPlaying || isLoading || isExerciseCompleted}
                activeOpacity={0.8}
              >
                <LinearGradient colors={audioRecorder.state.isRecording ? ["#FF6B6B", "#FF5252"] : ["#58D68D", "#45B7A8"]} style={styles.voiceButtonGradient}>
                  <Ionicons name={isEvaluating ? 'hourglass-outline' : audioRecorder.state.isRecording ? 'stop-outline' : 'mic-outline'} size={24} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.voiceButtonText}>
                    {isEvaluating ? 'Processing...' : audioRecorder.state.isRecording ? 'Recording' : 'Voice Opinion'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Evaluating Animation Overlay */}
        {/* This animation will continue showing until navigation to the feedback page */}
        {/* The animation will be automatically hidden when the component unmounts during navigation */}
        {/* When returning from feedback page, the animation state is automatically reset */}
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
  gradient: { flex: 1 },
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
  scrollContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
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
  structureContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
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
  expressionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  expressionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  expressionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  expressionChip: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expressionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  playButton: {
    marginBottom: 20,
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
  buttonContainer: {
    width: '100%',
  },
  voiceButton: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  voiceButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  voiceButtonText: {
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

export default CriticalOpinionBuilderScreen; 