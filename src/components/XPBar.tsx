import React from 'react';
import { Lock } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useSubscription } from '../hooks/useSubscription';

function calcLevel(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100));
  const xpForLevel = (lvl: number) => lvl * lvl * 100;
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const progress = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
  return { level, progress, next, xpIntoLevel: xp - current };
}

export default function XPBar() {
  const { profile } = useProfile();
  const { isPro } = useSubscription();
  const xp = profile?.total_xp ?? 0;
  const { level, progress } = calcLevel(xp);

  if (!isPro) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-semibold select-none" title="Upgrade to Pro to earn XP">
        <span className="text-teal-300 font-bold">Lv —</span>
        <Lock className="h-3 w-3" />
      </div>
    );
  }

  return (
    <div className="relative group flex items-center gap-1.5">
      <span className="text-xs font-bold text-teal-700 whitespace-nowrap">Lv {level}</span>

      <div className="relative w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="hidden md:block text-xs text-gray-500 whitespace-nowrap">{xp} XP</span>

      {/* Hover tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap">
          {progress}% to Level {level + 1}
        </div>
      </div>
    </div>
  );
}
