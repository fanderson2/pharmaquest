import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, GraduationCap, Calendar, User, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, upsertProfile } from '../services/profileService';

const UK_PHARMACY_SCHOOLS = [
  'Aston University', 'Bath University', 'Bradford University',
  'Brighton University', 'Cardiff University', 'De Montfort University',
  'Hertfordshire University', 'Huddersfield University', 'Keele University',
  "King's College London", 'Leeds University', 'Liverpool John Moores University',
  'Manchester University', 'Newcastle University', 'Nottingham University',
  'Portsmouth University', 'Queen\'s University Belfast',
  'Robert Gordon University', 'School of Pharmacy (UCL)',
  'Sunderland University', 'University of East Anglia',
  'University of Reading', 'University of Strathclyde',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    university: '',
    exam_date: '',
  });

  // Pre-fill name from auth metadata or existing profile
  useEffect(() => {
    if (!user) return;
    const metaName = user.user_metadata?.name as string | undefined;
    if (metaName) setFormData((prev) => ({ ...prev, full_name: metaName }));

    fetchProfile(user.id).then((profile) => {
      if (profile?.full_name) setFormData((prev) => ({ ...prev, full_name: profile.full_name! }));
      if (profile?.university) setFormData((prev) => ({ ...prev, university: profile.university! }));
      if (profile?.exam_date) setFormData((prev) => ({ ...prev, exam_date: profile.exam_date! }));
    });
  }, [user]);

  const set = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await upsertProfile(user.id, {
        full_name: formData.full_name.trim() || null,
        university: formData.university.trim() || 'not_provided',
        exam_date: formData.exam_date || null,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    try {
      // Mark as onboarded so we don't keep redirecting here
      await upsertProfile(user.id, { university: 'not_provided' });
    } finally {
      navigate('/dashboard', { replace: true });
    }
  };

  const totalSteps = 3;
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo />
          <span className="text-2xl font-bold text-gray-900">PharmaQuest</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Setting up your profile</span>
            <span>Step {step} of {totalSteps}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit}>

            {/* Step 1 — Name */}
            {step === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-teal-50 rounded-xl p-2.5">
                    <User className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">What's your name?</h2>
                    <p className="text-sm text-gray-500">This appears on your progress reports.</p>
                  </div>
                </div>
                <input
                  type="text" required autoFocus
                  placeholder="e.g. Alex Johnson"
                  value={formData.full_name} onChange={set('full_name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  disabled={!formData.full_name.trim()}
                  onClick={() => setStep(2)}
                  className="mt-5 w-full py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Step 2 — University */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-teal-50 rounded-xl p-2.5">
                    <GraduationCap className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Where do you study?</h2>
                    <p className="text-sm text-gray-500">Your university or placement site.</p>
                  </div>
                </div>
                <input
                  type="text" list="universities" autoFocus
                  placeholder="e.g. King's College London"
                  value={formData.university} onChange={set('university')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />
                <datalist id="universities">
                  {UK_PHARMACY_SCHOOLS.map((s) => <option key={s} value={s} />)}
                </datalist>
                <div className="flex gap-3 mt-5">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(3)}
                    className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center justify-center gap-2 font-medium transition-colors">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Exam date */}
            {step === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-teal-50 rounded-xl p-2.5">
                    <Calendar className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">When is your exam?</h2>
                    <p className="text-sm text-gray-500">We'll help you prepare in time.</p>
                  </div>
                </div>

                <input
                  type="date" autoFocus
                  value={formData.exam_date} onChange={set('exam_date')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                />

                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}

                <div className="flex gap-3 mt-5">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Let's go!
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
