import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const CriticalOpinionBuilderScreen = () => {
  const router = useRouter();
  const [wordCount, setWordCount] = useState(0);
  const [text, setText] = useState("");
  const wordLimit = 100;
  const timeLimit = 90; // seconds

  const handleTextChange = (inputText: string) => {
    setText(inputText);
    // Basic word count: split by space and filter empty strings
    const words = inputText.split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

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
        <Text style={styles.headerTitle}>Critical Opinion Builder</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleCard}>
          <Ionicons name="bulb-outline" size={32} color={Colors.primary} />
          <Text style={styles.pageTitle}>Express Your Views</Text>
        </View>

        <View style={styles.topicCard}>
          <Text style={styles.topicText}>
            In the context of global climate change, should governments prioritize economic growth or environmental sustainability? Discuss the trade-offs and propose a balanced approach.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.statLabel}>Time Limit</Text>
            <Text style={styles.statValue}>{timeLimit} seconds</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            <Text style={styles.statLabel}>Words</Text>
            <Text style={[
              styles.statValue,
              wordCount > wordLimit && styles.statValueOver
            ]}>
              {wordCount}/{wordLimit}
            </Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Opinion:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Start typing your critical opinion here..."
            placeholderTextColor={Colors.textSecondary}
            onChangeText={handleTextChange}
            value={text}
            textAlignVertical="top"
          />
        </View>
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
  topicText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: Typography.fontWeight.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
  },
  statValueOver: {
    color: Colors.error,
  },
  inputContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
    minHeight: 200,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 24,
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

export default CriticalOpinionBuilderScreen; 
