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
  StatusBar,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import BASE_API_URL from '../../../config/api';
import LoadingScreen from '../../../components/LoadingScreen';
import StageCard from '@/components/progress/StageCard';
import RoadmapLine from '@/components/progress/RoadmapLine';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Types for progress data
interface ProgressData {
  current_stage: {
    id: number;
    name: string;
    subtitle: string;
    progress: number;
  };
  overall_progress: number;
  total_progress: number;
  streak_days: number;
  total_practice_time: number;
  total_exercises_completed: number;
  longest_streak: number;
  average_session_duration: number;
  weekly_learning_hours: number;
  monthly_learning_hours: number;
  first_activity_date: string | null;
  last_activity_date: string | null;
  stages: Array<{
    stage_id: number;
    name: string;
    subtitle: string;
    completed: boolean;
    progress: number;
    unlocked: boolean;
    exercises: Array<{
      name: string;
      status: 'completed' | 'in_progress' | 'locked';
      progress: number;
      attempts: number;
    }>;
    started_at: string | null;
    completed_at: string | null;
  }>;
  achievements: Array<{
    name: string;
    icon: string;
    date: string;
    color: string;
    description: string;
  }>;
  fluency_trend: number[];
  unlocked_content: any[];
}

const getStageStatus = (stage: any) => {
  if (stage.completed) return 'completed';
  if (stage.unlocked || stage.progress > 0) return 'in_progress';
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
  const { user, loading: authLoading } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [progressScaleAnim] = useState(new Animated.Value(0.8));
  const [statsScaleAnim] = useState(new Animated.Value(0.7));

  // State management
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load progress data
  const loadProgressData = async () => {
    console.log('🔄 [PROGRESS] Loading progress data...');
    try {
      if (!user?.id) {
        console.log('⚠️ [PROGRESS] No user ID available');
        setError('Please log in to view your progress');
        setIsLoading(false);
        return;
      }

      console.log('🔄 [PROGRESS] Fetching comprehensive progress for user:', user.id);
      const response = await fetch(`${BASE_API_URL}/api/progress/comprehensive-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        }),
      });

      console.log('📥 [PROGRESS] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [PROGRESS] API Error:', response.status, errorText);
        throw new Error(`Failed to load progress: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [PROGRESS] Progress data received:', {
        success: result.success,
        hasData: !!result.data,
        currentStage: result.data?.current_stage?.name,
        overallProgress: result.data?.overall_progress,
        stagesCount: result.data?.stages?.length,
        achievementsCount: result.data?.achievements?.length
      });

      if (result.success && result.data) {
        setProgressData(result.data);
        setError(null);
        console.log('✅ [PROGRESS] Progress data set successfully');
      } else {
        console.error('❌ [PROGRESS] API returned error:', result.error);
        throw new Error(result.error || 'Failed to load progress data');
      }

    } catch (error) {
      console.error('❌ [PROGRESS] Error loading progress data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load progress data');
      
      // Set default data for graceful degradation
      setProgressData({
        current_stage: { id: 1, name: "Stage 1 – A1 Beginner", subtitle: "Foundation Building", progress: 0 },
        overall_progress: 0,
        total_progress: 0,
        streak_days: 0,
        total_practice_time: 0,
        total_exercises_completed: 0,
        longest_streak: 0,
        average_session_duration: 0,
        weekly_learning_hours: 0,
        monthly_learning_hours: 0,
        first_activity_date: null,
        last_activity_date: null,
        stages: [],
        achievements: [],
        fluency_trend: [50, 50, 50, 50, 50, 50, 50],
        unlocked_content: []
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize data loading
  useEffect(() => {
    console.log('🔄 [PROGRESS] useEffect triggered - auth check');
    console.log('📊 [PROGRESS] Auth state:', { user: !!user, loading: authLoading });
    
    if (user && !authLoading) {
      console.log('🔄 [PROGRESS] User authenticated, loading progress data...');
      loadProgressData();
    } else if (!user && !authLoading) {
      console.log('ℹ️ [PROGRESS] User not authenticated');
      setError('Please log in to view your progress');
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Animation on mount
  useEffect(() => {
    if (!isLoading && progressData) {
      console.log('🎬 [PROGRESS] Starting animations...');
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
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(progressScaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(statsScaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, progressData]);

  const handleStagePress = (index: number) => {
    console.log('🔄 [PROGRESS] Stage pressed:', index);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStage(expandedStage === index ? null : index);
  };

  const handleRefresh = () => {
    console.log('🔄 [PROGRESS] Refreshing progress data...');
    setRefreshing(true);
    loadProgressData();
  };

  // Show loading screen
  if (authLoading || isLoading) {
    return <LoadingScreen message="Loading your progress..." />;
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.mainContainer}>
            <Text style={styles.headerTitle}>Your Progress</Text>
            <Text style={styles.errorText}>Please log in to view your progress</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {/* Navigate to login */}}
            >
              <LinearGradient colors={["#58D68D", "#45B7A8"]} style={styles.loginButtonGradient}>
                <Text style={styles.loginButtonText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Show error state
  if (error && !progressData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.mainContainer}>
            <Text style={styles.headerTitle}>Your Progress</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <LinearGradient colors={["#58D68D", "#45B7A8"]} style={styles.retryButtonGradient}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Use safe data with fallbacks
  const safeData = progressData || {
    current_stage: { id: 1, name: "Stage 1 – A1 Beginner", subtitle: "Foundation Building", progress: 0 },
    overall_progress: 0,
    total_progress: 0,
    streak_days: 0,
    total_practice_time: 0,
    total_exercises_completed: 0,
    longest_streak: 0,
    average_session_duration: 0,
    weekly_learning_hours: 0,
    monthly_learning_hours: 0,
    first_activity_date: null,
    last_activity_date: null,
    stages: [{
      stage_id: 1,
      name: "Stage 1 – A1 Beginner",
      subtitle: "Foundation Building",
      completed: false,
      progress: 0,
      unlocked: true,
      exercises: [
        { name: "Repeat After Me", status: "in_progress" as const, progress: 0, attempts: 0 },
        { name: "Quick Response Prompts", status: "locked" as const, progress: 0, attempts: 0 },
        { name: "Listen and Reply", status: "locked" as const, progress: 0, attempts: 0 }
      ],
      started_at: null,
      completed_at: null
    }],
    achievements: [],
    fluency_trend: [50, 50, 50, 50, 50, 50, 50],
    unlocked_content: []
  };

  console.log('🔄 [PROGRESS] Rendering progress screen with data:', {
    currentStage: safeData.current_stage.name,
    overallProgress: safeData.overall_progress,
    streakDays: safeData.streak_days,
    totalTime: safeData.total_practice_time,
    stagesCount: safeData.stages.length,
    achievementsCount: safeData.achievements.length
  });
  
  // Debug stage status
  safeData.stages.forEach((stage, index) => {
    console.log(`📊 [PROGRESS] Stage ${index + 1}:`, {
      name: stage.name,
      progress: stage.progress,
      unlocked: stage.unlocked,
      completed: stage.completed,
      exercises: stage.exercises.map(e => ({
        name: e.name,
        status: e.status,
        progress: e.progress,
        attempts: e.attempts
      }))
    });
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#58D68D']}
              tintColor="#58D68D"
            />
          }
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
                transform: [
                  { translateY: slideAnim },
                  { scale: progressScaleAnim }
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#FFFFFF']}
              style={styles.overviewGradient}
            >
              <View style={styles.overviewHeader}>
                <View style={styles.overviewHeaderContent}>
                  <View style={styles.overviewIconContainer}>
                    <Image 
                      source={require('../../../assets/icon_images/career_image.png')}
                      style={styles.overviewIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.overviewTextContent}>
                    <Text style={styles.overviewTitle}>Current Stage</Text>
                    <Text style={styles.overviewStage}>{safeData.current_stage.name}</Text>
                    <Text style={styles.overviewSubtitle}>{safeData.current_stage.subtitle}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round(safeData.current_stage.progress)}%</Text>
                  <Text style={styles.statLabel}>Stage Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round(safeData.overall_progress)}%</Text>
                  <Text style={styles.statLabel}>Overall Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{safeData.streak_days}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </View>
              
              {/* Additional Progress Info */}
              <View style={styles.additionalProgressInfo}>
                <View style={styles.progressInfoItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#58D68D" />
                  <Text style={styles.progressInfoText}>{safeData.total_exercises_completed} exercises completed</Text>
                </View>
                <View style={styles.progressInfoItem}>
                  <Ionicons name="time" size={16} color="#3498DB" />
                  <Text style={styles.progressInfoText}>{safeData.total_practice_time}h total practice time</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${safeData.current_stage.progress}%`,
                        transform: [{ scaleX: progressScaleAnim }]
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(safeData.current_stage.progress)}% Complete</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Learning Path Section */}
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
            
            {safeData.stages.length > 0 ? (
              safeData.stages.map((stage, idx) => {
                const status = getStageStatus(stage);
                const isExpanded = expandedStage === idx;
                return (
                  <View key={stage.stage_id} style={{ position: 'relative' }}>
                    <RoadmapLine
                      isFirst={idx === 0}
                      isLast={idx === safeData.stages.length - 1}
                      status={status}
                    />
                                         <StageCard
                       index={idx}
                       stage={{
                         stage: stage.name,
                         subtitle: stage.subtitle,
                         completed: stage.completed,
                         progress: stage.progress,
                         exercises: stage.exercises
                       }}
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
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={48} color="#BDC3C7" />
                <Text style={styles.emptyStateText}>No learning stages found</Text>
                <Text style={styles.emptyStateSubtext}>Start your learning journey to see progress here</Text>
              </View>
            )}
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

            {safeData.achievements.length > 0 ? (
              <View style={styles.achievementsGrid}>
                {safeData.achievements.map((achievement, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.achievementCard,
                      {
                        transform: [{ scale: statsScaleAnim }],
                        opacity: fadeAnim
                      }
                    ]}
                  >
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
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color="#BDC3C7" />
                <Text style={styles.emptyStateText}>No achievements yet</Text>
                <Text style={styles.emptyStateSubtext}>Complete exercises to earn achievements</Text>
              </View>
            )}
          </Animated.View>

          {/* Fluency Trend Chart - Temporarily Hidden */}
          {/* 
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
                  {safeData.fluency_trend.map((value, index) => (
                    <Animated.View 
                      key={index} 
                      style={[
                        styles.chartBarContainer,
                        {
                          transform: [{ scaleY: statsScaleAnim }]
                        }
                      ]}
                    >
                      <View style={styles.chartBar}>
                        <Animated.View 
                          style={[
                            styles.chartBarFill,
                            { 
                              height: `${(value / 100) * 80}%`,
                              transform: [{ scaleY: progressScaleAnim }]
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.chartLabel}>W{index + 1}</Text>
                    </Animated.View>
                  ))}
                </View>
                
                <View style={styles.chartStats}>
                  <View style={styles.chartStat}>
                    <Text style={styles.chartStatValue}>{Math.round(safeData.fluency_trend[safeData.fluency_trend.length - 1] || 0)}</Text>
                    <Text style={styles.chartStatLabel}>Current Score</Text>
                  </View>
                  <View style={styles.chartStat}>
                    <Text style={styles.chartStatValue}>+{Math.round((safeData.fluency_trend[safeData.fluency_trend.length - 1] || 0) - (safeData.fluency_trend[0] || 0))}</Text>
                    <Text style={styles.chartStatLabel}>Total Improvement</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
          */}

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
              <Animated.View 
                style={[
                  styles.statCard,
                  {
                    transform: [{ scale: statsScaleAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#E8F5E8', '#F0F9F0']}
                  style={styles.statGradient}
                >
                  <View style={styles.insightIconContainer}>
                    <Ionicons name="time" size={24} color="#58D68D" />
                  </View>
                  <Text style={styles.statCardValue}>{safeData.total_practice_time}h</Text>
                  <Text style={styles.statCardLabel}>Total Practice Time</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View 
                style={[
                  styles.statCard,
                  {
                    transform: [{ scale: statsScaleAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#FFF3E0', '#FFF8E1']}
                  style={styles.statGradient}
                >
                  <View style={styles.insightIconContainer}>
                    <Ionicons name="flame" size={24} color="#FF6B35" />
                  </View>
                  <Text style={styles.statCardValue}>{safeData.streak_days}</Text>
                  <Text style={styles.statCardLabel}>Day Streak</Text>
                </LinearGradient>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Additional Stats */}
          <Animated.View
            style={[
              styles.additionalStatsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="stats-chart" size={24} color="#58D68D" />
              <Text style={styles.sectionTitle}>Learning Insights</Text>
            </View>

            <View style={styles.additionalStatsGrid}>
              <View style={styles.additionalStatCard}>
                <LinearGradient
                  colors={['#E8F5E8', '#F0F9F0']}
                  style={styles.additionalStatGradient}
                >
                  <View style={styles.insightIconContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#58D68D" />
                  </View>
                  <Text style={styles.additionalStatValue}>{safeData.total_exercises_completed}</Text>
                  <Text style={styles.additionalStatLabel}>Exercises Completed</Text>
                </LinearGradient>
              </View>

              <View style={styles.additionalStatCard}>
                <LinearGradient
                  colors={['#E3F2FD', '#F0F8FF']}
                  style={styles.additionalStatGradient}
                >
                  <View style={styles.insightIconContainer}>
                    <Ionicons name="time" size={24} color="#3498DB" />
                  </View>
                  <Text style={styles.additionalStatValue}>{safeData.average_session_duration.toFixed(1)}m</Text>
                  <Text style={styles.additionalStatLabel}>Avg Session</Text>
                </LinearGradient>
              </View>

              <View style={styles.additionalStatCard}>
                <LinearGradient
                  colors={['#FFF3E0', '#FFF8E1']}
                  style={styles.additionalStatGradient}
                >
                  <View style={styles.insightIconContainer}>
                    <Ionicons name="flame" size={24} color="#FF6B35" />
                  </View>
                  <Text style={styles.additionalStatValue}>{safeData.longest_streak}</Text>
                  <Text style={styles.additionalStatLabel}>Longest Streak</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 26,
  },
  overviewCard: {
    marginBottom: 40,
  },
  overviewGradient: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
  },
  overviewHeader: {
    marginBottom: 24,
  },
  overviewHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 4,              
    borderColor: 'black',        
  },
  overviewIcon: {
    width: 50,
    height: 50,
  },
  overviewTextContent: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  overviewStage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#000000',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  progressBarContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#58D68D',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  additionalProgressInfo: {
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  progressInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  progressInfoText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 12,
  },
  learningPathSection: {
    marginBottom: 30,
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
  exerciseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
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
    height: 140, // Fixed height for uniform appearance
  },
  statGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  additionalStatsSection: {
    marginBottom: 30,
  },
  additionalStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  additionalStatCard: {
    flex: 1,
    height: 140, // Same height as Practice Statistics cards
  },
  additionalStatGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  additionalStatValue: {
    fontSize: 24, // Same size as Practice Statistics
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
    marginBottom: 4, // Same margin as Practice Statistics
  },
  additionalStatLabel: {
    fontSize: 12, // Same size as Practice Statistics
    color: '#6C757D',
    textAlign: 'center',
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#45B7A8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  retryButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#45B7A8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
}); 