import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const practiceStages = [
  {
    title: "Foundation Course",
    subtitle: "Stage 0 - English Basics",
    description: "Start your English learning journey with essential fundamentals",
    icon: "library-outline",
    path: './practice/stage0',
    category: "Beginner",
    lessons: 5
  },
  {
    title: "Conversation Skills", 
    subtitle: "Stage 1 - Structured Practice",
    description: "Build confidence with guided conversation exercises",
    icon: "chatbubbles-outline",
    path: './practice/stage1',
    category: "Beginner",
    lessons: 8
  },
  {
    title: "Real-World Practice",
    subtitle: "Stage 2 - Practical Scenarios",
    description: "Master everyday conversations and common situations",
    icon: "people-outline",
    path: './practice/stage2',
    category: "Intermediate",
    lessons: 12
  },
  {
    title: "Advanced Communication",
    subtitle: "Stage 3 - Complex Discussions",
    description: "Express complex ideas and handle detailed conversations",
    icon: "bulb-outline",
    path: './practice/stage3',
    category: "Intermediate",
    lessons: 15
  },
  {
    title: "Professional English",
    subtitle: "Stage 4 - Expert Level",
    description: "Achieve fluency with sophisticated language skills",
    icon: "trophy-outline",
    path: './practice/stage4',
    category: "Advanced",
    lessons: 18
  },
  {
    title: "Master Proficiency",
    subtitle: "Stage 5 - Native-Level",
    description: "Perfect your English with professional-level expertise",
    icon: "star-outline",
    path: './practice/stage5',
    category: "Advanced",
    lessons: 20
  },
  {
    title: "Fluency Mastery",
    subtitle: "Stage 6 - Spontaneous Speech",
    description: "Master real-time fluency and natural communication",
    icon: "rocket-outline",
    path: './practice/stage6',
    category: "Advanced",
    lessons: 25
  }
];

export default function PracticeLandingScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  // Create individual scale animations for each stage
  const [stageScaleAnims] = useState(() => 
    practiceStages.map(() => new Animated.Value(1))
  );

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

  const navigateToStage = (stagePath: string, stageIndex: number) => {
    // Subtle press animation
    Animated.sequence([
      Animated.timing(stageScaleAnims[stageIndex], {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(stageScaleAnims[stageIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push(stagePath as any);
  };

  const beginnerStages = practiceStages.filter(stage => stage.category === "Beginner");
  const intermediateStages = practiceStages.filter(stage => stage.category === "Intermediate");
  const advancedStages = practiceStages.filter(stage => stage.category === "Advanced");

  const renderStageCard = (stage: typeof practiceStages[0], index: number) => {
    const stageIndex = practiceStages.findIndex(s => s.title === stage.title);
    return (
      <Animated.View
        key={stage.title}
        style={[
          styles.stageCard,
          {
            transform: [{ scale: stageScaleAnims[stageIndex] }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.stageButton}
          onPress={() => navigateToStage(stage.path, stageIndex)}
          activeOpacity={1}
        >
          <View style={styles.stageContent}>
            <View style={styles.stageIconContainer}>
              <Ionicons name={stage.icon as any} size={24} color={Colors.primary} />
            </View>
            <View style={styles.stageTextContainer}>
              <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>
              <Text style={styles.stageTitle}>{stage.title}</Text>
              <Text style={styles.stageDescription}>{stage.description}</Text>
              <View style={styles.stageMeta}>
                <Text style={styles.stageMetaText}>{stage.lessons} lessons</Text>
                <Text style={styles.stageMetaText}>•</Text>
                <Text style={styles.stageMetaText}>{stage.category}</Text>
              </View>
            </View>
            <View style={styles.stageArrow}>
              <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
              <Ionicons name="school" size={24} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.headerTitle}>Practice English</Text>
          <Text style={styles.headerSubtitle}>Choose your learning path and advance through structured lessons</Text>
        </Animated.View>

        {/* Beginner Stages */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="leaf-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Beginner Level</Text>
            </View>
            <Text style={styles.sectionDescription}>Perfect for starting your English journey</Text>
          </View>
          {beginnerStages.map((stage, index) => renderStageCard(stage, index))}
        </Animated.View>

        {/* Intermediate Stages */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="trending-up-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Intermediate Level</Text>
            </View>
            <Text style={styles.sectionDescription}>Build confidence with real-world practice</Text>
          </View>
          {intermediateStages.map((stage, index) => renderStageCard(stage, index))}
        </Animated.View>

        {/* Advanced Stages */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContent}>
              <Ionicons name="rocket-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Advanced Level</Text>
            </View>
            <Text style={styles.sectionDescription}>Master fluency and professional communication</Text>
          </View>
          {advancedStages.map((stage, index) => renderStageCard(stage, index))}
        </Animated.View>

        {/* Progress Section */}
        <Animated.View
          style={[
            styles.progressSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.progressCard}>
            <View style={styles.progressContent}>
              <View style={styles.progressIconContainer}>
                <Ionicons name="analytics-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressTitle}>Track Your Progress</Text>
                <Text style={styles.progressDescription}>
                  Monitor your learning journey and celebrate milestones as you advance through each stage
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  sectionContainer: {
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  stageCard: {
    marginBottom: Spacing.base,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  stageButton: {
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
  },
  stageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  stageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  stageTextContainer: {
    flex: 1,
  },
  stageSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stageTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.tight,
  },
  stageDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    marginBottom: Spacing.sm,
  },
  stageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stageMetaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
  },
  stageArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  progressCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadows.base,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  progressDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
}); 
