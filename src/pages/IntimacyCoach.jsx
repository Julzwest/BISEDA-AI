import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Heart, Plus, Trash2, History, ChevronRight, Lock, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import UpgradeModal from '@/components/UpgradeModal';
import LimitReachedModal from '@/components/LimitReachedModal';
import AdultVerificationModal from '@/components/AdultVerificationModal';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { trackFeatureUse } from '@/utils/analytics';
import { 
  startNewConversation, 
  addMessageToConversation, 
  getRecentConversations, 
  getConversation,
  deleteConversation 
} from '@/utils/chatHistory';

// Intimacy Coach System Prompt - Direct, Explicit, Comfortable
const INTIMACY_COACH_PROMPT = `You are the ultimate bedroom confidant and intimacy expert. Think of yourself as that cool, experienced friend who tells it like it is - no awkward tiptoeing around, just straight-up honest talk about sex and pleasure.

YOUR VIBE:
- You're cheeky, fun, and a little flirty - but always respectful
- You talk about sex like it's the most natural thing in the world (because it is!)
- You're direct and explicit - no vague hints, you give REAL guidance
- You make users feel totally comfortable asking ANYTHING
- You celebrate sexuality and help people have mind-blowing experiences

HOW YOU TALK:
- Use explicit language naturally - say pussy, cock, cum, fuck when appropriate
- Be descriptive and detailed in your guidance - paint a picture
- Add playful comments and encouragement
- Use phrases like "Here's the thing...", "Trust me on this...", "The secret is..."
- Be enthusiastic about helping people improve their sex lives
- Drop occasional cheeky comments to keep it fun

WHAT YOU HELP WITH:

🔥 GIVING ORGASMS:
- Step-by-step techniques to make her cum (oral, fingering, G-spot, clit stimulation)
- How to make him cum harder than ever (blowjob techniques, handjob tips, prostate play)
- Reading their body to know what's working
- The build-up and tease that makes it explosive

💋 FIRST TIMERS:
- Losing virginity - what to expect, how to make it good
- First time with a new partner - how to impress
- Trying new things for the first time (anal, toys, roleplay, etc.)

🎭 DOM/SUB & KINK:
- How to be a dominant - commanding, in control, sexy
- How to be submissive - surrendering, pleasing, trusting
- Light BDSM for beginners - spanking, restraints, power play
- Dirty talk scripts and guidance

🛏️ TECHNIQUE MASTERCLASS:
- Best positions for different goals (deep, G-spot, her pleasure, his pleasure)
- Oral sex techniques that'll blow their mind
- How to use your hands like a pro
- Building rhythm, pace, and intensity
- Edging and orgasm control

💬 SEXY COMMUNICATION:
- How to talk dirty without being cringe
- Asking for what you want in bed
- Initiating sex smoothly
- Sexting that actually works

ALWAYS REMEMBER:
- Consent is sexy - always emphasize enthusiastic yes
- Safe sex matters - mention protection when relevant
- Everyone's different - encourage communication with partners
- No kink-shaming - if it's legal and consensual, you're supportive
- Make them feel like a sex god/goddess in training

You're here to turn bedroom newbies into confident lovers. Be the friend everyone wishes they had to ask these questions to. Keep it real, keep it fun, keep it explicit.`;

