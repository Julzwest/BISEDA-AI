import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, Frown, Meh, Heart, Zap, Coffee, Moon, Sun, Sparkles, ArrowRight, RefreshCw, Lock, Crown, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getBackendUrl } from '@/utils/getBackendUrl';

export default function MoodCheck() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [selectedContext, setSelectedContext] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [hasAccess, setHasAccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const backendUrl = getBackendUrl();

  // Check if user has Pro or Elite subscription
  const checkAccess = () => {
    const tier = (localStorage.getItem('userSubscriptionTier') || '').toLowerCase();
    return ['pro', 'elite', 'premium'].includes(tier);
  };

  useEffect(() => {
    const access = checkAccess();
    setHasAccess(access);
    if (!access) {
      setShowUpgradeModal(true);
    }
  }, []);
  
  const currentLang = i18n.language || 'en';
  const isAlbanian = currentLang === 'sq' || currentLang.startsWith('sq');

  const moods = [
    { id: 'confident', icon: Sparkles, label: t('mood.confident', 'Confident'), color: 'from-green-500 to-emerald-600', emoji: '😎' },
    { id: 'nervous', icon: Zap, label: t('mood.nervous', 'Nervous'), color: 'from-yellow-500 to-orange-600', emoji: '😰' },
    { id: 'excited', icon: Heart, label: t('mood.excited', 'Excited'), color: 'from-pink-500 to-rose-600', emoji: '🥰' },
    { id: 'anxious', icon: Frown, label: t('mood.anxious', 'Anxious'), color: 'from-purple-500 to-indigo-600', emoji: '😟' },
    { id: 'happy', icon: Smile, label: t('mood.happy', 'Happy'), color: 'from-cyan-500 to-blue-600', emoji: '😊' },
    { id: 'unsure', icon: Meh, label: t('mood.unsure', 'Unsure'), color: 'from-slate-500 to-gray-600', emoji: '🤔' },
  ];

  const energyLevels = [
    { id: 'high', icon: Sun, label: t('mood.highEnergy', 'High Energy'), color: 'from-yellow-500 to-orange-500', emoji: '⚡' },
    { id: 'medium', icon: Coffee, label: t('mood.mediumEnergy', 'Medium'), color: 'from-amber-500 to-yellow-600', emoji: '☕' },
    { id: 'low', icon: Moon, label: t('mood.lowEnergy', 'Low Energy'), color: 'from-indigo-500 to-purple-600', emoji: '😴' },
  ];

  const contexts = [
    { id: 'first_date', label: t('mood.contextFirstDate', 'Going on a first date'), emoji: '💕' },
    { id: 'texting', label: t('mood.contextTexting', 'Texting someone new'), emoji: '💬' },
    { id: 'approaching', label: t('mood.contextApproaching', 'Want to approach someone'), emoji: '👋' },
    { id: 'meet_parents', label: t('mood.contextMeetParents', 'First time meeting the parents'), emoji: '👨‍👩‍👧' },
    { id: 'asking_out', label: t('mood.contextAskingOut', 'Asking someone out'), emoji: '🙈' },
    { id: 'second_date', label: t('mood.contextSecondDate', 'Going on a second date'), emoji: '🥰' },
    { id: 'making_move', label: t('mood.contextMakingMove', 'Making the first move'), emoji: '😏' },
    { id: 'rejected', label: t('mood.contextRejected', 'Feeling rejected'), emoji: '💔' },
    { id: 'breakup', label: t('mood.contextBreakup', 'Going through a breakup'), emoji: '😢' },
    { id: 'long_distance', label: t('mood.contextLongDistance', 'Long distance relationship'), emoji: '🌍' },
    { id: 'relationship', label: t('mood.contextRelationship', 'In a relationship'), emoji: '❤️' },
    { id: 'general', label: t('mood.contextGeneral', 'Just need a boost'), emoji: '✨' },
  ];

  const getPersonalizedAdvice = async () => {
    if (!selectedMood || !selectedEnergy || !selectedContext) return;
    
    setIsLoading(true);
    try {
      const langInstruction = isAlbanian ? 'Përgjigju në shqip.' : `Respond in ${currentLang === 'en' ? 'English' : currentLang}.`;
      const mood = moods.find(m => m.id === selectedMood);
      const energy = energyLevels.find(e => e.id === selectedEnergy);
      const context = contexts.find(c => c.id === selectedContext);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a supportive dating coach and confidence expert. The user is checking in with their mood before a dating-related situation.

USER'S CURRENT STATE:
- Mood: ${mood?.label} ${mood?.emoji}
- Energy Level: ${energy?.label} ${energy?.emoji}
- Situation: ${context?.label} ${context?.emoji}

Based on this, provide:
1. A warm, understanding acknowledgment of how they're feeling (1-2 sentences)
2. 3 specific confidence boosters or tips tailored to their mood and situation
3. A powerful affirmation or mantra they can repeat
4. One practical action they can take RIGHT NOW

Keep it encouraging, practical, and supportive. Be their hype person! ${langInstruction}

Format with clear sections using emojis.`
      });
      
      setAdvice(response);
    } catch (error) {
      console.error('Error getting advice:', error);
    }
    setIsLoading(false);
  };

  const resetCheck = () => {
    setSelectedMood(null);
    setSelectedEnergy(null);
    setSelectedContext(null);
    setAdvice(null);
    setStep(1);
  };

  // Upgrade Modal
  const UpgradeModal = () => {
    if (!showUpgradeModal) return null;
    
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => window.history.back()} />
        <div className="relative bg-slate-900 border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('upgrade.proFeature', 'Pro Feature')}</h3>
            <p className="text-slate-400 mb-6">
              {t('upgrade.moodCheckLocked', 'Mood Check is available for Pro and Elite members. Upgrade to get personalized advice based on your emotional state!')}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.hash = '#/profile?tab=subscription'}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                {t('upgrade.upgradeToPro', 'Upgrade to Pro')}
              </Button>
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full border-slate-700 text-slate-300"
              >
                {t('common.goBack', 'Go Back')}
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // If no access, show locked state
  if (!hasAccess) {
    return (
      <>
        <UpgradeModal />
        <div className="px-4 pt-6 pb-32 w-full max-w-full overflow-x-hidden">
          <div className="mb-6 text-center">
            <div className="inline-block mb-3">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl opacity-50">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{t('mood.title', 'Mood Check')}</h1>
            <p className="text-slate-400 text-sm">{t('upgrade.requiresProElite', 'Requires Pro or Elite membership')}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="px-4 pt-6 pb-32 w-full max-w-full overflow-x-hidden">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('common.goBack', 'Back to Home')}</span>
      </button>

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-slate-900" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{t('mood.title', 'Mood Check')}</h1>
        <p className="text-slate-400 text-sm">{t('mood.subtitle', 'How are you feeling today?')}</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-all ${
              step >= s ? 'bg-purple-500 scale-110' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {!advice ? (
        <div className="space-y-6">
          {/* Step 1: Mood Selection */}
          {step >= 1 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">1</span>
                {t('mood.howFeeling', "How are you feeling?")}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {moods.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => {
                        setSelectedMood(mood.id);
                        if (step === 1) setStep(2);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMood === mood.id
                          ? 'border-purple-500 bg-purple-500/20 scale-105'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <p className="text-xs text-slate-300 font-medium">{mood.label}</p>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Step 2: Energy Level */}
          {step >= 2 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">2</span>
                {t('mood.energyLevel', "What's your energy level?")}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {energyLevels.map((energy) => {
                  const Icon = energy.icon;
                  return (
                    <button
                      key={energy.id}
                      onClick={() => {
                        setSelectedEnergy(energy.id);
                        if (step === 2) setStep(3);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedEnergy === energy.id
                          ? 'border-purple-500 bg-purple-500/20 scale-105'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{energy.emoji}</div>
                      <p className="text-xs text-slate-300 font-medium">{energy.label}</p>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Step 3: Context */}
          {step >= 3 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">3</span>
                {t('mood.whatSituation', "What's the situation?")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {contexts.map((context) => (
                  <button
                    key={context.id}
                    onClick={() => setSelectedContext(context.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedContext === context.id
                        ? 'border-purple-500 bg-purple-500/20 scale-105'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xl mb-1">{context.emoji}</div>
                    <p className="text-xs text-slate-300 font-medium">{context.label}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Get Advice Button */}
          {selectedMood && selectedEnergy && selectedContext && (
            <Button
              onClick={getPersonalizedAdvice}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-6 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('mood.analyzing', 'Analyzing...')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t('mood.getAdvice', 'Get Personalized Advice')}
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          )}
        </div>
      ) : (
        /* Results */
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{moods.find(m => m.id === selectedMood)?.emoji}</div>
              <div className="text-3xl">{energyLevels.find(e => e.id === selectedEnergy)?.emoji}</div>
              <div className="text-3xl">{contexts.find(c => c.id === selectedContext)?.emoji}</div>
            </div>
            <p className="text-purple-200 text-sm">
              {t('mood.yourState', "Your current state: {{mood}}, {{energy}} energy, {{context}}", {
                mood: moods.find(m => m.id === selectedMood)?.label,
                energy: energyLevels.find(e => e.id === selectedEnergy)?.label,
                context: contexts.find(c => c.id === selectedContext)?.label
              })}
            </p>
          </Card>

          {/* Advice Card */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {t('mood.yourAdvice', 'Your Personalized Advice')}
            </h3>
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {advice}
            </div>
          </Card>

          {/* Reset Button */}
          <Button
            onClick={resetCheck}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('mood.checkAgain', 'Check Again')}
          </Button>
        </div>
      )}
    </div>
  );
}
