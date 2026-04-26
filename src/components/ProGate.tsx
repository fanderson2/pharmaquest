import React, { useState } from 'react';
import { Lock, Loader2, Sparkles } from 'lucide-react';
import { createCheckoutSession } from '../services/stripeService';

interface Props {
  feature: string;
  description?: string;
  compact?: boolean;
}

export default function ProGate({ feature, description, compact = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await createCheckoutSession('pro');
      window.location.href = url;
    } catch {
      setError('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{feature}</p>
            <p className="text-xs text-gray-500">{description ?? 'Upgrade to Pro to unlock this feature.'}</p>
          </div>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
        <Lock className="h-7 w-7 text-teal-600" />
      </div>
      <div>
        <p className="text-base font-bold text-gray-800 mb-1">{feature} — Pro only</p>
        <p className="text-sm text-gray-500 max-w-xs">
          {description ?? 'Upgrade to Pro to unlock this feature and all other Pro tools.'}
        </p>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Get Pro — £9.99/mo
      </button>
    </div>
  );
}
