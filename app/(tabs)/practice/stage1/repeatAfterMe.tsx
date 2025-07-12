import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import LottieView from 'lottie-react-native';
import BASE_API_URL from '../../../../config/api';
import { useAudioPlayerFixed, useAudioRecorder } from '../../../../hooks';

const { width, height } = Dimensions.get('window');

interface Phrase {
  id: number;
  phrase: string;
}

interface EvaluationResult {
  success: boolean;
  expected_phrase: string;
  user_text?: string;
  evaluation?: any;
  error?: string;
  message?: string;
}

const RepeatAfterMeScreen = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // State management
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [currentPhraseId, setCurrentPhraseId] = useState<number>(1); // Track current phrase ID
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCongratulationsAnimation, setShowCongratulationsAnimation] = useState(false);
  const [showRetryAnimation, setShowRetryAnimation] = useState(false);
  const [showEvaluatingAnimation, setShowEvaluatingAnimation] = useState(false);

  // Custom hooks
  const audioPlayer = useAudioPlayerFixed();
  const audioRecorder = useAudioRecorder(5000, async (audioUri) => {
    // This callback is called when recording automatically stops
    console.log('🔄 Auto-stop callback triggered!');
    console.log('📊 Auto-stop details:', {
      audioUri: audioUri ? 'Present' : 'None',
      uriLength: audioUri?.length || 0,
      currentPhrase: currentPhrase?.phrase || 'None',
      isProcessing: isProcessing
    });
    
    if (audioUri) {
      console.log('✅ Valid audio URI received, starting automatic evaluation...');
      // Automatically process the recording
      await processRecording(audioUri);
    } else {
      console.log('⚠️ No valid audio URI from auto-stop');
      setEvaluationResult({
        success: false,
        expected_phrase: currentPhrase?.phrase || '',
        error: 'no_speech_detected',
        message: 'No clear speech detected. Please speak more clearly.',
      });
      setIsProcessing(false);
    }
  }); // 5 seconds max duration

  useEffect(() => {
    // Animate elements on mount
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

    // Cleanup on unmount
    return () => {
      audioPlayer.unloadAudio();
      audioRecorder.resetRecording();
    };
  }, []);

  // Separate useEffect to load phrase when currentPhraseId changes
  // This ensures that when currentPhraseId updates, the new phrase is loaded automatically
  useEffect(() => {
    console.log('🔄 useEffect triggered - currentPhraseId changed to:', currentPhraseId);
    loadPhrase();
  }, [currentPhraseId]);

  const loadPhrase = async () => {
    try {
      console.log('🔄 Starting to load phrase...');
      console.log('📡 Base API URL:', BASE_API_URL);
      console.log('📝 Loading phrase ID:', currentPhraseId);
      setIsLoading(true);
      setError(null);
      
      const apiUrl = `${BASE_API_URL}/api/phrases/${currentPhraseId}`;
      console.log('📡 API URL for phrase:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          // We've reached the end of phrases
          console.log('🎉 Congratulations! You have completed all phrases!');
          setCurrentPhrase(null);
          setError('Congratulations! You have completed all phrases. Great job!');
          return;
        }
        console.error('❌ API Error - Status:', response.status);
        throw new Error(`Failed to load phrase: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Phrase data received:', data);
      setCurrentPhrase({ id: data.id, phrase: data.phrase });
      setEvaluationResult(null); // Clear previous evaluation
    } catch (error) {
      console.error('❌ Error loading phrase:', error);
      setError('Failed to load phrase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const playPhraseAudio = async () => {
    if (!currentPhrase || audioPlayer.state.isPlaying) {
      console.log('⚠️ Cannot play audio - conditions not met');
      return;
    }

    try {
      console.log('🔄 Starting to play phrase audio...');
      setError(null);

      // Simple approach: Fetch audio and convert to base64 data URI
      const apiUrl = `${BASE_API_URL}/api/repeat-after-me/${currentPhrase.id}`;
      console.log('📡 API URL for audio:', apiUrl);
      
      // Fetch audio with POST method
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('❌ Audio API Error - Status:', response.status);
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      // Get the audio as JSON response with base64
      const responseData = await response.json();
      console.log('✅ Audio response received:', {
        hasAudioBase64: !!responseData.audio_base64,
        base64Length: responseData.audio_base64?.length || 0
      });
      
      if (!responseData.audio_base64) {
        throw new Error('No audio data received from server');
      }
      
      // Create data URI for audio playback
      const audioUri = `data:audio/mpeg;base64,${responseData.audio_base64}`;
      
      console.log('✅ Audio URI created (base64):', audioUri.substring(0, 50) + '...');

      // Load and play audio using the hook
      console.log('🔄 Loading audio into player...');
      await audioPlayer.loadAudio(audioUri);
      console.log('✅ Audio loaded successfully');
      
      console.log('🔄 Playing audio...');
      await audioPlayer.playAudio();
      console.log('✅ Audio playback started');

    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setError('Failed to play audio. Please try again.');
    }
  };

  const handleStartRecording = async () => {
    if (audioRecorder.state.isRecording || audioPlayer.state.isPlaying) {
      console.log('⚠️ Cannot start recording - conditions not met:', {
        isRecording: audioRecorder.state.isRecording,
        isPlaying: audioPlayer.state.isPlaying
      });
      return;
    }

    try {
      console.log('🔄 Starting recording...');
      console.log('📝 Recording context:', {
        phraseId: currentPhrase?.id,
        phraseText: currentPhrase?.phrase,
        maxDuration: 5000 // 5 seconds
      });
      console.log('⏰ Setting up 5-second auto-stop timer...');
      
      setError(null);
      setEvaluationResult(null);
      
      await audioRecorder.startRecording();
      console.log('✅ Recording started successfully with auto-stop in 5 seconds');
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      console.error('❌ Recording error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      setError('Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecorder.state.isRecording) return;

    try {
      console.log('🔄 Manually stopping recording...');
      setIsProcessing(true);
      setError(null);
      setEvaluationResult(null);
      
      console.log('📝 Current phrase context:', {
        phraseId: currentPhrase?.id,
        phraseText: currentPhrase?.phrase
      });
      
      const audioUri = await audioRecorder.stopRecording();
      console.log('🎤 Recording stopped, audio URI:', audioUri);

      if (!audioUri) {
        console.log('⚠️ No audio URI received from recorder');
        setEvaluationResult({
          success: false,
          expected_phrase: currentPhrase?.phrase || '',
          error: 'no_speech_detected',
          message: 'No clear speech detected. Please speak more clearly.',
        });
        setIsProcessing(false);
        return;
      }

      // Process the recording using the shared function
      await processRecording(audioUri);

    } catch (error) {
      console.error('❌ Error during manual recording stop:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      setError('Failed to process recording. Please try again.');
      setIsProcessing(false);
    }
  };

  const processRecording = async (audioUri: string) => {
    console.log('🔄 Starting processRecording with audio URI:', audioUri);
    console.log('📊 Processing context:', {
      isProcessing: isProcessing,
      hasCurrentPhrase: !!currentPhrase,
      phraseText: currentPhrase?.phrase || 'None'
    });
    
    // Show evaluating animation
    setShowEvaluatingAnimation(true);
    
    try {
      // Convert audio to base64
      console.log('🔄 Converting audio to base64...');
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('✅ Audio converted to base64, length:', base64Audio.length);

      // Prepare evaluation request
      const evaluationRequest = {
        audio_base64: base64Audio,
        phrase_id: currentPhrase?.id || 1,
        filename: `recording-${Date.now()}.mp3`,
      };
      console.log('📤 Evaluation request prepared:', {
        phraseId: evaluationRequest.phrase_id,
        filename: evaluationRequest.filename,
        audioLength: evaluationRequest.audio_base64.length
      });

      // Send to backend for evaluation
      const evaluationUrl = `${BASE_API_URL}/api/evaluate-audio`;
      console.log('📡 Sending evaluation request to:', evaluationUrl);
      
      const evaluationResponse = await fetch(evaluationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationRequest),
      });

      console.log('📥 Evaluation response status:', evaluationResponse.status);
      console.log('📥 Evaluation response headers:', Object.fromEntries(evaluationResponse.headers.entries()));

      if (!evaluationResponse.ok) {
        const errorText = await evaluationResponse.text();
        console.error('❌ Evaluation request failed:', {
          status: evaluationResponse.status,
          statusText: evaluationResponse.statusText,
          errorText: errorText
        });
        throw new Error(`Failed to evaluate audio: ${evaluationResponse.status} ${evaluationResponse.statusText}`);
      }

      const result: EvaluationResult = await evaluationResponse.json();
      console.log('✅ Evaluation result received:', {
        success: result.success,
        expectedPhrase: result.expected_phrase,
        userText: result.user_text,
        error: result.error,
        message: result.message,
        hasEvaluation: !!result.evaluation
      });

      if (result.evaluation) {
        console.log('📊 Detailed evaluation:', result.evaluation);
      }

      // Hide evaluating animation
      setShowEvaluatingAnimation(false);
      
      setEvaluationResult(result);
      console.log('✅ Evaluation result set in state');
      
      // Log UI state for debugging
      console.log('🎨 UI State Update:', {
        isProcessing: false,
        hasEvaluationResult: true,
        evaluationSuccess: result.success,
        hasError: !!error
      });

      // Check if the evaluation was successful and move to next phrase
      if (result.success && result.evaluation && result.evaluation.is_correct) {
        console.log('🎉 Correct answer! Showing congratulations animation...');
        setShowCongratulationsAnimation(true);
        
        // Hide the animation after 4.5 seconds and move to next phrase
        setTimeout(() => {
          setShowCongratulationsAnimation(false);
          setCurrentPhraseId(prevId => {
            const nextId = prevId + 1;
            console.log('🔄 Moving from phrase', prevId, 'to phrase', nextId);
            return nextId;
          });
          // loadPhrase() will be automatically called by useEffect when currentPhraseId changes
        }, 4500); // 4.5 second delay to show congratulations animation
      } else if (result.success && result.evaluation && !result.evaluation.is_correct) {
        console.log('❌ Incorrect answer! Showing retry animation...');
        setShowRetryAnimation(true);
        
        // Hide the animation after 3 seconds and allow retry
        setTimeout(() => {
          setShowRetryAnimation(false);
        }, 3000); // 3 second delay to show retry animation
      }



    } catch (error) {
      console.error('❌ Error during recording evaluation:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      setError('Failed to process recording. Please try again.');
      // Hide evaluating animation on error
      setShowEvaluatingAnimation(false);
    } finally {
      console.log('🏁 Evaluation process completed');
      setIsProcessing(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (audioRecorder.state.isRecording) return `Recording ${formatTime(audioRecorder.state.recordingDuration)} (max 5s)`;
    return 'Speak Now (5s max)';
  };

  const getButtonIcon = () => {
    if (isProcessing) return 'hourglass-outline';
    if (audioRecorder.state.isRecording) return 'stop-outline';
    return 'mic-outline';
  };

  const getButtonColors = (): [string, string] => {
    if (isProcessing) return ['#FF6B6B', '#FF5252'];
    if (audioRecorder.state.isRecording) return ['#FF6B6B', '#FF5252'];
    return ['#58D68D', '#45B7A8'];
  };

  const getListenButtonColors = (): [string, string] => {
    if (audioPlayer.state.isPlaying) return ['#FF6B6B', '#FF5252'];
    return ['#58D68D', '#45B7A8'];
  };

  return (
    <LinearGradient
      colors={["#8EC5FC", "#6E73F2"]}
      style={styles.gradient}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.headerTitle}>Repeat After Me</Text>
          <Text style={styles.progressText}>Progress: {currentPhraseId - 1} of 25 phrases completed</Text>

          {/* Phrase Card */}
          <View style={styles.card}>
            {isLoading ? (
              <Text style={styles.loadingText}>Loading phrase...</Text>
            ) : currentPhrase ? (
              <>
                <Text style={styles.phraseText}>{currentPhrase.phrase}</Text>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={playPhraseAudio}
                  disabled={audioPlayer.state.isPlaying || audioRecorder.state.isRecording}
                >
                  <LinearGradient
                    colors={["#58D68D", "#45B7A8"]}
                    style={styles.playButtonGradient}
                  >
                    <Ionicons name={audioPlayer.state.isPlaying ? 'volume-high' : 'play'} size={36} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.instructionText}>Listen to the phrase and repeat it clearly</Text>
              </>
            ) : (
              <Text style={styles.errorText}>Failed to load phrase</Text>
            )}
          </View>

          {/* Speak Button */}
          <TouchableOpacity
            style={styles.speakButton}
            onPress={audioRecorder.state.isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessing || audioPlayer.state.isPlaying || isLoading}
          >
            <LinearGradient
              colors={["#58D68D", "#45B7A8"]}
              style={styles.speakButtonGradient}
            >
              <Ionicons name={isProcessing ? 'hourglass-outline' : audioRecorder.state.isRecording ? 'stop-outline' : 'mic-outline'} size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.speakButtonText}>{isProcessing ? 'Processing...' : audioRecorder.state.isRecording ? 'Recording (5s max)' : 'Speak Now (5s max)'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* All overlays and animations remain unchanged below */}
        {/* ... overlays for congratulations, retry, evaluating, etc ... */}
        {showCongratulationsAnimation && (
          <View style={styles.congratulationsOverlay}>
            <LottieView
              source={require('../../../../assets/animations/correct_move_to_next_sentence.json')}
              autoPlay
              loop={false}
              style={styles.congratulationsAnimation}
            />
            <View style={styles.congratulationsTextContainer}>
              <Text style={styles.congratulationsTitle}>Congratulations!!!</Text>
              <Text style={styles.congratulationsSubtitle}>Move on to the next sentence</Text>
            </View>
          </View>
        )}
        {showRetryAnimation && (
          <View style={styles.retryOverlay}>
            <LottieView
              source={require('../../../../assets/animations/retry.json')}
              autoPlay
              loop={false}
              style={styles.retryAnimation}
            />
            <View style={styles.retryTextContainer}>
              <Text style={styles.retryTitle}>Kindly Try again</Text>
              <Text style={styles.retrySubtitle}>the sentence</Text>
            </View>
          </View>
        )}
        {showEvaluatingAnimation && (
          <View style={styles.evaluatingOverlay}>
            <LottieView
              source={require('../../../../assets/animations/evaluating.json')}
              autoPlay
              loop={true}
              style={styles.evaluatingAnimation}
            />
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
    justifyContent: 'space-evenly',
    paddingVertical: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressText: {
    color: '#e0e0e0',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  phraseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
    textAlign: 'center',
  },
  playButton: {
    marginBottom: 18,
  },
  playButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#58D68D',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  instructionText: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  speakButton: {
    width: width * 0.85,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 30,
    shadowColor: '#45B7A8',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  speakButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
  },
  speakButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 18,
    color: '#6C757D',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 12,
  },
  // Overlays and animation styles
  congratulationsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  congratulationsAnimation: {
    width: width * 0.7,
    height: width * 0.7,
  },
  congratulationsTextContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    alignItems: 'center',
  },
  congratulationsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  congratulationsSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  retryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  retryAnimation: {
    width: width * 0.7,
    height: width * 0.7,
  },
  retryTextContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    alignItems: 'center',
  },
  retryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  retrySubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  evaluatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(88, 214, 141, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  evaluatingAnimation: {
    width: width * 0.7,
    height: width * 0.7,
    marginLeft: -width * 0.05,
  },
  evaluatingTextContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    alignItems: 'center',
  },
  evaluatingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
});

export default RepeatAfterMeScreen; 