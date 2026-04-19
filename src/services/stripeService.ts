import { supabase } from '../lib/supabase';

export type Plan = 'pro' | 'elite';

export async function createCheckoutSession(plan: Plan): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { plan },
  });

  if (error) throw new Error(error.message ?? 'Failed to create checkout session');
  if (!data?.url) throw new Error('No checkout URL returned from Edge Function');

  return data.url as string;
}

export async function createPortalSession(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-portal-session');

  if (error) throw new Error(error.message ?? 'Failed to create portal session');
  if (!data?.url) throw new Error('No portal URL returned from Edge Function');

  return data.url as string;
}
