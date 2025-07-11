import { Stack } from 'expo-router';
import React from 'react';

export default function Stage4Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="abstract-topic" />
      <Stack.Screen name="mock-interview" />
      <Stack.Screen name="news-summary" />
    </Stack>
  );
} 
