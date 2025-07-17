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
import LoadingScreen from '../components/LoadingScreen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
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
        <ThemeProvider value={DefaultTheme}>
          <StatusBar style="light" />
          <RootLayoutNav />
        </ThemeProvider>
      </LanguageModeProvider>
    </AuthProvider>
  );
}
