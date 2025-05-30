import { Stack } from 'expo-router';
import React from 'react';

export default function ProgressTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
} 