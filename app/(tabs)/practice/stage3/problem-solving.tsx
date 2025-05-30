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

// Dummy chat messages for the simulation
const messages = [
  {
    id: "1",
    text: "Hi, I can do the writing. What about you?",
    sender: "ai",
    avatar: require("../../../../assets/images/ai-avatar-1.png"), // Replace with actual avatar
  },
  {
    id: "2",
    text: "I can present the project.",
    sender: "user",
    avatar: require("../../../../assets/images/user_avatar.png"), // Replace with actual avatar
  },
  // Add more messages to simulate a group discussion
];

const ProblemSolvingSimulationsScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Problem Solving Simulations" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageSubtitle}>Virtual Group Talk</Text>
        <Text style={styles.scenarioTitle}>School Project</Text>
        <Text style={styles.scenarioDescription}>
          You are working on a group project. Discuss roles with your team.
        </Text>

        {/* AI Persona Avatars */}
        <View style={styles.aiPersonaContainer}>
          <Image source={require("../../../../assets/images/ai-avatar-1.png")} style={styles.groupAvatar} />
          <Image source={require("../../../../assets/images/ai-avatar-2.png")} style={styles.groupAvatar} />
          <Image source={require("../../../../assets/images/ai-avatar-3.png")} style={styles.groupAvatar} />
        </View>

        {/* Chat Interface */}
        <View style={styles.chatContainer}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === "user" ? styles.userMessageRow : styles.aiMessageRow,
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
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
              {msg.sender === "user" && (
                <Image source={msg.avatar} style={styles.avatar} />
              )}
            </View>
          ))}
        </View>

        <Text style={styles.feedbackText}>
          Good teamwork! You took initiative and used polite coordination.
        </Text>

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
    paddingBottom: 20, // For content below the fold
  },
  pageSubtitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 15,
    textAlign: "center",
    color: "#555",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  aiPersonaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  groupAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 4,
  },
  chatContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end", // Align avatar with bottom of bubble
    marginBottom: 10,
  },
  aiMessageRow: {
    justifyContent: "flex-start",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxWidth: "75%",
  },
  aiMessageBubble: {
    backgroundColor: "#F0F0F0",
    marginLeft: 8,
  },
  userMessageBubble: {
    backgroundColor: "#007AFF",
    marginRight: 8,
  },
  messageText: {
    fontSize: 16,
    color: "#000", // Default for AI, user text color set below
  },
  userMessageBubbleText: { // Specific style for user message text if needed (e.g. color)
    color: "#FFFFFF",
  },
  feedbackText: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#E6F7FF",
    borderRadius: 8,
  },
  speakButtonContainer: {
    padding: 16,
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

export default ProblemSolvingSimulationsScreen; 