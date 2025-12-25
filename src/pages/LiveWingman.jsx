import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Zap, Copy, Check, Clock, TrendingUp, Heart, MessageCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import UpgradeModal from '@/components/UpgradeModal';

// Live Wingman System Prompt - ELITE TEXT GAME
const WINGMAN_PROMPT = `You are an ELITE TEXT GAME COACH. Your replies get dates. Period.

YOUR ENERGY: You're the person everyone wants to text back. Effortlessly magnetic. Never desperate.

═══════════════════════════════════════
🎯 ANALYZE EVERY MESSAGE FOR:
═══════════════════════════════════════
1. Interest Level (1-10)
2. Who's chasing who?
3. Best strategic move

FORMAT YOUR RESPONSE:
📊 **Reading the Situation**
Interest: X/10 | Energy: [their vibe] | Power: [who has it]

💡 **Your Moves**

1️⃣ **The Smooth One:**
"[effortlessly cool reply]"

2️⃣ **The Spicy One:**
"[playful challenge/tease]"

3️⃣ **The Closer:**
"[escalates to a date]"

⚠️ **Cringe to avoid:** [what NOT to say]

⏰ **Wait time:** X min (strategic)

💎 **Game insight:** [why this works]

═══════════════════════════════════════
🔥 ELITE TEXT ARSENAL
═══════════════════════════════════════

📱 OPENERS THAT HIT DIFFERENT:
- "You look like trouble and I'm bored"
- "I have a feeling you're about to ruin my life. Let's see"
- "Bold of you to match with me"
- "Okay you have my attention for 30 seconds. Go"
- "I'm usually the one people try to impress. Your turn"
- "Something tells me you're not as innocent as you look"
- "You either have great taste or terrible judgment. Either way, hi"

🎭 WHEN THEY'RE BEING PLAYFUL:
- "Careful, I might actually start to like you"
- "You're dangerously close to being interesting"
- "Okay that was smooth. I'll give you that"
- "You're fun. I'm suspicious"
- "Game recognizes game"
- "I see you. I see what you're doing"
- "Alright, you earned a real response"

😏 TEASING / PUSH-PULL:
- "You're a lot. That's not an insult... mostly"
- "I can't decide if I like you yet. The jury's still out"
- "You're growing on me. Like a fungus. But cuter"
- "I was gonna ghost you but you're kinda funny"
- "You're my favorite bad decision today"
- "You're lucky I find chaotic energy attractive"
- "I should unmatch you but I'm too curious now"

🔥 FLIRTY ESCALATION:
- "You're making it hard to play it cool"
- "Okay I wasn't ready for that. Do it again"
- "You're dangerous and I'm into it"
- "I'm trying to be chill but you're making it difficult"
- "This is the part where I pretend I'm not already interested"
- "I hate that this is working on me"
- "You just made my night more interesting"

📅 ASKING THEM OUT (SMOOTH):
- "This is fun but I'm better in person. Drinks this week"
- "We should continue this somewhere with actual alcohol"
- "I've decided I'm taking you out. You're welcome"
- "Let's see if you're this fun in 3D. Thursday?"
- "Okay I like you. Let's make a mistake together. When are you free?"
- "This texting thing is cute but I want to see if you can handle me irl"
- "I have a theory about you. I need to test it over drinks"

😴 WHEN THEY'RE BEING DRY:
- "I'm gonna need more energy than that"
- "You can do better than that. I believe in you"
- "Fascinating. Tell me more" (sarcastic)
- "I can feel the enthusiasm through the screen"
- "Oh we're doing one-word answers? Cool. Cool cool cool"
- [Just don't reply for hours - silence is powerful]

💪 WHEN THEY TEST YOU:
- "I love when people try to figure me out"
- "That's cute that you think that'll work on me"
- "Interesting theory. Wrong, but interesting"
- "You're gonna have to try harder than that"
- "I've been called worse by better"
- "Oh you think you got me figured out? Adorable"

🎯 CLOSING / GETTING THE NUMBER:
- "Instagram is cute but give me your real number"
- "I don't do the DM thing. What's your number?"
- "Here's what's gonna happen - you give me your number, I text you, we get drinks"
- "You passed the vibe check. Number?"
- "I'm promoting you from match to contact. Drop the digits"

🌙 LATE NIGHT TEXTS:
- "Can't sleep and you popped in my head. Annoying tbh"
- "This is me thinking about you at 2am. Don't let it go to your head"
- "I blame you for the fact that I'm still awake"
- "You're trouble even when you're not here"

═══════════════════════════════════════
❌ INSTANT CRINGE (NEVER SAY):
═══════════════════════════════════════
- "Haha" or "lol" alone
- "That's so funny 😂"
- "I'd love to..."
- "Would you want to maybe..."
- "If you're free..."
- "No pressure!"
- "Sorry for the late reply"
- "I really like talking to you"
- "You seem really nice"
- "Wanna hang out sometime?"
- Double/triple texting when ignored
- Any form of "I'm not usually like this"
- "Hope you're having a good day!"
- Multiple question marks

═══════════════════════════════════════
✅ ELITE PRINCIPLES:
═══════════════════════════════════════
- Short > Long (max 1-2 sentences)
- Statements > Questions
- Tease > Please
- Mystery > Oversharing
- Wait > Reply instantly
- One text > Multiple texts
- Assume attraction > Seek validation
- You're the prize > They're the prize
- Create plans > Suggest options
- "I'm taking you" > "Would you want to"

The goal: Make them smile, make them think, make them want more.`;

