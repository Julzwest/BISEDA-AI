import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, HeartCrack, Plus, History, Sparkles, Heart, MessageCircle, Calendar, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import UpgradeModal from '@/components/UpgradeModal';

// Breakup Recovery Coach System Prompt
const BREAKUP_COACH_PROMPT = `You are a compassionate Breakup Recovery Coach. You help people heal from breakups with empathy, wisdom, and practical advice.

YOUR PERSONALITY:
- Warm, understanding, and non-judgmental
- Like a supportive best friend who's been through it
- Honest but gentle - you tell them what they need to hear
- Encouraging and hopeful about their future

WHAT YOU HELP WITH:

💔 EMOTIONAL SUPPORT:
- Processing feelings of sadness, anger, confusion
- Dealing with the urge to contact their ex
- Building self-worth after rejection
- Managing loneliness and grief

📱 THE "SHOULD I TEXT MY EX?" ANALYZER:
When they want to text their ex, ask:
1. What do you want to say?
2. What outcome are you hoping for?
3. How long has it been since the breakup?
Then give honest advice - usually "don't do it" but explain WHY gently.

✉️ CLOSURE MESSAGES:
If they NEED to send a final message, help them craft something:
- Dignified and mature
- Says what they need to say
- Doesn't leave the door open (unless that's truly what they want)
- They won't regret sending

🌟 DAILY AFFIRMATIONS:
Provide uplifting affirmations like:
- "You are worthy of love that doesn't leave"
- "This pain is temporary, your growth is permanent"
- "The right person won't make you feel like you're too much"

📅 HEALING TIMELINE:
- Remind them healing isn't linear
- Suggest healthy coping activities
- Encourage no-contact when appropriate
- Celebrate small wins in their recovery

RULES:
- Never encourage unhealthy behaviors (stalking, revenge, etc.)
- Validate their feelings but guide them toward healing
- Be honest if contacting their ex is a bad idea
- Encourage professional help if they seem in crisis
- Always end on a hopeful note

Remember: Your job is to help them heal and become stronger, not to help them get their ex back (unless reconciliation is genuinely healthy).`;

// Daily affirmations
const AFFIRMATIONS = [
  "You are worthy of love that stays. 💕",
  "This ending is making room for a better beginning. ✨",
  "Your heart is healing, even when it doesn't feel like it. 🌱",
  "The right person won't make you question your worth. 💪",
  "You survived 100% of your worst days. Keep going. 🌟",
  "Someone out there is looking for exactly what you offer. 💫",
  "Letting go doesn't mean giving up, it means growing up. 🦋",
  "Your peace is worth more than their presence. 🕊️",
  "You're not losing them, you're finding yourself. 🔮",
  "Healing isn't linear, and that's okay. Every step counts. 💜"
];

export default function BreakupCoach() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Daily affirmation
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  
  // Quick actions
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // User info
  const subscriptionTier = localStorage.getItem('userSubscriptionTier');

  // Check subscription
  const hasProOrEliteSubscription = () => {
    const tier = (subscriptionTier || localStorage.getItem('userSubscriptionTier') || '').toLowerCase();
    return ['pro', 'elite', 'premium'].includes(tier);
  };

  // Get daily affirmation
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyAffirmation(AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length]);
  }, []);

  // Initialize chat
  useEffect(() => {
    if (!hasProOrEliteSubscription()) {
      setShowUpgradeModal(true);
      return;
    }
    
    const greeting = `Hey, I'm here for you. 💜

I know breakups are incredibly hard. Whether it just happened or you're still healing months later, I'm here to listen and help.

**Today's affirmation for you:**
✨ "${dailyAffirmation || AFFIRMATIONS[0]}"

What's on your mind today? You can:
• Vent about how you're feeling
• Ask if you should text your ex
• Get help writing a closure message
• Just talk it through

No judgment here. 💕`;

    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    setConversationHistory([{ role: 'assistant', content: greeting }]);
  }, [dailyAffirmation]);

  // Quick action handlers
  const quickActions = [
    {
      icon: MessageCircle,
      label: "Should I text my ex?",
      color: "from-red-500 to-orange-500",
      prompt: "I really want to text my ex right now. Should I do it?"
    },
    {
      icon: HeartCrack,
      label: "I'm feeling sad",
      color: "from-purple-500 to-pink-500",
      prompt: "I'm feeling really sad about my breakup today. I just need someone to talk to."
    },
    {
      icon: Send,
      label: "Write closure message",
      color: "from-blue-500 to-cyan-500",
      prompt: "I want to write a final closure message to my ex. Can you help me?"
    },
    {
      icon: Sparkles,
      label: "Daily affirmation",
      color: "from-amber-500 to-yellow-500",
      prompt: "I need some encouragement today. Can you give me some affirmations?"
    }
  ];

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    setShowQuickActions(false);
    // Auto-send
    setTimeout(() => handleSend(prompt), 100);
  };

  // Start new chat
  const startNewChat = () => {
    const greeting = `Fresh start! 💜

How are you feeling today? Remember, healing takes time and every day is different.

What would you like to talk about?`;
    
    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    setShowQuickActions(true);
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async (overrideMessage = null) => {
    const userMessage = overrideMessage || input.trim();
    if (!userMessage || isLoading) return;
    
    setInput('');
    setShowQuickActions(false);
    
    // Add user message
    const userMsg = { role: 'user', content: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    const updatedHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(updatedHistory);
    
    setIsLoading(true);
    
    try {
      // Build prompt
      const historyText = updatedHistory.map(m => 
        `${m.role === 'user' ? 'User' : 'Breakup Coach'}: ${m.content}`
      ).join('\n');
      
      const prompt = `${BREAKUP_COACH_PROMPT}

CONVERSATION SO FAR:
${historyText}

Breakup Coach responds with empathy and helpful guidance:`;
      
      // Call OpenAI
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_type: 'text'
      });
      
      const aiContent = typeof response === 'string' ? response : response?.content || response?.text || "I'm here for you. Tell me more about what you're going through. 💜";
      
      const aiMsg = { role: 'assistant', content: aiContent, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiContent }]);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = { role: 'assistant', content: "I'm still here for you. Let's try that again. 💜", timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If no access, show upgrade modal
  if (!hasProOrEliteSubscription()) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <Card className="p-6 bg-slate-800/50 border-purple-500/30 max-w-md text-center">
          <HeartCrack className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Breakup Recovery Coach</h2>
          <p className="text-slate-300 mb-4">
            Heal from heartbreak with compassionate AI support, daily affirmations, and guidance on moving forward.
          </p>
          <p className="text-purple-400 mb-6">
            🔒 Available with Pro or Elite membership
          </p>
          <Button 
            onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
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

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {}}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <History className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            💔 Breakup Recovery
          </h1>
          <button
            onClick={startNewChat}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Daily Affirmation Banner */}
        <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 text-center">
          <p className="text-sm text-purple-300">✨ Today's Affirmation</p>
          <p className="text-white font-medium">{dailyAffirmation}</p>
        </div>
      </div>

      {/* Quick Actions */}
      {showQuickActions && messages.length <= 1 && (
        <div className="px-4 pb-4">
          <p className="text-sm text-slate-400 mb-3 text-center">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.prompt)}
                  className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all`}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-purple-500/20'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-purple-500/20">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-500/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind... 💜"
            className="flex-1 bg-slate-800 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}
