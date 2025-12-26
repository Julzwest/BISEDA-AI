import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Sparkles, 
  MessageSquare, 
  Heart,
  Send,
  Loader2,
  Plus,
  History,
  Trash2,
  ChevronRight,
  ChevronDown,
  Smile,
  Star,
  Flame,
  Zap,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  startNewConversation,
  addMessageToConversation,
  getRecentConversations,
  getConversation,
  deleteConversation
} from '@/utils/chatHistory';

// Vibe Coach System Prompt
const VIBE_COACH_SYSTEM_PROMPT = `You are an expert Intimacy and Relationship Coach. Your role is to provide supportive, educational, and empowering guidance on building deeper connections, enhancing romance, and improving communication in intimate relationships.

YOUR VIBE:
- Professional, warm, and approachable
- Focus on healthy relationships, mutual respect, and consent
- Empower users to explore intimacy confidently and safely
- Sex-positive, but always within App Store guidelines (no explicit content)
- Emphasize communication, emotional connection, and shared pleasure

HOW YOU TALK:
- Use clear, encouraging, and respectful language
- Be descriptive and helpful in your guidance, focusing on emotional and physical connection
- Add positive affirmations and encouragement
- Use phrases like "Consider trying...", "A great way to explore...", "Focus on..."
- Be enthusiastic about helping people build fulfilling intimate lives
- Keep responses concise but helpful (2-3 paragraphs max)
- Use emojis naturally to keep things fun 💕

WHAT YOU HELP WITH:
💕 Building emotional connection and intimacy
💬 Communication mastery in relationships
✨ Enhancing romance and keeping the spark alive
🔥 Physical intimacy guidance (suggestive, not explicit)
💪 Self-confidence and body positivity
📸 Analyzing dating app conversations

ALWAYS EMPHASIZE:
- Consent is essential - enthusiastic yes from both partners
- Communication is key - talk to your partner
- Everyone is different - encourage exploration together
- Respect boundaries - yours and theirs

You're here to help people have healthier, happier, more connected relationships. Be the supportive coach everyone deserves!`;

