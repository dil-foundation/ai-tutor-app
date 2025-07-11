import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as Progress from "react-native-progress";

const StorytellingPracticeScreen = () => {
  const router = useRouter();
  const [story, setStory] = useState(
    "I went to the beach with my family. We played in the sand and swam in the ocean. It was a lot of fun."
  );
  const [speakingDuration, setSpeakingDuration] = useState(18);
  const maxDuration = 30;

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
        <Text style={styles.headerTitle}>Storytelling</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleCard}>
            <Ionicons name="book-outline" size={32} color={Colors.primary} />
            <Text style={styles.title}>Share a Special Day</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Speaking Time</Text>
              <Text style={styles.durationValue}>
                {speakingDuration}s / {maxDuration}s
              </Text>
            </View>
            <Progress.Bar
              progress={speakingDuration / maxDuration}
              width={null}
              style={styles.progressBar}
              color={Colors.primary}
              unfilledColor={Colors.backgroundSecondary}
              borderWidth={0}
            />
          </View>

          <View style={styles.storyContainer}>
            <Text style={styles.storyLabel}>Your Story:</Text>
            <TextInput
              style={styles.storyInput}
              multiline
              value={story}
              onChangeText={setStory}
              placeholder="Start writing or speaking your story..."
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.feedbackCard}>
            <View style={styles.feedbackIconContainer}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackTitle}>Great storytelling!</Text>
              <Text style={styles.feedbackText}>
                Try adding sequence words like 'First, then, after that' to make your story flow better.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.ideaButton}>
            <Ionicons name="bulb-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.ideaButtonText}>Need Ideas?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.speakButton}>
            <Ionicons name="mic-outline" size={24} color={Colors.textOnPrimary} />
            <Text style={styles.speakButtonText}>Speak Now</Text>
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
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  titleCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  durationLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  durationValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  storyContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    minHeight: 200,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  storyLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  storyInput: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    textAlignVertical: "top",
    flex: 1,
    lineHeight: 24,
  },
  feedbackCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  feedbackIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  feedbackText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ideaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ideaButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
  },
  speakButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.md,
  },
  speakButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
});

export default StorytellingPracticeScreen; 
