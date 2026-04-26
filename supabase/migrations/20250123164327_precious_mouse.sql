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

-- Enable RLS (idempotent)
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access (guard against duplicate from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'topics'
      AND policyname = 'Allow public read access to topics'
  ) THEN
    CREATE POLICY "Allow public read access to topics"
      ON topics FOR SELECT TO public USING (true);
  END IF;
END $$;

-- Add updated_at trigger (guard against duplicate)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_topics_updated_at'
  ) THEN
    CREATE TRIGGER update_topics_updated_at
      BEFORE UPDATE ON topics
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;