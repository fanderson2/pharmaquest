import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, PlayCircle, Lock } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useProgress } from '../hooks/useProgress';
import { getQuestionCountForTopic } from '../utils/questionCounter';
import { getCompletedQuestionCount } from '../utils/progressCalculator';

interface Topic {
  id: string;
  title: string;
  subtopics: string[];
}

interface TopicListProps {
  topic: Topic;
  sectionId: string;
  locked?: boolean;
  variant?: 'teal' | 'gold';
}

export default function TopicList({ topic, sectionId, locked = false, variant = 'teal' }: TopicListProps) {
  const isGold = variant === 'gold';
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { searchQuery } = useSearch();
  const { progress } = useProgress();
  const totalQuestions = getQuestionCountForTopic(topic.id);
  const completedQuestions = getCompletedQuestionCount(progress, sectionId, topic.id);

  const searchLower = searchQuery.toLowerCase();
  const matchingItems = topic.subtopics.filter(item => 
    item.toLowerCase().includes(searchLower)
  );

  const topicMatches = topic.title.toLowerCase().includes(searchLower);
  const hasMatchingItems = matchingItems.length > 0;
  const shouldShow = !searchQuery || topicMatches || hasMatchingItems;

  useEffect(() => {
    if (searchQuery && (topicMatches || hasMatchingItems)) {
      setIsExpanded(true);
    } else if (!searchQuery) {
      setIsExpanded(false);
    }
  }, [searchQuery, topicMatches, hasMatchingItems]);

  if (!shouldShow) {
    return null;
  }

  const handleStartQuiz = () => {
    navigate(`/quiz/${topic.id}`);
  };

  const highlightMatch = (text: string) => {
    if (!searchQuery) return text;
    
    const index = text.toLowerCase().indexOf(searchLower);
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <span className="bg-teal-200 text-teal-900">
          {text.substring(index, index + searchQuery.length)}
        </span>
        {text.substring(index + searchQuery.length)}
      </>
    );
  };

  return (
    <div className="mt-2">
      <div
        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          locked
            ? 'bg-gray-100 cursor-default border border-gray-200'
            : `bg-white cursor-pointer hover:bg-gray-50 ${topicMatches ? (isGold ? 'bg-purple-50 ring-2 ring-purple-200' : 'bg-teal-50 ring-2 ring-teal-200') : ''}`
        }`}
        onClick={locked ? undefined : () => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {locked ? (
            <Lock className="h-5 w-5 text-gray-400 shrink-0" />
          ) : isExpanded ? (
            <ChevronDown className={`h-5 w-5 ${isGold ? 'text-[rgb(96,13,148)]' : 'text-teal-600'}`} />
          ) : (
            <ChevronRight className={`h-5 w-5 ${isGold ? 'text-[rgb(96,13,148)]' : 'text-teal-600'}`} />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
                {highlightMatch(topic.title)}
              </span>
            </div>
            <div className={`text-sm ${locked ? 'text-gray-400' : isGold ? 'text-[rgb(96,13,148)]' : 'text-teal-600'}`}>
              {locked ? 'Subscribe to unlock' : `${completedQuestions} / ${totalQuestions} Questions complete`}
            </div>
          </div>
        </div>
        {locked ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-200 rounded-full border border-gray-300">
            <Lock className="w-3 h-3" />
            Locked
          </span>
        ) : (
          <button
            className={`px-4 py-1.5 text-sm font-medium bg-white rounded-full border transition-all ${isGold ? 'text-[rgb(96,13,148)] border-[rgb(96,13,148)] hover:bg-purple-50' : 'text-teal-600 border-teal-600 hover:bg-teal-50'}`}
            onClick={(e) => {
              e.stopPropagation();
              handleStartQuiz();
            }}
          >
            <span className="flex items-center gap-1">
              <PlayCircle className="w-4 h-4" />
              Start Quiz
            </span>
          </button>
        )}
      </div>
      
      {isExpanded && !locked && (
        <div className="mt-1 pl-4">
          <p className="text-sm font-medium text-gray-600 mb-2 mt-3">Topics in this Quiz:</p>
          <div className="space-y-1">
            {(searchQuery ? matchingItems : topic.subtopics).map((item, index) => (
              <div 
                key={index}
                className="flex items-center py-2 px-3 rounded-lg hover:bg-white/80"
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isGold
                      ? hoveredItem === index ? 'bg-[rgb(96,13,148)]' : 'bg-purple-300'
                      : hoveredItem === index ? 'bg-teal-600' : 'bg-teal-500'
                  }`} />
                  <span className="text-gray-700">{highlightMatch(item)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}