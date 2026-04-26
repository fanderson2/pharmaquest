import React, { useEffect, useRef, useState } from 'react';
import { useProfile } from '../context/ProfileContext';

export default function StreakBadge() {
  const { profile } = useProfile();
  const prevStreakRef = useRef<number | null>(null);
  const [pulsing, setPulsing] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const streak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const activeToday = profile?.last_active_date === today;

  // Pulse when streak increments
  useEffect(() => {
    if (prevStreakRef.current !== null && streak > prevStreakRef.current) {
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 600);
      return () => clearTimeout(t);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  return (
    <div className="relative group">
      <div
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold select-none transition-colors ${
          activeToday
            ? 'bg-orange-100 text-orange-700'
            : 'bg-gray-100 text-gray-400'
        } ${pulsing ? 'streak-pulse' : ''}`}
      >
        <span style={activeToday ? undefined : { filter: 'grayscale(1)', opacity: 0.5 }}>
          🔥
        </span>
        <span>{streak}</span>
      </div>

      {/* Hover tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap">
          {activeToday ? 'Active today!' : 'Complete a quiz to keep your streak'}
          <br />
          Longest: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
        </div>
      </div>
    </div>
  );
}
