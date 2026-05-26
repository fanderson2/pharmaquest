import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Book, Pill, AlertTriangle, ShoppingBag, Scale, Stethoscope, Tablets,
  Lock, Loader2, Brain, Sparkles, Activity, ArrowRight, CheckCircle2, X, Crown,
  FlaskConical, Calculator, Trophy,
} from 'lucide-react';
import ProgressCard from '../components/ProgressCard';
import TopicList from '../components/TopicList';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useSearch } from '../context/SearchContext';
import { fetchProfile } from '../services/profileService';
import { fetchTopics } from '../services/topicService';
import { createCheckoutSession } from '../services/stripeService';
import { fetchSmartQuiz } from '../services/smartPracticeService';
import { fetchReadinessScore } from '../services/readinessService';
import { Section } from '../types/topic';
import { questionBank } from '../data/questionBank';

const sectionIcons: Record<string, JSX.Element> = {
  BNF:  <Book           className="h-6 w-6 text-teal-600"  />,
  T100: <Pill           className="h-6 w-6 text-teal-600"  />,
  HRM:  <AlertTriangle  className="h-6 w-6 text-teal-600"  />,
  OTC:  <ShoppingBag    className="h-6 w-6 text-teal-600"  />,
  MRT:  <Stethoscope    className="h-6 w-6 text-teal-600"  />,
  CAL:  <Scale          className="h-6 w-6 text-teal-600"  />,
  COM:  <Tablets        className="h-6 w-6 text-teal-600"  />,
  CLN:  <FlaskConical   className="h-5 w-5 text-[rgb(96,13,148)]" />,
  ECAL: <Calculator     className="h-5 w-5 text-[rgb(96,13,148)]" />,
};

