import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Polyfill for structuredClone (not available in React Native)
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Get environment variables with safe fallbacks to prevent crashes
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjU0MjAsImV4cCI6MTk2MDcwMTQyMH0.placeholder';

// Log configuration status but don't crash
const isUsingPlaceholder = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');
const hasEnvVars = process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!hasEnvVars || isUsingPlaceholder) {
  console.warn('⚠️ [Supabase] Using placeholder configuration - LOGIN WILL NOT WORK');
  console.warn('⚠️ [Supabase] To fix login issues:');
  console.warn('   1. Go to https://supabase.com/dashboard');
  console.warn('   2. Select your project');
  console.warn('   3. Go to Settings > API');
  console.warn('   4. Copy Project URL to EXPO_PUBLIC_SUPABASE_URL in .env file');
  console.warn('   5. Copy anon public key to EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file');
} else {
  console.log('✅ [Supabase] Using production configuration');
  console.log('✅ [Supabase] URL:', supabaseUrl.substring(0, 30) + '...');
}

// Create Supabase client with error handling
let supabase: any;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  console.log('✅ [Supabase] Client created successfully');
} catch (error) {
  console.error('❌ [Supabase] Failed to create client:', error);
  // Create a mock client that won't crash the app
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: { message: 'Offline mode' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
    }),
  };
}

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Check if using placeholder configuration
    if (isUsingPlaceholder) {
      return { 
        data: null, 
        error: { 
          message: 'Login failed: Supabase not configured. Please set up your Supabase credentials in the .env file.',
          code: 'SUPABASE_NOT_CONFIGURED'
        }
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('🚨 [Auth] Login error:', error);
      throw error;
    }
    
    console.log('✅ [Auth] Login successful');
    return { data, error: null };
  } catch (error) {
    console.error('🚨 [Auth] Login failed:', error);
    return { data: null, error };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export { supabase };

