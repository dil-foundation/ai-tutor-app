import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

export default function LearnLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkFirstTime = async () => {

      // ⚠️ TEMP: For testing only — comment this out in production
      await AsyncStorage.removeItem('hasVisitedLearn');
      
      const hasVisited = await AsyncStorage.getItem('hasVisitedLearn');
      console.log('hasVisited', hasVisited);
      if (!hasVisited) {
        router.replace('/(tabs)/learn/greeting'); // Navigate to greeting screen
      }
    };

    checkFirstTime();
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
