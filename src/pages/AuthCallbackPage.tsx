import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../services/profileService';

/**
 * Landing page for all Supabase auth redirects:
 *   - Google OAuth callback
 *   - Magic link sign-in
 *   - Password reset link
 *
 * Supabase's JS client automatically exchanges the URL code/token for a
 * session when this page mounts (detectSessionInUrl is true by default).
 * We listen for the resulting onAuthStateChange event via the context and
 * then decide where to send the user.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading, isPasswordRecovery, updatePassword, error } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || isPasswordRecovery) return;
    if (!user) return; // still waiting for auth state

    async function redirect() {
      const profile = await fetchProfile(user!.id);
      // University is null → user hasn't completed onboarding yet
      if (!profile?.university) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }

    redirect();
  }, [user, loading, isPasswordRecovery, navigate]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(newPassword);
      navigate('/dashboard', { replace: true });
    } catch {
      // error from context
    } finally {
      setSubmitting(false);
    }
  };

  // ── Password recovery mode ────────────────────────────────────────────────
  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Logo />
            <span className="text-2xl font-bold text-gray-900">PharmaQuest</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h1>
            <p className="text-sm text-gray-500 mb-6">Choose a strong password for your account.</p>

            {(localError || error) && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{localError ?? error}</span>
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <input
                  id="new-password" type="password" required minLength={6} autoFocus
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <input
                  id="confirm-password" type="password" required minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit" disabled={submitting}
                className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors font-medium"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Default: spinner while session is being established ──────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
      <p className="text-gray-500 text-sm">Completing sign in…</p>
    </div>
  );
}
