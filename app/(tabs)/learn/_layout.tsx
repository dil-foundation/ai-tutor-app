import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LearnLayout() {
  useEffect(() => {
    const playGreetingIfFirstTime = async () => {
      try {
        const hasVisited = await AsyncStorage.getItem('hasVisitedLearn');
        if (!hasVisited) {
          const { sound } = await Audio.Sound.createAsync(
            {
              uri: 'https://docs.google.com/uc?export=download&id=1dyjoV_uDM0pYX2oB64bH3IeB8Fn7azMG', // ✅ Replace with your working S3 audio link
            },
            {
              shouldPlay: true,
            }
          );
          await sound.playAsync();
          await AsyncStorage.setItem('hasVisitedLearn', 'true');
        }
      } catch (error) {
        console.log('Error playing greeting audio:', error);
      }
    };

    playGreetingIfFirstTime();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="feedback" />
    </Stack>
  );
}
