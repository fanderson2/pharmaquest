import React, { useState } from 'react';
import { CreditCard, BookOpen, Brain, CheckCircle2, Zap, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession } from '../services/stripeService';

interface SignUpPageProps {
  /** When true the user is logged in but has no active subscription. */
  isUpgrade?: boolean;
}

export default function SignUpPage({ isUpgrade = false }: SignUpPageProps) {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const url = await createCheckoutSession('pro');
      window.location.href = url;
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Failed to start checkout. Please try again.',
      );
      setCheckoutLoading(false);
    }
  };

  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-teal-600" />,
      title: 'Comprehensive Coverage',
      description: 'Complete question bank covering all GPhC exam topics',
    },
    {
      icon: <Brain className="h-6 w-6 text-teal-600" />,
      title: 'Smart Learning',
      description: 'Adaptive spaced repetition for optimal retention',
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-teal-600" />,
      title: 'Detailed Explanations',
      description: 'Clear explanations for every answer to build understanding',
    },
    {
      icon: <Zap className="h-6 w-6 text-teal-600" />,
      title: 'Progress Tracking',
      description: 'Monitor your improvement across all topics',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {isUpgrade ? 'Subscribe to Access PharmaQuest' : 'Ace Your Pre-Registration Exam'}
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          {isUpgrade
            ? `Welcome back${user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}! Subscribe below to unlock your full question bank.`
            : 'Join thousands of pharmacy students preparing for their pre-registration exam with our comprehensive question bank.'}
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 mb-6">
            <CreditCard className="h-7 w-7 text-teal-600" />
            <span>£99 — Lifetime Access</span>
          </div>

          {checkoutError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-left">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span className="text-sm">{checkoutError}</span>
            </div>
          )}

          {/* Authenticated users go straight to Stripe checkout */}
          {user ? (
            <button
              onClick={handleSubscribe}
              disabled={checkoutLoading}
              className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-8 flex items-center justify-center gap-2"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Redirecting to checkout…</span>
                </>
              ) : (
                <span>Subscribe Now</span>
              )}
            </button>
          ) : (
            /* Unauthenticated users create a free account first */
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mb-8"
            >
              Get Started — Create Free Account
            </button>
          )}

          <div className="space-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="shrink-0 bg-teal-50 rounded-lg p-2">{f.icon}</div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!user && (
          <p className="mt-8 text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-teal-600 hover:text-teal-700 underline"
            >
              Sign in
            </button>
          </p>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="signup"
      />
    </div>
  );
}

/** Shown when Stripe redirects back with ?checkout=success but the webhook
 *  hasn't updated the database yet (usually < 5 seconds). */
export function CheckoutProcessing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <CheckCircle2 className="h-16 w-16 text-teal-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Received!</h2>
          <p className="text-gray-600 mb-6">
            We're activating your account. This usually takes a few seconds. Click refresh
            once you see your confirmation email from Stripe.
          </p>
          <button
            onClick={() => window.location.replace('/')}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
