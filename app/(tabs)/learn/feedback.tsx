import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Placeholder for actual icons
const BackIcon = () => <Ionicons name="arrow-back" size={24} color="black" />;
const PlayIcon = () => <Ionicons name="play" size={24} color="black" />;
const MicIcon = () => <Ionicons name="mic" size={24} color="#007AFF" />;

interface FeedbackData {
  user_text: string;
  pronunciation_score: number;
  fluency_feedback: string;
}

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
    console.log('Fetching feedback for:', audioUri, 'Expected:', expectedText);

    try {
      const formData = new FormData();
      formData.append('expected_text', expectedText);

      if (Platform.OS === 'web' && audioUri.startsWith('blob:')) {
        const audioBlob = await fetch(audioUri).then(res => res.blob());
        formData.append('file', audioBlob, `practiced-audio-${Date.now()}.webm`);
      } else {
        formData.append('file', {
          uri: audioUri,
          name: `practiced-audio-${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`,
          type: `audio/${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`,
        } as any);
      }

      const response = await fetch('http://localhost:8000/api/translate/feedback', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Feedback API error: ${response.status} - ${errorText}`);
      }

      const resultData = await response.json(); // Parse as JSON
      console.log("Parsed Feedback API Response:", resultData);
      
      if (resultData && typeof resultData.pronunciation_score === 'number' && typeof resultData.fluency_feedback === 'string') {
        setFeedbackResult(resultData as FeedbackData);
      } else {
        console.warn("Feedback API response format unexpected:", resultData);
        let responseText = "";
        try {
            responseText = JSON.stringify(resultData);
        } catch (e) {
            responseText = "Invalid JSON received from server.";
        }
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
      <Text style={styles.title}>Real-time Urdu-to-English Tutor</Text>

      <Text style={styles.englishSentencePlayback}>{targetEnglishText || "The weather is beautiful today."}</Text>
      <TouchableOpacity style={styles.playButton} onPress={playPracticedAudio}>
        <PlayIcon />
        <Text style={styles.playButtonText}>Play Your Practice</Text>
      </TouchableOpacity>

      <Text style={styles.feedbackTitle}>Fluency Feedback</Text>

      {isLoading && (
        <View style={styles.centeredMessageContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
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
              <Text style={styles.feedbackCategory}>Pronunciation Score</Text>
            </View>
            <Text style={styles.pronunciationScoreText}>{feedbackResult.pronunciation_score.toFixed(1)}%</Text>
          </View>

          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackCategory}>Detailed Feedback:</Text>
            <Text style={styles.apiFeedbackText}>
              {feedbackResult.fluency_feedback.replace(/\\n/g, '\n')}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.bottomButton, styles.tryAgainButton]}>
          <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('../learn')} style={[styles.bottomButton, styles.practiceAnotherButton]}>
          <Text style={styles.practiceAnotherButtonText}>Practice Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F6F7',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  englishSentencePlayback: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 25,
    alignSelf: 'center',
  },
  playButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: '5%',
  },
  feedbackContentContainer: {
    width: '100%',
    paddingHorizontal: '5%',
    marginBottom: 'auto',
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  feedbackItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  feedbackCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  pronunciationScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 5,
  },
  apiFeedbackText: {
    fontSize: 15,
    color: '#444',
    marginTop: 8,
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '5%',
    paddingVertical: 20,
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    backgroundColor: '#F5F6F7',
  },
  bottomButton: {
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  tryAgainButton: {
    backgroundColor: '#007AFF',
  },
  tryAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  practiceAnotherButton: {
    backgroundColor: '#e0e0e0',
  },
  practiceAnotherButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredMessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
}); 