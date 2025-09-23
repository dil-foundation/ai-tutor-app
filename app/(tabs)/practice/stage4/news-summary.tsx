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

interface NewsItem {
  id: number;
  title: string;
  title_urdu: string;
  summary_text: string;
  summary_text_urdu: string;
  category: string;
  difficulty: string;
  listening_duration: string;
  summary_time: string;
  expected_structure: string;
  expected_keywords: string[];
  expected_keywords_urdu: string[];
  vocabulary_focus: string[];
  vocabulary_focus_urdu: string[];
  model_summary: string;
  model_summary_urdu: string;
  evaluation_criteria: any;
  learning_objectives: string[];
}

interface EvaluationResult {
  success: boolean;
  news_title?: string;
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
  exercise_completion?: {
    exercise_completed: boolean;
    progress_percentage: number;
    completed_topics: number;
    total_topics: number;
  };
}

const NewsSummaryScreen = () => {
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
  const [currentNewsItem, setCurrentNewsItem] = useState<NewsItem | null>(null);
  const [currentNewsId, setCurrentNewsId] = useState(1);
  const [totalNewsItems, setTotalNewsItems] = useState(10);
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
  const audioRecorder = useAudioRecorder(90000, async (audioUri) => {
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered!');
    if (audioUri) {
      console.log('✅ [AUTO-STOP] Valid audio URI received, starting automatic evaluation...');
      await processRecording(audioUri);
    } else {
      console.log('⚠️ [AUTO-STOP] No valid audio URI from auto-stop');
      setEvaluationResult({
        success: false,
        news_title: currentNewsItem?.title || '',
        error: 'No audio recorded',
        message: 'Please try recording again'
      });
    }
  });
  const audioPlayer = useAudioPlayerFixed();

  // Animation effects - matching storytelling.tsx
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
        // Handle progress data if needed
      } else {
        console.log('⚠️ [PROGRESS] Failed to load user progress:', result.error);
      }
    } catch (error) {
      console.error('❌ [PROGRESS] Error loading user progress:', error);
    }
  };

  // Load current topic
  const loadCurrentTopic = async () => {
    if (!user?.id || currentNewsItem) return; // Skip if we already have a news item
    
    try {
      console.log('🔄 [TOPIC] Loading current topic for user:', user.id);
      
      const response = await authenticatedFetch(API_ENDPOINTS.GET_CURRENT_TOPIC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          stage_id: 4,
          exercise_id: 3,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const topicId = result.data.current_topic_id;
        console.log('✅ [TOPIC] Current topic loaded:', topicId);
        setCurrentNewsId(topicId);
        await loadNewsItem(topicId);
      } else {
        console.log('⚠️ [TOPIC] Failed to load current topic, starting with news item 1');
        await loadNewsItem(1);
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error loading current topic:', error);
      await loadNewsItem(1);
    }
  };

  // Load total news items
  const loadTotalNewsItems = async () => {
    // Only load if we don't already have the total news items
    if (totalNewsItems > 0) return;
    
    try {
      console.log('🔄 [NEWS] Loading total news items count');
      
      const response = await authenticatedFetch(API_ENDPOINTS.NEWS_SUMMARIES);
      const result = await response.json();
      
      if (result.news_items) {
        setTotalNewsItems(result.news_items.length);
        console.log('✅ [NEWS] Total news items loaded:', result.news_items.length);
      }
    } catch (error) {
      console.error('❌ [NEWS] Error loading total news items:', error);
      setTotalNewsItems(10); // Fallback
    }
  };

  // Load specific news item
  const loadNewsItem = async (newsId: number) => {
    try {
      setIsLoading(true);
      console.log('🔄 [NEWS] Loading news item with ID:', newsId);
      
      const response = await authenticatedFetch(API_ENDPOINTS.NEWS_SUMMARY(newsId));
      const result = await response.json();
      
      if (response.ok) {
        setCurrentNewsItem(result);
        console.log('✅ [NEWS] News item loaded successfully:', result.title);
        
        // Audio will be loaded when play button is clicked
      } else {
        console.log('❌ [NEWS] Failed to load news item:', result.detail);
        Alert.alert('Error', 'Failed to load news item. Please try again.');
      }
    } catch (error) {
      console.error('❌ [NEWS] Error loading news item:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Play news audio
  const playNewsAudio = async () => {
    if (!currentNewsItem || audioPlayer.state.isPlaying || isAudioLoading) return;

    console.log("🔄 [AUDIO] Playing news audio for ID:", currentNewsId);
    setIsAudioLoading(true);
    try {
      
      const response = await authenticatedFetch(`${BASE_API_URL}/api/news-summary/${currentNewsId}`, {
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
      setIsAudioLoading(false);
    }
  };

  // Start recording
  const handleStartRecording = async () => {
    try {
      console.log('🔄 [RECORD] Starting recording...');
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record your summary.');
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
    if (!currentNewsItem || !user?.id) return;
    
    try {
      setIsEvaluating(true);
      setShowEvaluatingAnimation(true);
      console.log('🔄 [EVAL] Processing recording...');
      
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('📊 [EVAL] Audio file size:', audioBase64.length, 'characters');
      
      // Send for evaluation
      const response = await authenticatedFetch(API_ENDPOINTS.EVALUATE_NEWS_SUMMARY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: audioBase64,
          news_id: currentNewsItem.id,
          filename: `news_summary_${currentNewsItem.id}_${Date.now()}.m4a`,
          user_id: user.id,
          time_spent_seconds: timeSpent,
          urdu_used: false,
        }),
      });

      const result: EvaluationResult = await response.json();
      console.log('📊 [EVAL] Evaluation result:', result);
      
      if (result.success) {
        setEvaluationResult(result);
        console.log('✅ [EVAL] Evaluation completed successfully');

        if (result.exercise_completion?.exercise_completed) {
          setIsExerciseCompleted(true);
          // Directly show completion alert and navigate back
          Alert.alert(
            'Congratulations!',
            'You have successfully completed all News Summary exercises.',
            [{ text: 'OK', onPress: () => router.push('/(tabs)/practice/stage4') }]
          );
          // Hide the animation as we are navigating away
          setShowEvaluatingAnimation(false);
          setIsEvaluating(false);
        } else {
          // Keep evaluation animation visible until navigation
          // The animation will be hidden when the component unmounts during navigation
          console.log('🔄 [EVAL] Keeping evaluation animation visible while navigating to feedback page...');
          console.log('🔄 [EVAL] Navigation will automatically hide the animation overlay');
          
          // Navigate to feedback screen
          router.push({
            pathname: '/(tabs)/practice/stage4/feedback_6' as any,
            params: {
              evaluationResult: JSON.stringify(result),
              currentNewsId: currentNewsId.toString(),
              totalNewsItems: totalNewsItems.toString(),
            }
          });
        }
      } else {
        console.log('❌ [EVAL] Evaluation failed:', result.error);
        setShowEvaluatingAnimation(false);
        
        if (result.error === 'no_speech_detected') {
          Alert.alert(
            'No Speech Detected',
            'Please speak clearly and provide a complete summary. Try again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', result.message || 'Failed to evaluate your summary. Please try again.');
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

  // Move to next news item
  const moveToNextNewsItem = () => {
    if (currentNewsId < totalNewsItems) {
      const nextNewsId = currentNewsId + 1;
      setCurrentNewsId(nextNewsId);
      setEvaluationResult(null);
      setShowFeedback(false);
      setTimeSpent(0);
      loadNewsItem(nextNewsId);
    } else {
      setIsExerciseCompleted(true);
      Alert.alert(
        'Congratulations! 🎉',
        'You\'ve completed all news summary challenges!',
        [{ text: 'Finish', onPress: () => router.back() }]
      );
    }
  };

  // Handle navigation back from feedback screen
  const handleFeedbackReturn = () => {
    // Reset evaluation result when returning from feedback
    setEvaluationResult(null);
    
    // Note: We don't automatically move to next news item here
    // The feedback screen handles navigation based on user actions
  };

  // Animate button press - matching storytelling.tsx
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
      // Reset evaluation states on component mount to ensure clean state
      console.log('🔄 [INIT] Component mounting, resetting evaluation states');
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
      setEvaluationResult(null);
      setTimeSpent(0);
      
      // Only initialize progress tracking and load user progress once
      if (!isProgressInitialized) {
        await initializeProgressTracking();
        await loadUserProgress();
        setIsProgressInitialized(true);
      }
      
      await loadTotalNewsItems();
      
      // Check if we're coming back from feedback with next news item
      if (params.nextNewsItem === 'true' && params.currentNewsId) {
        const nextNewsId = parseInt(params.currentNewsId as string);
        setCurrentNewsId(nextNewsId);
        await loadNewsItem(nextNewsId);
      } else if (!currentNewsItem) {
        // Only load current topic if we don't have a news item loaded
        await loadCurrentTopic();
      }
    };
    
    initialize();
  }, [params.nextNewsItem, params.currentNewsId, isProgressInitialized, currentNewsItem]);

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
    router.push({ pathname: '/practice/stage4' });
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
                <Ionicons name="newspaper" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>News Summary</Text>
              <Text style={styles.headerSubtitle}>Listen & Summarize</Text>
              
              {/* News Item Counter */}
              <Text style={styles.topicCounter}>
                News: {currentNewsId} of {totalNewsItems}
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
                    Congratulations! You have successfully completed all News Summary challenges.
                  </Text>
                  <Text style={styles.completedText}>Great job on your progress!</Text>
                </View>
              ) : isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Loading news item...</Text>
                </View>
              ) : currentNewsItem ? (
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.newsContainer}>
                    {/* News Title */}
                    <Text style={styles.newsTitle}>{currentNewsItem.title}</Text>
                    
                    {/* Urdu Translation */}
                    <Text style={styles.urduText}>{currentNewsItem.title_urdu}</Text>
                    
                    {/* News Summary Text */}
                    <View style={styles.summaryContainer}>
                      <Text style={styles.summaryTitle}>News Summary:</Text>
                      <Text style={styles.summaryText}>{currentNewsItem.summary_text}</Text>
                      <Text style={styles.summaryTextUrdu}>{currentNewsItem.summary_text_urdu}</Text>
                    </View>
                    
                    {/* Expected Keywords */}
                    <View style={styles.keywordsContainer}>
                      <Text style={styles.keywordsTitle}>Key Words to Include:</Text>
                      <View style={styles.keywordsList}>
                        {currentNewsItem.expected_keywords.map((keyword, index) => (
                          <View key={index} style={styles.keywordChip}>
                            <Text style={styles.keywordText}>
                              {currentNewsItem.expected_keywords[index]}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Vocabulary Focus */}
                    <View style={styles.vocabularyContainer}>
                      <Text style={styles.vocabularyTitle}>Vocabulary Focus:</Text>
                      <View style={styles.vocabularyList}>
                        {currentNewsItem.vocabulary_focus.map((word, index) => (
                          <View key={index} style={styles.vocabularyChip}>
                            <Text style={styles.vocabularyText}>
                              {currentNewsItem.vocabulary_focus[index]}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Play Button */}
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={playNewsAudio}
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
                      Listen to the news and provide a clear summary in 3-5 sentences
                    </Text>
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorText}>Failed to load news item</Text>
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
                disabled={isEvaluating || audioPlayer.state.isPlaying || isLoading || isExerciseCompleted}
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
                    {isEvaluating ? 'Processing...' : audioRecorder.state.isRecording ? 'Recording' : 'Summarize News'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
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
  newsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  newsTitle: {
    fontSize: 22,
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
  summaryContainer: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  summaryTextUrdu: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontStyle: 'italic',
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

export default NewsSummaryScreen; 