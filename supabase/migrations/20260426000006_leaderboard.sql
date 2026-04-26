-- ═══════════════════════════════════════════════════════════════════════════
-- Public leaderboard: views + RPCs (weekly uses SECURITY DEFINER to cross
-- xp_events rows that are otherwise RLS-restricted to own user).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── All-time leaderboard view ────────────────────────────────────────────
-- security_invoker = true → RLS on profiles is enforced for the caller, so
-- only profiles with show_on_leaderboard = true are visible.
CREATE OR REPLACE VIEW leaderboard_view WITH (security_invoker = true) AS
SELECT
  user_id,
  COALESCE(username, 'Anonymous') AS username,
  current_streak,
  total_xp,
  FLOOR(SQRT(total_xp / 100.0))::INTEGER AS level
FROM profiles
WHERE show_on_leaderboard = true
ORDER BY total_xp DESC
LIMIT 100;

GRANT SELECT ON leaderboard_view TO authenticated;

-- ─── Weekly leaderboard RPC ────────────────────────────────────────────────
-- SECURITY DEFINER bypasses xp_events RLS so we can aggregate across users.
CREATE OR REPLACE FUNCTION get_weekly_leaderboard()
RETURNS TABLE (
  user_id        UUID,
  username       TEXT,
  weekly_xp      BIGINT,
  current_streak INTEGER,
  total_xp       INTEGER,
  level          INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    p.user_id,
    COALESCE(p.username, 'Anonymous')        AS username,
    SUM(e.amount)::BIGINT                    AS weekly_xp,
    p.current_streak,
    p.total_xp,
    FLOOR(SQRT(p.total_xp / 100.0))::INTEGER AS level
  FROM xp_events e
  JOIN profiles p ON p.user_id = e.user_id
  WHERE e.created_at >= NOW() - INTERVAL '7 days'
    AND p.show_on_leaderboard = true
  GROUP BY p.user_id, p.username, p.current_streak, p.total_xp
  ORDER BY weekly_xp DESC
  LIMIT 100;
$$;

-- ─── User's own rank + competitive nudge ──────────────────────────────────
-- Returns one row: all-time rank, weekly rank, weekly XP earned, and info
-- about the person directly above (for the "overtake" nudge).
CREATE OR REPLACE FUNCTION get_my_leaderboard_rank(p_user_id UUID)
RETURNS TABLE (
  all_time_rank  BIGINT,
  weekly_rank    BIGINT,
  weekly_xp      BIGINT,
  above_username TEXT,
  above_xp       INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_total_xp  INTEGER;
  v_weekly_xp BIGINT;
BEGIN
  SELECT total_xp INTO v_total_xp
  FROM profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_weekly_xp
  FROM xp_events
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '7 days';

  RETURN QUERY
  WITH
    all_time_rank AS (
      SELECT COUNT(*)::BIGINT + 1 AS rank
      FROM profiles
      WHERE show_on_leaderboard = true AND total_xp > v_total_xp
    ),
    weekly_totals AS (
      SELECT e.user_id, SUM(e.amount) AS wxp
      FROM xp_events e
      JOIN profiles p ON p.user_id = e.user_id AND p.show_on_leaderboard = true
      WHERE e.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY e.user_id
    ),
    weekly_rank AS (
      SELECT COUNT(*)::BIGINT + 1 AS rank
      FROM weekly_totals
      WHERE wxp > v_weekly_xp
    ),
    above AS (
      -- Person with the lowest XP that still beats the current user
      SELECT COALESCE(p.username, 'Anonymous') AS username, p.total_xp
      FROM profiles p
      WHERE p.show_on_leaderboard = true
        AND p.total_xp > v_total_xp
        AND p.user_id <> p_user_id
      ORDER BY p.total_xp ASC
      LIMIT 1
    )
  SELECT
    (SELECT rank FROM all_time_rank),
    (SELECT rank FROM weekly_rank),
    v_weekly_xp,
    (SELECT username FROM above),
    (SELECT total_xp FROM above);
END;
$$;
