import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { Book, Pill, AlertTriangle, ShoppingBag, Scale, Stethoscope, Tablets } from 'lucide-react';
import Header from './components/Header';
import ProgressCard from './components/ProgressCard';
import TopicList from './components/TopicList';
import QuizPage from './components/QuizPage';
import SignUpPage, { CheckoutProcessing } from './components/SignUpPage';
import { SearchProvider } from './context/SearchContext';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import { useAuth } from './context/AuthContext';
import { useSubscription } from './hooks/useSubscription';
import { fetchTopics } from './services/topicService';
import { Section } from './types/topic';

const sectionIcons: Record<string, JSX.Element> = {
  BNF: <Book className="h-6 w-6 text-teal-600" />,
  T100: <Pill className="h-6 w-6 text-teal-600" />,
  HRM: <AlertTriangle className="h-6 w-6 text-teal-600" />,
  OTC: <ShoppingBag className="h-6 w-6 text-teal-600" />,
  MRT: <Stethoscope className="h-6 w-6 text-teal-600" />,
  CAL: <Scale className="h-6 w-6 text-teal-600" />,
  COM: <Tablets className="h-6 w-6 text-teal-600" />,
};

const sectionDescriptions: Record<string, string> = {
  BNF: 'British National Formulary chapter overview and key medications',
  T100: 'Essential medications every pharmacy student must know',
  HRM: 'Critical medications requiring special attention and monitoring',
  OTC: 'Common conditions and medications available without prescription',
  MRT: 'Essential guidelines and standards for pharmacy practice',
  CAL: 'Mathematical skills essential for pharmaceutical practice',
  COM: 'Common over-the-counter medications and their uses',
};

function Spinner({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

function HomePage() {
  const { user } = useAuth();
  const { isActive, loading: subscriptionLoading } = useSubscription();
  const [searchParams] = useSearchParams();
  const [sections, setSections] = React.useState<Section[]>([]);
  const [topicsLoading, setTopicsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Only fetch topics once we know the user has an active subscription
  React.useEffect(() => {
    if (!user || !isActive) return;

    async function loadTopics() {
      try {
        setTopicsLoading(true);
        const data = await fetchTopics();
        setSections(data);
      } catch (err) {
        console.error('Error loading topics:', err);
        setError('Failed to load topics. Please try refreshing the page.');
      } finally {
        setTopicsLoading(false);
      }
    }

    loadTopics();
  }, [user, isActive]);

  // 1. Not logged in → marketing / sign-up page
  if (!user) return <SignUpPage />;

  // 2. Checking subscription status
  if (subscriptionLoading) return <Spinner message="Loading your account…" />;

  // 3. Stripe redirected back with ?checkout=success but webhook hasn't fired yet
  if (searchParams.get('checkout') === 'success' && !isActive) {
    return <CheckoutProcessing />;
  }

  // 4. Logged in but no active subscription → upgrade prompt
  if (!isActive) return <SignUpPage isUpgrade />;

  // 5. Active subscriber — show the app
  if (topicsLoading) return <Spinner message="Loading topics…" />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            No topics available. Please check back later.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl text-gray-700 mb-6">
          Click on a section below to start a Pre-Reg quiz!
        </h2>
        {sections.map((section) => (
          <ProgressCard
            key={section.id}
            icon={sectionIcons[section.id]}
            title={section.title}
            description={sectionDescriptions[section.id]}
            sectionId={section.id}
          >
            {section.topics.map((topic) => (
              <TopicList key={topic.id} topic={topic} sectionId={section.id} />
            ))}
          </ProgressCard>
        ))}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <SearchProvider>
          <QuizProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/quiz/:topic" element={<QuizPage />} />
                <Route path="/quiz/:topic/:subtopic" element={<QuizPage />} />
              </Routes>
            </div>
          </QuizProvider>
        </SearchProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
