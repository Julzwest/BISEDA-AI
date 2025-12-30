import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, 
  Camera, 
  Sparkles, 
  Target, 
  ChevronRight, 
  Check,
  ArrowRight,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const OnboardingStep = ({ icon: Icon, title, description, color, isActive }) => (
  <div className={`
    transition-all duration-500 transform
    ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}
  `}>
    <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${color} flex items-center justify-center shadow-2xl`}>
      <Icon className="w-12 h-12 text-white" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
    <p className="text-slate-400 text-base leading-relaxed max-w-xs mx-auto">{description}</p>
  </div>
);

export default function Onboarding({ onComplete }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      icon: MessageCircle,
      title: t('onboarding.step1Title', 'Welcome to Biseda'),
      description: t('onboarding.step1Desc', 'Your personal AI dating coach that helps you have better conversations and more successful dates.'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Camera,
      title: t('onboarding.step2Title', 'Screenshot Analysis'),
      description: t('onboarding.step2Desc', 'Upload screenshots of your dating app conversations and get instant, personalized reply suggestions.'),
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Target,
      title: t('onboarding.step3Title', 'Practice Scenarios'),
      description: t('onboarding.step3Desc', 'Build confidence with realistic roleplay scenarios - from first dates to difficult conversations.'),
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Sparkles,
      title: t('onboarding.step4Title', 'Live Wingman'),
      description: t('onboarding.step4Desc', 'Get real-time advice during your dates. Your AI wingman is always ready to help.'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Heart,
      title: t('onboarding.step5Title', "You're All Set!"),
      description: t('onboarding.step5Desc', 'Start your journey to better dating with 12 hours of free trial. Every feature unlocked!'),
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const handleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Mark onboarding as complete
        localStorage.setItem('onboardingComplete', 'true');
        onComplete();
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950 z-50 flex flex-col items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Skip Button */}
      {currentStep < steps.length - 1 && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 text-slate-500 hover:text-white text-sm font-medium transition-colors"
        >
          {t('onboarding.skip', 'Skip')}
        </button>
      )}

      {/* Content */}
      <div className="relative text-center z-10 min-h-[280px] flex items-center justify-center">
        {steps.map((step, index) => (
          <OnboardingStep
            key={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
            color={step.color}
            isActive={currentStep === index}
          />
        ))}
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 mt-10 mb-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`
              h-2 rounded-full transition-all duration-300
              ${currentStep === index 
                ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' 
                : currentStep > index
                  ? 'w-2 bg-purple-400'
                  : 'w-2 bg-slate-600'
              }
            `}
          />
        ))}
      </div>

      {/* Action Button */}
      <Button
        onClick={handleNext}
        disabled={isAnimating}
        className={`
          px-8 py-6 rounded-2xl font-semibold text-lg flex items-center gap-2 transition-all transform
          ${currentStep === steps.length - 1
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30'
          }
          ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}
        `}
      >
        {currentStep === steps.length - 1 ? (
          <>
            {t('onboarding.getStarted', 'Get Started')}
            <ArrowRight className="w-5 h-5" />
          </>
        ) : (
          <>
            {t('onboarding.next', 'Next')}
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </Button>

      {/* Feature Pills at bottom */}
      {currentStep === steps.length - 1 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fadeIn">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
            ✓ {t('onboarding.feature1', 'Chat Analysis')}
          </span>
          <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs">
            ✓ {t('onboarding.feature2', 'Live Wingman')}
          </span>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
            ✓ {t('onboarding.feature3', 'Practice Mode')}
          </span>
        </div>
      )}

      {/* Legal Links */}
      <div className="absolute bottom-6 flex gap-4 text-xs text-slate-600">
        <a href="/privacy" className="hover:text-slate-400 transition-colors">
          {t('legal.privacyPolicy', 'Privacy Policy')}
        </a>
        <span>•</span>
        <a href="/terms" className="hover:text-slate-400 transition-colors">
          {t('legal.termsOfService', 'Terms of Service')}
        </a>
      </div>
    </div>
  );
}

