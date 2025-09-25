import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface EvaluationResult {
  success: boolean;
  prompt?: string;
  expected_responses?: any[];
  user_text?: string;
  evaluation?: any;
  suggested_improvement?: string;
  error?: string;
  message?: string;
  progress_recorded?: boolean;
  unlocked_content?: string[];
  keyword_matches?: number;
  total_keywords?: number;
  fluency_score?: number;
  grammar_score?: number;
  response_type?: string;
  scenario_title?: string;
  scenario_context?: string;
}

const FeedbackScreen2 = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the evaluation result from params
  const evaluationResult: EvaluationResult = params.evaluationResult 
    ? JSON.parse(params.evaluationResult as string) 
    : null;
  
  const currentScenarioId = parseInt(params.currentScenarioId as string) || 1;
  const totalScenarios = parseInt(params.totalScenarios as string) || 8;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#58D68D';
    if (score >= 35) return '#F39C12';
    return '#E74C3C';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! 🎉';
    if (score >= 35) return 'Good Job! 👍';
    return 'Keep Practicing 💪';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent group conversation skills! You\'ve mastered this scenario.';
    if (score >= 35) return 'Well done! You can move to the next prompt.';
    return 'Good effort! Review the feedback and try again.';
  };

  const handleRetry = () => {
    router.back();
  };

  const handleNext = () => {
    if (currentScenarioId < totalScenarios) {
      // Navigate back to group dialogue screen with next scenario info
      router.push({
        pathname: '/(tabs)/practice/stage3/group-dialogue',
        params: {
          nextScenario: 'true',
          currentScenarioId: (currentScenarioId + 1).toString(),
        }
      });
    } else {
      // Exercise completed, go back to stage 3 index
      router.push('/(tabs)/practice/stage3');
    }
  };

  // Check if the exercise is completed based on evaluation result
  const isCompleted = evaluationResult?.evaluation?.completed === true;

  if (!evaluationResult) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.errorText}>No evaluation data available</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
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
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.titleGradient}
              >
                <Ionicons name="people" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Your Performance</Text>
              <Text style={styles.headerSubtitle}>Group Dialogue Feedback</Text>
              
              {/* Progress Counter */}
              <Text style={styles.progressCounter}>
                Scenario: {currentScenarioId} of {totalScenarios}
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.mainCard}
            >
              {/* Score Section */}
              <View style={styles.scoreSection}>
                <Text style={styles.scoreTitle}>Overall Score</Text>
                <View style={styles.scoreCircle}>
                  <LinearGradient
                    colors={[getScoreColor(evaluationResult.evaluation?.score || 0), getScoreColor(evaluationResult.evaluation?.score || 0) + '80']}
                    style={styles.scoreGradient}
                  >
                    <Text style={styles.scoreValue}>
                      {evaluationResult.evaluation?.score || 0}
                    </Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.scoreMessage}>
                  {getScoreMessage(evaluationResult.evaluation?.score || 0)}
                </Text>
                <Text style={styles.scoreDescription}>
                  {getScoreDescription(evaluationResult.evaluation?.score || 0)}
                </Text>
                
                {/* Completion Status */}
                <View style={[styles.completionStatus, { backgroundColor: isCompleted ? '#D4EDDA' : '#FFF3CD' }]}>
                  <Ionicons 
                    name={isCompleted ? 'checkmark-circle' : 'alert-circle'} 
                    size={20} 
                    color={isCompleted ? '#155724' : '#856404'} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={[styles.completionStatusText, { color: isCompleted ? '#155724' : '#856404' }]}>
                    {isCompleted ? 'Scenario Completed! 🎉' : 'Keep Practicing 💪'}
                  </Text>
                </View>
              </View>

              {/* Metrics Section */}
              <View style={styles.metricsSection}>
                <Text style={styles.sectionTitle}>Performance Metrics</Text>
                
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Ionicons name="key" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult.keyword_matches || 0}/{evaluationResult.total_keywords || 0}
                    </Text>
                    <Text style={styles.metricLabel}>Keywords Used</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="chatbubbles" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult.fluency_score || 0}/100
                    </Text>
                    <Text style={styles.metricLabel}>Fluency</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="school" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult.grammar_score || 0}/100
                    </Text>
                    <Text style={styles.metricLabel}>Grammar</Text>
                  </View>
                  
                  {/* Response Type for Group Dialogue */}
                  {evaluationResult.response_type && (
                    <View style={styles.metricCard}>
                      <Ionicons name="people" size={24} color="#58D68D" />
                      <Text style={styles.metricValue}>
                        {evaluationResult.response_type}
                      </Text>
                      <Text style={styles.metricLabel}>Response Type</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Scenario Context */}
              {evaluationResult.scenario_title && (
                <View style={styles.scenarioSection}>
                  <Text style={styles.sectionTitle}>Scenario Context</Text>
                  <View style={styles.scenarioCard}>
                    <Ionicons name="information-circle" size={20} color="#58D68D" style={styles.scenarioIcon} />
                    <View style={styles.scenarioContent}>
                      <Text style={styles.scenarioTitle}>{evaluationResult.scenario_title}</Text>
                      {evaluationResult.scenario_context && (
                        <Text style={styles.scenarioContext}>{evaluationResult.scenario_context}</Text>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* What You Said Section */}
              {evaluationResult.user_text && (
                <View style={styles.userTextSection}>
                  <Text style={styles.sectionTitle}>What You Said</Text>
                  <View style={styles.userTextCard}>
                    <Ionicons name="mic" size={20} color="#58D68D" style={styles.userTextIcon} />
                    <Text style={styles.userText}>{evaluationResult.user_text}</Text>
                  </View>
                </View>
              )}

              {/* Improvement Suggestions */}
              {evaluationResult.suggested_improvement && (
                <View style={styles.improvementSection}>
                  <Text style={styles.sectionTitle}>Suggestions for Improvement</Text>
                  <View style={styles.improvementCard}>
                    <Ionicons name="bulb" size={20} color="#F39C12" style={styles.improvementIcon} />
                    <Text style={styles.improvementText}>
                      {evaluationResult.suggested_improvement}
                    </Text>
                  </View>
                </View>
              )}

              {/* Expected Response Types */}
              {evaluationResult.expected_responses && evaluationResult.expected_responses.length > 0 && (
                <View style={styles.responsesSection}>
                  <Text style={styles.sectionTitle}>Expected Response Types</Text>
                  <View style={styles.responsesContainer}>
                    {evaluationResult.expected_responses.map((response, index) => (
                      <View key={index} style={styles.responseChip}>
                        <Text style={styles.responseType}>{response.type}</Text>
                        <Text style={styles.responseText}>{response.response}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Unlocked Content */}
              {evaluationResult.unlocked_content && evaluationResult.unlocked_content.length > 0 && (
                <View style={styles.unlockedSection}>
                  <Text style={styles.sectionTitle}>🎉 New Content Unlocked!</Text>
                  <View style={styles.unlockedCard}>
                    <Ionicons name="trophy" size={20} color="#F39C12" style={styles.unlockedIcon} />
                    <Text style={styles.unlockedText}>
                      {evaluationResult.unlocked_content.join(', ')}
                    </Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Show Try Again button when not completed */}
            {!isCompleted && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <LinearGradient
                  colors={['#E9ECEF', '#DEE2E6']}
                  style={styles.retryButtonGradient}
                >
                  <Ionicons name="refresh" size={20} color="#666666" style={{ marginRight: 8 }} />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Show Next Scenario button when completed */}
            {isCompleted && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <LinearGradient
                  colors={["#58D68D", "#45B7A8"]}
                  style={styles.nextButtonGradient}
                >
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.nextButtonText}>
                    {currentScenarioId < totalScenarios ? 'Next Scenario' : 'Finish'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
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
    marginBottom: 12,
  },
  progressCounter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scoreMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  completionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  completionStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  scenarioSection: {
    marginBottom: 32,
  },
  scenarioCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scenarioIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  scenarioContent: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  scenarioContext: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  userTextSection: {
    marginBottom: 32,
  },
  userTextCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userTextIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  userText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    flex: 1,
    fontStyle: 'italic',
  },
  improvementSection: {
    marginBottom: 32,
  },
  improvementCard: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  improvementIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  improvementText: {
    fontSize: 16,
    color: '#856404',
    lineHeight: 22,
    flex: 1,
  },
  responsesSection: {
    marginBottom: 32,
  },
  responsesContainer: {
    gap: 8,
  },
  responseChip: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  responseType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  responseText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  unlockedSection: {
    marginBottom: 32,
  },
  unlockedCard: {
    backgroundColor: '#D4EDDA',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unlockedIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  unlockedText: {
    fontSize: 16,
    color: '#155724',
    lineHeight: 22,
    flex: 1,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  retryButton: {
    flex: 1,
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  nextButton: {
    flex: 1,
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default FeedbackScreen2; 