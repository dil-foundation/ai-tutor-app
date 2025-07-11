import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abstract Topic</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleCard}>
          <Ionicons name="bulb-outline" size={32} color={Colors.primary} />
          <Text style={styles.pageTitle}>Speak Your Mind</Text>
        </View>
        
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
            <View style={styles.feedbackIconContainer}>
              <Ionicons name={item.icon} size={24} color={Colors.primary} />
            </View>
            <View style={styles.feedbackTextContainer}>
              <Text style={styles.feedbackTitle}>{item.title}</Text>
              <Text style={styles.feedbackDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic-outline" size={24} color={Colors.textOnPrimary} />
          <Text style={styles.speakButtonText}>Speak Now</Text>
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
    textAlign: "center",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  topicContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  topicText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    textAlign: 'center',
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
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  transcriptionPlaceholder: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
    fontStyle: 'italic',
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
    alignItems: "center",
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

export default AbstractTopicMonologueScreen; 
