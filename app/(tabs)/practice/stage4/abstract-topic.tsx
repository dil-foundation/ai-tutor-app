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
import { API_ENDPOINTS } from '../../../../config/api';
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
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  
  // Audio hooks - matching storytelling.tsx pattern
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

  // Initialize progress tracking - matching storytelling.tsx pattern
  const initializeProgressTracking = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 [PROGRESS] Initializing progress tracking for user:', user.id);
      
      const response = await authenticatedFetch(API_ENDPOINTS.INITIALIZE_PROGRESS, {
        method: 'POST',
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

  // Load user progress - matching storytelling.tsx pattern
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

  // Load current topic - matching storytelling.tsx pattern
  const loadCurrentTopic = async () => {
    if (!user?.id || currentTopic) return; // Skip if we already have a topic
    
    try {
      console.log('🔄 [TOPIC] Loading current topic for user:', user.id);
      
      const response = await authenticatedFetch(API_ENDPOINTS.GET_CURRENT_TOPIC, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          stage_id: 4,
          exercise_id: 1,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const topicId = result.data.current_topic_id;
        console.log('✅ [TOPIC] Current topic loaded:', topicId);
        setCurrentTopicId(topicId);
        await loadTopic(topicId);
      } else {
        console.log('⚠️ [TOPIC] Failed to load current topic, starting with topic 1');
        await loadTopic(1);
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error loading current topic:', error);
      await loadTopic(1);
    }
  };

  // Load total topics - matching storytelling.tsx pattern
  const loadTotalTopics = async () => {
    // Only load if we don't already have the total topics
    if (totalTopics > 0) return;
    
    try {
      console.log('🔄 [TOPICS] Loading total topics count');
      
      const response = await authenticatedFetch(API_ENDPOINTS.ABSTRACT_TOPICS);
      const result = await response.json();
      
      if (result.topics) {
        setTotalTopics(result.topics.length);
        console.log('✅ [TOPICS] Total topics loaded:', result.topics.length);
      }
    } catch (error) {
      console.error('❌ [TOPICS] Error loading total topics:', error);
      setTotalTopics(5); // Fallback
    }
  };

  // Load specific topic - matching storytelling.tsx pattern
  const loadTopic = async (topicId: number) => {
    try {
      setIsLoading(true);
      console.log('🔄 [TOPIC] Loading topic with ID:', topicId);
      
      const response = await authenticatedFetch(API_ENDPOINTS.ABSTRACT_TOPIC(topicId));
      const result = await response.json();
      
      if (response.ok) {
        setCurrentTopic(result);
        console.log('✅ [TOPIC] Topic loaded successfully:', result.topic);
        
        // Audio will be loaded when play button is clicked
      } else {
        console.log('❌ [TOPIC] Failed to load topic:', result.detail);
        Alert.alert('Error', 'Failed to load topic. Please try again.');
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error loading topic:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Play topic audio - matching storytelling.tsx pattern
  const playTopicAudio = async () => {
    console.log("🎯 [AUDIO] playTopicAudio function called");
    console.log("📊 [AUDIO] Current topic:", currentTopic ? "exists" : "null");
    console.log("📊 [AUDIO] Audio player state:", audioPlayer.state.isPlaying ? "playing" : "not playing");
    
    if (!currentTopic) {
      console.log("❌ [AUDIO] No current topic available");
      return;
    }
    
    if (audioPlayer.state.isPlaying) {
      console.log("❌ [AUDIO] Audio already playing");
      return;
    }

    console.log("🔄 [AUDIO] Playing topic audio for ID:", currentTopicId);
    console.log("🔗 [AUDIO] Using endpoint:", API_ENDPOINTS.ABSTRACT_TOPIC_AUDIO(currentTopicId));
    
    try {
      setIsPlayingAudio(true);
      
      const response = await authenticatedFetch(API_ENDPOINTS.ABSTRACT_TOPIC_AUDIO(currentTopicId), {
        method: 'POST'
      });

      console.log("📡 [AUDIO] Response status:", response.status);
      console.log("📡 [AUDIO] Response ok:", response.ok);
      
      const result = await response.json();
      console.log("📊 [AUDIO] Audio response received:", result);

      if (response.ok && result.audio_base64) {
        console.log("✅ [AUDIO] Audio base64 received, length:", result.audio_base64.length);
        const audioUri = `data:audio/mpeg;base64,${result.audio_base64}`;
        console.log("🔄 [AUDIO] Loading audio into player...");
        await audioPlayer.loadAudio(audioUri);
        console.log("🔄 [AUDIO] Playing audio...");
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

  // Start recording - matching storytelling.tsx pattern
  const handleStartRecording = async () => {
    try {
      console.log('🔄 [RECORD] Starting recording...');
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record your response.');
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

  // Stop recording - matching storytelling.tsx pattern
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

  // Process recording - matching storytelling.tsx pattern
  const processRecording = async (audioUri: string) => {
    if (!currentTopic || !user?.id) return;
    
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
      const response = await authenticatedFetch(API_ENDPOINTS.EVALUATE_ABSTRACT_TOPIC, {
        method: 'POST',
        body: JSON.stringify({
          audio_base64: audioBase64,
          topic_id: currentTopic.id,
          filename: `abstract_topic_${currentTopic.id}_${Date.now()}.m4a`,
          user_id: user.id,
          time_spent_seconds: timeSpent,
          urdu_used: false,
        }),
      });

      const result: EvaluationResult = await response.json();
      console.log('📊 [EVAL] Evaluation result:', result);
      
      if (result.success) {
        setEvaluationResult(result);
        setShowEvaluatingAnimation(false);
        console.log('✅ [EVAL] Evaluation completed successfully');
        
        // Navigate to feedback screen
        router.push({
          pathname: '/(tabs)/practice/stage4/feedback_4',
          params: {
            evaluationResult: JSON.stringify(result),
            currentTopicId: currentTopicId.toString(),
            totalTopics: totalTopics.toString(),
          }
        });
      } else {
        console.log('❌ [EVAL] Evaluation failed:', result.error);
        setShowEvaluatingAnimation(false);
        
        if (result.error === 'no_speech_detected') {
          Alert.alert(
            'No Speech Detected',
            'Please speak clearly and express your opinion. Try again.',
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

  // Move to next topic - matching storytelling.tsx pattern
  const moveToNextTopic = () => {
    if (currentTopicId < totalTopics) {
      const nextTopicId = currentTopicId + 1;
      setCurrentTopicId(nextTopicId);
      setEvaluationResult(null);
      setShowFeedback(false);
      setTimeSpent(0);
      loadTopic(nextTopicId);
    } else {
      setIsExerciseCompleted(true);
      Alert.alert(
        'Congratulations! 🎉',
        'You\'ve completed all abstract topics!',
        [{ text: 'Finish', onPress: handleBackPress }]
      );
    }
  };

  // Handle navigation back from feedback screen - matching storytelling.tsx pattern
  const handleFeedbackReturn = () => {
    // Reset evaluation result when returning from feedback
    setEvaluationResult(null);
    
    // Check if we should move to next topic
    if (evaluationResult && evaluationResult.evaluation?.score >= 80) {
      moveToNextTopic();
    }
  };

  // Animate button press - matching storytelling.tsx pattern
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

  // Initialize on mount - matching storytelling.tsx pattern
  useEffect(() => {
    const initialize = async () => {
      // Only initialize progress tracking and load user progress once
      if (!isProgressInitialized) {
        await initializeProgressTracking();
        await loadUserProgress();
        setIsProgressInitialized(true);
      }
      
      await loadTotalTopics();
      
      // Check if we're coming back from feedback with next topic
      if (params.nextTopic === 'true' && params.currentTopicId) {
        const nextTopicId = parseInt(params.currentTopicId as string);
        setCurrentTopicId(nextTopicId);
        await loadTopic(nextTopicId);
      } else if (!currentTopic) {
        // Only load current topic if we don't have a topic loaded
        await loadCurrentTopic();
      }
    };
    
    initialize();
  }, [params.nextTopic, params.currentTopicId]);

  // Update time spent during recording - matching storytelling.tsx pattern
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

  // Cleanup effect when component unmounts - matching storytelling.tsx pattern
  useEffect(() => {
    return () => {
      // Only stop audio if we're actually navigating away
      if (isNavigatingAway && audioPlayer.state.isPlaying) {
        console.log('🔄 [CLEANUP] Stopping audio playback due to navigation');
        audioPlayer.stopAudio();
      }
      // Reset states when component unmounts
      setEvaluationResult(null);
      setShowEvaluatingAnimation(false);
      setIsEvaluating(false);
    };
  }, [audioPlayer, isNavigatingAway]);

  // Handle back button press
  const handleBackPress = () => {
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
              {isExerciseCompleted ? (
                <View style={styles.completedContainer}>
                  <Ionicons name="trophy" size={64} color="#58D68D" />
                  <Text style={styles.completedTitle}>🎉 Exercise Completed!</Text>
                  <Text style={styles.completedText}>
                    Congratulations! You have successfully completed all Abstract Topic exercises.
                  </Text>
                  <Text style={styles.completedText}>Great job on your progress!</Text>
                </View>
              ) : isLoading ? (
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
                      onPress={() => {
                        console.log("🎯 [UI] Play button clicked!");
                        playTopicAudio();
                      }}
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
                      Listen to the topic and express your opinion for 60-90 seconds
                    </Text>
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
                  {isEvaluating ? 'Processing...' : audioRecorder.state.isRecording ? 'Recording' : 'Express Opinion'}
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

export default AbstractTopicScreen; 