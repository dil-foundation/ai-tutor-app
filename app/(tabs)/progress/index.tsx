import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StageCard from '@/components/progress/StageCard';
import RoadmapLine from '@/components/progress/RoadmapLine';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Mock data for progress tracking
const progressData = {
  current_stage: "Stage 2 – A2 Elementary",
  current_stage_progress: 45,
  total_progress: 28, // Overall progress across all stages
  streak_days: 7,
  total_practice_time: 12.5, // hours
  stages: [
    {
      stage: "Stage 1 – A1 Beginner",
      subtitle: "Foundation Building",
      completed: true,
      progress: 100,
      exercises: [
        { name: "Repeat After Me", status: "completed" as "completed" },
        { name: "Quick Response Prompts", status: "completed" as "completed" },
        { name: "Listen and Reply", status: "completed" as "completed" }
      ]
    },
    {
      stage: "Stage 2 – A2 Elementary",
      subtitle: "Daily Conversations",
      completed: false,
      progress: 45,
      exercises: [
        { name: "Daily Routine Narration", status: "completed" as "completed" },
        { name: "Question & Answer Chat", status: "in_progress" as "in_progress" },
        { name: "Roleplay Simulation – Food Order", status: "locked" as "locked" }
      ]
    },
    {
      stage: "Stage 3 – B1 Intermediate",
      subtitle: "Storytelling & Dialogue",
      completed: false,
      progress: 0,
      exercises: [
        { name: "Storytelling Practice", status: "locked" as "locked" },
        { name: "Group Dialogue", status: "locked" as "locked" },
        { name: "Problem-Solving", status: "locked" as "locked" }
      ]
    },
    {
      stage: "Stage 4 – B2 Upper Intermediate",
      subtitle: "Advanced Communication",
      completed: false,
      progress: 0,
      exercises: [
        { name: "Abstract Topic Monologue", status: "locked" as "locked" },
        { name: "Mock Interview Practice", status: "locked" as "locked" },
        { name: "News Summary Challenge", status: "locked" as "locked" }
      ]
    },
    {
      stage: "Stage 5 – C1 Advanced",
      subtitle: "Critical Thinking & Presentations",
      completed: false,
      progress: 0,
      exercises: [
        { name: "Critical Thinking Dialogues", status: "locked" as "locked" },
        { name: "Academic Presentations", status: "locked" as "locked" },
        { name: "In-Depth Interview", status: "locked" as "locked" }
      ]
    },
    {
      stage: "Stage 6 – C2 Mastery",
      subtitle: "Mastery & Spontaneity",
      completed: false,
      progress: 0,
      exercises: [
        { name: "Spontaneous Speech", status: "locked" as "locked" },
        { name: "Sensitive Scenario Roleplay", status: "locked" as "locked" },
        { name: "Critical Opinion Builder", status: "locked" as "locked" }
      ]
    }
  ],
  achievements: [
    { name: "Beginner Badge", icon: "star", date: "2025-01-15", color: "#FFD700" },
    { name: "7-Day Streak", icon: "flame", date: "2025-01-20", color: "#FF6B35" },
    { name: "First Exercise", icon: "checkmark-circle", date: "2025-01-10", color: "#58D68D" },
    { name: "Quick Learner", icon: "rocket", date: "2025-01-18", color: "#3498DB" }
  ],
  fluency_trend: [50, 60, 65, 70, 75, 78, 82]
};

const getStageStatus = (stage: any) => {
  if (stage.completed) return 'completed';
  if (stage.progress > 0) return 'in_progress';
  return 'locked';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#58D68D';
    case 'in_progress': return '#3B82F6';
    case 'locked': return '#BDC3C7';
    default: return '#BDC3C7';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return 'checkmark-circle';
    case 'in_progress': return 'ellipse';
    case 'locked': return 'lock-closed';
    default: return 'lock-closed';
  }
};

const getStatusText = (stage: any) => {
  if (stage.completed) return 'Complete';
  if (stage.progress > 0) return `${Math.floor(stage.progress / 33.34) + 1}/3 done`;
  return 'Locked';
};

