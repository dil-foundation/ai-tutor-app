import { supabase } from '../lib/supabase';
import BASE_API_URL from '../config/api';

// Types for progress tracking
export interface TopicAttempt {
  user_id: string;
  stage_id: number;
  exercise_id: number;
  topic_id: number;
  score: number;
  urdu_used: boolean;
  time_spent_seconds: number;
  completed: boolean;
}

export interface UserProgress {
  summary: any;
  stages: any[];
  exercises: any[];
  unlocks: any[];
}

export interface ProgressResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface ProgressData {
  current_stage: {
    id: number;
    name: string;
    subtitle: string;
    progress: number;
  };
  overall_progress: number;
  total_progress: number;
  streak_days: number;
  total_practice_time: number;
  total_exercises_completed: number;
  longest_streak: number;
  average_session_duration: number;
  weekly_learning_hours: number;
  monthly_learning_hours: number;
  first_activity_date: string | null;
  last_activity_date: string | null;
  stages: Array<{
    stage_id: number;
    name: string;
    subtitle: string;
    completed: boolean;
    progress: number;
    unlocked: boolean;
    exercises: Array<{
      name: string;
      status: 'completed' | 'in_progress' | 'locked';
      progress: number;
      attempts: number;
      topics: number;
      completed_topics: number;
    }>;
    started_at: string | null;
    completed_at: string | null;
    total_topics: number;
    completed_topics: number;
  }>;
  achievements: Array<{
    name: string;
    icon: string;
    date: string;
    color: string;
    description: string;
  }>;
  fluency_trend: number[];
  unlocked_content: any[];
  total_completed_stages: number;
  total_completed_exercises: number;
  total_learning_units: number;
  total_completed_units: number;
}

class ProgressTracker {
  private static instance: ProgressTracker;
  private currentUser: any = null;
  private isInitialized: boolean = false;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {
    console.log('🔄 [FRONTEND] ProgressTracker instance created (lazy initialization)');
  }

