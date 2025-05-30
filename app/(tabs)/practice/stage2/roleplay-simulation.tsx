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
    text: "What would you like to eat?",
    avatar: require("../../../../assets/images/ai-avatar-chef.png"), // Replace with actual avatar
  },
  {
    id: "2",
    sender: "user",
    text: "I would like a chicken burger and a juice.",
    avatar: require("../../../../assets/images/user_avatar.png"), // Replace with actual avatar
  },
  {
    id: "3",
    sender: "ai",
    text: "Anything else?",
    avatar: require("../../../../assets/images/ai-avatar-chef.png"),
  },
  {
    id: "4",
    sender: "user",
    text: "No, thank you.",
    avatar: require("../../../../assets/images/user_avatar.png"),
  },
  {
    id: "5",
    sender: "ai",
    text: "Perfect! You used 'I would like' correctly.",
    avatar: require("../../../../assets/images/ai-avatar-chef.png"),
    isFeedback: true,
  },
];

const RoleplaySimulationScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Roleplay Simulation" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Order Food at a Restaurant</Text>

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
                  msg.isFeedback && styles.feedbackBubble, // Special style for feedback from AI
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === "user" && styles.userMessageText,
                    msg.isFeedback && styles.feedbackText, // Special style for feedback text
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
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 24,
    textAlign: "center",
  },
  chatContainer: {
    flex: 1, // Ensure chat takes available space before button
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
    borderRadius: 18, // More rounded corners
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxWidth: "75%",
    minHeight: 40, // Ensure consistent bubble height for short messages
    justifyContent: "center",
  },
  aiMessageBubble: {
    backgroundColor: "#F0F0F0", // Light grey for AI
    marginLeft: 10,
  },
  userMessageBubble: {
    backgroundColor: "#ADD8E6", // Light blue for user
    marginRight: 10,
  },
  feedbackBubble: {
    backgroundColor: "#F0F0F0", // Same as AI for feedback bubble
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#000000", // User text is black as per image
  },
  feedbackText: {
    fontStyle: "italic",
    color: "#333333",
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

export default RoleplaySimulationScreen; 