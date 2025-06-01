import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AIGuidedSpontaneousSpeechScreen = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spontaneous Speaking Challenge</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require("../../../../assets/images/abstract-topic-graphic-1.png")} // Update this path as needed
          style={styles.mainImage}
        />
        {/* <View style={styles.imageOverlay}>
          <Text style={styles.overlayTextTitle}>
            Leadership in the 21st Century
          </Text>
          <Text style={styles.overlayText}>
            Discuss the evolving role of leadership in today's rapidly changing
            world. Consider the impact of technology, globalization, and
            societal shifts on effective leadership.
          </Text>
        </View> */}
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>02</Text>
          <Text style={styles.timerLabel}>Minutes</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>00</Text>
          <Text style={styles.timerLabel}>Seconds</Text>
        </View>
      </View>

      <Text style={styles.liveTranscriptionTitle}>Live Transcription</Text>
      <Text style={styles.liveTranscriptionText}>...</Text>

      <Text style={styles.feedbackTitle}>AI Feedback</Text>

      <View style={styles.feedbackCard}>
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackItemTitle}>Hesitation Score</Text>
          <Text style={styles.feedbackItemValue}>12 hesitations</Text>
        </View>
        <Image
          source={require("../../../../assets/images/feedback-vocab-1.png")} // Placeholder, update as needed
          style={styles.feedbackImage}
        />
      </View>

      <View style={styles.feedbackCard}>
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackItemTitle}>Speech Duration</Text>
          <Text style={styles.feedbackItemValue}>2 minutes 15 seconds</Text>
        </View>
        <Image
          source={require("../../../../assets/images/feedback-sentence-1.png")} // Placeholder, update as needed
          style={styles.feedbackImage}
        />
      </View>

      <View style={styles.feedbackCard}>
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackItemTitle}>Vocabulary Range & Grammar Accuracy</Text>
          <Text style={styles.feedbackItemValue}>Advanced vocabulary, minor grammatical errors</Text>
        </View>
        <Image
          source={require("../../../../assets/images/abstract-art-1.png")} // Placeholder, update as needed
          style={styles.feedbackImage}
        />
      </View>

      <View style={styles.feedbackCard}>
        <View style={styles.feedbackTextContainer}>
          <Text style={styles.feedbackItemTitle}>Coherence & Logical Flow</Text>
          <Text style={styles.feedbackItemValue}>Well-structured arguments, clear progression of ideas</Text>
        </View>
        {/* Add image if available */}
      </View>

      <TouchableOpacity style={styles.speakButton}>
        <Text style={styles.speakButtonText}>Speak</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50, // Adjust as per status bar height
    paddingBottom: 10,
  },
  backButton: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 20,
  },
  mainImage: {
    width: "90%",
    height: 460,
    // height: "100%",
    borderRadius: 10,
    marginTop: 10,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 10,
    left: 25, // Adjust to align with image
    right: 25, // Adjust to align with image
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  overlayTextTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  overlayText: {
    color: "#fff",
    fontSize: 12,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    paddingHorizontal: "10%",
  },
  timerBox: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    minWidth: 100,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  timerLabel: {
    fontSize: 12,
    color: "#555",
  },
  liveTranscriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
  },
  liveTranscriptionText: {
    fontSize: 14,
    marginHorizontal: 20,
    marginVertical: 10,
    color: "#333",
    fontStyle: "italic",
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  feedbackCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  feedbackTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  feedbackItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  feedbackItemValue: {
    fontSize: 12,
    color: "#555",
  },
  feedbackImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  speakButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25, // Pill shape
    marginHorizontal: "20%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  speakButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AIGuidedSpontaneousSpeechScreen; 