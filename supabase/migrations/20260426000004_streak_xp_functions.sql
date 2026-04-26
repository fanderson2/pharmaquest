-- ═══════════════════════════════════════════════════════════════════════
-- Streak + XP functions and trigger
-- ═══════════════════════════════════════════════════════════════════════

-- ─── update_streak_on_activity ───────────────────────────────────────────────
-- Returns the new current_streak value.
-- Called by the quiz_attempts trigger; also safe to call directly.
CREATE OR REPLACE FUNCTION update_streak_on_activity(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_last_active    DATE;
  v_current_streak INTEGER;
  v_today          DATE := CURRENT_DATE;
BEGIN
  SELECT last_active_date, current_streak
  INTO   v_last_active, v_current_streak
  FROM   profiles
  WHERE  user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Already credited today — nothing to do
  IF v_last_active = v_today THEN
    RETURN v_current_streak;
  END IF;

  -- Continued streak: was active yesterday
  IF v_last_active = v_today - 1 THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    -- Broken streak or first ever activity
    v_current_streak := 1;
  END IF;

  UPDATE profiles
  SET
    current_streak   = v_current_streak,
    longest_streak   = GREATEST(longest_streak, v_current_streak),
    last_active_date = v_today
  WHERE user_id = p_user_id;

  RETURN v_current_streak;
END;
$$;

-- ─── award_xp ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO xp_events (user_id, amount, reason)
  VALUES (p_user_id, p_amount, p_reason);

  UPDATE profiles
  SET total_xp = total_xp + p_amount
  WHERE user_id = p_user_id;
END;
$$;

-- ─── handle_quiz_attempt (trigger function) ───────────────────────────────────
CREATE OR REPLACE FUNCTION handle_quiz_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_new_streak INTEGER;
BEGIN
  -- 1. Update streak (idempotent for multiple answers in one session)
  v_new_streak := update_streak_on_activity(NEW.user_id);

  -- 2. Award per-answer XP
  IF NEW.is_correct THEN
    PERFORM award_xp(NEW.user_id, 10, 'correct_answer');
  ELSE
    PERFORM award_xp(NEW.user_id, 5, 'participation');
  END IF;

  -- 3. Streak milestone bonuses (only fires on the exact day the milestone is hit)
  CASE v_new_streak
    WHEN 7   THEN PERFORM award_xp(NEW.user_id, 50,  'streak_milestone_7');
    WHEN 30  THEN PERFORM award_xp(NEW.user_id, 100, 'streak_milestone_30');
    WHEN 100 THEN PERFORM award_xp(NEW.user_id, 250, 'streak_milestone_100');
    ELSE NULL;
  END CASE;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quiz_attempt_insert
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION handle_quiz_attempt();
