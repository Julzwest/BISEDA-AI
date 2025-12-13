import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Wrench,
  MapPin,
  Gift,
  MessageSquare,
  Heart,
  Smile,
  HeartCrack,
  Sparkles,
  Crown,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Tools() {
  const navigate = useNavigate();

  // Check if user has Pro or Elite subscription
  const hasProOrElite = () => {
    const tier = (localStorage.getItem('userSubscriptionTier') || '').toLowerCase();
    return ['pro', 'elite', 'premium'].includes(tier);
  };

  const tools = [
    {
      id: 'explore',
      icon: MapPin,
      title: 'Date Ideas & Venues',
      description: 'Find perfect spots for your dates',
      color: 'from-emerald-500 to-teal-500',
      route: '/explore',
      requiresPro: false
    },
    {
      id: 'gifts',
      icon: Gift,
      title: 'Gift Suggestions',
      description: 'Find the perfect gift for any occasion',
      color: 'from-rose-500 to-red-600',
      route: '/gifts',
      requiresPro: true
    },
    {
      id: 'mood',
      icon: Smile,
      title: 'Mood Check',
      description: 'Check your dating readiness',
      color: 'from-pink-500 to-rose-400',
      route: '/mood',
      requiresPro: false
    },
    {
      id: 'intimacy',
      icon: Heart,
      title: 'Intimacy Coach',
      description: 'Expert guidance on intimacy',
      color: 'from-pink-600 to-rose-500',
      route: '/intimacycoach',
      requiresPro: true
    },
    {
      id: 'breakup',
      icon: HeartCrack,
      title: 'Breakup Recovery',
      description: 'Heal from heartbreak with support',
      color: 'from-purple-600 to-indigo-600',
      route: '/breakupcoach',
      requiresPro: true
    },
    {
      id: 'chat',
      icon: MessageSquare,
      title: 'AI Chat Coach',
      description: 'Get dating advice anytime',
      color: 'from-purple-500 to-pink-500',
      route: '/chat',
      requiresPro: false
    }
  ];

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tools</h1>
            <p className="text-slate-400 text-sm">Additional dating resources</p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="px-4">
        <div className="space-y-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isLocked = tool.requiresPro && !hasProOrElite();
            
            return (
              <Link 
                key={tool.id} 
                to={tool.route}
                className="block group"
              >
                <Card className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]`}>
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform relative ${isLocked ? 'opacity-70' : ''}`}>
                        <Icon className="w-6 h-6 text-white" />
                        {tool.requiresPro && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" />
                            PRO
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-0.5 group-hover:text-purple-300 transition-colors">{tool.title}</h3>
                        <p className="text-slate-400 text-sm">{tool.description}</p>
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

        {/* Pro Banner */}
        {!hasProOrElite() && (
          <Card className="mt-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Unlock All Tools</h3>
                <p className="text-slate-300 text-sm">Upgrade to Pro for full access to all features</p>
              </div>
            </div>
            <Link to="/profile">
              <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all">
                Upgrade Now
              </button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
