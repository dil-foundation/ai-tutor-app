import { useEffect, useCallback, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import UXCamService from '../utils/uxcamService';

interface UseUXCamReturn {
  // Core functionality
  initialize: (apiKey: string) => Promise<boolean>;
  setUser: (user: any) => void;
  tagScreen: (screenName: string) => void;
  addEvent: (eventName: string, properties?: Record<string, any>) => void;
  setUserProperty: (key: string, value: any) => void;
  
  // Session management
  startNewSession: () => void;
  stopRecording: () => void;
  resumeRecording: () => void;
  
  // Privacy controls
  optIn: () => void;
  optOut: () => void;
  isOptedOut: () => Promise<boolean>;
  
  // Status
  isInitialized: boolean;
  isEnabled: boolean;
  getSessionUrl: () => Promise<string | null>;
  getCurrentUser: () => any;
}

/**
 * React hook for UXCam integration
 * Provides easy access to UXCam functionality throughout the app
 */
export const useUXCam = (): UseUXCamReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Get UXCam service instance
  const uxcamService = UXCamService.getInstance();

  // Initialize UXCam
  const initialize = useCallback(async (apiKey: string): Promise<boolean> => {
    try {
      const success = await uxcamService.initialize(apiKey);
      setIsInitialized(success);
      setIsEnabled(success);
      return success;
    } catch (error) {
      console.error('Failed to initialize UXCam in hook:', error);
      return false;
    }
  }, [uxcamService]);

  // Set user
  const setUser = useCallback((user: any) => {
    uxcamService.setUser(user);
  }, [uxcamService]);

  // Tag screen
  const tagScreen = useCallback((screenName: string) => {
    uxcamService.tagScreenName(screenName);
  }, [uxcamService]);

  // Add event
  const addEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    uxcamService.addEvent(eventName, properties);
  }, [uxcamService]);

  // Set user property
  const setUserProperty = useCallback((key: string, value: any) => {
    uxcamService.setUserProperty(key, value);
  }, [uxcamService]);

  // Start new session
  const startNewSession = useCallback(() => {
    uxcamService.startNewSession();
  }, [uxcamService]);

  // Stop recording
  const stopRecording = useCallback(() => {
    uxcamService.stopRecording();
    setIsEnabled(false);
  }, [uxcamService]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    uxcamService.resumeRecording();
    setIsEnabled(true);
  }, [uxcamService]);

  // Opt in
  const optIn = useCallback(() => {
    uxcamService.optIn();
    setIsEnabled(true);
  }, [uxcamService]);

  // Opt out
  const optOut = useCallback(() => {
    uxcamService.optOut();
    setIsEnabled(false);
  }, [uxcamService]);

  // Check if opted out
  const isOptedOut = useCallback(async (): Promise<boolean> => {
    return await uxcamService.isOptedOut();
  }, [uxcamService]);

  // Get session URL
  const getSessionUrl = useCallback(async (): Promise<string | null> => {
    return await uxcamService.getSessionUrl();
  }, [uxcamService]);

  // Get current user
  const getCurrentUser = useCallback(() => {
    return uxcamService.getCurrentUser();
  }, [uxcamService]);

  // Auto-tag screens based on navigation
  useEffect(() => {
    if (isInitialized && segments.length > 0) {
      const currentScreen = segments.join('/');
      tagScreen(currentScreen);
    }
  }, [segments, isInitialized, tagScreen]);

  // Update status from service
  useEffect(() => {
    const updateStatus = () => {
      setIsInitialized(uxcamService.isServiceInitialized());
      setIsEnabled(uxcamService.isRecordingEnabled());
    };

    // Update status immediately
    updateStatus();

    // Set up interval to keep status in sync
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [uxcamService]);

  return {
    // Core functionality
    initialize,
    setUser,
    tagScreen,
    addEvent,
    setUserProperty,
    
    // Session management
    startNewSession,
    stopRecording,
    resumeRecording,
    
    // Privacy controls
    optIn,
    optOut,
    isOptedOut,
    
    // Status
    isInitialized,
    isEnabled,
    getSessionUrl,
    getCurrentUser,
  };
};

export default useUXCam;
