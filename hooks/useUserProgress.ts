import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserProgress {
  assigned_start_stage: number | null;
  unlocked_stages: number[];
}

export function useUserProgress() {
  const { user, session } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('ai_tutor_user_progress_summary')
          .select('assigned_start_stage, unlocked_stages')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          // It's possible the record doesn't exist yet for a new user,
          // which can be handled gracefully instead of as a hard error.
          if (fetchError.code === 'PGRST116') { // PostgREST error for "exact one row not found"
            console.warn('User progress record not found. User may be new.');
            setProgress(null);
          } else {
            throw fetchError;
          }
        }

        if (data) {
          setProgress(data);
        }
      } catch (e) {
        setError(e);
        console.error("Error fetching user progress:", e);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a valid session
    if (session) {
      fetchProgress();
    } else {
      setLoading(false);
      setProgress(null);
    }
  }, [user, session]);

  return { progress, loading, error };
}
