import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  console.log('[TabLayout] colorScheme:', colorScheme);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        // tabBarButton: HapticTab,
        // tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => {
            // console.log('[Learn Tab] router focused:', focused, 'router color:', color);
            return <IconSymbol size={28} name="graduationcap.fill" />;
          }
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
          tabBarIcon: ({ color, focused }) => {
            console.log('[Practice Tab] router focused:', focused, 'router color:', color);
            return <IconSymbol size={28} name="rectangle.inset.filled.on.rectangle" />;
          }
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
          tabBarIcon: ({ color, focused }) => {
            console.log('[Progress Tab] router focused:', focused, 'router color:', color);
            return <IconSymbol size={28} name="chart.line.uptrend.xyaxis" />;
          }
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
          tabBarIcon: ({ color, focused }) => {
            console.log('[Profile Tab] router focused:', focused, 'router color:', color);
            return <IconSymbol size={28} name="person.fill" />;
          }
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
