import { Tabs, useRouter } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  console.log('[TabLayout] colorScheme:', colorScheme);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#93E893',
        tabBarInactiveTintColor: '#D2D5E1',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111629',
          borderTopColor: '#1E293B',
        },
      }}>
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="graduationcap.fill" color={color} />
          )
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate('learn' as any);
          },
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="rectangle.inset.filled.on.rectangle" color={color} />
          )
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate('practice' as any);
          },
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />
          )
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate('progress' as any);
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          )
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate('profile' as any);
          },
        }}
      />
    </Tabs>
  );
}
