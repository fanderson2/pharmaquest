import React, { useEffect, useRef, useState } from 'react';
import { Info, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useSubscription } from '../hooks/useSubscription';
import ProGate from './ProGate';
import {
  fetchReadinessScore,
  fetchReadinessBreakdown,
  fetchReadinessHistory,
  type ReadinessPoint,
  type BreakdownFactor,
} from '../services/readinessService';

// ─── Constants ────────────────────────────────────────────────────────────────

const CX = 130;
const CY = 130;
const R  = 108; // radius of arc centreline; stroke-width=16 → outer edge at 116
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 678.58

// ─── Colour by score ─────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return '#059669'; // green
  if (score >= 40) return '#d97706'; // amber
  return '#dc2626';                  // red
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'READY';
  if (score >= 40) return 'BUILDING';
  return 'NEEDS WORK';
}

// ─── Circular SVG gauge ───────────────────────────────────────────────────────

function GaugeSVG({ score }: { score: number }) {
  const color = scoreColor(score);
  const arcLen = (score / 100) * CIRCUMFERENCE;

  return (
    <svg viewBox="0 0 260 260" width="220" height="220" aria-label={`Readiness score: ${score} out of 100`}>
      {/* Background track */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Progress arc — starts at 12 o'clock via rotate(-90) */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={`${arcLen.toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`}
        transform={`rotate(-90 ${CX} ${CY})`}
        style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1), stroke 0.4s ease' }}
      />
      {/* Score number */}
      <text
        x={CX} y={CY - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="52"
        fontWeight="700"
        fill={color}
        style={{ fontFamily: 'inherit' }}
      >
        {score}
      </text>
      {/* "/ 100" subtitle */}
      <text
        x={CX} y={CY + 28}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="400"
        fill="#9ca3af"
      >
        / 100
      </text>
      {/* Status label */}
      <text
        x={CX} y={CY + 52}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fontWeight="700"
        fill={color}
        letterSpacing="0.08em"
      >
        {scoreLabel(score)}
      </text>
    </svg>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ history }: { history: ReadinessPoint[] }) {
  const W = 200;
  const H = 56;
  const PAD = 3;

  if (history.length < 2) {
    return (
      <p className="text-xs text-gray-400 text-center py-2">
        Complete more sessions to see your trend
      </p>
    );
  }

  // Build a 30-slot grid keyed to calendar dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const historyMap = new Map<string, number>(
    history.map((h) => [h.calculated_at.slice(0, 10), h.score]),
  );

  const plotPoints: { x: number; y: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const score = historyMap.get(key);
    if (score !== undefined) {
      const x = PAD + ((29 - i) / 29) * (W - PAD * 2);
      const y = PAD + (1 - score / 100) * (H - PAD * 2);
      plotPoints.push({ x, y });
    }
  }

  if (plotPoints.length < 2) {
    return (
      <p className="text-xs text-gray-400 text-center py-2">
        Not enough history yet
      </p>
    );
  }

  const lastScore = history[history.length - 1].score;
  const color = scoreColor(lastScore);

  const lineD = plotPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const first = plotPoints[0];
  const last  = plotPoints[plotPoints.length - 1];
  const fillD = `${lineD} L ${last.x.toFixed(1)} ${H} L ${first.x.toFixed(1)} ${H} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} overflow="visible">
        <defs>
          <linearGradient id="rg-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0"    />
          </linearGradient>
        </defs>
        {/* Zero line */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#f3f4f6" strokeWidth="1" />
        {/* Fill */}
        <path d={fillD} fill="url(#rg-spark-fill)" />
        {/* Line */}
        <path d={lineD} fill="none" stroke={color} strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Latest point dot */}
        <circle cx={last.x} cy={last.y} r="3" fill={color} />
      </svg>
      <p className="text-[10px] text-gray-400 text-center mt-0.5">30-day trend</p>
    </div>
  );
}

// ─── Breakdown tooltip ────────────────────────────────────────────────────────

function BreakdownTooltip({ factors }: { factors: BreakdownFactor[] }) {
  return (
    <div className="absolute right-0 top-6 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Score breakdown
      </p>
      <div className="space-y-2">
        {factors.map((f) => {
          const contribution = (f.raw_value * f.weight).toFixed(1);
          const barColor = f.raw_value >= 70 ? 'bg-emerald-500'
            : f.raw_value >= 40 ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={f.factor_name}>
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="text-xs text-gray-700 font-medium">{f.factor_name}</span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {Math.round(f.raw_value)}% × {Math.round(f.weight * 100)}%
                  <span className="text-gray-400 ml-1">= {contribution} pts</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${f.raw_value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-teal-700 bg-teal-50 rounded-lg px-2.5 py-2 mt-3 leading-relaxed">
        💡 Improve your accuracy on weak topics to raise this score fastest.
      </p>
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function ExamCountdown({ examDate }: { examDate: string | null }) {
  if (!examDate) {
    return (
      <p className="text-xs text-gray-400 text-center">
        Set your exam date in profile for a countdown
      </p>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  const days = Math.ceil((exam.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) {
    return (
      <p className="text-xs text-gray-500 text-center">
        Your GPhC exam was {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''} ago
      </p>
    );
  }
  if (days === 0) {
    return <p className="text-sm font-bold text-red-600 text-center">Your exam is today! 🎓</p>;
  }

  return (
    <div className="flex items-center gap-1.5 justify-center">
      <CalendarDays className="h-3.5 w-3.5 text-teal-500 shrink-0" />
      <p className="text-xs text-gray-600">
        <span className="font-bold text-gray-800">{days}</span>{' '}
        day{days !== 1 ? 's' : ''} until your exam
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExamReadinessGauge() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isPro } = useSubscription();

  const [score, setScore]         = useState<number | null>(null);
  const [history, setHistory]     = useState<ReadinessPoint[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownFactor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showInfo, setShowInfo]   = useState(false);
  const infoRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchReadinessScore(user.id),
      fetchReadinessHistory(user.id, 30),
      fetchReadinessBreakdown(user.id),
    ])
      .then(([s, h, b]) => { setScore(s); setHistory(h); setBreakdown(b); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Close tooltip on outside click
  useEffect(() => {
    if (!showInfo) return;
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showInfo]);

  if (!isPro) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-6 bg-teal-500 rounded-full" />
          <h2 className="text-lg font-bold text-gray-800">Exam Readiness Score</h2>
        </div>
        <ProGate
          feature="Exam Readiness Score"
          description="A single live score showing how prepared you are for the GPhC exam, updated daily."
        />
      </div>
    );
  }

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-6 bg-gray-100 rounded-full" />
          <div className="h-4 bg-gray-100 rounded w-40" />
        </div>
        <div className="flex justify-center">
          <div className="w-[220px] h-[220px] rounded-full bg-gray-100" />
        </div>
      </div>
    );
  }

  const displayScore = score ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-teal-500 rounded-full" />
          <h2 className="text-lg font-bold text-gray-800">Exam Readiness</h2>
        </div>

        {/* Info icon + breakdown tooltip */}
        <div
          ref={infoRef}
          className="relative"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <button
            aria-label="Show score breakdown"
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowInfo((v) => !v)}
          >
            <Info className="h-4 w-4" />
          </button>
          {showInfo && breakdown.length > 0 && (
            <BreakdownTooltip factors={breakdown} />
          )}
        </div>
      </div>

      {/* Body: gauge left, info right */}
      <div className="flex flex-col md:flex-row items-center gap-6">

        {/* Gauge */}
        <div className="shrink-0">
          {displayScore === 0 && (score === 0) ? (
            // Not enough data state — still render the ring at 0
            <div className="relative">
              <GaugeSVG score={0} />
              <p className="text-xs text-gray-400 text-center -mt-2">
                Complete 20+ questions to unlock
              </p>
            </div>
          ) : (
            <GaugeSVG score={displayScore} />
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 w-full space-y-5">

          {/* Exam countdown */}
          <ExamCountdown examDate={profile?.exam_date ?? null} />

          {/* Sparkline */}
          <div className="flex justify-center">
            <Sparkline history={history} />
          </div>

          {/* Quick factor summary (always visible — no hover needed on mobile) */}
          {breakdown.length > 0 && (
            <div className="hidden md:block">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-semibold">
                Score factors
              </p>
              <div className="space-y-1.5">
                {breakdown.map((f) => (
                  <div key={f.factor_name} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 w-36 shrink-0">{f.factor_name}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          f.raw_value >= 70 ? 'bg-emerald-500'
                          : f.raw_value >= 40 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${f.raw_value}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 tabular-nums w-8 text-right">
                      {Math.round(f.raw_value)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
