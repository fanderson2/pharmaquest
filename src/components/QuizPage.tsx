import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, ArrowRight, Flag } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useSubscription } from '../hooks/useSubscription';
import { useFreeTopic } from '../hooks/useFreeTopic';
import { useSRS } from '../hooks/useSRS';
import { useProgress } from '../hooks/useProgress';
import QuizSummary from './QuizSummary';
import MilestoneToast from './MilestoneToast';
import { sections } from '../data/sections';
import { getAvailableQuestionCount } from '../utils/questionCounter';
import { recordQuizAttempt } from '../services/questionService';
import type { Question } from '../types/question';

const MILESTONE_XP: Record<number, number> = { 7: 50, 30: 100, 100: 250 };

export default function QuizPage() {
  const { topic, subtopic } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFocusMode = topic === '__focus__';
  const { isActive, loading: subLoading } = useSubscription();
  const freeTopicId = useFreeTopic();
  const { user } = useAuth();
  const { updateQuestionSRS } = useSRS();
  const { updateProgress, updateQuestionStatus, progress } = useProgress();
  const {
    questions,
    currentQuestion,
    currentQuestionIndex,
    selectedAnswer,
    isAnswerSubmitted,
    hasNextQuestion,
    correctAnswers,
    isQuizComplete,
    setQuestions,
    setSelectedAnswer,
    submitAnswer,
    getQuestionsForTopic,
    moveToNextQuestion,
    resetQuiz
  } = useQuiz();

  const { profile, refreshProfile } = useProfile();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Redirect non-subscribers away from locked topics (skip for focus mode)
  useEffect(() => {
    if (isFocusMode || subLoading || isActive || freeTopicId === null) return;
    if (topic && !freeTopicId.has(topic)) {
      navigate('/dashboard', { replace: true });
    }
  }, [isFocusMode, subLoading, isActive, freeTopicId, topic, navigate]);

  // Find the section that contains this topic
  const section = sections.find(section => 
    section.topics.some(t => t.id === topic)
  );

  useEffect(() => {
    async function loadQuestions() {
      if (!topic) return;
      setLoading(true);
      try {
        if (isFocusMode) {
          // Questions pre-loaded by WeaknessHeatmap and passed via nav state
          const focusQuestions = (location.state as { questions?: import('../types/question').Question[] } | null)?.questions ?? [];
          setQuestions(focusQuestions);
        } else {
          const quizQuestions = await getQuestionsForTopic(
            decodeURIComponent(topic),
            subtopic ? decodeURIComponent(subtopic) : undefined
          );
          setQuestions(quizQuestions);
        }
        resetQuiz();
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [topic, subtopic, isFocusMode]);

  // Reset per-question timer whenever the question advances
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentQuestionIndex]);

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !selectedAnswer) return;
    if (!isFocusMode && (!section?.id || !topic)) return;

    setSubmitting(true);
    try {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const timeTaken = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
      const oldStreak = profile?.current_streak ?? 0;
      // In focus mode use the question's own topicId; otherwise use the URL topic param
      const recordTopic = currentQuestion.topicId ?? topic ?? '__focus__';

      const ops: Promise<unknown>[] = [updateQuestionSRS(currentQuestion.id, isCorrect)];

      if (!isFocusMode && section?.id && topic) {
        ops.push(updateQuestionStatus(section.id, topic, currentQuestion.id, isCorrect));
      }

      if (user) {
        ops.push(
          recordQuizAttempt({
            user_id: user.id,
            question_id: currentQuestion.id,
            topic: recordTopic,
            user_answer: selectedAnswer,
            is_correct: isCorrect,
            time_taken_seconds: timeTaken,
          })
        );
      }

      await Promise.all(ops);

      // Refresh profile so streak/XP widgets update, and detect milestone
      if (user) {
        const newProfile = await refreshProfile();
        const newStreak = newProfile?.current_streak ?? 0;
        if (newStreak > oldStreak && newStreak in MILESTONE_XP) {
          setMilestoneStreak(newStreak);
        }
      }

      submitAnswer();
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!isFocusMode && !hasNextQuestion && topic && section?.id && user) {
      const availableQuestions = getAvailableQuestionCount(topic, progress, section.id, subtopic);
      const progressPercentage = Math.round((correctAnswers / availableQuestions) * 100);
      await updateProgress(section.id, progressPercentage);
    }
    moveToNextQuestion();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Topics</span>
          </button>
          <div className="bg-white rounded-xl p-6 md:p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              No questions available for this topic yet
            </h2>
            <p className="text-gray-600">
              We're working on adding more questions. Please check back later!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableQuestions = getAvailableQuestionCount(topic!, progress, section?.id || '', subtopic);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Topics</span>
        </button>

        {isQuizComplete ? (
          <QuizSummary
            totalQuestions={availableQuestions}
            correctAnswers={correctAnswers}
            topic={decodeURIComponent(topic!)}
            subtopic={subtopic ? decodeURIComponent(subtopic) : undefined}
            showUpgrade={!isActive}
            onRetry={async () => {
              resetQuiz();
              if (topic) {
                const quizQuestions = await getQuestionsForTopic(
                  decodeURIComponent(topic), 
                  subtopic ? decodeURIComponent(subtopic) : undefined
                );
                setQuestions(quizQuestions);
              }
            }}
          />
        ) : (
          <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 break-words">
                  {isFocusMode ? '⚡ Focus Mode' : (subtopic || topic)}
                </h1>
                <div className="h-1 w-24 bg-teal-500 rounded"></div>
              </div>
              <span className="text-sm md:text-base text-gray-500 whitespace-nowrap ml-4">
                Question {currentQuestionIndex + 1} of {availableQuestions}
              </span>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-lg md:text-xl text-gray-800 font-medium mb-4 md:mb-6 break-words">
                  {currentQuestion.text}
                </h2>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !isAnswerSubmitted && setSelectedAnswer(option)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3 md:p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswer === option
                          ? isAnswerSubmitted
                            ? option === currentQuestion.correctAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-teal-600 bg-teal-50'
                          : isAnswerSubmitted && option === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-teal-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          selectedAnswer === option
                            ? isAnswerSubmitted
                              ? option === currentQuestion.correctAnswer
                                ? 'bg-green-500'
                                : 'bg-red-500'
                              : 'bg-teal-600'
                            : 'bg-gray-200'
                        }`}>
                          <span className="text-white text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <span className={`flex-1 break-words ${
                          selectedAnswer === option
                            ? isAnswerSubmitted
                              ? option === currentQuestion.correctAnswer
                                ? 'text-green-700'
                                : 'text-red-700'
                              : 'text-teal-700'
                            : 'text-gray-700'
                        }`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!isAnswerSubmitted && selectedAnswer && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Answer</span>
                  )}
                </button>
              )}

              {isAnswerSubmitted && (
                <div className="space-y-6">
                  <div className={`p-4 md:p-6 rounded-lg ${
                    selectedAnswer === currentQuestion.correctAnswer 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                      )}
                      <div>
                        <h3 className={`font-semibold mb-2 ${
                          selectedAnswer === currentQuestion.correctAnswer 
                            ? 'text-green-800' 
                            : 'text-red-800'
                        }`}>
                          {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                        </h3>
                        <p className={`text-sm break-words ${
                          selectedAnswer === currentQuestion.correctAnswer 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {hasNextQuestion ? (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Finish Quiz</span>
                      <Flag className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {milestoneStreak !== null && (
        <MilestoneToast
          streak={milestoneStreak}
          xpBonus={MILESTONE_XP[milestoneStreak] ?? 0}
          onDismiss={() => setMilestoneStreak(null)}
        />
      )}
    </div>
  );
}