import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Bot, Calendar, PartyPopper, Lightbulb, ChevronRight, ChevronLeft, X, Sparkles, Check } from 'lucide-react';

const getSteps = (t) => [
  {
    id: 1,
    title: t('onboarding.steps.welcome.title'),
    description: t('onboarding.steps.welcome.description'),
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    features: t('onboarding.steps.welcome.features', { returnObjects: true })
  },
  {
    id: 2,
    title: t('onboarding.steps.chat.title'),
    description: t('onboarding.steps.chat.description'),
    icon: Bot,
    color: 'from-blue-500 to-cyan-500',
    features: t('onboarding.steps.chat.features', { returnObjects: true })
  },
  {
    id: 3,
    title: t('onboarding.steps.events.title'),
    description: t('onboarding.steps.events.description'),
    icon: PartyPopper,
    color: 'from-yellow-500 to-orange-500',
    features: t('onboarding.steps.events.features', { returnObjects: true })
  }
];

export default function OnboardingTutorial({ onComplete, isGuest = false }) {
  const { t } = useTranslation();
  const steps = getSteps(t);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection('next');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection('prev');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    if (onComplete) onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${step.color} opacity-20 blur-[100px] rounded-full transition-all duration-500`} />
        <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r ${step.color} opacity-10 blur-[80px] rounded-full transition-all duration-500`} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute -top-12 right-0 text-slate-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          {t('onboarding.skip')} <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentStep ? 'next' : 'prev');
                setCurrentStep(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-8 bg-gradient-to-r ' + step.color
                  : index < currentStep
                    ? 'w-2 bg-white/50'
                    : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div 
          className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl transition-all duration-200 ${
            isAnimating 
              ? direction === 'next' 
                ? 'opacity-0 translate-x-8' 
                : 'opacity-0 -translate-x-8'
              : 'opacity-100 translate-x-0'
          }`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl animate-float`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-slate-400 text-center mb-6">
            {step.description}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {step.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0`}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Guest mode notice */}
          {isGuest && currentStep === 0 && (
            <div className="mb-6 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <p className="text-cyan-300 text-xs text-center">
                {t('onboarding.guestNotice')}
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                {t('onboarding.back')}
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 py-3 bg-gradient-to-r ${step.color} hover:opacity-90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg`}
            >
              {isLastStep ? (
                <>
                  {t('onboarding.startNow')}
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  {t('onboarding.continue')}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step counter */}
        <p className="text-center text-slate-500 text-sm mt-4">
          {t('onboarding.step', { current: currentStep + 1, total: steps.length })}
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

