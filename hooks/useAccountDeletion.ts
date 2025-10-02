/**
 * Account Deletion Hook
 * Handles account deletion functionality with proper error handling and user feedback
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

interface DeletionStatus {
  is_deleted: boolean;
  deleted_at: string | null;
  deletion_reason: string | null;
  hard_deletion_scheduled_for: string | null;
  days_remaining: number | null;
}

interface AccountDeletionResponse {
  success: boolean;
  message: string;
  deletion_scheduled_for?: string;
  error?: string;
}

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null);
  
  const { session, signOut } = useAuth();
  const router = useRouter();

  /**
   * Fetch current deletion status
   */
  const fetchDeletionStatus = async (): Promise<DeletionStatus | null> => {
    if (!session?.access_token) {
      console.log('❌ [DELETION] No session available');
      return null;
    }

    try {
      setIsLoading(true);
      console.log('🔄 [DELETION] Fetching deletion status...');

      const response = await fetch(API_ENDPOINTS.DELETION_STATUS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch deletion status');
      }

      const status: DeletionStatus = await response.json();
      console.log('✅ [DELETION] Deletion status fetched:', status);
      
      setDeletionStatus(status);
      return status;

    } catch (error) {
      console.error('❌ [DELETION] Error fetching deletion status:', error);
      Alert.alert('Error', 'Failed to check account status. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request account deletion with confirmation
   */
  const requestAccountDeletion = async (reason?: string): Promise<boolean> => {
    if (!session?.access_token) {
      Alert.alert('Error', 'You must be logged in to delete your account.');
      return false;
    }

    return new Promise((resolve) => {
      // Show confirmation dialog
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone immediately. Your account will be deactivated and permanently deleted after 30 days.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Delete Account',
            style: 'destructive',
            onPress: () => performAccountDeletion(reason).then(resolve),
          },
        ]
      );
    });
  };

  /**
   * Perform the actual account deletion
   */
  const performAccountDeletion = async (reason?: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      console.log('🔄 [DELETION] Requesting account deletion...');

      const response = await fetch(API_ENDPOINTS.DELETE_ACCOUNT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'User requested account deletion',
          confirm_deletion: true,
        }),
      });

      const result: AccountDeletionResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to delete account');
      }

      console.log('✅ [DELETION] Account deletion successful:', result);

      // Show success message
      Alert.alert(
        'Account Deleted',
        result.message,
        [
          {
            text: 'OK',
            onPress: async () => {
              // Sign out user and redirect to login
              try {
                await signOut();
                router.replace('/auth/login');
              } catch (signOutError) {
                console.error('❌ [DELETION] Error signing out:', signOutError);
                // Force navigation even if sign out fails
                router.replace('/auth/login');
              }
            },
          },
        ]
      );

      return true;

    } catch (error) {
      console.error('❌ [DELETION] Account deletion failed:', error);
      
      Alert.alert(
        'Deletion Failed',
        error instanceof Error ? error.message : 'Failed to delete account. Please try again or contact support.',
        [{ text: 'OK' }]
      );

      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Cancel account deletion (restore account)
   */
  const cancelAccountDeletion = async (): Promise<boolean> => {
    if (!session?.access_token) {
      Alert.alert('Error', 'You must be logged in to cancel account deletion.');
      return false;
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Cancel Account Deletion',
        'Do you want to restore your account and cancel the deletion request?',
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Restore Account',
            onPress: () => performCancelDeletion().then(resolve),
          },
        ]
      );
    });
  };

  /**
   * Perform account deletion cancellation
   */
  const performCancelDeletion = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔄 [DELETION] Cancelling account deletion...');

      const response = await fetch(API_ENDPOINTS.CANCEL_DELETION, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to cancel account deletion');
      }

      console.log('✅ [DELETION] Account deletion cancelled:', result);

      Alert.alert(
        'Account Restored',
        result.message,
        [{ text: 'OK' }]
      );

      // Refresh deletion status
      await fetchDeletionStatus();

      return true;

    } catch (error) {
      console.error('❌ [DELETION] Failed to cancel deletion:', error);
      
      Alert.alert(
        'Cancellation Failed',
        error instanceof Error ? error.message : 'Failed to cancel account deletion. Please contact support.',
        [{ text: 'OK' }]
      );

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isDeleting,
    isLoading,
    deletionStatus,
    fetchDeletionStatus,
    requestAccountDeletion,
    cancelAccountDeletion,
  };
};
