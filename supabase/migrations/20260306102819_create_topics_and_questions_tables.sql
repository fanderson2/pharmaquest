/*
  # Create Topics and Questions Tables

  ## New Tables
  
  ### `topics`
  - `id` (uuid, primary key) - Unique identifier
  - `section_id` (text) - Section identifier (e.g., 'BNF', 'T100')
  - `section_title` (text) - Section display name
  - `topic_id` (text) - Topic identifier
  - `topic_title` (text) - Topic display name
  - `subtopic` (text, nullable) - Optional subtopic name
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `question_table`
  - `id` (uuid, primary key) - Unique identifier
  - `question_id` (text, unique) - Question identifier
  - `topic_id` (text) - Related topic
  - `question_text` (text) - The question
  - `option_1` through `option_5` (text) - Answer options
  - `correct_answer` (text) - The correct answer
  - `explanation` (text) - Explanation of the answer
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  - Enable RLS on both tables
  - Allow public read access for topics and questions (educational content)
  - Only authenticated users can create/update (for future admin features)
*/

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  section_title text NOT NULL,
  topic_id text NOT NULL,
  topic_title text NOT NULL,
  subtopic text,
  created_at timestamptz DEFAULT now()
);

-- Create question_table
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
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_topics_section_id ON topics(section_id);
CREATE INDEX IF NOT EXISTS idx_topics_topic_id ON topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON question_table(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_id ON question_table(question_id);

-- Enable Row Level Security
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_table ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics table
-- Allow anyone to read topics (public educational content)
CREATE POLICY "Anyone can read topics"
  ON topics FOR SELECT
  USING (true);

-- Only authenticated users can insert topics (for future admin features)
CREATE POLICY "Authenticated users can insert topics"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update topics
CREATE POLICY "Authenticated users can update topics"
  ON topics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for question_table
-- Allow anyone to read questions (public educational content)
CREATE POLICY "Anyone can read questions"
  ON question_table FOR SELECT
  USING (true);

-- Only authenticated users can insert questions (for future admin features)
CREATE POLICY "Authenticated users can insert questions"
  ON question_table FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update questions
CREATE POLICY "Authenticated users can update questions"
  ON question_table FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);