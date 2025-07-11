import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  { id: "1", label: "Pronunciation", iconName: "microphone-outline", checked: true },
  { id: "2", label: "Grammar", iconName: "alphabetical-variant", checked: true },
  { id: "3", label: "Answer Match", iconName: "help-circle-outline", checked: true },
];

const QuestionsAnswersPracticeScreen = () => {
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
        <Text style={styles.headerTitle}>Quick Answer</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleCard}>
          <Text style={styles.title}>Responding to WH-questions</Text>
        </View>

        <View style={styles.chatContainer}>
          <View style={styles.messageRowAI}>
            <View style={styles.avatarContainer}>
              <Ionicons name="hardware-chip-outline" size={24} color={Colors.primary} />
            </View>
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
            <View style={styles.avatarContainer}>
              <Ionicons name="person-outline" size={24} color={Colors.primary} />
            </View>
          </View>
        </View>

        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackHeader}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
            <Text style={styles.feedbackTitle}>Feedback</Text>
          </View>
          {feedbackItems.map((item) => (
            <View key={item.id} style={styles.feedbackItem}>
              <View style={styles.feedbackIconLabelContainer}>
                <MaterialCommunityIcons
                  name={item.iconName as any}
                  size={20}
                  color={Colors.textSecondary}
                  style={styles.feedbackIcon}
                />
                <Text style={styles.feedbackLabel}>{item.label}</Text>
              </View>
              {item.checked && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </View>
          ))}
        </View>
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
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  chatContainer: {
    marginBottom: Spacing.xl,
  },
  messageRowAI: {
    flexDirection: "row",
    marginBottom: Spacing.base,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  messageRowUser: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
  messageBubble: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    maxWidth: "80%",
  },
  aiMessageBubble: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginLeft: Spacing.sm,
  },
  userMessageBubble: {
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  messageSender: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: Typography.fontWeight.bold,
  },
  messageText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.textOnPrimary,
  },
  feedbackContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  feedbackTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  feedbackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  feedbackIconLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackIcon: {
    marginRight: Spacing.sm,
  },
  feedbackLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
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

export default QuestionsAnswersPracticeScreen; 
