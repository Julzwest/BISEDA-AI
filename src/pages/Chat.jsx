import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, MessageSquare, Image as ImageIcon, X, History, Plus, Trash2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import UsageDisplay from '@/components/UsageDisplay';
import UpgradeModal from '@/components/UpgradeModal';
import LimitReachedModal from '@/components/LimitReachedModal';
import CrisisHelplineModal from '@/components/CrisisHelplineModal';
import { UNIFIED_AI_SYSTEM_PROMPT, getLanguageInstruction } from '@/utils/unifiedAIPrompt';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { trackFeatureUse } from '@/utils/analytics';
import { 
  startNewConversation, 
  addMessageToConversation, 
  getRecentConversations, 
  getConversation,
  deleteConversation 
} from '@/utils/chatHistory';

const CATEGORIES = {
  'chat': {
    name: 'AI Coach',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-600',
    greeting: 'Ç\'kemi! Unë jam AI Coach-i yt për dating dhe biseda. Si mund të të ndihmoj sot? 💬',
    systemPrompt: UNIFIED_AI_SYSTEM_PROMPT + `

MODO I FUNKSIONIMIT - AI COACH (BISEDA):
Ti je në modalitetin "AI Coach" ku përdoruesi bisedon me ty për të praktikuar biseda dhe për të mësuar teknikat e picking up. Në këtë modalitet:
- Përdoruesi bisedon me ty si një coach/mentor
- Ti jipu këshilla, feedback, dhe sugjerime për përmirësim
- Ti ndihmo përdoruesin të praktikojë biseda dhe të mësojë teknikat
- Ti je një partner bisede që ndihmon përdoruesin të përmirësojë aftësitë e komunikimit
- Përgjigjet e tua duhet të jenë natyrale, si një bisedë reale me një coach ekspert`
  }
};

