import React, { createContext, useContext, useState } from 'react';
import type { Question } from '../types/question';
import { fetchQuestionsForTopic, fetchQuestionsForTopicAndSubtopic } from '../services/questionService';

export interface IncorrectAnswer {
  question: Question;
  selectedAnswer: string;
}

interface QuizContextType {
  questions: Question[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  isAnswerSubmitted: boolean;
  hasNextQuestion: boolean;
  correctAnswers: number;
  isQuizComplete: boolean;
  incorrectAnswers: IncorrectAnswer[];
  setQuestions: (questions: Question[]) => void;
  setSelectedAnswer: (answer: string) => void;
  submitAnswer: () => void;
  getQuestionsForTopic: (topic: string, subtopic?: string) => Promise<Question[]>;
  moveToNextQuestion: () => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([]);
  const currentQuestion = questions[currentQuestionIndex] || null;
  const hasNextQuestion = currentQuestionIndex < questions.length - 1;

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const submitAnswer = () => {
    if (selectedAnswer && currentQuestion) {
      setIsAnswerSubmitted(true);
      if (selectedAnswer === currentQuestion.correctAnswer) {
        setCorrectAnswers(prev => prev + 1);
      } else {
        setIncorrectAnswers(prev => [...prev, { question: currentQuestion, selectedAnswer }]);
      }
    }
  };

  const moveToNextQuestion = () => {
    if (hasNextQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswers(0);
    setIsQuizComplete(false);
    setIncorrectAnswers([]);
  };

  const getQuestionsForTopic = async (topic: string, subtopic?: string): Promise<Question[]> => {
    try {
      const allTopicQuestions = subtopic
        ? await fetchQuestionsForTopicAndSubtopic(topic, subtopic)
        : await fetchQuestionsForTopic(topic);

      return shuffleArray(allTopicQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  };

  const value = {
    questions,
    currentQuestion,
    currentQuestionIndex,
    selectedAnswer,
    isAnswerSubmitted,
    hasNextQuestion,
    correctAnswers,
    isQuizComplete,
    incorrectAnswers,
    setQuestions,
    setSelectedAnswer,
    submitAnswer,
    getQuestionsForTopic,
    moveToNextQuestion,
    resetQuiz
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}