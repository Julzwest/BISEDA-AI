import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Zap,
  Heart,
  HandHeart,
  Smile,
  MessageCircle,
  Calendar,
  DoorOpen,
  Moon,
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
  User
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWingmanAdvice } from '@/engine/conversationEngine';
import { getProfile } from '@/utils/profileMemory';

export default function LiveWingmanCoach() {
  const navigate = useNavigate();
  
  // Profile state
  const [profile, setProfile] = useState(null);
  
  // Date stage
  const [dateStage, setDateStage] = useState('start');
  
  // Signals (positive and negative)
  const [signals, setSignals] = useState({
    leaningIn: false,
    eyeContact: false,
    touchHappening: false,
    laughingRelaxed: false,
    steppedBack: false,
    distracted: false
  });
  
  // Response state
  const [response, setResponse] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [copied, setCopied] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const userProfile = getProfile();
    setProfile(userProfile);
  }, []);

  const dateStages = [
    { id: 'start', label: 'Start', icon: '🌅' },
    { id: 'mid', label: 'Mid-date', icon: '☕' },
    { id: 'walking', label: 'Walking out', icon: '🚶' },
    { id: 'goodnight', label: 'Goodnight', icon: '🌙' }
  ];

  const signalOptions = [
    { id: 'leaningIn', label: 'Leaning in', icon: Eye, positive: true },
    { id: 'eyeContact', label: 'Sustained eye contact', icon: Eye, positive: true },
    { id: 'touchHappening', label: 'Touch is happening', icon: Hand, positive: true },
    { id: 'laughingRelaxed', label: 'Laughing / relaxed', icon: Laugh, positive: true },
    { id: 'steppedBack', label: 'Stepped back from touch', icon: ArrowLeftCircle, positive: false },
    { id: 'distracted', label: 'Seems distracted', icon: Smartphone, positive: false }
  ];

  const quickActions = [
    { id: 'kiss', label: 'Kiss', icon: Heart, color: 'from-pink-500 to-rose-600' },
    { id: 'holdHands', label: 'Hold Hands', icon: HandHeart, color: 'from-purple-500 to-indigo-600' },
    { id: 'flirt', label: 'Flirt', icon: Sparkles, color: 'from-amber-500 to-orange-600' },
    { id: 'silence', label: 'Silence Fix', icon: MessageCircle, color: 'from-blue-500 to-cyan-600' },
    { id: 'compliment', label: 'Compliment', icon: Smile, color: 'from-green-500 to-emerald-600' },
    { id: 'endDate', label: 'End Date', icon: DoorOpen, color: 'from-slate-500 to-slate-600' },
    { id: 'secondDate', label: 'Ask for 2nd Date', icon: Calendar, color: 'from-violet-500 to-purple-600' }
  ];

  const toggleSignal = (signalId) => {
    setSignals(prev => ({
      ...prev,
      [signalId]: !prev[signalId]
    }));
  };

  // Count positive and negative signals
  const getSignalSummary = () => {
    const positive = ['leaningIn', 'eyeContact', 'touchHappening', 'laughingRelaxed']
      .filter(s => signals[s]).length;
    const negative = ['steppedBack', 'distracted']
      .filter(s => signals[s]).length;
    return { positive, negative };
  };

  // Generate response based on action and signals using the Conversation Strategy Engine™
  const generateResponse = (actionId) => {
    const { positive, negative } = getSignalSummary();
    const hasPositiveSignals = positive >= 2;
    const hasNegativeSignals = negative > 0;
    
    // Use the engine for personalized advice
    const engineAdvice = getWingmanAdvice(actionId, signals, profile);
    
    // Build flags based on selected signals
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
    if (signals.distracted) redFlags.push("Seems distracted or uncomfortable");
    
    // Fallback responses with full detail
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
          flags: { green: [], yellow: yellowFlags.length > 0 ? yellowFlags : ["Mixed signals present"], red: redFlags.length > 0 ? redFlags : ["Not ready for escalation"] },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      holdHands: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: greenFlags.length > 0 ? greenFlags : ["Comfortable with proximity"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: ["Not showing physical interest yet"], red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      flirt: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: greenFlags.length > 0 ? greenFlags : ["Engaged body language"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: ["They might need more time to warm up"], red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      silence: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: ["Comfortable silence can be good"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: [], yellow: ["Energy has dropped"], red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        }
      },
      compliment: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: greenFlags.length > 0 ? greenFlags : ["They're in a good mood"], yellow: yellowFlags, red: redFlags },
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
      endDate: {
        positive: {
          recommendation: engineAdvice.recommendation,
          flags: { green: ["Great vibe", "Perfect time to end gracefully"], yellow: yellowFlags, red: redFlags },
          consentLine: engineAdvice.consentLine,
          fallback: engineAdvice.fallback
        },
        negative: {
          recommendation: engineAdvice.recommendation,
          flags: { green: ["Knowing when to exit is smart"], yellow: ["The date may not have clicked"], red: [] },
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
          flags: { green: [], yellow: ["Gauge their interest first"], red: redFlags },
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
      ...result,
      stage: dateStages.find(s => s.id === dateStage)?.label
    });
  };

  const handleCustomQuestion = () => {
    if (!customQuestion.trim()) return;
    
    const { positive, negative } = getSignalSummary();
    
    setResponse({
      action: 'Custom Question',
      recommendation: positive >= 2 && negative === 0
        ? "Based on the positive signals, you're in a good position. Trust your instincts here."
        : negative > 0
        ? "The signals suggest being cautious. Take it slow and read their reactions."
        : "Not enough signal data. Pay attention to their body language and responses.",
      flags: {
        green: positive >= 2 ? ["Good connection detected"] : [],
        yellow: positive === 1 ? ["Some interest shown"] : [],
        red: negative > 0 ? ["Some hesitation signals"] : []
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
    <div className="w-full min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <button 
          onClick={() => navigate('/copilot')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        {/* Personalization Badge */}
        {profile && (
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-300">
                Style: <span className="font-medium">{profile.communicationStyle}</span>
              </span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Live Wingman</h1>
            <p className="text-slate-400 text-sm">Real-time help during your date</p>
          </div>
        </div>
      </div>

      {/* Date Stage Selector */}
      <div className="px-4 mb-5">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Date Stage</h3>
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
          {dateStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setDateStage(stage.id)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-sm font-medium transition-all text-center ${
                dateStage === stage.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="mr-1">{stage.icon}</span>
              <span className="hidden sm:inline">{stage.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Signals Checklist */}
      <div className="px-4 mb-5">
        <h3 className="text-sm font-medium text-slate-300 mb-2">What signals are you seeing?</h3>
        <div className="flex flex-wrap gap-2">
          {signalOptions.map((signal) => {
            const Icon = signal.icon;
            const isActive = signals[signal.id];
            
            return (
              <button
                key={signal.id}
                onClick={() => toggleSignal(signal.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                  isActive
                    ? signal.positive
                      ? 'bg-green-500/20 border-green-500/50 text-green-300'
                      : 'bg-red-500/20 border-red-500/50 text-red-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {isActive && <Check className="w-3.5 h-3.5" />}
                {signal.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-5">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={() => generateResponse(action.id)}
                className="group"
              >
                <Card className="bg-slate-800/50 border-slate-700/50 hover:border-amber-500/50 transition-all p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium text-sm">{action.label}</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Question */}
      <div className="px-4 mb-5">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Custom Question</h3>
        <Card className="bg-slate-800/50 border-slate-700/50 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask anything... e.g., 'Should I lean in for a kiss?'"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
            />
            <Button
              onClick={handleCustomQuestion}
              disabled={!customQuestion.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Response Panel */}
      {response && (
        <div className="px-4 mb-5">
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-amber-500/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">{response.action}</h3>
              <span className="text-xs text-slate-500 ml-auto">Stage: {response.stage}</span>
            </div>

            {/* Quick Recommendation */}
            <div className="mb-4 p-3 bg-slate-900/50 rounded-xl">
              <p className="text-white text-sm leading-relaxed">{response.recommendation}</p>
            </div>

            {/* Flags */}
            <div className="space-y-2 mb-4">
              {response.flags.green?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {response.flags.green.map((flag, i) => (
                    <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> {flag}
                    </span>
                  ))}
                </div>
              )}
              {response.flags.yellow?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {response.flags.yellow.map((flag, i) => (
                    <span key={i} className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {flag}
                    </span>
                  ))}
                </div>
              )}
              {response.flags.red?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {response.flags.red.map((flag, i) => (
                    <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Consent Line */}
            <div className="mb-3">
              <p className="text-xs text-slate-400 mb-1">💬 Suggested line (consent-forward):</p>
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-200 text-sm flex-1">"{response.consentLine}"</p>
                <button
                  onClick={() => copyToClipboard(response.consentLine)}
                  className="text-green-400 hover:text-green-300 shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Fallback Line */}
            <div>
              <p className="text-xs text-slate-400 mb-1">🔄 Graceful fallback:</p>
              <div className="flex items-start gap-2 p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl">
                <p className="text-slate-300 text-sm flex-1">"{response.fallback}"</p>
                <button
                  onClick={() => copyToClipboard(response.fallback)}
                  className="text-slate-400 hover:text-slate-300 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Safety Note */}
      <div className="px-4">
        <Card className="bg-slate-800/30 border-slate-700/30 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-300 text-sm font-medium mb-1">Remember</p>
              <p className="text-slate-400 text-xs">
                Always prioritize consent and respect. If something feels off, trust your instincts. 
                A great date is one where both people feel comfortable and respected.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
