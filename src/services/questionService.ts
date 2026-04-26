import { supabase } from '../lib/supabase';
import { Question } from '../types/question';

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
  const { data, error } = await supabase
    .from('question_table')
    .select('*')
    .eq('topic_id', topicId);

  if (error) throw error;

  return data.map(row => ({
    id: row.question_id,
    text: row.question_text,
    options: [
      row.option_1,
      row.option_2,
      row.option_3,
      row.option_4,
      row.option_5
    ].filter(Boolean), // Remove null/empty options
    correctAnswer: row.correct_answer,
    explanation: row.explanation
  }));
}

export async function fetchQuestionsForTopicAndSubtopic(
  topicId: string,
  subtopic: string
): Promise<Question[]> {
  const { data, error } = await supabase
    .from('question_table')
    .select('*')
    .eq('topic_id', topicId)
    .ilike('question_text', `%${subtopic}%`);

  if (error) throw error;

  return data.map(row => ({
    id: row.question_id,
    text: row.question_text,
    options: [
      row.option_1,
      row.option_2,
      row.option_3,
      row.option_4,
      row.option_5
    ].filter(Boolean),
    correctAnswer: row.correct_answer,
    explanation: row.explanation
  }));
}