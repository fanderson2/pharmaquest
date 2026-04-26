import { supabase } from '../lib/supabase';
import type { LeaderboardEntry, WeeklyLeaderboardEntry, MyRank } from '../types/leaderboard';

// ─── 5-minute in-memory cache ────────────────────────────────────────────────
interface CacheEntry<T> { data: T; fetchedAt: number }
const TTL = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > TTL) { cache.delete(key); return null; }
  return entry.data;
}
function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, fetchedAt: Date.now() });
}
export function invalidateLeaderboardCache(): void { cache.clear(); }

// ─── All-time leaderboard ────────────────────────────────────────────────────
export async function fetchAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  const cached = getCached<LeaderboardEntry[]>('all_time');
  if (cached) return cached;
  const { data, error } = await supabase.from('leaderboard_view').select('*');
  if (error) throw error;
  const result = (data ?? []) as LeaderboardEntry[];
  setCached('all_time', result);
  return result;
}

// ─── Weekly leaderboard ───────────────────────────────────────────────────────
export async function fetchWeeklyLeaderboard(): Promise<WeeklyLeaderboardEntry[]> {
  const cached = getCached<WeeklyLeaderboardEntry[]>('weekly');
  if (cached) return cached;
  const { data, error } = await supabase.rpc('get_weekly_leaderboard');
  if (error) throw error;
  const result = (data ?? []) as WeeklyLeaderboardEntry[];
  setCached('weekly', result);
  return result;
}

// ─── User's own rank (not cached — always fresh) ─────────────────────────────
export async function fetchMyRank(userId: string): Promise<MyRank | null> {
  const { data, error } = await supabase.rpc('get_my_leaderboard_rank', {
    p_user_id: userId,
  });
  if (error) throw error;
  if (!data || data.length === 0) return null;
  const row = data[0] as {
    all_time_rank: number | null;
    weekly_rank: number | null;
    weekly_xp: number | null;
    above_username: string | null;
    above_xp: number | null;
  };
  return {
    all_time_rank: row.all_time_rank ?? 1,
    weekly_rank: row.weekly_rank ?? 1,
    weekly_xp: row.weekly_xp ?? 0,
    above_username: row.above_username,
    above_xp: row.above_xp,
  };
}

// ─── Privacy toggle ───────────────────────────────────────────────────────────
export async function updateLeaderboardVisibility(
  userId: string,
  show: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ show_on_leaderboard: show })
    .eq('user_id', userId);
  if (error) throw error;
  invalidateLeaderboardCache();
}
