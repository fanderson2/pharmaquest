import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Flame, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import {
  fetchAllTimeLeaderboard,
  fetchWeeklyLeaderboard,
  fetchMyRank,
} from '../services/leaderboardService';
import type { LeaderboardEntry, WeeklyLeaderboardEntry, MyRank } from '../types/leaderboard';

type Tab = 'all_time' | 'weekly';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100));
}

function medal(rank: number) {
  if (rank === 1) return <span className="text-2xl leading-none">🥇</span>;
  if (rank === 2) return <span className="text-2xl leading-none">🥈</span>;
  if (rank === 3) return <span className="text-2xl leading-none">🥉</span>;
  return (
    <span className="text-sm font-semibold text-gray-500 tabular-nums">#{rank}</span>
  );
}

function rowBg(rank: number, isMe: boolean) {
  if (isMe) return 'bg-teal-50 border-l-4 border-teal-500';
  if (rank === 1) return 'bg-amber-50 border-l-4 border-amber-400';
  if (rank === 2) return 'bg-slate-50 border-l-4 border-slate-300';
  if (rank === 3) return 'bg-orange-50 border-l-4 border-orange-300';
  return 'border-l-4 border-transparent';
}

// ─── Row component ────────────────────────────────────────────────────────────

interface RowProps {
  rank: number;
  username: string;
  level: number;
  xp: number;
  xpLabel: string;
  streak: number;
  isMe: boolean;
  isStickyNote?: string; // shown when row is appended outside top 100
}

function LeaderboardRow({ rank, username, level, xp, xpLabel, streak, isMe, isStickyNote }: RowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${rowBg(rank, isMe)}`}
    >
      {/* Rank / medal */}
      <div className="w-10 flex justify-center shrink-0">{medal(rank)}</div>

      {/* Username */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isMe ? 'text-teal-700' : 'text-gray-800'}`}>
          {username}
          {isMe && <span className="ml-1.5 text-xs text-teal-500 font-normal">(you)</span>}
        </p>
        {isStickyNote && (
          <p className="text-xs text-gray-400">{isStickyNote}</p>
        )}
      </div>

      {/* Level */}
      <div className="hidden sm:block w-14 text-center">
        <span className="inline-block text-xs font-bold text-teal-700 bg-teal-100 rounded-full px-2 py-0.5">
          Lv {level}
        </span>
      </div>

      {/* XP */}
      <div className="w-24 text-right">
        <p className="text-sm font-semibold text-gray-700 tabular-nums">{xp.toLocaleString()}</p>
        <p className="text-[10px] text-gray-400">{xpLabel}</p>
      </div>

      {/* Streak */}
      <div className="w-16 flex items-center justify-end gap-1">
        <Flame className={`h-3.5 w-3.5 ${streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
        <span className="text-sm font-medium text-gray-600 tabular-nums">{streak}</span>
      </div>
    </div>
  );
}

// ─── Column headers ───────────────────────────────────────────────────────────

function TableHeader({ xpLabel }: { xpLabel: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
      <div className="w-10 text-center">Rank</div>
      <div className="flex-1">User</div>
      <div className="hidden sm:block w-14 text-center">Level</div>
      <div className="w-24 text-right">{xpLabel}</div>
      <div className="w-16 text-right">Streak</div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-4xl mb-3">🏆</p>
      <p className="text-lg font-semibold text-gray-700">Be the first on the leaderboard</p>
      <p className="text-sm text-gray-500 mt-1 mb-6">Start a quiz to earn XP and claim the top spot.</p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Start a quiz now
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const [tab, setTab] = useState<Tab>('all_time');
  const [allTime, setAllTime] = useState<LeaderboardEntry[]>([]);
  const [weekly, setWeekly] = useState<WeeklyLeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchAllTimeLeaderboard(),
      fetchWeeklyLeaderboard(),
      fetchMyRank(user.id),
    ])
      .then(([at, wk, rank]) => {
        setAllTime(at);
        setWeekly(wk);
        setMyRank(rank);
      })
      .catch(() => setError('Failed to load leaderboard. Please try again.'))
      .finally(() => setLoading(false));
  }, [user]);

  const myUserId = user?.id ?? '';
  const myUsername = profile?.username ?? (user?.user_metadata?.name as string | undefined) ?? 'You';
  const myXP = profile?.total_xp ?? 0;
  const myStreak = profile?.current_streak ?? 0;
  const myLevel = calcLevel(myXP);

  // ── All-time helpers ──
  const allTimeInTop = allTime.some((e) => e.user_id === myUserId);
  const allTimeMyIndex = allTime.findIndex((e) => e.user_id === myUserId);

  // ── Weekly helpers ──
  const weeklyInTop = weekly.some((e) => e.user_id === myUserId);
  const myWeeklyEntry = weekly.find((e) => e.user_id === myUserId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const isAllTime = tab === 'all_time';
  const entries = isAllTime ? allTime : weekly;
  const isEmpty = entries.length === 0;
  const xpLabel = isAllTime ? 'Total XP' : 'Week XP';

  // Is the current user in the displayed list?
  const userInList = isAllTime ? allTimeInTop : weeklyInTop;

  // Sticky row rank number
  const stickyRank = isAllTime
    ? (myRank?.all_time_rank ?? allTime.length + 1)
    : (myRank?.weekly_rank ?? weekly.length + 1);

  // Weekly XP for the sticky row
  const stickyXP = isAllTime ? myXP : (myRank?.weekly_xp ?? 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-sm text-gray-500">Top 100 trainees by XP</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {(['all_time', 'weekly'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'all_time' ? 'All Time' : 'This Week'}
            </button>
          ))}
        </div>

        {/* Leaderboard card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <>
              <TableHeader xpLabel={xpLabel} />

              <div className="divide-y divide-gray-50">
                {entries.map((entry, i) => {
                  const rank = i + 1;
                  const isMe = entry.user_id === myUserId;
                  const xp = isAllTime
                    ? (entry as LeaderboardEntry).total_xp
                    : (entry as WeeklyLeaderboardEntry).weekly_xp;
                  return (
                    <LeaderboardRow
                      key={entry.user_id}
                      rank={rank}
                      username={entry.username}
                      level={entry.level}
                      xp={xp}
                      xpLabel={xpLabel}
                      streak={entry.current_streak}
                      isMe={isMe}
                    />
                  );
                })}
              </div>

              {/* Sticky row: current user not in top 100 */}
              {!userInList && (
                <>
                  <div className="border-t-2 border-dashed border-gray-200 my-0" />
                  <div className="px-4 py-1.5 text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50">
                    Your position
                  </div>
                  <LeaderboardRow
                    rank={stickyRank}
                    username={myUsername}
                    level={myLevel}
                    xp={stickyXP}
                    xpLabel={xpLabel}
                    streak={myStreak}
                    isMe
                    isStickyNote={stickyRank > 100 ? 'Outside top 100' : undefined}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Privacy preference can be changed in{' '}
          <Link to="/settings" className="text-teal-600 hover:underline">Settings</Link>.
        </p>
      </div>
    </div>
  );
}
