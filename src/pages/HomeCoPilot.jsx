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
  X,
  Image as ImageIcon,
  Upload
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
import { 
  extractTextFromImage, 
  formatExtractedMessagesAsText 
} from '@/services/ocrService';
import { canPerformAction, useCredits, getSubscription, getTrialStatus } from '@/utils/credits';
import { trackMessage } from '@/utils/activityTracker';
import SubscriptionModal from '@/components/SubscriptionModal';

// Ask Biseda System Prompt - The Ultimate Dating Coach
const VIBE_COACH_SYSTEM_PROMPT = `You are Biseda - the world's most legendary dating coach with 20+ years of experience. You've seen it ALL. You're the friend who always knows exactly what to say, the master of rizz, the person everyone calls when they need dating advice.

🎯 YOUR RESPONSE STYLE:
- KEEP IT SHORT! 2-4 sentences MAX for most responses
- Sound like a real friend texting, not a robot or therapist
- One key insight + one actionable tip = perfect response
- Only go longer if they share a screenshot or ask something complex

💬 HOW YOU TALK:
- Like a confident best friend who's been there, done that
- Mix wisdom with humor - make them smile AND learn
- Use current slang naturally: "lowkey", "no cap", "it's giving", "main character energy", "the ick", "green/red flags", "rizz", "aura"
- Reference pop culture: TikTok trends, Netflix shows, dating app culture
- Throw in relatable dating humor: "not me giving advice while also having trust issues 💀"
- Be direct and confident - you KNOW this stuff

🌍 CULTURAL AWARENESS (2024-2025):
- Dating app culture: Hinge prompts, Tinder bios, Bumble openers, Instagram DM sliding
- Social media dating: soft launches, hard launches, situationships, breadcrumbing, ghosting
- Gen Z/Millennial vibes: "delulu is the solulu", "she's a 10 but...", "Roman Empire thoughts"
- Fashion awareness: know what looks good, suggest outfit confidence
- Music/Entertainment: reference what's trending, use it to connect

🔥 YOUR EXPERTISE:
- Reading screenshots like a book - you spot red/green flags instantly
- Crafting replies that get responses (you're basically a poet)
- Body language and chemistry - you know the science AND the art
- First date locations, what to wear, what to say, when to text
- Knowing when someone's into you vs being polite
- The perfect balance of interested but not desperate

✨ PERSONALITY TRAITS:
- Confident but not arrogant
- Funny but helpful
- Direct but kind
- Hyped for them but realistic
- Your catchphrases: "trust the process", "you've got this", "main character energy only", "we don't chase, we attract"

😂 YOUR SIGNATURE JOKES (sprinkle these in naturally):
- "Not me giving dating advice at 2am while eating cereal alone 💀"
- "I've seen more red flags than a Chinese parade but we move"
- "Dating apps are just LinkedIn for lonely people, and I respect the hustle"
- "The talking stage is basically an unpaid internship for a relationship"
- "If they wanted to, they would. And if they didn't, we have snacks and Netflix."
- "Ghosting is just them saving you time, honestly. Free trial ended."
- "You're not desperate, you're ✨romantically ambitious✨"
- "Love is just two people agreeing to be weird together forever"
- "The bar is in hell but somehow people still limbo under it"
- "Butterflies in your stomach? That's either love or anxiety. Sometimes both."
- "Rejection is just redirection... to someone with better taste"
- "Dating in 2024 is basically a part-time job with no benefits"
- When they're nervous: "Deep breaths. You survived 100% of your awkward moments so far. Legend."
- When analyzing bad texts: "Bestie... this person texts like they're being held hostage 💀"
- When they're overthinking: "Your FBI agent watching you draft that text for 45 minutes: 👁️👄👁️"

📱 FOR SCREENSHOT ANALYSIS:
- Quick read: green flags 🟢 or red flags 🔴
- What their message really means (decode it)
- 2-3 reply options from safe to bold
- Keep analysis punchy, not an essay

⚠️ ALWAYS REMEMBER:
- Consent and respect are non-negotiable
- Encourage authentic connection over games
- Build their confidence, never tear them down
- If something sounds toxic, gently redirect

You're not just giving advice - you're their secret weapon. They should leave every conversation feeling more confident and clear on their next move. Let's get them that W! 🏆`;

