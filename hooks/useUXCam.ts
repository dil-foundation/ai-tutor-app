import { useEffect, useCallback, useState } from 'react';
import UXCamService, { UXCamUserProperties } from '../services/UXCamService';

interface UseUXCamReturn {
  // Initialization
  initialize: () => Promise<void>;
  isInitialized: boolean;
  
  // Session management
  startSession: (userProperties?: UXCamUserProperties) => Promise<void>;
  stopSession: () => Promise<void>;
  isRecording: boolean;
  
  // User management
  setUserIdentity: (userId: string, userProperties?: UXCamUserProperties) => Promise<void>;
  setUserProperties: (properties: UXCamUserProperties) => Promise<void>;
  getUserProperties: () => UXCamUserProperties;
  
  // Event tracking
  trackEvent: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  
  // Screen management
  addScreenToIgnore: (screenName: string) => void;
  removeScreenFromIgnore: (screenName: string) => void;
  
  // Recording control
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  
  // Privacy control
  optIn: () => Promise<void>;
  optOut: () => Promise<void>;
  
  // Session info
  getSessionUrl: () => Promise<string | null>;
  getCurrentSessionId: () => string | null;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

/**
 * React hook for UXCam integration
 * Provides easy access to UXCam functionality throughout the app
 */
export const useUXCam = (): UseUXCamReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const uxCamService = UXCamService.getInstance();

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize UXCam
  const initialize = useCallback(async () => {
    try {
      clearError();
      await uxCamService.initialize();
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize UXCam';
      setError(errorMessage);
      console.error('UXCam initialization error:', err);
    }
  }, [uxCamService, clearError]);

  // Start session
  const startSession = useCallback(async (userProperties?: UXCamUserProperties) => {
    try {
      clearError();
      await uxCamService.startSession(userProperties);
      setIsRecording(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start UXCam session';
      setError(errorMessage);
      console.error('UXCam session start error:', err);
    }
  }, [uxCamService, clearError]);

  // Stop session
  const stopSession = useCallback(async () => {
    try {
      clearError();
      await uxCamService.stopSession();
      setIsRecording(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop UXCam session';
      setError(errorMessage);
      console.error('UXCam session stop error:', err);
    }
  }, [uxCamService, clearError]);

  // Set user identity
  const setUserIdentity = useCallback(async (userId: string, userProperties?: UXCamUserProperties) => {
    try {
      clearError();
      await uxCamService.setUserIdentity(userId, userProperties);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set UXCam user identity';
      setError(errorMessage);
      console.error('UXCam set user identity error:', err);
    }
  }, [uxCamService, clearError]);

  // Set user properties
  const setUserProperties = useCallback(async (properties: UXCamUserProperties) => {
    try {
      clearError();
      await uxCamService.setUserProperties(properties);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set UXCam user properties';
      setError(errorMessage);
      console.error('UXCam set user properties error:', err);
    }
  }, [uxCamService, clearError]);

  // Get user properties
  const getUserProperties = useCallback(() => {
    return uxCamService.getUserProperties();
  }, [uxCamService]);

  // Track event
  const trackEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    try {
      clearError();
      await uxCamService.trackEvent(eventName, properties);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track UXCam event';
      setError(errorMessage);
      console.error('UXCam track event error:', err);
    }
  }, [uxCamService, clearError]);

  // Add screen to ignore
  const addScreenToIgnore = useCallback((screenName: string) => {
    try {
      clearError();
      uxCamService.addScreenToIgnore(screenName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add screen to ignore list';
      setError(errorMessage);
      console.error('UXCam add screen to ignore error:', err);
    }
  }, [uxCamService, clearError]);

  // Remove screen from ignore
  const removeScreenFromIgnore = useCallback((screenName: string) => {
    try {
      clearError();
      uxCamService.removeScreenFromIgnore(screenName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove screen from ignore list';
      setError(errorMessage);
      console.error('UXCam remove screen from ignore error:', err);
    }
  }, [uxCamService, clearError]);

  // Pause recording
  const pauseRecording = useCallback(async () => {
    try {
      clearError();
      await uxCamService.pauseRecording();
      setIsRecording(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause UXCam recording';
      setError(errorMessage);
      console.error('UXCam pause recording error:', err);
    }
  }, [uxCamService, clearError]);

  // Resume recording
  const resumeRecording = useCallback(async () => {
    try {
      clearError();
      await uxCamService.resumeRecording();
      setIsRecording(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume UXCam recording';
      setError(errorMessage);
      console.error('UXCam resume recording error:', err);
    }
  }, [uxCamService, clearError]);

  // Opt in
  const optIn = useCallback(async () => {
    try {
      clearError();
      await uxCamService.optIn();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to opt into UXCam';
      setError(errorMessage);
      console.error('UXCam opt in error:', err);
    }
  }, [uxCamService, clearError]);

  // Opt out
  const optOut = useCallback(async () => {
    try {
      clearError();
      await uxCamService.optOut();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to opt out of UXCam';
      setError(errorMessage);
      console.error('UXCam opt out error:', err);
    }
  }, [uxCamService, clearError]);

  // Get session URL
  const getSessionUrl = useCallback(async () => {
    try {
      clearError();
      return await uxCamService.getSessionUrl();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get UXCam session URL';
      setError(errorMessage);
      console.error('UXCam get session URL error:', err);
      return null;
    }
  }, [uxCamService, clearError]);

  // Get current session ID
  const getCurrentSessionId = useCallback(() => {
    return uxCamService.getCurrentSessionId();
  }, [uxCamService]);

  // Check initialization status on mount
  useEffect(() => {
    setIsInitialized(uxCamService.isUXCamInitialized());
  }, [uxCamService]);

  return {
    // Initialization
    initialize,
    isInitialized,
    
    // Session management
    startSession,
    stopSession,
    isRecording,
    
    // User management
    setUserIdentity,
    setUserProperties,
    getUserProperties,
    
    // Event tracking
    trackEvent,
    
    // Screen management
    addScreenToIgnore,
    removeScreenFromIgnore,
    
    // Recording control
    pauseRecording,
    resumeRecording,
    
    // Privacy control
    optIn,
    optOut,
    
    // Session info
    getSessionUrl,
    getCurrentSessionId,
    
    // Error handling
    error,
    clearError,
  };
};
