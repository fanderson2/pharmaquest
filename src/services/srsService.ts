import { supabase } from '../lib/supabase';
import { SRSData, QuestionSRSData } from '../types/srs';
import { withRetry } from '../utils/retry';

export async function fetchUserSRSData(userId: string): Promise<QuestionSRSData> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('srs_data')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Optimize data transformation with reduce
    return data.reduce((srsData: QuestionSRSData, record) => {
      srsData[record.question_id] = {
        repetitionCount: record.repetition_count,
        interval: record.interval,
        easinessFactor: record.easiness_factor,
        nextReviewDate: new Date(record.next_review_date),
        lastReviewDate: new Date(record.last_review_date)
      };
      return srsData;
    }, {});
  });
}

export async function updateUserSRSData(
  userId: string,
  questionId: string,
  srsData: SRSData
): Promise<void> {
  return withRetry(async () => {
    // Use upsert instead of separate select + insert/update
    const { error } = await supabase
      .from('srs_data')
      .upsert({
        user_id: userId,
        question_id: questionId,
        repetition_count: srsData.repetitionCount,
        interval: srsData.interval,
        easiness_factor: srsData.easinessFactor,
        next_review_date: srsData.nextReviewDate.toISOString(),
        last_review_date: srsData.lastReviewDate.toISOString()
      }, {
        onConflict: 'user_id,question_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  });
}