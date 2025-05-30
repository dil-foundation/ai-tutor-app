import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Header } from "../../../../components/Header";

const feedbackItems = [
  {
    id: "1",
    title: "Vocabulary Richness",
    description: "Your word choice was diverse and appropriate for the topic.",
    image: require("../../../../assets/images/feedback-vocab.png"), // Placeholder
  },
  {
    id: "2",
    title: "Sentence Structure",
    description: "You used a variety of sentence lengths and structures effectively.",
    image: require("../../../../assets/images/feedback-sentence.png"), // Placeholder
  },
];

const AbstractTopicMonologueScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Abstract Topic Monologue" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Speak Your Mind</Text>
        <Image
          source={require("../../../../assets/images/abstract-art.png")} // Placeholder
          style={styles.mainImage}
        />

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

        <Text style={styles.transcriptionPlaceholder}>
          Live transcription will appear here
        </Text>

        <Text style={styles.feedbackSectionTitle}>Feedback</Text>
        {feedbackItems.map((item) => (
          <View key={item.id} style={styles.feedbackCard}>
            <View style={styles.feedbackTextContainer}>
              <Text style={styles.feedbackTitle}>{item.title}</Text>
              <Text style={styles.feedbackDescription}>{item.description}</Text>
            </View>
            <Image source={item.image} style={styles.feedbackImage} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.speakButtonContainer}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic" size={24} color="#FFFFFF" />
          <Text style={styles.speakButtonText}>Speak</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#000000",
  },
  mainImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: "#F0F0F0", // Placeholder bg
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  timerBox: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 100, // Ensure boxes have some width
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#343A40",
  },
  timerLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 4,
  },
  transcriptionPlaceholder: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 24,
    paddingVertical: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  feedbackSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
  },
  feedbackCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  feedbackTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343A40",
    marginBottom: 4,
  },
  feedbackDescription: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 18,
  },
  feedbackImage: {
    width: 80,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#E9ECEF", // Placeholder bg
  },
  speakButtonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  speakButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default AbstractTopicMonologueScreen; 