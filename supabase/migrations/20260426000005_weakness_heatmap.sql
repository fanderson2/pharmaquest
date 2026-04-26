-- ═══════════════════════════════════════════════════════════════════════════
-- Weakness Heatmap: user_topic_stats view + get_focus_questions RPC
-- ═══════════════════════════════════════════════════════════════════════════

-- security_invoker = true → view runs as the calling user,
-- so quiz_attempts RLS is enforced automatically (users see own rows only).
CREATE OR REPLACE VIEW user_topic_stats WITH (security_invoker = true) AS
SELECT
  user_id,
  topic,
  COUNT(*)::INTEGER                                               AS total_attempts,
  COUNT(*) FILTER (WHERE is_correct)::INTEGER                    AS correct_attempts,
  ROUND(
    COUNT(*) FILTER (WHERE is_correct)::NUMERIC / COUNT(*) * 100
  )::INTEGER                                                      AS accuracy_percentage,
  MAX(attempted_at)                                              AS last_attempted
FROM quiz_attempts
GROUP BY user_id, topic;

GRANT SELECT ON user_topic_stats TO authenticated;

-- RPC: returns up to p_limit randomly-ordered questions from topics where
-- the calling user's accuracy is below 70%.  Full question rows returned
-- so the client only needs one round-trip.
CREATE OR REPLACE FUNCTION get_focus_questions(
  p_user_id UUID,
  p_limit   INTEGER DEFAULT 20
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    q.question_id,
    q.topic_id,
    q.question_text,
    q.option_1,
    q.option_2,
    q.option_3,
    q.option_4,
    q.option_5,
    q.correct_answer,
    q.explanation
  FROM question_table q
  WHERE q.topic_id IN (
    SELECT topic
    FROM   user_topic_stats
    WHERE  user_id = p_user_id
      AND  accuracy_percentage < 70
  )
  ORDER BY random()
  LIMIT p_limit;
$$;
