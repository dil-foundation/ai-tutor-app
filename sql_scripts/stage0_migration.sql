-- =============================================================================
-- AI English Tutor - Stage 0 Schema Migration Script (v2)
-- =============================================================================
-- This script safely modifies the existing 'ai_tutor_content_hierarchy' table
-- to support Stage 0 lessons.
--
-- It performs three main actions:
-- 1. Adds 'lesson' as a valid 'exercise_type'.
-- 2. ADDS a UNIQUE constraint to 'hierarchy_path' to enforce data integrity.
-- 3. Inserts the 'Stage 0' record idempotently.
--
-- This script is idempotent and can be run safely multiple times.
-- =============================================================================

-- Step 1: Update the CHECK constraint for 'exercise_type' to include 'lesson'.
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the name of the CHECK constraint on the 'exercise_type' column by inspecting its definition.
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.ai_tutor_content_hierarchy'::regclass
      AND pg_get_constraintdef(oid) LIKE '%exercise_type%';

    -- If the constraint exists, drop it so we can re-create it with the new value.
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.ai_tutor_content_hierarchy DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
END;
$$;

-- Add a new CHECK constraint that includes 'lesson' as a valid exercise_type.
ALTER TABLE public.ai_tutor_content_hierarchy
ADD CONSTRAINT ai_tutor_content_hierarchy_exercise_type_check
CHECK (exercise_type IN (
    'lesson', 'pronunciation', 'response', 'dialogue', 'narration', 'conversation', 
    'roleplay', 'storytelling', 'discussion', 'problem_solving', 'presentation', 
    'negotiation', 'leadership', 'debate', 'academic', 'interview', 
    'spontaneous', 'diplomatic', 'academic_debate'
));

-- Step 2: Add a UNIQUE constraint to the 'hierarchy_path' column.
-- This is required for the ON CONFLICT clause to work and ensures data integrity.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.ai_tutor_content_hierarchy'::regclass
        AND conname = 'ai_tutor_content_hierarchy_hierarchy_path_key'
        AND contype = 'u'
    ) THEN
        ALTER TABLE public.ai_tutor_content_hierarchy ADD CONSTRAINT ai_tutor_content_hierarchy_hierarchy_path_key UNIQUE (hierarchy_path);
    END IF;
END;
$$;


-- Step 3: Insert Stage 0 into the content hierarchy.
-- The ON CONFLICT clause prevents errors if this script is run more than once.
INSERT INTO public.ai_tutor_content_hierarchy 
    (level, hierarchy_path, parent_id, title, title_urdu, description, description_urdu, stage_number, difficulty_level, stage_order) 
VALUES
    ('stage', '0', NULL, 'Beginner Lessons', 'ابتدائی اسباق', 'Start your English learning journey with basic fundamentals', 'بنیادی بنیادی باتوں کے ساتھ اپنے انگریزی سیکھنے کا سفر شروع کریں۔', 0, 'A1', 0)
ON CONFLICT (hierarchy_path) DO NOTHING;

-- Verification
SELECT 'Schema migration for Stage 0 has been applied successfully.' as result;
