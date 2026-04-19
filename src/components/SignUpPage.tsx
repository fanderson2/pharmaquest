import React from 'react';
import { CreditCard, Shield, Zap, BookOpen, Brain, CheckCircle2 } from 'lucide-react';
import AuthModal from './AuthModal';
import { useSearchParams } from 'react-router-dom';
import { verifyStripeCheckout } from '../utils/stripeVerification';

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const isCheckoutSuccess = searchParams.get('checkout') === 'success';
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(
    isCheckoutSuccess && verifyStripeCheckout()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Ace Your Pre-Registration Exam
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Join thousands of pharmacy students preparing for their
          pre-registration exam with our comprehensive question bank
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 mb-2">
            <span>£99 for Lifetime Access!</span>
            <span className="text-base font-normal text-gray-500"></span>
          </div>

          <a href="https://buy.stripe.com/eVadS1dtp2eO4N2288" target="_blank">
            <button className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mb-8">
              Get Started Now
            </button>
          </a>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 bg-teal-50 rounded-lg p-2">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Comprehensive Coverage</h3>
                <p className="text-sm text-gray-600">Complete question bank covering all GPhC exam topics</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 bg-teal-50 rounded-lg p-2">
                <Brain className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Smart Learning</h3>
                <p className="text-sm text-gray-600">Adaptive spaced repetition for optimal retention</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 bg-teal-50 rounded-lg p-2">
                <CheckCircle2 className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Detailed Explanations</h3>
                <p className="text-sm text-gray-600">Clear explanations for every answer to build understanding</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 bg-teal-50 rounded-lg p-2">
                <Zap className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Progress Tracking</h3>
                <p className="text-sm text-gray-600">Monitor your improvement across all topics</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          By signing up, you agree to our{' '}
          <a href="#" className="text-teal-600 hover:text-teal-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-teal-600 hover:text-teal-700">
            Privacy Policy
          </a>
        </p>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        showSubscription={true}
      />
    </div>
  );
}