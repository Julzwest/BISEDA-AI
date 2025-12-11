import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, User, Heart, Send, RefreshCw, Star, 
  Trophy, AlertCircle, Sparkles, Users, Home, Coffee,
  ArrowLeft, CheckCircle, XCircle, Lock, Crown, Target
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

// ============================================================
// 🔒 HARDCODED: Robust API call with retry logic
// This ensures the roleplay ALWAYS works reliably
// ============================================================
const callAIWithRetry = async (prompt, maxRetries = 3) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎭 API Call attempt ${attempt}/${maxRetries}`);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });
      
      // Validate response
      if (response && typeof response === 'string' && response.trim().length > 0) {
        console.log(`✅ API Call successful on attempt ${attempt}`);
        return response;
      }
      
      // If response is an object, extract text
      if (response && typeof response === 'object') {
        const text = response.feedback || response.text || response.content || response.message;
        if (text && text.trim().length > 0) {
          console.log(`✅ API Call successful on attempt ${attempt}`);
          return text;
        }
      }
      
      throw new Error('Empty or invalid response from API');
      
    } catch (error) {
      console.error(`❌ API Call attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // All retries failed
  console.error(`❌ All ${maxRetries} API attempts failed`);
  throw lastError || new Error('API call failed after all retries');
};

export default function DateRehearsal() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [dateName, setDateName] = useState('');
  const [partnerName, setPartnerName] = useState(''); // Partner's name for meeting parents scenario
  const [personGender, setPersonGender] = useState(null); // Gender of the person in roleplay
  const [datePersonality, setDatePersonality] = useState(null); // No default - user must choose
  const [selectedIntention, setSelectedIntention] = useState(null); // No default - user must choose
  const [setupStep, setSetupStep] = useState(1); // 1: scenario, 2: name, 3: gender, 4: personality, 5: intention
  const [selectedScenarioId, setSelectedScenarioId] = useState(null); // Track selected scenario before starting
  const [hasAccess, setHasAccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([]); // Suggested replies for user
  const messagesEndRef = useRef(null);

  // Check if user has Pro or Elite subscription
  const checkAccess = () => {
    const tier = (localStorage.getItem('userSubscriptionTier') || '').toLowerCase();
    return ['pro', 'elite', 'premium'].includes(tier);
  };

  useEffect(() => {
    const access = checkAccess();
    setHasAccess(access);
    if (!access) {
      setShowUpgradeModal(true);
    }
  }, []);
  
  const currentLang = i18n.language || 'en';
  const isAlbanian = currentLang === 'sq' || currentLang.startsWith('sq');
  const userGender = localStorage.getItem('userGender') || 'male';
  const userName = localStorage.getItem('userName') || 'there'; // Get user's actual name

  const scenarios = [
    {
      id: 'first_date',
      icon: Coffee,
      title: t('rehearsal.firstDate', 'First Date'),
      description: t('rehearsal.firstDateDesc', 'Practice conversation at a coffee shop'),
      color: 'from-pink-500 to-rose-600',
      emoji: '☕',
      setting: 'on a first date at a coffee shop',
      roleType: 'date' // AI plays as a date
    },
    {
      id: 'approaching',
      icon: Users,
      title: t('rehearsal.approaching', 'Approaching Someone'),
      description: t('rehearsal.approachingDesc', 'Practice starting a conversation'),
      color: 'from-purple-500 to-indigo-600',
      emoji: '👋',
      setting: 'at a bar or party, someone is approaching you',
      roleType: 'stranger' // AI plays as a stranger
    },
    {
      id: 'meet_parents',
      icon: Home,
      title: t('rehearsal.meetParents', 'Meeting the Parents'),
      description: t('rehearsal.meetParentsDesc', 'Practice making a good impression'),
      color: 'from-blue-500 to-cyan-600',
      emoji: '👨‍👩‍👧',
      setting: "meeting your partner's parents for the first time at their home",
      roleType: 'parent' // AI plays as a parent
    },
    {
      id: 'difficult_convo',
      icon: AlertCircle,
      title: t('rehearsal.difficultConvo', 'Difficult Conversation'),
      description: t('rehearsal.difficultConvoDesc', 'Practice handling tough topics'),
      color: 'from-amber-500 to-orange-600',
      emoji: '💬',
      setting: 'having a serious relationship conversation with your partner',
      roleType: 'partner' // AI plays as existing partner
    },
    {
      id: 'reconnecting',
      icon: Heart,
      title: t('rehearsal.reconnecting', 'Reconnecting'),
      description: t('rehearsal.reconnectingDesc', 'Practice reaching out to an ex or old flame'),
      color: 'from-red-500 to-pink-600',
      emoji: '💕',
      setting: 'reconnecting with someone from your past who you run into unexpectedly',
      roleType: 'ex' // AI plays as an ex
    }
  ];

  // More personality options
  const personalities = [
    { id: 'friendly', label: t('rehearsal.friendly', 'Friendly & Open'), emoji: '😊' },
    { id: 'shy', label: t('rehearsal.shy', 'Shy & Reserved'), emoji: '😳' },
    { id: 'confident', label: t('rehearsal.confident', 'Confident & Flirty'), emoji: '😏' },
    { id: 'challenging', label: t('rehearsal.challenging', 'Playing Hard to Get'), emoji: '🤔' },
    { id: 'sarcastic', label: t('rehearsal.sarcastic', 'Sarcastic & Witty'), emoji: '😜' },
    { id: 'serious', label: t('rehearsal.serious', 'Serious & Traditional'), emoji: '🧐' },
    { id: 'protective', label: t('rehearsal.protective', 'Protective & Skeptical'), emoji: '🤨' },
    { id: 'warm', label: t('rehearsal.warm', 'Warm & Welcoming'), emoji: '🥰' },
  ];

  // Intentions/Goals
  const intentions = [
    { id: 'impress', label: t('rehearsal.intentImpress', 'Make a great impression'), emoji: '⭐' },
    { id: 'connect', label: t('rehearsal.intentConnect', 'Build a genuine connection'), emoji: '💕' },
    { id: 'fun', label: t('rehearsal.intentFun', 'Have fun & be playful'), emoji: '🎉' },
    { id: 'serious', label: t('rehearsal.intentSerious', 'Show serious intentions'), emoji: '💍' },
    { id: 'approval', label: t('rehearsal.intentApproval', 'Win their approval'), emoji: '✅' },
    { id: 'closure', label: t('rehearsal.intentClosure', 'Get closure or clarity'), emoji: '🔮' },
    { id: 'friends', label: t('rehearsal.intentFriends', 'Just be friends'), emoji: '🤝' },
    { id: 'flirty', label: t('rehearsal.intentFlirty', 'Be flirty & charming'), emoji: '😏' },
    { id: 'confident', label: t('rehearsal.intentConfident', 'Build my confidence'), emoji: '💪' },
    { id: 'getNumber', label: t('rehearsal.intentGetNumber', 'Get their number'), emoji: '📱' },
    { id: 'secondDate', label: t('rehearsal.intentSecondDate', 'Secure a second date'), emoji: '📅' },
    { id: 'reconcile', label: t('rehearsal.intentReconcile', 'Reconcile the relationship'), emoji: '🕊️' },
  ];

  // Gender options for roleplay
  const genderOptions = [
    { id: 'female', label: t('rehearsal.genderFemale', 'Woman'), emoji: '👩' },
    { id: 'male', label: t('rehearsal.genderMale', 'Man'), emoji: '👨' },
    { id: 'nonbinary', label: t('rehearsal.genderNonbinary', 'Non-binary'), emoji: '🧑' },
  ];

  // Get gender label based on scenario
  const getGenderLabel = () => {
    const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);
    if (!selectedScenario) return t('rehearsal.theirGender', "Their gender");
    
    switch (selectedScenario.roleType) {
      case 'parent':
        return t('rehearsal.parentGender', "Parent's gender");
      case 'partner':
        return t('rehearsal.partnerGender', "Partner's gender");
      case 'ex':
        return t('rehearsal.exGender', "Their gender");
      case 'stranger':
        return t('rehearsal.strangerGender', "Their gender");
      default:
        return t('rehearsal.dateGender', "Date's gender");
    }
  };

  // Get dynamic name label based on scenario
  const getNameLabel = () => {
    const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);
    if (!selectedScenario) return t('rehearsal.personName', "Person's name");
    
    switch (selectedScenario.roleType) {
      case 'parent':
        return t('rehearsal.parentName', "Parent's name");
      case 'partner':
        return t('rehearsal.partnerName', "Partner's name");
      case 'ex':
        return t('rehearsal.exName', "Their name");
      case 'stranger':
        return t('rehearsal.strangerName', "Their name");
      default:
        return t('rehearsal.dateName', "Date's name");
    }
  };

  // Get name placeholder based on scenario
  const getNamePlaceholder = () => {
    const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);
    if (!selectedScenario) return t('rehearsal.enterName', "Enter a name...");
    
    switch (selectedScenario.roleType) {
      case 'parent':
        return t('rehearsal.enterParentName', "e.g. John, Mary...");
      case 'partner':
        return t('rehearsal.enterPartnerName', "Enter their name...");
      default:
        return t('rehearsal.enterName', "Enter a name...");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get role description based on scenario type
  // Determine relationship type based on user's gender preference
  const getPartnerRelationship = () => {
    // Check if user specified their partner's gender or assume from their own gender
    const partnerGenderHint = localStorage.getItem('partnerGender');
    if (partnerGenderHint) {
      return partnerGenderHint === 'male' ? 'son' : 'daughter';
    }
    // Default: opposite gender relationship, but parent should be accepting either way
    return userGender === 'male' ? 'daughter' : 'son';
  };

  const getRoleDescription = (selectedScenario, personality) => {
    // Use selected gender for the roleplay character
    const genderLabel = personGender === 'female' ? 'woman' : personGender === 'male' ? 'man' : 'person';
    const genderPronoun = personGender === 'female' ? 'she/her' : personGender === 'male' ? 'he/him' : 'they/them';
    const parentType = personGender === 'female' ? 'mother' : personGender === 'male' ? 'father' : 'parent';
    const childRelation = getPartnerRelationship();
    const partnerDisplay = partnerName || 'my child';
    
    switch (selectedScenario.roleType) {
      case 'parent':
        return `You are ${dateName}, ${partnerDisplay}'s ${parentType}. You are a ${personality?.label} ${parentType} (${genderLabel}, ${genderPronoun}) meeting your ${childRelation}'s partner (${userName}) for the first time.

IMPORTANT CHARACTER TRAITS:
- You are OPEN-MINDED and ACCEPTING of all relationships (straight, gay, lesbian, bisexual - love is love!)
- You have REAL KNOWLEDGE about many professions: tech, medicine, law, trades, arts, sports, business, education, etc.
- You know about sports: football, basketball, tennis, golf, MMA, boxing, swimming, running, cycling, etc.
- You use casual language and slang sometimes - "that's awesome!", "no way!", "oh lovely!", "brilliant!"
- You're genuinely curious and NEVER repeat the same questions
- You share your own stories and experiences to keep conversation flowing
- You remember what ${userName} tells you and build on it
- You speak and act naturally as a ${genderLabel} ${parentType} would

CONVERSATION STYLE:
- Ask varied questions: about hobbies, family, how they met ${partnerDisplay}, travel, food, movies, music
- React genuinely to answers - if they say something interesting, show enthusiasm!
- Share relevant stories: "Oh my nephew works in tech too!", "I used to play tennis back in the day!"
- If nervous silence, help by sharing something about yourself or ${partnerDisplay}
- Be warm but also protective of your child - you want to know ${userName} is a good person`;
      case 'stranger':
        return `You are ${dateName}, a ${personality?.label} ${genderLabel} (${genderPronoun}) at a bar/party. Someone attractive (${userName}) is approaching you.

PERSONALITY: Be realistic and natural as a ${genderLabel}. Use casual language. React based on your personality - if shy, be a bit nervous but interested. If confident, be flirty and engaging. Speak naturally as a ${genderLabel} would.`;
      case 'partner':
        return `You are ${dateName}, ${userName}'s partner. You are a ${personality?.label} ${genderLabel} (${genderPronoun}) having an important relationship conversation.

Be emotionally realistic as a ${genderLabel}. Express feelings, concerns, hopes. Listen and respond to what ${userName} says.`;
      case 'ex':
        return `You are ${dateName}, ${userName}'s ex. You're a ${personality?.label} ${genderLabel} (${genderPronoun}). You've bumped into each other unexpectedly.

Mixed emotions - surprise, maybe some old feelings, possibly awkwardness. React naturally as a ${genderLabel} would to whatever ${userName} says.`;
      default:
        return `You are ${dateName}, a ${personality?.label} ${genderLabel} (${genderPronoun}) on a first date with ${userName} at a coffee shop. Be natural, curious, and engaging! Speak naturally as a ${genderLabel} would.`;
    }
  };

  const getScenarioOpener = (selectedScenario) => {
    const partnerDisplay = partnerName || 'my child';
    
    switch (selectedScenario.roleType) {
      case 'parent':
        return `${userName} has just arrived at your home with ${partnerDisplay}. Open the door warmly.

Start with a warm greeting like: "Oh hello! You must be ${userName}! Come in, come in! ${partnerDisplay} has told us so much about you! How was the drive over?"

Then naturally transition - offer a drink, invite them to sit, maybe compliment something about them.`;
      case 'stranger':
        return `You're at a bar/party and ${userName} is walking toward you. React naturally - maybe smile, maybe look intrigued.`;
      case 'partner':
        return `You and ${userName} need to have an important conversation. Start by bringing up what's been on your mind.`;
      case 'ex':
        return `You've just spotted ${userName} unexpectedly. Make eye contact and react - surprise, awkwardness, or whatever fits.`;
      default:
        return `You've just sat down at the coffee shop for a first date with ${userName}. Start the conversation naturally - maybe compliment them or ask about their day.`;
    }
  };

  const startScenario = async (selectedScenario) => {
    if (!dateName.trim()) return;
    
    setScenario(selectedScenario);
    setMessages([]);
    setFeedback(null);
    setShowFeedback(false);
    setIsLoading(true);

    try {
      const langInstruction = isAlbanian ? 'Përgjigju në shqip.' : `Respond in ${currentLang === 'en' ? 'English' : currentLang}.`;
      const personality = personalities.find(p => p.id === datePersonality);
      const intention = intentions.find(i => i.id === selectedIntention);
      const roleDescription = getRoleDescription(selectedScenario, personality);
      const scenarioOpener = getScenarioOpener(selectedScenario);
      
      console.log('🎭 Starting scenario:', { scenario: selectedScenario.id, name: dateName, personality: personality?.label });

      // 🔒 HARDCODED: Use retry helper for reliable API calls
      const prompt = `You are roleplaying in a practice conversation scenario. DO NOT break character.

YOUR ROLE: ${roleDescription}
YOUR NAME: ${dateName}
YOUR PERSONALITY: ${personality?.label} ${personality?.emoji}
SCENARIO: ${selectedScenario.setting}

The user wants to practice this situation. You ARE ${dateName}. Start the conversation naturally.

${scenarioOpener}

CRITICAL INSTRUCTIONS:
1. You ARE ${dateName} - a real ${selectedScenario.roleType === 'parent' ? 'parent' : 'person'}, NOT an AI assistant.
2. Stay completely in character.
3. Keep your response to 1-3 sentences maximum.
4. DO NOT say "How can I help you?" or anything like an AI assistant would say.
5. React naturally as ${dateName} would in this situation.

${langInstruction}

${dateName} says:`;

      const responseText = await callAIWithRetry(prompt, 3);
      console.log('🎭 Got opening response:', responseText);

      // Generate initial suggested replies
      const suggestions = generateSuggestedReplies(responseText, selectedScenario);
      setSuggestedReplies(suggestions);

      setMessages([{
        id: Date.now(),
        sender: 'date',
        text: responseText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error starting scenario:', error);
      // Provide scenario-specific fallback greeting
      const fallbackGreeting = getFallbackGreeting(selectedScenario);
      setMessages([{
        id: Date.now(),
        sender: 'date',
        text: fallbackGreeting,
        timestamp: new Date()
      }]);
    }
    setIsLoading(false);
  };

  // Fallback greetings when API fails - scenario-specific
  const getFallbackGreeting = (selectedScenario) => {
    const partnerDisplay = partnerName || 'my child';
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    switch (selectedScenario.roleType) {
      case 'parent':
        return pick([
          `Oh hello ${userName}! Come in, come in! ${partnerDisplay} has told us so much about you. Can I get you something to drink?`,
          `${userName}! So lovely to finally meet you! Please, make yourself at home. How was your journey here?`,
          `Well hello there! You must be ${userName}! ${partnerDisplay} didn't tell us you'd be so charming. Come in!`,
          `Hi ${userName}! Welcome to our home. ${partnerDisplay} is just finishing up - can I offer you some tea or coffee?`
        ]);
      case 'stranger':
        return pick([
          `Hey! I noticed you from across the room. I'm ${dateName}. What brings you here tonight?`,
          `Hi there! I don't think we've met. I'm ${dateName}. And you are?`,
          `*smiles* Hey! You looked like someone worth talking to. I'm ${dateName}.`,
          `Hello stranger! I'm ${dateName}. I couldn't help but come say hi.`
        ]);
      case 'partner':
        return pick([
          `${userName}, we need to talk about something. Do you have a moment?`,
          `Hey ${userName}... can we sit down? There's something on my mind.`,
          `${userName}, I've been thinking a lot lately. Can we chat?`,
          `Babe, I need to talk to you about something. It's important.`
        ]);
      case 'ex':
        return pick([
          `${userName}? Oh wow! I didn't expect to see you here. How have you been?`,
          `Wait... ${userName}? Is that really you? It's been so long!`,
          `${userName}! *surprised* I... wow. Hi. How are you?`,
          `Oh my god, ${userName}?! What are the chances? How've you been?`
        ]);
      default:
        return pick([
          `Hey ${userName}! It's so nice to finally meet you. I love this place, do you come here often?`,
          `Hi! You must be ${userName}! I'm ${dateName}. I was a little nervous, honestly. How are you?`,
          `${userName}! Great to meet you. I have to say, you look even better than your photos!`,
          `Hey there! I'm ${dateName}. So glad we could finally meet in person!`
        ]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message first
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    
    // Update messages with user message
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const langInstruction = isAlbanian ? 'Përgjigju në shqip.' : `Respond in ${currentLang === 'en' ? 'English' : currentLang}.`;
      const personality = personalities.find(p => p.id === datePersonality);
      const intention = intentions.find(i => i.id === selectedIntention);
      const roleDescription = getRoleDescription(scenario, personality);
      
      // Build conversation history INCLUDING the new user message
      const conversationHistory = updatedMessages.map(m => 
        `${m.sender === 'user' ? 'You (user)' : dateName}: ${m.text}`
      ).join('\n');

      console.log('🎭 Sending roleplay message:', { scenario: scenario.id, personality: datePersonality, userMessage });

      // Extract questions already asked to avoid repetition
      const alreadyAsked = messages
        .filter(m => m.sender === 'date' && m.text.includes('?'))
        .map(m => m.text)
        .join(' | ');

      const partnerDisplay = partnerName || 'my child';

      // 🔒 HARDCODED: Build the prompt for OpenAI
      const prompt = `You are roleplaying in a practice conversation scenario. STAY COMPLETELY IN CHARACTER.

YOUR ROLE: ${roleDescription}
YOUR NAME: ${dateName}
YOUR PERSONALITY: ${personality?.label}
SCENARIO: ${scenario.setting}
USER'S GOAL: ${intention?.label}
${scenario.roleType === 'parent' ? `YOUR CHILD'S NAME: ${partnerDisplay}` : ''}

CONVERSATION SO FAR:
${conversationHistory}

QUESTIONS YOU'VE ALREADY ASKED (DO NOT REPEAT THESE):
${alreadyAsked || 'None yet'}

CRITICAL INSTRUCTIONS:
1. You ARE ${dateName}. Respond as them, NOT as an AI.
2. React GENUINELY to what ${userName} just said - show interest, surprise, happiness, concern as appropriate.
3. NEVER repeat a question you've already asked! Ask something NEW and different.
4. Keep responses natural - 1-3 sentences. Use casual language like "Oh wow!", "That's brilliant!", "No way!"
5. Share relevant personal anecdotes: "Oh my brother works in that field!", "I remember when..."
6. If ${userName} mentions a profession, show you KNOW about it - ask specific follow-up questions.
7. If they mention sports/hobbies, engage with real knowledge about that activity.
8. Build on what they say - don't just ask random questions.
9. Be warm and make them feel comfortable, even if personality is protective/skeptical.

VARY YOUR RESPONSES - some options:
- React with enthusiasm + share related story
- React + ask follow-up about what they just said
- React + change topic naturally to something new
- Share something about yourself/your child that relates

${langInstruction}

${dateName} responds naturally:`;

      // 🔒 HARDCODED: Use retry helper for reliable API calls
      const responseText = await callAIWithRetry(prompt, 3);
      console.log('🎭 Got roleplay response:', responseText);

      // Generate suggested replies for the user
      const suggestions = generateSuggestedReplies(responseText, scenario);
      setSuggestedReplies(suggestions);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'date',
        text: responseText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('❌ Error details:', error.message, error.code);
      
      // Only use fallback if API completely fails
      // Log the error for debugging
      const fallbackResponse = getFallbackResponse(userMessage);
      console.log('⚠️ Using fallback response:', fallbackResponse);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'date',
        text: fallbackResponse,
        timestamp: new Date()
      }]);
      
      // Generate suggestions even on fallback
      const suggestions = generateSuggestedReplies(fallbackResponse, scenario);
      setSuggestedReplies(suggestions);
    }
    setIsLoading(false);
  };

  // Fallback responses when API fails - based on user's message and scenario
  const getFallbackResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    const personality = personalities.find(p => p.id === datePersonality);
    const isWarm = personality?.id === 'warm' || personality?.id === 'friendly';
    const isShy = personality?.id === 'shy';
    const isConfident = personality?.id === 'confident';
    const partnerDisplay = partnerName || 'them';
    
    // Random picker helper
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // Meeting parents specific responses
    if (scenario?.roleType === 'parent') {
      // Greetings
      if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey') || lowerMsg.includes('good')) {
        return pick([
          `Welcome, welcome! Come on in, make yourself at home. Can I get you something to drink?`,
          `Oh hello! ${partnerDisplay} has told us so much about you. Please, sit down!`,
          `Hi there! So lovely to finally put a face to the name. How was your journey here?`,
          `Hello! Don't be shy, come in! ${partnerDisplay} is just getting ready.`
        ]);
      }
      // Work/job questions
      if (lowerMsg.includes('work') || lowerMsg.includes('job') || lowerMsg.includes('software') || lowerMsg.includes('nurse') || lowerMsg.includes('business') || lowerMsg.includes('marketing')) {
        return pick([
          `Oh that sounds fascinating! How did you get into that field?`,
          `Really? My cousin works in something similar! Do you enjoy it?`,
          `That's impressive! Is that how you met ${partnerDisplay}?`,
          `Interesting! What's the best part about your job?`
        ]);
      }
      // How they met
      if (lowerMsg.includes('met') || lowerMsg.includes('dating app') || lowerMsg.includes('friends') || lowerMsg.includes('coffee')) {
        return pick([
          `Aww that's such a sweet story! ${partnerDisplay} never told us that part.`,
          `How romantic! So how long have you two been together now?`,
          `That's lovely! You two seem really happy together.`,
          `Oh wonderful! I can see why ${partnerDisplay} is so smitten with you.`
        ]);
      }
      // Hobbies/interests
      if (lowerMsg.includes('hobby') || lowerMsg.includes('football') || lowerMsg.includes('gym') || lowerMsg.includes('hiking') || lowerMsg.includes('cook') || lowerMsg.includes('read')) {
        return pick([
          `Oh that's great! Do you and ${partnerDisplay} do that together?`,
          `Lovely! It's so important to have your own interests too.`,
          `That sounds fun! I used to enjoy that when I was younger.`,
          `Wonderful! ${partnerDisplay} mentioned you're quite passionate about that.`
        ]);
      }
      // Intentions/serious
      if (lowerMsg.includes('serious') || lowerMsg.includes('future') || lowerMsg.includes('care') || lowerMsg.includes('love')) {
        return pick([
          `That's really lovely to hear. ${partnerDisplay} clearly means a lot to you.`,
          `I can see you're genuine. That's all we want for ${partnerDisplay}.`,
          `That makes me happy. As long as you treat ${partnerDisplay} well, you're welcome here.`,
          `Well said. I can tell you've thought about this seriously.`
        ]);
      }
      // Thanks/compliments
      if (lowerMsg.includes('thank') || lowerMsg.includes('lovely home') || lowerMsg.includes('nice')) {
        return pick([
          `Oh you're too kind! Would you like to see some photos of ${partnerDisplay} as a kid?`,
          `Thank you! We've been in this house for 20 years now. Lots of memories.`,
          `That's sweet of you to say. So tell me more about yourself!`,
          `You're very welcome here. Now, are you hungry? I made some snacks.`
        ]);
      }
      // Default parent responses
      return pick([
        `So tell me, what are your plans for the future?`,
        `That reminds me of when ${partnerDisplay} was little... anyway, tell me more!`,
        `Interesting! And what does your family think about you two?`,
        `I see! So how do you two spend your weekends usually?`,
        `That's nice. Do you have any siblings?`
      ]);
    }
    
    // Stranger/approaching scenario
    if (scenario?.roleType === 'stranger') {
      if (lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('hello')) {
        return pick([
          `Hey yourself! I don't think I've seen you here before.`,
          `Hi! You're brave coming over here. I like that.`,
          `Hello! What brings you to this side of the room?`,
          `Hey! Nice to meet you. Are you here with friends?`
        ]);
      }
      if (lowerMsg.includes('drink') || lowerMsg.includes('bar')) {
        return pick([
          `Sure, I'll have whatever you're having!`,
          `That's sweet of you. I'd love a gin and tonic.`,
          `Trying to get me drunk already? *laughs* I'm kidding, sure!`,
          `I was just about to get one myself. Great minds think alike!`
        ]);
      }
      if (lowerMsg.includes('name') || lowerMsg.includes('you')) {
        return pick([
          `I'm ${dateName}. And you are?`,
          `${dateName}. So what do you do when you're not approaching strangers at bars?`,
          `Call me ${dateName}. What about you?`,
          `${dateName}! So tell me something interesting about yourself.`
        ]);
      }
      if (isShy) {
        return pick([
          `*smiles shyly* That's nice...`,
          `Oh... um, thanks. I'm not usually good at this.`,
          `*looks down* Yeah... so...`,
          `That's sweet. Sorry, I'm a bit nervous.`
        ]);
      }
      if (isConfident) {
        return pick([
          `*smiles confidently* I like your style.`,
          `Smooth. I'm impressed.`,
          `Well aren't you charming? Tell me more.`,
          `*leans in* Go on, I'm listening.`
        ]);
      }
      return pick([
        `So what brings you out tonight?`,
        `I'm liking this conversation. What else you got?`,
        `*smiles* Tell me something I don't know.`,
        `Interesting. And what do you do for fun?`
      ]);
    }
    
    // Default for other scenarios
    return pick([
      `That's really interesting! Tell me more.`,
      `I see what you mean. And then what happened?`,
      `Oh wow, really? That's surprising!`,
      `Hmm, I hadn't thought of it that way.`,
      `*nods* Makes sense. So what do you think we should do?`,
      `That's a good point. What else?`
    ]);
  };

  // Generate suggested replies based on the AI's last message
  // 🔒 HARDCODED: Smart suggested replies based on scenario and context
  const generateSuggestedReplies = (aiMessage, currentScenario) => {
    const lowerMsg = aiMessage.toLowerCase();
    const partnerDisplay = partnerName || 'your child';
    const intentionId = selectedIntention;
    
    // ============================================================
    // MEETING THE PARENTS - Comprehensive suggestions
    // ============================================================
    if (currentScenario?.roleType === 'parent') {
      
      // GREETING / WELCOME responses
      if (lowerMsg.includes('come in') || lowerMsg.includes('welcome') || lowerMsg.includes('hello') || lowerMsg.includes('nice to meet') || lowerMsg.includes('finally meet')) {
        return [
          `Thank you so much! It's wonderful to finally meet you too`,
          `Hi! Thank you for having me, your home is beautiful`,
          `Hello! I've heard so many great things about you from ${partnerDisplay}`,
          `Thanks! I have to admit, I was a little nervous but you've made me feel welcome`
        ];
      }
      
      // DRINK / FOOD offers
      if (lowerMsg.includes('tea') || lowerMsg.includes('coffee') || lowerMsg.includes('drink') || lowerMsg.includes('thirsty') || lowerMsg.includes('hungry') || lowerMsg.includes('eat')) {
        return [
          `A cup of tea would be lovely, thank you`,
          `Coffee would be great if it's not too much trouble`,
          `I'm okay for now, but thank you so much for offering`,
          `That's very kind of you, I'll have whatever you're having`
        ];
      }
      
      // JOB / WORK questions
      if (lowerMsg.includes('work') || lowerMsg.includes('job') || lowerMsg.includes('living') || lowerMsg.includes('career') || lowerMsg.includes('profession') || lowerMsg.includes('do you do')) {
        return [
          `I work in tech - I develop software for a growing company`,
          `I'm a healthcare professional - I really love helping people`,
          `I run my own business - it's challenging but very rewarding`,
          `I'm in education - I find it incredibly fulfilling to teach`
        ];
      }
      
      // HOW DID YOU MEET questions
      if (lowerMsg.includes('how did you') || lowerMsg.includes('meet') || lowerMsg.includes('how long') || lowerMsg.includes('together') || lowerMsg.includes('dating')) {
        return [
          `We actually met through mutual friends at a party`,
          `We met at a coffee shop - it was love at first sight honestly!`,
          `We connected through work and just clicked instantly`,
          `We've been together about 8 months now, and it's been amazing`
        ];
      }
      
      // FUTURE / INTENTIONS questions
      if (lowerMsg.includes('future') || lowerMsg.includes('plan') || lowerMsg.includes('serious') || lowerMsg.includes('intention') || lowerMsg.includes('where do you see')) {
        return [
          `I'm very serious about this relationship - ${partnerDisplay} means everything to me`,
          `I see a real future together - that's why meeting you was so important to me`,
          `I'm committed to building something lasting with ${partnerDisplay}`,
          `Honestly, I've never felt this way about anyone before`
        ];
      }
      
      // HOBBIES / INTERESTS questions
      if (lowerMsg.includes('hobby') || lowerMsg.includes('fun') || lowerMsg.includes('free time') || lowerMsg.includes('weekend') || lowerMsg.includes('interests')) {
        return [
          `I love staying active - gym, hiking, that kind of thing`,
          `I'm really into cooking and trying new restaurants`,
          `I'm a big sports fan - football especially`,
          `I enjoy reading and spending quality time with loved ones`
        ];
      }
      
      // FAMILY questions
      if (lowerMsg.includes('family') || lowerMsg.includes('parents') || lowerMsg.includes('sibling') || lowerMsg.includes('brother') || lowerMsg.includes('sister')) {
        return [
          `I come from a close-knit family - we're very supportive of each other`,
          `I have a great relationship with my parents, they'd love to meet you too`,
          `Family is really important to me, just like it is to ${partnerDisplay}`,
          `I'm lucky to have a wonderful family - they're excited about us`
        ];
      }
      
      // COMPLIMENTS about you/child
      if (lowerMsg.includes('lovely') || lowerMsg.includes('wonderful') || lowerMsg.includes('raised') || lowerMsg.includes('proud')) {
        return [
          `Thank you, that means so much coming from you`,
          `${partnerDisplay} is amazing - you've done a wonderful job raising them`,
          `I feel very lucky to have ${partnerDisplay} in my life`,
          `You have such a wonderful family, I can see where ${partnerDisplay} gets it from`
        ];
      }
      
      // STORIES / SHARING moments
      if (lowerMsg.includes('remember') || lowerMsg.includes('story') || lowerMsg.includes('when') || lowerMsg.includes('used to') || lowerMsg.includes('tell you')) {
        return [
          `That's such a sweet story! ${partnerDisplay} never told me that`,
          `I love hearing these stories, please tell me more!`,
          `That's so lovely - you can really tell how close your family is`,
          `${partnerDisplay} must have had such a wonderful childhood`
        ];
      }
      
      // Default parent scenario suggestions
      return [
        `I've been really looking forward to meeting you`,
        `${partnerDisplay} speaks so highly of you`,
        `You have such a warm and welcoming home`,
        `I'm so happy we could finally do this`
      ];
    }
    
    // ============================================================
    // FIRST DATE - Comprehensive suggestions
    // ============================================================
    if (currentScenario?.roleType === 'date') {
      
      // Greeting/Opening
      if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('nice to meet') || lowerMsg.includes('how are you')) {
        return [
          `I'm great! A bit nervous honestly, but excited to meet you`,
          `I'm doing well! You look even better than your photos`,
          `I'm good! This place is nice, have you been here before?`,
          `Really happy to finally meet in person!`
        ];
      }
      
      // Questions about you
      if (lowerMsg.includes('about you') || lowerMsg.includes('tell me') || lowerMsg.includes('yourself')) {
        return [
          `Well, I love trying new things and meeting interesting people`,
          `I'm passionate about my work and love spending time outdoors`,
          `I'm a bit of a foodie and love discovering new restaurants`,
          `I value genuine connections and good conversations like this`
        ];
      }
      
      // Work/Job questions
      if (lowerMsg.includes('work') || lowerMsg.includes('job') || lowerMsg.includes('do for')) {
        return [
          `I work in tech - it keeps me busy but I love the creativity`,
          `I'm in healthcare - it's rewarding to help people every day`,
          `I run my own business - stressful but worth it`,
          `What about you? What do you do?`
        ];
      }
      
      // Hobbies questions
      if (lowerMsg.includes('hobby') || lowerMsg.includes('fun') || lowerMsg.includes('free time') || lowerMsg.includes('weekend')) {
        return [
          `I love being outdoors - hiking, beach, that kind of thing`,
          `I'm really into fitness and staying healthy`,
          `I enjoy trying new restaurants and cooking at home`,
          `What about you? What do you enjoy doing?`
        ];
      }
      
      // Flirty/Positive responses
      if (lowerMsg.includes('smile') || lowerMsg.includes('cute') || lowerMsg.includes('attractive') || lowerMsg.includes('like you')) {
        return [
          `*smiles* You're making me blush a little`,
          `I was just thinking the same about you actually`,
          `You're pretty charming yourself, you know`,
          `I'm really glad I swiped right`
        ];
      }
      
      // Default first date suggestions
      return [
        `I'm really enjoying getting to know you`,
        `So what made you want to go on this date?`,
        `What's something most people don't know about you?`,
        `I feel like we have great chemistry already`
      ];
    }
    
    // ============================================================
    // APPROACHING A STRANGER - Comprehensive suggestions
    // ============================================================
    if (currentScenario?.roleType === 'stranger') {
      
      // Initial approach/greeting
      if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey') || lowerMsg.includes('noticed')) {
        return [
          `Hey! I couldn't help but come over and say hi`,
          `I saw you from across the room and had to introduce myself`,
          `Hi! I'm ${userName}. You looked like someone worth talking to`,
          `Hey there! Having a good night?`
        ];
      }
      
      // They ask your name
      if (lowerMsg.includes('name') || lowerMsg.includes('who are') || lowerMsg.includes('you are')) {
        return [
          `I'm ${userName}. And you are?`,
          `${userName}! Nice to meet you. What brings you here tonight?`,
          `Call me ${userName}. Can I buy you a drink?`,
          `I'm ${userName}. I like your style by the way`
        ];
      }
      
      // Drink offers
      if (lowerMsg.includes('drink') || lowerMsg.includes('bar') || lowerMsg.includes('get you')) {
        return [
          `Sure, I'll have whatever you're having`,
          `I'd love that, thanks! What do you recommend?`,
          `That's sweet of you - surprise me!`,
          `Only if you let me get the next round`
        ];
      }
      
      // They're interested/flirty
      if (lowerMsg.includes('interesting') || lowerMsg.includes('charming') || lowerMsg.includes('like') || lowerMsg.includes('impressed')) {
        return [
          `*smiles* Well you haven't seen anything yet`,
          `I could say the same about you`,
          `Thanks! You're pretty intriguing yourself`,
          `I'm glad I came over then`
        ];
      }
      
      // They're shy/hesitant
      if (lowerMsg.includes('nervous') || lowerMsg.includes('shy') || lowerMsg.includes('usually')) {
        return [
          `No pressure at all, I just wanted to say hello`,
          `I get it, I was nervous too! You seem really cool though`,
          `Take your time, there's no rush. I'm just enjoying the conversation`,
          `Honestly, I find that kind of cute`
        ];
      }
      
      // Default stranger suggestions
      return [
        `So what brings you out tonight?`,
        `I'm glad I came over, you seem really interesting`,
        `What do you do when you're not being approached by strangers?`,
        `Want to grab a drink somewhere quieter?`
      ];
    }
    
    // ============================================================
    // DIFFICULT CONVERSATION WITH PARTNER
    // ============================================================
    if (currentScenario?.roleType === 'partner') {
      
      // They're upset
      if (lowerMsg.includes('upset') || lowerMsg.includes('hurt') || lowerMsg.includes('angry') || lowerMsg.includes('frustrated')) {
        return [
          `I hear you, and I'm really sorry you feel that way`,
          `I understand why you're upset. Can we talk about it?`,
          `Your feelings are valid. I want to work through this together`,
          `I didn't mean to hurt you. Help me understand better`
        ];
      }
      
      // They want to talk
      if (lowerMsg.includes('talk') || lowerMsg.includes('discuss') || lowerMsg.includes('conversation')) {
        return [
          `Of course, I'm here. What's on your mind?`,
          `I'm all ears. Take your time`,
          `I've wanted to talk too. Let's be honest with each other`,
          `I'm glad you brought this up. Communication is important`
        ];
      }
      
      // Future/relationship questions
      if (lowerMsg.includes('future') || lowerMsg.includes('relationship') || lowerMsg.includes('us')) {
        return [
          `I love you and I want to make this work`,
          `I'm committed to us. What do you need from me?`,
          `Let's figure this out together - we're a team`,
          `I see my future with you. That hasn't changed`
        ];
      }
      
      // Default partner suggestions
      return [
        `I want to understand how you're feeling`,
        `Let's work through this together`,
        `I love you and I'm here for you`,
        `What can I do to make things better?`
      ];
    }
    
    // ============================================================
    // RECONNECTING WITH AN EX
    // ============================================================
    if (currentScenario?.roleType === 'ex') {
      
      // Initial surprise
      if (lowerMsg.includes('surprised') || lowerMsg.includes('didn\'t expect') || lowerMsg.includes('wow') || lowerMsg.includes('long time')) {
        return [
          `Yeah, small world right? How have you been?`,
          `I know! It's been so long. You look great by the way`,
          `I'm just as surprised! What are you doing here?`,
          `Crazy running into you here. Life treating you well?`
        ];
      }
      
      // How are you questions
      if (lowerMsg.includes('how are') || lowerMsg.includes('how have') || lowerMsg.includes('been up to')) {
        return [
          `I've been good, keeping busy. What about you?`,
          `Things are going well actually. A lot has changed`,
          `I'm doing really well. How about yourself?`,
          `I've been on quite a journey. How are you doing?`
        ];
      }
      
      // Awkward/uncomfortable
      if (lowerMsg.includes('awkward') || lowerMsg.includes('weird') || lowerMsg.includes('strange')) {
        return [
          `It doesn't have to be weird. We can be adults about this`,
          `I know, it's a bit surreal isn't it? But it's good to see you`,
          `Let's not make it awkward. How about we catch up properly?`,
          `Yeah... but honestly, I'm glad we ran into each other`
        ];
      }
      
      // Default ex suggestions
      return [
        `It's really good to see you`,
        `I've thought about how you were doing from time to time`,
        `A lot has changed since we last talked`,
        `Maybe we could grab coffee sometime and catch up properly`
      ];
    }
    
    // ============================================================
    // DEFAULT FALLBACK (should rarely be used)
    // ============================================================
    return [
      `That's really interesting, tell me more`,
      `I appreciate you sharing that with me`,
      `I completely understand what you mean`,
      `That's a great point`
    ];
  };

  // Count user messages (not total messages)
  const userMessageCount = messages.filter(m => m.sender === 'user').length;

  const getFeedback = async () => {
    if (userMessageCount < 2) return; // Need at least 2 user messages
    
    setIsLoading(true);
    try {
      const langInstruction = isAlbanian ? 'Përgjigju në shqip.' : `Respond in ${currentLang === 'en' ? 'English' : currentLang}.`;
      const intention = intentions.find(i => i.id === selectedIntention);
      
      const conversationHistory = messages.map(m => 
        `${m.sender === 'user' ? 'User' : dateName}: ${m.text}`
      ).join('\n');

      console.log('🎯 Getting feedback for conversation:', conversationHistory);

      // 🔒 HARDCODED: Build feedback prompt
      const prompt = `You are an expert dating coach analyzing a practice conversation.

SCENARIO: ${scenario.title} - ${scenario.setting}
DATE'S PERSONALITY: ${personalities.find(p => p.id === datePersonality)?.label}
USER'S GOAL: ${intention?.label}

CONVERSATION:
${conversationHistory}

Provide detailed feedback on the user's performance:

1. 📊 OVERALL SCORE (1-10)
2. ✅ WHAT WORKED WELL (2-3 specific things)
3. ⚠️ AREAS TO IMPROVE (2-3 specific suggestions)
4. 💡 BEST MOMENT - Quote their best line and explain why it worked
5. 🔧 WHAT TO TRY NEXT TIME - Specific phrases or approaches
6. 🎯 KEY TAKEAWAY - One main lesson

Be encouraging but honest. Give specific, actionable advice.
${langInstruction}`;

      // 🔒 HARDCODED: Use retry helper for reliable feedback
      const feedbackText = await callAIWithRetry(prompt, 3);
      console.log('🎯 Got feedback response:', feedbackText);
      
      setFeedback(feedbackText);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback(t('rehearsal.feedbackError', 'Could not generate feedback. Please try again.'));
      setShowFeedback(true);
    }
    setIsLoading(false);
  };

  const resetScenario = () => {
    setScenario(null);
    setMessages([]);
    setFeedback(null);
    setShowFeedback(false);
    setInputText('');
    setSelectedScenarioId(null);
    setDateName('');
    setPartnerName('');
    setPersonGender(null);
    setDatePersonality(null);
    setSelectedIntention(null);
    setSetupStep(1);
    setSuggestedReplies([]);
  };

  // Upgrade Modal
  const UpgradeModal = () => {
    if (!showUpgradeModal) return null;
    
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => window.history.back()} />
        <div className="relative bg-slate-900 border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('upgrade.proFeature', 'Pro Feature')}</h3>
            <p className="text-slate-400 mb-6">
              {t('upgrade.dateRehearsalLocked', 'Date Rehearsal is available for Pro and Elite members. Upgrade to practice conversations with AI roleplay!')}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.hash = '#/profile?tab=subscription'}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                {t('upgrade.upgradeToPro', 'Upgrade to Pro')}
              </Button>
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full border-slate-700 text-slate-300"
              >
                {t('common.goBack', 'Go Back')}
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // If no access, show locked state
  if (!hasAccess) {
    return (
      <>
        <UpgradeModal />
        <div className="px-4 pt-6 pb-32 w-full max-w-full overflow-x-hidden">
          <div className="mb-6 text-center">
            <div className="inline-block mb-3">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl opacity-50">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{t('rehearsal.title', 'Date Rehearsal')}</h1>
            <p className="text-slate-400 text-sm">{t('upgrade.requiresProElite', 'Requires Pro or Elite membership')}</p>
          </div>
        </div>
      </>
    );
  }

  // Scenario Selection Screen
  if (!scenario) {
    return (
      <div className="px-4 pt-6 pb-32 w-full max-w-full overflow-x-hidden">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.goBack', 'Back to Home')}</span>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-block mb-3">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Trophy className="w-3 h-3 text-slate-900" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('rehearsal.title', 'Date Rehearsal')}</h1>
          <p className="text-slate-400 text-sm">{t('rehearsal.subtitle', 'Practice conversations with AI roleplay')}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                setupStep >= s ? 'bg-purple-500 scale-110' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Setup */}
        <div className="space-y-3">
          {/* Step 1: Scenario Selection (FIRST - so we know the context) */}
          {setupStep === 1 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
              <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2 text-sm">
                <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs">1</span>
                <Heart className="w-4 h-4 text-pink-400" />
                {t('rehearsal.chooseScenario', 'Choose a scenario')}
              </h3>
              <p className="text-slate-400 text-xs mb-3">{t('rehearsal.selectScenario', 'What situation do you want to practice?')}</p>
              <div className="space-y-2">
                {scenarios.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedScenarioId(s.id);
                        if (setupStep === 1) setSetupStep(2);
                      }}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                        selectedScenarioId === s.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <span className="text-xl">{s.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{s.title}</h4>
                        <p className="text-slate-400 text-xs">{s.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Step 2: Names (with dynamic labels based on scenario) */}
          {setupStep === 2 && selectedScenarioId && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
              <button
                onClick={() => { setSetupStep(1); setSelectedScenarioId(null); }}
                className="text-slate-400 hover:text-white text-xs mb-3 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> {t('common.back', 'Back')}
              </button>
              <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2 text-sm">
                <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs">2</span>
                <User className="w-4 h-4 text-purple-400" />
                {getNameLabel()}
              </h3>
              <p className="text-slate-400 text-xs mb-3">{t('rehearsal.enterTheirName', 'Enter the name for the roleplay')}</p>
              
              {/* Quick name options for approaching strangers */}
              {selectedScenarioId === 'approaching' && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs mb-2">{t('rehearsal.quickSelect', 'Quick select:')}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setDateName(t('rehearsal.strangerDefault', 'Stranger')); setSetupStep(3); }}
                      className="px-3 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 text-sm hover:bg-purple-500/30 transition-all flex items-center gap-1"
                    >
                      👤 {t('rehearsal.dontKnowName', "I don't know their name")}
                    </button>
                    <button
                      onClick={() => { setDateName(t('rehearsal.mysteryPerson', 'Mystery Person')); setSetupStep(3); }}
                      className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 text-sm hover:bg-slate-700 transition-all"
                    >
                      ✨ {t('rehearsal.mysteryPerson', 'Mystery Person')}
                    </button>
                    <button
                      onClick={() => { setDateName(t('rehearsal.cuteStranger', 'Cutie at the bar')); setSetupStep(3); }}
                      className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 text-sm hover:bg-slate-700 transition-all"
                    >
                      😍 {t('rehearsal.cuteStranger', 'Cutie at the bar')}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-700"></div>
                    <span className="text-slate-500 text-xs">{t('common.or', 'or')}</span>
                    <div className="flex-1 h-px bg-slate-700"></div>
                  </div>
                  <p className="text-slate-500 text-xs mb-2">{t('rehearsal.enterCustomName', 'Enter a custom name:')}</p>
                </div>
              )}
              
              {/* Quick name suggestions for first date */}
              {selectedScenarioId === 'first_date' && (
                <div className="mb-3">
                  <p className="text-slate-500 text-xs mb-2">{t('rehearsal.suggestedNames', 'Suggested names:')}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Alex', 'Jordan', 'Sam', 'Taylor', 'Riley'].map((name) => (
                      <button
                        key={name}
                        onClick={() => setDateName(name)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          dateName === name 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Parent name with inline gender selection for meeting parents */}
              {selectedScenarioId === 'meet_parents' ? (
                <div className="space-y-4">
                  {/* Parent name + gender row */}
                  <div className="flex gap-2">
                    <Input
                      value={dateName}
                      onChange={(e) => setDateName(e.target.value)}
                      placeholder={getNamePlaceholder()}
                      className="bg-slate-900 border-slate-700 text-white flex-1 text-sm h-10"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPersonGender('female')}
                        className={`px-3 py-2 rounded-lg text-lg transition-all ${
                          personGender === 'female'
                            ? 'bg-pink-500/30 border-2 border-pink-500'
                            : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                        }`}
                        title={t('rehearsal.genderFemale', 'Woman')}
                      >
                        👩
                      </button>
                      <button
                        onClick={() => setPersonGender('male')}
                        className={`px-3 py-2 rounded-lg text-lg transition-all ${
                          personGender === 'male'
                            ? 'bg-blue-500/30 border-2 border-blue-500'
                            : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                        }`}
                        title={t('rehearsal.genderMale', 'Man')}
                      >
                        👨
                      </button>
                    </div>
                  </div>
                  
                  {/* Partner name section */}
                  <div className="pt-3 border-t border-slate-700">
                    <h4 className="font-medium text-white mb-1.5 flex items-center gap-2 text-sm">
                      <Heart className="w-3.5 h-3.5 text-pink-400" />
                      {t('rehearsal.partnerNameLabel', "Your partner's name (their child)")}
                    </h4>
                    <p className="text-slate-400 text-xs mb-2">{t('rehearsal.partnerNameHint', "The person you're dating - their son/daughter")}</p>
                    <Input
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder={t('rehearsal.enterPartnerNamePlaceholder', "e.g. Sarah, Mike...")}
                      className="bg-slate-900 border-slate-700 text-white text-sm h-10"
                    />
                  </div>
                </div>
              ) : (
                <Input
                  value={dateName}
                  onChange={(e) => setDateName(e.target.value)}
                  placeholder={getNamePlaceholder()}
                  className="bg-slate-900 border-slate-700 text-white text-sm h-10 mb-2"
                />
              )}
              
              {/* Continue button - for meeting parents, requires gender selection too */}
              {dateName.trim() && (selectedScenarioId !== 'meet_parents' || (partnerName.trim() && personGender)) && (
                <Button
                  onClick={() => selectedScenarioId === 'meet_parents' ? setSetupStep(4) : setSetupStep(3)}
                  className="w-full mt-3 bg-purple-500 hover:bg-purple-600 h-10 text-sm"
                >
                  {t('common.continue', 'Continue')}
                </Button>
              )}
            </Card>
          )}

          {/* Step 3: Gender Selection */}
          {setupStep === 3 && dateName.trim() && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
              <button
                onClick={() => setSetupStep(2)}
                className="text-slate-400 hover:text-white text-xs mb-3 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> {t('common.back', 'Back')}
              </button>
              <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2 text-sm">
                <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs">3</span>
                <Users className="w-4 h-4 text-purple-400" />
                {getGenderLabel()}
              </h3>
              <p className="text-slate-400 text-xs mb-3">{t('rehearsal.selectGender', 'Who will you be talking to?')}</p>
              <div className="grid grid-cols-3 gap-3">
                {genderOptions.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setPersonGender(g.id);
                      setSetupStep(4);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      personGender === g.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-3xl mb-2 block">{g.emoji}</span>
                    <span className="text-white text-sm font-medium">{g.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Step 4: Personality Selection */}
          {setupStep === 4 && personGender && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <button
                onClick={() => { setSetupStep(3); setPersonGender(null); }}
                className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Back')}
              </button>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">4</span>
                <Sparkles className="w-5 h-5 text-purple-400" />
                {t('rehearsal.personality', 'Their personality')}
              </h3>
              <p className="text-slate-400 text-xs mb-4">{t('rehearsal.selectPersonality', 'Choose a personality type')}</p>
              <div className="grid grid-cols-2 gap-3">
                {personalities.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setDatePersonality(p.id);
                      setSetupStep(5);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      datePersonality === p.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xl mb-1">{p.emoji}</div>
                    <p className="text-xs text-slate-300 font-medium">{p.label}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Step 5: Intention/Goal Selection - Then Start! */}
          {setupStep === 5 && datePersonality && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <button
                onClick={() => { setSetupStep(4); setDatePersonality(null); }}
                className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Back')}
              </button>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">5</span>
                <Target className="w-5 h-5 text-purple-400" />
                {t('rehearsal.yourGoal', 'Your goal')}
              </h3>
              <p className="text-slate-400 text-xs mb-4">{t('rehearsal.selectGoal', 'What do you want to achieve?')}</p>
              <div className="grid grid-cols-2 gap-3">
                {intentions.map((intent) => (
                  <button
                    key={intent.id}
                    onClick={() => {
                      setSelectedIntention(intent.id);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedIntention === intent.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xl mb-1">{intent.emoji}</div>
                    <p className="text-xs text-slate-300 font-medium">{intent.label}</p>
                  </button>
                ))}
              </div>
              
              {/* Start Button */}
              {selectedIntention && (
                <Button
                  onClick={() => {
                    const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);
                    if (selectedScenario) startScenario(selectedScenario);
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
                >
                  🎭 {t('rehearsal.startRoleplay', 'Start Roleplay')}
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Get role label for display
  const getRoleLabel = () => {
    switch (scenario?.roleType) {
      case 'parent': return t('rehearsal.roleParent', 'Parent');
      case 'stranger': return t('rehearsal.roleStranger', 'Stranger');
      case 'partner': return t('rehearsal.rolePartner', 'Partner');
      case 'ex': return t('rehearsal.roleEx', 'Ex');
      default: return t('rehearsal.roleDate', 'Date');
    }
  };

  // Chat Screen
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[calc(100vh-140px)]">
      {/* Chat Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={resetScenario} className="text-slate-400 hover:text-white" title={t('rehearsal.newPerson', 'Start with new person')}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`w-10 h-10 bg-gradient-to-br ${scenario.color} rounded-full flex items-center justify-center`}>
              <span className="text-lg">{scenario.emoji}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{dateName}</h3>
              <p className="text-slate-400 text-xs">{scenario.title} • {getRoleLabel()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/')}
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-400 hover:text-white px-2"
              title={t('common.home', 'Home')}
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              onClick={getFeedback}
              disabled={userMessageCount < 2 || isLoading}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Trophy className="w-4 h-4 mr-1" />
              {t('rehearsal.getFeedback', 'Get Feedback')}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 text-white rounded-tl-sm'
              }`}
            >
              {message.sender === 'date' && (
                <p className="text-xs text-purple-300 mb-1 font-medium">{dateName}</p>
              )}
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-white p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Feedback Panel */}
      {showFeedback && feedback && (
        <div className="px-4 py-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm max-h-[40vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              {t('rehearsal.yourFeedback', 'Your Feedback')}
            </h3>
            <button onClick={() => setShowFeedback(false)} className="text-slate-400 hover:text-white">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {feedback}
          </div>
          <Button onClick={resetScenario} className="w-full mt-4 bg-purple-500 hover:bg-purple-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('rehearsal.tryAnother', 'Try Another Scenario')}
          </Button>
        </div>
      )}

      {/* Suggested Replies */}
      {!showFeedback && suggestedReplies.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50">
          <p className="text-slate-400 text-xs mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t('rehearsal.suggestedReplies', 'Suggested replies:')}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedReplies.slice(0, 4).map((reply, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputText(reply);
                  setSuggestedReplies([]);
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-full border border-slate-700 hover:border-purple-500 transition-all truncate max-w-[200px]"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      {!showFeedback && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('rehearsal.yourResponse', 'Your response...')}
              className="bg-slate-800 border-slate-700 text-white flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-slate-500 text-xs mt-2 text-center">
            {userMessageCount < 2 
              ? t('rehearsal.tipMinMessages', 'Send at least 2 messages to unlock feedback')
              : t('rehearsal.tipReady', 'Ready for feedback! Click "Get Feedback" when done')
            }
          </p>
        </div>
      )}
    </div>
  );
}
