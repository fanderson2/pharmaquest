import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, CheckCircle2, XCircle, Lock, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { createCheckoutSession } from '../services/stripeService';
import type { IncorrectAnswer } from '../context/QuizContext';

interface QuizSummaryProps {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: IncorrectAnswer[];
  topic: string;
  subtopic?: string;
  showUpgrade?: boolean;
  onRetry: () => void;
}

function IncorrectReview({ items }: { items: IncorrectAnswer[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (i: number) =>
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <XCircle className="h-5 w-5 text-red-500" />
        Review incorrect answers ({items.length})
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-red-100 rounded-xl overflow-hidden">
            {/* Question row — always visible */}
            <button
              onClick={() => toggle(i)}
              className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <span className="text-sm text-gray-800 font-medium leading-snug flex-1">
                {i + 1}. {item.question.text}
              </span>
              {expanded[i]
                ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />}
            </button>

            {/* Detail panel */}
            {expanded[i] && (
              <div className="px-4 py-4 space-y-3 bg-white">
                {/* Options list */}
                <div className="space-y-1.5">
                  {item.question.options.map((opt, j) => {
                    const isCorrect = opt === item.question.correctAnswer;
                    const isSelected = opt === item.selectedAnswer;
                    return (
                      <div
                        key={j}
                        className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm ${
                          isCorrect
                            ? 'bg-green-50 border border-green-200'
                            : isSelected
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        ) : isSelected ? (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <span className="w-4 shrink-0" />
                        )}
                        <span className={
                          isCorrect ? 'text-green-800 font-medium'
                          : isSelected ? 'text-red-700'
                          : 'text-gray-600'
                        }>
                          {opt}
                          {isCorrect && <span className="ml-1.5 text-xs font-normal text-green-600">✓ correct</span>}
                          {isSelected && !isCorrect && <span className="ml-1.5 text-xs font-normal text-red-500">✗ your answer</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2.5">
                  <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">Explanation</p>
                  <p className="text-sm text-teal-900 leading-relaxed">{item.question.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuizSummary({
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  topic,
  subtopic,
  showUpgrade = false,
}: QuizSummaryProps) {
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const incorrectCount = totalQuestions - correctAnswers;

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

      <div className="grid grid-cols-2 gap-4 mb-6">
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
          <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
        </div>
      </div>

      {incorrectAnswers.length > 0 && <IncorrectReview items={incorrectAnswers} />}

      <button
        onClick={() => navigate('/dashboard')}
        className="w-full mt-8 py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
