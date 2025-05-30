import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";

import { Header } from "../../../../components/Header";

const StorytellingPracticeScreen = () => {
  const router = useRouter();
  const [story, setStory] = useState(
    "I went to the beach with my family. We played in the sand and swam in the ocean. It was a lot of fun."
  );
  const [speakingDuration, setSpeakingDuration] = useState(18);
  const maxDuration = 30;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Storytelling Practice" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Share a Story from Your Life</Text>
        <Text style={styles.subtitle}>Tell me about a special day from your life.</Text>

        <View style={styles.durationContainer}>
          <Text style={styles.durationLabel}>Speaking Duration</Text>
          <Text style={styles.durationValue}>
            {speakingDuration}/{maxDuration}s
          </Text>
        </View>
        <Progress.Bar
          progress={speakingDuration / maxDuration}
          width={null} // null means it will take the full width of its parent
          style={styles.progressBar}
          color="#007AFF"
          unfilledColor="#E0E0E0"
          borderWidth={0}
        />

        <TextInput
          style={styles.storyInput}
          multiline
          value={story}
          onChangeText={setStory}
          placeholder="Start writing your story here..."
        />

        <Text style={styles.feedbackText}>
          Great storytelling! Try adding sequence words like 'First, then, after that'.
        </Text>

        <TouchableOpacity style={styles.ideaButton}>
          <Text style={styles.ideaButtonText}>Need an idea?</Text>
        </TouchableOpacity>
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
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 14,
    color: "#333",
  },
  durationValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  storyInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  feedbackText: {
    fontSize: 14,
    color: "#007AFF", // Blue color for positive feedback
    marginBottom: 24,
    textAlign: "center",
    fontStyle: "italic",
  },
  ideaButton: {
    backgroundColor: "#EFEFF4",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginBottom: 20, // Space before the speak button section
  },
  ideaButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
  speakButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#F5F5F5", // Match screen background
  },
  speakButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25, // Make it pill-shaped
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default StorytellingPracticeScreen; 