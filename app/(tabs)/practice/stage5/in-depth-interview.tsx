import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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
  },
  {
    id: "2",
    sender: "user",
    text: "In my previous role, we faced a tight deadline for a product launch. I coordinated the team, delegated tasks based on strengths, and maintained open communication. We successfully launched on time.",
  },
  {
    id: "3",
    sender: "ai",
    text: "That's a great example. Now, can you elaborate on the specific challenges you encountered and how you overcame them?",
  },
    {
    id: "4",
    sender: "user",
    text: "One major challenge was aligning different team members' priorities. I held regular check-ins, clarified objectives, and fostered a collaborative environment. This helped us stay focused and achieve our goals.",
  },
];

const feedbackItems = [
  {
    id: "1",
    title: "STAR Model Use",
    description: "Your response effectively used the STAR method, providing a clear Situation, Task, Action, and Result. This structure enhances clarity and impact.",
    icon: 'star-outline' as const,
  },
  {
    id: "2",
    title: "Vocabulary Upgrade Suggestions",
    description: "Consider using phrases like 'spearheaded the initiative' instead of 'coordinated the team' to add more impact to your leadership role.",
    icon: 'trending-up-outline' as const,
  },
  {
    id: "3",
    title: "Fluency & Precision",
    description: "Your communication was fluent and precise. Focus on varying sentence structures to maintain listener engagement.",
    icon: 'checkmark-done-circle-outline' as const,
  },
];

const InDepthInterviewScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(interviewTabs[0].id);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>In-Depth Interview</Text>
      </View>
      
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
                <Text style={styles.messageSenderText}>{msg.sender === 'ai' ? 'AI Interviewer' : 'You'}</Text>
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#111629",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: "#93E893",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D2D5E1",
  },
  activeTabText: {
    color: "#111629",
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

export default InDepthInterviewScreen; 