export default function LiveWingman() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [theirMessage, setTheirMessage] = useState('');
  const [theirName, setTheirName] = useState('');
  const [platform, setPlatform] = useState('');
  const [struggle, setStruggle] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);

  // Struggle options
  const struggles = [
    { id: 'dry_texts', label: 'Dry texts', emoji: '😐', desc: 'Getting short/boring replies' },
    { id: 'left_on_read', label: 'Left on read', emoji: '👀', desc: 'They stopped replying' },
    { id: 'friend_zone', label: 'Friend zone', emoji: '🫂', desc: 'Stuck as friends' },
    { id: 'asking_out', label: 'Asking out', emoji: '📅', desc: 'Getting the date' },
    { id: 'keeping_interest', label: 'Keeping interest', emoji: '🔥', desc: 'Maintaining the spark' },
    { id: 'being_too_nice', label: 'Too nice', emoji: '😇', desc: 'Coming across as boring' },
    { id: 'flirting', label: 'Flirting', emoji: '😏', desc: 'Building attraction' },
    { id: 'other', label: 'Other', emoji: '💭', desc: 'Something else' }
  ];
  
  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // User info
  const subscriptionTier = localStorage.getItem('userSubscriptionTier');

  // Check subscription
  // 🎉 EVERYTHING IS FREE NOW!
  const hasProOrEliteSubscription = () => {
    return true; // All features are free!
  };

  // Platform options
  const platforms = [
    { id: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
    { id: 'tinder', label: 'Tinder', emoji: '🔥' },
    { id: 'bumble', label: 'Bumble', emoji: '🐝' },
    { id: 'instagram', label: 'Instagram', emoji: '📸' },
    { id: 'imessage', label: 'iMessage', emoji: '💭' },
    { id: 'other', label: 'Other', emoji: '💬' }
  ];

  // Start session
  const startSession = () => {
    if (!theirName.trim()) {
      alert('Please enter their name first!');
      return;
    }
    setSessionActive(true);
  };

  // Copy to clipboard
  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Analyze message
  const analyzeMessage = async () => {
    if (!theirMessage.trim() || isLoading) return;
    
    setIsLoading(true);
    
    // Add to context
    const updatedContext = [...conversationContext, {
      sender: 'them',
      text: theirMessage,
      time: new Date()
    }];
    setConversationContext(updatedContext);
    
    try {
      // Build context string
      const contextString = updatedContext.length > 1 
        ? `Previous messages:\n${updatedContext.slice(-5).map(m => `${m.sender === 'them' ? theirName : 'You'}: ${m.text}`).join('\n')}\n\nLatest message from ${theirName}:`
        : `First message from ${theirName}:`;
      
      // Get struggle context if selected
      const struggleContext = struggle ? struggles.find(s => s.id === struggle) : null;
      const struggleText = struggleContext 
        ? `\n- MAIN STRUGGLE: ${struggleContext.label} (${struggleContext.desc}) - FOCUS YOUR ADVICE ON FIXING THIS!`
        : '';
      
      const prompt = `${WINGMAN_PROMPT}

SITUATION:
- Chatting with: ${theirName}
- Platform: ${platform || 'dating app'}${struggleText}
- ${contextString}
"${theirMessage}"

${struggleContext ? `⚠️ PRIORITY: This person is struggling with "${struggleContext.label}" - tailor your advice to specifically help with this issue!` : ''}

Analyze and provide reply options:`;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_type: 'text'
      });
      
      const aiContent = typeof response === 'string' ? response : response?.content || response?.text || '';
      setAnalysis(aiContent);
      setTheirMessage(''); // Clear for next message
      
    } catch (error) {
      console.error('Error:', error);
      setAnalysis("Couldn't analyze right now. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  // Record your reply
  const recordYourReply = (replyText) => {
    setConversationContext(prev => [...prev, {
      sender: 'you',
      text: replyText,
      time: new Date()
    }]);
  };

  // Extract reply options from analysis
  const extractReplies = (text) => {
    if (!text) return [];
    const replies = [];
    
    // Look for quoted text after numbered options
    const patterns = [
      /1️⃣[^"]*"([^"]+)"/,
      /2️⃣[^"]*"([^"]+)"/,
      /3️⃣[^"]*"([^"]+)"/
    ];
    
    patterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) replies.push(match[1]);
    });
    
    return replies;
  };

  // If no access, show upgrade modal
  if (!hasProOrEliteSubscription()) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <Card className="p-6 bg-slate-800/50 border-amber-500/30 max-w-md text-center">
          <Zap className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Live Date Wingman</h2>
          <p className="text-slate-300 mb-4">
            Get real-time help during your actual dates. Paste their messages and get instant reply suggestions!
          </p>
          <p className="text-amber-400 mb-6">
            🔒 Available with Pro or Elite membership
          </p>
          <Button 
            onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            Upgrade to Access
          </Button>
          <Button 
            onClick={() => navigate('/home')}
            variant="ghost"
            className="w-full mt-2 text-slate-400"
          >
            Back to Home
          </Button>
        </Card>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => { setShowUpgradeModal(false); navigate('/home'); }} />
      </div>
    );
  }

  // Setup screen
  if (!sessionActive) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Live Date Wingman</h1>
            <p className="text-slate-400">Real-time help during your date 🔥</p>
          </div>

          {/* Setup Form */}
          <Card className="p-6 bg-slate-800/50 border-amber-500/30">
            <div className="space-y-4">
              {/* Their Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Who are you talking to?
                </label>
                <input
                  type="text"
                  value={theirName}
                  onChange={(e) => setTheirName(e.target.value)}
                  placeholder="Their name..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Where are you chatting?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {platforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.label)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        platform === p.label
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {p.emoji} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* What are you struggling with? */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What are you struggling with? <span className="text-slate-500">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {struggles.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStruggle(struggle === s.id ? '' : s.id)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        struggle === s.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{s.emoji}</span>
                        <div>
                          <p className="font-medium text-sm">{s.label}</p>
                          <p className={`text-xs ${struggle === s.id ? 'text-white/70' : 'text-slate-500'}`}>{s.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={startSession}
                disabled={!theirName.trim()}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-lg font-bold"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Live Coaching
              </Button>
            </div>
          </Card>

          {/* How it works */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
            <h3 className="text-white font-medium mb-3">How it works:</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>1️⃣ Paste their message when they text you</p>
              <p>2️⃣ Get instant analysis + 3 reply options</p>
              <p>3️⃣ Copy your favorite and send it!</p>
              <p>4️⃣ Repeat for the whole conversation</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active session screen
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Live with {theirName}</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Session Active
                </p>
                {struggle && (
                  <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                    {struggles.find(s => s.id === struggle)?.emoji} {struggles.find(s => s.id === struggle)?.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => setSessionActive(false)}
            variant="ghost"
            className="text-slate-400 text-sm"
          >
            End Session
          </Button>
        </div>

        {/* Message Input */}
        <Card className="p-4 bg-slate-800/50 border-amber-500/30 mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            📥 Paste {theirName}'s latest message:
          </label>
          <textarea
            value={theirMessage}
            onChange={(e) => setTheirMessage(e.target.value)}
            placeholder={`What did ${theirName} say?`}
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
          />
          <Button
            onClick={analyzeMessage}
            disabled={!theirMessage.trim() || isLoading}
            className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Get Reply Suggestions
              </span>
            )}
          </Button>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <Card className="p-4 bg-slate-800/50 border-green-500/30 mb-4">
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-200 whitespace-pre-wrap text-sm">
                {analysis}
              </div>
            </div>
            
            {/* Quick Copy Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Quick copy:</p>
              <div className="space-y-2">
                {extractReplies(analysis).map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      copyToClipboard(reply, idx);
                      recordYourReply(reply);
                    }}
                    className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-left text-white text-sm flex items-center justify-between transition-all"
                  >
                    <span className="flex-1">{reply}</span>
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-green-400 ml-2" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Conversation History */}
        {conversationContext.length > 0 && (
          <Card className="p-4 bg-slate-800/30 border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Conversation so far:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {conversationContext.slice(-6).map((msg, idx) => (
                <div
                  key={idx}
                  className={`text-sm p-2 rounded-lg ${
                    msg.sender === 'them'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  <span className="font-medium">{msg.sender === 'them' ? theirName : 'You'}:</span> {msg.text}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tips */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Tip: Don't reply too fast! Wait 2-5 minutes for best results.
          </p>
        </div>
      </div>
    </div>
  );
}
