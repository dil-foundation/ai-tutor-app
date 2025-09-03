// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageModeProvider } from './context/LanguageModeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UXCamProvider } from '../context/UXCamContext';
import LoadingScreen from '../components/LoadingScreen';
import RoleBasedAccess from '../components/RoleBasedAccess';
import UXCamSessionManager from '../components/UXCamSessionManager';

// UXCam Integration - Real Implementation for Development Builds
let RNUxcam: any = null;

// Function to load UXCam SDK
const loadUXCamSDK = () => {
  try {
    // Try to load the real UXCam SDK
    const UXCamModule = require('react-native-ux-cam');
    RNUxcam = UXCamModule.default || UXCamModule;
    
    if (RNUxcam && typeof RNUxcam.startWithConfiguration === 'function') {
      console.log('🎥 [UXCam] Real UXCam SDK loaded successfully');
      return true;
    } else {
      throw new Error('UXCam SDK methods not found');
    }
  } catch (error) {
    // Fallback to mock implementation
    console.log('🎥 [UXCam] Using mock implementation (native module not available)');
    RNUxcam = {
      startWithConfiguration: (configuration: any) => {
        console.log('🎥 [UXCam Mock] Started with configuration:', configuration);
        console.log('🎥 [UXCam Mock] API Key:', configuration.userAppKey);
        console.log('🎥 [UXCam Mock] Note: Use development build for real tracking');
      },
    };
    return false;
  }
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading, isStudent } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

  // Initialize UXCam
  useEffect(() => {
    const initializeUXCam = () => {
      try {
        // Load UXCam SDK (mock in managed workflow)
        loadUXCamSDK();

        // Create configuration object
        const configuration = {
          userAppKey: 'xnayvk2m8m2h8xw-us',
          enableAutomaticScreenNameTagging: false,
          enableAdvancedGestureRecognition: true,
          enableImprovedScreenCapture: true,
        };
        
        // Initialize UXCam with configuration
        RNUxcam.startWithConfiguration(configuration);
        console.log('🎥 [UXCam] Mock initialization completed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('🎥 [UXCam] Failed to initialize:', errorMessage);
      }
    };

    initializeUXCam();
  }, []);

  useEffect(() => {
    // Only proceed with navigation after auth state is determined
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user) {
      // If not authenticated, always go to login first
      if (!inAuthGroup) {
        router.replace('/auth/login');
        setHasNavigated(true);
      }
    } else if (user && inAuthGroup) {
      // If authenticated and in auth group, check where to go
      const checkDestination = async () => {
        try {
          const hasVisitedLearn = await AsyncStorage.getItem('hasVisitedLearn');
          if (hasVisitedLearn === 'true') {
            router.replace('/(tabs)/learn');
          } else {
            router.replace('/(tabs)/learn/greeting');
          }
        } catch (error) {
          console.log('Error checking greeting status:', error);
          router.replace('/(tabs)/learn/greeting');
        }
        setHasNavigated(true);
      };
      
      checkDestination();
    }
  }, [user, loading, segments, hasNavigated]);

  // Reset navigation flag when auth state changes
  useEffect(() => {
    setHasNavigated(false);
  }, [user, loading]);

  // Always show loading screen until auth state is determined
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <RoleBasedAccess>
      <UXCamSessionManager />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </RoleBasedAccess>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Lexend-Regular': require('../assets/fonts/Lexend-Regular.ttf'),
    'Lexend-Medium': require('../assets/fonts/Lexend-Medium.ttf'),
    'Lexend-SemiBold': require('../assets/fonts/Lexend-SemiBold.ttf'),
    'Lexend-Bold': require('../assets/fonts/Lexend-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <LanguageModeProvider>
        <UXCamProvider autoInitialize={true} defaultEnabled={true} defaultPrivacyMode={false}>
          <ThemeProvider value={DefaultTheme}>
            <StatusBar style="light" />
            <RootLayoutNav />
          </ThemeProvider>
        </UXCamProvider>
      </LanguageModeProvider>
    </AuthProvider>
  );
}
