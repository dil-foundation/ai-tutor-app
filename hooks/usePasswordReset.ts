import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async (email: string) => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return { success: false };
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return { success: false };
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'diltutorappreact://reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to send reset email');
        return { success: false, error };
      }

      Alert.alert(
        'Success',
        'Password reset link has been sent to your email address. Please check your inbox.',
        [{ text: 'OK' }]
      );

      return { success: true };
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isLoading,
  };
}; 