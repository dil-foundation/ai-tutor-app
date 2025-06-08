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

const feedbackItems = [
  {
    id: "1",
    title: "Vocabulary Richness",
    description: "Your word choice was diverse and appropriate for the topic.",
    icon: "book-outline" as const,
  },
  {
    id: "2",
    title: "Sentence Structure",
    description: "You used a variety of sentence lengths and structures effectively.",
    icon: "git-commit-outline" as const,
  },
];

const AbstractTopicMonologueScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abstract Topic</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Speak Your Mind</Text>
        
        <View style={styles.topicContainer}>
            <Text style={styles.topicText}>Topic: The importance of education</Text>
        </View>

        <View style={styles.timerContainer}>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>02</Text>
            <Text style={styles.timerLabel}>Minutes</Text>
          </View>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>00</Text>
            <Text style={styles.timerLabel}>Seconds</Text>
          </View>
        </View>

        <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionPlaceholder}>
            Live transcription will appear here...
            </Text>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#D2D5E1",
  },
  topicContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    marginBottom: 24,
  },
  topicText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#93E893',
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  timerBox: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#93E893",
  },
  timerLabel: {
    fontSize: 14,
    color: "#D2D5E1",
    marginTop: 4,
  },
  transcriptionContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  transcriptionPlaceholder: {
    fontSize: 16,
    color: "#D2D5E1",
    textAlign: "center",
    fontStyle: 'italic',
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

export default AbstractTopicMonologueScreen; 