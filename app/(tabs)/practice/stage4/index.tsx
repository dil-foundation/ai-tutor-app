import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Animated, 
  Dimensions, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressHelpers } from '../../../../utils/progressTracker';
import { useAuth } from '../../../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const Stage4Screen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  
  const [isLoading, setIsLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  // Create individual scale animations for each activity
  const [activityScaleAnims] = useState(() => 
    [1, 2, 3].map(() => new Animated.Value(1))
  );

  const activities = [
    {
      id: 'abstractTopic',
      exerciseId: 1,
      title: 'Abstract Topic Monologue',
      description: 'Practice expressing complex ideas on abstract topics with clarity',
      icon: 'chatbubble-ellipses-outline' as const,
      screen: '/(tabs)/practice/stage4/abstract-topic' as any,
      gradient: ['#58D68D', '#45B7A8'] as const,
      iconBg: 'rgba(88, 214, 141, 0.2)',
    },
    {
      id: 'mockInterview',
      exerciseId: 2,
      title: 'Mock Interview Practice',
      description: 'Simulate real-world interviews to improve fluency and build confidence',
      icon: 'briefcase-outline' as const,
      screen: '/(tabs)/practice/stage4/mock-interview' as any,
      gradient: ['#45B7A8', '#3A8B9F'] as const,
      iconBg: 'rgba(69, 183, 168, 0.2)',
    },
    {
      id: 'newsSummary',
      exerciseId: 3,
      title: 'News Summary Challenge',
      description: 'Summarize news articles to enhance comprehension and expression skills',
      icon: 'newspaper-outline' as const,
      screen: '/(tabs)/practice/stage4/news-summary' as any,
      gradient: ['#3A8B9F', '#2E7D8F'] as const,
      iconBg: 'rgba(58, 139, 159, 0.2)',
    },
  ];

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      console.log('🔄 [STAGE 4] Fetching latest progress...');
      const result = await ProgressHelpers.forceRefreshProgress();
      if (result.success && result.data) {
        const stage4 = result.data.stages.find((stage: any) => stage.stage_id === 4);
        if (stage4) {
          const completed: Record<number, boolean> = {};
          stage4.exercises.forEach((exercise: any) => {
            if (exercise.completed) {
              completed[exercise.exercise_id] = true;
            }
          });
          setCompletedExercises(completed);
          console.log('✅ [STAGE 4] Progress updated:', completed);
        }
      } else {
        console.error("❌ [STAGE 4] Failed to fetch progress:", result.message);
      }
    } catch (error) {
      console.error("❌ [STAGE 4] Error fetching progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [fetchProgress])
  );

  useEffect(() => {
    // Animate elements on mount
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
    ]).start();
  }, []);

  const navigateToActivity = (activity: (typeof activities)[0], activityIndex: number) => {
    const isCompleted = completedExercises[activity.exerciseId];
    
    if (isCompleted) {
      Alert.alert(
        "Exercise Completed",
        "You have already mastered this exercise. Keep up the great work!",
        [{ text: "OK" }]
      );
      return;
    }

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

    router.push(activity.screen);
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#45B7A8" />
        <Text style={styles.loadingText}>Loading Stage 4...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            <TouchableOpacity onPress={() => router.push({ pathname: '/practice' })} style={styles.backButton}>
              <View style={styles.backButtonCircle}>
                <Ionicons name="arrow-back" size={24} color="#58D68D" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.titleGradient}
              >
                <Ionicons name="school" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Stage 4</Text>
              <Text style={styles.headerSubtitle}>B2 Upper Intermediate Level</Text>
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
          <LinearGradient
            colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
            style={styles.goalGradient}
          >
            <View style={styles.goalContent}>
              <Ionicons name="flag" size={28} color="#58D68D" />
              <Text style={styles.goalTitle}>Your Learning Goal</Text>
              <Text style={styles.goalDescription}>
                Express complex ideas clearly, use nuanced vocabulary, and fluently manage discussions with confidence
              </Text>
            </View>
          </LinearGradient>
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
            <LinearGradient
              colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
              style={styles.sectionHeaderGradient}
            >
              <Ionicons name="play-circle" size={24} color="#58D68D" />
              <Text style={styles.sectionTitle}>Practice Activities</Text>
            </LinearGradient>
          </View>

          {activities.map((activity, index) => {
            const isCompleted = completedExercises[activity.exerciseId];
            return(
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
                onPress={() => navigateToActivity(activity, index)}
                activeOpacity={isCompleted ? 1 : 0.8}
                disabled={isCompleted}
              >
                <LinearGradient
                  colors={isCompleted ? ['#B0BEC5', '#90A4AE'] : activity.gradient}
                  style={styles.activityGradient}
                >
                  <View style={styles.activityContent}>
                    <View style={[styles.activityIconContainer, { backgroundColor: activity.iconBg }]}>
                      <Ionicons name={activity.icon} size={28} color="#FFFFFF" />
                    </View>
                    <View style={styles.activityTextContainer}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    </View>
                    <View style={styles.arrowContainer}>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </View>
                  </View>
                   {isCompleted && (
                    <View style={styles.completedOverlay}>
                      <Ionicons name="checkmark-circle" size={48} color="white" />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            );
          })}
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
          <LinearGradient
            colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
            style={styles.progressGradient}
          >
            <View style={styles.progressContent}>
              <Ionicons name="trending-up" size={32} color="#58D68D" />
              <Text style={styles.progressTitle}>Track Your Progress</Text>
              <Text style={styles.progressDescription}>
                Complete activities to unlock advanced stages and track your improvement
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      <View style={styles.decorativeCircle4} />
      
      {/* Floating Particles */}
      <View style={styles.particle1} />
      <View style={styles.particle2} />
      <View style={styles.particle3} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#3A8B9F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  titleGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(88, 214, 141, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
  goalSection: {
    marginBottom: 30,
  },
  goalGradient: {
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
  goalContent: {
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
  activitiesSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 12,
  },
  activityCard: {
    marginBottom: 16,
    minHeight: 120,
    flex: 1,
  },
  activityButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    minHeight: 120,
  },
  activityGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  activityTextContainer: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  activityDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  progressCard: {
    marginTop: 20,
  },
  progressGradient: {
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
  progressContent: {
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  progressDescription: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.15,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.7,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.015)',
  },
  decorativeCircle4: {
    position: 'absolute',
    bottom: height * 0.1,
    right: width * 0.2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  },
  particle1: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C757D',
    opacity: 0.3,
  },
  particle2: {
    position: 'absolute',
    top: height * 0.6,
    right: width * 0.15,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ADB5BD',
    opacity: 0.2,
  },
  particle3: {
    position: 'absolute',
    bottom: height * 0.3,
    left: width * 0.2,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CED4DA',
    opacity: 0.25,
  },
});

export default Stage4Screen; 