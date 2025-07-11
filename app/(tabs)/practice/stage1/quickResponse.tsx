import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const QuickResponseScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quick Response</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>Respond to the AI's question</Text>
          </View>

          {/* Chat bubbles */}
          <View style={styles.chatContainer}>
            <View style={styles.aiBubbleContainer}>
              <View style={styles.avatarContainer}>
                <Ionicons name="hardware-chip-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.aiBubble}>
                <Text style={styles.chatText}>How are you today?</Text>
              </View>
            </View>
            <View style={styles.userBubbleContainer}>
              <View style={styles.userBubble}>
                <Text style={styles.userChatText}>I am fine.</Text>
              </View>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-outline" size={24} color={Colors.primary} />
              </View>
            </View>
          </View>

          <View style={styles.suggestionCard}>
            <View style={styles.suggestionIcon}>
              <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.suggestionText}>
              Great! Now try saying: <Text style={styles.suggestionBold}>"I'm fine, thank you."</Text>
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.speakButton}>
            <Ionicons name="mic-outline" size={24} color={Colors.textOnPrimary} />
            <Text style={styles.speakButtonText}>Speak Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
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
    padding: Spacing.lg,
  },
  instructionCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  instructionText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  chatContainer: {
    marginBottom: Spacing.xl,
  },
  aiBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.base,
    alignSelf: 'flex-start',
  },
  userBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
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
  },
  aiBubble: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    maxWidth: '80%',
    marginLeft: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    maxWidth: '80%',
    marginRight: Spacing.sm,
  },
  chatText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  userChatText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textOnPrimary,
  },
  suggestionCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
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
  suggestionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 24,
  },
  suggestionBold: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  buttonContainer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  speakButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  speakButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
});

export default QuickResponseScreen; 
