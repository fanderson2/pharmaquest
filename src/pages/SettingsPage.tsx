import React, { useState } from 'react';
import { Settings2, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { updateLeaderboardVisibility } from '../services/leaderboardService';

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 ${
        checked ? 'bg-teal-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 mt-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const showOnLeaderboard = profile?.show_on_leaderboard ?? true;

  const handleToggle = async (newValue: boolean) => {
    if (!user || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      await updateLeaderboardVisibility(user.id, newValue);
      await refreshProfile();
      setFeedback({
        ok: true,
        msg: newValue
          ? 'You are now visible on the leaderboard.'
          : 'You have been removed from the leaderboard.',
      });
    } catch {
      setFeedback({ ok: false, msg: 'Failed to update. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Settings2 className="h-5 w-5 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Privacy card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Privacy</h2>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <Trophy className="h-4 w-4 text-amber-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Show me on the public leaderboard
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      When on, your username, XP, level, and streak appear on the community
                      leaderboard. Toggling off removes you immediately.
                    </p>
                  </div>
                  <Toggle
                    checked={showOnLeaderboard}
                    onChange={handleToggle}
                    disabled={saving || profile === null}
                  />
                </div>

                {/* Feedback */}
                {feedback && (
                  <div className={`mt-3 flex items-center gap-2 text-xs ${
                    feedback.ok ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {feedback.ok
                      ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                    {feedback.msg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
