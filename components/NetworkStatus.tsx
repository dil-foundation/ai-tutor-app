import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NetworkStatusProps {
  onRetry?: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ onRetry }) => {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    const isConfigured = supabaseUrl && 
                        supabaseKey && 
                        !supabaseUrl.includes('placeholder') && 
                        !supabaseKey.includes('placeholder') &&
                        supabaseUrl.includes('supabase.co');
    
    setIsSupabaseConfigured(!!isConfigured);
  }, []);

  if (isSupabaseConfigured) {
    return null; // Don't show anything if properly configured
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>⚠️ Network Configuration Issue</Text>
        <Text style={styles.message}>
          Supabase is not properly configured. Login and data sync will not work.
        </Text>
        
        <Text style={styles.instructions}>
          To fix this issue:
        </Text>
        <Text style={styles.step}>1. Go to https://supabase.com/dashboard</Text>
        <Text style={styles.step}>2. Select your project</Text>
        <Text style={styles.step}>3. Go to Settings → API</Text>
        <Text style={styles.step}>4. Copy credentials to .env file</Text>
        
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  instructions: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  step: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NetworkStatus;
