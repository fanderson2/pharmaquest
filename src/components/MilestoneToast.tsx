import React, { useEffect, useState } from 'react';

interface Props {
  streak: number;
  xpBonus: number;
  onDismiss: () => void;
}

const MESSAGES: Record<number, string> = {
  7: '7-Day Streak!',
  30: '30-Day Streak!',
  100: '100-Day Legend!',
};

const SUBTITLES: Record<number, string> = {
  7: 'One full week of studying 💪',
  30: 'One month strong — keep it up!',
  100: 'Absolutely legendary dedication 🏆',
};

export default function MilestoneToast({ streak, xpBonus, onDismiss }: Props) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 3600);
    const dismissTimer = setTimeout(onDismiss, 4000);
    return () => { clearTimeout(exitTimer); clearTimeout(dismissTimer); };
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 ${exiting ? 'toast-exit' : 'toast-enter'}`}
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4 min-w-[280px]">
        <span className="text-4xl leading-none select-none">🔥</span>
        <div className="flex-1">
          <p className="font-bold text-lg leading-tight">
            {MESSAGES[streak] ?? `${streak}-Day Streak!`}
          </p>
          <p className="text-orange-100 text-sm mt-0.5">
            {SUBTITLES[streak] ?? 'Incredible consistency!'}
          </p>
          <p className="text-amber-200 text-xs font-semibold mt-1">+{xpBonus} XP bonus</p>
        </div>
        <button
          onClick={() => { setExiting(true); setTimeout(onDismiss, 300); }}
          className="text-orange-200 hover:text-white text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
