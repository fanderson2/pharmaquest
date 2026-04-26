import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import SignUpPage from './components/SignUpPage';
import QuizPage from './components/QuizPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import { SearchProvider } from './context/SearchContext';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { QuizProvider } from './context/QuizContext';
import { useAuth } from './context/AuthContext';

/** Public home route: redirect authenticated users straight to /dashboard. */
function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Unauthenticated → marketing / sign-up page
  return <SignUpPage />;
}

/** Routes that render without the app Header (auth flows). */
const AUTH_PATHS = ['/login', '/signup', '/auth/callback', '/onboarding'];

function AppShell() {
  const { pathname } = window.location;
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Header />}
      <Routes>
        {/* ── Public ───────────────────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* ── Protected ────────────────────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute><OnboardingPage /></ProtectedRoute>
        } />
        <Route path="/quiz/:topic" element={
          <ProtectedRoute><QuizPage /></ProtectedRoute>
        } />
        <Route path="/quiz/:topic/:subtopic" element={
          <ProtectedRoute><QuizPage /></ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ProfileProvider>
          <SearchProvider>
            <QuizProvider>
              <AppShell />
            </QuizProvider>
          </SearchProvider>
        </ProfileProvider>
      </Router>
    </AuthProvider>
  );
}
