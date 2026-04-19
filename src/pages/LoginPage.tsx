import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

type Tab = 'password' | 'magic';
type View = 'login' | 'reset';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, signIn, signInWithGoogle, sendMagicLink, sendPasswordResetEmail, clearError } = useAuth();

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

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      // redirect happens via OAuth callback — page will unload
    } catch {
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

              {/* Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700 disabled:opacity-50 mb-6"
              >
                <GoogleIcon />
                Continue with Google
              </button>

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
