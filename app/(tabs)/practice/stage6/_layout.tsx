import { Stack } from 'expo-router';
import React from 'react';

export default function Stage6Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ai-guided-spontaneous-speech" />
      <Stack.Screen name="roleplay-handle-sensitive-scenario" />
      <Stack.Screen name="critical-opinion-builder" />
    </Stack>
  );
} 
