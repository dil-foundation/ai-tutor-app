import { BorderRadius, Colors, Gradients, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const DailyRoutineNarrationScreen = () => {
  const router = useRouter();
  const [response, setResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleRetry = () => {
    setResponse("");
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => setIsRecording(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Routine</Text>
        <View style={styles.headerRight}>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>1/5</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Instructions */}
          <View style={styles.instructionContainer}>
            <View style={styles.instructionIconContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.prompt}>
              Tell me about your morning routine. What do you do after you wake up?
            </Text>
          </View>

          {/* Response Input */}
          <View style={styles.responseContainer}>
            <Text style={styles.responseLabel}>Your Response:</Text>
            <TextInput
              style={styles.responseInput}
              multiline
              placeholder="Start writing or speaking..."
              placeholderTextColor={Colors.textSecondary}
              value={response}
              onChangeText={setResponse}
            />
          </View>

          {/* Feedback */}
          <View style={styles.feedbackBox}>
            <View style={styles.feedbackIconContainer}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackTitle}>Tip:</Text>
              <Text style={styles.feedbackText}>
                Try using time words like 'then', 'after that', or 'next' to connect your ideas.
              </Text>
            </View>
          </View>

          {/* Example phrases */}
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>Example phrases:</Text>
            <View style={styles.exampleList}>
              <View style={styles.exampleItem}>
                <View style={styles.exampleBullet} />
                <Text style={styles.exampleText}>"First, I brush my teeth..."</Text>
              </View>
              <View style={styles.exampleItem}>
                <View style={styles.exampleBullet} />
                <Text style={styles.exampleText}>"Then I take a shower..."</Text>
              </View>
              <View style={styles.exampleItem}>
                <View style={styles.exampleBullet} />
                <Text style={styles.exampleText}>"After that, I have breakfast..."</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.speakButton, isRecording && styles.speakButtonActive]} 
            onPress={handleStartRecording}
            disabled={isRecording}
          >
            <LinearGradient colors={Gradients.success} style={styles.buttonGradient}>
              <View style={styles.buttonContent}>
                <Ionicons 
                  name={isRecording ? "stop" : "mic-outline"} 
                  size={20} 
                  color={Colors.textOnPrimary} 
                />
                <Text style={styles.speakButtonText}>
                  {isRecording ? "Recording..." : "Speak Now"}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: Spacing.base,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  progressIndicator: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  instructionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  prompt: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    fontWeight: Typography.fontWeight.medium,
  },
  responseContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 150,
    ...Shadows.base,
  },
  responseLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  responseInput: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    textAlignVertical: "top",
    flex: 1,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  feedbackBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  feedbackIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  feedbackText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  exampleContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.base,
  },
  exampleTitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.base,
  },
  exampleList: {
    gap: Spacing.sm,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exampleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  exampleText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.sm,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
  },
  speakButton: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  speakButtonActive: {
    opacity: 0.8,
  },
  buttonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  speakButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
});

export default DailyRoutineNarrationScreen; 
