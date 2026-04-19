/*
  # Optimize RLS Policies and Fix Database Security Issues

  ## Performance Optimizations
  1. Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents re-evaluation for each row, improving query performance at scale
  
  ## Index Cleanup
  1. Drop duplicate constraints (keeping the named ones, removing auto-generated)
  2. Drop unused indexes
  
  ## Security Improvements
  1. Restrict topics and questions modification to service role only
  2. Fix function search paths to prevent SQL injection
  
  ## Changes Made
  - Recreate all RLS policies with optimized auth function calls
  - Remove duplicate unique constraints
  - Remove unused indexes
  - Secure topics and questions tables properly
  - Fix function security settings
*/

-- Drop all existing RLS policies to recreate them optimized
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;

DROP POLICY IF EXISTS "Users can read own SRS data" ON srs_data;
DROP POLICY IF EXISTS "Users can insert own SRS data" ON srs_data;
DROP POLICY IF EXISTS "Users can update own SRS data" ON srs_data;
DROP POLICY IF EXISTS "Users can delete own SRS data" ON srs_data;

DROP POLICY IF EXISTS "Users can read own progress summary" ON user_progress_summary;
DROP POLICY IF EXISTS "Users can insert own progress summary" ON user_progress_summary;
DROP POLICY IF EXISTS "Users can update own progress summary" ON user_progress_summary;
DROP POLICY IF EXISTS "Users can delete own progress summary" ON user_progress_summary;

DROP POLICY IF EXISTS "Authenticated users can insert topics" ON topics;
DROP POLICY IF EXISTS "Authenticated users can update topics" ON topics;

DROP POLICY IF EXISTS "Authenticated users can insert questions" ON question_table;
DROP POLICY IF EXISTS "Authenticated users can update questions" ON question_table;

-- Optimized RLS Policies for user_progress (using select for auth.uid())
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Optimized RLS Policies for srs_data
CREATE POLICY "Users can read own SRS data"
  ON srs_data FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own SRS data"
  ON srs_data FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own SRS data"
  ON srs_data FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own SRS data"
  ON srs_data FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Optimized RLS Policies for user_progress_summary
CREATE POLICY "Users can read own progress summary"
  ON user_progress_summary FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress summary"
  ON user_progress_summary FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own progress summary"
  ON user_progress_summary FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own progress summary"
  ON user_progress_summary FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Secure topics and questions tables (read-only for users)
-- Only service role can modify these tables for data integrity
CREATE POLICY "Service role can insert topics"
  ON topics FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update topics"
  ON topics FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can insert questions"
  ON question_table FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update questions"
  ON question_table FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Drop duplicate constraints (keep named ones, drop auto-generated)
ALTER TABLE srs_data DROP CONSTRAINT IF EXISTS srs_data_user_id_question_id_key;
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_section_id_topic_id_question_id_key;
ALTER TABLE user_progress_summary DROP CONSTRAINT IF EXISTS user_progress_summary_user_id_section_id_key;

-- Drop unused indexes
DROP INDEX IF EXISTS idx_topics_topic_id;
DROP INDEX IF EXISTS idx_questions_question_id;

-- Fix function security by setting stable search path
ALTER FUNCTION update_updated_at_column() SECURITY DEFINER SET search_path = public, pg_temp;

-- Check if update_updated_at function exists and fix it too
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    ALTER FUNCTION update_updated_at() SECURITY DEFINER SET search_path = public, pg_temp;
  END IF;
END $$;