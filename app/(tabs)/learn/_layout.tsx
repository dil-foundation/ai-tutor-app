import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { getAuthData } from '../../utils/authStorage';
import audioManager from '../../utils/audioManager';

export default function LearnLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        // TEMPORARILY BYPASSING AUTHENTICATION FOR TESTING
        // TODO: Uncomment the authentication flow when ready to re-enable
        
        // // First check if user is authenticated
        // const { token } = await getAuthData();
        // if (!token) {
        //   // User is not authenticated, redirect to login
        //   router.replace('/(auth)/login');
        //   return;
        // }

        const hasVisited = await AsyncStorage.getItem('hasVisitedLearn');
        console.log('hasVisited', hasVisited);
        if (!hasVisited) {
          router.replace('/(tabs)/learn/greeting'); // Navigate to greeting screen
        }
      } catch (error) {
        console.log('Error checking AsyncStorage:', error);
        // Temporarily bypass login redirect for testing
        // router.replace('/(auth)/login');
        
        // Check if user has visited even if there's an error
        try {
          const hasVisited = await AsyncStorage.getItem('hasVisitedLearn');
          console.log('hasVisited (fallback)', hasVisited);
          if (!hasVisited) {
            router.replace('/(tabs)/learn/greeting');
          }
        } catch (fallbackError) {
          console.log('Fallback error:', fallbackError);
          // If all else fails, just stay on the current screen
        }
      }
    };

    checkFirstTime();

    // Cleanup function to stop any playing audio when leaving the learn section
    return () => {
      if (audioManager.isAudioPlaying()) {
        audioManager.stopCurrentAudio();
      }
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="greeting" />
      <Stack.Screen name="conversation" />
    </Stack>
  );
}
