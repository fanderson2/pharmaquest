/*
  # Add public read access to question_table

  1. Security
    - Enable RLS on question_table
    - Add policy for public read access to questions

  NOTE: question_table may not exist yet on a fresh project (it is created in a
  later migration). The DO block below skips gracefully if the table is absent.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'question_table'
  ) THEN
    ALTER TABLE question_table ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'question_table'
        AND policyname = 'Allow public read access to questions'
    ) THEN
      CREATE POLICY "Allow public read access to questions"
        ON question_table
        FOR SELECT
        TO public
        USING (true);
    END IF;
  END IF;
END $$;