import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Verify caller identity ──────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401)
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const uid = user.id

    // ── 2. Service-role client (bypasses RLS, can call auth.admin) ─────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── 3. Cancel Stripe subscription before touching the DB row ──────────
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', uid)
      .maybeSingle()

    if (sub?.stripe_subscription_id) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
        // Retrieve first so we only cancel non-terminal subscriptions
        const existing = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
        if (!['canceled', 'incomplete_expired'].includes(existing.status)) {
          await stripe.subscriptions.cancel(sub.stripe_subscription_id)
        }
      } catch (stripeErr) {
        // Log but don't block deletion — a failed cancel is better than
        // a stuck account that can never be removed
        console.error('Stripe subscription cancel failed:', stripeErr instanceof Error ? stripeErr.message : stripeErr)
      }
    }

    // ── 4. Delete user data in FK-safe order ──────────────────────────────
    const tables = [
      'quiz_attempts',
      'xp_events',
      'question_mastery',
      'srs_data',
      'user_progress',
      'user_progress_summary',
      'readiness_history',
      'subscriptions',
      'profiles',
    ]

    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', uid)
      if (error) {
        console.error(`Failed to delete from ${table}:`, error.message)
        throw new Error(`Failed to delete from ${table}: ${error.message}`)
      }
    }

    // ── 5. Delete auth.users row — requires service role ──────────────────
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(uid)
    if (deleteAuthError) {
      console.error('Failed to delete auth user:', deleteAuthError.message)
      throw new Error(deleteAuthError.message)
    }

    return json({ success: true })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('delete-account error:', message)
    return json({ error: message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
