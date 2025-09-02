import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUXCam } from '../hooks/useUXCam';
import { UXCamUserProperties } from '../services/UXCamService';

interface UXCamContextType {
  // UXCam hook functionality
  initialize: () => Promise<void>;
  isInitialized: boolean;
  startSession: (userProperties?: UXCamUserProperties) => Promise<void>;
  stopSession: () => Promise<void>;
  isRecording: boolean;
  setUserIdentity: (userId: string, userProperties?: UXCamUserProperties) => Promise<void>;
  setUserProperties: (properties: UXCamUserProperties) => Promise<void>;
  getUserProperties: () => UXCamUserProperties;
  trackEvent: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  addScreenToIgnore: (screenName: string) => void;
  removeScreenFromIgnore: (screenName: string) => void;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  optIn: () => Promise<void>;
  optOut: () => Promise<void>;
  getSessionUrl: () => Promise<string | null>;
  getCurrentSessionId: () => string | null;
  error: string | null;
  clearError: () => void;
  
  // Context-specific state
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  privacyMode: boolean;
  setPrivacyMode: (enabled: boolean) => void;
}

const UXCamContext = createContext<UXCamContextType | undefined>(undefined);

interface UXCamProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
  defaultEnabled?: boolean;
  defaultPrivacyMode?: boolean;
}

/**
 * UXCam Context Provider
 * Manages global UXCam state and provides UXCam functionality throughout the app
 */
export const UXCamProvider: React.FC<UXCamProviderProps> = ({
  children,
  autoInitialize = true,
  defaultEnabled = true,
  defaultPrivacyMode = false,
}) => {
  const uxCamHook = useUXCam();
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [privacyMode, setPrivacyMode] = useState(defaultPrivacyMode);

  // Auto-initialize UXCam when provider mounts
  useEffect(() => {
    if (autoInitialize && isEnabled) {
      uxCamHook.initialize().catch(console.error);
    }
  }, [autoInitialize, isEnabled, uxCamHook]);

  // Handle privacy mode changes
  useEffect(() => {
    if (uxCamHook.isInitialized) {
      if (privacyMode) {
        uxCamHook.optOut().catch(console.error);
      } else {
        uxCamHook.optIn().catch(console.error);
      }
    }
  }, [privacyMode, uxCamHook]);

  // Handle enabled state changes
  useEffect(() => {
    if (uxCamHook.isInitialized) {
      if (!isEnabled) {
        uxCamHook.stopSession().catch(console.error);
      }
    }
  }, [isEnabled, uxCamHook]);

  const contextValue: UXCamContextType = {
    // UXCam hook functionality
    ...uxCamHook,
    
    // Context-specific state
    isEnabled,
    setIsEnabled,
    privacyMode,
    setPrivacyMode,
  };

  return (
    <UXCamContext.Provider value={contextValue}>
      {children}
    </UXCamContext.Provider>
  );
};

/**
 * Hook to use UXCam context
 * Must be used within a UXCamProvider
 */
export const useUXCamContext = (): UXCamContextType => {
  const context = useContext(UXCamContext);
  if (context === undefined) {
    throw new Error('useUXCamContext must be used within a UXCamProvider');
  }
  return context;
};

/**
 * Hook to check if UXCam context is available
 */
export const useUXCamContextSafe = (): UXCamContextType | undefined => {
  return useContext(UXCamContext);
};
