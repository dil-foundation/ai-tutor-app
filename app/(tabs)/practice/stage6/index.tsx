import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const Stage6Screen = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  
  // Create individual scale animations for each activity
  const [activityScaleAnims] = useState(() => 
    [1, 2, 3].map(() => new Animated.Value(1))
  );

  const activities = [
    {
      id: 'aiGuidedSpeech',
      title: 'AI-Guided Spontaneous Speech',
      description: 'Practice real-time conversations with AI, focusing on natural flow and quick thinking',
      icon: 'rocket-outline' as const,
      screen: '/(tabs)/practice/stage6/ai-guided-spontaneous-speech' as any,
    },
    {
      id: 'roleplaySensitive',
      title: 'Roleplay: Handle a Sensitive Scenario',
      description: 'Simulate real-world interviews to improve fluency and confidence',
      icon: 'people-outline' as const,
      screen: '/(tabs)/practice/stage6/roleplay-handle-sensitive-scenario' as any,
    },
    {
      id: 'criticalOpinion',
      title: 'Critical Opinion Builder',
      description: 'Develop and articulate complex opinions on various topics, supported by evidence and logic',
      icon: 'bulb-outline' as const,
      screen: '/(tabs)/practice/stage6/critical-opinion-builder' as any,
    },
  ];

  useEffect(() => {
    // Animate elements on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateToActivity = (activityScreen: any, activityIndex: number) => {
    // Add a small scale animation on press for the specific activity
    Animated.sequence([
      Animated.timing(activityScaleAnims[activityIndex], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(activityScaleAnims[activityIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push(activityScreen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Main ScrollView containing everything */}
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
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <View style={styles.backButtonCircle}>
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <View style={styles.titleCircle}>
                <Ionicons name="school" size={32} color={Colors.background} />
              </View>
              <Text style={styles.headerTitle}>Stage 6</Text>
              <Text style={styles.headerSubtitle}>C2 Proficiency Level</Text>
            </View>
          </View>
        </Animated.View>

        {/* Goal Section */}
        <Animated.View
          style={[
            styles.goalSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.goalCard}>
            <View style={styles.goalContent}>
              <Ionicons name="flag" size={28} color={Colors.primary} />
              <Text style={styles.goalTitle}>Your Learning Goal</Text>
              <Text style={styles.goalDescription}>
                Master real-time fluency, advanced argumentation, and nuanced emotional communication
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Activities Section */}
        <Animated.View
          style={[
            styles.activitiesSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCard}>
              <Ionicons name="play-circle" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Practice Activities</Text>
            </View>
          </View>

          {activities.map((activity, index) => (
            <Animated.View
              key={activity.id}
              style={[
                styles.activityCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: activityScaleAnims[index] }
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.activityButton}
                onPress={() => navigateToActivity(activity.screen, index)}
                activeOpacity={0.8}
              >
                <View style={styles.activityContent}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons name={activity.icon} size={28} color={Colors.primary} />
                  </View>
                  <View style={styles.activityTextContainer}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-forward" size={20} color={Colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Progress Info Card */}
        <Animated.View
          style={[
            styles.progressCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressContent}>
              <Ionicons name="trending-up" size={32} color={Colors.primary} />
              <Text style={styles.progressTitle}>Track Your Progress</Text>
              <Text style={styles.progressDescription}>
                Complete activities to unlock advanced stages and track your improvement
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  titleCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadows.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  goalSection: {
    marginBottom: Spacing.xl,
  },
  goalCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  goalContent: {
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  goalDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  activitiesSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  activityCard: {
    marginBottom: Spacing.base,
  },
  activityButton: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
    overflow: 'hidden',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    minHeight: 80,
  },
  activityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  activityTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: Spacing.sm,
  },
  activityTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
  },
  progressCard: {
    marginTop: Spacing.md,
  },
  progressContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  progressDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Stage6Screen; 