  public static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker();
    }
    return ProgressTracker.instance;
  }

  private async initializeUser() {
    try {
      console.log('🔄 [FRONTEND] Initializing progress tracker...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      this.currentUser = user;
      this.isInitialized = true;
      console.log('👤 [FRONTEND] Progress tracker initialized for user:', user?.id);
      console.log('📧 [FRONTEND] User email:', user?.email);
    } catch (error) {
      console.error('❌ [FRONTEND] Error initializing progress tracker:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeUser();
    }
  }

  private validateUserId(userId: string): boolean {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      console.error('❌ [FRONTEND] Invalid user ID:', userId);
      return false;
    }
    return true;
  }

  private validateTopicAttempt(attempt: TopicAttempt): boolean {
    const errors: string[] = [];
    
    if (!this.validateUserId(attempt.user_id)) {
      errors.push('Invalid user_id');
    }
    
    if (!Number.isInteger(attempt.stage_id) || attempt.stage_id < 1 || attempt.stage_id > 6) {
      errors.push('Invalid stage_id (must be 1-6)');
    }
    
    if (!Number.isInteger(attempt.exercise_id) || attempt.exercise_id < 1 || attempt.exercise_id > 3) {
      errors.push('Invalid exercise_id (must be 1-3)');
    }
    
    if (!Number.isInteger(attempt.topic_id) || attempt.topic_id < 1 || attempt.topic_id > 100) {
      errors.push('Invalid topic_id (must be 1-100)');
    }
    
    if (typeof attempt.score !== 'number' || attempt.score < 0 || attempt.score > 100) {
      errors.push('Invalid score (must be 0-100)');
    }
    
    if (typeof attempt.urdu_used !== 'boolean') {
      errors.push('Invalid urdu_used (must be boolean)');
    }
    
    if (!Number.isInteger(attempt.time_spent_seconds) || attempt.time_spent_seconds < 1 || attempt.time_spent_seconds > 3600) {
      errors.push('Invalid time_spent_seconds (must be 1-3600)');
    }
    
    if (typeof attempt.completed !== 'boolean') {
      errors.push('Invalid completed (must be boolean)');
    }
    
    if (errors.length > 0) {
      console.error('❌ [FRONTEND] Topic attempt validation failed:', errors);
      return false;
    }
    
    return true;
  }

  private async makeApiRequest<T>(
    url: string, 
    options: RequestInit = {}, 
    retryCount = 0
  ): Promise<T> {
    try {
      console.log(`📡 [FRONTEND] API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`📥 [FRONTEND] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [FRONTEND] API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [FRONTEND] API request successful');
      return result;
    } catch (error) {
      console.error(`❌ [FRONTEND] API request failed (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < this.MAX_RETRIES - 1) {
        console.log(`🔄 [FRONTEND] Retrying in ${this.RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.makeApiRequest<T>(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  private getCacheKey(key: string): string {
    return `progress_${this.currentUser?.id}_${key}`;
  }

  private getCachedData(key: string): any | null {
    const cacheKey = this.getCacheKey(key);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 [FRONTEND] Using cached data for: ${key}`);
      return cached.data;
    }
    
    return null;
  }

  private setCachedData(key: string, data: any): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    console.log(`📦 [FRONTEND] Cached data for: ${key}`);
  }

  private clearCache(): void {
    this.cache.clear();
    console.log('🗑️ [FRONTEND] Cache cleared');
  }

  /**
   * Initialize user progress when they first start using the app
   */
  async initializeUserProgress(): Promise<ProgressResponse> {
    console.log('🔄 [FRONTEND] initializeUserProgress called');
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!this.validateUserId(this.currentUser.id)) {
        throw new Error('Invalid user ID');
      }

      console.log('🔄 [FRONTEND] Initializing progress for user:', this.currentUser.id);
      console.log('📡 [FRONTEND] API URL:', `${BASE_API_URL}/api/progress/initialize-progress`);

      const result = await this.makeApiRequest<ProgressResponse>(
        `${BASE_API_URL}/api/progress/initialize-progress`,
        {
        method: 'POST',
        body: JSON.stringify({
          user_id: this.currentUser.id
        }),
        }
      );

      console.log('✅ [FRONTEND] Progress initialization result:', result);
      
      if (result.success) {
        console.log('🎉 [FRONTEND] Progress initialized successfully');
        this.clearCache(); // Clear cache after initialization
      } else {
        console.log('❌ [FRONTEND] Progress initialization failed:', result.error);
      }
      
      return result;

    } catch (error) {
      console.error('❌ [FRONTEND] Error initializing user progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Record a topic attempt with detailed metrics
   */
  async recordTopicAttempt(attempt: TopicAttempt): Promise<ProgressResponse> {
    console.log('🔄 [FRONTEND] recordTopicAttempt called');
    console.log('📊 [FRONTEND] Attempt details:', {
      user_id: this.currentUser?.id,
      stage_id: attempt.stage_id,
      exercise_id: attempt.exercise_id,
      topic_id: attempt.topic_id,
      score: attempt.score,
      urdu_used: attempt.urdu_used,
      time_spent_seconds: attempt.time_spent_seconds,
      completed: attempt.completed
    });
    
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        throw new Error('User not authenticated');
      }

      // Validate attempt data
      if (!this.validateTopicAttempt(attempt)) {
        throw new Error('Invalid topic attempt data');
      }

      console.log('📡 [FRONTEND] API URL:', `${BASE_API_URL}/api/progress/record-topic-attempt`);

      const result = await this.makeApiRequest<ProgressResponse>(
        `${BASE_API_URL}/api/progress/record-topic-attempt`,
        {
        method: 'POST',
        body: JSON.stringify({
          ...attempt,
          user_id: this.currentUser.id
        }),
        }
      );

      console.log('✅ [FRONTEND] Topic attempt recorded:', result);
      
      if (result.success) {
        console.log('🎉 [FRONTEND] Topic attempt recorded successfully');
        if (result.data?.unlocked_content?.length > 0) {
          console.log('🔓 [FRONTEND] Unlocked content:', result.data.unlocked_content);
        }
        
        // Clear cache after recording attempt
        this.clearCache();
      } else {
        console.log('❌ [FRONTEND] Topic attempt recording failed:', result.error);
      }
      
      return result;

    } catch (error) {
      console.error('❌ [FRONTEND] Error recording topic attempt:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get comprehensive user progress data
   */
  async getUserProgress(): Promise<ProgressResponse> {
    console.log('🔄 [FRONTEND] getUserProgress called');
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!this.validateUserId(this.currentUser.id)) {
        throw new Error('Invalid user ID');
      }

      console.log('📈 [FRONTEND] Getting progress for user:', this.currentUser.id);
      console.log('📡 [FRONTEND] API URL:', `${BASE_API_URL}/api/progress/user-progress/${this.currentUser.id}`);

      const result = await this.makeApiRequest<ProgressResponse>(
        `${BASE_API_URL}/api/progress/user-progress/${this.currentUser.id}`,
        { method: 'GET' }
      );

      console.log('✅ [FRONTEND] User progress retrieved:', result);
      
      if (result.success && result.data) {
        const data = result.data;
        console.log('📊 [FRONTEND] Progress data summary:');
        console.log('   - Summary exists:', !!data.summary);
        console.log('   - Stages count:', data.stages?.length || 0);
        console.log('   - Exercises count:', data.exercises?.length || 0);
        console.log('   - Unlocks count:', data.unlocks?.length || 0);
      } else {
        console.log('❌ [FRONTEND] User progress retrieval failed:', result.error);
      }
      
      return result;

    } catch (error) {
      console.error('❌ [FRONTEND] Error getting user progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get comprehensive progress data for the progress page
   */
  async getComprehensiveProgress(): Promise<ProgressResponse> {
    console.log('🔄 [FRONTEND] getComprehensiveProgress called');
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!this.validateUserId(this.currentUser.id)) {
        throw new Error('Invalid user ID');
      }

      // Check cache first
      const cachedData = this.getCachedData('comprehensive_progress');
      if (cachedData) {
        return { success: true, data: cachedData };
      }

      console.log('📈 [FRONTEND] Getting comprehensive progress for user:', this.currentUser.id);
      console.log('📡 [FRONTEND] API URL:', `${BASE_API_URL}/api/progress/comprehensive-progress`);

      const result = await this.makeApiRequest<ProgressResponse>(
        `${BASE_API_URL}/api/progress/comprehensive-progress`,
        {
          method: 'POST',
          body: JSON.stringify({
            user_id: this.currentUser.id
          }),
        }
      );

      console.log('✅ [FRONTEND] Comprehensive progress retrieved:', result);
      
      if (result.success && result.data) {
        // Cache the result
        this.setCachedData('comprehensive_progress', result.data);
        
        const data = result.data as ProgressData;
        console.log('📊 [FRONTEND] Comprehensive progress summary:');
        console.log('   - Current stage:', data.current_stage?.name);
        console.log('   - Overall progress:', data.overall_progress);
        console.log('   - Streak days:', data.streak_days);
        console.log('   - Total practice time:', data.total_practice_time);
        console.log('   - Stages count:', data.stages?.length || 0);
        console.log('   - Achievements count:', data.achievements?.length || 0);
        console.log('   - Completed stages:', data.total_completed_stages);
        console.log('   - Completed exercises:', data.total_completed_exercises);
      } else {
        console.log('❌ [FRONTEND] Comprehensive progress retrieval failed:', result.error);
      }
      
      return result;

    } catch (error) {
      console.error('❌ [FRONTEND] Error getting comprehensive progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the current topic_id for a specific exercise
   */
  async getCurrentTopicForExercise(stageId: number, exerciseId: number): Promise<ProgressResponse> {
    console.log('🔄 [FRONTEND] getCurrentTopicForExercise called');
    console.log('📊 [FRONTEND] Exercise details:', { stage_id: stageId, exercise_id: exerciseId });
    
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!Number.isInteger(stageId) || stageId < 1 || stageId > 6) {
        throw new Error('Invalid stage_id (must be 1-6)');
      }

      if (!Number.isInteger(exerciseId) || exerciseId < 1 || exerciseId > 3) {
        throw new Error('Invalid exercise_id (must be 1-3)');
      }

      console.log('📡 [FRONTEND] API URL:', `${BASE_API_URL}/api/progress/get-current-topic`);

      const result = await this.makeApiRequest<ProgressResponse>(
        `${BASE_API_URL}/api/progress/get-current-topic`,
        {
        method: 'POST',
        body: JSON.stringify({
          user_id: this.currentUser.id,
          stage_id: stageId,
          exercise_id: exerciseId
        }),
        }
      );

      console.log('✅ [FRONTEND] Current topic result:', result);
      
      if (result.success) {
        const data = result.data;
        console.log('📊 [FRONTEND] Current topic data:');
        console.log('   - Current topic_id:', data.current_topic_id);
        console.log('   - Is new exercise:', data.is_new_exercise);
        console.log('   - Is completed:', data.is_completed);
      } else {
        console.log('❌ [FRONTEND] Get current topic failed:', result.error);
      }
      
      return result;

    } catch (error) {
      console.error('❌ [FRONTEND] Error getting current topic:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if user should unlock new content based on progress
   */
  async checkContentUnlocks(): Promise<ProgressResponse> {
    console.log('🔄 [FRONTEND] checkContentUnlocks called');
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!this.validateUserId(this.currentUser.id)) {
        throw new Error('Invalid user ID');
      }

      console.log('🔓 [FRONTEND] Checking content unlocks for user:', this.currentUser.id);
      console.log('📡 [FRONTEND] API URL:', `${BASE_API_URL}/api/progress/check-unlocks/${this.currentUser.id}`);

      const result = await this.makeApiRequest<ProgressResponse>(
        `${BASE_API_URL}/api/progress/check-unlocks/${this.currentUser.id}`,
        { method: 'POST' }
      );

      console.log('✅ [FRONTEND] Content unlock check result:', result);
      
      if (result.success) {
        const unlockedContent = result.data?.unlocked_content || [];
        if (unlockedContent.length > 0) {
          console.log('🎉 [FRONTEND] Unlocked content:', unlockedContent);
          this.clearCache(); // Clear cache when content is unlocked
        } else {
          console.log('ℹ️ [FRONTEND] No new content unlocked');
        }
      } else {
        console.log('❌ [FRONTEND] Content unlock check failed:', result.error);
      }
      
      return result;

    } catch (error) {
      console.error('❌ [FRONTEND] Error checking content unlocks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current user progress summary from Supabase directly
   */
  async getProgressSummary(): Promise<any> {
    console.log('🔄 [FRONTEND] getProgressSummary called');
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!this.validateUserId(this.currentUser.id)) {
        throw new Error('Invalid user ID');
      }

      console.log('🔍 [FRONTEND] Fetching progress summary from Supabase for user:', this.currentUser.id);

      const { data, error } = await supabase
        .from('ai_tutor_user_progress_summary')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();

      if (error) {
        console.log('❌ [FRONTEND] Supabase error:', error);
        throw error;
      }
      
      console.log('✅ [FRONTEND] Progress summary retrieved:', data);
      return data;

    } catch (error) {
      console.error('❌ [FRONTEND] Error getting progress summary:', error);
      return null;
    }
  }

  /**
   * Get exercise progress for a specific stage and exercise
   */
  async getExerciseProgress(stageId: number, exerciseId: number): Promise<any> {
    console.log('🔄 [FRONTEND] getExerciseProgress called');
    console.log('📊 [FRONTEND] Requesting progress for stage:', stageId, 'exercise:', exerciseId);
    
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!Number.isInteger(stageId) || stageId < 1 || stageId > 6) {
        throw new Error('Invalid stage_id (must be 1-6)');
      }

      if (!Number.isInteger(exerciseId) || exerciseId < 1 || exerciseId > 3) {
        throw new Error('Invalid exercise_id (must be 1-3)');
      }

      console.log('🔍 [FRONTEND] Fetching exercise progress from Supabase...');

      const { data, error } = await supabase
        .from('ai_tutor_user_exercise_progress')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .eq('stage_id', stageId)
        .eq('exercise_id', exerciseId)
        .single();

      if (error) {
        console.log('❌ [FRONTEND] Supabase error:', error);
        throw error;
      }
      
      console.log('✅ [FRONTEND] Exercise progress retrieved:', data);
      return data;

    } catch (error) {
      console.error('❌ [FRONTEND] Error getting exercise progress:', error);
      return null;
    }
  }

  /**
   * Check if content is unlocked for the user
   */
  async isContentUnlocked(stageId: number, exerciseId?: number): Promise<boolean> {
    console.log('🔄 [FRONTEND] isContentUnlocked called');
    console.log('📊 [FRONTEND] Checking unlock for stage:', stageId, 'exercise:', exerciseId);
    
    try {
      await this.ensureInitialized();
      
      if (!this.currentUser?.id) {
        console.log('❌ [FRONTEND] User not authenticated');
        return false;
      }

      if (!Number.isInteger(stageId) || stageId < 1 || stageId > 6) {
        console.log('❌ [FRONTEND] Invalid stage_id:', stageId);
        return false;
      }

      if (exerciseId !== undefined && (!Number.isInteger(exerciseId) || exerciseId < 1 || exerciseId > 3)) {
        console.log('❌ [FRONTEND] Invalid exercise_id:', exerciseId);
        return false;
      }

      console.log('🔍 [FRONTEND] Fetching unlock status from Supabase...');

      const { data, error } = await supabase
        .from('ai_tutor_learning_unlocks')
        .select('is_unlocked')
        .eq('user_id', this.currentUser.id)
        .eq('stage_id', stageId)
        .eq('exercise_id', exerciseId || null)
        .single();

      if (error) {
        console.log('❌ [FRONTEND] Supabase error:', error);
        return false;
      }
      
      const isUnlocked = data?.is_unlocked || false;
      console.log('✅ [FRONTEND] Content unlock status:', isUnlocked);
      return isUnlocked;

    } catch (error) {
      console.error('❌ [FRONTEND] Error checking content unlock status:', error);
      return false;
    }
  }

  /**
   * Update current user reference (call this when user logs in/out)
   */
  async updateCurrentUser() {
    console.log('🔄 [FRONTEND] updateCurrentUser called');
    try {
      await this.initializeUser();
      this.clearCache(); // Clear cache when user changes
    } catch (error) {
      console.error('❌ [FRONTEND] Error updating current user:', error);
      // Reset initialization state on error
      this.isInitialized = false;
      this.currentUser = null;
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    const userId = this.currentUser?.id || null;
    console.log('🔄 [FRONTEND] getCurrentUserId called, returning:', userId);
    return userId;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const isAuth = !!this.currentUser?.id;
    console.log('🔄 [FRONTEND] isAuthenticated called, returning:', isAuth);
    return isAuth;
  }

  /**
   * Clear all cached data
   */
  clearAllCache(): void {
    this.clearCache();
  }

  /**
   * Force refresh progress data (clears cache and fetches fresh data)
   */
  async forceRefreshProgress(): Promise<ProgressResponse> {
    console.log('🔄 [FRONTEND] Force refreshing progress data...');
    this.clearCache();
    return this.getComprehensiveProgress();
  }
}

// Export singleton instance
export const progressTracker = ProgressTracker.getInstance();

// Export helper functions for common progress tracking scenarios
export const ProgressHelpers = {
  /**
   * Record a repeat after me exercise attempt
   */
  async recordRepeatAfterMeAttempt(
    phraseId: number,
    score: number,
    urduUsed: boolean,
    timeSpentSeconds: number,
    completed: boolean
  ): Promise<ProgressResponse> {
    console.log('🔄 [HELPER] recordRepeatAfterMeAttempt called');
    console.log('📊 [HELPER] Attempt details:', {
      phraseId,
      score,
      urduUsed,
      timeSpentSeconds,
      completed
    });
    
    try {
      const result = await progressTracker.recordTopicAttempt({
        user_id: progressTracker.getCurrentUserId() || '',
        stage_id: 1,
        exercise_id: 1,
        topic_id: phraseId,
        score,
        urdu_used: urduUsed,
        time_spent_seconds: timeSpentSeconds,
        completed
      });
      
      console.log('✅ [HELPER] recordRepeatAfterMeAttempt completed:', result);
      return result;
    } catch (error) {
      console.error('❌ [HELPER] Error in recordRepeatAfterMeAttempt:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Get current progress for repeat after me exercise
   */
  async getRepeatAfterMeProgress(): Promise<any> {
    console.log('🔄 [HELPER] getRepeatAfterMeProgress called');
    try {
      const result = await progressTracker.getExerciseProgress(1, 1);
      console.log('✅ [HELPER] getRepeatAfterMeProgress completed:', result);
      return result;
    } catch (error) {
      console.error('❌ [HELPER] Error in getRepeatAfterMeProgress:', error);
      return null;
    }
  },

  /**
   * Check if repeat after me exercise is unlocked
   */
  async isRepeatAfterMeUnlocked(): Promise<boolean> {
    console.log('🔄 [HELPER] isRepeatAfterMeUnlocked called');
    try {
      const result = await progressTracker.isContentUnlocked(1, 1);
      console.log('✅ [HELPER] isRepeatAfterMeUnlocked completed:', result);
      return result;
    } catch (error) {
      console.error('❌ [HELPER] Error in isRepeatAfterMeUnlocked:', error);
      return false;
    }
  },

  /**
   * Get current topic for a specific exercise
   */
  async getCurrentTopicForExercise(stageId: number, exerciseId: number): Promise<ProgressResponse> {
    console.log('🔄 [HELPER] getCurrentTopicForExercise called');
    try {
      const result = await progressTracker.getCurrentTopicForExercise(stageId, exerciseId);
      console.log('✅ [HELPER] getCurrentTopicForExercise completed:', result);
      return result;
    } catch (error) {
      console.error('❌ [HELPER] Error in getCurrentTopicForExercise:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Initialize progress for new users
   */
  async initializeProgressForNewUser(): Promise<ProgressResponse> {
    console.log('🔄 [HELPER] initializeProgressForNewUser called');
    try {
      const result = await progressTracker.initializeUserProgress();
      console.log('✅ [HELPER] initializeProgressForNewUser completed:', result);
      return result;
    } catch (error) {
      console.error('❌ [HELPER] Error in initializeProgressForNewUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Get comprehensive progress data for the progress page
   */
  async getComprehensiveProgress(): Promise<ProgressResponse> {
    console.log('🔄 [HELPER] getComprehensiveProgress called');
    try {
      const result = await progressTracker.getComprehensiveProgress();
      console.log('✅ [HELPER] getComprehensiveProgress completed:', result);
      return result;
    } catch (error) {
      console.error('❌ [HELPER] Error in getComprehensiveProgress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Force refresh progress data
   */
  async forceRefreshProgress(): Promise<ProgressResponse> {
    console.log('🔄 [HELPER] forceRefreshProgress called');
    try {
      const result = await progressTracker.forceRefreshProgress();
      console.log('✅ [HELPER] forceRefreshProgress completed:', result);
      return result;
    } catch (error) {
      console.error('❌ [HELPER] Error in forceRefreshProgress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}; 