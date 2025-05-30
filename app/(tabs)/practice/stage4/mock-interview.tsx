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

const messages = [
  {
    id: "1",
    sender: "ai",
    text: "Why should we admit you?",
    avatar: require("../../../../assets/images/ai-interviewer-avatar.png"), // Placeholder
  },
  {
    id: "2",
    sender: "user",
    text: "I believe my unique blend of academic excellence, leadership experience, and passion for innovation aligns perfectly with your university's values. I'm confident I can make a significant contribution to your community.",
    avatar: require("../../../../assets/images/user_avatar.png"), // Placeholder
  },
  {
    id: "3",
    sender: "ai",
    text: "That's a strong start. Can you elaborate on your leadership experience and how it has prepared you for university-level challenges?",
    avatar: require("../../../../assets/images/ai-interviewer-avatar.png"),
  },
  {
    id: "4",
    sender: "ai",
    text: "Also, could you provide a specific example of a time you demonstrated innovation or problem-solving skills?",
    avatar: require("../../../../assets/images/ai-interviewer-avatar.png"),
  },
];

const MockInterviewPracticeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Mock Interview Practice" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.scenarioTitle}>Scenario</Text>
        <Text style={styles.scenarioDescription}>
          Pretend I'm a university admissions officer.
        </Text>

        <View style={styles.chatContainer}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === "user"
                  ? styles.userMessageRow
                  : styles.aiMessageRow,
              ]}
            >
              {msg.sender === "ai" && (
                <Image source={msg.avatar} style={styles.avatar} />
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === "user"
                    ? styles.userMessageBubble
                    : styles.aiMessageBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === "user" && styles.userMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
              {msg.sender === "user" && (
                <Image source={msg.avatar} style={styles.avatar} />
              )}
            </View>
          ))}
        </View>
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
  scenarioTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 24,
    lineHeight: 22,
  },
  chatContainer: {
    flex: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  aiMessageRow: {
    justifyContent: "flex-start",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 12, // Increased padding for better look
    paddingHorizontal: 16,
    maxWidth: "80%", // Adjusted width
    minHeight: 44, // Min height for bubbles
    justifyContent: "center",
  },
  aiMessageBubble: {
    backgroundColor: "#F1F3F5", // Lighter grey for AI
    marginLeft: 10,
  },
  userMessageBubble: {
    backgroundColor: "#007AFF", // Blue for user
    marginRight: 10,
  },
  messageText: {
    fontSize: 15, // Slightly smaller text
    color: "#212529", // Darker text for AI
    lineHeight: 20,
  },
  userMessageText: {
    color: "#FFFFFF", // White text for user
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

export default MockInterviewPracticeScreen; 