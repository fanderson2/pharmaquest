/**
 * Creates one or more paid test accounts in Supabase.
 * Each account gets an auth user + an active subscription row so they
 * bypass Stripe entirely and land straight on the full dashboard.
 *
 * Usage:
 *   node scripts/createPaidTestUser.js
 *
 * To create extra accounts edit the ACCOUNTS array below.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Add / edit test accounts here ───────────────────────────────────────────
const ACCOUNTS = [
  {
    email: 'paid@pharmaquest.co.uk',
    password: 'PaidUser123!',
    name: 'Paid Test User',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function upsertSubscription(userId) {
  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      plan: 'pro',
      status: 'active',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_end: null,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

async function createAccount({ email, password, name }) {
  console.log(`\nProcessing ${email}…`);

  // Create or look up the user
  let userId;
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

  if (createError) {
    if (!createError.message?.includes('already been registered')) {
      throw createError;
    }
    // User exists — fetch their ID
    const { data: list, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    const existing = list.users.find((u) => u.email === email);
    if (!existing) throw new Error(`Could not find existing user ${email}`);
    userId = existing.id;
    console.log(`  ℹ️  User already exists (${userId})`);
  } else {
    userId = created.user.id;
    console.log(`  ✅ User created (${userId})`);
  }

  // Upsert active subscription
  await upsertSubscription(userId);
  console.log(`  ✅ Active subscription set`);
  console.log(`  📧 ${email}`);
  console.log(`  🔑 ${password}`);
}

async function main() {
  console.log('Creating paid test account(s)…');
  for (const account of ACCOUNTS) {
    await createAccount(account);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('❌', err.message ?? err);
  process.exit(1);
});
