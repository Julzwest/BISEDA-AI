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
  Stars,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { getProfile } from '@/utils/profileMemory';

// Live Wingman AI System Prompt - ULTRA BRIEF real-time advice
const WINGMAN_SYSTEM_PROMPT = `URGENT: User is ON A DATE checking phone secretly. MAX 20 WORDS per field. NO ESSAYS.

STRICT JSON FORMAT:
{
  "recommendation": "15-20 words MAX. One clear action.",
  "greenFlags": ["4 words max each"],
  "yellowFlags": ["4 words max each"],
  "redFlags": ["4 words max each"],  
  "trySaying": "8 words max",
  "gracefulExit": "8 words max",
  "proTip": "6 words max"
}

GOOD EXAMPLE:
{"recommendation":"They're into you. Touch their arm when you laugh, then hold eye contact.","greenFlags":["Eye contact = attracted","Leaning in = engaged"],"yellowFlags":[],"redFlags":[],"trySaying":"I really like talking to you","gracefulExit":"Want to walk somewhere quieter?","proTip":"Silence builds tension"}

BAD = Long paragraphs, essays, explanations, markdown, numbered lists.
GOOD = Short, punchy, actionable.

BE DIRECT: "Go for it now" or "Wait a bit longer" or "Abort mission"
NO FLUFF. NO EXPLANATIONS. JUST QUICK ADVICE.`;

