import { Stack } from 'expo-router';
import React from 'react';

export default function Stage2Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="daily-routine" />
      <Stack.Screen name="quick-answer" />
      <Stack.Screen name="roleplay-simulation" />
    </Stack>
  );
} 
