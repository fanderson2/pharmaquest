import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', user!.id)
        .maybeSingle();

      setSubscription(data);
      setLoading(false);
    }

    load();
  }, [user?.id]);

  const isPro =
    subscription?.status === 'active' || subscription?.status === 'trialing';

  const plan = (subscription?.plan ?? 'free') as 'free' | 'pro';

  return { subscription, loading, isLoading: loading, isActive: isPro, isPro, plan };
}
