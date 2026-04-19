-- Profiles table: one row per user, auto-created by trigger on signup.
-- Users can read and update their own row only.

create table profiles (
  user_id     uuid        primary key references auth.users(id) on delete cascade,
  username    text        unique,
  full_name   text,
  avatar_url  text,
  university  text,
  exam_date   date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using ((select auth.uid()) = user_id);

create policy "Users can update own profile"
  on profiles for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Auto-update updated_at on any write
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

-- ─── Trigger: create profile row automatically on new signup ────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (user_id, full_name, avatar_url)
  values (
    new.id,
    -- populated by OAuth providers and our own signUp metadata
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
