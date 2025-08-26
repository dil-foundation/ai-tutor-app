/**
 * Authentication Utilities for AI Tutor App
 * 
 * This module provides utilities for handling authentication tokens,
 * API request authorization, and user session management.
 */

import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

export interface UserData {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  grade: string;
}

/**
 * Get the current user's authentication token
 * @returns Promise<string | null> - The JWT token or null if not authenticated
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (session?.access_token) {
      console.log('✅ [AUTH] Token retrieved successfully');
      return session.access_token;
    }
    
    console.log('⚠️ [AUTH] No active session found');
    return null;
  } catch (error) {
    console.error('❌ [AUTH] Error getting auth token:', error);
    return null;
  }
};

/**
 * Get current user data from session
 * @returns Promise<UserData | null> - User data or null if not authenticated
 */
export const getCurrentUserData = async (): Promise<UserData | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('⚠️ [AUTH] No authenticated user found');
      return null;
    }
    
    const userData: UserData = {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'student',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      grade: user.user_metadata?.grade || ''
    };
    
    console.log('✅ [AUTH] User data retrieved:', userData.email);
    return userData;
  } catch (error) {
    console.error('❌ [AUTH] Error getting user data:', error);
    return null;
  }
};

/**
 * Create authorized headers for API requests
 * @param token - Optional JWT token, will be fetched if not provided
 * @returns Promise<Headers> - Headers object with authorization
 */
export const createAuthHeaders = async (token?: string): Promise<Headers> => {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  
  const authToken = token || await getAuthToken();
  
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
    console.log('✅ [AUTH] Authorization header added');
  } else {
    console.warn('⚠️ [AUTH] No auth token available for request');
  }
  
  return headers;
};

/**
 * Make an authenticated API request
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param token - Optional JWT token
 * @returns Promise<Response> - API response
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> => {
  try {
    const headers = await createAuthHeaders(token);
    
    // Merge with existing headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
    
    const requestOptions: RequestInit = {
      ...options,
      headers,
    };
    
    console.log(`🔄 [API] Making authenticated request to: ${url}`);
    const response = await fetch(url, requestOptions);
    
    // Handle authentication errors
    if (response.status === 401) {
      console.error('❌ [AUTH] Unauthorized request - token may be expired');
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [{ text: 'OK' }]
      );
      // You might want to redirect to login here
    } else if (response.status === 403) {
      console.error('❌ [AUTH] Forbidden request - insufficient permissions');
      Alert.alert(
        'Access Denied',
        'You do not have permission to access this resource.',
        [{ text: 'OK' }]
      );
    }
    
    return response;
  } catch (error) {
    console.error('❌ [AUTH] Error in authenticated fetch:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns Promise<boolean> - True if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return token !== null;
  } catch (error) {
    console.error('❌ [AUTH] Error checking authentication:', error);
    return false;
  }
};

/**
 * Refresh the authentication token
 * @returns Promise<string | null> - New token or null if refresh failed
 */
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ [AUTH] Error refreshing token:', error);
      return null;
    }
    
    if (session?.access_token) {
      console.log('✅ [AUTH] Token refreshed successfully');
      return session.access_token;
    }
    
    console.log('⚠️ [AUTH] No session available for refresh');
    return null;
  } catch (error) {
    console.error('❌ [AUTH] Error refreshing token:', error);
    return null;
  }
};

/**
 * Sign out the current user
 * @returns Promise<void>
 */
export const signOutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ [AUTH] Error signing out:', error);
      throw error;
    }
    
    console.log('✅ [AUTH] User signed out successfully');
  } catch (error) {
    console.error('❌ [AUTH] Error in signOutUser:', error);
    throw error;
  }
};

/**
 * Validate token expiration
 * @param token - JWT token to validate
 * @returns boolean - True if token is valid and not expired
 */
export const isTokenValid = (token: string): boolean => {
  try {
    // Decode JWT token (without verification for client-side check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (with 5 minute buffer)
    const isExpired = payload.exp < (currentTime + 300);
    
    if (isExpired) {
      console.warn('⚠️ [AUTH] Token is expired or will expire soon');
      return false;
    }
    
    console.log('✅ [AUTH] Token is valid');
    return true;
  } catch (error) {
    console.error('❌ [AUTH] Error validating token:', error);
    return false;
  }
};

/**
 * Get user role from token
 * @param token - JWT token
 * @returns string - User role or 'student' as default
 */
export const getUserRoleFromToken = (token: string): string => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_metadata?.role || 'student';
  } catch (error) {
    console.error('❌ [AUTH] Error getting user role from token:', error);
    return 'student';
  }
}; 