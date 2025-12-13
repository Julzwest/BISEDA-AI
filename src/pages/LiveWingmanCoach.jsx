import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Zap,
  Heart,
  Smile,
  MessageCircle,
  Calendar,
  DoorOpen,
  Eye,
  Hand,
  Laugh,
  ArrowLeftCircle,
  Smartphone,
  Send,
  Check,
  AlertTriangle,
  Shield,
  Sparkles,
  Copy,
  User,
  Stars
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWingmanAdvice } from '@/engine/conversationEngine';
import { getProfile } from '@/utils/profileMemory';

export default function LiveWingmanCoach() {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [dateStage, setDateStage] = useState('start');
  const [signals, setSignals] = useState({
    leaningIn: false,
    eyeContact: false,
    touchHappening: false,
    laughingRelaxed: false,
    steppedBack: false,
    distracted: false
  });
  const [response, setResponse] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userProfile = getProfile();
    setProfile(userProfile);
  }, []);

  const dateStages = [
    { id: 'start', label: 'Start', icon: '🌅', emoji: '☀️' },
    { id: 'mid', label: 'Mid', icon: '☕', emoji: '🍽️' },
    { id: 'walking', label: 'Walking', icon: '🚶', emoji: '🌙' },
    { id: 'goodnight', label: 'Goodbye', icon: '🌙', emoji: '💫' }
  ];

  const signalOptions = [
    { id: 'leaningIn', label: 'Leaning in', icon: Eye, positive: true, emoji: '👀' },
    { id: 'eyeContact', label: 'Eye contact', icon: Eye, positive: true, emoji: '✨' },
    { id: 'touchHappening', label: 'Touch happening', icon: Hand, positive: true, emoji: '🤝' },
    { id: 'laughingRelaxed', label: 'Laughing', icon: Laugh, positive: true, emoji: '😄' },
    { id: 'steppedBack', label: 'Stepped back', icon: ArrowLeftCircle, positive: false, emoji: '😬' },
    { id: 'distracted', label: 'Distracted', icon: Smartphone, positive: false, emoji: '📱' }
  ];

  const quickActions = [
    { id: 'kiss', label: 'Kiss', icon: Heart, color: 'from-pink-500 to-rose-600', emoji: '💋' },
    { id: 'holdHands', label: 'Hold Hands', icon: Hand, color: 'from-purple-500 to-indigo-600', emoji: '🤝' },
    { id: 'flirt', label: 'Flirt', icon: Sparkles, color: 'from-amber-500 to-orange-600', emoji: '😏' },
    { id: 'silence', label: 'Fix Silence', icon: MessageCircle, color: 'from-blue-500 to-cyan-600', emoji: '💬' },
    { id: 'compliment', label: 'Compliment', icon: Smile, color: 'from-green-500 to-emerald-600', emoji: '🥰' },
    { id: 'secondDate', label: '2nd Date', icon: Calendar, color: 'from-violet-500 to-purple-600', emoji: '📅' }
  ];

  const toggleSignal = (signalId) => {
    setSignals(prev => ({
      ...prev,
      [signalId]: !prev[signalId]
    }));
  };

  const getSignalSummary = () => {
    const positive = ['leaningIn', 'eyeContact', 'touchHappening', 'laughingRelaxed']
      .filter(s => signals[s]).length;
    const negative = ['steppedBack', 'distracted']
      .filter(s => signals[s]).length;
    return { positive, negative };
  };

  const generateResponse = (actionId) => {
    const { positive, negative } = getSignalSummary();
    const hasPositiveSignals = positive >= 2;
    const hasNegativeSignals = negative > 0;
    
    const engineAdvice = getWingmanAdvice(actionId, signals, profile);
    
    const greenFlags = [];
    const yellowFlags = [];
    const redFlags = [];
    
    if (signals.eyeContact) greenFlags.push("Strong eye contact");
    if (signals.leaningIn) greenFlags.push("Physical proximity");
    if (signals.laughingRelaxed) greenFlags.push("Relaxed body language");
    if (signals.touchHappening) greenFlags.push("Touch is happening");
    
    if (!hasPositiveSignals && !hasNegativeSignals) yellowFlags.push("Not enough signals yet");
    if (hasPositiveSignals && hasNegativeSignals) yellowFlags.push("Mixed signals present");
    
    if (signals.steppedBack) redFlags.push("They've pulled back");
    if (signals.distracted) redFlags.push("Seems distracted");
    
    const responses = {
      kiss: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: greenFlags.length > 0 ? greenFlags : ["Good connection"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: yellowFlags.length > 0 ? yellowFlags : ["Mixed signals"], red: redFlags.length > 0 ? redFlags : ["Not ready"] },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      holdHands: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: greenFlags.length > 0 ? greenFlags : ["Comfortable"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: ["Not showing interest yet"], red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      flirt: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: greenFlags.length > 0 ? greenFlags : ["Engaged"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: ["Might need more time"], red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      silence: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: ["Comfortable silence"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: ["Energy dropped"], red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      compliment: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: greenFlags.length > 0 ? greenFlags : ["Good mood"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: ["Keep it subtle"], red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      secondDate: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: greenFlags.length > 0 ? greenFlags : ["Great chemistry"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: ["Gauge interest first"], red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      }
    };

    const actionResponse = responses[actionId];
    if (!actionResponse) return;

    const result = hasPositiveSignals && !hasNegativeSignals 
      ? actionResponse.positive 
      : actionResponse.negative;

    setResponse({
      action: quickActions.find(a => a.id === actionId)?.label,
      emoji: quickActions.find(a => a.id === actionId)?.emoji,
      ...result,
      stage: dateStages.find(s => s.id === dateStage)?.label
    });
  };

  const handleCustomQuestion = () => {
    if (!customQuestion.trim()) return;
    
    const { positive, negative } = getSignalSummary();
    
    setResponse({
      action: 'Custom Question',
      emoji: '❓',
      recommendation: positive >= 2 && negative === 0
        ? "Based on positive signals, you're in a good position. Trust your instincts!"
        : negative > 0
        ? "The signals suggest being cautious. Take it slow and read their reactions."
        : "Not enough data. Pay attention to body language and responses.",
      flags: {
        green: positive >= 2 ? ["Good connection"] : [],
        yellow: positive === 1 ? ["Some interest"] : [],
        red: negative > 0 ? ["Some hesitation"] : []
      },
      consentLine: "Just be genuine and authentic in how you express yourself.",
      fallback: "If it doesn't feel right, change the topic naturally.",
      stage: dateStages.find(s => s.id === dateStage)?.label
    });
    setCustomQuestion('');
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen pb-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 -right-20 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -left-20 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-10 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute top-20 right-8 text-2xl animate-bounce opacity-50" style={{ animationDuration: '3s' }}>💫</span>
        <span className="absolute top-40 left-6 text-xl animate-bounce opacity-40" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🔥</span>
        <span className="absolute bottom-60 right-4 text-lg animate-bounce opacity-50" style={{ animationDuration: '4s', animationDelay: '1s' }}>❤️</span>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <button 
            onClick={() => navigate('/copilot')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            {/* Glowing Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Live Wingman
                <span className="text-xl">⚡</span>
              </h1>
              <p className="text-slate-400 text-sm">Real-time date coaching</p>
            </div>
          </div>

          {/* Personalization Badge */}
          {profile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-300">
                Style: <span className="font-semibold">{profile.communicationStyle}</span>
              </span>
            </div>
          )}
        </div>

        {/* Date Stage */}
        <div className="px-5 mb-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Stars className="w-4 h-4 text-amber-400" />
            Where are you in the date?
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {dateStages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setDateStage(stage.id)}
                className={`py-3 px-2 rounded-xl text-center transition-all ${
                  dateStage === stage.id
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
                }`}
              >
                <span className="text-xl block mb-1">{stage.icon}</span>
                <span className="text-xs font-medium">{stage.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Signals */}
        <div className="px-5 mb-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            What signals do you see?
          </h3>
          <div className="flex flex-wrap gap-2">
            {signalOptions.map((signal) => {
              const isActive = signals[signal.id];
              
              return (
                <button
                  key={signal.id}
                  onClick={() => toggleSignal(signal.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    isActive
                      ? signal.positive
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'bg-red-500/20 border-red-500/50 text-red-300 shadow-lg shadow-red-500/10'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span>{signal.emoji}</span>
                  {signal.label}
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mb-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            What do you want to do?
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <button
                  key={action.id}
                  onClick={() => generateResponse(action.id)}
                  className="group active:scale-95 transition-transform"
                >
                  <div className="bg-slate-800/60 border border-slate-700/50 hover:border-amber-500/50 rounded-2xl p-4 text-center transition-all hover:bg-slate-800/80">
                    <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{action.emoji}</span>
                    </div>
                    <span className="text-white font-medium text-sm">{action.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Question */}
        <div className="px-5 mb-5">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              Ask anything
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g., Should I lean in for a kiss?"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
              />
              <Button
                onClick={handleCustomQuestion}
                disabled={!customQuestion.trim()}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Response Panel */}
        {response && (
          <div className="px-5 mb-5">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-amber-500/30 rounded-2xl p-5 shadow-xl shadow-amber-500/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{response.emoji}</span>
                <div>
                  <h3 className="font-bold text-white text-lg">{response.action}</h3>
                  <span className="text-xs text-slate-500">Stage: {response.stage}</span>
                </div>
              </div>

              {/* Recommendation */}
              <div className="mb-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-white text-sm leading-relaxed">{response.recommendation}</p>
              </div>

              {/* Flags */}
              <div className="space-y-2 mb-4">
                {response.flags.green?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {response.flags.green.map((flag, i) => (
                      <span key={i} className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
                        ✅ {flag}
                      </span>
                    ))}
                  </div>
                )}
                {response.flags.yellow?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {response.flags.yellow.map((flag, i) => (
                      <span key={i} className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-500/30">
                        ⚠️ {flag}
                      </span>
                    ))}
                  </div>
                )}
                {response.flags.red?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {response.flags.red.map((flag, i) => (
                      <span key={i} className="text-xs bg-red-500/20 text-red-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-500/30">
                        🚫 {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent Line */}
              <div className="mb-3">
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">💬 Try saying:</p>
                <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <p className="text-emerald-200 text-sm flex-1 italic">"{response.consentLine}"</p>
                  <button
                    onClick={() => copyToClipboard(response.consentLine)}
                    className="text-emerald-400 hover:text-emerald-300 shrink-0 p-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Fallback */}
              <div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">🔄 Graceful exit:</p>
                <div className="flex items-start gap-2 p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl">
                  <p className="text-slate-300 text-sm flex-1 italic">"{response.fallback}"</p>
                  <button
                    onClick={() => copyToClipboard(response.fallback)}
                    className="text-slate-400 hover:text-slate-300 shrink-0 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safety Note */}
        <div className="px-5">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm font-semibold mb-1">Remember ❤️</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Always prioritize consent and respect. A great date is one where both people feel comfortable and valued.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
