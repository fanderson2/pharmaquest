-- ═══════════════════════════════════════════════════════════════════════
-- Gamification: streaks, weakness heatmap, leaderboard, exam readiness
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. Profiles additions ───────────────────────────────────────────────
-- exam_date already exists on profiles; all other columns are new.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_streak      INTEGER  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak      INTEGER  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date    DATE,
  ADD COLUMN IF NOT EXISTS total_xp            INTEGER  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN  NOT NULL DEFAULT true;

-- ─── 2. quiz_attempts ────────────────────────────────────────────────────
-- question_id is TEXT to match question_table.question_id (the app's natural key).
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id        TEXT        NOT NULL,
  topic              TEXT        NOT NULL,
  user_answer        TEXT,
  is_correct         BOOLEAN     NOT NULL,
  time_taken_seconds INTEGER,
  attempted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_time
  ON quiz_attempts (user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_topic
  ON quiz_attempts (user_id, topic);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can read own quiz attempts"
  ON quiz_attempts FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ─── 3. xp_events ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xp_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     INTEGER     NOT NULL,
  reason     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user
  ON xp_events (user_id, created_at DESC);

ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own xp events"
  ON xp_events FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can read own xp events"
  ON xp_events FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ─── 4. question_mastery ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_mastery (
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id    TEXT        NOT NULL,
  mastery_score  INTEGER     NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 5),
  last_attempted TIMESTAMPTZ,
  PRIMARY KEY (user_id, question_id)
);

ALTER TABLE question_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own mastery"
  ON question_mastery FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can read own mastery"
  ON question_mastery FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own mastery"
  ON question_mastery FOR UPDATE TO authenticated
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ─── 5. readiness_history ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS readiness_history (
  id            UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score         INTEGER  NOT NULL CHECK (score BETWEEN 0 AND 100),
  calculated_at DATE     NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, calculated_at)   -- one row per user per day
);

CREATE INDEX IF NOT EXISTS idx_readiness_history_user
  ON readiness_history (user_id, calculated_at DESC);


ALTER TABLE readiness_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own readiness history"
  ON readiness_history FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can upsert own readiness history"
  ON readiness_history FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can read own readiness history"
  ON readiness_history FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ─── 6. Leaderboard view + RLS ───────────────────────────────────────────
-- Any authenticated user can read profiles that have opted into the leaderboard.
-- The existing "Users can read own profile" policy still covers private rows.
CREATE POLICY "Authenticated users can read leaderboard profiles"
  ON profiles FOR SELECT TO authenticated
  USING (show_on_leaderboard = true);

-- View exposes only the three public columns; security_invoker applies the
-- caller's RLS context so the leaderboard policy above controls access.
CREATE OR REPLACE VIEW leaderboard_profiles
  WITH (security_invoker = true)
AS
  SELECT user_id, username, current_streak, total_xp
  FROM profiles
  WHERE show_on_leaderboard = true;

GRANT SELECT ON leaderboard_profiles TO authenticated;
