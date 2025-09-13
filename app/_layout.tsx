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
import ErrorBoundary from '../components/ErrorBoundary';

// UXCam is now handled by UXCamService and UXCamContext
// No need for duplicate initialization here

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
      if (!inAuthGroup && !hasNavigated) {
        try {
          router.replace('/auth/login');
          setHasNavigated(true);
        } catch (error) {
          console.error('Navigation error to login:', error);
        }
      }
    } else if (user && inAuthGroup && !hasNavigated) {
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
          try {
            router.replace('/(tabs)/learn/greeting');
          } catch (navError) {
            console.error('Navigation error to greeting:', navError);
          }
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
    <ErrorBoundary>
      <RoleBasedAccess>
        <UXCamSessionManager />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </RoleBasedAccess>
    </ErrorBoundary>
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
      // Don't throw error, just log it and continue
      // This prevents crashes on iOS when fonts fail to load
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch((error) => {
        console.error('Error hiding splash screen:', error);
      });
    }
  }, [loaded]);

  // Always show loading screen until fonts are loaded or error occurs
  if (!loaded && !error) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
