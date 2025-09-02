import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import useUXCam from '../hooks/useUXCam';

interface UXCamContextType {
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
  
  // Loading state
  isLoading: boolean;
}

const UXCamContext = createContext<UXCamContextType | undefined>(undefined);

interface UXCamProviderProps {
  children: ReactNode;
  apiKey?: string;
}

export const UXCamProvider: React.FC<UXCamProviderProps> = ({ 
  children, 
  apiKey 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const uxcam = useUXCam();

  // Initialize UXCam when API key is available
  useEffect(() => {
    const initializeUXCam = async () => {
      if (apiKey && !uxcam.isInitialized) {
        setIsLoading(true);
        try {
          const success = await uxcam.initialize(apiKey);
          if (success) {
            console.log('UXCam initialized successfully in context');
          } else {
            console.error('Failed to initialize UXCam in context');
          }
        } catch (error) {
          console.error('Error initializing UXCam in context:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeUXCam();
  }, [apiKey, uxcam]);

  // Set user when user changes
  useEffect(() => {
    if (uxcam.isInitialized && user) {
      uxcam.setUser(user);
    }
  }, [uxcam.isInitialized, user, uxcam]);

  const contextValue: UXCamContextType = {
    // Core functionality
    initialize: uxcam.initialize,
    setUser: uxcam.setUser,
    tagScreen: uxcam.tagScreen,
    addEvent: uxcam.addEvent,
    setUserProperty: uxcam.setUserProperty,
    
    // Session management
    startNewSession: uxcam.startNewSession,
    stopRecording: uxcam.stopRecording,
    resumeRecording: uxcam.resumeRecording,
    
    // Privacy controls
    optIn: uxcam.optIn,
    optOut: uxcam.optOut,
    isOptedOut: uxcam.isOptedOut,
    
    // Status
    isInitialized: uxcam.isInitialized,
    isEnabled: uxcam.isEnabled,
    getSessionUrl: uxcam.getSessionUrl,
    getCurrentUser: uxcam.getCurrentUser,
    
    // Loading state
    isLoading,
  };

  return (
    <UXCamContext.Provider value={contextValue}>
      {children}
    </UXCamContext.Provider>
  );
};

/**
 * Hook to use UXCam context
 * @returns UXCam context value
 */
export const useUXCamContext = (): UXCamContextType => {
  const context = useContext(UXCamContext);
  if (context === undefined) {
    throw new Error('useUXCamContext must be used within a UXCamProvider');
  }
  return context;
};

export default UXCamContext;
