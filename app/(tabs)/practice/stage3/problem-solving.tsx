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
    text: "Hi, I can do the writing. What about you?",
    sender: "ai",
  },
  {
    id: "2",
    text: "I can present the project.",
    sender: "user",
  },
];

const ProblemSolvingSimulationsScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Problem Solving</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageSubtitle}>Virtual Group Talk</Text>
        <View style={styles.scenarioContainer}>
            <Text style={styles.scenarioTitle}>School Project</Text>
            <Text style={styles.scenarioDescription}>
            You are working on a group project. Discuss roles with your team.
            </Text>
            <View style={styles.aiPersonaContainer}>
              <Ionicons name="person-circle-outline" size={32} color="#93E893" style={styles.groupAvatar} />
              <Ionicons name="person-circle-outline" size={32} color="#93E893" style={styles.groupAvatar} />
              <Ionicons name="person-circle-outline" size={32} color="#93E893" style={styles.groupAvatar} />
            </View>
        </View>

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
                <Text style={msg.sender === 'user' ? styles.userMessageText : styles.messageText}>{msg.text}</Text>
              </View>
              {msg.sender === "user" && (
                <Ionicons name="person-outline" size={28} color="#93E893" style={styles.avatar}/>
              )}
            </View>
          ))}
        </View>

        <View style={styles.feedbackBox}>
             <Ionicons name="information-circle-outline" size={24} color="#93E893" style={styles.feedbackIcon} />
            <Text style={styles.feedbackText}>
            Good teamwork! You took initiative and used polite coordination.
            </Text>
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
    paddingBottom: 20,
  },
  pageSubtitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: '#D2D5E1'
  },
  scenarioContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: '#93E893'
  },
  scenarioDescription: {
    fontSize: 15,
    textAlign: "center",
    color: "#D2D5E1",
    marginBottom: 16,
  },
  aiPersonaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  groupAvatar: {
    marginHorizontal: 5,
  },
  chatContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
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
  messageText: {
    fontSize: 16,
    color: "#D2D5E1",
  },
  userMessageText: {
    fontSize: 16,
    color: "#111629",
  },
  feedbackBox: {
    backgroundColor: 'rgba(147, 232, 147, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  feedbackIcon: {
    marginRight: 15,
  },
  feedbackText: {
    fontSize: 16,
    color: "#93E893",
    flex: 1,
    fontStyle: 'italic',
  },
  bottomBar: {
    padding: 16,
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

export default ProblemSolvingSimulationsScreen; 