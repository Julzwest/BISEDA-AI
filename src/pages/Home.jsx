import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Lightbulb, TrendingUp, Zap, Star, Sparkles, Heart, MessageSquare, Calendar, Bot, Gift, PartyPopper } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UsageDisplay from '@/components/UsageDisplay';
import UpgradeModal from '@/components/UpgradeModal';

export default function Home() {
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

  useEffect(() => {
    // Get user name if exists
    const name = localStorage.getItem('userName');
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

  const features = [
    {
      icon: Bot,
      title: 'AI Coach',
      description: 'Bisedo me AI për të praktikuar biseda, mësuar teknikat e picking up, dhe përmirësuar aftësitë e tua',
      color: 'from-purple-500 to-pink-500',
      page: 'Chat'
    },
    {
      icon: Calendar,
      title: 'Takime të Para',
      description: 'Gjej ide perfekte për takimin e parë me sugjerime lokal biznesesh në qytetet shqiptare',
      color: 'from-pink-500 to-rose-500',
      page: 'FirstDates'
    },
    {
      icon: Lightbulb,
      title: 'Këshilla & Tips',
      description: 'Mëso si të flasësh me djem/vajza në WhatsApp, Instagram, Messenger, Tinder dhe të përmirësosh lojën tënde',
      color: 'from-amber-500 to-orange-600',
      page: 'Tips'
    },
    {
      icon: PartyPopper,
      title: 'Evente Lokale',
      description: 'Gjej vende eventesh, koncerte, klube dhe argëtim në qytetin tënd',
      color: 'from-yellow-500 to-orange-500',
      page: 'Events'
    },
    {
      icon: Gift,
      title: 'Sugjerime Dhuratash',
      description: 'Gjej dhuratën perfekte bazuar në interesat e partnerit me lidhje për blerje',
      color: 'from-rose-500 to-red-500',
      page: 'Gifts'
    }
  ];

  const stats = [
    { icon: TrendingUp, label: 'Përmirëso lojën', value: '10x' },
    { icon: Heart, label: 'Më shumë takime', value: '99%' },
    { icon: Zap, label: 'Rezultate të shpejta', value: '24h' }
  ];


  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="px-4 pt-6 pb-6 w-full max-w-full">
        <div className="text-center mb-6">
          {/* Logo - Speech bubbles representing conversation */}
          {/* Secret: Tap 6 times to access admin dashboard */}
          <div 
            className="inline-block mb-5 relative cursor-pointer select-none"
            onClick={handleLogoTap}
          >
            <div className="relative">
              {/* Main speech bubble */}
              <div className={`w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative overflow-hidden transition-transform ${logoTapCount > 0 ? 'scale-95' : ''}`}>
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
            {/* Hidden tap counter indicator (only shows when tapping) */}
            {logoTapCount > 0 && logoTapCount < 6 && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i < logoTapCount ? 'bg-purple-400' : 'bg-slate-600'}`}
                  />
                ))}
              </div>
            )}
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
              Ç'kemi {userName}! 👋
            </p>
          )}
          <p className="text-slate-300 text-base leading-relaxed max-w-md mx-auto mb-6">
            {userName 
              ? 'Gati për të përmirësuar lojën tënde në dating?'
              : 'Mëso si të flasësh me djem/vajza, përmirëso chat-et në WhatsApp, Instagram, Facebook Messenger, Tinder dhe aplikacione të tjera dating'
            }
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
      </div>

      {/* Features */}
      <div className="px-6 pb-24">
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Fillo tani
        </h2>
        <div className="space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const linkUrl = feature.category 
              ? `${createPageUrl(feature.page)}?category=${feature.category}`
              : createPageUrl(feature.page);
            return (
              <Link 
                key={index} 
                to={linkUrl}
                className="block group"
              >
                <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 hover:from-slate-800/90 hover:to-slate-900/90 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-purple-500/20">
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-xl shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-white mb-0.5 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                      <div className="text-slate-500 group-hover:text-purple-400 transition-colors">
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
            Pse Biseda.ai?
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <p className="text-sm">Mëso si të flasësh me djem/vajza në WhatsApp, Instagram, Facebook Messenger, Tinder dhe aplikacione të tjera</p>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <p className="text-sm">Merr këshilla për dating dhe si të fillosh biseda interesante</p>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <p className="text-sm">Përmirëso lojën tënde dhe bëhu më i sigurt në chat-et</p>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
              <p className="text-sm">AI inteligjent që kupton emocionet dhe dialektet shqipe për përgjigje më të mira</p>
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