export default function HomeCoPilot() {
  const { i18n } = useTranslation();
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  
  // Secret admin access - tap logo 6 times
  const [logoTapCount, setLogoTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);
  
  // Vibe Coach state
  const [showVibeCoach, setShowVibeCoach] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatConversationHistory, setChatConversationHistory] = useState([]);
  const [currentChatConversationId, setCurrentChatConversationId] = useState(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Fun conversation starters
  const quickStarters = [
    { emoji: '💬', label: 'What should I text them?' },
    { emoji: '🔥', label: 'Keep the spark alive' },
    { emoji: '💕', label: 'Build deeper connection' },
    { emoji: '😰', label: "I'm nervous, help!" },
  ];
  
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

  // Initialize chat when Vibe Coach opens
  useEffect(() => {
    if (showVibeCoach && chatMessages.length === 0) {
      const convId = startNewConversation('Vibe Coach');
      setCurrentChatConversationId(convId);
      const greeting = userName 
        ? `Hey ${userName}! 👋 I'm your Vibe Coach.\n\nWhether you need help with what to text, relationship advice, or just want to chat about love stuff - I got you! 💕\n\nWhat's on your mind?`
        : "Hey! 👋 I'm your Vibe Coach.\n\nWhether you need help with what to text, relationship advice, or just want to chat about love stuff - I got you! 💕\n\nWhat's on your mind?";
      
      setChatMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [showVibeCoach, userName]);
  
  // Vibe Coach functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  const loadConversations = () => {
    const recent = getRecentConversations();
    setChatConversationHistory(recent);
  };
  
  useEffect(() => {
    loadConversations();
  }, []);
  
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    if (currentChatConversationId) {
      addMessageToConversation(currentChatConversationId, userMessage);
    }
    
    try {
      const conversationContext = chatMessages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
        .join('\n');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${conversationContext}\nUser: ${userMessage.content}\n\nRespond as the Vibe Coach:`,
        system_prompt: VIBE_COACH_SYSTEM_PROMPT
      });
      
      const aiMessage = {
        role: 'assistant',
        content: result.response || result,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      if (currentChatConversationId) {
        addMessageToConversation(currentChatConversationId, aiMessage);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! Something went wrong. Let's try that again? 💕",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setChatLoading(false);
    }
  };
  
  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };
  
  const handleQuickStart = (label) => {
    setChatInput(label);
    inputRef.current?.focus();
  };
  
  const startNewChat = () => {
    const convId = startNewConversation('Vibe Coach');
    setCurrentChatConversationId(convId);
    setChatMessages([{
      role: 'assistant',
      content: "Fresh start! 🌟 What would you like to talk about?",
      timestamp: new Date().toISOString()
    }]);
    setShowChatHistory(false);
    loadConversations();
  };
  
  const loadChatConversation = (convId) => {
    const conv = getConversation(convId);
    if (conv && conv.messages) {
      setCurrentChatConversationId(convId);
      setChatMessages(conv.messages);
      setShowChatHistory(false);
    }
  };
  
  const handleDeleteConversation = (convId, e) => {
    e.stopPropagation();
    deleteConversation(convId);
    loadConversations();
    if (currentChatConversationId === convId) {
      startNewChat();
    }
  };

  // Full-screen Vibe Coach Modal
  if (showVibeCoach) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl blur-md opacity-60"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Vibe Coach</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-400">AI Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChatHistory(!showChatHistory)}
                className={`p-2 rounded-lg transition-all ${showChatHistory ? 'bg-pink-500/30 text-pink-300' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={startNewChat}
                className="p-2 bg-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowVibeCoach(false)}
                className="p-2 bg-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat History Panel */}
        {showChatHistory && (
          <div className="mx-5 mt-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-700/50">
              <h3 className="text-white font-semibold text-sm">Recent Chats</h3>
            </div>
            <div className="max-h-40 overflow-y-auto p-2">
              {chatConversationHistory.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-3">No previous chats</p>
              ) : (
                <div className="space-y-1">
                  {chatConversationHistory.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadChatConversation(conv.id)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        currentChatConversationId === conv.id
                          ? 'bg-pink-500/20 border border-pink-500/30'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{conv.title || 'Chat'}</p>
                        <p className="text-slate-500 text-xs">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Quick Starters */}
        {chatMessages.length <= 1 && !showChatHistory && (
          <div className="px-5 py-3">
            <p className="text-slate-500 text-xs mb-2">Quick start:</p>
            <div className="flex flex-wrap gap-2">
              {quickStarters.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickStart(starter.label)}
                  className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-white hover:border-pink-500/50 transition-all flex items-center gap-1.5"
                >
                  <span>{starter.emoji}</span>
                  <span>{starter.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-2 shrink-0">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-slate-800/80 text-slate-100 border border-slate-700/50'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {chatLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-2">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <div className="bg-slate-800/80 rounded-2xl px-4 py-3 border border-slate-700/50">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-lg pb-24">
          {/* Screenshot Upload Option */}
          <button
            onClick={() => navigate('/copilot/upload')}
            className="w-full mb-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 hover:border-purple-500/50 transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">Upload Screenshot</p>
              <p className="text-slate-500 text-xs">Get help with your dating app chats</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </button>
          
          {/* Main Input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-800/80 border border-slate-700/50 focus:border-pink-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none text-sm"
              disabled={chatLoading}
            />
            <Button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || chatLoading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-5 rounded-xl disabled:opacity-50"
            >
              {chatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Homepage
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

      <div className="relative z-10 px-5 pt-8 pb-28 w-full max-w-full">
        
        {/* Logo + Branding */}
        <div className="text-center mb-6">
          <div 
            className="inline-block mb-4 relative cursor-pointer select-none"
            onClick={handleLogoTap}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                <MessageSquare className="w-12 h-12 text-white relative z-10 drop-shadow-lg" fill="currentColor" strokeWidth={1.5} />
                <Sparkles className="w-5 h-5 text-yellow-300 absolute top-3 right-3 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-black mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">Biseda</span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">.ai</span>
          </h1>
          
          <p className="text-lg font-semibold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Your Dating Wingman 🎯
          </p>
          
          {userName && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm font-medium">Hey {userName}!</span>
              <span className="text-lg">👋</span>
            </div>
          )}
        </div>

        {/* Hero Text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Never get left on read again</h2>
          <p className="text-slate-400 text-base">
            Upload your chat. Get the perfect reply. <span className="text-purple-400">It's that easy.</span>
          </p>
        </div>

        {/* PRIMARY CTA - Screenshot Upload */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/copilot/upload?mode=screenshot')}
            className="w-full group relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl animate-gradient-x"></div>
            <div className="relative m-[2px] bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-2xl p-5 group-hover:from-slate-800 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-all">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">Upload Screenshot</h3>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full uppercase">Popular</span>
                  </div>
                  <p className="text-slate-400 text-sm">Snap → Upload → Get your reply ✨</p>
                </div>
                <ChevronRight className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>
        </div>
        
        {/* OR Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-500 text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* SECONDARY CTA - Vibe Coach */}
        <div className="mb-8">
          <button
            onClick={() => setShowVibeCoach(true)}
            className="w-full group relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 rounded-2xl opacity-80"></div>
            <div className="relative m-[2px] bg-gradient-to-br from-slate-900 via-pink-900/30 to-slate-900 rounded-2xl p-5 group-hover:from-slate-800 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-all">
                  <Heart className="w-8 h-8 text-white" fill="white" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">Vibe Coach</h3>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">Relationship & dating advice 💕</p>
                </div>
                <ChevronRight className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>
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
            <Sparkles className="w-5 h-5 text-purple-400" />
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
        <div className="pb-8">
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
