import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { 
  ActivityIndicator,
  Alert,
  Animated, 
  Dimensions, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { ProgressHelpers, ProgressData } from '../../../utils/progressTracker';

const { width, height } = Dimensions.get('window');

const practiceStages = [
  {
    title: "Stage 0 - Beginner Lessons",
    description: "Start your English learning journey with basic fundamentals",
    icon: "library-outline",
    path: './practice/stage0',
    gradient: ['#58D68D', '#45B7A8'] as const,
    category: "Beginner"
  },
  {
    title: "Stage 1 - Intermediate Lessons", 
    description: "Build confidence with structured conversation practice",
    icon: "chatbubbles-outline",
    path: './practice/stage1',
    gradient: ['#45B7A8', '#3A8B9F'] as const,
    category: "Beginner"
  },
  {
    title: "Stage 2 - Upper Intermediate",
    description: "Master everyday conversations and real-life scenarios",
    icon: "people-outline",
    path: './practice/stage2',
    gradient: ['#3A8B9F', '#2E7D8F'] as const,
    category: "Beginner"
  },
  {
    title: "Stage 3 - Advanced Lessons",
    description: "Express complex ideas and handle detailed discussions",
    icon: "bulb-outline",
    path: './practice/stage3',
    gradient: ['#2E7D8F', '#236F7F'] as const,
    category: "Advanced"
  },
  {
    title: "Stage 4 - Expert Lessons",
    description: "Achieve fluency with sophisticated language skills",
    icon: "trophy-outline",
    path: './practice/stage4',
    gradient: ['#236F7F', '#18616F'] as const,
    category: "Advanced"
  },
  {
    title: "Stage 5 - Master Lessons",
    description: "Perfect your English with professional-level proficiency",
    icon: "star-outline",
    path: './practice/stage5',
    gradient: ['#18616F', '#0D535F'] as const,
    category: "Advanced"
  },
  {
    title: "Stage 6 - Fluency Lessons",
    description: "Master real-time fluency and advanced communication",
    icon: "rocket-outline",
    path: './practice/stage6',
    gradient: ['#0D535F', '#02454F'] as const,
    category: "Advanced"
  }
];

export default function PracticeLandingScreen() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  
  // Create individual scale animations for each stage
  const [stageScaleAnims] = useState(() => 
    practiceStages.map(() => new Animated.Value(1))
  );

  useFocusEffect(
    useCallback(() => {
      const fetchProgress = async () => {
        setLoading(true);
        try {
          const result = await ProgressHelpers.getComprehensiveProgress();
          if (result.success && result.data) {
            setProgressData(result.data);
          } else {
            console.error("Failed to fetch comprehensive progress:", result.error);
          }
        } catch (error) {
          console.error("Error fetching progress in PracticeLandingScreen:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProgress();
    }, [])
  );

  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading]);

  const getStageStatus = (stageIndex: number): 'unlocked' | 'locked' | 'completed' | 'loading' => {
    if (loading) {
      return 'loading';
    }
    if (!progressData) {
      return 'locked';
    }
  
    // Find the specific stage from the detailed progress data
    const stageInfo = progressData.stages.find(s => s.stage_id === stageIndex);
  
    if (!stageInfo) {
      // If stage info is not found (shouldn't happen for stages 0-6), assume locked
      return 'locked';
    }
  
    if (stageInfo.completed) {
      return 'completed';
    }
  
    // Stage 0 is always unlocked if not completed
    if (stageIndex === 0) {
      return 'unlocked';
    }

    // A stage is unlocked if it's explicitly marked as unlocked
    if (stageInfo.unlocked) {
      return 'unlocked';
    }
  
    // Or if the previous stage is completed
    if (stageIndex > 0) {
      const prevStageInfo = progressData.stages.find(s => s.stage_id === stageIndex - 1);
      if (prevStageInfo && prevStageInfo.completed) {
        return 'unlocked';
      }
    }
  
    return 'locked';
  };

  const navigateToStage = (stagePath: string, stageIndex: number) => {
    const status = getStageStatus(stageIndex);

    if (status === 'unlocked' || status === 'completed') {
      // Add a small scale animation on press for the specific stage
      Animated.sequence([
        Animated.timing(stageScaleAnims[stageIndex], {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(stageScaleAnims[stageIndex], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.push(stagePath as any);
      });
    } else if (status === 'locked') {
      Alert.alert(
        "Stage Locked",
        "You need to complete previous stages to unlock this one."
      );
    }
  };

  const beginnerStages = practiceStages.filter(stage => stage.category === "Beginner");
  const advancedStages = practiceStages.filter(stage => stage.category === "Advanced");

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58D68D" />
        <Text style={styles.loadingText}>Loading Your Progress...</Text>
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
        {/* Header Section - Now inside ScrollView */}
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
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.iconGradient}
              >
                <Ionicons name="school" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Practice Your English</Text>
            <Text style={styles.headerSubtitle}>Choose your level and start practicing</Text>
          </View>
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
            <LinearGradient
              colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
              style={styles.sectionHeaderGradient}
            >
              <Ionicons name="leaf" size={24} color="#58D68D" />
              <Text style={styles.sectionTitle}>Beginner Stages</Text>
            </LinearGradient>
          </View>

          {beginnerStages.map((stage, index) => {
            const stageIndex = practiceStages.findIndex(s => s.title === stage.title);
            const status = getStageStatus(stageIndex);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';

            return (
              <Animated.View
                key={stage.title}
                style={[
                  styles.stageCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: stageScaleAnims[stageIndex] }
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.stageButton}
                  onPress={() => navigateToStage(stage.path, stageIndex)}
                  activeOpacity={0.8}
                  disabled={status === 'loading'}
                >
                  <LinearGradient
                    colors={stage.gradient}
                    style={[styles.stageGradient, isLocked && styles.lockedStage]}
                  >
                    <View style={styles.stageContent}>
                      <View style={styles.stageIconContainer}>
                        {isLocked ? (
                          <Ionicons name="lock-closed-outline" size={28} color="#FFFFFF" />
                        ) : isCompleted ? (
                          <Ionicons name="checkmark-circle-outline" size={28} color="#FFFFFF" />
                        ) : (
                          <Ionicons name={stage.icon as any} size={28} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={styles.stageTextContainer}>
                        <Text style={styles.stageTitle}>{stage.title}</Text>
                        <Text style={styles.stageDescription}>{stage.description}</Text>
                      </View>
                      <View style={styles.arrowContainer}>
                        {isLocked ? (
                           <Ionicons name="lock-closed" size={20} color="rgba(255, 255, 255, 0.7)" />
                        ) : isCompleted ? null : (
                          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
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
            <LinearGradient
              colors={['rgba(45, 183, 168, 0.1)', 'rgba(58, 214, 141, 0.05)']}
              style={styles.sectionHeaderGradient}
            >
              <Ionicons name="rocket" size={24} color="#45B7A8" />
              <Text style={styles.sectionTitle}>Advanced Stages</Text>
            </LinearGradient>
          </View>

          {advancedStages.map((stage, index) => {
            const stageIndex = practiceStages.findIndex(s => s.title === stage.title);
            const status = getStageStatus(stageIndex);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            
            return (
              <Animated.View
                key={stage.title}
                style={[
                  styles.stageCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: stageScaleAnims[stageIndex] }
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.stageButton}
                  onPress={() => navigateToStage(stage.path, stageIndex)}
                  activeOpacity={0.8}
                  disabled={status === 'loading'}
                >
                  <LinearGradient
                    colors={stage.gradient}
                    style={[styles.stageGradient, isLocked && styles.lockedStage]}
                  >
                    <View style={styles.stageContent}>
                      <View style={styles.stageIconContainer}>
                         {isLocked ? (
                          <Ionicons name="lock-closed-outline" size={28} color="#FFFFFF" />
                        ) : isCompleted ? (
                          <Ionicons name="checkmark-circle-outline" size={28} color="#FFFFFF" />
                        ) : (
                          <Ionicons name={stage.icon as any} size={28} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={styles.stageTextContainer}>
                        <Text style={styles.stageTitle}>{stage.title}</Text>
                        <Text style={styles.stageDescription}>{stage.description}</Text>
                      </View>
                      <View style={styles.arrowContainer}>
                        {isLocked ? (
                          <Ionicons name="lock-closed" size={20} color="rgba(255, 255, 255, 0.7)" />
                        ) : isCompleted ? null : (
                          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        )}
                      </View>
                    </View>
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
                Monitor your learning journey and see your improvement over time
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
}

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
    marginTop: 10,
    fontSize: 16,
    color: '#6C757D',
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
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionContainer: {
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
  stageCard: {
    marginBottom: 16,
  },
  stageButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  stageGradient: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  lockedStage: {
    opacity: 0.7,
  },
  stageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stageTextContainer: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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