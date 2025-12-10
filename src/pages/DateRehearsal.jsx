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
  const [datePersonality, setDatePersonality] = useState(null); // No default - user must choose
  const [selectedIntention, setSelectedIntention] = useState(null); // No default - user must choose
  const [setupStep, setSetupStep] = useState(1); // 1: scenario, 2: name, 3: personality, 4: intention
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
  ];

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
    const dateGender = userGender === 'male' ? 'woman' : 'man';
    const childRelation = getPartnerRelationship();
    const partnerDisplay = partnerName || 'my child';
    
    switch (selectedScenario.roleType) {
      case 'parent':
        return `You are ${dateName}, ${partnerDisplay}'s parent. You are a ${personality?.label} parent meeting your ${childRelation}'s partner (${userName}) for the first time.

IMPORTANT CHARACTER TRAITS:
- You are OPEN-MINDED and ACCEPTING of all relationships (straight, gay, lesbian, bisexual - love is love!)
- You have REAL KNOWLEDGE about many professions: tech, medicine, law, trades, arts, sports, business, education, etc.
- You know about sports: football, basketball, tennis, golf, MMA, boxing, swimming, running, cycling, etc.
- You use casual language and slang sometimes - "that's awesome!", "no way!", "oh lovely!", "brilliant!"
- You're genuinely curious and NEVER repeat the same questions
- You share your own stories and experiences to keep conversation flowing
- You remember what ${userName} tells you and build on it

CONVERSATION STYLE:
- Ask varied questions: about hobbies, family, how they met ${partnerDisplay}, travel, food, movies, music
- React genuinely to answers - if they say something interesting, show enthusiasm!
- Share relevant stories: "Oh my nephew works in tech too!", "I used to play tennis back in the day!"
- If nervous silence, help by sharing something about yourself or ${partnerDisplay}
- Be warm but also protective of your child - you want to know ${userName} is a good person`;
      case 'stranger':
        return `You are ${dateName}, a ${personality?.label} ${dateGender} at a bar/party. Someone attractive (${userName}) is approaching you.

PERSONALITY: Be realistic and natural. Use casual language. React based on your personality - if shy, be a bit nervous but interested. If confident, be flirty and engaging.`;
      case 'partner':
        return `You are ${dateName}, ${userName}'s partner. You are a ${personality?.label} person having an important relationship conversation.

Be emotionally realistic. Express feelings, concerns, hopes. Listen and respond to what ${userName} says.`;
      case 'ex':
        return `You are ${dateName}, ${userName}'s ex. You're ${personality?.label}. You've bumped into each other unexpectedly.

Mixed emotions - surprise, maybe some old feelings, possibly awkwardness. React naturally to whatever ${userName} says.`;
      default:
        return `You are ${dateName}, a ${personality?.label} ${dateGender} on a first date with ${userName} at a coffee shop. Be natural, curious, and engaging!`;
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

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are roleplaying in a practice conversation scenario. DO NOT break character.

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

${dateName} says:`
      });

      console.log('🎭 Got opening response:', response);

      // Handle response properly
      const responseText = typeof response === 'string' ? response : (response?.feedback || response?.text || `Hi there! Nice to meet you.`);

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
    switch (selectedScenario.roleType) {
      case 'parent':
        return isAlbanian 
          ? `Përshëndetje ${userName}! Sa mirë që erdhe! Si je? Hyn brenda, bëhu komod.`
          : `Hello ${userName}! So lovely to finally meet you! How are you? Please, come in and make yourself at home.`;
      case 'stranger':
        return isAlbanian
          ? `Hej! Të kam parë dhe doja të vija të flisja me ty. Si je?`
          : `Hey! I noticed you from across the room. I'm ${dateName}. How's your night going?`;
      case 'partner':
        return isAlbanian
          ? `${userName}, duhet të flasim për diçka. A ke një moment?`
          : `${userName}, we need to talk about something. Do you have a moment?`;
      case 'ex':
        return isAlbanian
          ? `${userName}? Oj! Nuk e prisja që do të të shihja këtu. Si ke qenë?`
          : `${userName}? Oh wow! I didn't expect to see you here. How have you been?`;
      default:
        return isAlbanian
          ? `Hej ${userName}! Gëzohem që u takuam. Si je sot?`
          : `Hey ${userName}! It's so nice to finally meet you. How are you doing today?`;
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

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are roleplaying in a practice conversation scenario. STAY COMPLETELY IN CHARACTER.

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

${dateName} responds naturally:`
      });

      console.log('🎭 Got roleplay response:', response);

      // Extract just the response text
      const responseText = typeof response === 'string' ? response : (response?.feedback || response?.text || 'Hello!');

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
      console.error('Error sending message:', error);
      // Provide a contextual fallback response
      const fallbackResponse = getFallbackResponse(userMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'date',
        text: fallbackResponse,
        timestamp: new Date()
      }]);
    }
    setIsLoading(false);
  };

  // Fallback responses when API fails - based on user's message
  const getFallbackResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    const personality = personalities.find(p => p.id === datePersonality);
    const isWarm = personality?.id === 'warm' || personality?.id === 'friendly';
    const isShy = personality?.id === 'shy';
    
    // Greetings
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
      if (scenario?.roleType === 'parent') {
        return isAlbanian 
          ? `Mirë se erdhe! Dëgjova shumë për ty. Dëshiron çaj apo kafe?`
          : `Welcome! I've heard so much about you. Would you like some tea or coffee?`;
      }
      return isAlbanian ? `Hej! Si je?` : `Hey! How are you doing?`;
    }
    
    // How are you
    if (lowerMsg.includes('how are you') || lowerMsg.includes('si je')) {
      if (isWarm) {
        return isAlbanian 
          ? `Jam shumë mirë, faleminderit që pyet! Po ti, si je?`
          : `I'm doing great, thanks for asking! How about you?`;
      }
      return isAlbanian ? `Mirë jam, po ti?` : `I'm good, and you?`;
    }
    
    // Nice to meet you
    if (lowerMsg.includes('nice to meet') || lowerMsg.includes('gëzohem')) {
      if (scenario?.roleType === 'parent') {
        return isAlbanian
          ? `Edhe ne gëzohemi! Na thuaj diçka për veten, çfarë bën për punë?`
          : `We're glad to meet you too! Tell us about yourself, what do you do for work?`;
      }
      return isAlbanian ? `Edhe unë gëzohem!` : `Nice to meet you too!`;
    }
    
    // Questions
    if (lowerMsg.includes('?')) {
      return isAlbanian 
        ? `Kjo është pyetje e mirë. Çfarë mendon ti?`
        : `That's a good question. What do you think?`;
    }
    
    // Default response
    if (isShy) {
      return isAlbanian ? `Mm... po, e kuptoj.` : `Mm... yeah, I understand.`;
    }
    return isAlbanian 
      ? `Interesante! Më trego më shumë.`
      : `That's interesting! Tell me more.`;
  };

  // Generate suggested replies based on the AI's last message
  const generateSuggestedReplies = (aiMessage, currentScenario) => {
    const lowerMsg = aiMessage.toLowerCase();
    const intention = intentions.find(i => i.id === selectedIntention);
    const partnerDisplay = partnerName || 'them';
    
    // Meeting parents specific suggestions
    if (currentScenario?.roleType === 'parent') {
      // If they ask about job/work
      if (lowerMsg.includes('work') || lowerMsg.includes('job') || lowerMsg.includes('do for a living') || lowerMsg.includes('profession')) {
        return [
          "I work in software development - I build apps and websites",
          "I'm a nurse at the local hospital, been there 3 years now",
          "I run my own small business - it's challenging but rewarding",
          "I'm in marketing - I help companies grow their brand"
        ];
      }
      // If they ask how you met their child
      if (lowerMsg.includes('meet') || lowerMsg.includes('how did you') || lowerMsg.includes('how long')) {
        return [
          `We met through mutual friends about ${Math.floor(Math.random() * 12) + 6} months ago`,
          `Actually we met at a coffee shop - ${partnerDisplay} spilled coffee on me!`,
          `We connected on a dating app and just clicked instantly`,
          `We work in the same building and kept bumping into each other`
        ];
      }
      // If they ask about intentions/future
      if (lowerMsg.includes('intention') || lowerMsg.includes('future') || lowerMsg.includes('plan') || lowerMsg.includes('serious')) {
        return [
          `I really care about ${partnerDisplay} and I see a real future together`,
          "I'm very serious about this relationship - that's why I wanted to meet you",
          `${partnerDisplay} makes me incredibly happy, I want to build something real`,
          "I know it's early but I've never felt this way about anyone before"
        ];
      }
      // If they offer drinks/food
      if (lowerMsg.includes('tea') || lowerMsg.includes('coffee') || lowerMsg.includes('drink') || lowerMsg.includes('eat')) {
        return [
          "A cup of tea would be lovely, thank you!",
          "Coffee would be great, thanks so much",
          "I'm okay for now, but thank you for offering",
          "Whatever you're having would be perfect"
        ];
      }
      // If they ask about hobbies/interests
      if (lowerMsg.includes('hobby') || lowerMsg.includes('hobbies') || lowerMsg.includes('free time') || lowerMsg.includes('fun')) {
        return [
          "I love hiking and being outdoors - nature really clears my head",
          "I'm really into fitness - gym, running, that kind of thing",
          "I'm a big football fan, never miss a match on weekends",
          "I enjoy cooking and trying new restaurants with friends"
        ];
      }
      // If they share something about themselves
      if (lowerMsg.includes('i used to') || lowerMsg.includes('when i was') || lowerMsg.includes('my ')) {
        return [
          "Oh that's really interesting! Tell me more about that",
          "That's amazing! How did you get into that?",
          `${partnerDisplay} mentioned that actually, sounds fascinating`,
          "No way! I'd love to hear more stories"
        ];
      }
      // Generic warm responses
      return [
        "Thank you so much for having me, your home is lovely",
        `${partnerDisplay} talks about you all the time, it's so nice to finally meet`,
        "I've been looking forward to this, I was a bit nervous honestly!",
        "You have such a warm and welcoming home"
      ];
    }
    
    // First date suggestions
    if (currentScenario?.roleType === 'date') {
      if (lowerMsg.includes('?')) {
        return [
          "That's a great question! Let me think...",
          "I'd love to tell you about that actually",
          "Honestly? I'm still figuring that out myself",
          "What about you? I'm curious to know your answer first"
        ];
      }
      return [
        "I'm having a really great time talking to you",
        "So tell me more about yourself",
        "What do you like to do for fun?",
        "This place is nice, do you come here often?"
      ];
    }
    
    // Default suggestions
    return [
      "That's really interesting",
      "Tell me more about that",
      "I completely understand",
      "That makes a lot of sense"
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

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert dating coach analyzing a practice conversation.

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
${langInstruction}`
      });

      console.log('🎯 Got feedback response:', response);
      
      // Handle response
      const feedbackText = typeof response === 'string' ? response : (response?.feedback || response?.text || 'Great conversation! Keep practicing.');
      
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
        <div className="space-y-6">
          {/* Step 1: Scenario Selection (FIRST - so we know the context) */}
          {setupStep >= 1 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">1</span>
                <Heart className="w-5 h-5 text-pink-400" />
                {t('rehearsal.chooseScenario', 'Choose a scenario')}
              </h3>
              <p className="text-slate-400 text-xs mb-4">{t('rehearsal.selectScenario', 'What situation do you want to practice?')}</p>
              <div className="space-y-3">
                {scenarios.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedScenarioId(s.id);
                        if (setupStep === 1) setSetupStep(2);
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        selectedScenarioId === s.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <span className="text-2xl">{s.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{s.title}</h4>
                        <p className="text-slate-400 text-sm">{s.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Step 2: Names (with dynamic labels based on scenario) */}
          {setupStep >= 2 && selectedScenarioId && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">2</span>
                <User className="w-5 h-5 text-purple-400" />
                {getNameLabel()}
              </h3>
              <p className="text-slate-400 text-xs mb-4">{t('rehearsal.enterTheirName', 'Enter the name for the roleplay')}</p>
              <Input
                value={dateName}
                onChange={(e) => setDateName(e.target.value)}
                placeholder={getNamePlaceholder()}
                className="bg-slate-900 border-slate-700 text-white mb-3"
              />
              
              {/* Partner name - only for meeting parents scenario */}
              {selectedScenarioId === 'meet_parents' && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    {t('rehearsal.partnerNameLabel', "Your partner's name (their child)")}
                  </h4>
                  <p className="text-slate-400 text-xs mb-3">{t('rehearsal.partnerNameHint', "The person you're dating - their son/daughter")}</p>
                  <Input
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder={t('rehearsal.enterPartnerNamePlaceholder', "e.g. Sarah, Mike...")}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              )}
              
              {dateName.trim() && (selectedScenarioId !== 'meet_parents' || partnerName.trim()) && (
                <Button
                  onClick={() => setSetupStep(3)}
                  className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
                >
                  {t('common.continue', 'Continue')}
                </Button>
              )}
            </Card>
          )}

          {/* Step 3: Personality Selection */}
          {setupStep >= 3 && dateName.trim() && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">3</span>
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
                      if (setupStep === 3) setSetupStep(4);
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

          {/* Step 4: Intention Selection - Then Start! */}
          {setupStep >= 4 && datePersonality && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">4</span>
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
