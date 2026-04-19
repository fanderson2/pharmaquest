import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Book, Pill, AlertTriangle, ShoppingBag, Scale, Stethoscope, Tablets } from 'lucide-react';
import Header from './components/Header';
import ProgressCard from './components/ProgressCard';
import TopicList from './components/TopicList';
import QuizPage from './components/QuizPage';
import SignUpPage from './components/SignUpPage';
import { SearchProvider } from './context/SearchContext';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import { useAuth } from './context/AuthContext';
import { fetchTopics } from './services/topicService';
import { Section } from './types/topic';

const sectionIcons: Record<string, JSX.Element> = {
  BNF: <Book className="h-6 w-6 text-teal-600" />,
  T100: <Pill className="h-6 w-6 text-teal-600" />,
  HRM: <AlertTriangle className="h-6 w-6 text-teal-600" />,
  OTC: <ShoppingBag className="h-6 w-6 text-teal-600" />,
  MRT: <Stethoscope className="h-6 w-6 text-teal-600" />,
  CAL: <Scale className="h-6 w-6 text-teal-600" />,
  COM: <Tablets className="h-6 w-6 text-teal-600" />
};

const sectionDescriptions: Record<string, string> = {
  BNF: "British National Formulary chapter overview and key medications",
  T100: "Essential medications every pharmacy student must know",
  HRM: "Critical medications requiring special attention and monitoring",
  OTC: "Common conditions and medications available without prescription",
  MRT: "Essential guidelines and standards for pharmacy practice",
  CAL: "Mathematical skills essential for pharmaceutical practice",
  COM: "Common over-the-counter medications and their uses"
};

function HomePage() {
  const { user } = useAuth();
  const [sections, setSections] = React.useState<Section[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadTopics() {
      try {
        setLoading(true);
        const data = await fetchTopics();
        console.log('Loaded sections:', data); // Debug log
        setSections(data);
      } catch (err) {
        console.error('Error loading topics:', err);
        setError('Failed to load topics. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }

    loadTopics();
  }, []);

  if (!user) {
    return <SignUpPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

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

  if (!sections || sections.length === 0) {
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
        
        {sections.map(section => (
          <ProgressCard
            key={section.id}
            icon={sectionIcons[section.id]}
            title={section.title}
            description={sectionDescriptions[section.id]}
            sectionId={section.id}
          >
            {section.topics.map(topic => (
              <TopicList 
                key={topic.id} 
                topic={topic} 
                sectionId={section.id}
              />
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