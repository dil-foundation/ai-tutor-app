import { Stack } from 'expo-router';
import React from 'react';

export default function PracticeTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="stage0" />
      <Stack.Screen name="stage1" />
      <Stack.Screen name="stage2" />
      <Stack.Screen name="stage3" />
      <Stack.Screen name="stage4" />
      <Stack.Screen name="stage5" />
      <Stack.Screen name="stage6" />
      {/* Add other stages here as needed */}
    </Stack>
  );
} 
