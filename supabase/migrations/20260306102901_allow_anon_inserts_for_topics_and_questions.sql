/*
  # Allow Anonymous Inserts for Topics and Questions (Temporary for Import)

  ## Changes
  - Allow anonymous role to insert topics and questions
  - This is temporary to allow the import scripts to run
  - Can be reverted after import is complete

  ## Security Note
  - This is for initial data seeding only
  - In production, you should remove these policies and use service role for imports
*/

-- Allow anonymous inserts for topics (temporary for import)
DROP POLICY IF EXISTS "Anonymous can insert topics" ON topics;
CREATE POLICY "Anonymous can insert topics"
  ON topics FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anonymous can delete topics" ON topics;
CREATE POLICY "Anonymous can delete topics"
  ON topics FOR DELETE
  TO anon
  USING (true);

-- Allow anonymous inserts for questions (temporary for import)
DROP POLICY IF EXISTS "Anonymous can insert questions" ON question_table;
CREATE POLICY "Anonymous can insert questions"
  ON question_table FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anonymous can delete questions" ON question_table;
CREATE POLICY "Anonymous can delete questions"
  ON question_table FOR DELETE
  TO anon
  USING (true);