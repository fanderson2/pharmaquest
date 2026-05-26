import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

type Tab = 'password' | 'magic';
type View = 'login' | 'reset';


export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, signIn, sendMagicLink, sendPasswordResetEmail, clearError } = useAuth();

  const [tab, setTab] = useState<Tab>('password');
  const [view, setView] = useState<View>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  // Already logged in → redirect
  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setMagicSent(false);
    clearError();
  };

  const switchView = (v: View) => {
    setView(v);
    setResetSent(false);
    clearError();
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch {
      // error displayed from context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendMagicLink(email);
      setMagicSent(true);
    } catch {
      // error displayed from context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(email);
      setResetSent(true);
    } catch {
      // error displayed from context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Logo />
          <span className="text-2xl font-bold text-gray-900">PharmaQuest</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── Password Reset view ── */}
          {view === 'reset' && (
            <>
              <button
                onClick={() => switchView('login')}
                className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mb-5"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              {resetSent ? (
                <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-teal-800">
                    Check your inbox — a reset link is on its way to <strong>{email}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {error && <ErrorBanner message={error} />}
                  <Field label="Email" id="reset-email" type="email" value={email}
                    onChange={setEmail} required autoFocus />
                  <SubmitButton loading={isSubmitting} label="Send reset link" />
                </form>
              )}
            </>
          )}

          {/* ── Login view ── */}
          {view === 'login' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h1>

              <Divider />

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
                {(['password', 'magic'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      tab === t
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t === 'password' ? 'Password' : 'Magic Link'}
                  </button>
                ))}
              </div>

              {error && <ErrorBanner message={error} />}

              {/* Password tab */}
              {tab === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <Field label="Email" id="email" type="email" value={email}
                    onChange={setEmail} required autoFocus />
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => switchView('reset')}
                        className="text-xs text-teal-600 hover:text-teal-700"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <SubmitButton loading={isSubmitting} label="Sign in" />
                </form>
              )}

              {/* Magic link tab */}
              {tab === 'magic' && (
                <>
                  {magicSent ? (
                    <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <Mail className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-teal-800">
                        Magic link sent to <strong>{email}</strong>. Check your inbox and click the
                        link to sign in — no password needed.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleMagicLink} className="space-y-4">
                      <Field label="Email" id="magic-email" type="email" value={email}
                        onChange={setEmail} required autoFocus />
                      <SubmitButton loading={isSubmitting} label="Send magic link" />
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ── Small shared sub-components ─────────────────────────────────────────── */

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

function Field({
  label, id, type, value, onChange, required, autoFocus,
}: {
  label: string; id: string; type: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; autoFocus?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id} type={type} required={required} autoFocus={autoFocus}
        autoComplete={type === 'email' ? 'email' : undefined}
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit" disabled={loading}
      className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
