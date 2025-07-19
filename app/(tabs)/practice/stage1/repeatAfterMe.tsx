import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  SafeAreaView
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import LottieView from 'lottie-react-native';
import BASE_API_URL from '../../../../config/api';
import { useAudioPlayerFixed, useAudioRecorder } from '../../../../hooks';
import { useAuth } from '../../../../context/AuthContext';
import { progressTracker, ProgressHelpers } from '../../../../utils/progressTracker';
import LoadingScreen from '../../../../components/LoadingScreen';

const { width, height } = Dimensions.get('window');

interface Phrase {
  id: number;
  phrase: string;
  urdu_meaning: string;
}

interface EvaluationResult {
  success: boolean;
  expected_phrase: string;
  user_text?: string;
  evaluation?: any;
  error?: string;
  message?: string;
  progress_recorded?: boolean;
  unlocked_content?: string[];
}

const RepeatAfterMeScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [cardScaleAnim] = useState(new Animated.Value(0.8));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  const [progressScaleAnim] = useState(new Animated.Value(0.7));

  // State management
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [currentPhraseId, setCurrentPhraseId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCongratulationsAnimation, setShowCongratulationsAnimation] = useState(false);
  const [showRetryAnimation, setShowRetryAnimation] = useState(false);
  const [showEvaluatingAnimation, setShowEvaluatingAnimation] = useState(false);

  // Progress tracking state
  const [userProgress, setUserProgress] = useState<any>(null);
  const [isProgressInitialized, setIsProgressInitialized] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [currentTopicId, setCurrentTopicId] = useState<number>(1);
  const [isExerciseCompleted, setIsExerciseCompleted] = useState<boolean>(false);
  const [isTopicLoaded, setIsTopicLoaded] = useState<boolean>(false);
  const [totalPhrases, setTotalPhrases] = useState<number>(50); // Default fallback based on JSON file

  // Custom hooks
  const audioPlayer = useAudioPlayerFixed();
  const audioRecorder = useAudioRecorder(5000, async (audioUri) => {
    console.log('🔄 [AUTO-STOP] Auto-stop callback triggered!');
    console.log('📊 [AUTO-STOP] Auto-stop details:', {
      audioUri: audioUri ? 'Present' : 'None',
      uriLength: audioUri?.length || 0,
      currentPhrase: currentPhrase?.phrase || 'None',
      isProcessing: isProcessing
    });
    
    if (audioUri) {
      console.log('✅ [AUTO-STOP] Valid audio URI received, starting automatic evaluation...');
      await processRecording(audioUri);
    } else {
      console.log('⚠️ [AUTO-STOP] No valid audio URI from auto-stop');
      setEvaluationResult({
        success: false,
        expected_phrase: currentPhrase?.phrase || '',
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

  const initializeProgressTracking = async () => {
    console.log('🔄 [SCREEN] initializeProgressTracking called');
    try {
      console.log('🔄 [SCREEN] Initializing progress tracking for user:', user?.id);
      
      await progressTracker.updateCurrentUser();
      
      console.log('🔄 [SCREEN] Initializing user progress...');
      const initResult = await ProgressHelpers.initializeProgressForNewUser();
      console.log('📊 [SCREEN] Progress initialization result:', initResult);
      
      if (initResult.success) {
        console.log('✅ [SCREEN] Progress initialized successfully');
        setIsProgressInitialized(true);
        
        console.log('🔄 [SCREEN] Loading current topic, progress, and total phrases...');
        await Promise.all([
          loadCurrentTopic(),
          loadUserProgress(),
          loadTotalPhrases()
        ]);
      } else {
        console.log('⚠️ [SCREEN] Progress initialization failed:', initResult.error);
      }
    } catch (error) {
      console.error('❌ [SCREEN] Error initializing progress tracking:', error);
    }
  };

  const loadUserProgress = async () => {
    console.log('🔄 [SCREEN] loadUserProgress called');
    try {
      console.log('🔄 [SCREEN] Getting repeat after me progress...');
      const progress = await ProgressHelpers.getRepeatAfterMeProgress();
      if (progress) {
        console.log('📊 [SCREEN] Loaded user progress:', progress);
        setUserProgress(progress);
        
        const completed = progress.completed_at !== null;
        setIsExerciseCompleted(completed);
        console.log('📊 [SCREEN] Exercise completed status:', completed);
        
        if (completed) {
          console.log('🎉 [SCREEN] Exercise is already completed!');
          setError('Congratulations! You have completed this exercise. Great job!');
          return;
        }
      } else {
        console.log('ℹ️ [SCREEN] No progress data found');
      }
    } catch (error) {
      console.error('❌ [SCREEN] Error loading user progress:', error);
    }
  };

  const loadCurrentTopic = async () => {
    console.log('🔄 [SCREEN] loadCurrentTopic called');
    try {
      console.log('🔄 [SCREEN] Getting current topic for exercise...');
      const topicResult = await ProgressHelpers.getCurrentTopicForExercise(1, 1);
      
      if (topicResult.success && topicResult.data) {
        const { current_topic_id, is_completed } = topicResult.data;
        console.log('📊 [SCREEN] Current topic data:', { current_topic_id, is_completed });
        
        setCurrentTopicId(current_topic_id);
        setIsExerciseCompleted(is_completed);
        
        if (is_completed) {
          console.log('🎉 [SCREEN] Exercise is already completed!');
          setError('Congratulations! You have completed this exercise. Great job!');
          setIsTopicLoaded(true); // Mark as loaded even if completed
          return;
        }
        
        // Set the current phrase ID but don't mark as loaded yet
        // The phrase will be loaded in the useEffect when isTopicLoaded becomes true
        setCurrentPhraseId(current_topic_id);
        setIsTopicLoaded(true); // Now mark as loaded so phrase can be loaded
      } else {
        console.log('⚠️ [SCREEN] Failed to get current topic, starting with topic 1');
        setCurrentTopicId(1);
        setCurrentPhraseId(1);
        setIsTopicLoaded(true); // Mark as loaded even if starting with topic 1
      }
    } catch (error) {
      console.error('❌ [SCREEN] Error loading current topic:', error);
      setCurrentTopicId(1);
      setCurrentPhraseId(1);
      setIsTopicLoaded(true); // Mark as loaded even on error
    }
  };

  const loadTotalPhrases = async () => {
    console.log('🔄 [SCREEN] loadTotalPhrases called');
    try {
      console.log('🔄 [SCREEN] Getting total phrases count...');
      const apiUrl = `${BASE_API_URL}/phrases`;
      console.log('📡 [SCREEN] API URL for phrases:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📥 [SCREEN] Phrases response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const phrases = data.phrases || [];
        console.log('✅ [SCREEN] Total phrases count:', phrases.length);
        setTotalPhrases(phrases.length);
      } else {
        console.log('⚠️ [SCREEN] Failed to get phrases count, using default');
        setTotalPhrases(50); // Fallback to default based on JSON file
      }
    } catch (error) {
      console.error('❌ [SCREEN] Error loading total phrases:', error);
      setTotalPhrases(50); // Fallback to default based on JSON file
    }
  };

  useEffect(() => {
    console.log('🔄 [SCREEN] useEffect triggered - component mount');
    
    // Animate elements on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(progressScaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      console.log('🔄 [SCREEN] Component unmounting, cleaning up...');
      audioPlayer.unloadAudio();
      audioRecorder.resetRecording();
    };
  }, []);

  useEffect(() => {
    console.log('🔄 [SCREEN] useEffect triggered - currentPhraseId changed to:', currentPhraseId);
    // Only load phrase if topic is loaded and exercise is not completed
    if (isTopicLoaded && !isExerciseCompleted) {
      loadPhrase();
    }
  }, [currentPhraseId, isExerciseCompleted, isTopicLoaded]);

  const loadPhrase = async () => {
    console.log('🔄 [SCREEN] loadPhrase called');
    try {
      console.log('🔄 [SCREEN] Starting to load phrase...');
      console.log('📡 [SCREEN] Base API URL:', BASE_API_URL);
      console.log('📝 [SCREEN] Loading phrase ID:', currentPhraseId);
      setIsLoading(true);
      setError(null);
      
      const apiUrl = `${BASE_API_URL}/api/phrases/${currentPhraseId}`;
      console.log('📡 [SCREEN] API URL for phrase:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📥 [SCREEN] Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('🎉 [SCREEN] Congratulations! You have completed all phrases!');
          setCurrentPhrase(null);
          setError('Congratulations! You have completed all phrases. Great job!');
          return;
        }
        console.error('❌ [SCREEN] API Error - Status:', response.status);
        throw new Error(`Failed to load phrase: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ [SCREEN] Phrase data received:', data);
      setCurrentPhrase({ 
        id: data.id, 
        phrase: data.phrase,
        urdu_meaning: data.urdu_meaning 
      });
      setEvaluationResult(null);
    } catch (error) {
      console.error('❌ [SCREEN] Error loading phrase:', error);
      setError('Failed to load phrase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const playPhraseAudio = async () => {
    console.log('🔄 [SCREEN] playPhraseAudio called');
    if (!currentPhrase || audioPlayer.state.isPlaying) {
      console.log('⚠️ [SCREEN] Cannot play audio - conditions not met');
      return;
    }

    try {
      console.log('🔄 [SCREEN] Starting to play phrase audio...');
      setError(null);

      const apiUrl = `${BASE_API_URL}/api/repeat-after-me/${currentPhrase.id}`;
      console.log('📡 [SCREEN] API URL for audio:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('❌ [SCREEN] Audio API Error - Status:', response.status);
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [SCREEN] Audio response received:', {
        hasAudioBase64: !!responseData.audio_base64,
        base64Length: responseData.audio_base64?.length || 0
      });
      
      if (!responseData.audio_base64) {
        throw new Error('No audio data received from server');
      }
      
      const audioUri = `data:audio/mpeg;base64,${responseData.audio_base64}`;
      console.log('✅ [SCREEN] Audio URI created (base64):', audioUri.substring(0, 50) + '...');

      await audioPlayer.loadAudio(audioUri);
      console.log('✅ [SCREEN] Audio loaded successfully');
      
      await audioPlayer.playAudio();
      console.log('✅ [SCREEN] Audio playback started');

    } catch (error) {
      console.error('❌ [SCREEN] Error playing audio:', error);
      setError('Failed to play audio. Please try again.');
    }
  };

  const handleStartRecording = async () => {
    console.log('🔄 [SCREEN] handleStartRecording called');
    if (audioRecorder.state.isRecording || audioPlayer.state.isPlaying) {
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
    console.log('🔄 [SCREEN] handleStopRecording called');
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
          expected_phrase: currentPhrase?.phrase || '',
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
        phrase_id: currentPhrase?.id || 1,
        filename: `recording-${Date.now()}.mp3`,
        user_id: user?.id || '',
        time_spent_seconds: timeSpentSeconds,
        urdu_used: false
      };

      const evaluationUrl = `${BASE_API_URL}/api/evaluate-audio`;
      console.log('📡 [SCREEN] Sending evaluation request to:', evaluationUrl);
      
      const evaluationResponse = await fetch(evaluationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        expectedPhrase: result.expected_phrase,
        userText: result.user_text,
        error: result.error,
        message: result.message,
        hasEvaluation: !!result.evaluation,
        progressRecorded: result.progress_recorded,
        unlockedContent: result.unlocked_content
      });

      setShowEvaluatingAnimation(false);
      setEvaluationResult(result);
      console.log('✅ [SCREEN] Evaluation result set in state');

      if (result.success && result.evaluation && result.evaluation.is_correct) {
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
          console.log('🔄 [SCREEN] Moving to next phrase after congratulations animation');
          setShowCongratulationsAnimation(false);
          const nextTopicId = currentPhraseId + 1;
          if (nextTopicId > totalPhrases) {
            console.log('🎉 [SCREEN] All topics completed! Exercise finished!');
            setIsExerciseCompleted(true);
            setError('Congratulations! You have completed all topics in this exercise. Great job!');
          } else {
            setCurrentPhraseId(nextTopicId);
            setCurrentTopicId(nextTopicId);
            console.log('🔄 [SCREEN] Moving from topic', currentPhraseId, 'to topic', nextTopicId);
          }
        }, 4500);
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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
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

  // Show loading screen if auth is still loading or topic is not loaded yet
  if (authLoading || !isTopicLoaded) {
    return <LoadingScreen message="Loading your progress..." />;
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <LinearGradient colors={["#8EC5FC", "#6E73F2"]} style={styles.gradient}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.headerTitle}>Repeat After Me</Text>
            <Text style={styles.errorText}>Please log in to track your progress</Text>
            <TouchableOpacity
              style={styles.speakButton}
              onPress={() => router.push('/auth/login')}
            >
              <LinearGradient colors={["#58D68D", "#45B7A8"]} style={styles.speakButtonGradient}>
                <Text style={styles.speakButtonText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  console.log('🔄 [SCREEN] Rendering main screen');
  return (
    <LinearGradient colors={["#8EC5FC", "#6E73F2"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
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
                <Ionicons name="mic" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Repeat After Me</Text>
              <Text style={styles.headerSubtitle}>Perfect Your Pronunciation</Text>
            </View>
          </Animated.View>

          {/* Progress Display */}
          {userProgress && (
            <Animated.View
              style={[
                styles.progressCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: progressScaleAnim }
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.progressGradient}
              >
                <View style={styles.progressContent}>
                  <Ionicons name="trending-up" size={24} color="#58D68D" />
                  <Text style={styles.progressTitle}>Your Progress</Text>
                  <Text style={styles.progressText}>Topic: {currentTopicId} of {totalPhrases}</Text>
                  <Text style={styles.progressText}>Score: {userProgress.average_score?.toFixed(1) || 0}%</Text>
                  <Text style={styles.progressText}>Time: {Math.round(userProgress.time_spent_minutes || 0)} min</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

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
                    Congratulations! You have successfully completed all topics in this exercise.
                  </Text>
                  <Text style={styles.completedText}>Great job on your progress!</Text>
                </View>
              ) : isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                  <Text style={styles.loadingText}>Loading phrase...</Text>
                </View>
              ) : currentPhrase ? (
                <View style={styles.phraseContainer}>
                  <Text style={styles.phraseText}>{currentPhrase.phrase}</Text>
                  
                  {/* Urdu Meaning Display */}
                  <View style={styles.urduMeaningContainer}>
                    <Text style={styles.urduMeaningText}>{currentPhrase.urdu_meaning}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={playPhraseAudio}
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
                    Listen to the phrase and repeat it clearly
                  </Text>
                </View>
              ) : (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorText}>Failed to load phrase</Text>
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
              disabled={isProcessing || audioPlayer.state.isPlaying || isLoading || isExerciseCompleted}
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
                  {isProcessing ? 'Processing...' : audioRecorder.state.isRecording ? `Recording... ${formatTime(audioRecorder.state.recordingDuration)}` : 'Speak Now (5s max)'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
              <Text style={styles.congratulationsTitle}>Congratulations!!!</Text>
              <Text style={styles.congratulationsSubtitle}>Move on to the next sentence</Text>
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
              <Text style={styles.retryTitle}>Kindly Try again</Text>
              <Text style={styles.retrySubtitle}>the sentence</Text>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 30, // Reduced padding to match index.tsx
    paddingBottom: Platform.OS === 'ios' ? 40 : 60, // Keep bottom padding for home indicator
    paddingHorizontal: 24,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 20, // Reduced margin to match index.tsx
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 0 : 10, // Match index.tsx positioning
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
    marginTop: Platform.OS === 'ios' ? 10 : 20, // Reduced margin to match index.tsx
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
  },
  progressCard: {
    width: '100%',
    marginBottom: 20,
  },
  progressGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  mainCard: {
    width: '100%',
    flex: 1,
    marginBottom: 20,
  },
  mainCardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  phraseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  phraseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 32,
  },
  urduMeaningContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.2)',
  },
  urduMeaningText: {
    fontSize: 18,
    color: '#58D68D',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
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
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
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
    paddingHorizontal: 20, // Add padding for smaller screens
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: height * 0.6, // Limit height for better centering
  },
  congratulationsAnimation: {
    width: Math.min(width * 0.7, height * 0.5), // Responsive sizing
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
    width: Math.min(width * 0.7, height * 0.5), // Responsive sizing
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
    width: Math.min(width * 0.7, height * 0.5), // Responsive sizing
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

export default RepeatAfterMeScreen; 