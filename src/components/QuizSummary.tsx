import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, CheckCircle2, XCircle, Lock, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '../services/stripeService';

interface QuizSummaryProps {
  totalQuestions: number;
  correctAnswers: number;
  topic: string;
  subtopic?: string;
  showUpgrade?: boolean;
  onRetry: () => void;
}

export default function QuizSummary({
  totalQuestions,
  correctAnswers,
  topic,
  subtopic,
  showUpgrade = false,
}: QuizSummaryProps) {
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const incorrectAnswers = totalQuestions - correctAnswers;

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const url = await createCheckoutSession('pro');
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm animate-fadeIn">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-teal-100 p-4 rounded-full">
            <Trophy className="h-12 w-12 text-teal-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
        <p className="text-gray-600">{subtopic || topic}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Correct</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Incorrect</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{incorrectAnswers}</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="w-full py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Topics</span>
      </button>

      {showUpgrade && (
        <div className="mt-6 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 text-center text-white">
          <Lock className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <h3 className="font-bold text-lg mb-1">Want to keep going?</h3>
          <p className="text-teal-100 text-sm mb-4">
            Subscribe for lifetime access to all 2,436 questions across every GPhC topic.
          </p>
          {checkoutError && <p className="text-red-200 text-xs mb-3">{checkoutError}</p>}
          <button
            onClick={handleSubscribe}
            disabled={checkoutLoading}
            className="bg-white text-teal-700 font-semibold px-6 py-2.5 rounded-full hover:bg-teal-50 disabled:opacity-60 transition-colors inline-flex items-center gap-2 text-sm"
          >
            {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Subscribe — £99 Lifetime Access
          </button>
        </div>
      )}
    </div>
  );
}