-- Subscriptions table: one row per user, written only by the webhook Edge Function.
-- Users can read their own row; all writes go through the service role.

create table subscriptions (
  id                      uuid        primary key default gen_random_uuid(),
  user_id                 uuid        not null references auth.users(id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text        not null default 'pro',
  status                  text        not null default 'incomplete',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (user_id)
);

alter table subscriptions enable row level security;

-- Users can only see their own subscription row
create policy "Users can read own subscription"
  on subscriptions
  for select
  using ((select auth.uid()) = user_id);

-- Only the service role (Edge Functions using SUPABASE_SERVICE_ROLE_KEY) can write
create policy "Service role manages subscriptions"
  on subscriptions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at_column();
