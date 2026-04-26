-- Users need INSERT permission for upsert (INSERT ... ON CONFLICT DO UPDATE)
-- to work from the client. The user_id must match auth.uid() so users can
-- only create their own profile row.
create policy "Users can insert own profile"
  on profiles for insert
  with check ((select auth.uid()) = user_id);
