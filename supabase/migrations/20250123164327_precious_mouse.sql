/*
  # Create topics table and enable public access

  1. New Tables
    - `topics`
      - `id` (uuid, primary key)
      - `section_id` (text)
      - `section_title` (text)
      - `topic_id` (text)
      - `topic_title` (text)
      - `subtopic` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on topics table
    - Add policy for public read access
*/

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  section_title text NOT NULL,
  topic_id text NOT NULL,
  topic_title text NOT NULL,
  subtopic text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access
CREATE POLICY "Allow public read access to topics"
  ON topics
  FOR SELECT
  TO public
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();