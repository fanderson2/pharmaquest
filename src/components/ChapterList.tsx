import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';
import { useSearch } from '../context/SearchContext';

interface ChapterProps {
  chapter: {
    id: string;
    title: string;
    subtopics: string[];
  };
}

export default function ChapterList({ chapter }: ChapterProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { searchQuery } = useSearch();

  const searchLower = searchQuery.toLowerCase();
  const matchingItems = chapter.subtopics.filter(item => 
    item.toLowerCase().includes(searchLower)
  );

  const topicMatches = chapter.title.toLowerCase().includes(searchLower);
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

  const handleStartQuiz = (subtopic?: string) => {
    const path = subtopic 
      ? `/quiz/${chapter.id}/${encodeURIComponent(subtopic)}`
      : `/quiz/${chapter.id}`;
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

  return (
    <div className="mt-2">
      <div 
        className={`flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
          topicMatches ? 'bg-teal-50 ring-2 ring-teal-200' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-teal-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-teal-600" />
          )}
          <span className="font-medium">{highlightMatch(chapter.title)}</span>
        </div>
        <button 
          className="px-4 py-1.5 text-sm font-medium text-teal-600 bg-white rounded-full border border-teal-600 hover:bg-teal-50 transition-all"
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
      </div>
      
      {isExpanded && (
        <div className="mt-1 pl-4 space-y-1">
          {(searchQuery ? matchingItems : chapter.subtopics).map((item, index) => (
            <div 
              key={index}
              className="group flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/80"
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  hoveredItem === index ? 'bg-teal-600' : 'bg-teal-500'
                }`} />
                <span className="text-gray-700">{highlightMatch(item)}</span>
              </div>
              <button 
                className="px-4 py-1.5 text-sm font-medium text-teal-600 bg-white rounded-full border border-teal-600 hover:bg-teal-50 transition-all opacity-0 group-hover:opacity-100"
                onClick={() => handleStartQuiz(item)}
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