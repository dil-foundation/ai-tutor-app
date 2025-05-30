import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
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

const interviewTabs = [
  { id: "1", title: "Graduate School" },
  { id: "2", title: "Job Interview" },
  { id: "3", title: "Cultural Exchange" },
];

const messages = [
  {
    id: "1",
    sender: "ai",
    text: "Tell me about a time you had to lead a team through a challenging project. What was your role, and how did you ensure the project's success?",
    avatar: require("../../../../assets/images/ai-interviewer-male.png"), // Placeholder
  },
  {
    id: "2",
    sender: "user",
    text: "In my previous role, we faced a tight deadline for a product launch. I coordinated the team, delegated tasks based on strengths, and maintained open communication. We successfully launched on time.",
    avatar: require("../../../../assets/images/user_avatar.png"), // Placeholder
  },
  {
    id: "3",
    sender: "ai",
    text: "That's a great example. Now, can you elaborate on the specific challenges you encountered and how you overcame them?",
    avatar: require("../../../../assets/images/ai-interviewer-male.png"),
  },
    {
    id: "4",
    sender: "user",
    text: "One major challenge was aligning different team members\' priorities. I held regular check-ins, clarified objectives, and fostered a collaborative environment. This helped us stay focused and achieve our goals.",
    avatar: require("../../../../assets/images/user_avatar.png"),
  },
];

const feedbackItems = [
  {
    id: "1",
    title: "STAR Model Use",
    description: "Your response effectively used the STAR method, providing a clear Situation, Task, Action, and Result. This structure enhances clarity and impact.",
    image: require("../../../../assets/images/feedback-star-model.png"), // Placeholder
  },
  {
    id: "2",
    title: "Vocabulary Upgrade Suggestions",
    description: "Consider using phrases like \'spearheaded the initiative\' instead of \'coordinated the team\' to add more impact to your leadership role.",
    image: require("../../../../assets/images/feedback-vocab-upgrade.png"), // Placeholder
  },
  {
    id: "3",
    title: "Fluency & Precision",
    description: "Your communication was fluent and precise. Focus on varying sentence structures to maintain listener engagement.",
    image: require("../../../../assets/images/feedback-fluency.png"), // Placeholder
  },
];

const InDepthInterviewScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(interviewTabs[0].id);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="In Depth Interview Simulation" />
      
      <View style={styles.tabContainer}>
        {interviewTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#F8F9FA", // Light background for tabs
    borderBottomWidth: 1,
    borderBottomColor: "#DEE2E6",
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18, // Pill shape
  },
  activeTabItem: {
    backgroundColor: "#007AFF", // Blue for active tab
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
  },
  activeTabText: {
    color: "#FFFFFF",
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
    alignItems: "flex-start",
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
    maxWidth: "82%",
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
    color: "#495057",
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
    color: "#495057",
    lineHeight: 18,
  },
  feedbackImage: {
    width: 60, // Adjusted size for these feedback images
    height: 60,
    borderRadius: 4,
    backgroundColor: "#E9ECEF",
  },
  speakButtonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6",
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

export default InDepthInterviewScreen; 