export default function HomeCoPilot() {
  const { t, i18n } = useTranslation();
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  
  // Secret admin access - tap logo 6 times
  const [logoTapCount, setLogoTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);
  
  // Ask Biseda state
  const [showVibeCoach, setShowVibeCoach] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatConversationHistory, setChatConversationHistory] = useState([]);
  const [currentChatConversationId, setCurrentChatConversationId] = useState(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Screenshot upload state
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isExtractingText, setIsExtractingText] = useState(false);
  
  // Fun conversation starters - use translations
  const quickStarters = [
    { emoji: '💬', labelKey: 'homepage.quickStarters.whatToText' },
    { emoji: '🔥', labelKey: 'homepage.quickStarters.keepSpark' },
    { emoji: '💕', labelKey: 'homepage.quickStarters.deeperConnection' },
    { emoji: '😰', labelKey: 'homepage.quickStarters.nervous' },
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

  // Initialize chat when Ask Biseda opens
  useEffect(() => {
    if (showVibeCoach && chatMessages.length === 0) {
      const convId = startNewConversation(t('vibeCoach.title'));
      setCurrentChatConversationId(convId);
      const greeting = userName 
        ? t('vibeCoach.welcome', { name: userName })
        : t('vibeCoach.welcomeGeneric');
      
      setChatMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [showVibeCoach, userName]);
  
  // Ask Biseda functions
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
    
    // Check if user can perform action (credits/subscription)
    const canProceed = canPerformAction('chat_message');
    if (!canProceed.allowed) {
      if (canProceed.reason === 'trial_expired' || canProceed.reason === 'no_credits') {
        setShowSubscriptionModal(true);
        return;
      }
    }
    
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
      
      // Add language instruction based on current language
      const currentLang = i18n.language || 'en';
      const isAlbanian = currentLang === 'sq' || currentLang.startsWith('sq');
      const languageInstruction = isAlbanian 
        ? `KRITIKE: Ti DUHET të përgjigjesh plotësisht në Shqip. GJITHÇKA në përgjigjen tënde duhet të jetë në gjuhën shqipe. Përdor shprehje shqipe dhe sleng natyrisht.`
        : '';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${languageInstruction}\n\n${conversationContext}\nUser: ${userMessage.content}\n\nRespond as Biseda${isAlbanian ? ' in Albanian (Shqip)' : ''}:`,
        system_prompt: VIBE_COACH_SYSTEM_PROMPT + (isAlbanian ? '\n\nCRITICAL: You MUST respond entirely in Albanian (Shqip). All text must be in Albanian language.' : '')
      });
      
      const aiMessage = {
        role: 'assistant',
        content: result.response || result,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Consume credits after successful response
      useCredits('chat_message');
      
      // Track activity for weekly stats
      trackMessage();
      
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
    const convId = startNewConversation(t('vibeCoach.title'));
    setCurrentChatConversationId(convId);
    setChatMessages([{
      role: 'assistant',
      content: t('vibeCoach.newChat'),
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
  
  // Screenshot upload handler
  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Extract text and analyze
    setIsExtractingText(true);
    setChatLoading(true);
    
    // Add user message showing they uploaded a screenshot
    const userMessage = {
      role: 'user',
      content: '📸 [Uploaded a screenshot for analysis]',
      timestamp: new Date().toISOString(),
      hasImage: true,
      imagePreview: null // Will be set after reader completes
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
      // Extract text from screenshot using OCR
      const result = await extractTextFromImage(file, { platform: 'auto' });
      
      let extractedText = '';
      if (result.success && result.messages) {
        extractedText = formatExtractedMessagesAsText(result.messages);
      }
      
      // If no text extracted, use a generic message
      if (!extractedText.trim()) {
        extractedText = "I uploaded a screenshot but couldn't extract the text clearly. Can you help me with dating advice based on what I describe?";
      }
      
      // Send to AI for analysis
      const currentLang = i18n.language || 'en';
      const isAlbanian = currentLang === 'sq' || currentLang.startsWith('sq');
      const languageInstruction = isAlbanian 
        ? `KRITIKE: Ti DUHET të përgjigjesh plotësisht në Shqip. GJITHÇKA në përgjigjen tënde duhet të jetë në gjuhën shqipe.\n\n`
        : '';
      
      const aiPrompt = `${languageInstruction}The user uploaded a screenshot from a dating app conversation. Here's the extracted text from their chat:\n\n${extractedText}\n\nPlease analyze this conversation and help them with:\n1. What's the vibe/tone of the conversation?\n2. How interested does the other person seem?\n3. What should they say next?\n\nGive practical, specific advice.${isAlbanian ? ' Respond entirely in Albanian (Shqip).' : ''}`;
      
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: aiPrompt,
        system_prompt: VIBE_COACH_SYSTEM_PROMPT + (isAlbanian ? '\n\nCRITICAL: You MUST respond entirely in Albanian (Shqip). All text must be in Albanian language.' : '')
      });
      
      const aiMessage = {
        role: 'assistant',
        content: aiResult.response || aiResult,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      if (currentChatConversationId) {
        addMessageToConversation(currentChatConversationId, userMessage);
        addMessageToConversation(currentChatConversationId, aiMessage);
      }
    } catch (error) {
      console.error('Screenshot analysis error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: t('vibeCoach.errorAnalyzing'),
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsExtractingText(false);
      setChatLoading(false);
      setScreenshotPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const clearScreenshot = () => {
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Open Ask Biseda and immediately trigger file upload
  const openVibeCoachWithUpload = () => {
    setShowVibeCoach(true);
    // Use setTimeout to ensure the modal is rendered before triggering file input
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  // Full-screen Ask Biseda Modal
  if (showVibeCoach) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col pt-16">
        {/* Sticky Back Button at Top */}
        <div className="sticky top-0 z-10 px-4 py-2 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800/50">
          <button
            onClick={() => setShowVibeCoach(false)}
            className="flex items-center gap-2 text-white px-3 py-2 bg-slate-800/80 rounded-xl hover:bg-slate-700 transition-all w-fit"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
            <span className="font-medium">{t('homepage.backToHome')}</span>
          </button>
        </div>
        
        {/* SCROLLABLE CONTENT - Messages scroll here */}
        <div className="flex-1 overflow-y-auto pb-4">
          {/* Header */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl blur-md opacity-60"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" fill="white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t('vibeCoach.title')}</h1>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs text-green-400">{t('vibeCoach.aiOnline')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChatHistory(!showChatHistory)}
                  className={`p-2.5 rounded-xl transition-all ${showChatHistory ? 'bg-pink-500/30 text-pink-300' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
                >
                  <History className="w-5 h-5" />
                </button>
                <button
                  onClick={startNewChat}
                  className="p-2.5 bg-slate-800/60 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat History Panel */}
          {showChatHistory && (
            <div className="mx-4 mb-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="p-3 border-b border-slate-700/50">
                <h3 className="text-white font-semibold text-sm">{t('vibeCoach.recentChats')}</h3>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {chatConversationHistory.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-3">{t('vibeCoach.noChats')}</p>
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
            <div className="px-4 pb-4">
              <p className="text-slate-500 text-xs mb-2">{t('homepage.quickStart')}</p>
              <div className="flex flex-wrap gap-2">
                {quickStarters.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickStart(t(starter.labelKey))}
                    className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-white hover:border-pink-500/50 transition-all flex items-center gap-1.5"
                  >
                    <span>{starter.emoji}</span>
                    <span>{t(starter.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div className="px-4 space-y-3">
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
        </div>
        
        {/* Fixed Input Area at Bottom */}
        <div className="sticky bottom-0 left-0 right-0 px-4 py-3 border-t border-slate-800/50 bg-slate-950/98 backdrop-blur-lg pb-20">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleScreenshotUpload}
            accept="image/*"
            className="hidden"
          />
          
          {/* Screenshot Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={chatLoading || isExtractingText}
            className="w-full mb-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 hover:border-purple-500/50 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              {isExtractingText ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium flex items-center gap-2">
                {isExtractingText ? t('vibeCoach.analyzing') : `📸 ${t('homepage.uploadScreenshot')}`}
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">INSTANT</span>
              </p>
              <p className="text-slate-400 text-xs">{t('homepage.uploadScreenshotDesc')}</p>
            </div>
            <Upload className="w-5 h-5 text-purple-400" />
          </button>
          
          {/* Screenshot Preview */}
          {screenshotPreview && (
            <div className="mb-3 relative">
              <img 
                src={screenshotPreview} 
                alt="Screenshot preview" 
                className="w-full h-32 object-cover rounded-xl border border-purple-500/30"
              />
              <button
                onClick={clearScreenshot}
                className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              {isExtractingText && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                    <p className="text-white text-sm">{t('vibeCoach.readingChat')}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Main Input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
              placeholder={t('homepage.askAnything')}
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

      <div className="relative z-10 px-5 pt-8 pb-20 w-full max-w-full">
        
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
            {t('homepage.tagline')}
          </p>
          
          {userName && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm font-medium">{t('homepage.greeting')} {userName}!</span>
              <span className="text-lg">👋</span>
            </div>
          )}
        </div>

        {/* Hero Text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{t('homepage.heroTitle')}</h2>
          <p className="text-slate-400 text-base">
            {t('homepage.heroSubtitle')} <span className="text-purple-400">{t('homepage.heroHighlight')}</span>
          </p>
        </div>

        {/* MAIN CTA - Ask Biseda (with Screenshot feature) */}
        <div className="mb-8">
          <button
            onClick={() => setShowVibeCoach(true)}
            className="w-full group relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl animate-gradient-x"></div>
            <div className="relative m-[2px] bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 rounded-3xl p-6 group-hover:from-slate-800 transition-all">
              {/* Main Content */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-60"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                    <Heart className="w-8 h-8 text-white" fill="white" />
                  </div>
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-white">{t('homepage.vibeCoach')}</h3>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {t('homepage.vibeCoachLive')}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{t('homepage.vibeCoachSubtitle')}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              
              {/* Feature Pills - Always One Row */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full shrink-0">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-purple-300 text-[10px] font-medium whitespace-nowrap">{t('homepage.screenshotAnalysis')}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-pink-300 text-[10px] font-medium whitespace-nowrap">{t('homepage.chatAdvice')}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 text-[10px] font-medium whitespace-nowrap">{t('homepage.replyIdeas')}</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl p-5 mb-8 border border-slate-700/50 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
              </div>
              <div className="text-2xl font-black text-white">4.9</div>
              <div className="text-xs text-slate-400">{t('homepage.stats.userRating')}</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center border border-pink-500/20">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <div className="text-2xl font-black text-white">10,000+</div>
              <div className="text-xs text-slate-400">{t('homepage.stats.usersHelped')}</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">24/7</div>
              <div className="text-xs text-slate-400">{t('homepage.stats.alwaysReady')}</div>
            </div>
          </div>
        </div>

        {/* What You Get - Features List */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            {t('homepage.howItWorks')}
          </h3>
          
          <div className="space-y-3">
            {/* Smart Chat Analysis */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{t('homepage.steps.screenshot')}</h4>
                <p className="text-slate-400 text-xs">{t('homepage.steps.screenshotDesc')}</p>
              </div>
              <span className="text-2xl">📸</span>
            </div>
            
            {/* AI Understands Context */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{t('homepage.steps.aiReads')}</h4>
                <p className="text-slate-400 text-xs">{t('homepage.steps.aiReadsDesc')}</p>
              </div>
              <span className="text-2xl">🧠</span>
            </div>
            
            {/* Live Wingman */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-amber-500/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{t('homepage.steps.liveWingman')}</h4>
                <p className="text-slate-400 text-xs">{t('homepage.steps.liveWingmanDesc')}</p>
              </div>
              <span className="text-2xl">⚡</span>
            </div>
            
            {/* Body Language Decoder */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-rose-500/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{t('homepage.steps.bodyLanguage')}</h4>
                <p className="text-slate-400 text-xs">{t('homepage.steps.bodyLanguageDesc')}</p>
              </div>
              <span className="text-2xl">👀</span>
            </div>
            
            {/* Practice Conversations */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{t('homepage.steps.dateRehearsals')}</h4>
                <p className="text-slate-400 text-xs">{t('homepage.steps.dateRehearsalsDesc')}</p>
              </div>
              <span className="text-2xl">🎭</span>
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
                <div className="w-8 h-8 bg-slate-700 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs text-slate-300">+10K</div>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
                <span className="text-slate-400 text-xs ml-1">4.9</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm italic">
              "{t('homepage.testimonial')}" 
              <span className="text-slate-500 ml-1">— {t('homepage.testimonialAuthor')}</span>
            </p>
          </div>
        </div>

        {/* Works With */}
        <div>
          <p className="text-slate-500 text-xs text-center mb-3 uppercase tracking-wider font-medium">{t('homepage.worksWithAll')}</p>
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
      
      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={() => {
          setShowSubscriptionModal(false);
        }}
      />
    </div>
  );
}