export default function Chat() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // If no categories available, redirect to home
  useEffect(() => {
    if (Object.keys(CATEGORIES).length === 0) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);
  
  const categoryParam = searchParams.get('category') || 'chat';
  
  // Redirect removed categories to default
  if (!CATEGORIES[categoryParam] && Object.keys(CATEGORIES).length > 0) {
    const newUrl = `${window.location.pathname}?category=chat`;
    window.history.pushState({}, '', newUrl);
  }
  
  // If no categories, show nothing (will redirect)
  if (Object.keys(CATEGORIES).length === 0) {
    return null;
  }
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'chat');
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userGender, setUserGender] = useState(null); // 'male' or 'female'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [usage, setUsage] = useState(null);
  const [screenshotUsage, setScreenshotUsage] = useState({ used: 0, freeLimit: 2, remaining: 2 });
  const [showScreenshotLimitModal, setShowScreenshotLimitModal] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const backendUrl = getBackendUrl();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const category = CATEGORIES[selectedCategory];
  if (!category) {
    return null;
  }
  const CategoryIcon = category.icon;

  // Reset and initialize when category changes
  React.useEffect(() => {
    const greeting = category.greeting;
    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    // Initialize conversation history with greeting
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    setIsInitialized(true);
    
    // Start a new conversation for chat history
    const convId = startNewConversation('AI Coach Bisedë');
    setCurrentConversationId(convId);
    addMessageToConversation(convId, { role: 'assistant', content: greeting });
    
    // Load chat history list
    setChatHistoryList(getRecentConversations(10));
  }, [selectedCategory]);

  // Load a previous conversation
  const loadConversation = (convId) => {
    const conv = getConversation(convId);
    if (conv) {
      setMessages(conv.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
      setConversationHistory(conv.messages.map(m => ({
        role: m.role,
        content: m.content
      })));
      setCurrentConversationId(convId);
      setShowHistory(false);
    }
  };

  // Start a new chat
  const startNewChat = () => {
    const greeting = category.greeting;
    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    
    const convId = startNewConversation('AI Coach Bisedë');
    setCurrentConversationId(convId);
    addMessageToConversation(convId, { role: 'assistant', content: greeting });
    setChatHistoryList(getRecentConversations(10));
    setShowHistory(false);
  };

  // Delete a conversation
  const handleDeleteConversation = (convId, e) => {
    e.stopPropagation();
    deleteConversation(convId);
    setChatHistoryList(getRecentConversations(10));
    if (convId === currentConversationId) {
      startNewChat();
    }
  };

  // Sync with URL param when it changes
  React.useEffect(() => {
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Auto-scroll to bottom when messages change or when loading
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isLoading]);

  // Show limit reached modal when limit is reached
  React.useEffect(() => {
    if (isLimitReached) {
      setShowLimitModal(true);
    }
  }, [isLimitReached]);

  // Detect user gender from messages
  const detectGender = (message, history) => {
    const lowerMessage = message.toLowerCase();
    const fullText = history.map(m => m.content).join(' ') + ' ' + lowerMessage;
    
    // Male indicators: mentions their own dick/balls
    const maleIndicators = [
      'ma lepij karin', 'ma lëpij karin', 'lep karin tim', 'lëpij karin tim',
      'karin tim', 'karin e tim', 'topet e mia', 'topet e mia',
      'ma ha topet', 'ma ha topat', 'ejakuloj', 'vij sperma',
      'sperma ime', 'karin e im', 'topet e im'
    ];
    
    // Female indicators: mentions their own pussy/vagina
    const femaleIndicators = [
      'ma fut në pidh', 'ma fut në pidh', 'fut në pidhin tim',
      'pidhin tim', 'pidhin e tim', 'pidhin e mia',
      'klitorisin tim', 'klitorisin e tim', 'squirt', 'squirtim',
      'orgazm', 'vij', 'pidhin e im'
    ];
    
    // Check for male indicators
    for (const indicator of maleIndicators) {
      if (fullText.includes(indicator)) {
        return 'male';
      }
    }
    
    // Check for female indicators
    for (const indicator of femaleIndicators) {
      if (fullText.includes(indicator)) {
        return 'female';
      }
    }
    
    // Check if user says "my" with body parts
    if (lowerMessage.includes('karin') && (lowerMessage.includes('tim') || lowerMessage.includes('im') || lowerMessage.includes('ma'))) {
      return 'male';
    }
    if (lowerMessage.includes('pidh') && (lowerMessage.includes('tim') || lowerMessage.includes('im') || lowerMessage.includes('ma'))) {
      return 'female';
    }
    
    return null; // Unknown
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Ju lutem zgjidhni vetëm foto!');
      return;
    }

    // Limit to 4 images max
    const remainingSlots = 4 - selectedImages.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    // Convert files to data URLs
    const newImages = await Promise.all(
      filesToAdd.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file: file,
              dataUrl: e.target.result,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setSelectedImages(prev => [...prev, ...newImages]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Detect crisis/self-harm indicators in messages
  const detectCrisis = (message) => {
    if (!message || typeof message !== 'string') return false;
    
    const lowerMessage = message.toLowerCase();
    
    // Crisis indicators - words and phrases that suggest self-harm or severe depression
    const crisisIndicators = [
      // Self-harm/suicide intent
      'dua të vdes', 'do të vras veten', 'do të përfundoj', 'do të vras', 'vetëvrasje',
      'nuk dua të jetoj', 'nuk kam arsye për të jetuar', 'nuk ka kuptim të jetoj',
      'do të përfundoj gjithçka', 'do të bëj diçka', 'kam planuar të',
      
      // Severe depression/hopelessness
      'nuk ka shpresë', 'nuk ka kuptim', 'çdo gjë është e humbur', 'nuk ka rrugëdalje',
      'nuk kam më shpresë', 'çdo gjë është e keqe', 'nuk kam energji', 'nuk dua të dal',
      'nuk ndihem mirë', 'nuk kam arsye', 'nuk kam kuptim',
      
      // Desperation
      'nuk mund ta bëj më', 'nuk mund ta duroj më', 'nuk mund ta përballoj',
      'jam i dëshpëruar', 'jam e dëshpëruar', 'jam i humbur', 'jam e humbur',
      
      // Goodbye messages
      'lamtumirë', 'lamtumire', 'mirupafshim', 'do të më mungosh', 'do të më mungoni'
    ];
    
    // Check if message contains any crisis indicators
    for (const indicator of crisisIndicators) {
      if (lowerMessage.includes(indicator)) {
        return true;
      }
    }
    
    return false;
  };

  // Check usage limits
  const checkUsage = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/usage`);
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
        
        // Update screenshot usage
        if (data.screenshotAnalyses) {
          setScreenshotUsage(data.screenshotAnalyses);
        }
        
        const isBlocked = data.dailyUsage.remainingMessages === 0 && (!data.credits || data.credits === 0);
        setIsLimitReached(isBlocked);
        return !isBlocked;
      }
    } catch (error) {
      console.error('Error checking usage:', error);
    }
    return true; // Allow if check fails
  };

  const processMessage = async (userMessage, updatedHistory, fileUrls = []) => {

    // Check for crisis indicators BEFORE processing
    if (detectCrisis(userMessage)) {
      setShowCrisisModal(true);
      // Still process the message but AI will respond with support
    }

    // Detect gender from current message and history
    const detectedGender = detectGender(userMessage, updatedHistory);
    if (detectedGender) {
      setUserGender(detectedGender);
    }
    
    // Build clean system prompt
    let systemPrompt = category.systemPrompt;
    
    // Add language instruction based on selected language
    const currentLang = i18n.language || 'sq';
    systemPrompt += getLanguageInstruction(currentLang);
    
    // Add gender context if detected
    if (userGender || detectedGender) {
      const genderInfo = userGender || detectedGender === 'male' ? 'DJALË (MALE)' : 'VAJZË (FEMALE)';
      systemPrompt += `\n\nKRITIKE GENDER: Përdoruesi është ${genderInfo}.`;
    }
    
    // Prepare conversation history for OpenAI (last 10 messages for context)
    const historyToSend = updatedHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: userMessage, // Just the user's message, not the whole context
        conversationHistory: historyToSend, // Proper conversation history
        systemPrompt: systemPrompt, // Clean system prompt
        file_urls: fileUrls // Image URLs for vision API
      });

      const aiResponse = typeof response === 'string' ? response : response.feedback || 'Faleminderit për pyetjen!';
      
      // Check AI response for crisis indicators too (in case AI detected something)
      if (detectCrisis(aiResponse) || detectCrisis(userMessage)) {
        setShowCrisisModal(true);
      }
      
      // Add AI response
      const aiMsg = { role: 'assistant', content: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setConversationHistory([...updatedHistory, { role: 'assistant', content: aiResponse }]);
      
      // Save AI response to chat history
      if (currentConversationId) {
        addMessageToConversation(currentConversationId, { role: 'assistant', content: aiResponse });
        setChatHistoryList(getRecentConversations(10));
      }

    } catch (error) {
      // Check if it's a limit/subscription error
      if (error.code === 'LIMIT_EXCEEDED' || error.code === 'SUBSCRIPTION_EXPIRED' || error.code === 'ADULT_CONTENT_BLOCKED') {
        setShowUpgradeModal(true);
        const errorMessage = error.code === 'LIMIT_EXCEEDED' 
          ? 'Keni arritur kufirin ditor. Përmirësoni planin për të vazhduar.'
          : error.code === 'ADULT_CONTENT_BLOCKED'
          ? 'Përmbajtja e rritur kërkon një abonim. Përmirësoni planin për të hyrë.'
          : 'Abonimi juaj ka skaduar. Përmirësoni planin për të vazhduar.';
        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, timestamp: new Date() }]);
        throw error; // Re-throw to be caught by handleSend
      }
      throw error;
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && selectedImages.length === 0) || isLoading || isLimitReached) return;

    // Check limit before sending
    const canProceed = await checkUsage();
    if (!canProceed || isLimitReached) {
      setShowLimitModal(true);
      return;
    }

    const userMessage = inputText.trim() || 'Shikoni këto foto';
    const imageUrls = selectedImages.map(img => img.dataUrl);
    
    // Clear input and images
    setInputText('');
    setSelectedImages([]);
    
    // Add user message with images
    const userMsg = { 
      role: 'user', 
      content: userMessage, 
      timestamp: new Date(),
      images: imageUrls.length > 0 ? imageUrls : undefined
    };
    setMessages(prev => [...prev, userMsg]);

    // Update conversation history
    const updatedHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(updatedHistory);

    // Save to chat history
    if (currentConversationId) {
      addMessageToConversation(currentConversationId, { role: 'user', content: userMessage });
    }
    trackFeatureUse('aiCoach', 'message');

    setIsLoading(true);

    try {
      await processMessage(userMessage, updatedHistory, imageUrls);
      // Refresh usage after successful message
      await checkUsage();
    } catch (error) {
      console.error('❌ Error processing:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Check if it's a screenshot limit error
      if (error.code === 'SCREENSHOT_LIMIT_REACHED') {
        setShowScreenshotLimitModal(true);
        const errorMessage = '📸 Ke përdorur 2 analiza screenshot falas! Përmirëso planin për analiza të pakufizuara. Me çmimin e një kafeje në muaj, unë analizoj çdo screenshot për ty! ☕💕';
        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, timestamp: new Date() }]);
      }
      // Check if it's a limit error
      else if (error.code === 'LIMIT_EXCEEDED') {
        setIsLimitReached(true);
        await checkUsage();
        setShowLimitModal(true);
        const errorMessage = '☕ Hej! E ke përfunduar dozën ditore të dashurisë! Me çmimin e një kafeje në muaj, mund të bisedosh me mua 24/7. Çfarë thua - love over latte? 💕';
        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, timestamp: new Date() }]);
      } else {
        const errorMessage = error.message || 'Më vjen keq, pati një gabim. Mund të provosh përsëri?';
        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, timestamp: new Date() }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col px-4 pt-2 pb-52 w-full max-w-full overflow-x-hidden" style={{ minHeight: 'calc(100vh - 60px)' }}>
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={() => setShowHistory(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 p-4 animate-slideInLeft overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Historia e Bisedave
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={startNewChat}
              className="w-full mb-4 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/50 rounded-xl text-purple-300 font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Bisedë e Re
            </button>

            {/* Chat History List */}
            <div className="space-y-2">
              {chatHistoryList.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">Nuk ka biseda të ruajtura</p>
              ) : (
                chatHistoryList.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`group p-3 rounded-xl cursor-pointer transition-all ${
                      conv.id === currentConversationId
                        ? 'bg-purple-500/20 border border-purple-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{conv.title}</h3>
                        <p className="text-slate-400 text-xs truncate mt-1">{conv.preview || 'Bisedë e re'}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(conv.updatedAt).toLocaleDateString('sq-AL')} • {conv.messageCount} mesazhe
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideInLeft {
              from { opacity: 0; transform: translateX(-100%); }
              to { opacity: 1; transform: translateX(0); }
            }
            .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            .animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
          `}</style>
        </div>
      )}

      <div className="text-center mb-6" style={{ position: 'relative', zIndex: 20 }}>
        <div className="flex items-center justify-between mb-2">
          {/* History Button */}
          <div className="flex-1 flex justify-start">
            <button
              onClick={() => {
                setChatHistoryList(getRecentConversations(10));
                setShowHistory(true);
              }}
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
              title="Historia e bisedave"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex-1">
            Biseda.Ai
          </h1>
          <div className="flex-1"></div>
        </div>
        
        {/* Category Selector */}
        <div className="flex flex-wrap justify-center gap-3 mt-4" style={{ zIndex: 20, position: 'relative' }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const CatIcon = cat.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Category clicked:', key);
                  if (selectedCategory !== key) {
                    setSelectedCategory(key);
                    // Update URL
                    const newUrl = `${window.location.pathname}?category=${key}`;
                    window.history.pushState({}, '', newUrl);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer touch-manipulation ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <CatIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {/* Show images if present */}
              {msg.images && msg.images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {msg.images.map((imgUrl, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={imgUrl}
                      alt={`Uploaded ${imgIdx + 1}`}
                      className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">
                {msg.role === 'assistant' && msg.content.includes('##') ? (
                  <div className="prose prose-invert max-w-none">
                    {msg.content.split('\n').map((line, idx) => {
                      if (line.startsWith('## ')) {
                        return <h3 key={idx} className="text-white font-bold mt-4 mb-2 text-base">{line.replace('## ', '')}</h3>;
                      } else if (line.startsWith('### ')) {
                        return <h4 key={idx} className="text-slate-300 font-semibold mt-3 mb-1 text-sm">{line.replace('### ', '')}</h4>;
                      } else if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <div key={idx} className="ml-4 mb-1">{line}</div>;
                      } else if (line.trim() === '') {
                        return <br key={idx} />;
                      } else {
                        return <p key={idx} className="mb-2">{line}</p>;
                      }
                    })}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div 
        className="fixed left-0 right-0 px-3 z-50"
        style={{ 
          bottom: '100px', // Above the navigation bar with extra space
          maxWidth: '100%'
        }}
      >
        <Card className="bg-slate-800/95 border-slate-700 backdrop-blur-md shadow-2xl shadow-black/50 max-w-4xl mx-auto">
          <div className="p-3">
            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-blue-500"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              
              {/* Upload button with screenshot count */}
              <div className="relative">
                <Button
                  onClick={() => {
                    if (screenshotUsage.remaining === 0 && usage?.tier === 'free') {
                      setShowScreenshotLimitModal(true);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`px-4 py-3 rounded-lg h-auto self-end ${
                    screenshotUsage.remaining === 0 && usage?.tier === 'free'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } text-white`}
                  disabled={isLoading || selectedImages.length >= 4}
                  title={screenshotUsage.remaining > 0 ? `${screenshotUsage.remaining} analiza falas mbetur` : 'Përmirëso për analiza screenshot'}
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                {/* Badge showing remaining free analyses */}
                {usage?.tier === 'free' && screenshotUsage.remaining >= 0 && (
                  <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                    screenshotUsage.remaining === 0 
                      ? 'bg-red-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {screenshotUsage.remaining}
                  </span>
                )}
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isLimitReached ? "☕ Skip the coffee, get unlimited love! Tap upgrade 💕" : "Shkruaj mesazhin tënd këtu..."}
                className={`flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border resize-none min-h-[60px] max-h-[120px] ${isLimitReached ? 'border-red-500/50 opacity-60' : 'border-slate-600 focus:outline-none focus:border-blue-500'}`}
                rows={2}
                disabled={isLoading || isLimitReached}
                inputMode="text"
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                style={{
                  WebkitAppearance: 'none',
                  WebkitUserSelect: 'text',
                  appearance: 'none'
                }}
              />
              <Button
                onClick={handleSend}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg h-auto self-end disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={(!inputText.trim() && selectedImages.length === 0) || isLoading || isLimitReached}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {/* Helper text - hidden on mobile */}
          </div>
        </Card>
      </div>

      {/* Crisis Helpline Modal */}
      <CrisisHelplineModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      {/* Limit Reached Notification Modal */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          setShowUpgradeModal(true);
        }}
      />

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        onSelectPlan={(plan) => {
          // Plan selection is handled inside UpgradeModal
          setShowUpgradeModal(false);
        }}
      />

      {/* Screenshot Limit Modal */}
      {showScreenshotLimitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800 border-purple-500/50 max-w-md w-full">
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <ImageIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">📸 Analiza Screenshot</h2>
                <p className="text-slate-300 text-sm mb-4">
                  Ke përdorur <span className="text-pink-400 font-bold">2 analiza falas</span>!
                </p>
                <p className="text-slate-400 text-xs">
                  Me çmimin e një kafeje në muaj, unë analizoj screenshot-et e tua, 
                  të ndihmoj me përgjigjet perfekte, dhe të bëhem wing-man-i yt personal! ☕💕
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">Çfarë mund të analizoj?</h3>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Chat screenshot - të jap përgjigje perfekte
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Profile dating - të ndihmoj ta optimizosh
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Mesazhe konfuze - t'i deshifroj për ty
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Situata sociale - të jap këshilla
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    setShowScreenshotLimitModal(false);
                    setShowUpgradeModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold h-12 flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-5 h-5" />
                  Përmirëso për Analiza të Pakufizuara
                </Button>
                <Button
                  onClick={() => setShowScreenshotLimitModal(false)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white h-11"
                >
                  Vazhdo pa foto
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

