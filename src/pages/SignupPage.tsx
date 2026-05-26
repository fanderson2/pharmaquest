import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';


export default function SignupPage() {
  const navigate = useNavigate();
  const { user, loading, error, signUp, clearError } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // Already logged in → redirect to onboarding (they may be new) or dashboard
  useEffect(() => {
    if (!loading && user) navigate('/onboarding', { replace: true });
  }, [user, loading, navigate]);

  const set = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) return;
    setIsSubmitting(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      // onAuthStateChange will set user → useEffect above redirects to /onboarding
    } catch {
      // error from context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Logo />
          <span className="text-2xl font-bold text-gray-900">PharmaQuest</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">Start your pre-reg preparation today.</p>


          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name" type="text" required autoFocus
                autoComplete="name"
                value={formData.name} onChange={set('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email" type="email" required
                autoComplete="email"
                value={formData.email} onChange={set('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
                <span className="ml-1 font-normal text-gray-400">(min. 6 characters)</span>
              </label>
              <input
                id="password" type="password" required minLength={6}
                autoComplete="new-password"
                value={formData.password} onChange={set('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
