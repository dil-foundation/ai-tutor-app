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

const messages = [
  {
    id: "1",
    sender: "ai",
    text: "I'm really disappointed about not getting the promotion. I've worked so hard and feel overlooked.",
  },
  {
    id: "2",
    sender: "user",
    text: "I understand your disappointment, Ethan. Your dedication is valued, and I want to discuss this further.",
  },
];

const feedbackItems = [
  {
    id: "1",
    title: "Tone & Empathy Score",
    description: "Your response showed understanding and a willingness to address the employee's concerns.",
    icon: "heart-outline",
  },
  {
    id: "2",
    title: "Conflict Resolution",
    description: "You initiated a constructive dialogue, focusing on understanding the employee's perspective.",
    icon: "people-outline",
  },
  {
    id: "3",
    title: "Professional Language",
    description: "Your language was clear, respectful, and maintained a professional tone throughout.",
    icon: "briefcase-outline",
  },
];

const RoleplaySensitiveScenarioScreen = () => {
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
        <Text style={styles.headerTitle}>Empathy & Conflict</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleCard}>
          <Ionicons name="people-outline" size={32} color={Colors.primary} />
          <Text style={styles.pageTitle}>Sensitive Scenario</Text>
        </View>

        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioTitle}>HR Manager Scenario</Text>
          <Text style={styles.scenarioText}>
            You are an HR Manager. An employee is upset about a missed promotion. 
            Respond with tact, empathy, and professional guidance.
          </Text>
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
                <View style={styles.avatarContainer}>
                  <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === "user"
                    ? styles.userMessageBubble
                    : styles.aiMessageBubble,
                ]}
              >
                <Text style={styles.messageSenderText}>{msg.sender === 'ai' ? 'Employee' : 'You (HR Manager)'}</Text>
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
                <View style={styles.avatarContainer}>
                  <Ionicons name="business-outline" size={24} color={Colors.primary} />
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.feedbackSectionTitle}>Feedback</Text>
        {feedbackItems.map((item) => (
          <View key={item.id} style={styles.feedbackCard}>
            <View style={styles.feedbackIconContainer}>
              <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
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
          <Text style={styles.speakButtonText}>Respond</Text>
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
  scenarioCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  scenarioTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  scenarioText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  chatContainer: {
    marginBottom: Spacing.xl,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: Spacing.base,
    alignItems: "flex-end",
  },
  aiMessageRow: {
    justifyContent: "flex-start",
  },
  userMessageRow: {
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
    padding: Spacing.base,
    maxWidth: "80%",
  },
  aiMessageBubble: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userMessageBubble: {
    backgroundColor: Colors.primary,
  },
  messageSenderText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  messageText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.textOnPrimary,
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

export default RoleplaySensitiveScenarioScreen; 
