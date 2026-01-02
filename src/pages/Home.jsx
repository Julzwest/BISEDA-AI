import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPageUrl } from '../utils';
import { Lightbulb, TrendingUp, Zap, Star, Sparkles, Heart, HeartCrack, MessageSquare, Calendar, Bot, Gift, PartyPopper, Smile, Camera, BookOpen, Users, User, MapPin, Lock, Crown, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UsageDisplay from '@/components/UsageDisplay';
import UpgradeModal from '@/components/UpgradeModal';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  
  // Secret admin access - tap logo 6 times
  const [logoTapCount, setLogoTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);
  
  const handleLogoTap = () => {
    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    
    // Check if reached 6 taps
    if (newCount >= 6) {
      setLogoTapCount(0);
      navigate('/admin');
      return;
    }
    
    // Reset count after 2 seconds of no taps
    tapTimeoutRef.current = setTimeout(() => {
      setLogoTapCount(0);
    }, 2000);
  };

  // Check if user has Pro or Elite subscription
  // 🎉 EVERYTHING IS FREE NOW!
  const hasProOrElite = () => {
    return true; // All features are free!
  };

  useEffect(() => {
    // Get user name if exists
    let name = localStorage.getItem('userName');
    
    // 🔒 FIX: Detect and remove broken "undefined undefined" values from old impersonation
    if (name && (name.includes('undefined') || name === 'null null' || name === 'null' || name.trim() === '')) {
      console.warn('⚠️ Detected broken userName in localStorage:', name);
      
      // Try to get a better name from email
      const email = localStorage.getItem('userEmail');
      if (email && email.includes('@')) {
        name = email.split('@')[0];
        localStorage.setItem('userName', name);
        console.log('✅ Fixed userName to:', name);
      } else {
        // Clear broken value
        name = null;
        localStorage.removeItem('userName');
        console.log('✅ Cleared broken userName');
      }
    }
    
    if (name) {
      setUserName(name);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  // Daily tip (changes daily)
  const [dailyTip, setDailyTip] = useState('');
  const [lastConversation, setLastConversation] = useState(null);

  useEffect(() => {
    // Get daily tip
    const tips = [
      "💡 Ask open-ended questions to keep the conversation flowing",
      "✨ Mirror their energy - if they're playful, be playful back!",
      "🎯 Use their profile as conversation fuel - mention shared interests",
      "😊 Compliment something specific, not just 'you're beautiful'",
      "💬 Share something interesting about yourself to spark curiosity",
      "🎭 Be authentic - the right person will love the real you",
      "⏰ Don't wait too long to ask them out - strike while the iron is hot!",
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyTip(tips[dayOfYear % tips.length]);

    // Get last conversation
    try {
      const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      if (history.length > 0) {
        setLastConversation(history[0]);
      }
    } catch (e) {}
  }, []);

  // ALL FEATURES ARE FREE NOW! 🎉
  const features = [
    {
      icon: Zap,
      title: 'Live Wingman ⚡',
      description: 'Real-time dating tips',
      color: 'from-amber-500 to-orange-600',
      page: 'wingman'
    },
    {
      icon: Users,
      title: 'Date Practice',
      description: 'Roleplay before the real thing',
      color: 'from-violet-600 to-fuchsia-500',
      page: 'Rehearsal'
    },
    {
      icon: MapPin,
      title: 'Date Ideas 📍',
      description: 'Find the perfect spot',
      color: 'from-emerald-500 to-teal-500',
      page: 'explore'
    },
    {
      icon: Gift,
      title: 'Gift Ideas 🎁',
      description: 'Find the perfect gift',
      color: 'from-rose-500 to-red-600',
      page: 'Gifts'
    },
    {
      icon: Heart,
      title: 'Vibe Check 💕',
      description: 'Check your dating energy',
      color: 'from-pink-500 to-rose-400',
      page: 'MoodCheck'
    },
    {
      icon: Eye,
      title: 'Body Language 👀',
      description: 'Read the signals',
      color: 'from-cyan-500 to-blue-500',
      page: 'bodylanguage'
    },
    {
      icon: HeartCrack,
      title: 'Breakup Recovery',
      description: 'Heal and move on 💪',
      color: 'from-purple-600 to-indigo-600',
      page: 'BreakupCoach'
    }
  ];

  const stats = [
    { icon: TrendingUp, label: t('home.stats.improve'), value: '10x' },
    { icon: Heart, label: t('home.stats.moreDates'), value: '99%' },
    { icon: Zap, label: t('home.stats.fastResults'), value: '24h' }
  ];


  return (
    <div className="w-full overflow-x-hidden" key={i18n.language}>
      {/* Hero Section */}
      <div className="px-4 pt-2 pb-6 w-full max-w-full">
        <div className="text-center mb-6">
          {/* Logo - Speech bubbles representing conversation */}
          {/* Secret: Tap 6 times to access admin dashboard */}
          <div 
            className="inline-block mb-5 relative cursor-pointer select-none"
            onClick={handleLogoTap}
          >
            <div className="relative">
              {/* Main speech bubble */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative overflow-hidden">
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                {/* Speech bubble icon */}
                <MessageSquare className="w-12 h-12 text-white relative z-10" fill="currentColor" strokeWidth={1.5} />
                {/* Small sparkle effect */}
                <Sparkles className="w-4 h-4 text-yellow-300 absolute top-2 right-2 animate-pulse" />
              </div>
              {/* Small secondary speech bubble */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* App Name with proper .ai styling */}
          <h1 className="text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
              Biseda
            </span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-4xl">
              .ai
            </span>
          </h1>
          
          {/* Personalized Greeting */}
          {userName && (
            <p className="text-xl font-semibold text-purple-300 mb-3">
              👋 {userName}!
            </p>
          )}
          <p className="text-slate-300 text-base leading-relaxed max-w-md mx-auto mb-6">
            {t('app.tagline')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mb-6 w-full">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm p-2 text-center hover:border-purple-500/50 transition-all">
                <Icon className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                <div className="text-lg font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-[10px] text-slate-400 leading-tight truncate">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Usage Display & Upgrade Button */}
        <div className="mb-6">
          <UsageDisplay onUpgrade={() => setShowUpgradeModal(true)} />
        </div>

        {/* Live Wingman Quick Access Button */}
        <Link to="/wingman" className="block mb-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-4 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-red-400/20 animate-pulse"></div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">Live Wingman ⚡</h3>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <p className="text-white/80 text-sm">Real-time dating tips 🔥</p>
              </div>
              <div className="text-white/80">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Features */}
      <div className="px-6 pb-4">
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {t('home.getStarted')}
        </h2>
        <div className="space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const linkUrl = feature.category 
              ? `${createPageUrl(feature.page)}?category=${feature.category}`
              : createPageUrl(feature.page);
            const isLocked = feature.requiresProOrElite && !hasProOrElite();
            return (
              <Link 
                key={index} 
                to={linkUrl}
                className="block group"
              >
                <Card className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 hover:from-slate-800/90 hover:to-slate-900/90 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-purple-500/20 ${isLocked ? 'relative' : ''}`}>
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-xl shrink-0 group-hover:scale-110 transition-transform relative ${isLocked ? 'opacity-70' : ''}`}>
                        <Icon className="w-7 h-7 text-white" />
                        {feature.isNew && !isLocked && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            NEW
                          </div>
                        )}
                        {feature.requiresProOrElite && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            🎉 FREE
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-white mb-0.5 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                      <div className="text-slate-500 group-hover:text-purple-400 transition-colors">
                        {isLocked ? (
                          <Lock className="w-5 h-5 text-amber-500" />
                        ) : (
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-400" />
            {t('home.whyBiseda', 'Why Biseda.ai?')}
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <p className="text-sm">{t('home.benefit1', 'Learn how to talk to guys/girls on WhatsApp, Instagram, Messenger, Tinder and other apps')}</p>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <p className="text-sm">{t('home.benefit2', 'Get dating advice and learn how to start interesting conversations')}</p>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <p className="text-sm">{t('home.benefit3', 'Improve your game and become more confident in chats')}</p>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <p className="text-sm">{t('home.benefit4', 'Smart AI that understands emotions for better responses')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        onSelectPlan={(plan) => {
          // Handle plan selection (already handled in UpgradeModal)
          setShowUpgradeModal(false);
        }}
      />
    </div>
  );
}

