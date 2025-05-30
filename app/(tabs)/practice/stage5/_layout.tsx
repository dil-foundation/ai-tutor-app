import { Stack } from 'expo-router';
import React from 'react';

export default function Stage5Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="critical-thinking-dialogues" />
      <Stack.Screen name="academic-presentation" />
      <Stack.Screen name="in-depth-interview" />
    </Stack>
  );
} 