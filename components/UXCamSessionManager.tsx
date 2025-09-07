import React, { useEffect } from 'react';
import { useUXCamContext } from '../context/UXCamContext';
import { useAuth } from '../context/AuthContext';
import { useSegments } from 'expo-router';

/**
 * UXCam Session Manager Component
 * Automatically manages UXCam sessions based on authentication state and navigation
 */
const UXCamSessionManager: React.FC = () => {
  const {
    isInitialized,
    startSession,
    stopSession,
    setUserIdentity,
    setUserProperties,
    addScreenToIgnore,
    trackEvent,
    isEnabled,
  } = useUXCamContext();
  
  const { user, loading, initialized } = useAuth();
  const segments = useSegments();

  // Handle authentication state changes
  useEffect(() => {
    if (!isInitialized || !isEnabled || !initialized || loading) {
      return;
    }

    const handleAuthStateChange = async () => {
      try {
        if (user) {
          // User is authenticated - start session and set identity
          const userProperties = {
            userId: user.id,
            userRole: (user.role as 'student' | 'teacher' | 'admin') || 'student',
            userLevel: (user as any).level || 'beginner',
            userLanguage: (user as any).preferred_language || 'en',
            subscriptionType: (user as any).subscription_type || 'free',
            email: user.email,
            displayName: (user as any).display_name,
          };

          await setUserIdentity(user.id, userProperties);
          await startSession(userProperties);
          
          // Track login event
          await trackEvent('user_login', {
            userId: user.id,
            userRole: user.role,
            loginMethod: 'app',
          });
          
          console.log('UXCam session started for authenticated user:', user.id);
        } else {
          // User is not authenticated - stop session
          await stopSession();
          console.log('UXCam session stopped - user not authenticated');
        }
      } catch (error) {
        console.error('UXCam session management error:', error);
      }
    };

    handleAuthStateChange();
  }, [user, isInitialized, isEnabled, initialized, loading, startSession, stopSession, setUserIdentity, setUserProperties, trackEvent]);

  // Handle navigation changes
  useEffect(() => {
    if (!isInitialized || !isEnabled || !user || !initialized) {
      return;
    }

    const handleNavigationChange = async () => {
      try {
        const currentScreen = segments.join('/');
        
        // Track screen navigation
        await trackEvent('screen_navigation', {
          screen: currentScreen,
          userId: user.id,
          userRole: user.role,
        });
        
        // Add sensitive screens to ignore list
        const sensitiveScreens = [
          'auth/login',
          'auth/signup',
          'auth/password-reset',
          'profile',
          'settings',
          'payment',
          'billing',
        ];
        
        sensitiveScreens.forEach(screen => {
          if (currentScreen.includes(screen)) {
            addScreenToIgnore(screen);
          }
        });
        
      } catch (error) {
        console.error('UXCam navigation tracking error:', error);
      }
    };

    handleNavigationChange();
  }, [segments, isInitialized, isEnabled, user, initialized, trackEvent, addScreenToIgnore]);

  // Handle app lifecycle events
  useEffect(() => {
    if (!isInitialized || !isEnabled || !initialized) {
      return;
    }

    const handleAppStateChange = async () => {
      try {
        // Track app state changes
        await trackEvent('app_state_change', {
          userId: user?.id,
          userRole: user?.role,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('UXCam app state tracking error:', error);
      }
    };

    // You can add app state listeners here if needed
    // For now, we'll just track when the component mounts
    handleAppStateChange();
  }, [isInitialized, isEnabled, user, initialized, trackEvent]);

  // This component doesn't render anything
  return null;
};

export default UXCamSessionManager;
