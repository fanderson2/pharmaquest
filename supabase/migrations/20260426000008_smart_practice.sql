-- ═══════════════════════════════════════════════════════════════════════════
-- Smart Practice: mastery-update trigger + weighted bucket quiz function
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Mastery update trigger function ─────────────────────────────────────────
-- Fires AFTER INSERT on quiz_attempts.
-- Rules per spec (simplified SM-2):
--   First attempt correct  → score = 1  (INSERT default is 0, then +1)
--   Subsequent correct     → score + 1  (max 5)
--   Any incorrect          → MAX(0, score - 2)
CREATE OR REPLACE FUNCTION update_question_mastery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO question_mastery (user_id, question_id, mastery_score, last_attempted)
  VALUES (
    NEW.user_id,
    NEW.question_id,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id, question_id) DO UPDATE
    SET
      mastery_score  = CASE
        WHEN NEW.is_correct
          THEN LEAST(5, question_mastery.mastery_score + 1)
        ELSE
          GREATEST(0, question_mastery.mastery_score - 2)
      END,
      last_attempted = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quiz_attempt_mastery
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_question_mastery();

-- ─── get_smart_quiz ───────────────────────────────────────────────────────────
-- Returns p_count full question rows, sampled from four mastery buckets:
--   40% mastery 0-1   (weak / newly seen)
--   30% mastery 2-3   (developing — needs reinforcement)
--   20% never attempted (brand-new exposure)
--   10% mastery 4-5   (light reinforcement of strong knowledge)
--
-- Within every bucket: excludes questions attempted in the last 3 days.
-- After filling all four buckets, tops up with any eligible question so the
-- caller always gets p_count rows (or all eligible if fewer than p_count exist).
-- Returns the combined set in random order.
CREATE OR REPLACE FUNCTION get_smart_quiz(
  p_user_id UUID,
  p_count   INT DEFAULT 20
)
RETURNS TABLE (
  question_id    TEXT,
  topic_id       TEXT,
  question_text  TEXT,
  option_1       TEXT,
  option_2       TEXT,
  option_3       TEXT,
  option_4       TEXT,
  option_5       TEXT,
  correct_answer TEXT,
  explanation    TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_weak_n   INT := GREATEST(1, (p_count * 0.4)::INT);
  v_dev_n    INT := GREATEST(1, (p_count * 0.3)::INT);
  v_new_n    INT := GREATEST(1, (p_count * 0.2)::INT);
  v_strong_n INT := GREATEST(1, (p_count * 0.1)::INT);
  v_fill_n   INT;
BEGIN
  -- Temp table accumulates selected questions; ON COMMIT DROP ensures cleanup.
  -- IF NOT EXISTS + TRUNCATE makes the function safe to call multiple times
  -- within the same database session (connection pooler edge case).
  CREATE TEMP TABLE IF NOT EXISTS _smart_q (
    question_id    TEXT,
    topic_id       TEXT,
    question_text  TEXT,
    option_1       TEXT,
    option_2       TEXT,
    option_3       TEXT,
    option_4       TEXT,
    option_5       TEXT,
    correct_answer TEXT,
    explanation    TEXT
  ) ON COMMIT DROP;
  TRUNCATE _smart_q;

  -- ── Bucket 1: weak / new (mastery 0-1) ────────────────────────────────────
  INSERT INTO _smart_q
    SELECT q.question_id, q.topic_id, q.question_text,
           q.option_1, q.option_2, q.option_3, q.option_4, q.option_5,
           q.correct_answer, q.explanation
    FROM question_table q
    JOIN question_mastery qm
      ON qm.question_id = q.question_id AND qm.user_id = p_user_id
    WHERE qm.mastery_score BETWEEN 0 AND 1
      AND NOT EXISTS (
        SELECT 1 FROM quiz_attempts qa
        WHERE qa.user_id    = p_user_id
          AND qa.question_id = q.question_id
          AND qa.attempted_at >= NOW() - INTERVAL '3 days'
      )
    ORDER BY random()
    LIMIT v_weak_n;

  -- ── Bucket 2: developing (mastery 2-3) ────────────────────────────────────
  INSERT INTO _smart_q
    SELECT q.question_id, q.topic_id, q.question_text,
           q.option_1, q.option_2, q.option_3, q.option_4, q.option_5,
           q.correct_answer, q.explanation
    FROM question_table q
    JOIN question_mastery qm
      ON qm.question_id = q.question_id AND qm.user_id = p_user_id
    WHERE qm.mastery_score BETWEEN 2 AND 3
      AND q.question_id NOT IN (SELECT sq.question_id FROM _smart_q sq)
      AND NOT EXISTS (
        SELECT 1 FROM quiz_attempts qa
        WHERE qa.user_id    = p_user_id
          AND qa.question_id = q.question_id
          AND qa.attempted_at >= NOW() - INTERVAL '3 days'
      )
    ORDER BY random()
    LIMIT v_dev_n;

  -- ── Bucket 3: brand-new (never attempted — no mastery row at all) ──────────
  INSERT INTO _smart_q
    SELECT q.question_id, q.topic_id, q.question_text,
           q.option_1, q.option_2, q.option_3, q.option_4, q.option_5,
           q.correct_answer, q.explanation
    FROM question_table q
    WHERE NOT EXISTS (
        SELECT 1 FROM question_mastery qm2
        WHERE qm2.user_id    = p_user_id
          AND qm2.question_id = q.question_id
      )
      AND q.question_id NOT IN (SELECT sq.question_id FROM _smart_q sq)
    ORDER BY random()
    LIMIT v_new_n;

  -- ── Bucket 4: strong (mastery 4-5) ────────────────────────────────────────
  INSERT INTO _smart_q
    SELECT q.question_id, q.topic_id, q.question_text,
           q.option_1, q.option_2, q.option_3, q.option_4, q.option_5,
           q.correct_answer, q.explanation
    FROM question_table q
    JOIN question_mastery qm
      ON qm.question_id = q.question_id AND qm.user_id = p_user_id
    WHERE qm.mastery_score BETWEEN 4 AND 5
      AND q.question_id NOT IN (SELECT sq.question_id FROM _smart_q sq)
      AND NOT EXISTS (
        SELECT 1 FROM quiz_attempts qa
        WHERE qa.user_id    = p_user_id
          AND qa.question_id = q.question_id
          AND qa.attempted_at >= NOW() - INTERVAL '3 days'
      )
    ORDER BY random()
    LIMIT v_strong_n;

  -- ── Fill: top-up if total < p_count (handles sparse mastery tables) ────────
  v_fill_n := GREATEST(0, p_count - (SELECT COUNT(*)::INT FROM _smart_q));
  IF v_fill_n > 0 THEN
    INSERT INTO _smart_q
      SELECT q.question_id, q.topic_id, q.question_text,
             q.option_1, q.option_2, q.option_3, q.option_4, q.option_5,
             q.correct_answer, q.explanation
      FROM question_table q
      WHERE q.question_id NOT IN (SELECT sq.question_id FROM _smart_q sq)
        AND NOT EXISTS (
          SELECT 1 FROM quiz_attempts qa
          WHERE qa.user_id    = p_user_id
            AND qa.question_id = q.question_id
            AND qa.attempted_at >= NOW() - INTERVAL '3 days'
        )
      ORDER BY random()
      LIMIT v_fill_n;
  END IF;

  -- Return p_count rows in random order
  RETURN QUERY SELECT * FROM _smart_q ORDER BY random() LIMIT p_count;
END;
$$;