export default function ProgressScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStagePress = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStage(expandedStage === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <LinearGradient
              colors={['#58D68D', '#45B7A8']}
              style={styles.headerGradient}
            >
              <Ionicons name="trending-up" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.headerTitle}>Your Progress</Text>
            <Text style={styles.headerSubtitle}>Track your English learning journey</Text>
          </View>
        </Animated.View>
          {/* Current Progress Overview */}
          <Animated.View
            style={[
              styles.overviewCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
              style={styles.overviewGradient}
            >
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewTitle}>Current Stage</Text>
                <Text style={styles.overviewStage}>{progressData.current_stage}</Text>
              </View>
              
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progressData.current_stage_progress}%</Text>
                  <Text style={styles.statLabel}>Stage Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progressData.total_progress}%</Text>
                  <Text style={styles.statLabel}>Overall Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progressData.streak_days}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${progressData.current_stage_progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{progressData.current_stage_progress}% Complete</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Learning Path Section (Refactored) */}
          <Animated.View
            style={[
              styles.learningPathSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="git-branch" size={24} color="#58D68D" />
              <Text style={styles.sectionTitle}>Learning Path</Text>
            </View>
            {progressData.stages.map((stage, idx) => {
              const status = getStageStatus(stage);
              const isExpanded = expandedStage === idx;
              return (
                <View key={stage.stage} style={{ position: 'relative' }}>
                  <RoadmapLine
                    isFirst={idx === 0}
                    isLast={idx === progressData.stages.length - 1}
                    status={status}
                  />
                  <StageCard
                    index={idx}
                    stage={stage}
                    expanded={isExpanded}
                    onPress={() => handleStagePress(idx)}
                  >
                    {isExpanded && (
                      <View style={styles.exerciseDropdown}>
                        {stage.exercises.map((ex, exIdx) => (
                          <View key={exIdx} style={styles.exerciseRow}>
                            <View style={[styles.exerciseDot, { backgroundColor: getStatusColor(ex.status) }]} />
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            <Text style={[styles.exerciseStatusText, { color: getStatusColor(ex.status) }]}> 
                              {ex.status === 'completed' ? 'Completed' : ex.status === 'in_progress' ? 'In Progress' : 'Locked'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </StageCard>
                </View>
              );
            })}
          </Animated.View>

          {/* Achievements Section */}
          <Animated.View
            style={[
              styles.achievementsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={24} color="#58D68D" />
              <Text style={styles.sectionTitle}>Achievements</Text>
            </View>

            <View style={styles.achievementsGrid}>
              {progressData.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementCard}>
                  <LinearGradient
                    colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                    style={styles.achievementGradient}
                  >
                    <View style={styles.achievementIcon}>
                      <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
                    </View>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementDate}>{achievement.date}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Fluency Trend Chart */}
          <Animated.View
            style={[
              styles.chartSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={24} color="#58D68D" />
              <Text style={styles.sectionTitle}>Fluency Trend</Text>
            </View>

            <View style={styles.chartContainer}>
              <LinearGradient
                colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                style={styles.chartGradient}
              >
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>Weekly Progress</Text>
                  <Text style={styles.chartSubtitle}>Your fluency improvement over time</Text>
                </View>
                
                <View style={styles.chartBars}>
                  {progressData.fluency_trend.map((value, index) => (
                    <View key={index} style={styles.chartBarContainer}>
                      <View style={styles.chartBar}>
                        <View 
                          style={[
                            styles.chartBarFill,
                            { height: `${(value / 100) * 80}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.chartLabel}>W{index + 1}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.chartStats}>
                  <View style={styles.chartStat}>
                    <Text style={styles.chartStatValue}>{progressData.fluency_trend[progressData.fluency_trend.length - 1]}</Text>
                    <Text style={styles.chartStatLabel}>Current Score</Text>
                  </View>
                  <View style={styles.chartStat}>
                    <Text style={styles.chartStatValue}>+{progressData.fluency_trend[progressData.fluency_trend.length - 1] - progressData.fluency_trend[0]}</Text>
                    <Text style={styles.chartStatLabel}>Total Improvement</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Practice Stats */}
          <Animated.View
            style={[
              styles.statsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={24} color="#58D68D" />
              <Text style={styles.sectionTitle}>Practice Statistics</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                  style={styles.statGradient}
                >
                  <Ionicons name="time-outline" size={24} color="#58D68D" />
                  <Text style={styles.statCardValue}>{progressData.total_practice_time}h</Text>
                  <Text style={styles.statCardLabel}>Total Practice Time</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                  style={styles.statGradient}
                >
                  <Ionicons name="flame-outline" size={24} color="#FF6B35" />
                  <Text style={styles.statCardValue}>{progressData.streak_days}</Text>
                  <Text style={styles.statCardLabel}>Day Streak</Text>
                </LinearGradient>
              </View>
            </View>
          </Animated.View>
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  overviewCard: {
    marginBottom: 30,
  },
  overviewGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  overviewHeader: {
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 4,
  },
  overviewStage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#58D68D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 10,
  },
  progressBarContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#58D68D',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  skillTreeSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 12,
  },
  skillTree: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  stageNode: {
    position: 'relative',
    marginBottom: 20,
  },
  connectionLine: {
    position: 'absolute',
    left: 20,
    top: 40,
    width: 2,
    height: 30,
    zIndex: 1,
  },
  stageCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 12,
  },
  stageInfo: {
    marginLeft: 0,
  },
  stageProgress: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
  },
  exerciseStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  exerciseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  exerciseIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  achievementsSection: {
    marginBottom: 30,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 60) / 2,
  },
  achievementGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementIcon: {
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: 30,
  },
  chartContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  chartGradient: {
    borderRadius: 16,
    padding: 20,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 20,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    height: 80,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  chartBarFill: {
    backgroundColor: '#58D68D',
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  chartLabel: {
    fontSize: 12,
    color: '#6C757D',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#58D68D',
    marginBottom: 4,
  },
  chartStatLabel: {
    fontSize: 12,
    color: '#6C757D',
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.15,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(88, 214, 141, 0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(69, 183, 168, 0.05)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.7,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(88, 214, 141, 0.03)',
  },
  learningPathSection: {
    marginBottom: 30,
  },
  learningPathCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  stageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stageNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stageTextBlock: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  stageSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  stageStatusBlock: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  stageStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  stageDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 68,
    marginRight: 0,
  },
  exerciseDropdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 10,
    marginTop: -6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
    color: '#222',
  },
  exerciseStatusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 