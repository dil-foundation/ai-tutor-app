// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import RoleBasedAccess from '../components/RoleBasedAccess';
import UXCamSessionManager from '../components/UXCamSessionManager';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UXCamProvider } from '../context/UXCamContext';
import { LanguageModeProvider } from './context/LanguageModeContext';

// UXCam is now handled by UXCamService and UXCamContext
// No need for duplicate initialization here

// Global error handlers to prevent crashes
if (typeof global !== 'undefined') {
  // Handle JavaScript errors
  const originalErrorHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  (global as any).ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
    console.error('🚨 [Global Error Handler] Caught error:', error);
    console.error('🚨 [Global Error Handler] Is fatal:', isFatal);
    console.error('🚨 [Global Error Handler] Stack:', error.stack);
    
    // Call original handler if it exists
    if (originalErrorHandler) {
      try {
        originalErrorHandler(error, isFatal);
      } catch (handlerError) {
        console.error('🚨 [Global Error Handler] Handler itself failed:', handlerError);
      }
    }
    
    // Don't crash the app for non-fatal errors
    if (!isFatal) {
      console.log('🔄 [Global Error Handler] Non-fatal error, continuing...');
    }
  });

  // Handle unhandled promise rejections
  const originalRejectionHandler = (global as any).onunhandledrejection;
  (global as any).onunhandledrejection = (event: any) => {
    console.error('🚨 [Unhandled Promise Rejection]:', event.reason);
    console.error('🚨 [Unhandled Promise Rejection] Stack:', event.reason?.stack);
    
    // Call original handler if it exists
    if (originalRejectionHandler) {
      try {
        originalRejectionHandler(event);
      } catch (handlerError) {
        console.error('🚨 [Unhandled Promise Rejection] Handler failed:', handlerError);
      }
    }
    
    // Prevent the default behavior (which would crash the app)
    event.preventDefault?.();
  };

  // Add native crash protection
  if ((global as any).nativeCallSyncHook) {
    const originalNativeCallSyncHook = (global as any).nativeCallSyncHook;
    (global as any).nativeCallSyncHook = function(moduleID: number, methodID: number, params: any[]) {
      try {
        return originalNativeCallSyncHook.call(this, moduleID, methodID, params);
      } catch (error) {
        console.error('🚨 [Native Call Error]:', error);
        console.error('🚨 [Native Call Error] Module:', moduleID, 'Method:', methodID);
        // Return null instead of crashing
        return null;
      }
    };
  }
}

// Hermes memory management
if (typeof global !== 'undefined' && (global as any).HermesInternal) {
  // Enable garbage collection optimizations
  if ((global as any).HermesInternal.enableSamplingProfiler) {
    try {
      (global as any).HermesInternal.enableSamplingProfiler();
    } catch (error) {
      console.warn('⚠️ [Hermes] Could not enable sampling profiler:', error);
    }
  }
  
  // Force garbage collection periodically to prevent memory buildup
  setInterval(() => {
    try {
      if ((global as any).gc) {
        (global as any).gc();
      } else if ((global as any).HermesInternal?.gc) {
        (global as any).HermesInternal.gc();
      }
    } catch (error) {
      // Ignore GC errors
    }
  }, 30000); // Every 30 seconds
}

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait until the auth state is loaded
    }

    const inApp = segments[0] === '(tabs)';

    if (user && !inApp) {
      // If the user is signed in and isn't in the main app section,
      // redirect them to the main tabs screen.
      // This covers both the initial launch (from index) and being in the auth group.
      router.replace('/(tabs)/learn');
    } else if (!user) {
      // If the user is not signed in, redirect them to the login screen.
      // This handles the initial launch when the user is not logged in.
      router.replace('/auth/login');
    }
  }, [user, loading, segments]);

  // Prevent rendering until the auth state is loaded
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
