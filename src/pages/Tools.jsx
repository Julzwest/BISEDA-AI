import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Wrench,
  MapPin,
  Gift,
  MessageSquare,
  Smile,
  Crown,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  BookOpen
} from 'lucide-react';

export default function Tools() {
  const { t } = useTranslation();
  
  // Check if user has Pro or Elite subscription
  const hasProOrElite = () => {
    const tier = (localStorage.getItem('userSubscriptionTier') || '').toLowerCase();
    return ['pro', 'elite', 'premium'].includes(tier);
  };

  const tools = [
    {
      id: 'journal',
      icon: BookOpen,
      title: t('tools.journal', 'My Journal'),
      description: t('tools.journalDesc', 'Save dates, places, gifts & notes'),
      color: 'from-purple-500 to-pink-500',
      route: '/journal',
      requiresPro: false,
      emoji: '📔'
    },
    {
      id: 'explore',
      icon: MapPin,
      title: t('tools.dateIdeas', 'Date Ideas & Venues'),
      description: t('tools.dateIdeasDesc', 'Find perfect spots for your dates'),
      color: 'from-emerald-500 to-teal-500',
      route: '/explore',
      requiresPro: false,
      emoji: '📍'
    },
    {
      id: 'gifts',
      icon: Gift,
      title: t('tools.gifts', 'Gift Suggestions'),
      description: t('tools.giftsDesc', 'Find the perfect gift for any occasion'),
      color: 'from-rose-500 to-red-600',
      route: '/gifts',
      requiresPro: false,
      emoji: '🎁'
    },
    {
      id: 'confidence',
      icon: Smile,
      title: t('tools.confidence', 'Confidence Check'),
      description: t('tools.confidenceDesc', 'Assess your dating readiness'),
      color: 'from-amber-500 to-orange-500',
      route: '/mood',
      requiresPro: false,
      emoji: '💪'
    },
    {
      id: 'bodylanguage',
      icon: Eye,
      title: t('tools.bodyLanguage', 'Body Language Guide'),
      description: t('tools.bodyLanguageDesc', 'Learn to read attraction signals'),
      color: 'from-violet-500 to-purple-600',
      route: '/bodylanguage',
      requiresPro: false,
      emoji: '👀'
    }
  ];

  return (
    <div className="w-full pb-2 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-60 h-60 bg-slate-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute top-24 right-6 text-2xl animate-bounce opacity-40" style={{ animationDuration: '3s' }}>🛠️</span>
        <span className="absolute top-48 left-4 text-xl animate-bounce opacity-30" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>✨</span>
        <span className="absolute bottom-72 right-8 text-lg animate-bounce opacity-40" style={{ animationDuration: '4s', animationDelay: '1s' }}>🎯</span>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-4 pb-6">
          <div className="flex items-center gap-4 mb-2">
            {/* Icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl">
                <Wrench className="w-7 h-7 text-slate-200" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                {t('tools.title', 'Tools')}
                <span className="text-xl">🧰</span>
              </h1>
              <p className="text-slate-400 text-sm">{t('tools.subtitle', 'Extra dating resources')}</p>
            </div>
          </div>
        </div>

        {/* Tools List */}
        <div className="px-5">
          <div className="space-y-4">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const isLocked = tool.requiresPro && !hasProOrElite();
              
              return (
                <Link 
                  key={tool.id} 
                  to={tool.route}
                  className="block group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`relative bg-slate-800/60 border-2 border-slate-700/50 hover:border-purple-500/40 rounded-2xl p-5 transition-all duration-300 hover:bg-slate-800/80 active:scale-[0.98] ${isLocked ? 'opacity-80' : ''}`}>
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`relative w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300 ${isLocked ? 'opacity-70' : ''}`}>
                        <span className="text-2xl">{tool.emoji}</span>
                        {tool.requiresPro && (
                          <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                            <Crown className="w-2.5 h-2.5" />
                            PRO
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg mb-0.5 group-hover:text-purple-300 transition-colors">{tool.title}</h3>
                        <p className="text-slate-400 text-sm">{tool.description}</p>
                      </div>
                      
                      {/* Arrow */}
                      <div className="text-slate-600 group-hover:text-purple-400 transition-colors">
                        {isLocked ? (
                          <Lock className="w-5 h-5 text-amber-500/70" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-700/50 group-hover:bg-purple-500/20 rounded-xl flex items-center justify-center transition-all">
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pro Upgrade Card - REMOVED */}

          {/* Bottom Quote */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm italic">
              {t('tools.quote', '"The right tools make all the difference" ✨')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
