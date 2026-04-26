export interface LeaderboardEntry {
  user_id: string;
  username: string;
  current_streak: number;
  total_xp: number;
  level: number;
}

export interface WeeklyLeaderboardEntry {
  user_id: string;
  username: string;
  weekly_xp: number;
  current_streak: number;
  total_xp: number;
  level: number;
}

export interface MyRank {
  all_time_rank: number;
  weekly_rank: number;
  weekly_xp: number;
  above_username: string | null;
  above_xp: number | null;
}
