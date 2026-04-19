/*
  # Create questions table

  1. New Tables
    - `question_table`
      - `id` (uuid, primary key)
      - `question_id` (text, unique)
      - `topic_id` (text)
      - `question_text` (text)
      - `option_1` (text)
      - `option_2` (text)
      - `option_3` (text)
      - `option_4` (text)
      - `option_5` (text)
      - `correct_answer` (text)
      - `explanation` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `question_table`
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS question_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text UNIQUE NOT NULL,
  topic_id text NOT NULL,
  question_text text NOT NULL,
  option_1 text NOT NULL,
  option_2 text NOT NULL,
  option_3 text NOT NULL,
  option_4 text NOT NULL,
  option_5 text,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE question_table ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access
CREATE POLICY "Allow public read access to questions"
  ON question_table
  FOR SELECT
  TO public
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_question_table_updated_at
  BEFORE UPDATE ON question_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();