import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2, CreditCard, Trash2, AlertTriangle, Loader2, ExternalLink, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { createPortalSession } from '../services/stripeService';
import { deleteAccount } from '../services/profileService';

const CONFIRM_WORD = 'DELETE';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isPro } = useSubscription();

  // Subscription management
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Failed to open billing portal.');
      setPortalLoading(false);
    }
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setConfirmText('');
    setDeleteError(null);
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_WORD) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      setDeleteSuccess(true);
      // Sign out locally — the auth row is already gone on the server
      await signOut();
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
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

        {/* Subscription — Pro users only */}
        {isPro && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Subscription</h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Pro Plan</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Manage billing, download invoices, or cancel your subscription.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {portalLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <ExternalLink className="h-3.5 w-3.5" />}
                  Manage
                </button>
              </div>
              {portalError && <p className="mt-3 text-xs text-red-600">{portalError}</p>}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider">Danger Zone</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Delete Account</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Permanently removes your account and all associated data. This cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Delete confirmation modal ──────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">

            {deleteSuccess ? (
              /* Success state — shown briefly before redirect */
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900 mb-1">Account deleted</h2>
                <p className="text-sm text-gray-500">Redirecting you to the home page…</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Delete your account?</h2>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  This will permanently and immediately delete:
                </p>
                <ul className="text-sm text-gray-600 mb-4 space-y-1.5 ml-4 list-disc leading-relaxed">
                  <li>Your profile and personal details</li>
                  <li>All quiz history and answers</li>
                  <li>Your XP, streaks, and leaderboard position</li>
                  {isPro && (
                    <li>
                      Your Pro subscription —{' '}
                      <span className="font-semibold text-red-600">
                        it will be cancelled immediately and no refund will be issued
                      </span>
                    </li>
                  )}
                  <li>Your account login — you will not be able to sign back in</li>
                </ul>

                <p className="text-sm font-semibold text-gray-900 mb-4">
                  This action is permanent and cannot be undone.
                </p>

                {/* Type-to-confirm */}
                <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                  Type <span className="font-mono text-red-600">{CONFIRM_WORD}</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_WORD}
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-4 font-mono"
                />

                {deleteError && (
                  <p className="mb-4 text-xs text-red-600">{deleteError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    disabled={deleteLoading}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== CONFIRM_WORD || deleteLoading}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                  >
                    {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Delete my account
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
