import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { fetchTopicStats, fetchFocusQuestions } from '../services/heatmapService';
import ProGate from './ProGate';
import type { TopicStat } from '../types/heatmap';
import type { Section } from '../types/topic';

type SortKey = 'weakest' | 'most_practiced' | 'recent' | 'alphabetical';

interface MergedTopic {
  id: string;
  title: string;
  sectionId: string;
  stat: TopicStat | null;
}

interface Props {
  sections: Section[];
}

// ─── SVG arc progress ring ───────────────────────────────────────────────────
// r = 15.9155 → circumference ≈ 100, so strokeDasharray maps 1:1 to %
function AccuracyRing({ accuracy, color }: { accuracy: number | null; color: string }) {
  const r = 15.9155;
  const pct = accuracy ?? 0;
  return (
    <svg viewBox="0 0 36 36" width="44" height="44" aria-hidden="true">
      {/* Track */}
      <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
      {/* Progress arc */}
      {pct > 0 && (
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeDashoffset="25"
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
      )}
      {/* Centre label */}
      <text
        x="18"
        y="18"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="8"
        fontWeight="700"
        fill={accuracy === null ? '#9ca3af' : color}
      >
        {accuracy === null ? '—' : `${pct}%`}
      </text>
    </svg>
  );
}

// ─── Cell colour scheme ───────────────────────────────────────────────────────
function cellStyle(accuracy: number | null): {
  bg: string;
  border: string;
  ringColor: string;
  label: string;
} {
  if (accuracy === null)  return { bg: 'bg-gray-50',    border: 'border-gray-200',   ringColor: '#9ca3af', label: 'text-gray-400' };
  if (accuracy < 50)      return { bg: 'bg-red-50',     border: 'border-red-200',    ringColor: '#dc2626', label: 'text-red-600'  };
  if (accuracy < 75)      return { bg: 'bg-amber-50',   border: 'border-amber-200',  ringColor: '#d97706', label: 'text-amber-600' };
  return                         { bg: 'bg-emerald-50', border: 'border-emerald-200', ringColor: '#059669', label: 'text-emerald-600' };
}

// ─── Sort logic ──────────────────────────────────────────────────────────────
function applySortTopics(topics: MergedTopic[], sort: SortKey): MergedTopic[] {
  const copy = [...topics];
  switch (sort) {
    case 'weakest':
      return copy.sort((a, b) => {
        if (!a.stat && !b.stat) return 0;
        if (!a.stat) return 1;
        if (!b.stat) return -1;
        return a.stat.accuracy_percentage - b.stat.accuracy_percentage;
      });
    case 'most_practiced':
      return copy.sort((a, b) => {
        if (!a.stat && !b.stat) return 0;
        if (!a.stat) return 1;
        if (!b.stat) return -1;
        return b.stat.total_attempts - a.stat.total_attempts;
      });
    case 'recent':
      return copy.sort((a, b) => {
        if (!a.stat && !b.stat) return 0;
        if (!a.stat) return 1;
        if (!b.stat) return -1;
        return new Date(b.stat.last_attempted).getTime() - new Date(a.stat.last_attempted).getTime();
      });
    case 'alphabetical':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
}

const SORT_LABELS: Record<SortKey, string> = {
  weakest:       'Weakest first',
  most_practiced:'Most practiced',
  recent:        'Recently practiced',
  alphabetical:  'Alphabetical',
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function WeaknessHeatmap({ sections }: Props) {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();

  const [stats, setStats] = useState<TopicStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('weakest');
  const [focusLoading, setFocusLoading] = useState(false);
  const [focusError, setFocusError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchTopicStats(user.id)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Merge sections list with stats — every topic appears, attempted or not
  const allTopics: MergedTopic[] = sections.flatMap((s) =>
    s.topics.map((t) => ({ id: t.id, title: t.title, sectionId: s.id, stat: null }))
  );
  const statsMap = new Map(stats.map((s) => [s.topic, s]));
  const merged = allTopics.map((t) => ({ ...t, stat: statsMap.get(t.id) ?? null }));
  const sorted = applySortTopics(merged, sort);

  const weakCount = stats.filter((s) => s.accuracy_percentage < 70).length;
  const hasAttempts = stats.length > 0;

  const handleFocusMode = async () => {
    if (!user) return;
    setFocusLoading(true);
    setFocusError(null);
    try {
      const questions = await fetchFocusQuestions(user.id, 20);
      if (questions.length === 0) {
        setFocusError('No weak topics found — great work! All your topics are above 70%.');
        return;
      }
      navigate('/quiz/__focus__', { state: { questions } });
    } catch {
      setFocusError('Failed to load focus questions. Please try again.');
    } finally {
      setFocusLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-6 bg-teal-500 rounded-full" />
          <h2 className="text-lg font-bold text-gray-800">Performance Heatmap</h2>
        </div>
        <ProGate
          feature="Weakness Heatmap"
          description="See exactly where you're losing marks. Visual topic breakdowns updated after every quiz."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-6 bg-teal-500 rounded-full" />
          <h2 className="text-lg font-bold text-gray-800">Performance Heatmap</h2>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-teal-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-800">Performance Heatmap</h2>
          </div>
          <p className="text-sm text-gray-500 ml-5">
            {hasAttempts
              ? `${stats.length} topic${stats.length !== 1 ? 's' : ''} attempted · ${weakCount} below 70%`
              : 'Complete your first quiz to populate this heatmap'}
          </p>
        </div>

        {/* Focus Mode CTA */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <button
            onClick={handleFocusMode}
            disabled={focusLoading || !hasAttempts || weakCount === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            {focusLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Focus Mode
            {weakCount > 0 && (
              <span className="bg-white/25 text-white text-xs px-1.5 py-0.5 rounded-full">
                {weakCount}
              </span>
            )}
          </button>
          {weakCount === 0 && hasAttempts && (
            <p className="text-xs text-emerald-600 font-medium">All topics ≥ 70% — great work!</p>
          )}
          {focusError && (
            <p className="text-xs text-red-500 max-w-[220px] text-right">{focusError}</p>
          )}
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              sort === key
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {SORT_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" />
          0–49% (weak)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
          50–74%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" />
          75–100% (strong)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300 inline-block" />
          Not attempted
        </span>
      </div>

      {/* Grid */}
      {!hasAttempts ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium text-gray-600">No quiz data yet</p>
          <p className="mt-1">Take your first quiz and your personalised heatmap will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {sorted.map((topic) => {
            const accuracy = topic.stat?.accuracy_percentage ?? null;
            const { bg, border, ringColor, label } = cellStyle(accuracy);
            return (
              <button
                key={topic.id}
                onClick={() => navigate(`/quiz/${topic.id}`)}
                className={`${bg} border-2 ${border} rounded-xl p-3 text-left hover:shadow-md hover:scale-[1.02] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400`}
                title={topic.title}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <AccuracyRing accuracy={accuracy} color={ringColor} />
                </div>
                <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mt-1">
                  {topic.title}
                </p>
                {topic.stat ? (
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                    {topic.stat.total_attempts} attempt{topic.stat.total_attempts !== 1 ? 's' : ''}
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-300 mt-1">Not attempted</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
