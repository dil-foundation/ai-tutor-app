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
    text: "Is privacy more important than national security?",
  },
  {
    id: "2",
    sender: "user",
    text: "I believe privacy is paramount, but it must be balanced with security. Absolute privacy could shield threats, while unchecked surveillance erodes freedom.",
  },
  {
    id: "3",
    sender: "ai",
    text: "But what if privacy endangers lives? Consider scenarios where surveillance could prevent terrorist attacks or major crimes.",
  },
  {
    id: "4",
    sender: "ai",
    text: "Also, could you provide a specific example of a time you demonstrated innovation or problem-solving skills?",
  },
];

const feedbackItems = [
  {
    id: "1",
    title: "Depth of Ideas",
    description: "Your word choice was diverse and appropriate for the topic.",
    icon: "bulb-outline" as const,
  },
  {
    id: "2",
    title: "Clarity & Nuance",
    description: "The language is clear, but could be more nuanced. Phrases like 'absolute privacy' and 'unchecked surveillance' are strong but lack precision. Try qualifying these terms.",
    icon: "options-outline" as const,
  },
];

const CriticalThinkingDialoguesScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Critical Thinking</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Ionicons name="person-outline" size={28} color="#93E893" style={styles.avatar}/>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.feedbackSectionTitle}>Feedback</Text>
        {feedbackItems.map((item) => (
          <View key={item.id} style={styles.feedbackCard}>
            <Ionicons name={item.icon} size={32} color="#93E893" style={styles.feedbackIcon} />
            <View style={styles.feedbackTextContainer}>
              <Text style={styles.feedbackTitle}>{item.title}</Text>
              <Text style={styles.feedbackDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  chatContainer: {
    marginBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  aiMessageRow: {
    justifyContent: "flex-start",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  avatar: {
    marginHorizontal: 5,
    marginTop: 5,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 15,
    maxWidth: "85%",
  },
  aiMessageBubble: {
    backgroundColor: "#1E293B",
  },
  userMessageBubble: {
    backgroundColor: "#93E893",
  },
  messageSenderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#D2D5E1",
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
    color: "#D2D5E1",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#111629",
  },
  feedbackSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D2D5E1",
    marginBottom: 15,
  },
  feedbackCard: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
  },
  feedbackIcon: {
    marginRight: 20,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#93E893",
    marginBottom: 4,
  },
  feedbackDescription: {
    fontSize: 14,
    color: "#D2D5E1",
    lineHeight: 20,
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#111629',
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

export default CriticalThinkingDialoguesScreen; 