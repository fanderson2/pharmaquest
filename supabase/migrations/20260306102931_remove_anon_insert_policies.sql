/*
  # Remove Anonymous Insert Policies

  ## Security Update
  - Remove temporary anonymous insert/delete policies for topics and questions
  - Keep only read access for anonymous users
  - Only authenticated users can modify data

  ## Changes
  - Drop anonymous insert and delete policies
  - Database is now properly secured
*/

-- Remove anonymous insert and delete policies for topics
DROP POLICY IF EXISTS "Anonymous can insert topics" ON topics;
DROP POLICY IF EXISTS "Anonymous can delete topics" ON topics;

-- Remove anonymous insert and delete policies for questions
DROP POLICY IF EXISTS "Anonymous can insert questions" ON question_table;
DROP POLICY IF EXISTS "Anonymous can delete questions" ON question_table;