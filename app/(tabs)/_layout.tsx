import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  console.log('[TabLayout] colorScheme:', colorScheme);
  
  // Check if we're on the conversation screen to hide tab bar
  const isConversationScreen = pathname.includes('/conversation');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#58D68D',
        tabBarInactiveTintColor: '#6C757D',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 20,
          paddingHorizontal: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 16,
          // Hide tab bar when on conversation screen
          display: isConversationScreen ? 'none' : 'flex',
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}>
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused ? (
                <LinearGradient
                  colors={['#58D68D', '#45B7A8']}
                  style={styles.activeIconGradient}
                >
                  <IconSymbol size={24} name="graduationcap.fill" color="#FFFFFF" />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIconContainer}>
                  <IconSymbol size={24} name="graduationcap.fill" color={color} />
                </View>
              )}
            </View>
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
            <View style={styles.iconContainer}>
              {focused ? (
                <LinearGradient
                  colors={['#58D68D', '#45B7A8']}
                  style={styles.activeIconGradient}
                >
                  <IconSymbol size={24} name="rectangle.inset.filled.on.rectangle" color="#FFFFFF" />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIconContainer}>
                  <IconSymbol size={24} name="rectangle.inset.filled.on.rectangle" color={color} />
                </View>
              )}
            </View>
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
            <View style={styles.iconContainer}>
              {focused ? (
                <LinearGradient
                  colors={['#58D68D', '#45B7A8']}
                  style={styles.activeIconGradient}
                >
                  <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color="#FFFFFF" />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIconContainer}>
                  <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />
                </View>
              )}
            </View>
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
            <View style={styles.iconContainer}>
              {focused ? (
                <LinearGradient
                  colors={['#58D68D', '#45B7A8']}
                  style={styles.activeIconGradient}
                >
                  <IconSymbol size={24} name="person.fill" color="#FFFFFF" />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIconContainer}>
                  <IconSymbol size={24} name="person.fill" color={color} />
                </View>
              )}
            </View>
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

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inactiveIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
});
