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
    text: "Is privacy more important than national security?",
    avatar: require("../../../../assets/images/ai-interviewer-avatar.png"), // Placeholder
  },
  {
    id: "2",
    sender: "user",
    text: "I believe privacy is paramount, but it must be balanced with security. Absolute privacy could shield threats, while unchecked surveillance erodes freedom.",
    avatar: require("../../../../assets/images/user_avatar.png"), // Placeholder
  },
  {
    id: "3",
    sender: "ai",
    text: "But what if privacy endangers lives? Consider scenarios where surveillance could prevent terrorist attacks or major crimes.",
    avatar: require("../../../../assets/images/ai-interviewer-avatar.png"),
  },
  {
    id: "4",
    sender: "ai",
    text: "Also, could you provide a specific example of a time you demonstrated innovation or problem-solving skills?",
    avatar: require("../../../../assets/images/ai-interviewer-avatar.png"),
  },
];

const feedbackItems = [
  {
    id: "1",
    title: "Depth of Ideas",
    description: "Your word choice was diverse and appropriate for the topic.",
    image: require("../../../../assets/images/feedback-depth-ideas.png"), // Placeholder
  },
  {
    id: "2",
    title: "Clarity & Nuance",
    description: "The language is clear, but could be more nuanced. Phrases like 'absolute privacy' and 'unchecked surveillance' are strong but lack precision. Try qualifying these terms.",
    image: require("../../../../assets/images/feedback-clarity-nuance.png"), // Placeholder
  },
];

const CriticalThinkingDialoguesScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Critical Thinking Dialogues" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Chat Interface */}
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
                <Text style={styles.messageSenderText}>{msg.sender === 'ai' ? 'AI Tutor' : 'You'}</Text>
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

        {/* Feedback Section */}
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
  chatContainer: {
    marginBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start", // Align avatar with top of bubble
  },
  aiMessageRow: {
    justifyContent: "flex-start",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 36, // Slightly smaller avatar
    height: 36,
    borderRadius: 18,
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxWidth: "82%", // Adjusted width
  },
  aiMessageBubble: {
    backgroundColor: "#F1F3F5",
    marginLeft: 10,
  },
  userMessageBubble: {
    backgroundColor: "#007AFF",
    marginRight: 10,
  },
  messageSenderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057", // Darker grey for sender
    marginBottom: 3,
  },
  messageText: {
    fontSize: 15,
    color: "#212529",
    lineHeight: 20,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  feedbackSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
    marginTop: 8, // Add some space above feedback section
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
    color: "#495057", // Slightly darker for better readability
    lineHeight: 18,
  },
  feedbackImage: {
    width: 80,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#E9ECEF",
  },
  speakButtonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6", // Lighter border
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

export default CriticalThinkingDialoguesScreen; 