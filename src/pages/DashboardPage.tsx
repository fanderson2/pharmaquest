import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Book, Pill, AlertTriangle, ShoppingBag, Scale, Stethoscope, Tablets } from 'lucide-react';
import ProgressCard from '../components/ProgressCard';
import TopicList from '../components/TopicList';
import SignUpPage, { CheckoutProcessing } from '../components/SignUpPage';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { fetchProfile } from '../services/profileService';
import { fetchTopics } from '../services/topicService';
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

  // Load quiz topics once profile check passes and subscription is confirmed
  useEffect(() => {
    if (!profileChecked || !isActive) return;

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
  }, [profileChecked, isActive]);

  // Subscription loading
  if (subLoading || !profileChecked) return <Spinner message="Loading your account…" />;

  // Stripe redirect with webhook not yet fired
  if (searchParams.get('checkout') === 'success' && !isActive) return <CheckoutProcessing />;

  // No active subscription
  if (!isActive) return <SignUpPage isUpgrade />;

  // Topics loading
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
