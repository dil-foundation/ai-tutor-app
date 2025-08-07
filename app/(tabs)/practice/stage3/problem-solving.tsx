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
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface Scenario {
  id: number;
  title: string;
  title_urdu: string;
  problem_description: string;
  problem_description_urdu: string;
  difficulty: string;
  category: string;
  scenario_type: string;
  context: string;
  context_urdu: string;
  expected_keywords: string[];
  expected_keywords_urdu: string[];
  polite_phrases: string[];
  polite_phrases_urdu: string[];
  sample_responses: string[];
  sample_responses_urdu: string[];
  evaluation_criteria: any;
  learning_objectives: string[];
}

interface EvaluationResult {
  success: boolean;
  problem_description?: string;
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
  response_type?: string;
  scenario_title?: string;
  scenario_context?: string;
}

const ProblemSolvingScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Animation values - matching storytelling.tsx pattern
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [cardScaleAnim] = useState(new Animated.Value(0.8));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // State management
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentScenarioId, setCurrentScenarioId] = useState(1);
  const [totalScenarios, setTotalScenarios] = useState(5);
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
  
  // Audio hooks
  const audioRecorder = useAudioRecorder(20000, async (audioUri) => {
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered!');
    if (audioUri) {
      console.log('✅ [AUTO-STOP] Valid audio URI received, starting automatic evaluation...');
      await processRecording(audioUri);
    } else {
      console.log('⚠️ [AUTO-STOP] No valid audio URI from auto-stop');
      setEvaluationResult({
        success: false,
        problem_description: currentScenario?.problem_description || '',
        error: 'No audio recorded',
        message: 'Please try recording again'
      });
    }
  });

  const audioPlayer = useAudioPlayerFixed();

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
        setIsProgressInitialized(true);
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
        
        // Check if exercise is completed
        const topicProgress = await authenticatedFetch(`${BASE_API_URL}/api/problem-solving-progress/${user.id}`);
        const topicResult = await topicProgress.json();
        
        if (topicResult.success && topicResult.topic_progress) {
          const completedScenarios = topicResult.topic_progress.filter((topic: any) => topic.completed);
          console.log('✅ [PROGRESS] Completed scenarios:', completedScenarios.length);
          
          if (completedScenarios.length >= totalScenarios) {
            setIsExerciseCompleted(true);
            console.log('🎉 [PROGRESS] Exercise completed!');
          }
        }
      } else {
        console.log('⚠️ [PROGRESS] Failed to load user progress:', result.error);
      }
    } catch (error) {
      console.error('❌ [PROGRESS] Error loading user progress:', error);
    }
  };

  // Load current topic
  const loadCurrentTopic = async () => {
    if (!user?.id || currentScenario) return; // Skip if we already have a scenario
    
    try {
      console.log('🔄 [TOPIC] Loading current topic for user:', user.id);
      
      const response = await authenticatedFetch(`${BASE_API_URL}/api/problem-solving-current-topic/${user.id}`);

      const result = await response.json();
      
      if (result.success) {
        const topicId = result.current_topic_id;
        console.log('✅ [TOPIC] Current topic loaded:', topicId);
        setCurrentScenarioId(topicId);
        await loadScenario(topicId);
      } else {
        console.log('⚠️ [TOPIC] Failed to load current topic, starting with scenario 1');
        await loadScenario(1);
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error loading current topic:', error);
      await loadScenario(1);
    }
  };

  // Load total scenarios
  const loadTotalScenarios = async () => {
    // Only load if we don't already have the total scenarios
    if (totalScenarios > 0) return;
    
    try {
      console.log('🔄 [SCENARIOS] Loading total scenarios count');
      
      const response = await authenticatedFetch(API_ENDPOINTS.PROBLEM_SOLVING_SCENARIOS);
      const result = await response.json();
      
      if (result.scenarios) {
        setTotalScenarios(result.scenarios.length);
        console.log('✅ [SCENARIOS] Total scenarios loaded:', result.scenarios.length);
      }
    } catch (error) {
      console.error('❌ [SCENARIOS] Error loading total scenarios:', error);
      setTotalScenarios(5); // Fallback
    }
  };

  // Load specific scenario
  const loadScenario = async (scenarioId: number) => {
    try {
      setIsLoading(true);
      console.log('🔄 [SCENARIO] Loading scenario with ID:', scenarioId);
      
      const response = await authenticatedFetch(API_ENDPOINTS.PROBLEM_SOLVING_SCENARIO(scenarioId));
      const result = await response.json();
      
      if (response.ok) {
        setCurrentScenario(result);
        console.log('✅ [SCENARIO] Scenario loaded successfully:', result.title);
        
        // Audio will be loaded when play button is clicked
      } else {
        console.log('❌ [SCENARIO] Failed to load scenario:', result.detail);
        Alert.alert('Error', 'Failed to load scenario. Please try again.');
      }
    } catch (error) {
      console.error('❌ [SCENARIO] Error loading scenario:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Play scenario audio
  const playScenarioAudio = async () => {
    if (!currentScenario || audioPlayer.state.isPlaying) return;

    console.log("🔄 [AUDIO] Playing scenario audio for ID:", currentScenarioId);
    try {
      setIsPlayingAudio(true);
      
      const response = await authenticatedFetch(`${BASE_API_URL}/api/problem-solving/${currentScenarioId}`, {
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

  // Start recording
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
      
      // Start pulse animation
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
      
      // Stop pulse animation
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    } catch (error) {
      console.error('❌ [RECORD] Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  // Process recording
  const processRecording = async (audioUri: string) => {
    if (!currentScenario || !user?.id) return;
    
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
      const response = await authenticatedFetch(API_ENDPOINTS.EVALUATE_PROBLEM_SOLVING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: audioBase64,
          scenario_id: currentScenario.id,
          filename: `problem_solving_${currentScenario.id}_${Date.now()}.m4a`,
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
          pathname: '/(tabs)/practice/stage3/feedback_3',
          params: {
            evaluationResult: JSON.stringify(result),
            currentScenarioId: currentScenarioId.toString(),
            totalScenarios: totalScenarios.toString(),
            exerciseType: 'problem-solving'
          }
        });
      } else {
        console.log('❌ [EVAL] Evaluation failed:', result.error);
        setShowEvaluatingAnimation(false);
        Alert.alert('Evaluation Failed', result.message || 'Please try again with a clearer response.');
      }
    } catch (error) {
      console.error('❌ [EVAL] Error processing recording:', error);
      setShowEvaluatingAnimation(false);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next scenario
  const moveToNextScenario = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 [NAVIGATION] Getting next scenario from backend...');
      
      // Get the current topic from backend (which should be the next topic after completion)
      const response = await authenticatedFetch(`${BASE_API_URL}/api/problem-solving-current-topic/${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        const nextTopicId = result.current_topic_id;
        console.log('🔄 [NAVIGATION] Backend returned topic ID:', nextTopicId);
        
        if (nextTopicId <= totalScenarios) {
          setCurrentScenarioId(nextTopicId);
          await loadScenario(nextTopicId);
          console.log('🔄 [NAVIGATION] Moved to scenario:', nextTopicId);
        } else {
          console.log('🎉 [NAVIGATION] All scenarios completed!');
          setIsExerciseCompleted(true);
        }
      } else {
        console.log('⚠️ [NAVIGATION] Failed to get next topic, staying on current scenario');
      }
    } catch (error) {
      console.error('❌ [NAVIGATION] Error moving to next scenario:', error);
      // Fallback: try to increment manually
      if (currentScenarioId < totalScenarios) {
        const nextId = currentScenarioId + 1;
        setCurrentScenarioId(nextId);
        loadScenario(nextId);
        console.log('🔄 [NAVIGATION] Fallback: Moving to next scenario:', nextId);
      } else {
        console.log('🎉 [NAVIGATION] All scenarios completed!');
        setIsExerciseCompleted(true);
      }
    }
  };

  // Handle feedback return
  const handleFeedbackReturn = async () => {
    if (evaluationResult?.success) {
      await moveToNextScenario();
    }
    setEvaluationResult(null);
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
      console.log('🚀 [INIT] Initializing Problem Solving Screen...');
      
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
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();

      await initializeProgressTracking();
      await loadTotalScenarios();
      await loadUserProgress();
      await loadCurrentTopic();
      
      console.log('✅ [INIT] Problem Solving Screen initialized successfully');
    };

    initialize();
  }, []);

  // Handle feedback return from navigation
  useEffect(() => {
    const handleFeedbackReturn = async () => {
      if (params.evaluationResult) {
        const result = JSON.parse(params.evaluationResult as string);
        setEvaluationResult(result);
        if (result.success) {
          await moveToNextScenario();
        }
      }
    };
    
    handleFeedbackReturn();
  }, [params.evaluationResult]);

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
            <TouchableOpacity onPress={() => router.push({ pathname: '/practice/stage3' })} style={styles.backButton}>
              <View style={styles.backButtonCircle}>
                <Ionicons name="arrow-back" size={24} color="#58D68D" />
              </View>
        </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.titleGradient}
              >
                <Ionicons name="construct" size={32} color="#FFFFFF" />
              </LinearGradient>
        <Text style={styles.headerTitle}>Problem Solving</Text>
              <Text style={styles.headerSubtitle}>Handle Real-Life Situations</Text>
              
              {/* Scenario Counter */}
              <Text style={styles.scenarioCounter}>
                Scenario: {currentScenarioId} of {totalScenarios}
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
                    Congratulations! You have successfully completed all Problem Solving exercises.
                  </Text>
                  <Text style={styles.completedText}>Great job on your problem-solving skills!</Text>
                  <TouchableOpacity
                    style={styles.completedButton}
                    onPress={() => router.back()}
                  >
                    <LinearGradient
                      colors={["#58D68D", "#45B7A8"]}
                      style={styles.completedButtonGradient}
                    >
                      <Text style={styles.completedButtonText}>Return to Practice</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Loading problem-solving scenario...</Text>
                </View>
              ) : currentScenario ? (
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.scenarioContainer}>
                    {/* Scenario Title */}
                    <View style={styles.titleSection}>
                      <Text style={styles.scenarioTitle}>{currentScenario.title}</Text>
                      <Text style={styles.scenarioTitleUrdu}>{currentScenario.title_urdu}</Text>
                    </View>
                    
                    {/* Problem Description */}
                    <View style={styles.problemSection}>
                      <Text style={styles.problemTitle}>Problem:</Text>
                      <Text style={styles.problemText}>{currentScenario.problem_description}</Text>
                      <Text style={styles.problemTextUrdu}>{currentScenario.problem_description_urdu}</Text>
                    </View>
                    
                    {/* Context */}
                    <View style={styles.contextSection}>
                      <Text style={styles.contextTitle}>Context:</Text>
                      <Text style={styles.contextText}>{currentScenario.context}</Text>
                      <Text style={styles.contextTextUrdu}>{currentScenario.context_urdu}</Text>
                    </View>
                    
                    {/* Expected Keywords */}
                    <View style={styles.keywordsSection}>
                      <Text style={styles.keywordsTitle}>Key Words to Use:</Text>
                      <View style={styles.keywordsContainer}>
                        {currentScenario.expected_keywords.map((keyword, index) => (
                          <View key={index} style={styles.keywordChip}>
                            <Text style={styles.keywordText}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    {/* Polite Phrases */}
                    <View style={styles.phrasesSection}>
                      <Text style={styles.phrasesTitle}>Polite Phrases:</Text>
                      <View style={styles.phrasesList}>
                        {currentScenario.polite_phrases.map((phrase, index) => (
                          <View key={index} style={styles.phraseItem}>
                            <Ionicons name="chatbubble-ellipses" size={16} color="#58D68D" />
                            <Text style={styles.phraseText}>{phrase}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    {/* Sample Responses */}
                    <View style={styles.samplesSection}>
                      <Text style={styles.samplesTitle}>Sample Responses:</Text>
                      <View style={styles.samplesList}>
                        {currentScenario.sample_responses.map((response, index) => (
                          <View key={index} style={styles.sampleItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#58D68D" />
                            <Text style={styles.sampleText}>{response}</Text>
                          </View>
                        ))}
            </View>
        </View>

                    {/* Play Button */}
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={playScenarioAudio}
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
                      Listen to the scenario and respond appropriately to solve the problem. Use polite language and clear communication.
                    </Text>
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorText}>Failed to load scenario</Text>
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
                  transform: audioRecorder.state.isRecording ? [{ scale: pulseAnim }] : [{ scale: 1 }],
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
                  {isEvaluating ? 'Processing...' : audioRecorder.state.isRecording ? 'Recording' : 'Solve Problem'}
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
  scenarioCounter: {
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
  },
  scenarioContainer: {
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scenarioTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  scenarioTitleUrdu: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  problemSection: {
    marginBottom: 24,
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  problemText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 8,
  },
  problemTextUrdu: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  contextSection: {
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 8,
  },
  contextTextUrdu: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  keywordsSection: {
    marginBottom: 24,
  },
  keywordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  phrasesSection: {
    marginBottom: 24,
  },
  phrasesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  phrasesList: {
    gap: 8,
  },
  phraseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
  },
  phraseText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  samplesSection: {
    marginBottom: 24,
  },
  samplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  samplesList: {
    gap: 8,
  },
  sampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  sampleText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  playButton: {
    alignItems: 'center',
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
  completedButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  completedButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  completedButtonText: {
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

export default ProblemSolvingScreen; 