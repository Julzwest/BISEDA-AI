import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, MessageSquare, Image as ImageIcon, X, History, Plus, Trash2, ChevronRight, Zap, Heart, Lock, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import UsageDisplay from '@/components/UsageDisplay';
import UpgradeModal from '@/components/UpgradeModal';
import LimitReachedModal from '@/components/LimitReachedModal';
import CrisisHelplineModal from '@/components/CrisisHelplineModal';
import AdultVerificationModal from '@/components/AdultVerificationModal';
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

// Categories with system prompt only - greeting is handled separately with translations
// Note: Intimacy Coach has been moved to its own separate page (IntimacyCoach.jsx)
const getCategoriesConfig = () => ({
  'chat': {
    name: 'Dating Buddy 💬',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-600',
    systemPrompt: UNIFIED_AI_SYSTEM_PROMPT + `

MODO I FUNKSIONIMIT - DATING BUDDY:
Ti je "Dating Buddy" - shoku/shoqja më e mirë për dating! Bisedo me përdoruesin si shok i ngushtë që jep këshilla për dating. Në këtë modalitet:
- Ti je shoku/shoqja që gjithmonë di çfarë të thuash
- Fol natyrshëm, me humor dhe energji pozitive
- Jep këshilla praktike dhe të thjeshta për tu zbatuar
- Je mbështetës dhe i/e sinqertë - si shoku më i mirë që ka
- Përgjigjet e tua duhet të jenë natyrale, si një bisedë reale me një coach ekspert

⚠️ KRITIKE - KUFIZIMET E AI COACH:
Nëse përdoruesi pyet për tema intime, seksuale, ose dhomë gjumi (si orgazëm, seks, kënaqësi seksuale, etj):
- NUK duhet të japësh këshilla për intimitet/dhomë gjumi
- THUAJ: "For intimate and bedroom guidance, check out our Intimacy Coach feature on the home page - available with Pro or Elite membership."
- RIDREJTO te Intimacy Coach për këto tema`
  }
});

