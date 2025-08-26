import { Stack } from 'expo-router';
import React from 'react';

export default function Stage1Layout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="repeatAfterMe" />
      <Stack.Screen name="quickResponse" />
      <Stack.Screen name="listenAndReply" />
    </Stack>
  );
} 