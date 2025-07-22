-- Database Setup for DIL Tutor App
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create the app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    grade TEXT,
    teacher_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        role,
        grade,
        first_name,
        last_name,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')::app_role,
        NEW.raw_user_meta_data->>'grade',
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create a function to update profile when user metadata changes
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles SET
        email = NEW.email,
        role = COALESCE(NEW.raw_user_meta_data->>'role', 'student')::app_role,
        grade = NEW.raw_user_meta_data->>'grade',
        first_name = NEW.raw_user_meta_data->>'first_name',
        last_name = NEW.raw_user_meta_data->>'last_name',
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to update profile when user metadata changes
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- 8. Create RLS policies for profiles table

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow profile view based on role (for admin/teacher access)
CREATE POLICY "Allow profile view based on role" ON public.profiles
    FOR SELECT USING (
        ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text) OR 
        (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'teacher'::text) OR 
        (auth.uid() = id) OR 
        ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'student'::text) AND (role = 'teacher'::app_role))
    );

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_grade_idx ON public.profiles(grade);

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 11. Create a function to get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    id UUID,
    email TEXT,
    role app_role,
    grade TEXT,
    teacher_id TEXT,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.role,
        p.grade,
        p.teacher_id,
        p.first_name,
        p.last_name,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon, authenticated;

-- ============================================================================
-- PROGRESS TRACKING TABLES
-- ============================================================================

-- 12. Create user progress summary table
CREATE TABLE IF NOT EXISTS public.ai_tutor_user_progress_summary (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_stage INTEGER NOT NULL DEFAULT 1,
    current_exercise INTEGER NOT NULL DEFAULT 1,
    topic_id INTEGER NOT NULL DEFAULT 1,
    urdu_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    unlocked_stages INTEGER[] NOT NULL DEFAULT '{1}',
    unlocked_exercises JSONB NOT NULL DEFAULT '{"1": [1]}',
    overall_progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_time_spent_minutes INTEGER NOT NULL DEFAULT 0,
    total_exercises_completed INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    average_session_duration_minutes DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    weekly_learning_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    monthly_learning_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    first_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 13. Create user stage progress table
CREATE TABLE IF NOT EXISTS public.ai_tutor_user_stage_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    total_time_minutes INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    exercises_completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, stage_id)
);

-- 14. Create user exercise progress table
CREATE TABLE IF NOT EXISTS public.ai_tutor_user_exercise_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    total_time_minutes INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    best_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    scores DECIMAL(5,2)[] NOT NULL DEFAULT '{}',
    urdu_used BOOLEAN[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, stage_id, exercise_id)
);

-- 15. Create user topic progress table
CREATE TABLE IF NOT EXISTS public.ai_tutor_user_topic_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    attempt_num INTEGER NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    urdu_used BOOLEAN NOT NULL DEFAULT FALSE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    total_time_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Create learning unlocks table
CREATE TABLE IF NOT EXISTS public.ai_tutor_learning_unlocks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    exercise_id INTEGER,
    is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlock_criteria_met BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    unlocked_by_criteria TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, stage_id, exercise_id)
);

