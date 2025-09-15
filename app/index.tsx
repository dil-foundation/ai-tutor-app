import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // This is a fallback - navigation should be handled in _layout.tsx
    // But if we end up here, redirect based on auth state
    console.log('🔐 [Index] Fallback navigation triggered');
    
    if (!loading && !redirectAttempted) {
      setRedirectAttempted(true);
      
      // Add a small delay to ensure auth state is stable
      const timer = setTimeout(() => {
        if (user) {
          console.log('🔐 [Index] User authenticated, redirecting to learn');
          router.replace('/(tabs)/learn');
        } else {
          console.log('🔐 [Index] User not authenticated, redirecting to login');
          router.replace('/auth/login');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, redirectAttempted]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#58D68D" />
      <Text style={styles.text}>Loading...</Text>
      <Text style={styles.subtext}>Please wait while we redirect you</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: '#111827',
    marginTop: 16,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
}); 