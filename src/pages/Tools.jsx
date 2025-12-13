import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Wrench,
  MapPin,
  Gift,
  MessageSquare,
  Smile,
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

  // Focused list of 4 tools only
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
      id: 'confidence',
      icon: Smile,
      title: 'Confidence Check',
      description: 'Assess your dating readiness',
      color: 'from-amber-500 to-orange-500',
      route: '/mood',
      requiresPro: false
    },
    {
      id: 'chat',
      icon: MessageSquare,
      title: 'Ask the Co-Pilot',
      description: 'Get quick dating advice anytime',
      color: 'from-purple-500 to-pink-500',
      route: '/chat',
      requiresPro: false
    }
  ];

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Tools</h1>
            <p className="text-slate-500 text-sm">Supporting resources</p>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="px-5">
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
                <Card className="bg-slate-800/60 border-slate-700/40 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all">
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform relative ${isLocked ? 'opacity-70' : ''}`}>
                        <Icon className="w-5 h-5 text-white" />
                        {tool.requiresPro && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" />
                            PRO
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-0.5 group-hover:text-purple-300 transition-colors">{tool.title}</h3>
                        <p className="text-slate-500 text-sm">{tool.description}</p>
                      </div>
                      <div className="text-slate-600 group-hover:text-purple-400 transition-colors">
                        {isLocked ? (
                          <Lock className="w-5 h-5 text-amber-500/70" />
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

        {/* Pro Upgrade - Minimal */}
        {!hasProOrElite() && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <Link to="/profile" className="block">
              <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-400 text-sm">Unlock all tools with Pro</span>
                </div>
                <span className="text-purple-400 text-sm font-medium">Upgrade →</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
