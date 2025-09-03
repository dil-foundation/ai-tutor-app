import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { uxcamService } from '../config/uxcam';

// UXCam Event Types
export interface UXCamEvent {
  name: string;
  properties?: Record<string, any>;
}

// UXCam User Properties
export interface UXCamUserProperties {
  userId: string;
  userRole?: 'student' | 'teacher' | 'admin';
  userLevel?: string;
  preferredLanguage?: string;
  [key: string]: any;
}

/**
 * Custom hook for UXCam integration
 */
export const useUXCam = () => {
  const { user } = useAuth();

  // Initialize UXCam on app start
  useEffect(() => {
    const initializeUXCam = async () => {
      try {
        await uxcamService.initialize();
        
        // Set up sensitive screens to ignore
        uxcamService.addScreenNameToIgnore('Login');
        uxcamService.addScreenNameToIgnore('SignUp');
        uxcamService.addScreenNameToIgnore('PasswordReset');
        
        console.log('UXCam initialized in useUXCam hook');
      } catch (error) {
        console.error('Failed to initialize UXCam in hook:', error);
        // Continue without UXCam - don't break the app
      }
    };

    // Add a small delay to ensure the app is fully loaded
    const timer = setTimeout(() => {
      initializeUXCam();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Set user identity when user changes
  useEffect(() => {
    if (user) {
      const userProperties: UXCamUserProperties = {
        userId: user.id,
        userRole: user.user_metadata?.role as 'student' | 'teacher' | 'admin' | undefined,
        userLevel: user.user_metadata?.level || 'beginner',
        preferredLanguage: user.user_metadata?.preferred_language || 'english',
        email: user.email,
        displayName: user.user_metadata?.display_name || user.email,
      };

      uxcamService.setUserIdentity(user.id, userProperties);
    }
  }, [user]);

  // Track custom events
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    uxcamService.trackEvent(eventName, properties);
  }, []);

  // Track screen views
  const trackScreenView = useCallback((screenName: string, properties?: Record<string, any>) => {
    uxcamService.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }, []);

  // Track user interactions
  const trackUserInteraction = useCallback((interactionType: string, properties?: Record<string, any>) => {
    uxcamService.trackEvent('user_interaction', {
      interaction_type: interactionType,
      ...properties,
    });
  }, []);

  // Track learning progress
  const trackLearningProgress = useCallback((stage: string, progress: number, properties?: Record<string, any>) => {
    uxcamService.trackEvent('learning_progress', {
      stage,
      progress_percentage: progress,
      ...properties,
    });
  }, []);

  // Track audio interactions
  const trackAudioInteraction = useCallback((action: string, properties?: Record<string, any>) => {
    uxcamService.trackEvent('audio_interaction', {
      action,
      ...properties,
    });
  }, []);

  // Track error events
  const trackError = useCallback((errorType: string, errorMessage: string, properties?: Record<string, any>) => {
    uxcamService.trackEvent('app_error', {
      error_type: errorType,
      error_message: errorMessage,
      ...properties,
    });
  }, []);

  // Mark/unmark sensitive content
  const markSensitive = useCallback(() => {
    uxcamService.markScreenAsSensitive();
  }, []);

  const unmarkSensitive = useCallback(() => {
    uxcamService.unmarkScreenAsSensitive();
  }, []);

  // Get session URL
  const getSessionURL = useCallback(async () => {
    return await uxcamService.getCurrentSessionURL();
  }, []);

  // Check recording status
  const isRecording = useCallback(async () => {
    return await uxcamService.isRecording();
  }, []);

  // Opt in/out of analytics
  const optIntoAnalytics = useCallback(() => {
    uxcamService.optIntoSchematicRecordings();
  }, []);

  const optOutOfAnalytics = useCallback(() => {
    uxcamService.optOutOfSchematicRecordings();
  }, []);

  const checkOptInStatus = useCallback(async () => {
    return await uxcamService.isOptedIntoSchematicRecordings();
  }, []);

  return {
    // Event tracking
    trackEvent,
    trackScreenView,
    trackUserInteraction,
    trackLearningProgress,
    trackAudioInteraction,
    trackError,
    
    // Privacy controls
    markSensitive,
    unmarkSensitive,
    optIntoAnalytics,
    optOutOfAnalytics,
    checkOptInStatus,
    
    // Session management
    getSessionURL,
    isRecording,
  };
};