-- 17. Create daily learning analytics table
CREATE TABLE IF NOT EXISTS public.ai_tutor_daily_learning_analytics (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_time_minutes INTEGER NOT NULL DEFAULT 0,
    exercises_completed INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    urdu_usage_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    urdu_usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 18. Create weekly progress summary table
CREATE TABLE IF NOT EXISTS public.ai_tutor_weekly_progress_summary (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_time_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    exercises_completed INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    streak_maintained BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- 19. Create learning milestones table
CREATE TABLE IF NOT EXISTS public.ai_tutor_learning_milestones (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL,
    milestone_name TEXT NOT NULL,
    milestone_description TEXT,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    criteria_met TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, milestone_type, milestone_name)
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY FOR ALL PROGRESS TABLES
-- ============================================================================

ALTER TABLE public.ai_tutor_user_progress_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_user_stage_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_user_exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_learning_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_daily_learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_weekly_progress_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_learning_milestones ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR PROGRESS TABLES (SERVICE KEY COMPATIBLE)
-- ============================================================================

-- Policy for ai_tutor_user_progress_summary
CREATE POLICY "Users can insert own progress summary" ON public.ai_tutor_user_progress_summary
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can view own progress summary" ON public.ai_tutor_user_progress_summary
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can update own progress summary" ON public.ai_tutor_user_progress_summary
    FOR UPDATE USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

-- Policy for ai_tutor_user_stage_progress
CREATE POLICY "Users can insert own stage progress" ON public.ai_tutor_user_stage_progress
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can view own stage progress" ON public.ai_tutor_user_stage_progress
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can update own stage progress" ON public.ai_tutor_user_stage_progress
    FOR UPDATE USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

-- Policy for ai_tutor_user_exercise_progress
CREATE POLICY "Users can insert own exercise progress" ON public.ai_tutor_user_exercise_progress
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can view own exercise progress" ON public.ai_tutor_user_exercise_progress
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can update own exercise progress" ON public.ai_tutor_user_exercise_progress
    FOR UPDATE USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

-- Policy for ai_tutor_user_topic_progress
CREATE POLICY "Users can insert own topic progress" ON public.ai_tutor_user_topic_progress
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can view own topic progress" ON public.ai_tutor_user_topic_progress
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

-- Policy for ai_tutor_learning_unlocks
CREATE POLICY "Users can insert own learning unlocks" ON public.ai_tutor_learning_unlocks
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can view own learning unlocks" ON public.ai_tutor_learning_unlocks
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can update own learning unlocks" ON public.ai_tutor_learning_unlocks
    FOR UPDATE USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

-- Policy for ai_tutor_daily_learning_analytics
CREATE POLICY "Users can insert own daily analytics" ON public.ai_tutor_daily_learning_analytics
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can view own daily analytics" ON public.ai_tutor_daily_learning_analytics
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can update own daily analytics" ON public.ai_tutor_daily_learning_analytics
    FOR UPDATE USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

-- Policy for ai_tutor_weekly_progress_summary
CREATE POLICY "Users can insert own weekly summary" ON public.ai_tutor_weekly_progress_summary
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can view own weekly summary" ON public.ai_tutor_weekly_progress_summary
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can update own weekly summary" ON public.ai_tutor_weekly_progress_summary
    FOR UPDATE USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

-- Policy for ai_tutor_learning_milestones
CREATE POLICY "Users can insert own milestones" ON public.ai_tutor_learning_milestones
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

CREATE POLICY "Users can view own milestones" ON public.ai_tutor_learning_milestones
    FOR SELECT USING (
        (auth.uid() = user_id) OR 
        (auth.role() = 'service_role')
    );

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for ai_tutor_user_progress_summary
CREATE INDEX IF NOT EXISTS idx_progress_summary_user_id ON public.ai_tutor_user_progress_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_summary_current_stage ON public.ai_tutor_user_progress_summary(current_stage);

-- Indexes for ai_tutor_user_stage_progress
CREATE INDEX IF NOT EXISTS idx_stage_progress_user_id ON public.ai_tutor_user_stage_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_progress_stage_id ON public.ai_tutor_user_stage_progress(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_progress_user_stage ON public.ai_tutor_user_stage_progress(user_id, stage_id);

-- Indexes for ai_tutor_user_exercise_progress
CREATE INDEX IF NOT EXISTS idx_exercise_progress_user_id ON public.ai_tutor_user_exercise_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_progress_stage_exercise ON public.ai_tutor_user_exercise_progress(stage_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_progress_user_stage_exercise ON public.ai_tutor_user_exercise_progress(user_id, stage_id, exercise_id);

-- Indexes for ai_tutor_user_topic_progress
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON public.ai_tutor_user_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_stage_exercise_topic ON public.ai_tutor_user_topic_progress(stage_id, exercise_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_stage_exercise_topic ON public.ai_tutor_user_topic_progress(user_id, stage_id, exercise_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_created_at ON public.ai_tutor_user_topic_progress(created_at);

-- Indexes for ai_tutor_learning_unlocks
CREATE INDEX IF NOT EXISTS idx_learning_unlocks_user_id ON public.ai_tutor_learning_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_unlocks_stage_exercise ON public.ai_tutor_learning_unlocks(stage_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_learning_unlocks_user_stage_exercise ON public.ai_tutor_learning_unlocks(user_id, stage_id, exercise_id);

-- Indexes for ai_tutor_daily_learning_analytics
CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_id ON public.ai_tutor_daily_learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.ai_tutor_daily_learning_analytics(date);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_date ON public.ai_tutor_daily_learning_analytics(user_id, date);

-- Indexes for ai_tutor_weekly_progress_summary
CREATE INDEX IF NOT EXISTS idx_weekly_summary_user_id ON public.ai_tutor_weekly_progress_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summary_week_start ON public.ai_tutor_weekly_progress_summary(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_summary_user_week ON public.ai_tutor_weekly_progress_summary(user_id, week_start_date);

-- Indexes for ai_tutor_learning_milestones
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.ai_tutor_learning_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON public.ai_tutor_learning_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_milestones_user_type ON public.ai_tutor_learning_milestones(user_id, milestone_type);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for all progress tables
GRANT ALL ON public.ai_tutor_user_progress_summary TO anon, authenticated;
GRANT ALL ON public.ai_tutor_user_stage_progress TO anon, authenticated;
GRANT ALL ON public.ai_tutor_user_exercise_progress TO anon, authenticated;
GRANT ALL ON public.ai_tutor_user_topic_progress TO anon, authenticated;
GRANT ALL ON public.ai_tutor_learning_unlocks TO anon, authenticated;
GRANT ALL ON public.ai_tutor_daily_learning_analytics TO anon, authenticated;
GRANT ALL ON public.ai_tutor_weekly_progress_summary TO anon, authenticated;
GRANT ALL ON public.ai_tutor_learning_milestones TO anon, authenticated;

-- Grant permissions for sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate overall progress percentage
CREATE OR REPLACE FUNCTION public.calculate_overall_progress(user_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_stages INTEGER := 6;
    completed_stages INTEGER;
    progress_percentage DECIMAL(5,2);
BEGIN
    -- Count completed stages
    SELECT COUNT(*) INTO completed_stages
    FROM public.ai_tutor_user_stage_progress
    WHERE user_id = user_uuid AND completed = TRUE;
    
    -- Calculate percentage
    progress_percentage := (completed_stages::DECIMAL / total_stages::DECIMAL) * 100;
    
    RETURN COALESCE(progress_percentage, 0.00);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user progress summary
CREATE OR REPLACE FUNCTION public.update_user_progress_summary(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.ai_tutor_user_progress_summary
    SET 
        overall_progress_percentage = public.calculate_overall_progress(user_uuid),
        updated_at = NOW()
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.calculate_overall_progress(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_progress_summary(UUID) TO anon, authenticated; 