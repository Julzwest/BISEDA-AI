import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Sparkles, 
  MessageSquare, 
  ArrowRight,
  Zap,
  Heart,
  Send,
  Shield,
  CheckCircle2,
  Flame,
  Stars
} from 'lucide-react';

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
    let name = localStorage.getItem('userName');
    
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

  const handleUploadScreenshot = () => {
    navigate('/copilot/upload?mode=screenshot');
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative" key={i18n.language}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-10 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute top-24 left-8 text-2xl animate-bounce opacity-60" style={{ animationDuration: '3s' }}>💬</span>
        <span className="absolute top-32 right-10 text-xl animate-bounce opacity-50" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>✨</span>
        <span className="absolute top-56 left-4 text-lg animate-bounce opacity-40" style={{ animationDuration: '4s', animationDelay: '1s' }}>💕</span>
        <span className="absolute top-72 right-6 text-2xl animate-bounce opacity-50" style={{ animationDuration: '3.5s', animationDelay: '0.3s' }}>🔥</span>
      </div>

      <div className="relative z-10 px-5 pt-8 pb-8 w-full max-w-full">
        
        {/* Logo + Branding */}
        <div className="text-center mb-8">
          <div 
            className="inline-block mb-4 relative cursor-pointer select-none"
            onClick={handleLogoTap}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
              
              {/* Main icon */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_50%)]"></div>
                <MessageSquare className="w-12 h-12 text-white relative z-10 drop-shadow-lg" fill="currentColor" strokeWidth={1.5} />
                <Sparkles className="w-5 h-5 text-yellow-300 absolute top-3 right-3 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>
          
          {/* App Name */}
          <h1 className="text-5xl font-black mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-sm">
              Biseda
            </span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              .ai
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="text-lg font-semibold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Your Dating Wingman 🎯
          </p>
          
          {/* Personalized Greeting */}
          {userName && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm font-medium">Hey {userName}!</span>
              <span className="text-lg">👋</span>
            </div>
          )}
        </div>

        {/* Hero Text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Never get left on read again
          </h2>
          <p className="text-slate-400 text-base">
            Upload your chat. Get the perfect reply. <span className="text-purple-400">It's that easy.</span>
          </p>
        </div>

        {/* PRIMARY CTA - Screenshot Upload */}
        <div className="mb-4">
          <button
            onClick={handleUploadScreenshot}
            className="w-full group relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            {/* Animated border */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl animate-gradient-x"></div>
            
            <div className="relative m-[2px] bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-2xl p-5 group-hover:from-slate-800 group-hover:via-purple-800/50 group-hover:to-slate-800 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                      Upload Screenshot
                    </h3>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full uppercase">
                      Popular
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">Snap → Upload → Get your reply ✨</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 mb-10 px-4">
          <Shield className="w-4 h-4 text-emerald-400" />
          <p className="text-slate-400 text-sm">
            100% private. Your chats stay on your device.
          </p>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl p-5 mb-8 border border-slate-700/50 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-2xl font-black text-white">10x</div>
              <div className="text-xs text-slate-400">Better replies</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center border border-pink-500/20">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <div className="text-2xl font-black text-white">50K+</div>
              <div className="text-xs text-slate-400">Dates landed</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">&lt;3s</div>
              <div className="text-xs text-slate-400">AI response</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Stars className="w-5 h-5 text-purple-400" />
            How it works
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">Screenshot your chat</h4>
                <p className="text-slate-400 text-xs">Works with Tinder, Bumble, Hinge & more</p>
              </div>
              <span className="text-2xl">📸</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">AI reads the vibe</h4>
                <p className="text-slate-400 text-xs">Understands context, tone & intent</p>
              </div>
              <span className="text-2xl">🧠</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">Send the perfect reply</h4>
                <p className="text-slate-400 text-xs">Copy, paste, and watch the magic happen</p>
              </div>
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs">😎</div>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs">🥰</div>
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs">😍</div>
                <div className="w-8 h-8 bg-slate-700 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs text-slate-300">+5K</div>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
                <span className="text-slate-400 text-xs ml-1">4.9</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm italic">
              "This app literally saved my dating life. Got 3 dates in one week!" 
              <span className="text-slate-500 ml-1">— Alex, 26</span>
            </p>
          </div>
        </div>

        {/* Works With */}
        <div className="pb-28">
          <p className="text-slate-500 text-xs text-center mb-3 uppercase tracking-wider font-medium">Works with all dating apps</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { name: 'Tinder', emoji: '🔥' },
              { name: 'Bumble', emoji: '🐝' },
              { name: 'Hinge', emoji: '💜' },
              { name: 'WhatsApp', emoji: '💬' },
              { name: 'Instagram', emoji: '📸' }
            ].map((app) => (
              <span key={app.name} className="text-slate-400 text-xs bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 flex items-center gap-1.5 hover:border-purple-500/30 transition-colors">
                <span>{app.emoji}</span>
                {app.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
