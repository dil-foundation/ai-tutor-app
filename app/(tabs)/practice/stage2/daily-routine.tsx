import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Header } from "../../../../components/Header";

const DailyRoutineNarrationScreen = () => {
  const router = useRouter();
  const [response, setResponse] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Daily Routine Narration" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>
            Sentence building + fluency using familiar topics
          </Text>
          <Text style={styles.prompt}>
            Tell me about your morning routine. What do you do after you wake up?
          </Text>
          <Text style={styles.responseLabel}>Your Response</Text>
          <TextInput
            style={styles.responseInput}
            multiline
            placeholder="Type your response here..."
            value={response}
            onChangeText={setResponse}
          />
          <Text style={styles.feedbackText}>
            Nice! Try saying it with time words like 'then' or 'after that'.
          </Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.speakButtonContainer}>
          <TouchableOpacity style={styles.speakButton}>
            <Ionicons name="mic" size={24} color="#FFFFFF" />
            <Text style={styles.speakButtonText}>Speak</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24, // Increased top padding
    paddingBottom: 20,
  },
  title: {
    fontSize: 18, // Slightly smaller title
    fontWeight: "600", // Semi-bold
    color: "#333333",
    marginBottom: 12, // Increased margin
    textAlign: "left",
  },
  prompt: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 24, // Increased margin
    lineHeight: 22,
    textAlign: "left",
  },
  responseLabel: {
    fontSize: 14, // Label for the text input
    color: "#666666",
    marginBottom: 8,
    textAlign: "left",
  },
  responseInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 16,
    minHeight: 150, // Made text area taller
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#000000",
  },
  feedbackText: {
    fontSize: 14,
    color: "#555555", // Darker grey for feedback
    textAlign: "left",
    fontStyle: "normal", // Not italic as per image
    marginBottom: 24, // Space before retry button
  },
  retryButton: {
    backgroundColor: "#E0E0E0", // Grey background for retry
    borderRadius: 20, // Pill shape
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center", // Centered button
    marginBottom: 20,
  },
  retryButtonText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "600",
  },
  speakButtonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  speakButton: {
    backgroundColor: "#007AFF", // Standard blue
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

export default DailyRoutineNarrationScreen; 