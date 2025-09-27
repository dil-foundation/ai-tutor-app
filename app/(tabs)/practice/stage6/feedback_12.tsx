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
  topic?: string;
  expected_keywords?: string[];
  vocabulary_focus?: string[];
  academic_expressions?: string[];
  user_text?: string;
  evaluation?: any;
  suggested_improvement?: string;
  error?: string;
  message?: string;
  progress_recorded?: boolean;
  unlocked_content?: string[];
  keyword_matches?: number;
  total_keywords?: number;
  academic_expressions_used?: number;
  total_academic_expressions?: number;
}

const FeedbackScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the evaluation result from params
  const evaluationResult: EvaluationResult = params.evaluationResult 
    ? JSON.parse(params.evaluationResult as string) 
    : null;
  
  const currentTopicId = parseInt(params.currentTopicId as string) || 1;
  const totalTopics = parseInt(params.totalTopics as string) || 10;

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
    if (score >= 80) return 'Outstanding critical analysis! You\'ve mastered this topic.';
    if (score >= 35) return 'Well done! Keep practicing to improve further.';
    return 'Good effort! Review the feedback and try again.';
  };

  const handleRetry = () => {
    router.back();
  };

  const handleNext = () => {
    if (currentTopicId < totalTopics) {
      // Navigate back to critical opinion builder screen to load the next topic
      router.push({
        pathname: '/(tabs)/practice/stage6/critical-opinion-builder',
        params: {
          returnFromFeedback: 'true',
        }
      });
    } else {
      // Exercise completed, go back to stage 6 index
      router.push('/(tabs)/practice/stage6');
    }
  };

  // Check if the topic attempt was successful based on score
  const isSuccessfulAttempt = (evaluationResult?.evaluation?.score || 0) >= 35;

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
                <Ionicons name="analytics" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Your Performance</Text>
              <Text style={styles.headerSubtitle}>Critical Opinion Builder Feedback</Text>
              
              {/* Progress Counter */}
              <Text style={styles.progressCounter}>
                Topic: {currentTopicId} of {totalTopics}
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
                <View style={[styles.completionStatus, { backgroundColor: isSuccessfulAttempt ? '#D4EDDA' : '#FFF3CD' }]}>
                  <Ionicons 
                    name={isSuccessfulAttempt ? 'checkmark-circle' : 'alert-circle'} 
                    size={20} 
                    color={isSuccessfulAttempt ? '#155724' : '#856404'} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={[styles.completionStatusText, { color: isSuccessfulAttempt ? '#155724' : '#856404' }]}>
                    {isSuccessfulAttempt ? 'Exercise Completed! 🎉' : 'Keep Practicing 💪'}
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
                    <Ionicons name="school" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult.academic_expressions_used || 0}/{evaluationResult.total_academic_expressions || 0}
                    </Text>
                    <Text style={styles.metricLabel}>Academic Expressions</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="bulb" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult.evaluation?.structure_analysis?.supporting_arguments || 0}
                    </Text>
                    <Text style={styles.metricLabel}>Arguments Made</Text>
                  </View>
                </View>
              </View>

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

              {/* Expected Keywords */}
              {evaluationResult.expected_keywords && evaluationResult.expected_keywords.length > 0 && (
                <View style={styles.keywordsSection}>
                  <Text style={styles.sectionTitle}>Expected Keywords</Text>
                  <View style={styles.keywordsContainer}>
                    {evaluationResult.expected_keywords.map((keyword, index) => (
                      <View key={index} style={styles.keywordChip}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Academic Expressions */}
              {evaluationResult.academic_expressions && evaluationResult.academic_expressions.length > 0 && (
                <View style={styles.academicExpressionsSection}>
                  <Text style={styles.sectionTitle}>Academic Expressions</Text>
                  <View style={styles.academicExpressionsContainer}>
                    {evaluationResult.academic_expressions.map((expression, index) => (
                      <View key={index} style={styles.expressionChip}>
                        <Text style={styles.expressionText}>{expression}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Structure Analysis */}
              {evaluationResult.evaluation?.structure_analysis && (
                <View style={styles.structureSection}>
                  <Text style={styles.sectionTitle}>Argument Structure Analysis</Text>
                  <View style={styles.structureCard}>
                    <View style={styles.structureItem}>
                      <Ionicons 
                        name={evaluationResult.evaluation.structure_analysis.thesis_present ? 'checkmark-circle' : 'close-circle'} 
                        size={20} 
                        color={evaluationResult.evaluation.structure_analysis.thesis_present ? '#58D68D' : '#E74C3C'} 
                      />
                      <Text style={styles.structureText}>Clear Thesis Statement</Text>
                    </View>
                    <View style={styles.structureItem}>
                      <Ionicons 
                        name={evaluationResult.evaluation.structure_analysis.supporting_arguments > 0 ? 'checkmark-circle' : 'close-circle'} 
                        size={20} 
                        color={evaluationResult.evaluation.structure_analysis.supporting_arguments > 0 ? '#58D68D' : '#E74C3C'} 
                      />
                      <Text style={styles.structureText}>
                        Supporting Arguments ({evaluationResult.evaluation.structure_analysis.supporting_arguments})
                      </Text>
                    </View>
                    <View style={styles.structureItem}>
                      <Ionicons 
                        name={evaluationResult.evaluation.structure_analysis.counterpoint_addressed ? 'checkmark-circle' : 'close-circle'} 
                        size={20} 
                        color={evaluationResult.evaluation.structure_analysis.counterpoint_addressed ? '#58D68D' : '#E74C3C'} 
                      />
                      <Text style={styles.structureText}>Counterpoint Addressed</Text>
                    </View>
                    <View style={styles.structureItem}>
                      <Ionicons 
                        name={evaluationResult.evaluation.structure_analysis.conclusion_present ? 'checkmark-circle' : 'close-circle'} 
                        size={20} 
                        color={evaluationResult.evaluation.structure_analysis.conclusion_present ? '#58D68D' : '#E74C3C'} 
                      />
                      <Text style={styles.structureText}>Strong Conclusion</Text>
                    </View>
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
            {!isSuccessfulAttempt && (
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
            
            {/* Show Next Topic button when completed */}
            {isSuccessfulAttempt && (
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
                    {currentTopicId < totalTopics ? 'Next Topic' : 'Finish'}
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
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
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
  keywordsSection: {
    marginBottom: 32,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: '#58D68D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keywordText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  academicExpressionsSection: {
    marginBottom: 32,
  },
  academicExpressionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expressionChip: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expressionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  structureSection: {
    marginBottom: 32,
  },
  structureCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  structureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  structureText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
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

export default FeedbackScreen; 