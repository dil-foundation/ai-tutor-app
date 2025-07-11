import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const feedbackItems = [
  {
    id: "1",
    title: "Hesitation Score",
    value: "12 hesitations",
    description: "Good control over hesitations, consider pause techniques",
    icon: "pulse-outline",
  },
  {
    id: "2",
    title: "Speech Duration",
    value: "2 minutes 15 seconds",
    description: "Perfect timing for the allocated duration",
    icon: "time-outline",
  },
  {
    id: "3",
    title: "Vocabulary Range",
    value: "Advanced level",
    description: "Excellent use of sophisticated vocabulary",
    icon: "book-outline",
  },
  {
    id: "4",
    title: "Coherence & Flow",
    value: "Well-structured",
    description: "Clear progression of ideas with logical connections",
    icon: "git-branch-outline",
  },
];

const AIGuidedSpontaneousSpeechScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spontaneous Speech</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleCard}>
          <Ionicons name="chatbubble-outline" size={32} color={Colors.primary} />
          <Text style={styles.pageTitle}>AI-Guided Challenge</Text>
        </View>

        <View style={styles.topicCard}>
          <Text style={styles.topicTitle}>Leadership in the 21st Century</Text>
          <Text style={styles.topicText}>
            Discuss the evolving role of leadership in today's rapidly changing world. 
            Consider the impact of technology, globalization, and societal shifts on effective leadership.
          </Text>
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
          <Text style={styles.transcriptionTitle}>Live Transcription</Text>
          <Text style={styles.transcriptionText}>
            Start speaking and your words will appear here in real-time...
          </Text>
        </View>

        <Text style={styles.feedbackSectionTitle}>AI Feedback</Text>
        {feedbackItems.map((item) => (
          <View key={item.id} style={styles.feedbackCard}>
            <View style={styles.feedbackIconContainer}>
              <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
            </View>
            <View style={styles.feedbackTextContainer}>
              <Text style={styles.feedbackTitle}>{item.title}</Text>
              <Text style={styles.feedbackValue}>{item.value}</Text>
              <Text style={styles.feedbackDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic-outline" size={24} color={Colors.textOnPrimary} />
          <Text style={styles.speakButtonText}>Start Speaking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.base,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  titleCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  topicCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  topicTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  topicText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.xl,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  timerBox: {
    alignItems: "center",
    flex: 1,
  },
  timerText: {
    fontSize: 40,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  timerLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  transcriptionContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
    minHeight: 100,
  },
  transcriptionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  transcriptionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  feedbackSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  feedbackCard: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  feedbackIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  feedbackValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  feedbackDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  speakButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.base,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.md,
  },
  speakButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
});

export default AIGuidedSpontaneousSpeechScreen; 
