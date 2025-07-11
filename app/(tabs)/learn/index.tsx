import { BorderRadius, Colors, Gradients, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function LearnScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Subtle animations for professional feel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleConversationPress = () => {
    // Subtle press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push({ 
      pathname: '/(tabs)/learn/conversation', 
      params: { autoStart: 'true' } 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerIconContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="mic" size={24} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.headerTitle}>Speak to Translate</Text>
          <Text style={styles.headerSubtitle}>Transform your Urdu into English conversation</Text>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Instruction Card */}
          <Animated.View
            style={[
              styles.instructionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Ready to Start?</Text>
              <Text style={styles.instructionText}>
                Press the button below and speak in Urdu. Our AI will translate your words into English and help you learn pronunciation.
              </Text>
            </View>
          </Animated.View>

          {/* Action Button */}
          <Animated.View
            style={[
              styles.actionButtonContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            <TouchableOpacity 
              onPress={handleConversationPress}
              style={styles.actionButton}
              activeOpacity={1}
            >
              <LinearGradient
                colors={Gradients.success}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconContainer}>
                    <Ionicons name="chatbubbles" size={20} color={Colors.textOnPrimary} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonText}>Start Conversation</Text>
                    <Text style={styles.buttonSubtext}>Begin your learning journey</Text>
                  </View>
                  <View style={styles.buttonArrow}>
                    <Ionicons name="arrow-forward" size={16} color={Colors.textOnPrimary} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Feature Cards */}
          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Daily Practice</Text>
              <Text style={styles.featureText}>Perfect for everyday conversations</Text>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Your Pace</Text>
              <Text style={styles.featureText}>Learn at your own speed</Text>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="trending-up-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Track Progress</Text>
              <Text style={styles.featureText}>Monitor your improvement</Text>
            </View>
          </Animated.View>

          {/* Tips Section */}
          <Animated.View
            style={[
              styles.tipsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Speak clearly and at a natural pace</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Practice in a quiet environment</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Don't worry about making mistakes</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  headerIconContainer: {
    marginBottom: Spacing.md,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: Typography.fontSize['3xl'] * Typography.lineHeight.tight,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  instructionCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.base,
  },
  instructionContent: {
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  instructionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  actionButtonContainer: {
    marginBottom: Spacing.xl,
  },
  actionButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  buttonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: Spacing.base,
  },
  buttonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnPrimary,
    marginBottom: 2,
  },
  buttonSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },
  buttonArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    alignItems: 'center',
    ...Shadows.sm,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  featureText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
  },
  tipsSection: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadows.base,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
}); 
