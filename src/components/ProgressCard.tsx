import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
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
  children?: React.ReactNode;
}

export default function ProgressCard({ 
  icon, 
  title, 
  description, 
  sectionId,
  children 
}: ProgressCardProps) {
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

  return (
    <div className="bg-[#E6FBF8] rounded-xl p-4 md:p-6 mb-4 transform transition-transform hover:scale-[1.01]">
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
              <span className="text-sm font-bold text-teal-700">{progressPercentage}% Complete</span>
            )}
          </div>
          <div className="relative h-3 bg-white rounded-full overflow-hidden shadow-inner border border-white/60">
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${
                loading
                  ? 'bg-gray-300 animate-pulse w-full'
                  : progressPercentage === 0
                  ? 'w-0'
                  : progressPercentage === 100
                  ? 'bg-teal-500 w-full'
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