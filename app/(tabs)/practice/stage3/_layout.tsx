import { Stack } from 'expo-router';
import React from 'react';

export default function Stage3Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="storytelling" />
      <Stack.Screen name="group-dialogue" />
      <Stack.Screen name="problem-solving" />
    </Stack>
  );
} 
