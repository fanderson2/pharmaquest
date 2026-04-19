import { supabase } from '../lib/supabase';
import { Progress, TopicProgress, QuestionProgress } from '../types/progress';
import { withRetry } from '../utils/retry';

export async function fetchUserProgress(userId: string): Promise<Progress> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Transform data into the expected format with optimized iteration
    return data.reduce((progress: Progress, record) => {
      const topicKey = `${record.section_id}_${record.topic_id}_questions`;
      if (!progress[topicKey]) {
        progress[topicKey] = {};
      }
      (progress[topicKey] as TopicProgress)[record.question_id] = {
        completed: record.completed,
        correct: record.correct,
        lastAttempted: record.last_attempted,
        attempts: record.attempts
      };
      return progress;
    }, {});
  });
}

export async function updateUserProgress(
  userId: string,
  sectionId: string,
  progress: number
): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from('user_progress_summary')
      .upsert({
        user_id: userId,
        section_id: sectionId,
        progress_percentage: progress,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,section_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  });
}

export async function updateQuestionProgress(
  userId: string,
  sectionId: string,
  topicId: string,
  questionId: string,
  isCorrect: boolean
): Promise<void> {
  return withRetry(async () => {
    // Use upsert instead of separate select + insert/update
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        section_id: sectionId,
        topic_id: topicId,
        question_id: questionId,
        completed: true,
        correct: isCorrect,
        attempts: 1, // Will be incremented by the database trigger
        last_attempted: new Date().toISOString()
      }, {
        onConflict: 'user_id,section_id,topic_id,question_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  });
}