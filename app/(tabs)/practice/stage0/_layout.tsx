import { Stack } from 'expo-router';
import React from 'react';

export default function Stage0Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="lesson1" />
      <Stack.Screen name="lesson2" />
      <Stack.Screen name="lesson3" />
      <Stack.Screen name="lesson4" />
      <Stack.Screen name="lesson5" />
    </Stack>
  );
} 
