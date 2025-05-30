import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Placeholder for actual icons
const BackIcon = () => <Ionicons name="arrow-back" size={24} color="black" />;
const PlayIcon = () => <Ionicons name="play" size={24} color="black" />;
const MicIcon = () => <Ionicons name="mic" size={24} color="gray" />;
const VolumeIcon = () => <Ionicons name="volume-medium" size={24} color="gray" />;

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { urduSentence, englishSentence } = params;

  // Placeholder data for feedback - this would come from an API or processing logic
  const pronunciationPercentage = 85;
  const toneAndIntonation = 'Excellent';
  const feedbackMessage = 'Great job! Try to soften your tone here.';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <BackIcon />
      </TouchableOpacity>
      <Text style={styles.title}>Real-time Urdu-to-English Tutor</Text>

      <Text style={styles.englishSentencePlayback}>{englishSentence || "The weather is beautiful today."}</Text>
      <TouchableOpacity style={styles.playButton}>
        <PlayIcon />
        <Text style={styles.playButtonText}>Play</Text>
      </TouchableOpacity>

      <Text style={styles.feedbackTitle}>Fluency Feedback</Text>
      <View style={styles.feedbackItem}>
        <MicIcon />
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackCategory}>Pronunciation</Text>
          <Text style={styles.feedbackValue}>{pronunciationPercentage}%</Text>
        </View>
      </View>
      <View style={styles.feedbackItem}>
        <VolumeIcon />
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackCategory}>Tone & Intonation</Text>
          <Text style={styles.feedbackValue}>{toneAndIntonation}</Text>
        </View>
      </View>
      <Text style={styles.overallFeedbackMessage}>{feedbackMessage}</Text>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.bottomButton, styles.tryAgainButton]}>
          <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('./')} style={[styles.bottomButton, styles.practiceAnotherButton]}>
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
    alignItems: 'center',
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
    marginTop: 30, // Adjusted for back button
    marginBottom: 30,
  },
  englishSentencePlayback: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 40,
  },
  playButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginLeft: '5%',
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '90%',
  },
  feedbackTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  feedbackCategory: {
    fontSize: 16,
    color: '#333',
  },
  feedbackValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  overallFeedbackMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 'auto',
    width: '90%',
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingBottom: 20, // For spacing from bottom
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
}); 