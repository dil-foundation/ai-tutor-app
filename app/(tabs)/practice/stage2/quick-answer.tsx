import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

const feedbackItems = [
  { id: "1", label: "Pronunciation", iconName: "microphone-outline", checked: true },
  { id: "2", label: "Grammar", iconName: "alphabetical-variant", checked: true },
  { id: "3", label: "Answer Match", iconName: "help-circle-outline", checked: true },
];

const QuestionsAnswersPracticeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Answer</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Responding to WH-questions</Text>

        <View style={styles.chatContainer}>
          <View style={styles.messageRowAI}>
            <Ionicons name="hardware-chip-outline" size={28} color="#93E893" style={styles.avatar}/>
            <View style={[styles.messageBubble, styles.aiMessageBubble]}>
              <Text style={styles.messageSender}>AI Tutor</Text>
              <Text style={styles.messageText}>Where do you live?</Text>
            </View>
          </View>

          <View style={styles.messageRowUser}>
            <View style={[styles.messageBubble, styles.userMessageBubble]}>
              <Text style={[styles.messageText, styles.userMessageText]}>
                I live in Karachi.
              </Text>
            </View>
             <Ionicons name="person-outline" size={28} color="#93E893" style={styles.avatar}/>
          </View>
        </View>

        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Feedback</Text>
          {feedbackItems.map((item) => (
            <View key={item.id} style={styles.feedbackItem}>
              <View style={styles.feedbackIconLabelContainer}>
                <MaterialCommunityIcons
                  name={item.iconName as any}
                  size={24}
                  color="#D2D5E1"
                  style={styles.feedbackIcon}
                />
                <Text style={styles.feedbackLabel}>{item.label}</Text>
              </View>
              {item.checked && (
                <Ionicons name="checkmark-circle" size={24} color="#93E893" />
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
    marginBottom: 30,
  },
  messageRowAI: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  messageRowUser: {
    flexDirection: "row",
    alignItems: "flex-end",
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
    marginLeft: 10,
  },
  userMessageBubble: {
    backgroundColor: "#93E893",
    marginRight: 10,
  },
  messageSender: {
    fontSize: 12,
    color: "#D2D5E1",
    marginBottom: 4,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: "#D2D5E1",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#111629",
  },
  feedbackContainer: {
    marginTop: 16,
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#93E893',
    marginBottom: 15,
  },
  feedbackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#111629",
  },
  feedbackIconLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackIcon: {
    marginRight: 15,
  },
  feedbackLabel: {
    fontSize: 16,
    color: "#D2D5E1",
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

export default QuestionsAnswersPracticeScreen; 