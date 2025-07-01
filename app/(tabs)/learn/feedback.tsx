import BASE_API_URL from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';


// Placeholder for actual icons
const BackIcon = () => <Ionicons name="arrow-back" size={24} color="#D2D5E1" />;
const PlayIcon = () => <Ionicons name="play" size={24} color="#111629" />;
const MicIcon = () => <Ionicons name="mic" size={24} color="#93E893" />;

interface FeedbackData {
  user_text: string;
  pronunciation_score: number;
  fluency_feedback: string;
  pronunciation_percent?: string;
}

// +++ Utility function to convert Blob to Base64 (if not already globally available/imported) +++
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(blob);
  });
};
// +++ End of utility function +++

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ practicedAudioUri?: string; targetEnglishText?: string }>();
  const { practicedAudioUri, targetEnglishText } = params;

  const [feedbackResult, setFeedbackResult] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (practicedAudioUri && targetEnglishText) {
      fetchFeedback(practicedAudioUri, targetEnglishText);
    }
    return () => {
      if (soundRef.current) {
        console.log("FeedbackScreen: Unloading sound on unmount");
        soundRef.current.unloadAsync().catch(e => console.warn("FeedbackScreen: Error unloading sound on unmount", e));
      }
    };
  }, [practicedAudioUri, targetEnglishText]);

  const fetchFeedback = async (audioUri: string, expectedText: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setFeedbackResult(null);
    console.log('Fetching feedback. Expected:', expectedText, 'Audio URI:', audioUri);

    try {
      let audioBase64: string | null = null;
      let originalFilename = `practiced-audio-${Date.now()}`;
      let originalContentType = 'audio/wav'; // Default, can be refined

      if (Platform.OS === 'web' && audioUri.startsWith('blob:')) {
        console.log('Web platform: fetching blob from URI to convert to Base64');
        const audioBlob = await fetch(audioUri).then(res => {
            if (!res.ok) throw new Error('Failed to fetch blob for Base64 conversion');
            return res.blob();
        });
        originalFilename += '.webm'; // Or derive from blob.type
        originalContentType = audioBlob.type || 'audio/webm';
        audioBase64 = await blobToBase64(audioBlob);
      } else if (Platform.OS !== 'web' && audioUri.startsWith('file://')) {
        console.log('Native platform: reading file URI to convert to Base64');
        // For native, FileSystem can read file as base64 directly
        audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        originalFilename += '.' + (Platform.OS === 'ios' ? 'm4a' : 'mp4');
        originalContentType = `audio/${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`;
      } else {
        throw new Error('Unsupported audio URI format for feedback.');
      }

      if (!audioBase64) {
        throw new Error('Failed to convert audio to Base64.');
      }
      console.log('Audio converted to Base64 for feedback. Length:', audioBase64.length);

      const payload = {
        expected_text: expectedText,
        audio_base64: audioBase64,
        filename: originalFilename,
        content_type: originalContentType
      };

      const response = await fetch(`${BASE_API_URL}/api/translate/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Feedback API error: ${response.status} - ${errorText}`);
      }

      const resultData = await response.json();
      console.log("Parsed Feedback API Response:", resultData);
      
      if (
        resultData &&
        typeof resultData.user_text === 'string' &&
        typeof resultData.pronunciation_score === 'number' &&
        resultData.fluency_feedback &&
        typeof resultData.fluency_feedback.feedback === 'string' &&
        typeof resultData.fluency_feedback.pronunciation_score === 'string'
      ) {
        setFeedbackResult({
          user_text: resultData.user_text,
          pronunciation_score: Number(resultData.pronunciation_score),
          fluency_feedback: resultData.fluency_feedback.feedback,
          pronunciation_percent: resultData.fluency_feedback.pronunciation_score
        });
      } else {
        console.warn("Feedback API response format unexpected after parsing check:", resultData);
        let responseText = "Invalid data structure received.";
        try {
            responseText = JSON.stringify(resultData);
        } catch (e) { /* ignore if stringify fails */ }
        throw new Error(`Received unexpected data format from feedback API. Response: ${responseText}`);
      }

    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      setErrorMessage(error.message || 'Failed to get feedback from API.');
    }
    setIsLoading(false);
  };

  const playPracticedAudio = async () => {
    if (!practicedAudioUri) {
      setErrorMessage("No practiced audio URI found.");
      return;
    }

    if (soundRef.current) {
      console.log('Stopping and unloading previous sound...');
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.warn('Error stopping/unloading previous sound:', e);
      }
      soundRef.current = null;
    }

    try {
      console.log('Playing practiced audio from URI:', practicedAudioUri);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: practicedAudioUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      soundRef.current.setOnPlaybackStatusUpdate(async (status) => {
        if (!status.isLoaded) {
          if (status.error) {
            console.error(`Playback Error: ${status.error}`);
            setErrorMessage('Error playing practiced audio: ' + status.error);
            try {
              await soundRef.current?.unloadAsync();
            } catch (e) { /* ignore */ }
            soundRef.current = null;
          }
        } else {
          if (status.didJustFinish) {
            console.log('Practiced audio playback finished.');
            try {
              await soundRef.current?.unloadAsync();
            } catch (e) { /* ignore */ }
            soundRef.current = null;
          }
        }
      });
    } catch (error: any) {
      console.error('Failed to play practiced audio:', error);
      setErrorMessage(error.message || 'Could not play the practiced audio.');
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (e) { /* ignore */ }
        soundRef.current = null;
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <BackIcon />
      </TouchableOpacity>
      <Text style={styles.title}>Your Feedback</Text>

      <Text style={styles.englishSentencePlayback}>{targetEnglishText || "The weather is beautiful today."}</Text>
      <TouchableOpacity style={styles.playButton} onPress={playPracticedAudio}>
        <PlayIcon />
        <Text style={styles.playButtonText}>Play Your Practice</Text>
      </TouchableOpacity>

      <Text style={styles.feedbackTitle}>Fluency Feedback</Text>

      {isLoading && (
        <View style={styles.centeredMessageContainer}>
            <ActivityIndicator size="large" color="#93E893" />
            <Text style={styles.loadingText}>Getting your feedback...</Text>
        </View>
      )}

      {errorMessage && (
        <View style={styles.centeredMessageContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="red" />
            <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {feedbackResult && !isLoading && !errorMessage && (
        <View style={styles.feedbackContentContainer}>
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackItemRow}>
              <MicIcon />
              <Text style={[styles.feedbackCategory, { marginLeft: 10 }]}>Pronunciation Score</Text>
            </View>
            <Text style={styles.pronunciationScoreText}>
              {feedbackResult.pronunciation_percent}
            </Text>
          </View>
          
          <View style={styles.feedbackCard}>
            <Text style={[styles.feedbackCategory, { marginBottom: 10 }]}>Detailed Feedback:</Text>
            <Text style={styles.apiFeedbackText}>
              {feedbackResult.fluency_feedback}
            </Text>
          </View>
        </View>
      )}

    {/* 🎇 Spark Animation only if score > 75% */}
    {parseInt(feedbackResult?.pronunciation_percent?.replace('%', '') || '0') > 75 && (
      <LottieView
        source={require('../../../assets/animations/sparkle.json')}
        autoPlay
        loop={false}
        style={{ width: 300, height: 300, marginTop: 20, alignSelf: 'center' }}
      />
    )}
    
    {!isLoading && feedbackResult && (
      <View style={styles.actionButtonsContainer}>
        {parseInt(feedbackResult.pronunciation_percent?.replace('%', '') || '0') < 75 ? (
          <TouchableOpacity style={styles.tryAgainButton} onPress={() => router.back()}>
            <Ionicons name="refresh-outline" size={20} color="#111629" />
            <Text style={styles.tryAgainButtonText}>Try Again</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.practiceAnotherButton} onPress={() => router.push('/(tabs)/learn')}>
            <Ionicons name="play-forward-outline" size={20} color="#D2D5E1" />
            <Text style={styles.practiceAnotherButtonText}>Practice Another</Text>
          </TouchableOpacity>
        )}
      </View>
    )}

    

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: '#111629',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#93E893',
    textAlign: 'center',
    marginBottom: 20,
  },
  englishSentencePlayback: {
    fontSize: 20,
    color: '#D2D5E1',
    textAlign: 'center',
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#93E893',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  playButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#111629',
    fontWeight: '500',
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#93E893',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#D2D5E1',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  feedbackContentContainer: {
    flex: 1,
  },
  feedbackCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  feedbackItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  feedbackCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D2D5E1',
  },
  pronunciationScoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#93E893',
    textAlign: 'center',
  },
  apiFeedbackText: {
    fontSize: 16,
    color: '#D2D5E1',
    lineHeight: 24,
  },
  actionButtonsContainer: {
    paddingVertical: 20,
    backgroundColor: '#111629',
    borderTopColor: '#1E293B',
    borderTopWidth: 1,
  },
  tryAgainButton: {
    backgroundColor: '#93E893',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  tryAgainButtonText: {
    color: '#111629',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  practiceAnotherButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    borderColor: '#D2D5E1',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  practiceAnotherButtonText: {
    color: '#D2D5E1',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 