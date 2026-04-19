import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

// No CORS headers — this endpoint is called by Stripe servers, not the browser.

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,  // service role: allowed to write subscriptions
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  // Read raw body — must not be parsed first or signature check fails
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid webhook signature', { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // client_reference_id is the Supabase user ID set when creating the session
        const userId = session.client_reference_id
        if (!userId) {
          console.warn('checkout.session.completed: no client_reference_id, skipping')
          break
        }

        if (!session.subscription) {
          console.warn('checkout.session.completed: no subscription ID, skipping')
          break
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        )

        const plan = subscription.metadata.plan ?? 'pro'

        await upsertSubscription({
          userId,
          stripeCustomerId:      session.customer as string,
          stripeSubscriptionId:  subscription.id,
          plan,
          status:                subscription.status,
          currentPeriodEnd:      new Date(subscription.current_period_end * 1000).toISOString(),
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.supabase_user_id
        if (!userId) {
          console.warn('customer.subscription.updated: no supabase_user_id metadata, skipping')
          break
        }

        await upsertSubscription({
          userId,
          stripeCustomerId:      subscription.customer as string,
          stripeSubscriptionId:  subscription.id,
          plan:                  subscription.metadata.plan ?? 'pro',
          status:                subscription.status,
          currentPeriodEnd:      new Date(subscription.current_period_end * 1000).toISOString(),
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.supabase_user_id
        if (!userId) {
          console.warn('customer.subscription.deleted: no supabase_user_id metadata, skipping')
          break
        }

        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', userId)

        if (error) console.error('Failed to mark subscription canceled:', error)
        break
      }

      default:
        // Unhandled event types are silently acknowledged
        break
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err)
    // Return 500 so Stripe will retry the webhook
    return new Response('Webhook handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

async function upsertSubscription(params: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  plan: string
  status: string
  currentPeriodEnd: string
}) {
  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id:                params.userId,
      stripe_customer_id:     params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      plan:                   params.plan,
      status:                 params.status,
      current_period_end:     params.currentPeriodEnd,
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    console.error('Failed to upsert subscription:', error)
    throw error
  }
}
