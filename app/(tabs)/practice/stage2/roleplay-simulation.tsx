import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const messages = [
  {
    id: "1",
    sender: "ai",
    text: "What would you like to eat?",
  },
  {
    id: "2",
    sender: "user",
    text: "I would like a chicken burger and a juice.",
  },
  {
    id: "3",
    sender: "ai",
    text: "Anything else?",
  },
  {
    id: "4",
    sender: "user",
    text: "No, thank you.",
  },
  {
    id: "5",
    sender: "ai",
    text: "Perfect! You used 'I would like' correctly.",
    isFeedback: true,
  },
];

const RoleplaySimulationScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Roleplay Simulation</Text>
      </View>
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
                <Ionicons name="hardware-chip-outline" size={28} color="#93E893" style={styles.avatar}/>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === "user"
                    ? styles.userMessageBubble
                    : styles.aiMessageBubble,
                  msg.isFeedback && styles.feedbackBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === "user" && styles.userMessageText,
                    msg.isFeedback && styles.feedbackText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
              {msg.sender === "user" && (
                 <Ionicons name="person-outline" size={28} color="#93E893" style={styles.avatar}/>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic-outline" size={28} color="#111629" />
          <Text style={styles.speakButtonText}>Speak Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111629",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#111629',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#93E893',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#D2D5E1",
    marginBottom: 24,
    textAlign: "center",
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
    marginHorizontal: 5,
  },
  messageBubble: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: "80%",
  },
  aiMessageBubble: {
    backgroundColor: "#1E293B",
  },
  userMessageBubble: {
    backgroundColor: "#93E893",
  },
  feedbackBubble: {
    backgroundColor: "rgba(147, 232, 147, 0.2)",
    borderWidth: 1,
    borderColor: "#93E893",
  },
  messageText: {
    fontSize: 16,
    color: "#D2D5E1",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#111629",
  },
  feedbackText: {
    fontStyle: "italic",
    color: "#93E893",
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#111629",
  },
  speakButton: {
    backgroundColor: "#93E893",
    borderRadius: 30,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  speakButtonText: {
    color: "#111629",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
});

export default RoleplaySimulationScreen; 