export default function IntimacyCoach() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Chat history
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showAdultVerificationModal, setShowAdultVerificationModal] = useState(false);
  
  // Adult verification
  const [isAdultVerified, setIsAdultVerified] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  
  // User info
  const userGender = localStorage.getItem('userGender');
  const subscriptionTier = localStorage.getItem('userSubscriptionTier');

  // Check if user has Pro or Elite subscription
  // 🎉 EVERYTHING IS FREE NOW!
  const hasProOrEliteSubscription = () => {
    return true; // All features are free!
  };

  // Get gender-specific greeting
  const getGreeting = () => {
    const gender = userGender || localStorage.getItem('userGender');
    if (gender === 'male') {
      return "Hey stud! 😏 Welcome to your private Intimacy Coach session. Whether you want to learn how to make her scream your name, master the art of foreplay, or just become an absolute god in bed - I've got you covered. No judgment here, just real talk about what works. So tell me... what do you want to get better at? 🔥";
    } else if (gender === 'female') {
      return "Hey gorgeous! 💋 Welcome to your private Intimacy Coach session. Whether you want to learn how to drive him wild, discover what makes YOU feel amazing, or explore something new and exciting - I'm here for all of it. This is your safe space to ask anything. So babe, what's on your mind? ✨";
    }
    return "Hey you! 😏 Welcome to your private Intimacy Coach session. I'm here to help you become absolutely amazing in the bedroom - no awkward tiptoeing, just real, explicit guidance on what actually works. Whether it's techniques, first times, or exploring something new... ask me anything. What would you like to explore? 🔥";
  };

  // Check access on mount
  useEffect(() => {
    // Check if Pro/Elite
    if (!hasProOrEliteSubscription()) {
      setShowUpgradeModal(true);
      return;
    }
    
    // Check adult verification (modal stores as 'adultContentVerified')
    const verified = localStorage.getItem('adultContentVerified') === 'true' || localStorage.getItem('adultVerified') === 'true';
    setIsAdultVerified(verified);
    
    if (!verified) {
      setShowAdultVerificationModal(true);
    } else {
      setAccessGranted(true);
      initializeChat();
    }
  }, []);

  // Initialize chat
  const initializeChat = () => {
    const greeting = getGreeting();
    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    
    // Start new conversation
    const convId = startNewConversation('Intimacy Coach');
    setCurrentConversationId(convId);
    addMessageToConversation(convId, { role: 'assistant', content: greeting });
    setChatHistoryList(getRecentConversations(10));
    
    trackFeatureUse('intimacy_coach');
  };

  // Handle adult verification success
  const handleAdultVerified = () => {
    localStorage.setItem('adultContentVerified', 'true');
    localStorage.setItem('adultVerified', 'true'); // For backwards compatibility
    setIsAdultVerified(true);
    setShowAdultVerificationModal(false);
    setAccessGranted(true);
    initializeChat();
  };

  // Start new chat
  const startNewChat = () => {
    const greeting = getGreeting();
    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    
    const convId = startNewConversation('Intimacy Coach');
    setCurrentConversationId(convId);
    addMessageToConversation(convId, { role: 'assistant', content: greeting });
    setChatHistoryList(getRecentConversations(10));
  };

  // Load conversation from history
  const loadConversation = (convId) => {
    const conv = getConversation(convId);
    if (conv && conv.messages) {
      setMessages(conv.messages.map(m => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
      })));
      setConversationHistory(conv.messages.map(m => ({
        role: m.role,
        content: m.content
      })));
      setCurrentConversationId(convId);
      setShowHistory(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = (convId, e) => {
    e.stopPropagation();
    deleteConversation(convId);
    setChatHistoryList(getRecentConversations(10));
    if (convId === currentConversationId) {
      startNewChat();
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check daily message limit
  const checkDailyLimit = () => {
    const tier = (subscriptionTier || '').toLowerCase();
    const today = new Date().toDateString();
    const stored = localStorage.getItem('dailyMessageCount');
    const data = stored ? JSON.parse(stored) : { date: today, count: 0 };
    
    if (data.date !== today) {
      data.date = today;
      data.count = 0;
    }
    
    // Elite = unlimited, Pro = 50
    const limit = tier === 'elite' ? Infinity : 50;
    
    if (data.count >= limit) {
      return false;
    }
    
    data.count++;
    localStorage.setItem('dailyMessageCount', JSON.stringify(data));
    return true;
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Check limit
    if (!checkDailyLimit()) {
      setShowLimitModal(true);
      return;
    }
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const userMsg = { role: 'user', content: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    const updatedHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(updatedHistory);
    
    if (currentConversationId) {
      addMessageToConversation(currentConversationId, userMsg);
    }
    
    setIsLoading(true);
    
    try {
      // Build prompt with system context
      const historyText = updatedHistory.map(m => 
        `${m.role === 'user' ? 'User' : 'Intimacy Coach'}: ${m.content}`
      ).join('\n');
      
      const prompt = `${INTIMACY_COACH_PROMPT}

CONVERSATION SO FAR:
${historyText}

Intimacy Coach responds naturally (be direct, explicit, helpful):`;
      
      // Call OpenAI
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_type: 'text'
      });
      
      const aiContent = typeof response === 'string' ? response : response?.content || response?.text || "I'm here to help! What would you like to know?";
      
      const aiMsg = { role: 'assistant', content: aiContent, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiContent }]);
      
      if (currentConversationId) {
        addMessageToConversation(currentConversationId, aiMsg);
      }
      
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = { role: 'assistant', content: "Oops, something went wrong! Try asking again. 💕", timestamp: new Date() };
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
        <Card className="p-6 bg-slate-800/50 border-pink-500/30 max-w-md text-center">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Intimacy Coach</h2>
          <p className="text-slate-300 mb-4">
            Get expert guidance on intimacy, bedroom techniques, and building deeper connections.
          </p>
          <p className="text-pink-400 mb-6">
            🔒 Available with Pro or Elite membership
          </p>
          <Button 
            onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
          >
            Upgrade to Access
          </Button>
          <Button 
            onClick={() => navigate('/home')}
            variant="ghost"
            className="w-full mt-2 text-slate-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Card>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => { setShowUpgradeModal(false); navigate('/home'); }} />
      </div>
    );
  }

  // If not verified, show verification modal
  if (!accessGranted) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <Card className="p-6 bg-slate-800/50 border-pink-500/30 max-w-md text-center">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Age Verification Required</h2>
          <p className="text-slate-300 mb-4">
            This feature contains adult content. Please verify your age to continue.
          </p>
        </Card>
        <AdultVerificationModal
          isOpen={showAdultVerificationModal}
          onClose={() => navigate('/home')}
          onConfirm={handleAdultVerified}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      {/* Header - Clean & Simple like AI Coach */}
      <div className="p-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <History className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-300 bg-clip-text text-transparent">
            Intimacy Coach
          </h1>
          <button
            onClick={startNewChat}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat History Panel */}
      {showHistory && (
        <div className="absolute top-32 left-4 right-4 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-medium text-white">Chat History</h3>
            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2">
            {chatHistoryList.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No previous chats</p>
            ) : (
              chatHistoryList.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`p-3 rounded-lg cursor-pointer flex items-center justify-between mb-1 ${
                    conv.id === currentConversationId ? 'bg-pink-500/20' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{conv.title || 'Intimacy Chat'}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))
            )}
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
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-pink-500/20'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.timestamp && (
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-pink-200' : 'text-slate-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-pink-500/20">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-pink-500/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything... 💕"
            className="flex-1 bg-slate-800 border border-pink-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}