const GOLD_SECTIONS = new Set(['CLN', 'ECAL']);

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sectionDescriptions: Record<string, string> = {
  BNF:  'British National Formulary chapter overview and key medications',
  T100: 'Essential medications every pharmacy student must know',
  HRM:  'Critical medications requiring special attention and monitoring',
  OTC:  'Common conditions and medications available without prescription',
  MRT:  'Essential guidelines and standards for pharmacy practice',
  CAL:  'Mathematical skills essential for pharmaceutical practice',
  COM:  'Common over-the-counter medications and their uses',
  CLN:  'Exam-style clinical scenario questions covering all major GPhC topics',
  ECAL: 'Exam-style pharmaceutical calculation questions across all calculation types',
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const { searchQuery } = useSearch();
  const isSearching = searchQuery.trim().length > 0;

  const [sections, setSections] = useState<Section[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Show success banner once on return from Stripe, then clear the URL param
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowSuccessBanner(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

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

  const regularSections = sections.filter((s) => !GOLD_SECTIONS.has(s.id));
  const freeTopicIds = new Set(regularSections.map((s) => s.topics[0]?.id).filter(Boolean) as string[]);
  const lockedTopics = regularSections.reduce((n, s) => n + s.topics.length, 0) - freeTopicIds.size;
  const lockedQuestions = regularSections
    .flatMap((s) => s.topics)
    .filter((t) => !freeTopicIds.has(t.id))
    .reduce((n, t) => n + (questionBank[t.id]?.length ?? 0), 0);

  const searchLower = searchQuery.toLowerCase();
  const visibleSections = (isSearching
    ? sections.filter((s) =>
        !GOLD_SECTIONS.has(s.id) &&
        s.topics.some(
          (t) =>
            t.title.toLowerCase().includes(searchLower) ||
            t.subtopics.some((sub) => sub.toLowerCase().includes(searchLower))
        )
      )
    : sections
  ).filter((s) => isPro || !GOLD_SECTIONS.has(s.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {showSuccessBanner && (
          <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-300 rounded-xl p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-900 flex-1 font-medium">
              Successfully Subscribed — You now have a Full Pro Account and access to all quizzes and questions! Good luck.
            </p>
            <button onClick={() => setShowSuccessBanner(false)} className="text-green-600 hover:text-green-800 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {isPro && (
          <div className="mb-6 flex items-center gap-3 bg-amber-700 rounded-xl px-5 py-3">
            <Crown className="h-5 w-5 text-amber-100 shrink-0" />
            <p className="text-sm font-semibold text-white">
              Paid Tier — Access to all Quizzes &amp; Features
            </p>
          </div>
        )}
        {!isSearching && !isPro && <TrialBanner lockedTopics={lockedTopics} lockedQuestions={lockedQuestions} />}
        {!isSearching && isPro && <InsightsRow />}
        {isSearching && visibleSections.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center">
            No topics match "{searchQuery}"
          </p>
        )}

        {/* ── Exam Practice sections (gold) ──────────────────────────── */}
        {visibleSections.some((s) => GOLD_SECTIONS.has(s.id)) && (
          <>
            <div className="mb-4 flex items-center gap-3 bg-[rgb(96,13,148)] rounded-xl px-5 py-3">
              <Trophy className="h-5 w-5 text-white/80 shrink-0" />
              <p className="text-sm font-semibold text-white">Exam Practice — Full GPhC-style exam questions</p>
            </div>
            <ExamSectionsCarousel
              sections={visibleSections.filter((s) => GOLD_SECTIONS.has(s.id))}
              isPro={isPro}
              onStart={(section) => {
                const allQs = shuffled(
                  section.topics.flatMap(t =>
                    (questionBank[t.id] ?? []).map(q => ({ ...q, topicId: t.id }))
                  )
                );
                navigate('/quiz/__exam__', { state: { questions: allQs, sectionTitle: section.title } });
              }}
            />
            {visibleSections.some((s) => !GOLD_SECTIONS.has(s.id)) && (
              <div className="my-6 flex items-center gap-3 bg-teal-600 rounded-xl px-5 py-3">
                <Book className="h-5 w-5 text-white/80 shrink-0" />
                <p className="text-sm font-semibold text-white">Topic Quizzes — Practice your Weak Areas</p>
              </div>
            )}
          </>
        )}

        {/* ── Regular topic sections (teal) ──────────────────────────── */}
        {visibleSections.filter((s) => !GOLD_SECTIONS.has(s.id)).map((section) => (
          <ProgressCard
            key={section.id}
            icon={sectionIcons[section.id]}
            title={section.title}
            description={sectionDescriptions[section.id] ?? ''}
            sectionId={section.id}
            variant="teal"
          >
            {section.topics.map((topic) => (
              <TopicList
                key={topic.id}
                topic={topic}
                sectionId={section.id}
                locked={!isPro && !freeTopicIds.has(topic.id)}
                variant="teal"
              />
            ))}
          </ProgressCard>
        ))}
        {!isSearching && !isPro && <SubscribeBanner />}
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
        <Brain className={`h-5 w-5 shrink-0 ${isPro ? 'text-amber-700' : 'text-gray-400'}`} />
        <p className="text-sm font-bold text-gray-800">Smart Practice</p>
      </div>
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
          <Activity className={`h-5 w-5 shrink-0 ${isPro ? 'text-amber-700' : 'text-gray-400'}`} />
          <p className="text-sm font-bold text-gray-800">Exam Readiness</p>
        </div>
        {hasScore && (
          <span className="text-sm font-bold text-gray-900 shrink-0 mt-0.5">{score}/100</span>
        )}
        {isPro && scoreLoading && (
          <span className="w-10 h-4 rounded bg-gray-100 animate-pulse shrink-0 mt-1" />
        )}
      </div>
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

function ExamSectionsCarousel({
  sections,
  isPro,
  onStart,
}: {
  sections: Section[];
  isPro: boolean;
  onStart: (section: Section) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const idx = maxScroll > 0 ? Math.round(scrollLeft / maxScroll) : 0;
    setActiveIndex(Math.min(Math.max(idx, 0), sections.length - 1));
  };

  const scrollTo = (idx: number) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({ left: (scrollWidth - clientWidth) * idx, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.pageX;
    scrollStartLeft.current = scrollRef.current.scrollLeft;
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft = scrollStartLeft.current - (e.pageX - dragStartX.current);
  };
  const stopDrag = () => { isDragging.current = false; };

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
      >
        {sections.map((section) => (
          <div key={section.id} className="snap-start shrink-0 w-[82%] lg:w-auto">
            <ProgressCard
              icon={sectionIcons[section.id]}
              title={section.title}
              description={sectionDescriptions[section.id] ?? ''}
              sectionId={section.id}
              variant="gold"
              examLocked={!isPro}
              onStartExamQuiz={isPro ? () => onStart(section) : undefined}
            />
          </div>
        ))}
      </div>
      {sections.length > 1 && (
        <div className="flex justify-center gap-2 mt-3 lg:hidden">
          {sections.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to card ${i + 1}`}
              className={`rounded-full transition-all duration-200 ${
                activeIndex === i ? 'w-5 h-1.5 bg-gray-900' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InsightsRow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);

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

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.pageX;
    scrollStartLeft.current = scrollRef.current.scrollLeft;
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft = scrollStartLeft.current - (e.pageX - dragStartX.current);
  };
  const stopDrag = () => { isDragging.current = false; };

  return (
    <div className="mb-6">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
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

function TrialBanner({ lockedTopics, lockedQuestions }: { lockedTopics: number; lockedQuestions: number }) {
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
    <div className="mb-6 p-5 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center gap-5">
      <Lock className="h-5 w-5 text-amber-600 shrink-0 hidden sm:block" />
      <div className="flex-1 text-sm text-amber-900">
        <p className="font-semibold mb-3">Free tier — subscribe to unlock:</p>
        <ul className="space-y-2 list-disc list-outside pl-4 text-amber-800">
          <li><span className="font-medium">Exam Practice</span> — full GPhC-style clinical scenario &amp; calculation questions</li>
          <li><span className="font-medium">Smart Practice</span> — personalised spaced repetition quizzes, plus {lockedTopics.toLocaleString()} locked topics &amp; {lockedQuestions.toLocaleString()} questions</li>
          <li><span className="font-medium">Exam Readiness Score</span> — daily score tracking your GPhC preparation</li>
        </ul>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
      <button onClick={handleSubscribe} disabled={loading}
        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Subscribe — £9.99/mo
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
        You've had a taste — subscribe for full access to every section, topic, and all 2,436 questions.
      </p>
      {error && <p className="text-red-200 text-sm mb-4">{error}</p>}
      <button onClick={handleSubscribe} disabled={loading}
        className="bg-white text-teal-700 font-semibold px-8 py-3 rounded-full hover:bg-teal-50 disabled:opacity-60 transition-colors inline-flex items-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Subscribe — £9.99/month
      </button>
    </div>
  );
}
