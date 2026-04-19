import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';
import { CalculationTopic } from '../data/otherTopics';
import { useSearch } from '../context/SearchContext';

interface CalculationListProps {
  topic: CalculationTopic;
}

export default function CalculationList({ topic }: CalculationListProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { searchQuery } = useSearch();

  const searchLower = searchQuery.toLowerCase();
  const matchingSubTopics = topic.subTopics.filter(subTopic => 
    subTopic.name.toLowerCase().includes(searchLower)
  );

  const topicMatches = topic.name.toLowerCase().includes(searchLower);
  const hasMatchingSubTopics = matchingSubTopics.length > 0;
  const shouldShow = !searchQuery || topicMatches || hasMatchingSubTopics;

  const handleStartQuiz = (subTopic?: string) => {
    const path = subTopic 
      ? `/quiz/${encodeURIComponent(topic.name)}/${encodeURIComponent(subTopic)}`
      : `/quiz/${encodeURIComponent(topic.name)}`;
    navigate(path);
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

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="mt-4 animate-fadeIn">
      <div 
        className={`flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
          topicMatches ? 'bg-teal-50 ring-2 ring-teal-200' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`calculation-${topic.id}-content`}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-teal-600 transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 text-teal-600 transition-transform" />
          )}
          <span className="font-medium">{topic.id}. {highlightMatch(topic.name)}</span>
        </div>
        <button 
          className="hidden md:flex px-4 py-1.5 text-sm font-medium text-teal-600 bg-white rounded-full border border-teal-600 hover:bg-teal-50 transition-all transform hover:scale-105 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();
            handleStartQuiz();
          }}
          aria-label={`Start ${topic.name} quiz`}
        >
          <span className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" />
            Start Quiz
          </span>
        </button>
      </div>
      
      {isExpanded && (
        <div 
          id={`calculation-${topic.id}-content`}
          className="mt-2 pl-4 space-y-1 animate-fadeIn"
        >
          {(searchQuery ? matchingSubTopics : topic.subTopics).map((subTopic, index) => (
            <div 
              key={index}
              className={`group flex flex-col md:flex-row md:items-center justify-between py-2 px-3 rounded-lg hover:bg-white/80 transition-colors ${
                searchQuery && subTopic.name.toLowerCase().includes(searchLower) 
                  ? 'bg-teal-50 ring-1 ring-teal-200' 
                  : ''
              }`}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  hoveredItem === index ? 'bg-teal-600' : 'bg-teal-500'
                }`} />
                <span className="text-gray-700">{highlightMatch(subTopic.name)}</span>
              </div>
              <button 
                className="mt-2 md:mt-0 px-4 py-1.5 text-sm font-medium text-teal-600 bg-white rounded-full border border-teal-600 hover:bg-teal-50 transition-all transform hover:scale-105 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 md:opacity-0 md:group-hover:opacity-100"
                onClick={() => handleStartQuiz(subTopic.name)}
                aria-label={`Start ${subTopic.name} quiz`}
              >
                <span className="flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  Quiz
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}