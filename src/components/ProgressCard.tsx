import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, PlayCircle, Lock } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { getQuestionCountForSection } from '../utils/questionCounter';
import { getTotalCompletedQuestions } from '../utils/progressCalculator';
import { useProgress } from '../hooks/useProgress';

interface ProgressCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  sectionId: string;
  variant?: 'teal' | 'gold';
  onStartExamQuiz?: () => void;
  examLocked?: boolean;
  children?: React.ReactNode;
}

export default function ProgressCard({
  icon,
  title,
  description,
  sectionId,
  variant = 'teal',
  onStartExamQuiz,
  examLocked = false,
  children
}: ProgressCardProps) {
  const isGold = variant === 'gold';
  const [isExpanded, setIsExpanded] = useState(false);
  const { searchQuery } = useSearch();
  const { user } = useAuth();
  const { progress, loading } = useProgress();
  const totalQuestions = getQuestionCountForSection(sectionId);
  const completedQuestions = user ? getTotalCompletedQuestions(progress || {}, sectionId) : 0;
  const progressPercentage = totalQuestions > 0 
    ? Math.round((completedQuestions / totalQuestions) * 100)
    : 0;

  useEffect(() => {
    if (searchQuery) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [searchQuery]);

  const isExamCard = !!onStartExamQuiz;

  return (
    <div className={isGold
      ? 'bg-white border border-gray-900 rounded-2xl p-4 flex flex-col'
      : 'bg-[#E6FBF8] rounded-xl p-4 md:p-6 mb-4 transform transition-transform hover:scale-[1.01]'
    }>
      {isGold ? (
        <>
          <div className="flex items-center gap-2.5 mb-1">
            {icon}
            <p className="text-sm font-bold text-gray-800">{title}</p>
          </div>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>
        </>
      ) : (
        <div
          className="flex items-start gap-4 mb-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          tabIndex={0}
        >
          <div className="bg-white p-2 md:p-3 rounded-xl shadow-sm shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg md:text-xl font-semibold truncate">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>
              <div className="transform transition-transform shrink-0">
                {isExpanded ? (
                  <ChevronDown className="text-teal-600" />
                ) : (
                  <ChevronRight className="text-teal-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Exam Practice button — above progress bar */}
      {(onStartExamQuiz || examLocked) && (
        examLocked ? (
          <div className="mt-auto mb-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-full">
            <Lock className="w-3.5 h-3.5 text-[rgb(96,13,148)] shrink-0" />
            <span className="text-sm font-medium text-[rgb(96,13,148)]">Pro members only — subscribe to unlock</span>
          </div>
        ) : (
          <button
            onClick={onStartExamQuiz}
            className="mt-auto mb-3 w-full flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-full transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            Start Exam Practice
          </button>
        )
      )}

      {user && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1.5">
            {loading ? (
              <div className="h-3.5 w-32 bg-gray-300 rounded animate-pulse" />
            ) : (
              <span className="text-xs text-gray-500">
                {completedQuestions.toLocaleString()} / {totalQuestions.toLocaleString()} questions
              </span>
            )}
            {loading ? (
              <div className="h-3.5 w-10 bg-gray-300 rounded animate-pulse" />
            ) : (
              <span className={`text-sm font-bold ${isGold ? 'text-[rgb(96,13,148)]' : 'text-teal-700'}`}>{progressPercentage}% Complete</span>
            )}
          </div>
          <div className={`relative h-3 rounded-full overflow-hidden shadow-inner ${isGold ? 'bg-gray-100 border border-gray-200' : 'bg-white border border-white/60'}`}>
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${
                loading
                  ? 'bg-gray-300 animate-pulse w-full'
                  : progressPercentage === 0
                  ? 'w-0'
                  : progressPercentage === 100
                  ? isGold ? 'bg-[rgb(96,13,148)] w-full' : 'bg-teal-500 w-full'
                  : isGold
                  ? 'bg-[rgb(96,13,148)]'
                  : 'bg-gradient-to-r from-teal-400 to-teal-600'
              }`}
              style={loading || progressPercentage === 0 ? undefined : { width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}