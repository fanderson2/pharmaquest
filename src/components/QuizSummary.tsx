import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

interface QuizSummaryProps {
  totalQuestions: number;
  correctAnswers: number;
  topic: string;
  subtopic?: string;
  onRetry: () => void;
}

export default function QuizSummary({ 
  totalQuestions, 
  correctAnswers, 
  topic,
  subtopic
}: QuizSummaryProps) {
  const navigate = useNavigate();
  const incorrectAnswers = totalQuestions - correctAnswers;

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
        onClick={() => navigate('/')}
        className="w-full py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Topics</span>
      </button>
    </div>
  );
}