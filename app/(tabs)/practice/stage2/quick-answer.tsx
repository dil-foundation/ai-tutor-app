import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
      <Header title="Questions & Answers Practice" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Responding to WH-questions</Text>

        <View style={styles.chatContainer}>
          <View style={styles.messageRowAI}>
            <Image
              source={require("../../../../assets/images/ai_tutor_avatar.png")}
              style={styles.avatar}
            />
            <View style={[styles.messageBubble, styles.aiMessageBubble]}>
              <Text style={styles.messageSender}>AI Tutor</Text>
              <Text style={styles.messageText}>Where do you live?</Text>
            </View>
          </View>

          <View style={styles.messageRowUser}>
            <View style={[styles.messageBubble, styles.userMessageBubble]}>
              <Text style={styles.messageSender}>Learner</Text>
              <Text style={[styles.messageText, styles.userMessageText]}>
                I live in Karachi.
              </Text>
            </View>
            <Image
              source={require("../../../../assets/images/user_avatar.png")}
              style={styles.avatar}
            />
          </View>
        </View>

        <View style={styles.feedbackContainer}>
          {feedbackItems.map((item) => (
            <View key={item.id} style={styles.feedbackItem}>
              <View style={styles.feedbackIconLabelContainer}>
                <MaterialCommunityIcons
                  name={item.iconName as any}
                  size={24}
                  color="#555555"
                  style={styles.feedbackIcon}
                />
                <Text style={styles.feedbackLabel}>{item.label}</Text>
              </View>
              {item.checked && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
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
    marginBottom: 24,
  },
  messageRowAI: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  messageRowUser: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageBubble: {
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxWidth: "80%",
  },
  aiMessageBubble: {
    backgroundColor: "#F0F0F0",
    marginLeft: 10,
  },
  userMessageBubble: {
    backgroundColor: "#D1E6FF",
    marginRight: 10,
  },
  messageSender: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#000000",
  },
  feedbackContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  feedbackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  feedbackIconLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackIcon: {
    marginRight: 12,
  },
  feedbackLabel: {
    fontSize: 16,
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

export default QuestionsAnswersPracticeScreen; 