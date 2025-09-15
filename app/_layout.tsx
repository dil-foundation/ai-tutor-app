// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingScreen from '../components/LoadingScreen';
import RoleBasedAccess from '../components/RoleBasedAccess';
import UXCamSessionManager from '../components/UXCamSessionManager';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UXCamProvider } from '../context/UXCamContext';
import { LanguageModeProvider } from './context/LanguageModeContext';

// UXCam is now handled by UXCamService and UXCamContext
// No need for duplicate initialization here

// Global error handler for unhandled promise rejections and JS errors
if (typeof global !== 'undefined') {
  // Type-safe error handler
  const globalAny = global as any;
  if (globalAny.ErrorUtils?.setGlobalHandler) {
    globalAny.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      console.error('🚨 [Global Error Handler] Caught error:', error);
      console.error('🚨 [Global Error Handler] Is fatal:', isFatal);
      // Don't crash the app for non-fatal errors
      if (!isFatal) {
        console.log('🔄 [Global Error Handler] Non-fatal error, continuing...');
      }
    });
  }
}

// Handle unhandled promise rejections safely
if (typeof global !== 'undefined') {
  const originalRejectionHandler = global.Promise;
  if (originalRejectionHandler) {
    // Set up a global unhandled rejection handler
    process?.on?.('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('🚨 [Unhandled Promise Rejection]:', reason);
      console.error('🚨 [Promise]:', promise);
      // Don't crash the app
    });
  }
}

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading, isStudent } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

  // UXCam initialization is now handled by UXCamContext
  // No need for manual initialization here

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
    if (error) {
      console.error('Font loading error:', error);
      // Don't throw error, just log it
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Initialize UXCam after app is fully loaded
      setTimeout(async () => {
        try {
          const UXCamService = (await import('../services/UXCamService')).default;
          const uxcamService = UXCamService.getInstance();
          await uxcamService.initialize();
          console.log('🎉 [App] UXCam initialized after app load');
        } catch (error) {
          console.warn('⚠️ [App] UXCam initialization failed:', error);
          // Don't crash the app if UXCam fails
        }
      }, 2000); // Wait 2 seconds after app loads
    }
  }, [loaded]);

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageModeProvider>
          <UXCamProvider autoInitialize={false} defaultEnabled={true} defaultPrivacyMode={false}>
            <ThemeProvider value={DefaultTheme}>
              <StatusBar style="light" />
              <RootLayoutNav />
            </ThemeProvider>
          </UXCamProvider>
        </LanguageModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
