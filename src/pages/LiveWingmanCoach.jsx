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

// Live Wingman AI System Prompt - ELITE LEVEL GAME
const WINGMAN_SYSTEM_PROMPT = `You are an ELITE DATING COACH with the smoothest game. User is ON A DATE checking phone secretly.

YOUR ENERGY: James Bond meets Ryan Gosling. Effortlessly cool. Never try-hard. Magnetic.

STRICT JSON FORMAT:
{
  "recommendation": "15-20 words MAX. Bold, specific action.",
  "greenFlags": ["4 words max each"],
  "yellowFlags": ["4 words max each"],
  "redFlags": ["4 words max each"],  
  "trySaying": "KILLER line - smooth, creates tension, memorable",
  "gracefulExit": "Slick pivot that builds more intrigue",
  "proTip": "6 words max - elite wisdom"
}

═══════════════════════════════════════
🔥 ELITE LINE ARSENAL - USE THIS ENERGY
═══════════════════════════════════════

💋 FOR ESCALATING / KISS:
- "You have to stop looking at me like that..." *pause, smirk, hold eye contact*
- "I keep getting distracted by your lips when you talk"
- *Stop mid-sentence* "...sorry, what were you saying? I got lost for a second"
- "Come closer, I want to tell you a secret" *whisper something flirty*
- "If you keep doing that, I'm gonna kiss you"
- *After she says something* "God, you're dangerous"
- "Shh" *finger on her lips, then lean in*
- *Look at her lips, back to eyes, slight smile* "...anyway, you were saying?"

📱 FOR GETTING NUMBER:
- "I'm stealing you for another adventure. Give me your number"
- "You passed the vibe check. Barely. Give me your number"
- *Hand her your phone* "Put your number in. Don't make it weird"
- "I don't slide in DMs. Real ones give real numbers"
- "Save yourself as whatever you want me to remember you by"
- "Here's what's happening - you're giving me your number, I'm texting you something that'll make you smile, and we're doing this again"
- "Quick, before I change my mind about you" *smirk, hand phone*

😏 FOR FLIRTING / TEASING:
- "You're a lot. I mean that as a compliment... mostly"
- "I can't tell if you're flirting with me or just like this with everyone"
- "You're lucky you're cute because that joke was terrible"
- "I'm starting to think you might be worth the trouble"
- "Stop trying so hard, you already have my attention"
- "Okay I see you. Game recognizes game"
- "You're giving main character energy right now"
- "I wasn't gonna like you but here we are"

🎯 FOR MAKING A MOVE:
- "Let's get out of here" *stand up, offer hand*
- "Walk with me" *no question, just statement*
- "I know a place. You're coming"
- "We're leaving. I'll explain on the way"
- "Come on" *take her hand and lead*

🌊 FOR DEEP CONNECTION:
- "Tell me something you've never told anyone on a first date"
- "What's your biggest fear that you pretend doesn't bother you?"
- "If you could change one decision you made, what would it be?"
- "What do people always get wrong about you?"
- "When's the last time you felt truly alive?"

↩️ FOR PULLING BACK (when needed):
- "Hmm. Interesting." *lean back, slight smile*
- "Anyway..." *change topic nonchalantly*
- "That's cute" *dismissive but playful*
- "We'll see" *mysterious smile*

🆘 FOR RECOVERING:
- "Okay that was awkward. Let's pretend that didn't happen"
- "Wrong answer. Try again" *playful smile*
- "Starting over - hi, I'm [name], and you are...?"
- "I'm gonna need you to be more interesting. I believe in you"

💎 FOR ENDING ON A HIGH:
- "This was fun. You exceeded expectations. Barely"
- "I might actually text you back"
- "Don't fall in love with me on the drive home"
- "Text me when you get home. Actually, text me before that"
- "You're alright. Same time next week?"

═══════════════════════════════════════
❌ NEVER USE THESE (instant cringe):
═══════════════════════════════════════
- "I really enjoyed getting to know you"
- "Can I have your number?"
- "Would you maybe want to..."
- "I had a nice time"
- "You're really nice"
- "We should do this again sometime maybe"
- "If you're not busy..."
- "No pressure but..."

═══════════════════════════════════════
✅ CORE PRINCIPLES:
═══════════════════════════════════════
- Statements > Questions (don't ask permission)
- Less words = more power
- Pauses create tension
- Eye contact is everything
- Make them wonder, not reassure them
- You're the prize, act like it
- Playful > Serious
- Bold > Safe

VERDICTS: "Send it 🟢" / "Build tension first 🟡" / "Abort, try different approach 🔴"`;

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
  
  // New: Style and Gender selection
  const [selectedStyle, setSelectedStyle] = useState('Playful');
  const [targetGender, setTargetGender] = useState('woman');
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const styleOptions = [
    { id: 'Playful', label: 'Playful', emoji: '😏', desc: 'Teasing & fun' },
    { id: 'Direct', label: 'Direct', emoji: '🎯', desc: 'Confident & clear' },
    { id: 'Smooth', label: 'Smooth', emoji: '🍷', desc: 'Suave & charming' },
    { id: 'Romantic', label: 'Romantic', emoji: '💕', desc: 'Sweet & sincere' }
  ];

  const genderOptions = [
    { id: 'woman', label: 'Woman', emoji: '👩' },
    { id: 'man', label: 'Man', emoji: '👨' }
  ];

  useEffect(() => {
    const userProfile = getProfile();
    setProfile(userProfile);
    // Set initial style from profile if available
    if (userProfile?.communicationStyle) {
      setSelectedStyle(userProfile.communicationStyle);
    }
  }, []);

  const dateStages = [
    { id: 'start', label: 'Just Met', icon: '👋', hint: 'First impressions', color: 'from-blue-500 to-cyan-500' },
    { id: 'drinks', label: 'Drinks', icon: '🍸', hint: 'Building rapport', color: 'from-purple-500 to-pink-500' },
    { id: 'dinner', label: 'Dinner', icon: '🍽️', hint: 'Deep conversation', color: 'from-amber-500 to-orange-500' },
    { id: 'activity', label: 'Activity', icon: '🎯', hint: 'Having fun together', color: 'from-green-500 to-emerald-500' },
    { id: 'walking', label: 'Walking', icon: '🌙', hint: 'Intimate moments', color: 'from-indigo-500 to-purple-500' },
    { id: 'carride', label: 'Car/Ride', icon: '🚗', hint: 'Private time', color: 'from-rose-500 to-pink-500' },
    { id: 'athome', label: 'At Home', icon: '🏠', hint: 'Comfort zone', color: 'from-red-500 to-rose-500' },
    { id: 'goodnight', label: 'Goodbye', icon: '💫', hint: 'Lasting impression', color: 'from-violet-500 to-purple-500' }
  ];

  // Get current stage index for progress indicator
  const currentStageIndex = dateStages.findIndex(s => s.id === dateStage);
  const progressPercent = ((currentStageIndex + 1) / dateStages.length) * 100;

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

    const genderContext = targetGender === 'woman' ? 'her' : 'him';
    const genderLabel = targetGender === 'woman' ? 'She' : 'He';

    const prompt = `I'M ON A DATE NOW with a ${targetGender}. Quick advice needed!
Stage: ${stageLabels[dateStage] || dateStage}
Goal: ${actionLabels[actionId]}
My Style: ${selectedStyle} (match this energy in your suggestions)
Signals from ${genderContext}: ${buildSignalContext()}

Should I go for it? Give me 1-2 sentences MAX. Use ${genderContext}/${genderLabel} pronouns. Reply in JSON only.`;

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
            trySaying: "You're making it really hard to focus right now...",
            gracefulExit: "Walk with me. I'm not done with you yet.",
            proTip: "Tension is your friend. Use it."
          };
        }
      } else {
        parsedResponse = aiResponse;
      }

      setResponse({
        action: quickActions.find(a => a.id === actionId)?.label,
        emoji: quickActions.find(a => a.id === actionId)?.emoji,
        recommendation: parsedResponse.recommendation || "The vibe is there. Make your move with confidence.",
        flags: {
          green: parsedResponse.greenFlags || [],
          yellow: parsedResponse.yellowFlags || [],
          red: parsedResponse.redFlags || []
        },
        consentLine: parsedResponse.trySaying || "I should let you go... but I'm not going to",
        fallback: parsedResponse.gracefulExit || "Come with me, I want to show you something",
        proTip: parsedResponse.proTip,
        stage: dateStages.find(s => s.id === dateStage)?.label
      });

    } catch (error) {
      console.error('AI Error:', error);
      console.error('AI Error message:', error.message);
      // ELITE fallback responses based on action
      const eliteFallbacks = {
        kiss: { 
          say: "You have to stop looking at me like that...", 
          exit: "Come closer, I want to tell you something",
          tip: "90% lean, let them close the gap"
        },
        holdHands: { 
          say: "Give me your hand", 
          exit: "Walk with me, I want to show you something",
          tip: "Don't ask. Take."
        },
        flirt: { 
          say: "I can't tell if you're flirting or just like this with everyone", 
          exit: "You're giving main character energy right now",
          tip: "Tease, don't please"
        },
        tease: { 
          say: "You're lucky you're cute because that was terrible", 
          exit: "I'm starting to think you might be worth the trouble",
          tip: "Push-pull creates chemistry"
        },
        compliment: { 
          say: "I wasn't gonna like you tonight. You ruined my plans", 
          exit: "There's something about you I can't figure out yet",
          tip: "Backhanded > Direct"
        },
        getCloser: { 
          say: "Come here, I can barely hear you", 
          exit: "You're too far. Fix that",
          tip: "Command, don't request"
        },
        silence: { 
          say: "Tell me something you've never told anyone on a first date", 
          exit: "What's something people always get wrong about you?",
          tip: "Deep questions break tension"
        },
        changeVibe: { 
          say: "Okay controversial opinion time - go", 
          exit: "Let's play a game. I ask, you answer honestly",
          tip: "Lead the energy shift"
        },
        deepTalk: { 
          say: "When's the last time you felt actually alive?", 
          exit: "What would you do if you weren't afraid of failing?",
          tip: "Vulnerability is attractive"
        },
        makeMove: { 
          say: "We're leaving. I'll explain on the way", 
          exit: "Come on",
          tip: "Less words, more action"
        },
        pullBack: { 
          say: "Hmm. Interesting.", 
          exit: "Anyway...",
          tip: "Silence is power"
        },
        secondDate: { 
          say: "You passed the vibe check. I'm taking you somewhere better next time", 
          exit: "Clear your schedule. You're not gonna want to miss this",
          tip: "State, don't ask"
        },
        getNumber: { 
          say: "Put your number in. Don't make it weird", 
          exit: "Save yourself as whatever you want me to remember you by",
          tip: "Hand them the phone"
        },
        invite: { 
          say: "I know a place. You're coming", 
          exit: "Let's continue this somewhere better",
          tip: "Lead with certainty"
        },
        endWell: { 
          say: "You exceeded expectations. Barely.", 
          exit: "Don't fall in love with me on the drive home",
          tip: "Leave them wanting more"
        },
        rescue: { 
          say: "Okay that was weird. Starting over - hi, I'm the best part of your night", 
          exit: "Wrong vibe. Let's fix that. Tell me something interesting",
          tip: "Acknowledge and redirect"
        }
      };
      const fb = eliteFallbacks[actionId] || { 
        say: "You keep distracting me and I'm not mad about it", 
        exit: "Walk with me",
        tip: "Confidence is everything"
      };
      setResponse({
        action: quickActions.find(a => a.id === actionId)?.label,
        emoji: quickActions.find(a => a.id === actionId)?.emoji,
        recommendation: "The energy is there. Stop thinking, start doing. Hesitation kills the vibe. Make your move with full commitment.",
        flags: {
          green: signals.eyeContact ? ["Eye contact locked = green light"] : [],
          yellow: ["Trust your read"],
          red: signals.distracted ? ["Recapture attention first"] : []
        },
        consentLine: fb.say,
        fallback: fb.exit,
        proTip: fb.tip,
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

    const genderContext = targetGender === 'woman' ? 'her' : 'him';
    const genderLabel = targetGender === 'woman' ? 'She' : 'He';

    const prompt = `ON A DATE NOW with a ${targetGender}. Quick help!
Stage: ${stageLabels[dateStage] || dateStage}
My Style: ${selectedStyle}
Signals from ${genderContext}: ${buildSignalContext()}
Question: "${customQuestion}"

Use ${genderContext}/${genderLabel} pronouns. Answer in 1-2 sentences MAX. JSON format only.`;

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
            trySaying: "You've got my attention. What are you gonna do with it?",
            gracefulExit: "Let's get out of here. I know a spot.",
            proTip: "Confidence over everything."
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
        recommendation: "Here's the play: stop overthinking. If the energy's there, escalate. If not, create tension by pulling back slightly. Make them wonder.",
        flags: {
          green: signals.eyeContact || signals.laughingRelaxed ? ["They're into it - green light"] : [],
          yellow: ["Trust your read on this"],
          red: []
        },
        consentLine: "I'm trying to figure you out and I can't... I like that",
        fallback: "Tell me something about you that most people get wrong",
        proTip: "Mystery creates attraction",
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

          {/* Style & Gender Selection */}
          <div className="flex flex-wrap gap-2">
            {/* Style Selector */}
            <div className="relative">
              <button
                onClick={() => { setShowStylePicker(!showStylePicker); setShowGenderPicker(false); }}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl hover:border-amber-500/50 transition-all"
              >
                <span className="text-base">{styleOptions.find(s => s.id === selectedStyle)?.emoji}</span>
                <span className="text-xs text-amber-300">
                  Style: <span className="font-semibold text-white">{selectedStyle}</span>
                </span>
                <svg className={`w-3 h-3 text-amber-400 transition-transform ${showStylePicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Style Dropdown */}
              {showStylePicker && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  {styleOptions.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => { setSelectedStyle(style.id); setShowStylePicker(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selectedStyle === style.id 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xl">{style.emoji}</span>
                      <div>
                        <p className="font-medium text-sm">{style.label}</p>
                        <p className="text-xs text-slate-500">{style.desc}</p>
                      </div>
                      {selectedStyle === style.id && <Check className="w-4 h-4 ml-auto text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gender Selector */}
            <div className="relative">
              <button
                onClick={() => { setShowGenderPicker(!showGenderPicker); setShowStylePicker(false); }}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl hover:border-pink-500/50 transition-all"
              >
                <span className="text-base">{genderOptions.find(g => g.id === targetGender)?.emoji}</span>
                <span className="text-xs text-pink-300">
                  Dating a: <span className="font-semibold text-white">{genderOptions.find(g => g.id === targetGender)?.label}</span>
                </span>
                <svg className={`w-3 h-3 text-pink-400 transition-transform ${showGenderPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Gender Dropdown */}
              {showGenderPicker && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  {genderOptions.map((gender) => (
                    <button
                      key={gender.id}
                      onClick={() => { setTargetGender(gender.id); setShowGenderPicker(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        targetGender === gender.id 
                          ? 'bg-pink-500/20 text-pink-300' 
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xl">{gender.emoji}</span>
                      <span className="font-medium text-sm">{gender.label}</span>
                      {targetGender === gender.id && <Check className="w-4 h-4 ml-auto text-pink-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date Stage - Enhanced Timeline Design */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Stars className="w-4 h-4 text-amber-400" />
              Where are you in the date?
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Progress</span>
              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Horizontal Scrollable Timeline */}
          <div className="overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <div className="flex gap-3 min-w-max">
              {dateStages.map((stage, index) => {
                const isSelected = dateStage === stage.id;
                const isPast = index < currentStageIndex;
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => setDateStage(stage.id)}
                    className={`relative flex flex-col items-center transition-all duration-300 ${
                      isSelected ? 'scale-105' : 'hover:scale-102'
                    }`}
                  >
                    {/* Connection Line */}
                    {index < dateStages.length - 1 && (
                      <div className={`absolute top-6 left-[calc(50%+20px)] w-8 h-0.5 ${
                        isPast ? 'bg-amber-500' : 'bg-slate-700'
                      }`} />
                    )}
                    
                    {/* Stage Circle */}
                    <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? `bg-gradient-to-br ${stage.color} shadow-lg shadow-amber-500/30 ring-2 ring-white/20` 
                        : isPast
                          ? 'bg-slate-700 ring-2 ring-amber-500/50'
                          : 'bg-slate-800/80 hover:bg-slate-700/80'
                    }`}>
                      <span className={`text-2xl ${isSelected ? 'animate-pulse' : ''}`}>{stage.icon}</span>
                      
                      {/* Checkmark for past stages */}
                      {isPast && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className={`mt-2 text-xs font-medium transition-colors ${
                      isSelected ? 'text-white' : isPast ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      {stage.label}
                    </span>
                    
                    {/* Hint (only for selected) */}
                    {isSelected && (
                      <span className="mt-0.5 text-[10px] text-amber-400/80 font-medium">
                        {stage.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Stage Card */}
          <div className="mt-4 p-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dateStages[currentStageIndex]?.color || 'from-amber-500 to-orange-500'} flex items-center justify-center`}>
                <span className="text-lg">{dateStages[currentStageIndex]?.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  Stage {currentStageIndex + 1} of {dateStages.length}: {dateStages[currentStageIndex]?.label}
                </p>
                <p className="text-slate-400 text-xs">
                  {dateStages[currentStageIndex]?.hint} • Tap to change stage
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl">{dateStages[currentStageIndex]?.icon}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signals - Enhanced Design */}
        <div className="px-5 mb-6">
          {/* Header with Signal Count */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              What signals do you see?
            </h3>
            <div className="flex items-center gap-3">
              {/* Green signals count */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <span className="text-xs">✅</span>
                <span className="text-xs font-bold text-emerald-400">
                  {signalOptions.filter(s => s.positive === true && signals[s.id]).length}
                </span>
              </div>
              {/* Red signals count */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
                <span className="text-xs">🚫</span>
                <span className="text-xs font-bold text-red-400">
                  {signalOptions.filter(s => s.positive === false && signals[s.id]).length}
                </span>
              </div>
            </div>
          </div>

          {/* Green Flags Section */}
          <div className="mb-4">
            <p className="text-xs text-emerald-400 font-medium mb-2 flex items-center gap-1.5">
              <span>✅</span> Green Flags <span className="text-slate-500">• They're interested</span>
            </p>
            <div className="overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-2 min-w-max">
                {signalOptions.filter(s => s.positive === true).map((signal) => {
                  const isActive = signals[signal.id];
                  return (
                    <button
                      key={signal.id}
                      onClick={() => toggleSignal(signal.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                          : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-300'
                      }`}
                    >
                      <span className="text-base">{signal.emoji}</span>
                      <span className="whitespace-nowrap">{signal.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Red Flags Section */}
          <div className="mb-4">
            <p className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1.5">
              <span>🚫</span> Red Flags <span className="text-slate-500">• Caution signs</span>
            </p>
            <div className="overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-2 min-w-max">
                {signalOptions.filter(s => s.positive === false || s.positive === null).map((signal) => {
                  const isActive = signals[signal.id];
                  return (
                    <button
                      key={signal.id}
                      onClick={() => toggleSignal(signal.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 scale-105'
                          : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:border-red-500/50 hover:text-red-300'
                      }`}
                    >
                      <span className="text-base">{signal.emoji}</span>
                      <span className="whitespace-nowrap">{signal.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vibe Check Summary Card */}
          {(signalOptions.filter(s => s.positive === true && signals[s.id]).length > 0 || 
            signalOptions.filter(s => s.positive === false && signals[s.id]).length > 0) && (
            <div className={`p-3 rounded-xl border ${
              signalOptions.filter(s => s.positive === true && signals[s.id]).length > 
              signalOptions.filter(s => s.positive === false && signals[s.id]).length
                ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30'
                : signalOptions.filter(s => s.positive === false && signals[s.id]).length > 0
                  ? 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/30'
                  : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  signalOptions.filter(s => s.positive === true && signals[s.id]).length > 
                  signalOptions.filter(s => s.positive === false && signals[s.id]).length
                    ? 'bg-emerald-500/20'
                    : signalOptions.filter(s => s.positive === false && signals[s.id]).length > 0
                      ? 'bg-red-500/20'
                      : 'bg-amber-500/20'
                }`}>
                  <span className="text-xl">
                    {signalOptions.filter(s => s.positive === true && signals[s.id]).length > 
                     signalOptions.filter(s => s.positive === false && signals[s.id]).length
                      ? '🔥' 
                      : signalOptions.filter(s => s.positive === false && signals[s.id]).length > 
                        signalOptions.filter(s => s.positive === true && signals[s.id]).length
                        ? '⚠️'
                        : '🤔'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${
                    signalOptions.filter(s => s.positive === true && signals[s.id]).length > 
                    signalOptions.filter(s => s.positive === false && signals[s.id]).length
                      ? 'text-emerald-300'
                      : signalOptions.filter(s => s.positive === false && signals[s.id]).length > 
                        signalOptions.filter(s => s.positive === true && signals[s.id]).length
                        ? 'text-red-300'
                        : 'text-amber-300'
                  }`}>
                    {signalOptions.filter(s => s.positive === true && signals[s.id]).length > 
                     signalOptions.filter(s => s.positive === false && signals[s.id]).length
                      ? "Looking good! They're into you 💪" 
                      : signalOptions.filter(s => s.positive === false && signals[s.id]).length > 
                        signalOptions.filter(s => s.positive === true && signals[s.id]).length
                        ? "Slow down, read the room 🎯"
                        : "Mixed signals, play it cool 😎"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {signalOptions.filter(s => s.positive === true && signals[s.id]).length} green • {signalOptions.filter(s => s.positive === false && signals[s.id]).length} red flags detected
                  </p>
                </div>
              </div>
            </div>
          )}
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
