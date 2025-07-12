// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { getAuthData } from './utils/authStorage';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const [isAuthenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { token } = await getAuthData();
        setAuthenticated(!!token);
      } finally {
        SplashScreen.hideAsync();
      }
    };
    checkAuth();
  }, [segments]); // Re-check on every navigation

  useEffect(() => {
    if (isAuthenticated === null) {
      return; // Wait for the auth check to complete
    }

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is authenticated and in the auth group, redirect them to the main app.
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/learn');
    } 
    // If the user is not authenticated and not in the auth group, redirect them to the login page.
    else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, router]);

  if (isAuthenticated === null) {
    return null; // Or a loading spinner while we check authentication
  }
  
  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="light" />
      <RootLayoutNav />
    </ThemeProvider>
  );
}
