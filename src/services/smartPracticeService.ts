import { supabase } from '../lib/supabase';
import type { Question } from '../types/question';

export async function fetchSmartQuiz(userId: string, count = 20): Promise<Question[]> {
  const { data, error } = await supabase.rpc('get_smart_quiz', {
    p_user_id: userId,
    p_count: count,
  });
  if (error) throw error;
  return ((data ?? []) as Record<string, string>[]).map((row) => ({
    id: row.question_id,
    topicId: row.topic_id,
    text: row.question_text,
    options: [row.option_1, row.option_2, row.option_3, row.option_4, row.option_5].filter(Boolean),
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
  }));
}