export default function LiveWingmanCoach() {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [dateStage, setDateStage] = useState('start');
  const [signals, setSignals] = useState({
    leaningIn: false,
    eyeContact: false,
    touchHappening: false,
    laughingRelaxed: false,
    playfulTeasing: false,
    mirroring: false,
    hairPlaying: false,
    longAnswers: false,
    askingQuestions: false,
    complimenting: false,
    lipsLooking: false,
    stayingClose: false,
    steppedBack: false,
    distracted: false,
    shortAnswers: false,
    lookingAround: false,
    armsCollected: false,
    checkingTime: false,
    nervous: false,
    quietSudden: false
  });
  const [response, setResponse] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userProfile = getProfile();
    setProfile(userProfile);
  }, []);

  const dateStages = [
    { id: 'start', label: 'Just Met', icon: '👋', emoji: '☀️' },
    { id: 'drinks', label: 'Drinks', icon: '🍸', emoji: '🍹' },
    { id: 'dinner', label: 'Dinner', icon: '🍽️', emoji: '🥂' },
    { id: 'activity', label: 'Activity', icon: '🎯', emoji: '🎮' },
    { id: 'walking', label: 'Walking', icon: '🚶', emoji: '🌙' },
    { id: 'carride', label: 'Car/Ride', icon: '🚗', emoji: '🚕' },
    { id: 'athome', label: 'At Home', icon: '🏠', emoji: '🛋️' },
    { id: 'goodnight', label: 'Goodbye', icon: '🌙', emoji: '💫' }
  ];

  const signalOptions = [
    // Positive signals
    { id: 'leaningIn', label: 'Leaning in', icon: Eye, positive: true, emoji: '👀' },
    { id: 'eyeContact', label: 'Eye contact', icon: Eye, positive: true, emoji: '✨' },
    { id: 'touchHappening', label: 'Touching me', icon: Hand, positive: true, emoji: '🤝' },
    { id: 'laughingRelaxed', label: 'Laughing', icon: Laugh, positive: true, emoji: '😄' },
    { id: 'playfulTeasing', label: 'Playful teasing', icon: Sparkles, positive: true, emoji: '😜' },
    { id: 'mirroring', label: 'Mirroring me', icon: User, positive: true, emoji: '🪞' },
    { id: 'hairPlaying', label: 'Playing w/ hair', icon: Sparkles, positive: true, emoji: '💇' },
    { id: 'longAnswers', label: 'Long answers', icon: MessageCircle, positive: true, emoji: '💬' },
    { id: 'askingQuestions', label: 'Asking about me', icon: MessageCircle, positive: true, emoji: '❓' },
    { id: 'complimenting', label: 'Complimenting', icon: Heart, positive: true, emoji: '🥰' },
    { id: 'lipsLooking', label: 'Looking at lips', icon: Eye, positive: true, emoji: '👄' },
    { id: 'stayingClose', label: 'Staying close', icon: Heart, positive: true, emoji: '💕' },
    // Negative/cautious signals
    { id: 'steppedBack', label: 'Stepped back', icon: ArrowLeftCircle, positive: false, emoji: '😬' },
    { id: 'distracted', label: 'On phone', icon: Smartphone, positive: false, emoji: '📱' },
    { id: 'shortAnswers', label: 'Short answers', icon: MessageCircle, positive: false, emoji: '😐' },
    { id: 'lookingAround', label: 'Looking around', icon: Eye, positive: false, emoji: '👀' },
    { id: 'armsCollected', label: 'Arms crossed', icon: Shield, positive: false, emoji: '🙅' },
    { id: 'checkingTime', label: 'Checking time', icon: Calendar, positive: false, emoji: '⏰' },
    { id: 'nervous', label: 'Seems nervous', icon: AlertTriangle, positive: null, emoji: '😰' },
    { id: 'quietSudden', label: 'Went quiet', icon: MessageCircle, positive: false, emoji: '🤐' }
  ];

  const quickActions = [
    { id: 'kiss', label: 'Go for Kiss', icon: Heart, color: 'from-pink-500 to-rose-600', emoji: '💋' },
    { id: 'holdHands', label: 'Hold Hands', icon: Hand, color: 'from-purple-500 to-indigo-600', emoji: '🤝' },
    { id: 'flirt', label: 'Flirt More', icon: Sparkles, color: 'from-amber-500 to-orange-600', emoji: '😏' },
    { id: 'tease', label: 'Tease Them', icon: Smile, color: 'from-yellow-500 to-amber-600', emoji: '😜' },
    { id: 'compliment', label: 'Compliment', icon: Smile, color: 'from-green-500 to-emerald-600', emoji: '🥰' },
    { id: 'getCloser', label: 'Get Closer', icon: Heart, color: 'from-rose-500 to-pink-600', emoji: '💕' },
    { id: 'silence', label: 'Fix Silence', icon: MessageCircle, color: 'from-blue-500 to-cyan-600', emoji: '💬' },
    { id: 'changeVibe', label: 'Change Topic', icon: Zap, color: 'from-indigo-500 to-blue-600', emoji: '🔄' },
    { id: 'deepTalk', label: 'Go Deeper', icon: MessageCircle, color: 'from-slate-500 to-gray-600', emoji: '🌊' },
    { id: 'makeMove', label: 'Make a Move', icon: Zap, color: 'from-red-500 to-rose-600', emoji: '🔥' },
    { id: 'pullBack', label: 'Pull Back', icon: ArrowLeftCircle, color: 'from-gray-500 to-slate-600', emoji: '↩️' },
    { id: 'secondDate', label: 'Ask 2nd Date', icon: Calendar, color: 'from-violet-500 to-purple-600', emoji: '📅' },
    { id: 'getNumber', label: 'Get Number', icon: Smartphone, color: 'from-cyan-500 to-teal-600', emoji: '📱' },
    { id: 'invite', label: 'Invite Over', icon: DoorOpen, color: 'from-fuchsia-500 to-pink-600', emoji: '🏠' },
    { id: 'endWell', label: 'End on High', icon: Stars, color: 'from-emerald-500 to-green-600', emoji: '✨' },
    { id: 'rescue', label: 'Save the Date', icon: Shield, color: 'from-orange-500 to-red-600', emoji: '🆘' }
  ];

  const toggleSignal = (signalId) => {
    setSignals(prev => ({
      ...prev,
      [signalId]: !prev[signalId]
    }));
  };

  const getSignalSummary = () => {
    const positiveSignals = ['leaningIn', 'eyeContact', 'touchHappening', 'laughingRelaxed', 
      'playfulTeasing', 'mirroring', 'hairPlaying', 'longAnswers', 'askingQuestions', 
      'complimenting', 'lipsLooking', 'stayingClose'];
    const negativeSignals = ['steppedBack', 'distracted', 'shortAnswers', 'lookingAround', 
      'armsCollected', 'checkingTime', 'quietSudden'];
    const positive = positiveSignals.filter(s => signals[s]).length;
    const negative = negativeSignals.filter(s => signals[s]).length;
    return { positive, negative };
  };

  // Build signal description for AI
  const buildSignalContext = () => {
    const activeSignals = [];
    // Positive signals
    if (signals.leaningIn) activeSignals.push("They're leaning in towards me");
    if (signals.eyeContact) activeSignals.push("Strong/sustained eye contact");
    if (signals.touchHappening) activeSignals.push("They're touching me (arm, hand, shoulder)");
    if (signals.laughingRelaxed) activeSignals.push("They're laughing and seem relaxed");
    if (signals.playfulTeasing) activeSignals.push("They're playfully teasing me");
    if (signals.mirroring) activeSignals.push("They're mirroring my body language");
    if (signals.hairPlaying) activeSignals.push("They're playing with their hair");
    if (signals.longAnswers) activeSignals.push("They're giving long, detailed answers");
    if (signals.askingQuestions) activeSignals.push("They're asking questions about me");
    if (signals.complimenting) activeSignals.push("They've complimented me");
    if (signals.lipsLooking) activeSignals.push("They keep glancing at my lips");
    if (signals.stayingClose) activeSignals.push("They're staying physically close");
    // Negative signals
    if (signals.steppedBack) activeSignals.push("They've stepped back or created distance");
    if (signals.distracted) activeSignals.push("They're on their phone");
    if (signals.shortAnswers) activeSignals.push("They're giving short, one-word answers");
    if (signals.lookingAround) activeSignals.push("They keep looking around the room");
    if (signals.armsCollected) activeSignals.push("Their arms are crossed");
    if (signals.checkingTime) activeSignals.push("They've checked the time");
    if (signals.nervous) activeSignals.push("They seem nervous or fidgety");
    if (signals.quietSudden) activeSignals.push("They suddenly went quiet");
    
    return activeSignals.length > 0 
      ? activeSignals.join(", ") 
      : "No specific signals selected yet";
  };

  // Call real AI for advice
  const generateResponse = async (actionId) => {
    setIsLoading(true);
    
    const actionLabels = {
      kiss: "kiss them",
      holdHands: "hold hands",
      flirt: "flirt more",
      tease: "tease them playfully",
      compliment: "give a compliment",
      getCloser: "get physically closer",
      silence: "fix awkward silence",
      changeVibe: "change the topic/vibe",
      deepTalk: "go deeper emotionally",
      makeMove: "make a bold move",
      pullBack: "pull back / slow down",
      secondDate: "ask for 2nd date",
      getNumber: "get their number",
      invite: "invite them over",
      endWell: "end the date well",
      rescue: "rescue this date"
    };

    const stageLabels = {
      start: "just met",
      drinks: "having drinks",
      dinner: "at dinner",
      activity: "doing an activity",
      walking: "walking together",
      carride: "in car/uber",
      athome: "at home",
      goodnight: "saying goodbye"
    };

    const prompt = `I'M ON A DATE NOW. Quick advice needed!
Stage: ${stageLabels[dateStage] || dateStage}
Goal: ${actionLabels[actionId]}
Signals: ${buildSignalContext()}

Should I go for it? Give me 1-2 sentences MAX. Reply in JSON only.`;

    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        system_prompt: WINGMAN_SYSTEM_PROMPT,
        response_type: 'json'
      });

      // Parse the AI response
      let parsedResponse;
      if (typeof aiResponse === 'string') {
        try {
          // Try to extract JSON from the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found');
          }
        } catch {
          // Fallback if JSON parsing fails
          parsedResponse = {
            recommendation: aiResponse,
            greenFlags: [],
            yellowFlags: [],
            redFlags: [],
            trySaying: "Be genuine and follow your instincts.",
            gracefulExit: "So, tell me more about that thing you mentioned earlier...",
            proTip: "Read their body language and trust your gut."
          };
        }
      } else {
        parsedResponse = aiResponse;
      }

      setResponse({
        action: quickActions.find(a => a.id === actionId)?.label,
        emoji: quickActions.find(a => a.id === actionId)?.emoji,
        recommendation: parsedResponse.recommendation || "Trust the moment and be yourself.",
        flags: {
          green: parsedResponse.greenFlags || [],
          yellow: parsedResponse.yellowFlags || [],
          red: parsedResponse.redFlags || []
        },
        consentLine: parsedResponse.trySaying || "I'm really enjoying this...",
        fallback: parsedResponse.gracefulExit || "So what else have you been up to?",
        proTip: parsedResponse.proTip,
        stage: dateStages.find(s => s.id === dateStage)?.label
      });

    } catch (error) {
      console.error('AI Error:', error);
      // Fallback response if AI fails
      setResponse({
        action: quickActions.find(a => a.id === actionId)?.label,
        emoji: quickActions.find(a => a.id === actionId)?.emoji,
        recommendation: "Go for it! Trust your gut - if the vibe feels right, make your move.",
        flags: {
          green: signals.eyeContact ? ["Eye contact is good"] : [],
          yellow: ["AI temporarily unavailable"],
          red: signals.distracted ? ["They seem distracted"] : []
        },
        consentLine: "I'm having such a great time with you...",
        fallback: "So tell me something I don't know about you!",
        stage: dateStages.find(s => s.id === dateStage)?.label
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomQuestion = async () => {
    if (!customQuestion.trim() || isLoading) return;
    
    setIsLoading(true);

    const stageLabels = {
      start: "beginning of the date",
      mid: "middle of the date",
      walking: "walking together",
      goodnight: "end of the date / goodbye"
    };

    const prompt = `ON A DATE NOW. Quick help!
Stage: ${stageLabels[dateStage] || dateStage}
Signals: ${buildSignalContext()}
Question: "${customQuestion}"

Answer in 1-2 sentences MAX. JSON format only.`;

    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        system_prompt: WINGMAN_SYSTEM_PROMPT,
        response_type: 'json'
      });

      let parsedResponse;
      if (typeof aiResponse === 'string') {
        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found');
          }
        } catch {
          parsedResponse = {
            recommendation: aiResponse,
            greenFlags: [],
            yellowFlags: [],
            redFlags: [],
            trySaying: "Trust your instincts here.",
            gracefulExit: "Anyway, tell me more about you...",
            proTip: "Stay present and genuine."
          };
        }
      } else {
        parsedResponse = aiResponse;
      }

      setResponse({
        action: 'Your Question',
        emoji: '💭',
        recommendation: parsedResponse.recommendation,
        flags: {
          green: parsedResponse.greenFlags || [],
          yellow: parsedResponse.yellowFlags || [],
          red: parsedResponse.redFlags || []
        },
        consentLine: parsedResponse.trySaying,
        fallback: parsedResponse.gracefulExit,
        proTip: parsedResponse.proTip,
        stage: dateStages.find(s => s.id === dateStage)?.label
      });

    } catch (error) {
      console.error('AI Error:', error);
      setResponse({
        action: 'Your Question',
        emoji: '💭',
        recommendation: "Couldn't process that right now, but here's my quick take: trust your gut, stay present, and remember - confidence is attractive. If something feels right, lean into it.",
        flags: {
          green: signals.eyeContact || signals.laughingRelaxed ? ["Positive vibes detected"] : [],
          yellow: ["AI temporarily unavailable"],
          red: []
        },
        consentLine: "You're really easy to talk to, you know that?",
        fallback: "So what's the most interesting thing that happened to you this week?",
        stage: dateStages.find(s => s.id === dateStage)?.label
      });
    } finally {
      setIsLoading(false);
      setCustomQuestion('');
    }
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
                  disabled={isLoading}
                  className="group active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={!customQuestion.trim() || isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 rounded-xl disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="px-5 mb-5">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-amber-500/30 rounded-2xl p-8 shadow-xl shadow-amber-500/10">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold mb-1">AI Wingman thinking...</p>
                  <p className="text-slate-400 text-sm">Reading the situation like a pro 🎯</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response Panel */}
        {response && !isLoading && (
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

              {/* Pro Tip */}
              {response.proTip && (
                <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-amber-300 text-sm flex items-start gap-2">
                    <span className="text-lg">💎</span>
                    <span><strong>Pro tip:</strong> {response.proTip}</span>
                  </p>
                </div>
              )}
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
