import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { FRONTEND_URL, API_ENDPOINTS } from '../config/api';

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
      // Set loading state for role checking
      setRoleLoading(true);
      setUserRole(null); // Reset role while checking
      
      checkUserRole().then(role => {
        // Only update if the user is still the same (prevent race conditions)
        if (user && user.id === user.id) {
          setUserRole(role);
          setRoleLoading(false);
          console.log('User role set to:', role);
        }
      }).catch(error => {
        console.error('Error checking user role:', error);
        // Fallback to user metadata if available
        const fallbackRole = user?.user_metadata?.role || null;
        if (user && user.id === user.id) {
          setUserRole(fallbackRole);
          setRoleLoading(false);
          console.log('User role fallback to:', fallbackRole);
        }
      });
    } else {
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      // Don't check role here - it will be checked automatically by useEffect
      // when the user state changes
      return { error: null };
    } catch (error) {
      return { error };
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
      await supabase.auth.signOut();
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
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