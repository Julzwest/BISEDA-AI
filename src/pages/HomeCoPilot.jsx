import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  ClipboardPaste, 
  Sparkles, 
  MessageSquare, 
  ArrowRight,
  Zap,
  Heart,
  TrendingUp,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UsageDisplay from '@/components/UsageDisplay';
import UpgradeModal from '@/components/UpgradeModal';

export default function HomeCoPilot() {
  const { t, i18n } = useTranslation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  
  // Secret admin access - tap logo 6 times
  const [logoTapCount, setLogoTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);
  
  const handleLogoTap = () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    
    if (newCount >= 6) {
      setLogoTapCount(0);
      navigate('/admin');
      return;
    }
    
    tapTimeoutRef.current = setTimeout(() => {
      setLogoTapCount(0);
    }, 2000);
  };

  useEffect(() => {
    // Get user name if exists
    let name = localStorage.getItem('userName');
    
    // Detect and remove broken values
    if (name && (name.includes('undefined') || name === 'null null' || name === 'null' || name.trim() === '')) {
      const email = localStorage.getItem('userEmail');
      if (email && email.includes('@')) {
        name = email.split('@')[0];
        localStorage.setItem('userName', name);
      } else {
        name = null;
        localStorage.removeItem('userName');
      }
    }
    
    if (name) {
      setUserName(name);
    }
    
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  // Handle screenshot upload
  const handleUploadScreenshot = () => {
    navigate('/copilot/upload?mode=screenshot');
  };

  // Handle paste text
  const handlePasteText = () => {
    navigate('/copilot/upload?mode=paste');
  };

  return (
    <div className="w-full overflow-x-hidden" key={i18n.language}>
      {/* Hero Section */}
      <div className="px-4 pt-8 pb-6 w-full max-w-full">
        <div className="text-center mb-8">
          {/* Logo */}
          <div 
            className="inline-block mb-6 relative cursor-pointer select-none"
            onClick={handleLogoTap}
          >
            <div className="relative">
              {/* Main icon */}
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <MessageSquare className="w-14 h-14 text-white relative z-10" fill="currentColor" strokeWidth={1.5} />
                <Sparkles className="w-5 h-5 text-yellow-300 absolute top-3 right-3 animate-pulse" />
              </div>
              {/* Co-pilot badge */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl px-3 py-1 shadow-lg border-2 border-slate-900">
                <span className="text-white text-xs font-bold">Co-Pilot</span>
              </div>
            </div>
          </div>
          
          {/* App Name */}
          <h1 className="text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
              Biseda
            </span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-4xl">
              .ai
            </span>
          </h1>
          
          {/* Tagline - The new positioning */}
          <p className="text-xl font-semibold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent mb-3">
            The AI Co-Pilot for Dating Apps
          </p>
          
          {/* Personalized Greeting */}
          {userName && (
            <p className="text-lg text-purple-300 mb-4">
              👋 Hey {userName}!
            </p>
          )}
        </div>

        {/* Main CTA Section */}
        <div className="space-y-4 mb-8">
          {/* Primary CTA - Upload Screenshot */}
          <button
            onClick={handleUploadScreenshot}
            className="w-full group relative overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl p-[2px] shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl px-6 py-5 flex items-center justify-between group-hover:from-slate-800 group-hover:to-slate-700 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                      Upload chat screenshot
                    </h3>
                    <p className="text-slate-400 text-sm">Get instant reply suggestions</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-purple-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          </button>

          {/* Subtitle / Value Proposition */}
          <div className="text-center py-4">
            <p className="text-slate-300 text-base leading-relaxed max-w-sm mx-auto">
              Upload a chat screenshot. Get the perfect next message.
            </p>
            <p className="text-purple-400 text-sm font-medium mt-1">
              (v1 Co-Pilot)
            </p>
          </div>

          {/* Secondary CTA - Paste Text */}
          <button
            onClick={handlePasteText}
            className="w-full group"
          >
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 hover:from-slate-700/90 hover:to-slate-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ClipboardPaste className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                      Paste chat text
                    </h3>
                    <p className="text-slate-400 text-sm">Copy & paste your conversation</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm p-3 text-center hover:border-purple-500/50 transition-all">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <div className="text-lg font-bold text-white">10x</div>
            <div className="text-[10px] text-slate-400 leading-tight">Better replies</div>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm p-3 text-center hover:border-purple-500/50 transition-all">
            <Heart className="w-5 h-5 mx-auto mb-1 text-pink-400" />
            <div className="text-lg font-bold text-white">99%</div>
            <div className="text-[10px] text-slate-400 leading-tight">More dates</div>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm p-3 text-center hover:border-purple-500/50 transition-all">
            <Zap className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <div className="text-lg font-bold text-white">3s</div>
            <div className="text-[10px] text-slate-400 leading-tight">Instant AI</div>
          </Card>
        </div>

        {/* Usage Display */}
        <div className="mb-8">
          <UsageDisplay onUpgrade={() => setShowUpgradeModal(true)} />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-6 pb-24">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-400" />
          How it works
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <span className="text-purple-400 font-bold text-sm">1</span>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-0.5">Screenshot or paste</h4>
              <p className="text-slate-400 text-sm">Take a screenshot of your Tinder, Bumble, Hinge, or any dating app chat</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <span className="text-purple-400 font-bold text-sm">2</span>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-0.5">AI analyzes the conversation</h4>
              <p className="text-slate-400 text-sm">Our AI understands context, tone, and what they really mean</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <span className="text-purple-400 font-bold text-sm">3</span>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-0.5">Get the perfect reply</h4>
              <p className="text-slate-400 text-sm">Copy the suggested message and send it. Watch the magic happen ✨</p>
            </div>
          </div>
        </div>

        {/* Works With Section */}
        <div className="mt-8">
          <p className="text-slate-500 text-xs text-center mb-3">WORKS WITH</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {['Tinder', 'Bumble', 'Hinge', 'WhatsApp', 'Instagram'].map((app) => (
              <span key={app} className="text-slate-400 text-sm bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                {app}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        onSelectPlan={(plan) => {
          setShowUpgradeModal(false);
        }}
      />
    </div>
  );
}
