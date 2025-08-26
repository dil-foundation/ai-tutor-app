/**
 * User Utilities for DIL Tutor App
 * 
 * This module provides utility functions for handling user data,
 * specifically for retrieving and formatting user display names
 * from Supabase authentication and profile data.
 */

import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Get user's display name (first name only) from multiple sources
 * Priority order:
 * 1. First name from user metadata (auth.users)
 * 2. First name from profiles table
 * 3. Email prefix as fallback
 * 4. Default fallback
 * 
 * @param user - Supabase user object
 * @param fallback - Default name if no name is found
 * @returns Promise<string> - User's display name
 */
export const getUserDisplayName = async (
  user: User | null, 
  fallback: string = 'there'
): Promise<string> => {
  if (!user) {
    return fallback;
  }

  try {
    // 1. Try to get first name from user metadata (most reliable)
    const userMetadata = user.user_metadata || {};
    const firstNameFromMetadata = userMetadata.first_name;
    
    if (firstNameFromMetadata && firstNameFromMetadata.trim()) {
      console.log('📝 [USER_UTILS] Using first name from metadata:', firstNameFromMetadata);
      return firstNameFromMetadata.trim();
    }

    // 2. Try to get first name from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single();

    if (!profileError && profileData?.first_name) {
      console.log('📝 [USER_UTILS] Using first name from profiles table:', profileData.first_name);
      return profileData.first_name.trim();
    }

    // 3. Fallback to email prefix
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      console.log('📝 [USER_UTILS] Using email prefix as fallback:', emailPrefix);
      return emailPrefix;
    }

    // 4. Final fallback
    console.log('📝 [USER_UTILS] Using default fallback:', fallback);
    return fallback;

  } catch (error) {
    console.error('❌ [USER_UTILS] Error getting user display name:', error);
    
    // Fallback to email prefix if available
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return fallback;
  }
};

/**
 * Get user's full name from multiple sources
 * 
 * @param user - Supabase user object
 * @param fallback - Default name if no name is found
 * @returns Promise<string> - User's full name
 */
export const getUserFullName = async (
  user: User | null, 
  fallback: string = 'User'
): Promise<string> => {
  if (!user) {
    return fallback;
  }

  try {
    // 1. Try to get full name from user metadata
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || '';
    const lastName = userMetadata.last_name || '';
    
    if (firstName || lastName) {
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        console.log('📝 [USER_UTILS] Using full name from metadata:', fullName);
        return fullName;
      }
    }

    // 2. Try to get full name from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    if (!profileError && (profileData?.first_name || profileData?.last_name)) {
      const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      if (fullName) {
        console.log('📝 [USER_UTILS] Using full name from profiles table:', fullName);
        return fullName;
      }
    }

    // 3. Fallback to email prefix
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      console.log('📝 [USER_UTILS] Using email prefix as fallback:', emailPrefix);
      return emailPrefix;
    }

    // 4. Final fallback
    console.log('📝 [USER_UTILS] Using default fallback:', fallback);
    return fallback;

  } catch (error) {
    console.error('❌ [USER_UTILS] Error getting user full name:', error);
    
    // Fallback to email prefix if available
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return fallback;
  }
};

/**
 * Get user's first name only (synchronous version for immediate use)
 * 
 * @param user - Supabase user object
 * @param fallback - Default name if no name is found
 * @returns string - User's first name
 */
export const getUserFirstNameSync = (
  user: User | null, 
  fallback: string = 'there'
): string => {
  if (!user) {
    return fallback;
  }

  try {
    // 1. Try to get first name from user metadata
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name;
    
    if (firstName && firstName.trim()) {
      return firstName.trim();
    }

    // 2. Fallback to email prefix
    if (user.email) {
      return user.email.split('@')[0];
    }

    // 3. Final fallback
    return fallback;

  } catch (error) {
    console.error('❌ [USER_UTILS] Error getting user first name sync:', error);
    
    // Fallback to email prefix if available
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return fallback;
  }
};

/**
 * Get user's full name (synchronous version for immediate use)
 * 
 * @param user - Supabase user object
 * @param fallback - Default name if no name is found
 * @returns string - User's full name
 */
export const getUserFullNameSync = (
  user: User | null, 
  fallback: string = 'User'
): string => {
  if (!user) {
    return fallback;
  }

  try {
    // 1. Try to get full name from user metadata
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || '';
    const lastName = userMetadata.last_name || '';
    
    if (firstName || lastName) {
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
    }

    // 2. Fallback to email prefix
    if (user.email) {
      return user.email.split('@')[0];
    }

    // 3. Final fallback
    return fallback;

  } catch (error) {
    console.error('❌ [USER_UTILS] Error getting user full name sync:', error);
    
    // Fallback to email prefix if available
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return fallback;
  }
};

/**
 * Update user's display name in both auth metadata and profiles table
 * 
 * @param user - Supabase user object
 * @param firstName - New first name
 * @param lastName - New last name (optional)
 * @returns Promise<{success: boolean, error?: string}>
 */
export const updateUserDisplayName = async (
  user: User | null,
  firstName: string,
  lastName?: string
): Promise<{success: boolean, error?: string}> => {
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    // 1. Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName || user.user_metadata?.last_name || ''
      }
    });

    if (authError) {
      console.error('❌ [USER_UTILS] Error updating auth metadata:', authError);
      return { success: false, error: authError.message };
    }

    // 2. Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName || user.user_metadata?.last_name || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('❌ [USER_UTILS] Error updating profiles table:', profileError);
      return { success: false, error: profileError.message };
    }

    console.log('✅ [USER_UTILS] Successfully updated user display name');
    return { success: true };

  } catch (error) {
    console.error('❌ [USER_UTILS] Error updating user display name:', error);
    return { success: false, error: 'Unknown error occurred' };
  }
}; 