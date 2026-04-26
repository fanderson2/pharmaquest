-- ═══════════════════════════════════════════════════════════════════════════
-- Exam Readiness Score
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── calculate_exam_readiness ────────────────────────────────────────────────
-- Returns 0-100.  Returns 0 when the user has fewer than 20 attempts (not
-- enough signal).  Each contributing factor is independently capped at 100
-- before weighting so one excellent area cannot mask a weak one.
CREATE OR REPLACE FUNCTION calculate_exam_readiness(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_total_attempts   INTEGER;
  v_correct_attempts INTEGER;
  v_total_topics     INTEGER;
  v_attempted_topics INTEGER;
  v_recent_correct   NUMERIC;
  v_recent_total     INTEGER;
  v_current_streak   INTEGER;

  v_overall_accuracy   NUMERIC;
  v_topic_coverage     NUMERIC;
  v_recent_performance NUMERIC;
  v_streak_factor      NUMERIC;
  v_volume_factor      NUMERIC;
BEGIN
  -- All-time totals
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct)
  INTO   v_total_attempts, v_correct_attempts
  FROM   quiz_attempts
  WHERE  user_id = p_user_id;

  -- Guard: not enough data
  IF v_total_attempts < 20 THEN
    RETURN 0;
  END IF;

  -- Total unique topics in the system
  SELECT COUNT(DISTINCT topic_id) INTO v_total_topics FROM topics;

  -- Topics this user has attempted at least once
  SELECT COUNT(DISTINCT topic) INTO v_attempted_topics
  FROM   quiz_attempts WHERE user_id = p_user_id;

  -- Recent performance: accuracy of last 50 attempts
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct)
  INTO   v_recent_total, v_recent_correct
  FROM (
    SELECT is_correct
    FROM   quiz_attempts
    WHERE  user_id = p_user_id
    ORDER  BY attempted_at DESC
    LIMIT  50
  ) recent;

  -- Current streak from profiles
  SELECT current_streak INTO v_current_streak
  FROM   profiles WHERE user_id = p_user_id;

  -- Factor calculations (each capped at 100)
  v_overall_accuracy   := LEAST(100,
    (v_correct_attempts::NUMERIC / NULLIF(v_total_attempts, 0)) * 100);

  v_topic_coverage     := LEAST(100,
    (v_attempted_topics::NUMERIC / NULLIF(v_total_topics, 0)) * 100);

  v_recent_performance := LEAST(100,
    (v_recent_correct / NULLIF(v_recent_total, 0)) * 100);

  v_streak_factor      := LEAST(100,
    (LEAST(v_current_streak, 30)::NUMERIC / 30) * 100);

  v_volume_factor      := LEAST(100,
    (LEAST(v_total_attempts, 1000)::NUMERIC / 1000) * 100);

  RETURN LEAST(100, ROUND(
      v_overall_accuracy   * 0.35
    + v_topic_coverage     * 0.25
    + v_recent_performance * 0.20
    + v_streak_factor      * 0.10
    + v_volume_factor      * 0.10
  ))::INTEGER;
END;
$$;

-- ─── get_readiness_breakdown ─────────────────────────────────────────────────
-- Returns each factor's current value (0-100) and its weight so the UI can
-- show a breakdown tooltip without re-implementing the formula in TypeScript.
CREATE OR REPLACE FUNCTION get_readiness_breakdown(p_user_id UUID)
RETURNS TABLE (
  factor_name TEXT,
  raw_value   NUMERIC,
  weight      NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_total_attempts   INTEGER;
  v_correct_attempts INTEGER;
  v_total_topics     INTEGER;
  v_attempted_topics INTEGER;
  v_recent_correct   NUMERIC;
  v_recent_total     INTEGER;
  v_current_streak   INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct)
  INTO   v_total_attempts, v_correct_attempts
  FROM   quiz_attempts WHERE user_id = p_user_id;

  SELECT COUNT(DISTINCT topic_id) INTO v_total_topics FROM topics;

  SELECT COUNT(DISTINCT topic) INTO v_attempted_topics
  FROM   quiz_attempts WHERE user_id = p_user_id;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct)
  INTO   v_recent_total, v_recent_correct
  FROM (
    SELECT is_correct FROM quiz_attempts
    WHERE  user_id = p_user_id
    ORDER  BY attempted_at DESC LIMIT 50
  ) r;

  SELECT current_streak INTO v_current_streak
  FROM   profiles WHERE user_id = p_user_id;

  RETURN QUERY SELECT * FROM (VALUES
    ('Overall Accuracy',
      LEAST(100, ROUND(COALESCE(v_correct_attempts::NUMERIC / NULLIF(v_total_attempts,0),0) * 100))::NUMERIC,
      0.35::NUMERIC),
    ('Topic Coverage',
      LEAST(100, ROUND(COALESCE(v_attempted_topics::NUMERIC / NULLIF(v_total_topics,0),0) * 100))::NUMERIC,
      0.25::NUMERIC),
    ('Recent Performance',
      LEAST(100, ROUND(COALESCE(v_recent_correct / NULLIF(v_recent_total,0),0) * 100))::NUMERIC,
      0.20::NUMERIC),
    ('Daily Streak',
      LEAST(100, ROUND(LEAST(COALESCE(v_current_streak,0), 30)::NUMERIC / 30 * 100))::NUMERIC,
      0.10::NUMERIC),
    ('Volume',
      LEAST(100, ROUND(LEAST(COALESCE(v_total_attempts,0), 1000)::NUMERIC / 1000 * 100))::NUMERIC,
      0.10::NUMERIC)
  ) AS t(factor_name, raw_value, weight);
END;
$$;

-- ─── run_daily_readiness_snapshot ────────────────────────────────────────────
-- Called by pg_cron at midnight.  Upserts today's readiness score for every
-- user who has at least 20 attempts.  Returns the number of rows written.
CREATE OR REPLACE FUNCTION run_daily_readiness_snapshot()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user  RECORD;
  v_score INTEGER;
  v_count INTEGER := 0;
BEGIN
  FOR v_user IN
    SELECT user_id
    FROM   quiz_attempts
    GROUP  BY user_id
    HAVING COUNT(*) >= 20
  LOOP
    v_score := calculate_exam_readiness(v_user.user_id);
    INSERT INTO readiness_history (user_id, score, calculated_at)
    VALUES (v_user.user_id, v_score, CURRENT_DATE)
    ON CONFLICT (user_id, calculated_at) DO UPDATE SET score = EXCLUDED.score;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

-- ─── pg_cron schedule ────────────────────────────────────────────────────────
-- Runs daily at midnight UTC (00:00 = midnight UK winter / 01:00 BST summer).
-- Wrapped in a DO block so the migration succeeds even on plans without pg_cron.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    PERFORM cron.unschedule('daily-readiness-snapshot');
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'daily-readiness-snapshot',
      '0 0 * * *',
      'SELECT run_daily_readiness_snapshot()'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;
