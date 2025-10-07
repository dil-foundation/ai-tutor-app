import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { FRONTEND_URL, API_ENDPOINTS } from '../config/api';
import { progressTracker } from '../utils/progressTracker';

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  grade: string;
  english_proficiency_text: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean; // Add initialized state
  userRole: string | null;
  isStudent: boolean;
  roleLoading: boolean;
  isVerifying: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any } | { error: null }>;
  signUp: (signUpData: SignUpData) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  checkUserRole: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState<boolean>(false); // Add initialized state
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if user is a student
  const isStudent = userRole === 'student';

  // Function to check user role from profiles table
  const checkUserRole = async (): Promise<string | null> => {
    try {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        // Fallback to user metadata
        return user.user_metadata?.role || null;
      }
      
      return data?.role || null;
    } catch (error) {
      console.error('Error checking user role:', error);
      // Fallback to user metadata
      return user?.user_metadata?.role || null;
    }
  };

  // Update user role when user changes
  useEffect(() => {
    if (user) {
      console.log('🔄 [AUTH] User changed, updating progress tracker and role...');
      
      // Update the progress tracker with the new user
      progressTracker.updateCurrentUser().catch(error => {
        console.error('❌ [AUTH] Error updating progress tracker:', error);
      });
      
      // Set loading state for role checking
      setRoleLoading(true);
      setUserRole(null); // Reset role while checking
      
      checkUserRole().then(role => {
        // Only update if the user is still the same (prevent race conditions)
        if (user && user.id === user.id) {
          setUserRole(role);
          setRoleLoading(false);
          console.log('✅ [AUTH] User role set to:', role);
        }
      }).catch(error => {
        console.error('❌ [AUTH] Error checking user role:', error);
        // Fallback to user metadata if available
        const fallbackRole = user?.user_metadata?.role || null;
        if (user && user.id === user.id) {
          setUserRole(fallbackRole);
          setRoleLoading(false);
          console.log('✅ [AUTH] User role fallback to:', fallbackRole);
        }
      });
    } else {
      console.log('🔄 [AUTH] No user, resetting state...');
      setUserRole(null);
      setRoleLoading(false);
    }
  }, [user?.id]); // Only depend on user ID, not the entire user object

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        // The loading state is already false from the initial session check
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsVerifying(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (!signInData.session || !signInData.user) {
        throw new Error("Sign in successful but no session or user returned.");
      }

      console.log('✅ [AUTH] Supabase sign in successful, verifying with profiles table...');

      // Check if user is marked as deleted in the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_deleted')
        .eq('id', signInData.user.id)
        .single();

      if (profileError) {
        console.error('❌ [AUTH] Error fetching user profile:', profileError);
        throw new Error('Could not verify your account. Please try again.');
      }
      
      if (profile?.is_deleted) {
        console.log('✅ [AUTH] User is marked as deleted. Denying access.');
        throw new Error('Your account has been deactivated. Please contact support.');
      }
      
      console.log('✅ [AUTH] Verification successful. User is active.');
      setIsVerifying(false);
      return { error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ [AUTH] Error during sign in: ${errorMessage}`);
      
      // Manually clear session and user state to prevent race conditions
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      setIsVerifying(false);
      return { error: new Error(errorMessage) };
    }
  };

  const signUp = async (signUpData: SignUpData) => {
    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if available
        throw new Error(result.detail || 'Sign-up failed');
      }

      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔄 [AUTH] Starting sign out process...');
      
      // Reset the progress tracker before signing out
      progressTracker.handleSignOut();
      console.log('✅ [AUTH] Progress tracker reset');
      
      await supabase.auth.signOut();
      setUserRole(null);
      console.log('✅ [AUTH] User signed out successfully');
    } catch (error) {
      console.error('❌ [AUTH] Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    initialized, // Add initialized to context value
    userRole,
    isStudent,
    roleLoading,
    isVerifying,
    signIn,
    signUp,
    signOut,
    resetPassword,
    checkUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 