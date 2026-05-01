import { supabase } from '../lib/supabase';

export type Plan = 'pro' | 'elite';

export async function createCheckoutSession(plan: Plan): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { plan },
  });

  if (error) {
    // Log the full SDK error object so status, cause, and context are all visible
    console.error('create-checkout-session SDK error:', {
      message: error.message,
      status:  (error as unknown as { status?: number }).status,
      context: (error as unknown as { context?: unknown }).context,
    });

    // The SDK wraps non-2xx responses — try to pull the actual body the function sent
    const ctx = (error as unknown as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      try {
        const body = await ctx.json();
        console.error('create-checkout-session function body:', body);
        throw new Error(body.error ?? JSON.stringify(body));
      } catch (inner) {
        if (inner instanceof Error && inner.message !== error.message) throw inner;
      }
    }

    throw new Error(error.message ?? 'Failed to create checkout session');
  }

  if (!data?.url) throw new Error('No checkout URL returned from Edge Function');
  return data.url as string;
}

export async function createPortalSession(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-portal-session');

  if (error) {
    // Supabase wraps non-2xx responses — try to extract the body the function returned
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (error as any).context as Response | undefined;
    if (body) {
      try {
        const json = await body.json();
        console.error('create-portal-session full error:', json);
        throw new Error(json.error ?? JSON.stringify(json));
      } catch {
        // json() already threw or body wasn't JSON — fall through
      }
    }
    console.error('create-portal-session error:', error);
    throw new Error(error.message ?? 'Failed to create portal session');
  }

  if (!data?.url) throw new Error('No portal URL returned from Edge Function');
  return data.url as string;
}
