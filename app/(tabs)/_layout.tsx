import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import RoleBasedAccess from '../../components/RoleBasedAccess';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  console.log('[TabLayout] colorScheme:', colorScheme);
  console.log('[TabLayout] Safe area insets:', insets);
  console.log('[TabLayout] Platform:', Platform.OS);
  console.log('[TabLayout] Calculated tab bar height:', Platform.OS === 'ios' ? 65 + insets.bottom : 85);

  // Check if we're in conversation screen, greeting, or stage1/stage2 screens to hide tab bar
  const isInConversation = pathname.includes('/conversation');
  const isInEnglishOnly = pathname.includes('/english-only');
  const isInGreeting = pathname.includes('/greeting');
  const isInStage1 = pathname.includes('/stage1/');
  const isInStage2 = pathname.includes('/stage2/');
  const isInStage3 = pathname.includes('/stage3/');
  const isInStage4 = pathname.includes('/stage4/');
  const isInStage5 = pathname.includes('/stage5/');
  const isInStage6 = pathname.includes('/stage6/');
  const shouldHideTabBar = isInConversation || isInStage1 || isInStage2 || isInStage3 || isInStage4 || isInStage5 || isInStage6 || isInEnglishOnly || isInGreeting;

  // Memoize tab bar style to prevent re-calculation on every render
  const tabBarStyle = useMemo(() => {
    const baseStyle = {
      backgroundColor: '#FFFFFF',
      borderTopColor: 'rgba(0, 0, 0, 0.1)',
      borderTopWidth: 1,
      paddingTop: 8,
      paddingHorizontal: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 16,
      display: shouldHideTabBar ? 'none' : 'flex',
    };

    // Platform-specific safe area handling
    if (Platform.OS === 'ios') {
      return {
        ...baseStyle,
        height: 65 + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 8),
      };
    } else {
      // Android with edge-to-edge - ensure proper spacing above navigation
      const androidBottomPadding = insets.bottom > 0 ? insets.bottom + 8 : 20;
      return {
        ...baseStyle,
        height: 65 + androidBottomPadding,
        paddingBottom: androidBottomPadding,
      };
    }
  }, [insets.bottom, shouldHideTabBar]);

  return (
    <RoleBasedAccess>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#58D68D',
          tabBarInactiveTintColor: '#6C757D',
          headerShown: false,
          tabBarStyle: tabBarStyle,
          tabBarHideOnKeyboard: true,
          tabBarBackground: () => (
            <View style={{ 
              backgroundColor: '#FFFFFF', 
              flex: 1,
              borderTopWidth: 1,
              borderTopColor: 'rgba(0, 0, 0, 0.1)'
            }} />
          ),
          tabBarItemStyle: {
            paddingVertical: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 6, // Increased gap between icon and text
          },
          tabBarIconStyle: {
            marginBottom: 4, // Increased space below icon
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
      </SafeAreaView>
    </RoleBasedAccess>
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
