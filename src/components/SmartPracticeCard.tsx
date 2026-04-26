import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { fetchSmartQuiz } from '../services/smartPracticeService';
import { createCheckoutSession } from '../services/stripeService';

// ─── Bucket visualiser ────────────────────────────────────────────────────────
// Shows the four mastery buckets as a small legend so users understand the mix.

function BucketLegend() {
  const buckets = [
    { label: 'Struggling', pct: 40, color: 'bg-red-400' },
    { label: 'Developing', pct: 30, color: 'bg-amber-400' },
    { label: 'New',        pct: 20, color: 'bg-blue-400' },
    { label: 'Strong',     pct: 10, color: 'bg-emerald-400' },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-full overflow-hidden h-2 w-full max-w-[160px]">
      {buckets.map((b) => (
        <div
          key={b.label}
          className={`h-full ${b.color}`}
          style={{ width: `${b.pct}%` }}
          title={`${b.label}: ${b.pct}%`}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SmartPracticeCard() {
  const { user } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const handleStart = async () => {
    if (!user) return;
    setStarting(true);
    setError(null);
    try {
      const questions = await fetchSmartQuiz(user.id, 20);
      if (questions.length === 0) {
        setError('No eligible questions right now — try again tomorrow.');
        return;
      }
      navigate('/quiz/__smart__', { state: { questions } });
    } catch {
      setError('Failed to load your practice quiz. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const url = await createCheckoutSession('pro');
      window.location.href = url;
    } catch {
      setError('Failed to start checkout.');
      setUpgrading(false);
    }
  };

  if (subLoading) return null;

  // ── Locked state (free users) ─────────────────────────────────────────────
  if (!isActive) {
    return (
      <div className="relative bg-white rounded-2xl border border-gray-200 p-6 mb-6 overflow-hidden">
        {/* Subtle gradient hint */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 to-white pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-gray-800">Smart Practice</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                <Lock className="h-2.5 w-2.5" /> Pro
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Spaced repetition algorithm that serves the exact questions you need,
              exactly when you need them.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {upgrading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Sparkles className="h-4 w-4" />}
                Unlock Smart Practice — £99
              </button>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Active state (Pro users) ──────────────────────────────────────────────
  return (
    <div className="relative bg-white rounded-2xl border-2 border-teal-200 p-6 mb-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-white pointer-events-none" />

      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          {/* Left: icon + text */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shrink-0 shadow-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-lg font-bold text-gray-900">Today's Recommended Quiz</h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" /> Smart
                </span>
              </div>
              <p className="text-sm text-gray-500">
                20 questions · personalised to your mastery level
              </p>
              {/* Bucket bar */}
              <div className="flex items-center gap-2 mt-2">
                <BucketLegend />
                <span className="text-[10px] text-gray-400">question mix</span>
              </div>
            </div>
          </div>

          {/* Right: CTA button */}
          <div className="shrink-0">
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Building your quiz…
                </>
              ) : (
                <>
                  Start Smart Practice
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            {error && (
              <p className="text-xs text-red-500 mt-1.5 text-center">{error}</p>
            )}
          </div>
        </div>

        {/* Explainer */}
        <div className="mt-4 pt-4 border-t border-teal-100">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">Based on spaced repetition science.</span>{' '}
            Questions you got wrong come back at the perfect moment to lock in long-term memory.
            Each session is weighted: 40% your weakest areas, 30% developing knowledge,
            20% new material, 10% reinforcing strengths.
          </p>
        </div>
      </div>
    </div>
  );
}
