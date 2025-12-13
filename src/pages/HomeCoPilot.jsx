import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Star,
  Shield
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function HomeCoPilot() {
  const { i18n } = useTranslation();
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
      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION - Clean, calm, action-first
          ═══════════════════════════════════════════════════════════ */}
      <div className="px-5 pt-10 pb-8 w-full max-w-full">
        
        {/* Logo + Branding */}
        <div className="text-center mb-10">
          <div 
            className="inline-block mb-5 relative cursor-pointer select-none"
            onClick={handleLogoTap}
          >
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <MessageSquare className="w-10 h-10 text-white relative z-10" fill="currentColor" strokeWidth={1.5} />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute top-2 right-2 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* App Name */}
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
              Biseda
            </span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-3xl">
              .ai
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="text-lg font-medium text-purple-300/90">
            The AI Co-Pilot for Dating Apps
          </p>
          
          {/* Personalized Greeting */}
          {userName && (
            <p className="text-base text-slate-400 mt-2">
              Hey {userName} 👋
            </p>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            PRIMARY CTA - Maximum prominence
            ═══════════════════════════════════════════════════════════ */}
        <div className="mb-6">
          <button
            onClick={handleUploadScreenshot}
            className="w-full group relative overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl p-[2px] shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl px-6 py-6 flex items-center justify-between group-hover:from-slate-800 group-hover:to-slate-700 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                      Upload chat screenshot
                    </h3>
                    <p className="text-slate-400 text-sm mt-0.5">Get the perfect reply instantly</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-purple-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          </button>
        </div>

        {/* Trust Line */}
        <div className="flex items-center justify-center gap-2 mb-8 px-4">
          <Shield className="w-4 h-4 text-green-400/70" />
          <p className="text-slate-500 text-sm text-center">
            Private, consent-first advice. Nothing is sent without you.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECONDARY CTA - Clearly secondary
            ═══════════════════════════════════════════════════════════ */}
        <button
          onClick={handlePasteText}
          className="w-full group mb-12"
        >
          <Card className="bg-slate-800/60 border-slate-700/40 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all duration-300">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center group-hover:from-indigo-500 group-hover:to-cyan-500 transition-all duration-300">
                  <ClipboardPaste className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">
                    Or paste chat text
                  </h3>
                  <p className="text-slate-500 text-xs">Copy & paste your conversation</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Card>
        </button>

        {/* ═══════════════════════════════════════════════════════════
            BELOW THE FOLD - De-emphasised content
            ═══════════════════════════════════════════════════════════ */}
        
        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-slate-600 text-xs uppercase tracking-wider">Why it works</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* Quick Stats - Smaller, de-emphasised */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="text-center p-3">
            <TrendingUp className="w-5 h-5 mx-auto mb-1.5 text-purple-400/70" />
            <div className="text-lg font-bold text-slate-300">10x</div>
            <div className="text-[10px] text-slate-500">Better replies</div>
          </div>
          <div className="text-center p-3">
            <Heart className="w-5 h-5 mx-auto mb-1.5 text-pink-400/70" />
            <div className="text-lg font-bold text-slate-300">99%</div>
            <div className="text-[10px] text-slate-500">More dates</div>
          </div>
          <div className="text-center p-3">
            <Zap className="w-5 h-5 mx-auto mb-1.5 text-amber-400/70" />
            <div className="text-lg font-bold text-slate-300">3s</div>
            <div className="text-[10px] text-slate-500">Instant AI</div>
          </div>
        </div>

        {/* How It Works - Compact */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-purple-400/80 font-semibold text-xs">1</span>
            </div>
            <div>
              <h4 className="text-slate-300 font-medium text-sm">Screenshot or paste</h4>
              <p className="text-slate-500 text-xs">From Tinder, Bumble, Hinge, or any app</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-purple-400/80 font-semibold text-xs">2</span>
            </div>
            <div>
              <h4 className="text-slate-300 font-medium text-sm">AI analyzes the vibe</h4>
              <p className="text-slate-500 text-xs">Understands context, tone & intent</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-purple-400/80 font-semibold text-xs">3</span>
            </div>
            <div>
              <h4 className="text-slate-300 font-medium text-sm">Get the perfect reply</h4>
              <p className="text-slate-500 text-xs">Copy, send, and watch the magic ✨</p>
            </div>
          </div>
        </div>

        {/* Works With Section - Minimal */}
        <div className="pb-24">
          <p className="text-slate-600 text-[10px] text-center mb-2 uppercase tracking-wider">Works with</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {['Tinder', 'Bumble', 'Hinge', 'WhatsApp', 'Instagram'].map((app) => (
              <span key={app} className="text-slate-500 text-xs bg-slate-800/30 px-2.5 py-1 rounded-full border border-slate-800/50">
                {app}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
