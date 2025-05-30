import { Stack } from 'expo-router';
import React from 'react';

export default function LearnLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="feedback" />
    </Stack>
  );
} 