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
  Mic,
  Image,
  Smile,
  Star,
  Flame,
  Zap
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
    { emoji: '💬', label: 'What should I text them?', color: 'from-blue-500 to-cyan-500' },
    { emoji: '🔥', label: 'Keep the spark alive', color: 'from-orange-500 to-red-500' },
    { emoji: '💕', label: 'Build deeper connection', color: 'from-pink-500 to-rose-500' },
    { emoji: '😰', label: "I'm nervous, help!", color: 'from-purple-500 to-indigo-500' },
    { emoji: '✨', label: 'First date tips', color: 'from-amber-500 to-yellow-500' },
    { emoji: '🤔', label: 'Reading their signals', color: 'from-emerald-500 to-teal-500' },
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

  // Initialize chat on mount
  useEffect(() => {
    if (chatMessages.length === 0) {
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
  }, [userName]);
  
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

  return (
    <div className="w-full h-screen overflow-hidden relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" key={i18n.language}>
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-gradient-to-br from-amber-500/15 to-orange-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-40 right-16 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping opacity-50" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-40" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col h-full pb-20">
        
        {/* Header - Compact & Cool */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={handleLogoTap}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/40">
                  <Heart className="w-6 h-6 text-white" fill="white" />
                  <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Vibe Coach
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-400 font-medium">AI Online</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChatHistory(!showChatHistory)}
                className={`p-2.5 rounded-xl transition-all ${showChatHistory ? 'bg-pink-500/30 text-pink-300' : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={startNewChat}
                className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white hover:shadow-lg hover:shadow-pink-500/30 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Greeting */}
          {userName && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-slate-400 text-sm">Hey</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-bold text-sm">{userName}</span>
              <span className="text-lg">✨</span>
            </div>
          )}
        </div>
        
        {/* Chat History Panel (Slide Down) */}
        {showChatHistory && (
          <div className="mx-5 mb-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-pink-400" />
                Recent Chats
              </h3>
              <button 
                onClick={() => setShowChatHistory(false)}
                className="text-slate-500 hover:text-white text-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto p-2">
              {chatConversationHistory.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No previous chats yet</p>
              ) : (
                <div className="space-y-1">
                  {chatConversationHistory.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadChatConversation(conv.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        currentChatConversationId === conv.id
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium truncate max-w-[180px]">{conv.title || 'Chat'}</p>
                          <p className="text-slate-500 text-xs">
                            {new Date(conv.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
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
        
        {/* Quick Starters - Show when few messages */}
        {chatMessages.length <= 2 && !showChatHistory && (
          <div className="px-5 mb-3">
            <p className="text-slate-500 text-xs mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Quick start:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickStarters.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickStart(starter.label)}
                  className={`px-3 py-2 bg-gradient-to-r ${starter.color} bg-opacity-20 hover:bg-opacity-30 border border-white/10 rounded-xl text-xs text-white transition-all hover:scale-105 hover:shadow-lg flex items-center gap-1.5`}
                  style={{ 
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <span className="text-base">{starter.emoji}</span>
                  <span>{starter.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-2 shrink-0 shadow-lg shadow-pink-500/20">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 backdrop-blur-sm'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {chatLoading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-2 shrink-0">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <div className="bg-slate-800/80 rounded-2xl px-4 py-3 border border-slate-700/50">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/50">
          {/* Screenshot Upload Option */}
          <button
            onClick={() => navigate('/copilot/upload')}
            className="w-full mb-3 bg-gradient-to-r from-slate-800/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-3 hover:border-pink-500/30 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-semibold flex items-center gap-2">
                Upload Screenshot
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">POPULAR</span>
              </p>
              <p className="text-slate-500 text-xs">Get help with your dating app chats</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </button>
          
          {/* Main Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Ask me anything..."
                className="w-full bg-slate-800/80 border border-slate-700/50 focus:border-pink-500/50 rounded-2xl pl-4 pr-12 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-sm transition-all"
                disabled={chatLoading}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-pink-400 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <Button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || chatLoading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-5 rounded-2xl disabled:opacity-50 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all h-14"
            >
              {chatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          
          {/* Footer */}
          <p className="text-center text-slate-600 text-[10px] mt-3 flex items-center justify-center gap-1.5">
            <Heart className="w-3 h-3 text-pink-500/50" fill="currentColor" />
            Your personal dating & relationship advisor
          </p>
        </div>
      </div>
      
      {/* CSS for animations */}
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
