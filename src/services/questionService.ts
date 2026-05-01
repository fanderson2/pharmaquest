import { supabase } from '../lib/supabase';
import { Question } from '../types/question';
import { questionBank } from '../data/questionBank';

export interface QuizAttemptPayload {
  user_id: string;
  question_id: string;
  topic: string;
  user_answer: string;
  is_correct: boolean;
  time_taken_seconds?: number;
}

export async function recordQuizAttempt(attempt: QuizAttemptPayload): Promise<void> {
  const { error } = await supabase.from('quiz_attempts').insert(attempt);
  if (error) throw error;
}

export async function fetchQuestionsForTopic(topicId: string): Promise<Question[]> {
  return questionBank[topicId] ?? [];
}

export async function fetchQuestionsForTopicAndSubtopic(
  topicId: string,
  subtopic: string
): Promise<Question[]> {
  const all = questionBank[topicId] ?? [];
  const lower = subtopic.toLowerCase();
  return all.filter(q => q.text.toLowerCase().includes(lower));
}