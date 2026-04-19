import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map plan slugs to Stripe price IDs configured in Supabase Edge Function secrets
const PRICE_IDS: Record<string, string | undefined> = {
  pro:   Deno.env.get('STRIPE_PRICE_ID_PRO'),
  elite: Deno.env.get('STRIPE_PRICE_ID_ELITE'),
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate the calling user via their Supabase JWT
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

    const { plan } = await req.json() as { plan?: string }
    const priceId = plan ? PRICE_IDS[plan] : undefined

    if (!priceId) {
      return json({ error: `Invalid plan "${plan}". Expected "pro" or "elite".` }, 400)
    }

    // Use service role to look up any existing Stripe customer ID for this user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    // Re-use existing Stripe customer or create a new one
    let customerId = existingSub?.stripe_customer_id ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
    }

    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,  // written to subscription metadata so webhook can link it
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/?checkout=cancelled`,
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
      },
    })

    return json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
