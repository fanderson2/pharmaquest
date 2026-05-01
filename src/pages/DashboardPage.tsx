import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Book, Pill, AlertTriangle, ShoppingBag, Scale, Stethoscope, Tablets,
  Lock, Loader2, Brain, Sparkles, Activity, ArrowRight,
} from 'lucide-react';
import ProgressCard from '../components/ProgressCard';
import TopicList from '../components/TopicList';
import { CheckoutProcessing } from '../components/SignUpPage';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { fetchProfile } from '../services/profileService';
import { fetchTopics } from '../services/topicService';
import { createCheckoutSession } from '../services/stripeService';
import { fetchSmartQuiz } from '../services/smartPracticeService';
import { fetchReadinessScore } from '../services/readinessService';
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
  const { isPro, loading: subLoading } = useSubscription();

  const [sections, setSections] = useState<Section[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((profile) => {
      if (!profile?.university) {
        navigate('/onboarding', { replace: true });
      } else {
        setProfileChecked(true);
      }
    }).catch(() => {
      setProfileChecked(true);
    });
  }, [user, navigate]);

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

  if (subLoading || !profileChecked) return <Spinner message="Loading your account..." />;
  if (searchParams.get('checkout') === 'success' && !isPro) return <CheckoutProcessing />;
  if (topicsLoading) return <Spinner message="Loading topics..." />;

  if (topicsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{topicsError}</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
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

  const freeTopicIds = new Set(sections.map((s) => s.topics[0]?.id).filter(Boolean) as string[]);
  const totalTopics = sections.reduce((n, s) => n + s.topics.length, 0);
  const lockedTopics = totalTopics - freeTopicIds.size;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isPro && <TrialBanner lockedTopics={lockedTopics} />}
        <InsightsRow />
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
                locked={!isPro && !freeTopicIds.has(topic.id)}
              />
            ))}
          </ProgressCard>
        ))}
        {!isPro && <SubscribeBanner />}
      </main>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const CARD = 'bg-white rounded-2xl border border-gray-900 p-4 flex flex-col snap-start shrink-0 w-[82%] lg:w-auto';
const BTN = 'w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-700 active:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors';

function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true);
    try { window.location.href = await createCheckoutSession('pro'); }
    catch { setLoading(false); }
  };
  return (
    <button onClick={go} disabled={loading}
      className={`mt-auto disabled:opacity-60 ${BTN}`}>
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
      Unlock Pro
    </button>
  );
}

// ─── Compact insight widgets ──────────────────────────────────────────────────

function SmartWidget() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = async () => {
    if (!user) return;
    setStarting(true);
    setErr(null);
    try {
      const qs = await fetchSmartQuiz(user.id, 20);
      if (!qs.length) { setErr('No questions yet — try tomorrow.'); return; }
      navigate('/quiz/__smart__', { state: { questions: qs } });
    } catch {
      setErr('Failed to load quiz.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className={CARD}>
      <div className="flex items-center gap-2.5 mb-1">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isPro ? 'bg-teal-600' : 'bg-gray-100'}`}>
          <Brain className={`h-4 w-4 ${isPro ? 'text-white' : 'text-gray-400'}`} />
        </div>
        <p className="text-sm font-bold text-gray-800">Smart Practice</p>
      </div>
      <p className="text-[11px] text-gray-400 mb-2">Spaced repetition · Pro</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        Personalised quizzes weighted to your weakest areas, built on spaced repetition science.
      </p>
      {isPro ? (
        <div className="mt-auto space-y-1.5">
          <button onClick={start} disabled={starting}
            className={`disabled:opacity-60 ${BTN}`}>
            {starting ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Sparkles className="h-3 w-3" /> Start quiz</>}
          </button>
          {err && <p className="text-[10px] text-red-500 text-center">{err}</p>}
        </div>
      ) : <UpgradeButton />}
    </div>
  );
}

function ReadinessWidget() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [score, setScore] = useState<number | null>(null);
  const [scoreLoading, setScoreLoading] = useState(true);

  useEffect(() => {
    if (!user || !isPro) { setScoreLoading(false); return; }
    fetchReadinessScore(user.id)
      .then(setScore)
      .catch(console.error)
      .finally(() => setScoreLoading(false));
  }, [user, isPro]);

  const hasScore = isPro && !scoreLoading && score !== null && score > 0;

  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isPro ? 'bg-teal-50' : 'bg-gray-100'}`}>
            <Activity className={`h-4 w-4 ${isPro ? 'text-teal-600' : 'text-gray-400'}`} />
          </div>
          <p className="text-sm font-bold text-gray-800">Exam Readiness</p>
        </div>
        {hasScore && (
          <span className="text-sm font-bold text-gray-900 shrink-0 mt-0.5">{score}/100</span>
        )}
        {isPro && scoreLoading && (
          <span className="w-10 h-4 rounded bg-gray-100 animate-pulse shrink-0 mt-1" />
        )}
      </div>
      <p className="text-[11px] text-gray-400 mb-2">Daily score · Pro</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        A live daily score showing how prepared you are for your GPhC assessment, based on accuracy and activity.
      </p>
      {isPro ? (
        <div className="mt-auto">
          <Link to="/readiness" className={BTN}>
            Full report <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : <UpgradeButton />}
    </div>
  );
}

function InsightsRow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const index = maxScroll > 0 ? Math.round((scrollLeft / maxScroll)) : 0;
    setActiveIndex(Math.min(Math.max(index, 0), 1));
  };

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    scrollRef.current.scrollTo({ left: maxScroll * index, behavior: 'smooth' });
  };

  return (
    <div className="mb-6">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <SmartWidget />
        <ReadinessWidget />
      </div>
      <div className="flex justify-center gap-2 mt-3 lg:hidden">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => scrollToCard(i)}
            aria-label={`Go to card ${i + 1}`}
            className={`rounded-full transition-all duration-200 ${
              activeIndex === i ? 'w-5 h-1.5 bg-gray-900' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Banners ──────────────────────────────────────────────────────────────────

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
      <button onClick={handleSubscribe} disabled={loading}
        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
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
      <button onClick={handleSubscribe} disabled={loading}
        className="bg-white text-teal-700 font-semibold px-8 py-3 rounded-full hover:bg-teal-50 disabled:opacity-60 transition-colors inline-flex items-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Subscribe — £99 Lifetime Access
      </button>
    </div>
  );
}
