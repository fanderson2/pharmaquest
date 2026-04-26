import { supabase } from '../lib/supabase';

export interface ReadinessPoint {
  score: number;
  calculated_at: string; // ISO date string
}

export interface BreakdownFactor {
  factor_name: string;
  raw_value: number; // 0-100
  weight: number;    // e.g. 0.35
}

export async function fetchReadinessScore(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_exam_readiness', {
    p_user_id: userId,
  });
  if (error) throw error;
  return (data as number) ?? 0;
}

export async function fetchReadinessBreakdown(userId: string): Promise<BreakdownFactor[]> {
  const { data, error } = await supabase.rpc('get_readiness_breakdown', {
    p_user_id: userId,
  });
  if (error) throw error;
  return (data ?? []) as BreakdownFactor[];
}

export async function fetchReadinessHistory(
  userId: string,
  days = 30,
): Promise<ReadinessPoint[]> {
  const { data, error } = await supabase
    .from('readiness_history')
    .select('score, calculated_at')
    .eq('user_id', userId)
    .order('calculated_at', { ascending: false })
    .limit(days);
  if (error) throw error;
  // Return in chronological order (oldest first) for sparkline plotting
  return ((data ?? []) as ReadinessPoint[]).reverse();
}
