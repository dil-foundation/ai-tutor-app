import { useUXCamContext } from '../context/UXCamContext';

// Event tracking utilities for common app events
export const useUXCamEvents = () => {
  const { trackEvent } = useUXCamContext();

  // Learning events
  const trackLessonStarted = async (lessonId: string, lessonType: string, properties?: Record<string, any>) => {
    await trackEvent('lesson_started', {
      lessonId,
      lessonType,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackLessonCompleted = async (lessonId: string, lessonType: string, score?: number, properties?: Record<string, any>) => {
    await trackEvent('lesson_completed', {
      lessonId,
      lessonType,
      score,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackExerciseStarted = async (exerciseId: string, exerciseType: string, properties?: Record<string, any>) => {
    await trackEvent('exercise_started', {
      exerciseId,
      exerciseType,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackExerciseCompleted = async (exerciseId: string, exerciseType: string, score?: number, properties?: Record<string, any>) => {
    await trackEvent('exercise_completed', {
      exerciseId,
      exerciseType,
      score,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackQuizStarted = async (quizId: string, quizType: string, properties?: Record<string, any>) => {
    await trackEvent('quiz_started', {
      quizId,
      quizType,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackQuizCompleted = async (quizId: string, quizType: string, score: number, totalQuestions: number, properties?: Record<string, any>) => {
    await trackEvent('quiz_completed', {
      quizId,
      quizType,
      score,
      totalQuestions,
      percentage: (score / totalQuestions) * 100,
      timestamp: Date.now(),
      ...properties,
    });
  };

  // Audio/Speech events
  const trackAudioRecordingStarted = async (recordingType: string, properties?: Record<string, any>) => {
    await trackEvent('audio_recording_started', {
      recordingType,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackAudioRecordingCompleted = async (recordingType: string, duration: number, properties?: Record<string, any>) => {
    await trackEvent('audio_recording_completed', {
      recordingType,
      duration,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackSpeechRecognitionStarted = async (language: string, properties?: Record<string, any>) => {
    await trackEvent('speech_recognition_started', {
      language,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackSpeechRecognitionCompleted = async (language: string, accuracy: number, properties?: Record<string, any>) => {
    await trackEvent('speech_recognition_completed', {
      language,
      accuracy,
      timestamp: Date.now(),
      ...properties,
    });
  };

  // Progress events
  const trackLevelUp = async (oldLevel: string, newLevel: string, properties?: Record<string, any>) => {
    await trackEvent('level_up', {
      oldLevel,
      newLevel,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackStreakUpdated = async (currentStreak: number, longestStreak: number, properties?: Record<string, any>) => {
    await trackEvent('streak_updated', {
      currentStreak,
      longestStreak,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackProgressMilestone = async (milestoneType: string, milestoneValue: any, properties?: Record<string, any>) => {
    await trackEvent('progress_milestone', {
      milestoneType,
      milestoneValue,
      timestamp: Date.now(),
      ...properties,
    });
  };

  // User interaction events
  const trackButtonClick = async (buttonName: string, screenName: string, properties?: Record<string, any>) => {
    await trackEvent('button_click', {
      buttonName,
      screenName,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackScreenView = async (screenName: string, properties?: Record<string, any>) => {
    await trackEvent('screen_view', {
      screenName,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackFeatureUsed = async (featureName: string, properties?: Record<string, any>) => {
    await trackEvent('feature_used', {
      featureName,
      timestamp: Date.now(),
      ...properties,
    });
  };

  // Error events
  const trackError = async (errorType: string, errorMessage: string, screenName?: string, properties?: Record<string, any>) => {
    await trackEvent('error_occurred', {
      errorType,
      errorMessage,
      screenName,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackApiError = async (endpoint: string, statusCode: number, errorMessage: string, properties?: Record<string, any>) => {
    await trackEvent('api_error', {
      endpoint,
      statusCode,
      errorMessage,
      timestamp: Date.now(),
      ...properties,
    });
  };

  // Performance events
  const trackPerformanceMetric = async (metricName: string, value: number, unit: string, properties?: Record<string, any>) => {
    await trackEvent('performance_metric', {
      metricName,
      value,
      unit,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackLoadTime = async (componentName: string, loadTime: number, properties?: Record<string, any>) => {
    await trackEvent('load_time', {
      componentName,
      loadTime,
      timestamp: Date.now(),
      ...properties,
    });
  };

  // Subscription/Payment events
  const trackSubscriptionStarted = async (planType: string, price: number, currency: string, properties?: Record<string, any>) => {
    await trackEvent('subscription_started', {
      planType,
      price,
      currency,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackSubscriptionCancelled = async (planType: string, reason?: string, properties?: Record<string, any>) => {
    await trackEvent('subscription_cancelled', {
      planType,
      reason,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackPaymentInitiated = async (amount: number, currency: string, paymentMethod: string, properties?: Record<string, any>) => {
    await trackEvent('payment_initiated', {
      amount,
      currency,
      paymentMethod,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackPaymentCompleted = async (amount: number, currency: string, paymentMethod: string, transactionId: string, properties?: Record<string, any>) => {
    await trackEvent('payment_completed', {
      amount,
      currency,
      paymentMethod,
      transactionId,
      timestamp: Date.now(),
      ...properties,
    });
  };

  // Settings/Preferences events
  const trackSettingChanged = async (settingName: string, oldValue: any, newValue: any, properties?: Record<string, any>) => {
    await trackEvent('setting_changed', {
      settingName,
      oldValue,
      newValue,
      timestamp: Date.now(),
      ...properties,
    });
  };

  const trackLanguageChanged = async (oldLanguage: string, newLanguage: string, properties?: Record<string, any>) => {
    await trackEvent('language_changed', {
      oldLanguage,
      newLanguage,
      timestamp: Date.now(),
      ...properties,
    });
  };

  return {
    // Learning events
    trackLessonStarted,
    trackLessonCompleted,
    trackExerciseStarted,
    trackExerciseCompleted,
    trackQuizStarted,
    trackQuizCompleted,
    
    // Audio/Speech events
    trackAudioRecordingStarted,
    trackAudioRecordingCompleted,
    trackSpeechRecognitionStarted,
    trackSpeechRecognitionCompleted,
    
    // Progress events
    trackLevelUp,
    trackStreakUpdated,
    trackProgressMilestone,
    
    // User interaction events
    trackButtonClick,
    trackScreenView,
    trackFeatureUsed,
    
    // Error events
    trackError,
    trackApiError,
    
    // Performance events
    trackPerformanceMetric,
    trackLoadTime,
    
    // Subscription/Payment events
    trackSubscriptionStarted,
    trackSubscriptionCancelled,
    trackPaymentInitiated,
    trackPaymentCompleted,
    
    // Settings/Preferences events
    trackSettingChanged,
    trackLanguageChanged,
  };
};
