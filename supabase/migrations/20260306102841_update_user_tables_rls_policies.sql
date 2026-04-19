/*
  # Update RLS Policies for User Tables

  ## Security Updates
  - Ensure strict RLS policies on user_progress table
  - Ensure strict RLS policies on srs_data table
  - Ensure strict RLS policies on user_progress_summary table
  - Add unique constraints for data integrity
  - Add triggers for auto-updating timestamps

  ## Changes
  1. Drop and recreate RLS policies with correct authentication checks
  2. Add unique constraints to prevent duplicate entries
  3. Add updated_at triggers
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

DROP POLICY IF EXISTS "Users can read own SRS data" ON srs_data;
DROP POLICY IF EXISTS "Users can insert own SRS data" ON srs_data;
DROP POLICY IF EXISTS "Users can update own SRS data" ON srs_data;

DROP POLICY IF EXISTS "Users can read own progress summary" ON user_progress_summary;
DROP POLICY IF EXISTS "Users can insert own progress summary" ON user_progress_summary;
DROP POLICY IF EXISTS "Users can update own progress summary" ON user_progress_summary;

-- Add unique constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_progress_unique_constraint'
  ) THEN
    ALTER TABLE user_progress 
    ADD CONSTRAINT user_progress_unique_constraint 
    UNIQUE (user_id, section_id, topic_id, question_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'srs_data_unique_constraint'
  ) THEN
    ALTER TABLE srs_data 
    ADD CONSTRAINT srs_data_unique_constraint 
    UNIQUE (user_id, question_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_progress_summary_unique_constraint'
  ) THEN
    ALTER TABLE user_progress_summary 
    ADD CONSTRAINT user_progress_summary_unique_constraint 
    UNIQUE (user_id, section_id);
  END IF;
END $$;

-- RLS Policies for user_progress
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for srs_data
CREATE POLICY "Users can read own SRS data"
  ON srs_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SRS data"
  ON srs_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SRS data"
  ON srs_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own SRS data"
  ON srs_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_progress_summary
CREATE POLICY "Users can read own progress summary"
  ON user_progress_summary FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress summary"
  ON user_progress_summary FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress summary"
  ON user_progress_summary FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress summary"
  ON user_progress_summary FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_srs_data_updated_at ON srs_data;
CREATE TRIGGER update_srs_data_updated_at
  BEFORE UPDATE ON srs_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_summary_updated_at ON user_progress_summary;
CREATE TRIGGER update_user_progress_summary_updated_at
  BEFORE UPDATE ON user_progress_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();