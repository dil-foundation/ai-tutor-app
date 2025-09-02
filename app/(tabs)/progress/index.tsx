import React, { useEffect, useState, useRef } from 'react';
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
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import LoadingScreen from '../../../components/LoadingScreen';
import StageCard from '@/components/progress/StageCard';
import RoadmapLine from '@/components/progress/RoadmapLine';
import { ProgressHelpers, ProgressData } from '../../../utils/progressTracker';
import CircularProgress from '../../../components/CircularProgress';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Modern color palette
const COLORS = {
  primary: '#58D68D',
  primaryGradient: ['#58D68D', '#45B7A8'],
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FAFAFA',
  card: 'rgba(255, 255, 255, 0.95)',
  glass: 'rgba(255, 255, 255, 0.25)',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  border: 'rgba(255, 255, 255, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const getStageStatus = (stage: any) => {
  if (stage.completed) return 'completed';
  if (stage.unlocked || stage.progress > 0) return 'in_progress';
  return 'locked';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return COLORS.success;
    case 'in_progress': return '#3B82F6'; // Blue for in progress
    case 'locked': return COLORS.text.tertiary;
    default: return COLORS.text.tertiary;
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
  
  // Enhanced animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [progressScaleAnim] = useState(new Animated.Value(0.6));
  const [statsScaleAnim] = useState(new Animated.Value(0.7));
  const [headerScaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));

  // State management
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Pulse animation for active elements
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  // Load progress data with improved error handling
  const loadProgressData = async (forceRefresh = false) => {
    console.log('🔄 [PROGRESS] Loading progress data...', { forceRefresh });
    try {
      if (!user?.id) {
        console.log('⚠️ [PROGRESS] No user ID available');
        setError('Please log in to view your progress');
        setIsLoading(false);
        return;
      }

      console.log('🔄 [PROGRESS] Fetching comprehensive progress for user:', user.id);
      
      const result = forceRefresh 
        ? await ProgressHelpers.forceRefreshProgress()
        : await ProgressHelpers.getComprehensiveProgress();

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
        setLastRefreshTime(new Date());
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
        current_stage: { id: 1, name: "Stage 1 - A1 Beginner", subtitle: "Foundation Building", progress: 0 },
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
        unlocked_content: [],
        total_completed_stages: 0,
        total_completed_exercises: 0,
        total_learning_units: 30,
        total_completed_units: 0
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

  // Enhanced animation on mount
  useEffect(() => {
    if (!isLoading && progressData) {
      console.log('🎬 [PROGRESS] Starting enhanced animations...');
      
      // Staggered animation sequence
      Animated.stagger(150, [
        Animated.timing(headerScaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(progressScaleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
        Animated.timing(statsScaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.1)),
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
    loadProgressData(true); // Force refresh
  };

  const formatLastRefreshTime = () => {
    if (!lastRefreshTime) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastRefreshTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
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
              <LinearGradient colors={COLORS.primaryGradient as any} style={styles.loginButtonGradient}>
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
              <LinearGradient colors={COLORS.primaryGradient as any} style={styles.retryButtonGradient}>
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
        { name: "Repeat After Me", status: "in_progress" as const, progress: 0, attempts: 0, topics: 10, completed_topics: 0 },
        { name: "Quick Response Prompts", status: "locked" as const, progress: 0, attempts: 0, topics: 8, completed_topics: 0 },
        { name: "Listen and Reply", status: "locked" as const, progress: 0, attempts: 0, topics: 12, completed_topics: 0 }
      ],
      started_at: null,
      completed_at: null,
      total_topics: 30,
      completed_topics: 0
    }],
    achievements: [],
    fluency_trend: [50, 50, 50, 50, 50, 50, 50],
    unlocked_content: [],
    total_completed_stages: 0,
    total_completed_exercises: 0,
    total_learning_units: 30,
    total_completed_units: 0
  };

  console.log('🔄 [PROGRESS] Rendering progress screen with data:', {
    currentStage: safeData.current_stage.name,
    overallProgress: safeData.overall_progress,
    streakDays: safeData.streak_days,
    totalTime: safeData.total_practice_time,
    stagesCount: safeData.stages.length,
    achievementsCount: safeData.achievements.length,
    completedStages: safeData.total_completed_stages,
    completedExercises: safeData.total_completed_exercises
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
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Enhanced Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: headerScaleAnim }
                ],
              },
            ]}
          >
            <View style={styles.headerContent}>
              <Animated.View 
                style={[
                  styles.headerGradient,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                              <LinearGradient
                colors={COLORS.primaryGradient as any}
                style={styles.headerGradientInner}
              >
                  <Ionicons name="trending-up" size={32} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              <Text style={styles.headerTitle}>Your Progress</Text>
              <Text style={styles.headerSubtitle}>Track your English learning journey</Text>
              {lastRefreshTime && (
                <Text style={styles.lastRefreshText}>
                  Last updated: {formatLastRefreshTime()}
                </Text>
              )}
            </View>
          </Animated.View>

          {/* Glassmorphism Current Progress Overview */}
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
            <BlurView intensity={20} style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.overviewGradient}
              >
                <View style={styles.overviewHeader}>
                  <View style={styles.overviewHeaderContent}>
                    <View style={styles.overviewIconContainer}>
                      <LinearGradient
                        colors={COLORS.primaryGradient as any}
                        style={styles.iconGradient}
                      >
                        <Image 
                          source={require('../../../assets/icon_images/career_image.png')}
                          style={styles.overviewIcon}
                          resizeMode="contain"
                        />
                      </LinearGradient>
                    </View>
                    <View style={styles.overviewTextContent}>
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
                
                {/* Enhanced Circular Progress */}
                <View style={styles.integratedProgressSection}>
                  <View style={styles.circularProgressContainer}>
                    <CircularProgress
                      progress={safeData.current_stage.progress}
                      size={120}
                      strokeWidth={12}
                      tintColor={COLORS.primary}
                      backgroundColor="rgba(88, 214, 141, 0.1)"
                      textColor={COLORS.text.primary}
                      textSize={24}
                      animate={true}
                      animationDuration={2000}
                    />
                  </View>
                  <View style={styles.integratedStatsContainer}>
                    <View style={styles.integratedStatItem}>
                      <Text style={styles.integratedStatValue}>{safeData.total_exercises_completed}</Text>
                      <Text style={styles.integratedStatLabel}>Completed Exercises</Text>
                    </View>
                    <View style={styles.integratedStatItem}>
                      <Text style={styles.integratedStatValue}>{safeData.total_practice_time}h</Text>
                      <Text style={styles.integratedStatLabel}>Total Practice Time</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Enhanced Learning Path Section */}
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
              <LinearGradient
                colors={COLORS.primaryGradient as any}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="git-branch" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Learning Path</Text>
            </View>
            
            {safeData.stages.length > 0 ? (
              safeData.stages.map((stage, idx) => {
                const status = getStageStatus(stage);
                const isExpanded = expandedStage === idx;
                return (
                  <View key={stage.stage_id} style={{ 
                    position: 'relative', 
                    zIndex: isExpanded ? 2 : 1,
                    marginBottom: 8, // Add spacing between cards
                    marginTop: 8, // Add spacing above cards
                  }}>
                    <RoadmapLine
                      isFirst={idx === 0}
                      isLast={idx === safeData.stages.length - 1}
                      status={status}
                      isActive={status === 'in_progress'}
                      index={idx}
                    />
                    <StageCard
                      index={idx}
                      stage={{
                        stage: stage.name,
                        subtitle: stage.subtitle,
                        completed: stage.completed,
                        progress: stage.progress,
                        exercises: stage.exercises,
                        unlocked: stage.unlocked,
                      }}
                      expanded={isExpanded}
                      onPress={() => handleStagePress(idx)}
                    >
                      {isExpanded && (
                        <View style={styles.exerciseDropdown}>
                          {stage.exercises.map((ex, exIdx) => {
                            const exStatusColor = getStatusColor(ex.status);
                            const isLocked = ex.status === 'locked';
                            const isCompleted = ex.status === 'completed';
                            const isInProgress = ex.status === 'in_progress';
                            
                            return (
                              <View key={exIdx} style={[
                                styles.exerciseRow,
                                isCompleted && styles.completedExerciseRow,
                                isInProgress && styles.inProgressExerciseRow,
                                isLocked && styles.lockedExerciseRow
                              ]}>
                                <View style={[
                                  styles.exerciseDot, 
                                  { backgroundColor: isLocked ? COLORS.text.tertiary : exStatusColor }
                                ]} />
                                <View style={styles.exerciseContent}>
                                  <Text style={[
                                    styles.exerciseName, 
                                    isLocked && styles.lockedText,
                                    isCompleted && styles.completedText,
                                    isInProgress && styles.inProgressText
                                  ]}>
                                    {ex.name}
                                  </Text>
                                </View>
                                <View style={[
                                  styles.exerciseStatusContainer,
                                  isCompleted && styles.completedStatusContainer,
                                  isInProgress && styles.inProgressStatusContainer,
                                  isLocked && styles.lockedStatusContainer
                                ]}>
                                  <Text style={[
                                    styles.exerciseStatus, 
                                    { color: isLocked ? COLORS.text.tertiary : exStatusColor }
                                  ]}>
                                    {ex.status.replace('_', ' ')}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </StageCard>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={48} color={COLORS.text.tertiary} />
                <Text style={styles.emptyStateText}>No learning stages found</Text>
                <Text style={styles.emptyStateSubtext}>Start your learning journey to see progress here</Text>
              </View>
            )}
          </Animated.View>

          {/* Enhanced Completion Statistics */}
          <Animated.View
            style={[
              styles.completionStatsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={COLORS.primaryGradient as any}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Completion Overview</Text>
            </View>
            
            <BlurView intensity={20} style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.overviewGradient}
              >

                
                {/* Stages Completed Bar */}
                <View style={styles.barItem}>
                  <View style={styles.barHeader}>
                    <View style={[styles.barIconContainer, { backgroundColor: 'rgba(142, 68, 173, 0.1)' }]}>
                      <Ionicons name="layers" size={20} color="#8E44AD" />
                    </View>
                    <View style={styles.barTextContainer}>
                      <Text style={styles.barValue}>{safeData.total_completed_stages}</Text>
                      <Text style={styles.barLabel}>Stages Completed</Text> 
                    </View>
                  </View>
                  <View style={styles.barContainer}>
                    <View style={styles.barBackground}>
                      <Animated.View 
                        style={[
                          styles.barFill, 
                          styles.purpleBar,
                          { width: `${Math.min(100, (safeData.total_completed_stages / 6) * 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barPercentage}>
                      {Math.round((safeData.total_completed_stages / 6) * 100)}%
                    </Text>
                  </View>
                </View>

                {/* Exercises Completed Bar */}
                <View style={styles.barItem}>
                  <View style={styles.barHeader}>
                    <View style={[styles.barIconContainer, { backgroundColor: 'rgba(88, 214, 141, 0.1)' }]}>
                      <Ionicons name="fitness" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.barTextContainer}>
                      
                      <Text style={styles.barValue}>{safeData.total_exercises_completed}</Text>
                      <Text style={styles.barLabel}>Exercises Completed</Text>
                    </View>
                  </View>
                  <View style={styles.barContainer}>
                    <View style={styles.barBackground}>
                      <Animated.View 
                        style={[
                          styles.barFill, 
                          styles.greenBar,
                          { width: `${Math.min(100, (safeData.total_exercises_completed / 18) * 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barPercentage}>
                      {Math.round((safeData.total_exercises_completed / 18) * 100)}%
                    </Text>
                  </View>
                </View>

                {/* Topics Completed Bar */}
                <View style={styles.barItem}>
                  <View style={styles.barHeader}>
                    <View style={[styles.barIconContainer, { backgroundColor: 'rgba(243, 156, 18, 0.1)' }]}>
                      <Ionicons name="book" size={20} color="#F39C12" />
                    </View>
                    <View style={styles.barTextContainer}>
                      
                      <Text style={styles.barValue}>{safeData.total_completed_units}</Text>
                      <Text style={styles.barLabel}>Topics Mastered</Text>
                    </View>
                  </View>
                  <View style={styles.barContainer}>
                    <View style={styles.barBackground}>
                      <Animated.View 
                        style={[
                          styles.barFill, 
                          styles.orangeBar,
                          { width: `${Math.min(100, (safeData.total_completed_units / 337) * 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barPercentage}>
                      {Math.round((safeData.total_completed_units / 337) * 100)}%
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Enhanced Achievements Section */}
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
              <LinearGradient
                colors={COLORS.primaryGradient as any}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Achievements</Text>
            </View>

            <BlurView intensity={20} style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.overviewGradient}
              >

                
                                {safeData.achievements.length > 0 ? (
                  safeData.achievements.map((achievement, index) => (
                    <View key={index} style={[styles.infoRow, index === safeData.achievements.length - 1 && styles.infoRowLast]}>
                      <View style={styles.infoRowLeft}>
                        <View style={[styles.infoRowIcon, { backgroundColor: achievement.color || COLORS.primary }]}>
                          <Ionicons name={achievement.icon as any} size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.infoRowTextContainer}>
                          <Text style={styles.infoRowLabel}>{achievement.name}</Text>
                          <Text style={styles.infoRowSubLabel}>{achievement.date}</Text>
                        </View>
                      </View>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="trophy-outline" size={48} color={COLORS.text.tertiary} />
                    <Text style={styles.emptyStateText}>No achievements yet</Text>
                    <Text style={styles.emptyStateSubtext}>Complete exercises to earn achievements</Text>
                  </View>
                )}
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Enhanced Learning Statistics Section */}
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
              <LinearGradient
                colors={COLORS.primaryGradient as any}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Learning Statistics</Text>
            </View>

            <BlurView intensity={20} style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.overviewGradient}
              >

                
                                {/* Total Learning Time */}
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <View style={[styles.infoRowIcon, { backgroundColor: COLORS.primary }]}>
                      <Ionicons name="time" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.infoRowLabel}>Total Learning Time</Text>
                  </View>
                  <Text style={styles.infoRowValue}>{safeData.total_practice_time}h</Text>
                </View>
                
                {/* Current Day Streak */}
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <View style={[styles.infoRowIcon, { backgroundColor: '#FF6B35' }]}>
                      <Ionicons name="flame" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.infoRowLabel}>Day Streak</Text>
                  </View>
                  <Text style={styles.infoRowValue}>{safeData.streak_days}</Text>
                </View>

                {/* Longest Streak */}
                <View style={styles.infoRow}>
                  <View style={styles.infoRowLeft}>
                    <View style={[styles.infoRowIcon, { backgroundColor: '#F39C12' }]}>
                      <Ionicons name="medal" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.infoRowLabel}>Best Learning Streak</Text>
                  </View>
                  <Text style={styles.infoRowValue}>{safeData.longest_streak}</Text>
                </View>

                {/* Average Session Duration */}
                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <View style={styles.infoRowLeft}>
                    <View style={[styles.infoRowIcon, { backgroundColor: '#3498DB' }]}>
                      <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.infoRowLabel}>Avg. Learning Session</Text>
                  </View>
                  <Text style={styles.infoRowValue}>{safeData.average_session_duration.toFixed(1)}m</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Enhanced Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
          <View style={styles.decorativeCircle4} />
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
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
  },
  headerGradientInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  overviewCard: {
    marginBottom: 40,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(25, 218, 105, 0.3)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  overviewGradient: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 2,
    borderColor: 'rgba(254, 254, 254, 0.4)',
    backgroundColor: COLORS.card,
  },
  overviewHeader: {
    marginBottom: 28,
  },
  overviewHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(88, 214, 141, 0.4)',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  overviewStage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 6,
    fontFamily: 'Lexend-Bold',
  },
  overviewSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontFamily: 'Lexend-Regular',
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
  circularProgressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  integratedProgressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  integratedStatsContainer: {
    flex: 1,
    marginLeft: 24,
  },
  integratedStatItem: {
    flexDirection: 'row',         // Make value and label sit horizontally
    alignItems: 'center', 
    marginBottom: 16,
  },
  integratedStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
    fontFamily: 'Lexend-Bold',
    width: 50,                  
    textAlign: 'right',         
    marginRight: 8,             
  },
  integratedStatLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'left',
    fontFamily: 'Lexend-Regular',
  },
  detailedStatsCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
  },
  detailedStatsGradient: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  detailedStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailedStatsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  overallActivitySection: {
    marginBottom: 30,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  activityPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 12,
  },
  activityLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  segmentedProgressContainer: {
    marginBottom: 8,
  },
  segmentedProgressBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  progressSegment: {
    height: '100%',
  },
  purpleSegment: {
    backgroundColor: '#8E44AD',
  },
  greenSegment: {
    backgroundColor: '#58D68D',
  },
  orangeSegment: {
    backgroundColor: '#F39C12',
  },
  segmentLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segmentLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  taskStatusCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statusSection: {
    flex: 1,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8E44AD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedIcon: {
    backgroundColor: '#58D68D',
  },
  upcomingIcon: {
    backgroundColor: '#F39C12',
  },
  statusNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  statusDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  additionalStatsContainer: {
    flex: 1,
    marginLeft: 20,
  },
  circularStatItem: {
    marginBottom: 12,
  },
  circularStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  circularStatLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'left',
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
    marginBottom: 24,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: -5,
    fontFamily: 'Lexend-Bold',
  },

  learningPathSection: {
    marginBottom: 30,
    paddingHorizontal: 4, // Add some padding to ensure cards cover lines
  },
  completionStatsSection: {
    marginBottom: 30,
  },
  unifiedCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'rgba(88, 214, 141, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 8,
  },
  barChartContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  barChartGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  barItem: {
    marginBottom: 24,
  },
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(142, 68, 173, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(142, 68, 173, 0.3)',
  },
  greenIcon: {
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
  },
  orangeIcon: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  barTextContainer: {
    flexDirection: 'row',     
    alignItems: 'center',    
    flex: 1,
  },
  barLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2, 
    marginLeft: 10,
  },
  barValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    minWidth: 28,            // Ensures space even for 1-digit numbers
    textAlign: 'right',
    marginLeft: -12,      // Right-align numbers
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  purpleBar: {
    backgroundColor: '#8E44AD',
  },
  greenBar: {
    backgroundColor: '#58D68D',
  },
  orangeBar: {
    backgroundColor: '#F39C12',
  },
  barPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    minWidth: 40,
    textAlign: 'right',
  },
  progressStatsSection: {
    marginBottom: 30,
  },
  progressStatsContent: {
    marginTop: 16,
  },
  exerciseDropdown: {
    paddingTop: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(88, 214, 141, 0.05)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.15)',
  },
  completedExerciseRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  inProgressExerciseRow: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  lockedExerciseRow: {
    backgroundColor: 'rgba(156, 163, 175, 0.05)',
    borderColor: 'rgba(156, 163, 175, 0.2)',
  },
  exerciseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseContent: {
    flex: 1,
    marginRight: 16,
  },
  exerciseName: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontFamily: 'Lexend-Regular',
    fontWeight: '500',
  },
  completedText: {
    color: COLORS.success,
    fontWeight: '600',
  },
  inProgressText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  lockedText: {
    color: COLORS.text.tertiary,
  },
  exerciseStatus: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Lexend-Medium',
    textTransform: 'capitalize',
  },
  exerciseStatusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
  },
  completedStatusContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  inProgressStatusContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  lockedStatusContainer: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRowTextContainer: {
    flexDirection: 'column',
  },
  infoRowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: 'Lexend-Medium',
  },
  infoRowSubLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
    fontFamily: 'Lexend-Regular',
  },
  infoRowValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: 'Lexend-Bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(88, 214, 141, 0.2)',
    marginVertical: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Lexend-Medium',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: 24,
    fontFamily: 'Lexend-Regular',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '500',
    fontFamily: 'Lexend-Medium',
  },
  loginButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Lexend-Bold',
  },
  retryButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Lexend-Bold',
  },
  lastRefreshText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 12,
    fontFamily: 'Lexend-Regular',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.15,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(88, 214, 141, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(69, 183, 168, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.7,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(88, 214, 141, 0.05)',
  },
  decorativeCircle4: {
    position: 'absolute',
    bottom: height * 0.4,
    left: width * 0.7,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
}); 