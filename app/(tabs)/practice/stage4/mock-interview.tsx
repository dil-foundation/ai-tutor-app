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
    text: "Why should we admit you?",
  },
  {
    id: "2",
    sender: "user",
    text: "I believe my unique blend of academic excellence, leadership experience, and passion for innovation aligns perfectly with your university's values. I'm confident I can make a significant contribution to your community.",
  },
  {
    id: "3",
    sender: "ai",
    text: "That's a strong start. Can you elaborate on your leadership experience and how it has prepared you for university-level challenges?",
  },
  {
    id: "4",
    sender: "ai",
    text: "Also, could you provide a specific example of a time you demonstrated innovation or problem-solving skills?",
  },
];

const MockInterviewPracticeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mock Interview</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.scenarioContainer}>
            <Text style={styles.scenarioTitle}>University Admissions Interview</Text>
            <Text style={styles.scenarioDescription}>
            You are in an interview with a university admissions officer. Answer their questions confidently.
            </Text>
        </View>

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
                <Ionicons name="business-outline" size={32} color="#93E893" style={styles.avatar}/>
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  scenarioContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#93E893",
    marginBottom: 8,
    textAlign: 'center',
  },
  scenarioDescription: {
    fontSize: 15,
    color: "#D2D5E1",
    textAlign: "center",
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
    marginHorizontal: 5,
  },
  messageBubble: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: "85%",
  },
  aiMessageBubble: {
    backgroundColor: "#1E293B",
  },
  userMessageBubble: {
    backgroundColor: "#93E893",
  },
  messageText: {
    fontSize: 16,
    color: "#D2D5E1",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#111629",
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

export default MockInterviewPracticeScreen; 