import { Stack } from 'expo-router';
import React from 'react';
import audioManager from '../../utils/audioManager';

export default function LearnLayout() {
  // Cleanup function to stop any playing audio when leaving the learn section
  React.useEffect(() => {
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
      <Stack.Screen name="english-only" />
    </Stack>
  );
}
