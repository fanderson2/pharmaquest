import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { fetchMyRank } from '../services/leaderboardService';
import ProGate from './ProGate';
import type { MyRank } from '../types/leaderboard';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export default function RankCard() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [rank, setRank] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMyRank(user.id)
      .then(setRank)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!isPro) {
    return (
      <ProGate
        feature="Trainee Leaderboard"
        description="See how you rank against pre-reg trainees nationwide and track your weekly XP."
        compact
      />
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-6 bg-gray-100 rounded w-1/2" />
      </div>
    );
  }

  // No rank data yet (no quiz attempts / not on leaderboard)
  if (!rank || (rank.weekly_xp === 0 && rank.all_time_rank === 1)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Join the leaderboard</p>
            <p className="text-xs text-gray-500">Complete a quiz to earn XP and get ranked.</p>
          </div>
        </div>
        <Link
          to="/leaderboard"
          className="shrink-0 text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const weeklyXPGap =
    rank.above_xp !== null ? rank.above_xp - (rank.all_time_rank > 1 ? 0 : 0) : null;

  // XP needed to overtake the person directly above (all-time)
  // above_xp is their total_xp; to overtake them we need at least above_xp + 1
  // The gap from the current user requires knowing the user's own XP, which is in profile.
  // We approximate using the rank data: above_xp is the competitor's XP.
  // The actual gap is above_xp - current_user_xp + 1.
  // Since we don't have current_user_xp in MyRank, we just show the competitor's name.

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-0.5">Your ranking</p>
            <div className="flex items-baseline gap-3">
              <p className="text-xl font-bold text-gray-900">
                {ordinal(rank.weekly_rank)}
                <span className="text-sm font-normal text-gray-500 ml-1">this week</span>
              </p>
              <p className="text-sm text-gray-400">
                {ordinal(rank.all_time_rank)} all-time
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/leaderboard"
          className="shrink-0 text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 mt-1"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Competitive nudge */}
      {rank.above_username && (
        <div className="mt-3 flex items-center gap-2 text-xs text-teal-700 bg-teal-50 rounded-lg px-3 py-2">
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          <span>
            Keep going to overtake{' '}
            <span className="font-semibold">{rank.above_username}</span> and climb the rankings!
          </span>
        </div>
      )}

      {/* Weekly XP earned this week */}
      {rank.weekly_xp > 0 && (
        <p className="text-xs text-gray-400 mt-2 ml-12">
          {rank.weekly_xp.toLocaleString()} XP earned this week
        </p>
      )}
    </div>
  );
}
