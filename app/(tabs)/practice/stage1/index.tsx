import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Stage1Screen = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  const activities = [
    {
      id: 'repeatAfterMe',
      title: 'Repeat After Me',
      description: 'Practice speaking by repeating phrases with perfect pronunciation',
      icon: 'mic-outline' as const,
      screen: '/(tabs)/practice/stage1/repeatAfterMe' as any,
      lessonCount: 8,
    },
    {
      id: 'quickResponse',
      title: 'Quick Response',
      description: 'Answer simple questions quickly to build fluency',
      icon: 'flash-outline' as const,
      screen: '/(tabs)/practice/stage1/quickResponse' as any,
      lessonCount: 6,
    },
    {
      id: 'listenAndReply',
      title: 'Listen and Reply',
      description: 'Improve listening skills by responding to audio prompts',
      icon: 'ear-outline' as const,
      screen: '/(tabs)/practice/stage1/listenAndReply' as any,
      lessonCount: 7,
    },
  ];

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

  const navigateToActivity = (activityScreen: any) => {
    router.push(activityScreen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
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
              <Text style={styles.headerTitle}>Stage 1</Text>
              <Text style={styles.headerSubtitle}>A1 Beginner Level</Text>
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
                Build confidence in using basic phrases and perfect your pronunciation
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
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.activityButton}
                onPress={() => navigateToActivity(activity.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.activityContent}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons name={activity.icon} size={28} color={Colors.primary} />
                  </View>
                  
                  <View style={styles.activityTextContainer}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.lessonCount}>{activity.lessonCount} lessons</Text>
                  </View>
                  
                  <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Progress Summary */}
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
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>21</Text>
                <Text style={styles.statLabel}>Total Lessons</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0%</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
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
    paddingBottom: Spacing['2xl'],
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
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
  },
  activityTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  activityDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    marginBottom: Spacing.xs,
  },
  lessonCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  arrowContainer: {
    marginLeft: Spacing.sm,
  },
  progressSection: {
    marginBottom: Spacing.base,
  },
  progressCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  progressTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
    textAlign: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
});

export default Stage1Screen; 
