import { BorderRadius, Colors, Gradients, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RepeatAfterMeScreen = () => {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Simulate audio playing
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => setIsRecording(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repeat After Me</Text>
        <View style={styles.headerRight}>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>1/8</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.instructionContainer}>
          <View style={styles.instructionIconContainer}>
            <Ionicons name="ear-outline" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.instructionText}>Listen to the phrase and repeat it clearly.</Text>
        </View>
        
        <View style={styles.phraseContainer}>
          <Text style={styles.phraseText}>I live in Lahore</Text>
          <TouchableOpacity 
            style={[styles.listenButton, isPlaying && styles.listenButtonActive]} 
            onPress={handlePlayAudio}
            disabled={isPlaying}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "volume-high-outline"} 
              size={32} 
              color={Colors.textOnPrimary} 
            />
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for better pronunciation:</Text>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Speak clearly and at a natural pace</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Focus on the stress patterns</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.speakButton, isRecording && styles.speakButtonActive]} 
          onPress={handleStartRecording}
          disabled={isRecording}
        >
          <LinearGradient colors={Gradients.success} style={styles.buttonGradient}>
            <View style={styles.buttonContent}>
              <View style={styles.buttonIconContainer}>
                <Ionicons 
                  name={isRecording ? "stop" : "mic-outline"} 
                  size={24} 
                  color={Colors.textOnPrimary} 
                />
              </View>
              <Text style={styles.speakButtonText}>
                {isRecording ? 'Recording...' : 'Speak Now'}
              </Text>
            </View>
          </LinearGradient>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
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
  instructionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  phraseContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  phraseText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.fontSize['2xl'] * Typography.lineHeight.normal,
  },
  listenButton: {
    backgroundColor: Colors.primary,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  listenButtonActive: {
    backgroundColor: Colors.primaryDark,
  },
  tipsContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  actionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  speakButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  speakButtonActive: {
    opacity: 0.8,
  },
  buttonGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconContainer: {
    marginRight: Spacing.sm,
  },
  speakButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default RepeatAfterMeScreen; 
