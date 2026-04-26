import { supabase } from '../lib/supabase';
import type { TopicStat } from '../types/heatmap';
import type { Question } from '../types/question';

export async function fetchTopicStats(userId: string): Promise<TopicStat[]> {
  const { data, error } = await supabase
    .from('user_topic_stats')
    .select('topic, total_attempts, correct_attempts, accuracy_percentage, last_attempted')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as TopicStat[];
}

export async function fetchFocusQuestions(userId: string, limit = 20): Promise<Question[]> {
  const { data, error } = await supabase.rpc('get_focus_questions', {
    p_user_id: userId,
    p_limit: limit,
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
