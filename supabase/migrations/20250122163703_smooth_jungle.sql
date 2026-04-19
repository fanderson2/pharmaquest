/*
  # Add Progress Summary Table and Update Policies
  
  1. New Tables
    - `user_progress_summary` for storing section-level progress
  
  2. Changes
    - Add triggers for updating timestamps
    - Add policies for the new table
    
  3. Safety Checks
    - Check for existing policies before creating
*/

-- User Progress Summary Table
CREATE TABLE IF NOT EXISTS user_progress_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  section_id text NOT NULL,
  progress_percentage integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Enable RLS for new table
ALTER TABLE user_progress_summary ENABLE ROW LEVEL SECURITY;

-- Policies for user_progress_summary
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress_summary' 
    AND policyname = 'Users can read own progress summary'
  ) THEN
    CREATE POLICY "Users can read own progress summary"
      ON user_progress_summary
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress_summary' 
    AND policyname = 'Users can insert own progress summary'
  ) THEN
    CREATE POLICY "Users can insert own progress summary"
      ON user_progress_summary
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress_summary' 
    AND policyname = 'Users can update own progress summary'
  ) THEN
    CREATE POLICY "Users can update own progress summary"
      ON user_progress_summary
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create trigger for user_progress_summary
CREATE TRIGGER update_user_progress_summary_updated_at
  BEFORE UPDATE ON user_progress_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();