/*
  # Initial Schema Setup

  1. New Tables
    - `user_progress`
      - `user_id` (uuid, references auth.users)
      - `section_id` (text)
      - `topic_id` (text)
      - `question_id` (text)
      - `completed` (boolean)
      - `correct` (boolean)
      - `attempts` (integer)
      - `last_attempted` (timestamptz)
    
    - `srs_data`
      - `user_id` (uuid, references auth.users)
      - `question_id` (text)
      - `repetition_count` (integer)
      - `interval` (integer)
      - `easiness_factor` (decimal)
      - `next_review_date` (timestamptz)
      - `last_review_date` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  section_id text NOT NULL,
  topic_id text NOT NULL,
  question_id text NOT NULL,
  completed boolean DEFAULT false,
  correct boolean DEFAULT false,
  attempts integer DEFAULT 0,
  last_attempted timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, section_id, topic_id, question_id)
);

-- SRS Data Table
CREATE TABLE IF NOT EXISTS srs_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  question_id text NOT NULL,
  repetition_count integer DEFAULT 0,
  interval integer DEFAULT 1,
  easiness_factor decimal DEFAULT 2.5,
  next_review_date timestamptz DEFAULT now(),
  last_review_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_progress
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for srs_data
CREATE POLICY "Users can read own SRS data"
  ON srs_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SRS data"
  ON srs_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SRS data"
  ON srs_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_srs_data_updated_at
  BEFORE UPDATE ON srs_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();