export interface Profile {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  university: string | null;
  exam_date: string | null;
  created_at: string;
  updated_at: string;
  // Gamification (added in gamification migration)
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_xp: number;
  show_on_leaderboard: boolean;
}
