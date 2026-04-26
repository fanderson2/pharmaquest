import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Book, Pill, AlertTriangle, ShoppingBag, Scale, Stethoscope, Tablets, Lock, Loader2 } from 'lucide-react';
import ProgressCard from '../components/ProgressCard';
import TopicList from '../components/TopicList';
import { CheckoutProcessing } from '../components/SignUpPage';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { fetchProfile } from '../services/profileService';
import { fetchTopics } from '../services/topicService';
import { createCheckoutSession } from '../services/stripeService';
import { Section } from '../types/topic';

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();

  const [sections, setSections] = useState<Section[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);

  // Onboarding guard: redirect to /onboarding if university not set
  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((profile) => {
      if (!profile?.university) {
        navigate('/onboarding', { replace: true });
      } else {
        setProfileChecked(true);
      }
    });
  }, [user, navigate]);

  // Load quiz topics once profile check passes (regardless of subscription)
  useEffect(() => {
    if (!profileChecked) return;

    async function load() {
      try {
        setTopicsLoading(true);
        const data = await fetchTopics();
        setSections(data);
      } catch (err) {
        console.error('Error loading topics:', err);
        setTopicsError('Failed to load topics. Please try refreshing.');
      } finally {
        setTopicsLoading(false);
      }
    }

    load();
  }, [profileChecked]);

  if (subLoading || !profileChecked) return <Spinner message="Loading your account…" />;
  if (searchParams.get('checkout') === 'success' && !isActive) return <CheckoutProcessing />;
  if (topicsLoading) return <Spinner message="Loading topics…" />;

  if (topicsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{topicsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-gray-600">No topics available. Please check back later.</p>
        </main>
      </div>
    );
  }

  // First topic of each section is free — derive directly from loaded data.
  const freeTopicIds = new Set(sections.map((s) => s.topics[0]?.id).filter(Boolean) as string[]);
  const totalTopics = sections.reduce((n, s) => n + s.topics.length, 0);
  const lockedTopics = totalTopics - freeTopicIds.size;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isActive && <TrialBanner lockedTopics={lockedTopics} />}
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
              <TopicList
                key={topic.id}
                topic={topic}
                sectionId={section.id}
                locked={!isActive && !freeTopicIds.has(topic.id)}
              />
            ))}
          </ProgressCard>
        ))}
        {!isActive && <SubscribeBanner />}
      </main>
    </div>
  );
}

function TrialBanner({ lockedTopics }: { lockedTopics: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await createCheckoutSession('pro');
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
      <Lock className="h-5 w-5 text-amber-600 shrink-0" />
      <p className="text-sm text-amber-900 flex-1">
        <span className="font-semibold">Free trial:</span> One topic per section is unlocked.{' '}
        {lockedTopics} topics are locked — subscribe to access the full question bank.
        {error && <span className="block text-red-600 mt-1">{error}</span>}
      </p>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Subscribe — £99
      </button>
    </div>
  );
}

function SubscribeBanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await createCheckoutSession('pro');
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 text-center text-white shadow-lg">
      <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-4">
        <Lock className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Unlock the Full Question Bank</h3>
      <p className="text-teal-100 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
        You've had a taste — subscribe for lifetime access to every section, topic, and all 2,436 questions. One payment, no recurring fees.
      </p>
      {error && <p className="text-red-200 text-sm mb-4">{error}</p>}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-white text-teal-700 font-semibold px-8 py-3 rounded-full hover:bg-teal-50 disabled:opacity-60 transition-colors inline-flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Subscribe — £99 Lifetime Access
      </button>
    </div>
  );
}
