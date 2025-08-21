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
  topic?: string;
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
  score?: number;
}

const Feedback7Screen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState(1);
  const [totalTopics, setTotalTopics] = useState(5);
  
  // Use ref to track if we've already parsed the evaluation result
  const hasParsedEvaluation = useRef(false);

  useEffect(() => {
    // Only parse evaluation result if we haven't parsed it yet
    if (params.evaluationResult && !hasParsedEvaluation.current) {
      try {
        console.log('🔄 [FEEDBACK] Raw evaluationResult parameter:', params.evaluationResult);
        console.log('🔄 [FEEDBACK] Parameter length:', params.evaluationResult.length);
        console.log('🔄 [FEEDBACK] Parameter type:', typeof params.evaluationResult);
        
        // Check if the parameter might be truncated
        if (typeof params.evaluationResult === 'string' && params.evaluationResult.length > 1000) {
          console.log('🔄 [FEEDBACK] Parameter is long, checking for truncation...');
          console.log('🔄 [FEEDBACK] First 200 chars:', params.evaluationResult.substring(0, 200));
          console.log('🔄 [FEEDBACK] Last 200 chars:', params.evaluationResult.substring(params.evaluationResult.length - 200));
        }
        
        const result = JSON.parse(params.evaluationResult as string);
        setEvaluationResult(result);
        hasParsedEvaluation.current = true;
        console.log('✅ [FEEDBACK] Evaluation result loaded successfully');
        console.log('📊 [FEEDBACK] Full evaluation result:', result);
        console.log('📊 [FEEDBACK] Evaluation object:', result.evaluation);
        console.log('📊 [FEEDBACK] Score from evaluation:', result.evaluation?.overall_score);
        console.log('📊 [FEEDBACK] Alternative score fields:', {
          'evaluation.overall_score': result.evaluation?.overall_score,
          'evaluation.score': result.evaluation?.score,
          'root.score': result.score,
          'evaluation.fluency_grammar_score': result.evaluation?.fluency_grammar_score
        });
        
        // Deep dive into the evaluation structure
        if (result.evaluation) {
          console.log('🔍 [FEEDBACK] Deep evaluation structure analysis:', {
            'evaluation_type': typeof result.evaluation,
            'evaluation_keys': Object.keys(result.evaluation),
            'overall_score_exists': 'overall_score' in result.evaluation,
            'overall_score_value': result.evaluation.overall_score,
            'overall_score_type': typeof result.evaluation.overall_score
          });
        }
      } catch (error) {
        console.error('❌ [FEEDBACK] Error parsing evaluation result:', error);
        console.error('❌ [FEEDBACK] Raw parameter that failed:', params.evaluationResult);
      }
    }

    // Only update currentTopicId if it's different
    if (params.currentTopicId) {
      const newTopicId = parseInt(params.currentTopicId as string);
      if (newTopicId !== currentTopicId) {
        setCurrentTopicId(newTopicId);
      }
    }

    // Only update totalTopics if it's different
    if (params.totalTopics) {
      const newTotalTopics = parseInt(params.totalTopics as string);
      if (newTotalTopics !== totalTopics) {
        setTotalTopics(newTotalTopics);
      }
    }
  }, [params.evaluationResult, params.currentTopicId, params.totalTopics, currentTopicId, totalTopics]);

  // Cleanup effect to reset parsing flag when component unmounts
  useEffect(() => {
    return () => {
      hasParsedEvaluation.current = false;
    };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#58D68D';
    if (score >= 60) return '#F39C12';
    return '#E74C3C';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! 🎉';
    if (score >= 60) return 'Good Job! 👍';
    return 'Keep Practicing 💪';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Outstanding critical thinking! You\'ve mastered this philosophical debate.';
    if (score >= 60) return 'Well done! Keep practicing to improve further.';
    return 'Good effort! Review the feedback and try again.';
  };

  const handleTryAgain = () => {
    console.log('🔄 [FEEDBACK] Try again clicked, navigating back to critical thinking');
    // Reset the parsing flag so we can parse new evaluation results
    hasParsedEvaluation.current = false;
    router.back();
  };

  const handleNextTopic = () => {
    console.log('🔄 [FEEDBACK] Next topic clicked, navigating to next topic');
    // Reset the parsing flag for the next evaluation
    hasParsedEvaluation.current = false;
    router.push({
      pathname: '/(tabs)/practice/stage5/critical-thinking-dialogues',
      params: {
        nextTopic: 'true',
        currentTopicId: (currentTopicId + 1).toString(),
      }
    });
  };

  // Helper function to safely parse score
  const parseScore = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
  };

  // Enhanced score extraction function with comprehensive fallbacks
  const extractScore = (data: any): number => {
    console.log('🔍 [FEEDBACK] Extracting score from data structure:', {
      'data_type': typeof data,
      'has_evaluation': !!data?.evaluation,
      'evaluation_type': typeof data?.evaluation,
      'evaluation_keys': data?.evaluation ? Object.keys(data.evaluation) : []
    });

    // Try multiple possible score locations
    const possibleScores = [
      data?.evaluation?.overall_score,
      data?.evaluation?.score,
      data?.score,
      data?.evaluation?.fluency_grammar_score,
      data?.fluency_score,
      data?.grammar_score
    ];

    console.log('🔍 [FEEDBACK] Possible scores found:', possibleScores);

    for (const score of possibleScores) {
      if (score !== null && score !== undefined && score !== '') {
        const parsed = parseScore(score);
        if (parsed > 0) {
          console.log('✅ [FEEDBACK] Valid score found:', { 'raw': score, 'parsed': parsed });
          return parsed;
        }
      }
    }

    // If no score found, try to calculate from individual scores
    if (data?.evaluation) {
      const evalData = data.evaluation;
      const individualScores = [
        evalData.argument_structure_score,
        evalData.critical_thinking_score,
        evalData.vocabulary_range_score,
        evalData.fluency_grammar_score,
        evalData.discourse_markers_score
      ].filter(score => score !== null && score !== undefined);
      
      if (individualScores.length > 0) {
        const calculatedScore = Math.round(individualScores.reduce((sum, score) => sum + score, 0));
        console.log('🔄 [FEEDBACK] Calculated score from individual scores:', calculatedScore);
        return Math.min(100, calculatedScore);
      }
    }

    // Last resort: check if we have any numeric values in the data
    const allNumericValues: Array<{path: string, value: number}> = [];
    const extractNumericValues = (obj: any, path: string = '') => {
      if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'number' && value > 0 && value <= 100) {
            allNumericValues.push({ path: currentPath, value });
          } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            const parsed = parseFloat(value);
            if (parsed > 0 && parsed <= 100) {
              allNumericValues.push({ path: currentPath, value: parsed });
            }
          }
        });
      }
    };
    
    extractNumericValues(data);
    
    if (allNumericValues.length > 0) {
      // Use the highest numeric value found
      const highestScore = Math.max(...allNumericValues.map(item => item.value));
      console.log('🔄 [FEEDBACK] Found numeric values in data:', allNumericValues);
      console.log('🔄 [FEEDBACK] Using highest numeric value as score:', highestScore);
      return highestScore;
    }

    console.log('⚠️ [FEEDBACK] No valid score found, using default 0');
    return 0;
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

  // Enhanced score extraction with multiple fallbacks
  const score = extractScore(evaluationResult);
  
  console.log('📊 [FEEDBACK] Final score extracted:', score);
  
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
                <Ionicons name="bulb" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Your Performance</Text>
              <Text style={styles.headerSubtitle}>Critical Thinking Feedback</Text>
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
                
                {/* Score Warning */}
                {score === 0 && (
                  <View style={styles.scoreWarning}>
                    <Ionicons name="warning" size={16} color="#F39C12" style={{ marginRight: 4 }} />
                    <Text style={styles.scoreWarningText}>
                      Score may not be displaying correctly. Please check console for details.
                    </Text>
                  </View>
                )}
                
                <Text style={styles.scoreMessage}>
                  {getScoreMessage(score)}
                </Text>
                <Text style={styles.scoreDescription}>
                  {getScoreDescription(score)}
                </Text>
                
                {/* Completion Status */}
                <View style={[styles.completionStatus, { backgroundColor: evaluationResult?.evaluation?.completed === true ? '#D4EDDA' : '#FFF3CD' }]}>
                  <Ionicons 
                    name={evaluationResult?.evaluation?.completed === true ? 'checkmark-circle' : 'alert-circle'} 
                    size={20} 
                    color={evaluationResult?.evaluation?.completed === true ? '#155724' : '#856404'} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={[styles.completionStatusText, { color: evaluationResult?.evaluation?.completed === true ? '#155724' : '#856404' }]}>
                    {evaluationResult?.evaluation?.completed === true ? 'Exercise Completed! 🎉' : 'Keep Practicing 💪'}
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
                      {evaluationResult?.evaluation?.argument_structure_score || 0}/25
                    </Text>
                    <Text style={styles.metricLabel}>Argument Structure</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="bulb" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult?.evaluation?.critical_thinking_score || 0}/25
                    </Text>
                    <Text style={styles.metricLabel}>Critical Thinking</Text>
                  </View>
                  
                  <View style={styles.metricCard}>
                    <Ionicons name="book" size={24} color="#58D68D" />
                    <Text style={styles.metricValue}>
                      {evaluationResult?.evaluation?.vocabulary_range_score || 0}/20
                    </Text>
                    <Text style={styles.metricLabel}>Vocabulary Range</Text>
                  </View>
                </View>
              </View>

              {/* Topic */}
              {evaluationResult?.topic && (
                <View style={styles.topicSection}>
                  <Text style={styles.sectionTitle}>Debate Topic</Text>
                  <View style={styles.topicCard}>
                    <Ionicons name="bulb" size={20} color="#58D68D" style={styles.topicIcon} />
                    <Text style={styles.topicText}>{evaluationResult.topic}</Text>
                  </View>
                </View>
              )}

              {/* Your Response */}
              {evaluationResult?.user_text && (
                <View style={styles.userTextSection}>
                  <Text style={styles.sectionTitle}>What You Said</Text>
                  <View style={styles.userTextCard}>
                    <Ionicons name="mic" size={20} color="#58D68D" style={styles.userTextIcon} />
                    <Text style={styles.userText}>{evaluationResult.user_text}</Text>
                  </View>
                </View>
              )}

              {/* Improvement Suggestions */}
              {evaluationResult?.suggested_improvement && (
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
              {evaluationResult?.expected_keywords && evaluationResult.expected_keywords.length > 0 && (
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
              {evaluationResult?.unlocked_content && evaluationResult.unlocked_content.length > 0 && (
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
                  Topic {currentTopicId} of {totalTopics}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${(currentTopicId / totalTopics) * 100}%` }]} />
                </View>
              </View>
            </LinearGradient>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Show Try Again button when not completed */}
            {!evaluationResult?.evaluation?.completed && (
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
            
            {/* Show Next Topic button when completed */}
            {evaluationResult?.evaluation?.completed && currentTopicId < totalTopics && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextTopic}
              >
                <LinearGradient
                  colors={["#58D68D", "#45B7A8"]}
                  style={styles.nextButtonGradient}
                >
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.nextButtonText}>Next Topic</Text>
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
  topicSection: {
    marginBottom: 32,
  },
  topicCard: {
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
  topicIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  topicText: {
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
  scoreWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  scoreWarningText: {
    fontSize: 13,
    color: '#856404',
    fontWeight: '600',
  },
});

export default Feedback7Screen; 