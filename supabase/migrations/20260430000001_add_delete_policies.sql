-- Allow authenticated users to delete their own rows from all user-data tables.
-- These policies are required for client-side account deletion to work.

-- profiles
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- quiz_attempts
CREATE POLICY "Users can delete own quiz attempts"
  ON quiz_attempts FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- readiness_history
CREATE POLICY "Users can delete own readiness history"
  ON readiness_history FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- question_mastery
CREATE POLICY "Users can delete own mastery"
  ON question_mastery FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- xp_events
CREATE POLICY "Users can delete own xp events"
  ON xp_events FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- subscriptions: allow the owning user to delete their own row
-- (the Stripe subscription itself is not cancelled by this; users are warned
-- separately that no refund is issued on account deletion)
CREATE POLICY "Users can delete own subscription"
  ON subscriptions FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
