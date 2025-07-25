import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Animated, 
  Dimensions, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import BASE_API_URL from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import LoadingScreen from '../../../../components/LoadingScreen';

const { width, height } = Dimensions.get('window');

interface Scenario {
  id: number;
  title: string;
  title_urdu: string;
  description: string;
  description_urdu: string;
  initial_prompt: string;
  initial_prompt_urdu: string;
  scenario_context: string;
  difficulty: string;
  expected_keywords: string[];
  expected_keywords_urdu: string[];
  ai_character: string;
  conversation_flow: string;
  cultural_context: string;
  is_completed: boolean;
}

const RoleplaySimulationScreen = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // State management
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Animation effects
  useEffect(() => {
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

  // Load scenarios when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadScenarios();
    }
  }, [user, authLoading]);

  // Reload scenarios when screen comes into focus (e.g., returning from evaluation)
  useFocusEffect(
    useCallback(() => {
      if (user && !authLoading) {
        const now = Date.now();
        // Only refresh if it's been more than 1 second since last refresh
        if (now - lastRefresh > 1000) {
          console.log("🔄 [ROLEPLAY] Screen focused, reloading scenarios...");
          setLastRefresh(now);
          loadScenarios(false); // Don't show loading indicator for refresh
        }
      }
    }, [user, authLoading, lastRefresh])
  );

  const loadScenarios = async (showLoading: boolean = true) => {
    console.log("🔄 [ROLEPLAY] Loading scenarios for user:", user?.id);
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await fetch(`${BASE_API_URL}/api/roleplay-scenarios?user_id=${user?.id}`);
      const result = await response.json();
      
      console.log("📊 [ROLEPLAY] Scenarios response:", result);
      
      if (response.ok && result.scenarios) {
        setScenarios(result.scenarios);
        console.log("✅ [ROLEPLAY] Loaded", result.scenarios.length, "scenarios");
      } else {
        console.log("❌ [ROLEPLAY] Failed to load scenarios:", result.detail);
        setError('Failed to load scenarios. Please try again.');
      }
    } catch (error) {
      console.error("❌ [ROLEPLAY] Error loading scenarios:", error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScenario = (scenario: Scenario) => {
    console.log("🔄 [ROLEPLAY] Starting scenario:", scenario.id);
    
    if (scenario.is_completed) {
      Alert.alert(
        'Scenario Completed',
        'You have already completed this scenario. Great job!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Navigate to the chat interface
    router.push({
      pathname: '/practice/stage2/roleplay-chat',
      params: { 
        scenarioId: scenario.id.toString(),
        scenarioTitle: scenario.title,
        scenarioContext: scenario.scenario_context,
        aiCharacter: scenario.ai_character
      }
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'a2_beginner':
        return '#58D68D';
      case 'a2_intermediate':
        return '#FFC107';
      case 'a2_advanced':
        return '#FF6B6B';
      default:
        return '#58D68D';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'a2_beginner':
        return 'Beginner';
      case 'a2_intermediate':
        return 'Intermediate';
      case 'a2_advanced':
        return 'Advanced';
      default:
        return 'Beginner';
    }
  };

  const getScenarioIcon = (context: string) => {
    switch (context) {
      case 'restaurant_ordering':
        return 'restaurant-outline';
      case 'medical_consultation':
        return 'medical-outline';
      case 'transportation_booking':
        return 'car-outline';
      case 'clothing_shopping':
        return 'shirt-outline';
      case 'hotel_booking':
        return 'bed-outline';
      case 'asking_directions':
        return 'map-outline';
      case 'cafe_ordering':
        return 'cafe-outline';
      case 'customer_service':
        return 'call-outline';
      case 'phone_conversation':
        return 'phone-portrait-outline';
      case 'job_interview':
        return 'briefcase-outline';
      case 'online_shopping':
        return 'cart-outline';
      case 'weather_discussion':
        return 'partly-sunny-outline';
      case 'flight_booking':
        return 'airplane-outline';
      case 'family_discussion':
        return 'people-outline';
      case 'event_planning':
        return 'calendar-outline';
      default:
        return 'chatbubbles-outline';
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity onPress={() => router.push({ pathname: '/practice/stage2' })} style={styles.backButton}>
              <View style={styles.backButtonCircle}>
                <Ionicons name="arrow-back" size={24} color="#58D68D" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.titleGradient}
              >
                <Ionicons name="people" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Roleplay Simulation</Text>
              <Text style={styles.headerSubtitle}>Practice Real Conversations</Text>
            </View>
          </Animated.View>

          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="hourglass-outline" size={48} color="#58D68D" />
                <Text style={styles.loadingText}>Loading scenarios...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => loadScenarios()}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionTitle}>Choose a Scenario</Text>
                <Text style={styles.sectionSubtitle}>
                  Practice English through realistic conversations
                </Text>
                
                {scenarios.map((scenario, index) => (
                  <Animated.View
                    key={scenario.id}
                    style={[
                      styles.scenarioCard,
                      {
                        opacity: fadeAnim,
                        transform: [
                          { translateY: slideAnim },
                          { scale: scaleAnim }
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                      style={styles.scenarioCardGradient}
                    >
                      {/* Scenario Header */}
                      <View style={styles.scenarioHeader}>
                        <View style={styles.iconContainer}>
                          <LinearGradient
                            colors={[getDifficultyColor(scenario.difficulty), '#45B7A8']}
                            style={styles.iconGradient}
                          >
                            <Ionicons 
                              name={getScenarioIcon(scenario.scenario_context)} 
                              size={24} 
                              color="#FFFFFF" 
                            />
                          </LinearGradient>
                        </View>
                        
                        <View style={styles.scenarioInfo}>
                          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                          <Text style={styles.scenarioTitleUrdu}>{scenario.title_urdu}</Text>
                          
                          <View style={styles.difficultyContainer}>
                            <View 
                              style={[
                                styles.difficultyBadge,
                                { backgroundColor: getDifficultyColor(scenario.difficulty) }
                              ]}
                            >
                              <Text style={styles.difficultyText}>
                                {getDifficultyText(scenario.difficulty)}
                              </Text>
                            </View>
                            
                            {scenario.is_completed && (
                              <View style={styles.completedBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="#58D68D" />
                                <Text style={styles.completedText}>Completed</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      
                      {/* Scenario Description */}
                      <Text style={styles.scenarioDescription}>{scenario.description}</Text>
                      <Text style={styles.scenarioDescriptionUrdu}>{scenario.description_urdu}</Text>
                      
                      {/* Expected Keywords */}
                      <View style={styles.keywordsContainer}>
                        <Text style={styles.keywordsTitle}>Keywords to Practice:</Text>
                        <Text style={styles.keywordsText}>
                          {scenario.expected_keywords.join(", ")}
                        </Text>
                      </View>
                      
                      {/* Action Button */}
                      <TouchableOpacity
                        style={[
                          styles.startButton,
                          scenario.is_completed && styles.completedButton
                        ]}
                        onPress={() => handleStartScenario(scenario)}
                        disabled={scenario.is_completed}
                      >
                        <LinearGradient
                          colors={scenario.is_completed 
                            ? ['#E8F5E8', '#D4EDD4'] 
                            : ['#58D68D', '#45B7A8']
                          }
                          style={styles.startButtonGradient}
                        >
                          <Ionicons 
                            name={scenario.is_completed ? 'checkmark-circle' : 'play'} 
                            size={20} 
                            color={scenario.is_completed ? '#58D68D' : '#FFFFFF'} 
                          />
                          <Text style={[
                            styles.startButtonText,
                            scenario.is_completed && styles.completedButtonText
                          ]}>
                            {scenario.is_completed ? 'Completed' : 'Start Conversation'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </LinearGradient>
                  </Animated.View>
                ))}
                
                {scenarios.length === 0 && !isLoading && !error && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#58D68D" />
                    <Text style={styles.emptyTitle}>No Scenarios Available</Text>
                    <Text style={styles.emptyText}>
                      Check back later for new roleplay scenarios.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 60,
    paddingHorizontal: 24,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 0 : 10,
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
    marginTop: Platform.OS === 'ios' ? 10 : 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 24,
  },
  scenarioCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  scenarioCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  scenarioTitleUrdu: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.2)',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#58D68D',
    marginLeft: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  scenarioDescriptionUrdu: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  keywordsContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  keywordsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 8,
  },
  keywordsText: {
    fontSize: 14,
    color: '#FFC107',
    fontWeight: '600',
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completedButton: {
    shadowColor: '#58D68D',
    shadowOpacity: 0.1,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completedButtonText: {
    color: '#58D68D',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#58D68D',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#58D68D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#58D68D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default RoleplaySimulationScreen; 