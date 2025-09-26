import React, { useState, useEffect, useRef } from 'react';
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
  news_title?: string;
  expected_keywords?: string[];
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
  completed?: boolean;
}

const Feedback6Screen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [currentNewsId, setCurrentNewsId] = useState(1);
  const [totalNewsItems, setTotalNewsItems] = useState(10);
  
  // Use ref to track if we've already parsed the evaluation result
  const hasParsedEvaluation = useRef(false);

  useEffect(() => {
    // Only parse evaluation result if we haven't parsed it yet
    if (params.evaluationResult && !hasParsedEvaluation.current) {
      try {
        const result = JSON.parse(params.evaluationResult as string);
        setEvaluationResult(result);
        hasParsedEvaluation.current = true;
        console.log('✅ [FEEDBACK] Evaluation result loaded successfully');
      } catch (error) {
        console.error('❌ [FEEDBACK] Error parsing evaluation result:', error);
      }
    }

    // Only update currentNewsId if it's different
    if (params.currentNewsId) {
      const newNewsId = parseInt(params.currentNewsId as string);
      if (newNewsId !== currentNewsId) {
        setCurrentNewsId(newNewsId);
      }
    }

    // Only update totalNewsItems if it's different
    if (params.totalNewsItems) {
      const newTotalItems = parseInt(params.totalNewsItems as string);
      if (newTotalItems !== totalNewsItems) {
        setTotalNewsItems(newTotalItems);
      }
    }
  }, [params.evaluationResult, params.currentNewsId, params.totalNewsItems, currentNewsId, totalNewsItems]);

  // Cleanup effect to reset parsing flag when component unmounts
  useEffect(() => {
    return () => {
      hasParsedEvaluation.current = false;
    };
  }, []);

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
    if (score >= 80) return 'Great news summary! You\'ve mastered this skill.';
    if (score >= 35) return 'Well done! Keep practicing to improve further.';
    return 'Good effort! Review the feedback and try again.';
  };

  const handleTryAgain = () => {
    console.log('🔄 [FEEDBACK] Try again clicked, navigating back to news summary');
    // Reset the parsing flag so we can parse new evaluation results
    hasParsedEvaluation.current = false;
    router.back();
  };

  const handleNextNews = () => {
    console.log('🔄 [FEEDBACK] Next news clicked, navigating back to reload topic');
    // Reset the parsing flag for the next evaluation
    hasParsedEvaluation.current = false;
    // Navigate back to the news summary screen and tell it to reload
    router.push({
      pathname: '/(tabs)/practice/stage4/news-summary',
      params: {
        returnFromFeedback: 'true',
      }
    });
  };

  // Check if the exercise is completed based on evaluation result
  const isCompleted = evaluationResult?.completed === true;

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

  const score = evaluationResult.evaluation?.overall_score || 0;
  const keywordMatches = evaluationResult.keyword_matches || 0;
  const totalKeywords = evaluationResult.total_keywords || 0;
  const fluencyScore = evaluationResult.fluency_score || 0;
  const grammarScore = evaluationResult.grammar_score || 0;

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
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
                <Ionicons name="newspaper" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Your Performance</Text>
              <Text style={styles.headerSubtitle}>News Summary Feedback</Text>
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
                    colors={[getScoreColor(score), getScoreColor(score) + '80']}
                    style={styles.scoreGradient}
                  >
                    <Text style={styles.scoreValue}>{score}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.scoreMessage}>
                  {getScoreMessage(score)}
                </Text>
                <Text style={styles.scoreDescription}>
                  {getScoreDescription(score)}
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
                    {isCompleted ? 'Exercise Completed! 🎉' : 'Keep Practicing 💪'}
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
                      {keywordMatches}/{totalKeywords}
                    </Text>
                    <Text style={styles.metricLabel}>Keywords Used</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="chatbubbles" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {fluencyScore}/20
                    </Text>
                    <Text style={styles.metricLabel}>Fluency</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="school" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {grammarScore}/20
                    </Text>
                    <Text style={styles.metricLabel}>Grammar</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="checkmark-circle" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult.evaluation?.main_points_coverage_score || 0}/30
                    </Text>
                    <Text style={styles.metricLabel}>Main Points</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="document-text" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult.evaluation?.grammar_structure_score || 0}/25
                    </Text>
                    <Text style={styles.metricLabel}>Structure</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="refresh" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult.evaluation?.paraphrasing_skills_score || 0}/25
                    </Text>
                    <Text style={styles.metricLabel}>Paraphrasing</Text>
                  </View>
                </View>
              </View>

              {/* News Title */}
              {evaluationResult.news_title && (
                <View style={styles.newsTitleSection}>
                  <Text style={styles.sectionTitle}>News Article</Text>
                  <View style={styles.newsTitleCard}>
                    <Ionicons name="newspaper" size={20} color="#58D68D" style={styles.newsTitleIcon} />
                    <Text style={styles.newsTitleText}>{evaluationResult.news_title}</Text>
                  </View>
                </View>
              )}

              {/* Your Response */}
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

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  News {currentNewsId} of {totalNewsItems}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${(currentNewsId / totalNewsItems) * 100}%` }]} />
                </View>
              </View>
            </LinearGradient>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Show Try Again button when not completed */}
            {!isCompleted && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleTryAgain}
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
            
            {/* Show Next News button when completed */}
            {isCompleted && currentNewsId < totalNewsItems && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextNews}
              >
                <LinearGradient
                  colors={["#58D68D", "#45B7A8"]}
                  style={styles.nextButtonGradient}
                >
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.nextButtonText}>Next News</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreGradient: {
    width: 120,
    height: 120,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  completionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 18,
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
  newsTitleSection: {
    marginBottom: 32,
  },
  newsTitleCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsTitleIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  newsTitleText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  userTextSection: {
    marginBottom: 32,
  },
  userTextCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userTextIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  userText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  improvementSection: {
    marginBottom: 32,
  },
  improvementCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  improvementIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  improvementText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
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
    fontSize: 12,
    fontWeight: '600',
  },
  unlockedSection: {
    marginBottom: 32,
  },
  unlockedCard: {
    backgroundColor: '#D4EDDA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unlockedIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  unlockedText: {
    flex: 1,
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(88, 214, 141, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#58D68D',
    borderRadius: 4,
  },
  actionButtons: {
    marginTop: 20,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
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
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default Feedback6Screen; 