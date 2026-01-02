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
  const backendUrl = getBackendUrl();
  
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
        prompt: `You are an enthusiastic, supportive dating coach and confidence expert. The user needs a quick pep talk!

USER'S STATE:
- Mood: ${mood?.label} ${mood?.emoji}
- Energy: ${energy?.label} ${energy?.emoji}
- Situation: ${context?.label} ${context?.emoji}

Return a JSON object with this EXACT structure:
{
  "hypeMessage": "A short, energetic 1-2 sentence acknowledgment that hypes them up (max 25 words)",
  "vibe": "one emoji that captures the overall vibe",
  "tips": [
    { "emoji": "🎯", "title": "Short title (2-4 words)", "text": "Quick actionable tip (max 15 words)" },
    { "emoji": "💪", "title": "Short title (2-4 words)", "text": "Quick actionable tip (max 15 words)" },
    { "emoji": "✨", "title": "Short title (2-4 words)", "text": "Quick actionable tip (max 15 words)" }
  ],
  "mantra": "Powerful 3-6 word affirmation they can repeat",
  "action": "One specific thing to do RIGHT NOW (max 12 words)",
  "actionEmoji": "emoji for the action"
}

Be FUN, ENERGETIC, and SUPPORTIVE! Use casual, friendly language. ${langInstruction}`,
        response_type: 'json'
      });
      
      // Parse the response
      let parsedAdvice;
      if (typeof response === 'string') {
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedAdvice = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      } else if (typeof response === 'object') {
        parsedAdvice = response;
      }
      
      // Fallback if parsing fails
      if (!parsedAdvice || !parsedAdvice.tips) {
        parsedAdvice = {
          hypeMessage: "You've got this! Your energy is exactly what you need right now. Let's channel it!",
          vibe: "🔥",
          tips: [
            { emoji: "🎯", title: "Be Present", text: "Focus on enjoying the moment, not the outcome" },
            { emoji: "💪", title: "Own Your Vibe", text: "Your confidence is your superpower - wear it!" },
            { emoji: "✨", title: "Stay Curious", text: "Ask questions and genuinely listen to them" }
          ],
          mantra: "I am magnetic and worthy",
          action: "Take 3 deep breaths and smile",
          actionEmoji: "🌟"
        };
      }
      
      setAdvice(parsedAdvice);
    } catch (error) {
      console.error('Error getting advice:', error);
      // Fallback advice
      setAdvice({
        hypeMessage: "Hey, you're already winning by checking in with yourself! Let's get you ready!",
        vibe: "💫",
        tips: [
          { emoji: "🎯", title: "Breathe & Ground", text: "Take 3 deep breaths to center yourself" },
          { emoji: "💪", title: "Remember Your Wins", text: "Think of a time you felt amazing" },
          { emoji: "✨", title: "Be Authentically You", text: "The right person will love the real you" }
        ],
        mantra: "I am enough, always",
        action: "Strike a power pose for 30 seconds",
        actionEmoji: "🦸"
      });
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

  return (
    <div className="px-4 pt-2 pb-4 w-full max-w-full overflow-x-hidden">
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
        /* Results - Fun & Colorful! */
        <div className="space-y-4">
          {/* Big Vibe Header */}
          <div className="text-center py-4">
            <div className="text-6xl mb-3 animate-bounce">{advice.vibe}</div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full border border-purple-400/30">
              <span className="text-2xl">{moods.find(m => m.id === selectedMood)?.emoji}</span>
              <span className="text-slate-400">+</span>
              <span className="text-2xl">{energyLevels.find(e => e.id === selectedEnergy)?.emoji}</span>
              <span className="text-slate-400">+</span>
              <span className="text-2xl">{contexts.find(c => c.id === selectedContext)?.emoji}</span>
            </div>
          </div>

          {/* Hype Message Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 border-0 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎉</span>
                <span className="text-white/80 text-xs uppercase tracking-wider font-bold">Your Vibe Check</span>
              </div>
              <p className="text-white text-xl font-bold leading-relaxed">
                {advice.hypeMessage}
              </p>
            </div>
          </Card>

          {/* Tips - Colorful Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💡</span>
              <span className="text-white font-bold">{t('mood.quickTips', 'Quick Tips for You')}</span>
            </div>
            {advice.tips?.map((tip, index) => {
              const colors = [
                'from-cyan-500 to-blue-600',
                'from-orange-500 to-red-500',
                'from-green-500 to-emerald-600'
              ];
              const bgColors = [
                'bg-cyan-500/10 border-cyan-500/30',
                'bg-orange-500/10 border-orange-500/30',
                'bg-green-500/10 border-green-500/30'
              ];
              return (
                <Card 
                  key={index} 
                  className={`${bgColors[index]} border backdrop-blur-sm p-4 transform transition-all hover:scale-[1.02]`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[index]} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-2xl">{tip.emoji}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{tip.title}</h4>
                      <p className="text-slate-300 text-sm">{tip.text}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Mantra Card */}
          <Card className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-yellow-500/30 p-5 text-center">
            <div className="flex justify-center mb-2">
              <span className="text-3xl">🔮</span>
            </div>
            <p className="text-yellow-200/80 text-xs uppercase tracking-widest mb-2 font-bold">
              {t('mood.yourMantra', 'Your Power Mantra')}
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-orange-300 to-amber-300 bg-clip-text text-transparent">
              "{advice.mantra}"
            </p>
          </Card>

          {/* Action Card */}
          <Card className="relative overflow-hidden bg-slate-800/80 border-slate-600 p-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-full blur-xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
                <span className="text-3xl">{advice.actionEmoji}</span>
              </div>
              <div>
                <p className="text-green-400 text-xs uppercase tracking-wider font-bold mb-1">
                  ⚡ {t('mood.doThisNow', 'Do This RIGHT NOW')}
                </p>
                <p className="text-white font-bold text-lg">{advice.action}</p>
              </div>
            </div>
          </Card>

          {/* Fun Footer */}
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm mb-4">
              ✨ {t('mood.youGotThis', "You've got this!")} ✨
            </p>
          </div>

          {/* Reset Button */}
          <Button
            onClick={resetCheck}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-5 border border-slate-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('mood.checkAgain', 'Check Again')}
          </Button>
        </div>
      )}
    </div>
  );
}