export default function Chat() {
  const { t, i18n } = useTranslation();
  const CATEGORIES = getCategoriesConfig();
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
  // Everything is FREE - unlimited screenshots!
  const [screenshotUsage, setScreenshotUsage] = useState({ used: 0, limit: 999, remaining: 999, isPaidUser: true });
  const [showScreenshotLimitModal, setShowScreenshotLimitModal] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistoryList, setChatHistoryList] = useState([]);
  // CRITICAL: Store last image analysis context for follow-up questions
  // This ensures AI remembers screenshot content when user asks follow-ups like "what shall I say"
  const [lastImageContext, setLastImageContext] = useState({
    hasImage: false,
    userMessage: '',      // What user said when uploading
    aiAnalysis: '',       // AI's analysis of the image
    timestamp: null       // When the image was uploaded
  });
  // Adult verification for intimacy coach
  const [showAdultVerificationModal, setShowAdultVerificationModal] = useState(false);
  const [pendingCategorySwitch, setPendingCategorySwitch] = useState(null);
  // Track subscription tier for reactive updates
  const [subscriptionTier, setSubscriptionTier] = useState(localStorage.getItem('userSubscriptionTier') || '');
  const backendUrl = getBackendUrl();
  
  // Listen for subscription tier changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newTier = localStorage.getItem('userSubscriptionTier') || '';
      if (newTier !== subscriptionTier) {
        console.log('📊 Subscription tier updated:', newTier);
        setSubscriptionTier(newTier);
      }
    };
    
    // Check for tier changes every 5 seconds (in case localStorage is updated by other components)
    const interval = setInterval(handleStorageChange, 5000);
    
    // Also listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [subscriptionTier]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const category = CATEGORIES[selectedCategory];
  if (!category) {
    return null;
  }
  const CategoryIcon = category.icon;

  // Reset and initialize when category changes
  React.useEffect(() => {
    const greeting = t('chat.welcome');
    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    // Initialize conversation history with greeting
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    // Reset image context completely when category changes
    setLastImageContext({ hasImage: false, userMessage: '', aiAnalysis: '', timestamp: null });
    setIsInitialized(true);

    // Start a new conversation for chat history
    const convId = startNewConversation('Dating Buddy');
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
    const greeting = t('chat.welcome');
    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    // Reset image context completely when starting new chat
    setLastImageContext({ hasImage: false, userMessage: '', aiAnalysis: '', timestamp: null });

    const convId = startNewConversation('Dating Buddy');
    setCurrentConversationId(convId);
    addMessageToConversation(convId, { role: 'assistant', content: greeting });
    setChatHistoryList(getRecentConversations(10));
    setShowHistory(false);
  };

  // Check if adult content is verified
  const isAdultContentVerified = () => {
    return localStorage.getItem('adultContentVerified') === 'true';
  };

  // Check if user has paid subscription (any paid tier)
  // 🎉 EVERYTHING IS FREE NOW!
  const hasPaidSubscription = () => {
    return true; // All features are free!
  };

  // Check if user has Pro or Elite subscription (for premium features like Intimacy Coach)
  // 🎉 EVERYTHING IS FREE NOW!
  const hasProOrEliteSubscription = () => {
    return true; // All features are free!
  };

  // Handle category switch with verification
  const handleCategorySwitch = async (newCategory) => {
    const categoryConfig = CATEGORIES[newCategory];
    
    // Check if category requires adult verification
    if (categoryConfig?.requiresAdultVerification && !isAdultContentVerified()) {
      setPendingCategorySwitch(newCategory);
      setShowAdultVerificationModal(true);
      return;
    }
    
    // For Pro/Elite features, fetch latest tier from backend first
    if (categoryConfig?.requiresProOrElite) {
      try {
        const userId = localStorage.getItem('userId');
        const headers = userId ? { 'x-user-id': userId } : {};
        const response = await fetch(`${backendUrl}/api/usage`, { headers });
        if (response.ok) {
          const data = await response.json();
          if (data.tier) {
            localStorage.setItem('userSubscriptionTier', data.tier);
            setSubscriptionTier(data.tier);
            console.log('🔄 Fetched latest tier from backend:', data.tier);
            
            // Check with fresh tier
            const freshTier = data.tier.toLowerCase();
            if (!['pro', 'elite', 'premium'].includes(freshTier)) {
              setShowUpgradeModal(true);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching tier:', error);
        // Fall back to local check
        if (!hasProOrEliteSubscription()) {
          setShowUpgradeModal(true);
          return;
        }
      }
    }
    
    // Check if category requires any paid plan
    if (categoryConfig?.requiresPaidPlan && !hasPaidSubscription()) {
      setShowUpgradeModal(true);
      return;
    }
    
    // Switch category
    switchToCategory(newCategory);
  };

  // Actually switch to a category
  const switchToCategory = (newCategory) => {
    setSelectedCategory(newCategory);
    const newUrl = `${window.location.pathname}?category=${newCategory}`;
    window.history.pushState({}, '', newUrl);

    // Reset chat for new category
    const greeting = t('chat.welcome');
    const greetingMessage = { role: 'assistant', content: greeting, timestamp: new Date() };
    setMessages([greetingMessage]);
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    setLastImageContext({ hasImage: false, userMessage: '', aiAnalysis: '', timestamp: null });

    const convId = startNewConversation('Dating Buddy');
    setCurrentConversationId(convId);
    addMessageToConversation(convId, { role: 'assistant', content: greeting });
    setChatHistoryList(getRecentConversations(10));
  };

  // Handle adult verification confirmed
  const handleAdultVerificationConfirmed = async () => {
    setShowAdultVerificationModal(false);
    if (pendingCategorySwitch) {
      const categoryConfig = CATEGORIES[pendingCategorySwitch];
      
      // For Pro/Elite features, fetch latest tier from backend first (same as category switch)
      if (categoryConfig?.requiresProOrElite) {
        try {
          const userId = localStorage.getItem('userId');
          const headers = userId ? { 'x-user-id': userId } : {};
          const response = await fetch(`${backendUrl}/api/usage`, { headers });
          if (response.ok) {
            const data = await response.json();
            if (data.tier) {
              localStorage.setItem('userSubscriptionTier', data.tier);
              setSubscriptionTier(data.tier);
              console.log('🔄 [After Adult Verification] Fetched latest tier from backend:', data.tier);
              
              // Check with fresh tier
              const freshTier = data.tier.toLowerCase();
              if (!['pro', 'elite', 'premium'].includes(freshTier)) {
                console.log('❌ [After Adult Verification] Tier check failed:', freshTier);
                setShowUpgradeModal(true);
                setPendingCategorySwitch(null);
                return;
              } else {
                console.log('✅ [After Adult Verification] Tier check passed:', freshTier);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching tier after verification:', error);
          // Fall back to local check
          if (!hasProOrEliteSubscription()) {
            setShowUpgradeModal(true);
            setPendingCategorySwitch(null);
            return;
          }
        }
      }
      
      // Check if category requires any paid plan
      if (categoryConfig?.requiresPaidPlan && !hasPaidSubscription()) {
        setShowUpgradeModal(true);
        setPendingCategorySwitch(null);
        return;
      }
      
      switchToCategory(pendingCategorySwitch);
      setPendingCategorySwitch(null);
    }
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

  // Check usage on mount to get correct screenshot limits
  React.useEffect(() => {
    checkUsage();
  }, []);

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
      // Get logged-in user's ID from localStorage
      const userId = localStorage.getItem('userId');
      
      const headers = {};
      if (userId) {
        headers['x-user-id'] = userId;
      }
      
      const response = await fetch(`${backendUrl}/api/usage`, { headers });
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
        
        // Update screenshot usage
        if (data.screenshotAnalyses) {
          setScreenshotUsage(data.screenshotAnalyses);
        }
        
        // Everything is FREE - no limits!
        setIsLimitReached(false);
        return true;
      }
    } catch (error) {
      console.error('Error checking usage:', error);
    }
    return true; // Allow if check fails
  };

  // Detect if message is about intimacy/bedroom topics
  const isIntimacyQuestion = (message) => {
    const intimacyKeywords = [
      // English
      'sex', 'sexual', 'orgasm', 'orgasms', 'bedroom', 'foreplay', 'erotic', 'arousal', 'aroused',
      'intimate', 'intimacy', 'pleasure', 'pleasuring', 'turn on', 'turn her on', 'turn him on',
      'make love', 'making love', 'climax', 'erogenous', 'sensual', 'seduction', 'seduce',
      'virgin', 'virginity', 'first time sex', 'losing virginity', 'dom', 'dominant', 'submissive',
      'bdsm', 'kink', 'kinky', 'fetish', 'oral', 'blowjob', 'cunnilingus', 'fingering',
      'masturbat', 'vibrator', 'dildo', 'sex toy', 'nipple', 'clitoris', 'g-spot', 'g spot',
      'penis', 'vagina', 'anal', 'butt', 'ass ', 'boobs', 'breasts', 'naked', 'nude',
      'horny', 'cum', 'ejaculat', 'moan', 'thrust', 'penetrat', 'condom', 'lube', 'lubricant',
      'sex position', 'missionary', 'doggy', 'cowgirl', 'reverse cowgirl', '69', 'sixty nine',
      'give her an orgasm', 'make her cum', 'make him cum', 'satisfy her', 'satisfy him',
      'better in bed', 'good in bed', 'last longer', 'premature', 'erectile', 'libido',
      // Albanian
      'seks', 'seksual', 'orgazëm', 'orgazma', 'dhomë gjumi', 'erotik', 'intim', 'intimitet',
      'kënaqësi', 'kënaq', 'josh', 'joshje', 'virgin', 'virgjëri', 'dominues', 'nënshtrues',
      'lakuriq', 'nudo', 'gjoks', 'penis', 'vagina', 'anale', 'masturbim'
    ];
    
    const lowerMessage = message.toLowerCase();
    return intimacyKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const processMessage = async (userMessage, updatedHistory, fileUrls = []) => {

    // Check for crisis indicators BEFORE processing
    if (detectCrisis(userMessage)) {
      setShowCrisisModal(true);
      // Still process the message but AI will respond with support
    }
    
    // ============================================================
    // INTIMACY DETECTION: Redirect to Intimacy Coach for bedroom topics
    // ============================================================
    if (isIntimacyQuestion(userMessage)) {
      const upgradeMessage = t('chat.intimacyUpgrade',
        "🔒 **Intimacy & Bedroom Questions**\n\nI noticed you're asking about intimate/bedroom topics. For professional guidance on intimacy, sexual wellness, and bedroom advice, check out our **Intimacy Coach** feature from the home page!\n\n💕 **Intimacy Coach includes:**\n• Step-by-step guidance for pleasuring your partner\n• First-time intimacy advice\n• Communication tips for the bedroom\n• Professional sex education\n\n*Available with Pro or Elite membership*\n\n👉 Go to Home > Intimacy Coach"
      );
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: upgradeMessage, 
        timestamp: new Date(),
        isUpgradePrompt: true 
      }]);
      
      // Add to conversation history
      addMessageToConversation(currentConversationId, { role: 'assistant', content: upgradeMessage });
      setConversationHistory(prev => [...prev, { role: 'assistant', content: upgradeMessage }]);
      setChatHistoryList(getRecentConversations(10));
      setIsLoading(false);
      return; // Don't process further
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
    
    // ============================================================
    // CRITICAL: IMAGE CONTEXT HANDLING FOR FOLLOW-UP QUESTIONS
    // This ensures when user uploads a screenshot and asks "what shall I say",
    // the AI remembers what was in the screenshot
    // ============================================================
    let enhancedPrompt = userMessage;
    let enhancedSystemPrompt = systemPrompt;
    
    // Check if there's previous image context AND no new images being sent
    if (lastImageContext.hasImage && fileUrls.length === 0) {
      // ALWAYS inject the image context into the prompt for follow-ups
      enhancedPrompt = `
=== IMPORTANT SCREENSHOT CONTEXT ===
The user previously uploaded a screenshot of a conversation.
User's original message with the screenshot: "${lastImageContext.userMessage}"
Your analysis of that screenshot: "${lastImageContext.aiAnalysis}"
=== END CONTEXT ===

The user is now asking a FOLLOW-UP QUESTION about that same screenshot conversation.
Their follow-up question is: "${userMessage}"

IMPORTANT: Your response MUST be directly related to the screenshot conversation the user shared. 
If they ask "what shall I say" or similar, give them specific reply suggestions based on the conversation in that screenshot.
Do NOT give generic advice - reference the SPECIFIC conversation they showed you.`;

      // Also add reminder to system prompt
      enhancedSystemPrompt += `\n\nCRITICAL REMINDER: The user has shared a screenshot of a conversation earlier in this chat. All their follow-up questions relate to that screenshot. Always reference the specific conversation they shared when giving advice.`;
    }
    
    // Prepare conversation history for OpenAI (last 10 messages for context)
    const historyToSend = updatedHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: enhancedPrompt, // Include image context if available
        conversationHistory: historyToSend, // Proper conversation history
        systemPrompt: enhancedSystemPrompt, // Clean system prompt with image context reminder
        file_urls: fileUrls // Image URLs for vision API
      });

      const aiResponse = typeof response === 'string' ? response : response.feedback || 'Faleminderit për pyetjen!';
      
      // ============================================================
      // CRITICAL: SAVE IMAGE CONTEXT FOR FUTURE FOLLOW-UPS
      // When user uploads image, store everything needed for follow-up context
      // ============================================================
      if (fileUrls.length > 0) {
        setLastImageContext({
          hasImage: true,
          userMessage: userMessage, // Store what user said when uploading
          aiAnalysis: aiResponse.substring(0, 1000), // Store AI's analysis (first 1000 chars)
          timestamp: new Date()
        });
        console.log('📸 Image context saved for follow-up questions');
      }
      
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
      
      // Check if it's an image analysis feature not available error
      if (error.code === 'FEATURE_NOT_AVAILABLE') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: t('chat.imageAnalysisNotAvailable'),
          timestamp: new Date(),
          showUpgradeButton: true
        }]);
      }
      // Check if it's a screenshot limit error
      else if (error.code === 'SCREENSHOT_LIMIT_REACHED') {
        setShowScreenshotLimitModal(true);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: t('chat.screenshotLimitReached'),
          timestamp: new Date(),
          showUpgradeButton: true
        }]);
      }
      // Check if it's a limit error
      else if (error.code === 'LIMIT_EXCEEDED') {
        setIsLimitReached(true);
        await checkUsage();
        setShowLimitModal(true);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: t('chat.dailyLimitReached'),
          timestamp: new Date(),
          showUpgradeButton: true
        }]);
      } else {
        const errorMessage = error.message || t('common.error');
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
    <div className="flex flex-col px-4 pt-4 pb-4 w-full max-w-full overflow-x-hidden" style={{ minHeight: 'calc(100vh - 60px)' }}>
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
                {t('chat.history')}
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
              title={t('chat.history')}
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
            const isLocked = (cat.requiresProOrElite && !hasProOrEliteSubscription()) || 
                             (cat.requiresPaidPlan && !hasPaidSubscription());
            const isIntimacy = key === 'intimacy';
            return (
              <button
                key={key}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (selectedCategory !== key) {
                    handleCategorySwitch(key);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer touch-manipulation ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : isIntimacy
                    ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 hover:from-pink-500/30 hover:to-rose-500/30 border border-pink-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <CatIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{cat.name}</span>
                {isIntimacy && (
                  <span className="flex items-center gap-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                    <Crown className="w-2.5 h-2.5" />
                    PRO
                  </span>
                )}
                {isLocked && !isIntimacy && <Lock className="w-3 h-3 ml-1 opacity-70" />}
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
              {/* Show Upgrade Button when needed */}
              {msg.showUpgradeButton && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-lg shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {t('home.upgrade')}
                </button>
              )}
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
            
            {/* Screenshot Usage Counter - Clean display above input */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Screenshot analyses
              </span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✨ Unlimited
              </span>
            </div>

            {/* Main Input Area - Clean container */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3">
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
              
              {/* Input row with buttons */}
              <div className="flex items-end gap-2">
                {/* Upload Screenshot Button - Unlimited! */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 p-3 rounded-lg transition-all bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                  disabled={isLoading || selectedImages.length >= 4}
                  title="Upload screenshot (Unlimited!)"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                
                {/* Message Input */}
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLimitReached ? t('upgrade.limitReached') : t('chat.placeholder')}
                  className={`flex-1 bg-slate-900/50 text-white px-4 py-3 rounded-lg border resize-none min-h-[48px] max-h-[120px] ${
                    isLimitReached 
                      ? 'border-red-500/50 opacity-60' 
                      : 'border-slate-700/50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                  }`}
                  rows={1}
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
                
                {/* Send Button */}
                <button
                  onClick={handleSend}
                  className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                  disabled={(!inputText.trim() && selectedImages.length === 0) || isLoading || isLimitReached}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
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

      {/* Adult Verification Modal for Intimacy Coach */}
      <AdultVerificationModal
        isOpen={showAdultVerificationModal}
        onClose={() => {
          setShowAdultVerificationModal(false);
          setPendingCategorySwitch(null);
        }}
        onConfirm={handleAdultVerificationConfirmed}
      />
    </div>
  );
}

