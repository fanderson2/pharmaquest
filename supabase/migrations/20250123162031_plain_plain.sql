/*
  # Add public read access to question_table

  1. Security
    - Enable RLS on question_table
    - Add policy for public read access to questions
*/

-- Enable RLS
ALTER TABLE question_table ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access
CREATE POLICY "Allow public read access to questions"
  ON question_table
  FOR SELECT
  TO public
  USING (true);