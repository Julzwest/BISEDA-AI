import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Zap,
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { getProfile } from '@/utils/profileMemory';

// Live Wingman AI System Prompt
const WINGMAN_SYSTEM_PROMPT = `You are a MASTER OF SEDUCTION and BODY LANGUAGE expert. User is ON A DATE checking phone secretly.

YOUR ENERGY: James Bond's confidence + psychology expert + natural seducer. Effortlessly magnetic.

🏳️‍🌈 LGBTQ+ AWARENESS - ADAPT YOUR ADVICE:

FOR GAY MEN (man dating man):
- Understand gay dating dynamics - often more direct, less games
- Gay humor is appreciated - witty, camp when appropriate, self-aware
- References to gay culture can be charming (but don't force it)
- Physical escalation often moves faster - read the room
- "Top/bottom energy" jokes can work if playful
- Grindr humor is relatable, app culture references work
- Gay bars have different energy than straight bars - lean into it

FOR LESBIAN WOMEN (woman dating woman):
- U-haul jokes are classic lesbian humor (moving in fast)
- Sapphic energy - often more emotional connection focused
- "Is this a date or are we just friends?" is relatable
- Flannel and cottagecore references can be cute
- Lesbian processing (talking about feelings) is normal
- Cat mom jokes, hiking date references
- Consent and communication are especially valued

FOR STRAIGHT DATING:
- Traditional flirtation dynamics work well
- Masculine/feminine energy interplay
- Classic romance tropes are appreciated

FOR ALL ORIENTATIONS:
- Adapt your tone to match their identity
- Be inclusive, never assume
- Queer people often appreciate directness
- Shared identity can be a bonding point
- LGBTQ+ spaces have their own vibe - reference appropriately

STRICT JSON FORMAT:
{
  "recommendation": "Strategic advice combining body language + words",
  "trySaying": "Smooth line to say - natural, creates tension",
  "bodyLanguage": "SPECIFIC body language instruction - eyes, posture, touch, proximity",
  "backup": "Alternative approach",
  "proTip": "6 words max",
  "vibe": "emoji"
}

🎭 BODY LANGUAGE MASTERY:

EYE CONTACT TECHNIQUES:
- Triangle gaze: Look at one eye, then the other, then lips, repeat
- 3-second hold: Lock eyes for 3 seconds, then slowly look away with a slight smile
- The glance-back: Look away, then glance back with a knowing smile
- Bedroom eyes: Slightly narrow eyes, relaxed face, hint of smile

POSTURE & PROXIMITY:
- Lean in 10-15% when they speak - shows interest
- Turn your body fully toward them (feet pointing at them)
- Take up space confidently, don't shrink
- Mirror their posture subtly (wait 2-3 seconds)
- Gradually decrease distance throughout the date

TOUCH ESCALATION LADDER:
1. "Safe" touches: Arm, shoulder, upper back (when laughing)
2. Playful touches: Gentle push, hand comparison, arm grab
3. Intimate touches: Lower back, waist, face, hair
4. Romantic touches: Hand holding, forehead touch, neck

FACIAL EXPRESSIONS:
- Slight smirk when teasing (one corner of mouth up)
- Raised eyebrow for playful challenge
- Slow smile that builds (more genuine than instant grin)
- Brief lip bite when looking at them (subtle, not creepy)

VOICE & PACE:
- Lower your voice slightly in intimate moments
- Pause before saying something meaningful
- Speak slower than normal - shows confidence
- Match then slightly lower their energy

POWER MOVES:
- The whisper: Lean in close to say something only they can hear
- The pull-back: Get close, then lean back - creates tension
- The pause: Stop mid-sentence, look at their lips, then continue
- The rescue touch: Guide them with hand on lower back

STAGE-SPECIFIC BODY LANGUAGE:
- JUST STARTED: Open posture, warm smile, gentle arm touches
- VIBING: Closer proximity, lingering eye contact, hand touches
- HEATING UP: Triangle gaze, lower back touches, whisper proximity
- WRAPPING UP: Full body facing, intense eye contact, almost-kiss closeness

NEVER: Cross arms, check phone, lean away, avoid eye contact, fidget

⚠️ IMPORTANT: All physical suggestions assume mutual interest and consent. Always read their body language - if they pull back, respect it.`;

export default function LiveWingmanCoach() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  // Simplified state
  const [dateStage, setDateStage] = useState('starting');
  const [dateVenue, setDateVenue] = useState('');
  const [situation, setSituation] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [myGender, setMyGender] = useState('man');
  const [datingGender, setDatingGender] = useState('woman');
  const [showMyGenderPicker, setShowMyGenderPicker] = useState(false);
  const [showDatingGenderPicker, setShowDatingGenderPicker] = useState(false);
  
  // Gender options
  const genderOptions = [
    { id: 'woman', label: 'Woman', emoji: '👩' },
    { id: 'man', label: 'Man', emoji: '👨' },
    { id: 'nonbinary', label: 'Non-binary', emoji: '🧑' },
  ];
  
  // Get orientation label for display and AI context
  const getOrientation = () => {
    if (myGender === 'man' && datingGender === 'woman') return { label: 'Straight', emoji: '💑', context: 'straight man dating a woman' };
    if (myGender === 'man' && datingGender === 'man') return { label: 'Gay', emoji: '👨‍❤️‍👨', context: 'gay man dating a man' };
    if (myGender === 'woman' && datingGender === 'man') return { label: 'Straight', emoji: '💑', context: 'straight woman dating a man' };
    if (myGender === 'woman' && datingGender === 'woman') return { label: 'Lesbian', emoji: '👩‍❤️‍👩', context: 'lesbian woman dating a woman' };
    if (myGender === 'nonbinary') return { label: 'Queer', emoji: '🏳️‍🌈', context: `non-binary person dating a ${datingGender}` };
    if (datingGender === 'nonbinary') return { label: 'Queer', emoji: '🏳️‍🌈', context: `${myGender} dating a non-binary person` };
    return { label: 'Dating', emoji: '💕', context: `${myGender} dating a ${datingGender}` };
  };
  
  // Ref for venue scroll container
  const venueScrollRef = useRef(null);
  
  // State to track if left arrow should be visible
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  
  // Handle scroll event to show/hide left arrow
  const handleVenueScroll = () => {
    if (venueScrollRef.current) {
      // Show left arrow if scrolled more than 10px from the start
      setShowLeftArrow(venueScrollRef.current.scrollLeft > 10);
    }
  };
  
  // Scroll functions for venue selector - smoother with larger scroll distance
  const scrollVenueLeft = () => {
    if (venueScrollRef.current) {
      venueScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollVenueRight = () => {
    if (venueScrollRef.current) {
      venueScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Date venue/location options
  const venueOptions = [
    { id: 'drinks', emoji: '🍸', label: 'Drinks', hint: 'Bar, pub, cocktails' },
    { id: 'dinner', emoji: '🍽️', label: 'Dinner', hint: 'Restaurant' },
    { id: 'coffee', emoji: '☕', label: 'Coffee', hint: 'Cafe, casual' },
    { id: 'walk', emoji: '🚶', label: 'Walk', hint: 'Park, city stroll' },
    { id: 'drive', emoji: '🚗', label: 'Drive', hint: 'Car date' },
    { id: 'cinema', emoji: '🎬', label: 'Cinema', hint: 'Movie theater' },
    { id: 'club', emoji: '🪩', label: 'Club', hint: 'Dancing, nightlife' },
    { id: 'home', emoji: '🏠', label: 'At home', hint: 'Their place or yours' },
    { id: 'hotel', emoji: '🏨', label: 'Hotel', hint: 'Private setting' },
    { id: 'activity', emoji: '🎳', label: 'Activity', hint: 'Bowling, mini golf' },
    { id: 'outdoors', emoji: '🌳', label: 'Outdoors', hint: 'Hike, beach, picnic' },
    { id: 'event', emoji: '🎉', label: 'Event', hint: 'Concert, party' }
  ];

  useEffect(() => {
    const userProfile = getProfile();
    setProfile(userProfile);
  }, []);

  // Simplified date stages - just 4 with emojis
  const dateStages = [
    { id: 'starting', emoji: '👋', label: 'Just started' },
    { id: 'vibing', emoji: '🔥', label: 'Vibing' },
    { id: 'heating', emoji: '💫', label: 'Heating up' },
    { id: 'ending', emoji: '🌙', label: 'Wrapping up' }
  ];

  // Simplified situations - context aware based on stage
  const getSituations = () => {
    if (dateStage === 'starting') {
      return [
        { id: 'nervous', emoji: '😰', label: "I'm nervous" },
        { id: 'awkward', emoji: '😬', label: "It's awkward" },
        { id: 'topics', emoji: '💬', label: 'What to talk about?' },
        { id: 'impress', emoji: '✨', label: 'How to impress?' }
      ];
    }
    
    if (dateStage === 'vibing') {
      return [
        { id: 'silence', emoji: '😶', label: "It's gone quiet" },
        { id: 'signals', emoji: '🤔', label: "Can't read them" },
        { id: 'deeper', emoji: '💭', label: 'Want to connect more' },
        { id: 'boring', emoji: '😴', label: "It's getting boring" }
      ];
    }

    if (dateStage === 'heating' || dateStage === 'heating_up') {
      return [
        { id: 'move', emoji: '💋', label: 'Make a move?' },
        { id: 'touch', emoji: '✋', label: 'Should I touch?' },
        { id: 'closer', emoji: '💓', label: 'Feeling the vibe' },
        { id: 'slow', emoji: '🐢', label: 'Too fast?' }
      ];
    }

    if (dateStage === 'ending') {
      return [
        { id: 'kiss', emoji: '💋', label: 'Go for the kiss?' },
        { id: 'number', emoji: '📱', label: 'Get their number' },
        { id: 'nextdate', emoji: '📅', label: 'Lock in date 2' },
        { id: 'invite', emoji: '🏠', label: 'Invite them over' }
      ];
    }

    // Fallback
    return [
      { id: 'silence', emoji: '😶', label: "It's gone quiet" },
      { id: 'signals', emoji: '🤔', label: "Can't read them" },
      { id: 'move', emoji: '💋', label: 'Make a move?' },
      { id: 'boring', emoji: '😴', label: "It's getting boring" }
    ];
  };

  // Quick action buttons based on context - 8 options per stage
  const getQuickActions = () => {
    if (dateStage === 'starting') {
      return [
        { id: 'icebreaker', emoji: '🧊', label: 'Break ice', color: 'from-cyan-500 to-blue-500' },
        { id: 'compliment', emoji: '🥰', label: 'Compliment', color: 'from-pink-500 to-rose-500' },
        { id: 'funny', emoji: '😂', label: 'Be funny', color: 'from-amber-500 to-yellow-500' },
        { id: 'confident', emoji: '💪', label: 'Confidence', color: 'from-purple-500 to-indigo-500' },
        { id: 'curious', emoji: '🤔', label: 'Ask questions', color: 'from-blue-500 to-indigo-500' },
        { id: 'relax', emoji: '😌', label: 'Stay relaxed', color: 'from-green-500 to-teal-500' },
        { id: 'mystery', emoji: '🎭', label: 'Be mysterious', color: 'from-violet-500 to-purple-500' },
        { id: 'connect', emoji: '🔗', label: 'Find common', color: 'from-orange-500 to-red-500' }
      ];
    }

    if (dateStage === 'vibing') {
      return [
        { id: 'flirt', emoji: '😏', label: 'Flirt more', color: 'from-pink-500 to-rose-500' },
        { id: 'tease', emoji: '😜', label: 'Tease them', color: 'from-amber-500 to-orange-500' },
        { id: 'deep', emoji: '💭', label: 'Get personal', color: 'from-blue-500 to-cyan-500' },
        { id: 'playful', emoji: '🎭', label: 'Be playful', color: 'from-violet-500 to-purple-500' },
        { id: 'challenge', emoji: '🎯', label: 'Challenge', color: 'from-red-500 to-pink-500' },
        { id: 'listen', emoji: '👂', label: 'Listen more', color: 'from-green-500 to-emerald-500' },
        { id: 'vulnerable', emoji: '💝', label: 'Open up', color: 'from-rose-500 to-pink-500' },
        { id: 'adventure', emoji: '🚀', label: 'Suggest fun', color: 'from-indigo-500 to-blue-500' }
      ];
    }

    if (dateStage === 'heating' || dateStage === 'heating_up') {
      return [
        { id: 'escalate', emoji: '😏', label: 'Be bolder', color: 'from-red-500 to-orange-500' },
        { id: 'touch', emoji: '✋', label: 'Touch more', color: 'from-pink-500 to-rose-500' },
        { id: 'tension', emoji: '⚡', label: 'Build tension', color: 'from-amber-500 to-yellow-500' },
        { id: 'bold', emoji: '💥', label: 'Be bold', color: 'from-purple-500 to-pink-500' },
        { id: 'whisper', emoji: '✋', label: 'Touch them', color: 'from-rose-500 to-red-500' },
        { id: 'eyecontact', emoji: '👀', label: 'Eye contact', color: 'from-blue-500 to-violet-500' },
        { id: 'slow', emoji: '🐢', label: 'Slow down', color: 'from-green-500 to-teal-500' },
        { id: 'tease_more', emoji: '😈', label: 'Tease hard', color: 'from-violet-500 to-purple-500' }
      ];
    }

    if (dateStage === 'ending') {
      return [
        { id: 'kiss', emoji: '💋', label: 'Go for kiss', color: 'from-pink-500 to-rose-500' },
        { id: 'number', emoji: '📱', label: 'Get number', color: 'from-green-500 to-emerald-500' },
        { id: 'date2', emoji: '📅', label: 'Lock date 2', color: 'from-purple-500 to-violet-500' },
        { id: 'memorable', emoji: '✨', label: 'End high', color: 'from-amber-500 to-yellow-500' },
        { id: 'smooth', emoji: '😎', label: 'Play smooth', color: 'from-blue-500 to-indigo-500' },
        { id: 'wanting', emoji: '🌙', label: 'Make them miss you', color: 'from-violet-500 to-purple-500' },
        { id: 'invite', emoji: '🏠', label: 'Invite over', color: 'from-red-500 to-pink-500' },
        { id: 'hug', emoji: '🤗', label: 'Perfect hug', color: 'from-rose-500 to-orange-500' }
      ];
    }

    // Fallback
    return [
      { id: 'flirt', emoji: '😏', label: 'Flirt harder', color: 'from-pink-500 to-rose-500' },
      { id: 'tease', emoji: '😜', label: 'Tease them', color: 'from-amber-500 to-orange-500' },
      { id: 'deep', emoji: '💭', label: 'Get personal', color: 'from-blue-500 to-cyan-500' },
      { id: 'escalate', emoji: '😏', label: 'Be bolder', color: 'from-red-500 to-orange-500' },
      { id: 'playful', emoji: '🎭', label: 'Be playful', color: 'from-violet-500 to-purple-500' },
      { id: 'bold', emoji: '💥', label: 'Be bold', color: 'from-purple-500 to-pink-500' },
      { id: 'connect', emoji: '🔗', label: 'Connect', color: 'from-green-500 to-emerald-500' },
      { id: 'smooth', emoji: '😎', label: 'Stay smooth', color: 'from-blue-500 to-indigo-500' }
    ];
  };

  // Generate AI response
  const generateResponse = async (actionType, context = '') => {
    setIsLoading(true);
    
    const stageContext = dateStages.find(s => s.id === dateStage)?.label || 'on a date';
    const situationContext = situation ? getSituations().find(s => s.id === situation)?.label : '';
    const venueContext = dateVenue ? venueOptions.find(v => v.id === dateVenue) : null;
    
    // Add randomness to ensure unique responses each time
    const randomSeed = Math.random().toString(36).substring(7);
    const toneOptions = ['flirty', 'confident', 'playful', 'mysterious', 'bold', 'charming', 'witty', 'smooth'];
    const randomTone = toneOptions[Math.floor(Math.random() * toneOptions.length)];
    
    // Get style and orientation context
    const styleContext = styleOptions.find(s => s.id === selectedStyle);
    const orientationContext = getOrientation();
    
    const prompt = `I'M ON A DATE RIGHT NOW. Quick real-time help needed!

DATE CONTEXT:
- I am a: ${genderOptions.find(g => g.id === myGender)?.label || 'person'}
- Dating a: ${genderOptions.find(g => g.id === datingGender)?.label || 'person'}
- Orientation: ${orientationContext.label} (${orientationContext.context})
- My communication style: ${styleContext?.label} (${styleContext?.description})
- Current stage: ${stageContext}
${venueContext ? `- Location: ${venueContext.label} (${venueContext.hint})` : ''}
${situationContext ? `- Current situation: ${situationContext}` : ''}
${context ? `- My question: ${context}` : ''}
- What I want to do: ${actionType}

IMPORTANT: I am ${orientationContext.context}. Tailor your advice for this specific dynamic.
${orientationContext.label === 'Gay' ? 'Include gay humor if appropriate - be witty, playful, and culturally aware.' : ''}
${orientationContext.label === 'Lesbian' ? 'Include sapphic energy - emotionally intelligent, direct, and culturally aware.' : ''}

Generate a UNIQUE response (seed: ${randomSeed}) with tone: ${randomTone}
Use a ${styleContext?.label?.toLowerCase() || 'confident'} approach - ${styleContext?.description || 'be bold and direct'}.

REQUIREMENTS:
1. Include a SMOOTH PHYSICAL ACTION appropriate for this stage and venue (touch arm, lean in, hand on back, etc.)
2. Include smooth WORDS TO SAY that sound natural, not scripted
3. Make it specific to the ${venueContext?.label || 'date'} setting
4. Match the ${stageContext} energy level

${stageContext === 'Just started' ? 'STAGE TIP: Keep it light - arm touches, genuine compliments, building comfort.' : ''}
${stageContext === 'Vibing' ? 'STAGE TIP: Start escalating - lean closer, lingering touches, playful teasing.' : ''}
${stageContext === 'Heating up' ? 'STAGE TIP: Be bold - hand on lower back, intense eye contact, almost-kiss moments.' : ''}
${stageContext === 'Wrapping up' ? 'STAGE TIP: Create anticipation or make your move - go for the kiss, leave them wanting more.' : ''}

Return JSON only:
{
  "recommendation": "Strategic advice - what to do",
  "trySaying": "Natural, smooth line to say",
  "bodyLanguage": "SPECIFIC body language: eye contact technique, touch, posture, or proximity move. Be precise like 'Lock eyes for 3 seconds, glance at their lips, then back to eyes with a slight smile'",
  "backup": "Alternative line or move",
  "proTip": "3-5 word wisdom",
  "vibe": "emoji"
}`;

    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        system_prompt: WINGMAN_SYSTEM_PROMPT,
        response_type: 'json'
      });

      let parsedResponse;
      
      // Handle different response types
      if (typeof aiResponse === 'string') {
        // Try to extract and parse JSON from string
        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.log('JSON parse error, using fallback:', parseError);
          parsedResponse = {
            recommendation: "Stay confident and be yourself",
            trySaying: "You've got my attention. What are you gonna do with it?",
            bodyLanguage: "Lean in slightly, hold eye contact for 3 seconds, then glance at their lips before looking back at their eyes with a slight smile.",
            backup: "Walk with me, I want to show you something.",
            proTip: "Confidence is everything",
            vibe: "🔥"
          };
        }
      } else if (typeof aiResponse === 'object' && aiResponse !== null) {
        // Already an object - check if it has the expected fields
        if (aiResponse.trySaying || aiResponse.recommendation) {
          parsedResponse = aiResponse;
        } else if (aiResponse.response && typeof aiResponse.response === 'string') {
          // Sometimes the response is wrapped in a response property
          try {
            const jsonMatch = aiResponse.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
              parsedResponse = JSON.parse(aiResponse.response);
            }
          } catch {
            parsedResponse = {
              recommendation: aiResponse.response,
              trySaying: "I like where this is going...",
              bodyLanguage: "Maintain confident eye contact, slight smile",
              backup: "Tell me more about that",
              proTip: "Be present",
              vibe: "✨"
            };
          }
        } else {
          // Unknown object structure, use as-is but ensure required fields
          parsedResponse = {
            recommendation: aiResponse.recommendation || "Stay confident and be yourself",
            trySaying: aiResponse.trySaying || "You're interesting. I like that.",
            bodyLanguage: aiResponse.bodyLanguage || "Lean in, maintain warm eye contact",
            backup: aiResponse.backup || "Tell me something unexpected about you",
            proTip: aiResponse.proTip || "Be authentic",
            vibe: aiResponse.vibe || "💫"
          };
        }
      } else {
        // Fallback for unexpected response types
        parsedResponse = {
          recommendation: "Stay confident and be yourself",
          trySaying: "You've got my attention. What are you gonna do with it?",
          bodyLanguage: "Lean in slightly, hold eye contact, smile warmly",
          backup: "Walk with me, I want to show you something.",
          proTip: "Confidence is everything",
          vibe: "🔥"
        };
      }
      
      // Ensure all required fields exist
      parsedResponse = {
        recommendation: parsedResponse.recommendation || "Stay present and confident",
        trySaying: parsedResponse.trySaying || "I like talking to you",
        bodyLanguage: parsedResponse.bodyLanguage || "Maintain eye contact and open body language",
        backup: parsedResponse.backup || "Tell me more",
        proTip: parsedResponse.proTip || "Be yourself",
        vibe: parsedResponse.vibe || "✨"
      };

      setResponse({
        ...parsedResponse,
        actionType,
        isAI: true
      });

    } catch (error) {
      console.error('AI Error:', error);
      
      // Check if user is online
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        // If online, retry with a simpler AI call
        try {
          const simplePrompt = `Quick dating advice for someone on a date. They want to: ${actionType}. 
          
Give specific advice with body language. Return JSON:
{
  "recommendation": "What to do (include a physical action)",
  "trySaying": "Smooth line to say",
  "bodyLanguage": "Specific body language technique",
  "backup": "Alternative approach",
  "proTip": "3-5 word wisdom",
  "vibe": "emoji"
}`;
          
          const retryResponse = await base44.integrations.Core.InvokeLLM({
            prompt: simplePrompt,
            response_type: 'json'
          });
          
          const parsed = typeof retryResponse === 'string' ? JSON.parse(retryResponse.match(/\{[\s\S]*\}/)?.[0] || '{}') : retryResponse;
          
          if (parsed.trySaying) {
            setResponse({ ...parsed, actionType, isAI: true });
            setIsLoading(false);
            return;
          }
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
          // Show error to user instead of fallback
          setResponse({
            recommendation: "Having trouble connecting to AI. Please check your connection and try again.",
            trySaying: "Tap 'Try another suggestion' to retry",
            bodyLanguage: "Take a deep breath, stay present in the moment",
            backup: "Trust your instincts - you've got this!",
            proTip: "Connection issue",
            vibe: "🔄",
            actionType,
            isAI: false,
            isError: true
          });
          setIsLoading(false);
          return;
        }
      }
      
      // ONLY use fallbacks if user is OFFLINE
      if (!isOnline) {
        console.log('User is offline - using fallback responses');
        const fallbackOptions = {
        // Starting stage actions
        "Break ice": [
          { recommendation: "Ask them something unexpected - 'What's the most spontaneous thing you've ever done?'", trySaying: "Okay real talk - what's your hot take on pineapple on pizza?", bodyLanguage: "Lean in slightly, maintain warm eye contact, smile genuinely when they answer. Nod slowly to show you're listening.", backup: "If you could be anywhere right now, where would it be?", proTip: "Weird questions > boring questions" },
          { recommendation: "Find common ground with an observation about your surroundings.", trySaying: "I have a theory about this place... want to hear it?", bodyLanguage: "Gesture subtly toward what you're observing, then turn your full body toward them. Open posture, relaxed shoulders.", backup: "Quick question - are you always this interesting or is it just tonight?", proTip: "Observations create conversations" },
          { recommendation: "Ask about their day in an unexpected way.", trySaying: "What's the best thing that happened to you today?", bodyLanguage: "Tilt your head slightly showing curiosity, rest your chin on your hand, maintain soft eye contact while they speak.", backup: "Tell me something that made you smile this week", proTip: "Positivity is attractive" }
        ],
        "Compliment": [
          { recommendation: "Notice something specific about them, not just their looks.", trySaying: "I like the way you laugh - it's contagious", bodyLanguage: "Look at their eyes warmly, let a genuine smile spread slowly across your face. Brief touch on their arm as you say it.", backup: "There's something about your energy that's really refreshing", proTip: "Specific beats generic" },
          { recommendation: "Compliment their vibe or energy, not just appearance.", trySaying: "You've got this energy... I can't quite put my finger on it but I like it", bodyLanguage: "Pause, look them up and down slowly (not creepy), then meet their eyes with a slight head tilt and mysterious smile.", backup: "The way you tell stories is actually captivating", proTip: "Unique compliments stick" },
          { recommendation: "Notice something they've chosen - style, accessories, expressions.", trySaying: "That [item] is a vibe - it suits you", bodyLanguage: "Gesture toward what you're complimenting, then bring your gaze back to their eyes. Lean in like you're sharing a secret.", backup: "I love how expressive your face is when you talk", proTip: "Choices > genetics" }
        ],
        "Be funny": [
          { recommendation: "Self-deprecating humor works. Don't try too hard.", trySaying: "I practiced my jokes in the mirror for this... and they still aren't funny", bodyLanguage: "Exaggerated disappointed face, then break into a real laugh. Relaxed shoulders, animated hand gestures.", backup: "I'm usually way cooler than this, I promise", proTip: "Laugh at yourself first" },
          { recommendation: "Make a playful observation about the situation.", trySaying: "I feel like we're both trying to be cool and it's adorable", bodyLanguage: "Gesture between the two of you with a knowing look, raise your eyebrows playfully, then lean back with a satisfied grin.", backup: "Should we pretend to be more sophisticated or just embrace the chaos?", proTip: "Self-aware is charming" },
          { recommendation: "Use absurd hypotheticals to be memorable.", trySaying: "Important question: in a fight between a taco and a burrito, who wins?", bodyLanguage: "Serious face like it's a real debate, count options on your fingers, then break character with a laugh when they respond.", backup: "If you had to describe yourself as a condiment, what would you be?", proTip: "Random is memorable" }
        ],
        // Vibing stage actions
        "Flirt more": [
          { recommendation: "Push-pull energy. Give a compliment, then playfully take it back.", trySaying: "You're actually kinda cute when you're not being annoying", bodyLanguage: "Lean in slightly with a playful smirk, hold eye contact for 2 seconds, then look away like you're considering something.", backup: "I can't tell if I like you or if you're just really good at this", proTip: "Tease, don't please" },
          { recommendation: "Create playful tension with a challenge.", trySaying: "You're trouble... I can tell", bodyLanguage: "Triangle gaze: look at one eye, then the other, then briefly at their lips. Slight head tilt with a knowing smile.", backup: "Keep looking at me like that and we're gonna have a problem", proTip: "Tension creates attraction" },
          { recommendation: "Use subtle physical escalation with words.", trySaying: "You're making it really hard to concentrate right now", bodyLanguage: "Touch their arm lightly while saying this, maintain eye contact, speak slightly slower than normal.", backup: "I should probably be listening but you're very distracting", proTip: "Implication is powerful" }
        ],
        "Tease them": [
          { recommendation: "Find something small to playfully mock. Keep it light.", trySaying: "Oh no, you're one of THOSE people aren't you?", bodyLanguage: "Raise one eyebrow, lean back slightly with arms crossed, smirk like you're judging them playfully.", backup: "I'm starting to regret giving you my attention", proTip: "Confidence is attractive" },
          { recommendation: "Mock their choices in a playful way.", trySaying: "That's your favorite? We might have to end this right now...", bodyLanguage: "Dramatic fake shock face, then break into a genuine smile. Light push on their shoulder.", backup: "I was into you until you said that... now I'm MORE into you", proTip: "Playful conflict creates chemistry" },
          { recommendation: "Act disappointed in an obviously joking way.", trySaying: "And here I thought you were perfect. Guess I was wrong.", bodyLanguage: "Shake your head slowly with a suppressed smile, maintain eye contact, then look away with an exaggerated sigh.", backup: "I'm disappointed in you. Also I'm lying. But also am I?", proTip: "Mixed signals = intrigue" }
        ],
        "Get personal": [
          { recommendation: "Ask about dreams, fears, or childhood memories.", trySaying: "What's something you've never told anyone on a first date?", bodyLanguage: "Lower your voice slightly, lean in closer, hold steady eye contact. Create intimacy with proximity.", backup: "When was the last time you felt truly alive?", proTip: "Vulnerability creates connection" },
          { recommendation: "Share something personal first to invite openness.", trySaying: "Can I tell you something I don't usually share?", bodyLanguage: "Pause before speaking, look down briefly then back up to their eyes. Speak softer than normal.", backup: "What's the bravest thing you've ever done?", proTip: "Go first to inspire" },
          { recommendation: "Ask about their passions, not their job.", trySaying: "What's something you could talk about for hours?", bodyLanguage: "Rest your hand near theirs on the table. Lean your head on your hand showing genuine interest.", backup: "If money didn't matter, what would you do every day?", proTip: "Dreams > details" }
        ],
        // Heating up stage actions
        "Be bolder": [
          { recommendation: "Slow down your speech. Hold eye contact longer. Move closer.", trySaying: "You need to stop looking at me like that...", bodyLanguage: "Lock eyes, pause for 3 full seconds, let your gaze drop to their lips for a moment, then back to their eyes with a slight smile.", backup: "I'm trying to focus but you're making it really hard", proTip: "Tension > words" },
          { recommendation: "Use silence and proximity to create tension.", trySaying: "Come closer... I can't hear you", bodyLanguage: "Lean in slowly, position your face 6-8 inches from theirs, speak softly, let the moment hang.", backup: "*move closer* That's better", proTip: "Actions speak louder" },
          { recommendation: "Lower your voice, lean in, slow down.", trySaying: "I've been thinking about something...", bodyLanguage: "Place your hand on their lower back, lean in close to their ear, speak just above a whisper, pause before the key words.", backup: "Can I tell you a secret?", proTip: "Whispers are intimate" }
        ],
        "Touch more": [
          { recommendation: "Start with arm or shoulder. Read their reaction before escalating.", trySaying: "Come closer, I want to tell you something", bodyLanguage: "Light touch on their forearm as you speak, let it linger 2-3 seconds. If they lean in, move to hand or lower back.", backup: "Give me your hand for a second", proTip: "Touch speaks louder" },
          { recommendation: "Find natural excuses for contact - cold hands, something on their face.", trySaying: "Wait, hold still... *touches face gently*", bodyLanguage: "Reach toward their face slowly, brush hair away or touch their cheek briefly. Maintain soft eye contact throughout.", backup: "Let me see your hands... as I thought, interesting", proTip: "Natural touch is best" },
          { recommendation: "Touch while making a point for emphasis.", trySaying: "No but seriously *touches arm* listen to this", bodyLanguage: "Grip their arm lightly as you make your point, don't let go immediately. Use touch to emphasize key words.", backup: "Come here *pulls slightly closer*", proTip: "Purposeful > random" }
        ],
        "Build tension": [
          { recommendation: "Pause mid-sentence. Look at their lips. Don't break eye contact first.", trySaying: "...", bodyLanguage: "Stop talking. Triangle gaze: eyes → lips → eyes. Lean in 10%. Let the silence build for 3-4 seconds.", backup: "*just hold eye contact and smile slightly*", proTip: "Silence is powerful" },
          { recommendation: "Say less. Let the moment breathe.", trySaying: "*pause, look at their lips, look back at eyes*", bodyLanguage: "Lower your voice to near-whisper. Slow your movements. Let your gaze linger on their lips before returning to eyes.", backup: "What?... *slight smile, hold eye contact*", proTip: "Less is more" },
          { recommendation: "Create a moment of charged silence.", trySaying: "You have really nice... *pause* ...energy", bodyLanguage: "Lean in as if to say something, pause 6 inches from their face, let the moment hang, then lean back with a knowing smile.", backup: "*lean in like you're going to say something, then don't*", proTip: "Almost-moments are magic" }
        ],
        // Ending stage actions  
        "Go for kiss": [
          { recommendation: "90/10 rule. Lean in 90%, let them close the gap.", trySaying: "I really want to kiss you right now", bodyLanguage: "Hold eye contact, glance at their lips, lean in slowly 90% of the way. Pause. Let them come the last 10%.", backup: "*lean in slowly, pause, let the moment build*", proTip: "Hesitation kills the moment" },
          { recommendation: "Make your intention known with confidence.", trySaying: "I'm thinking about kissing you", bodyLanguage: "Triangle gaze intensifies. Move closer. One hand on their waist or face. Speak slowly, lower voice.", backup: "Come here", proTip: "Confidence is key" },
          { recommendation: "Use words to build anticipation.", trySaying: "I've been thinking about this all night...", bodyLanguage: "Cup their face with one hand. Thumb gently on cheek. Eyes locked. Lean in slowly.", backup: "*look at lips, look at eyes, slight smile*", proTip: "Build-up matters" },
          { recommendation: "Create the moment with tension and eye contact.", trySaying: "Stop talking for a second...", bodyLanguage: "Place finger gently on their lips, then remove. Hold intense eye contact. Lean in.", backup: "*gentle touch on face, pause, lean in*", proTip: "Silence before the kiss" },
          { recommendation: "Be direct and bold. They'll respect it.", trySaying: "I'm going to kiss you now", bodyLanguage: "Cup their face with both hands. Pull them toward you gently. Kiss with intention, not hesitation.", backup: "*cup their face gently, lean in*", proTip: "Bold moves get bold results" },
          { recommendation: "Use humor to ease the tension, then go for it.", trySaying: "I've been trying not to kiss you all night... I'm failing", bodyLanguage: "Smile genuinely, shake your head slightly, then lean in confidently. Hand on their lower back.", backup: "Fair warning, I'm about to make a move", proTip: "Humor + action = perfect" }
        ],
        "Get number": [
          { recommendation: "Don't ask - tell. Hand them your phone.", trySaying: "Put your number in. I'm taking you somewhere better next time.", backup: "Save yourself as whatever you want me to remember you by", proTip: "Statement > question" },
          { recommendation: "Make it feel like a natural continuation.", trySaying: "I need to see you again - what's your number?", backup: "This isn't ending here. Give me your number.", proTip: "Certainty wins" },
          { recommendation: "Create urgency or playful demand.", trySaying: "Quick, give me your number before you realize I'm not this cool", backup: "I'm texting you tomorrow. Number. Now.", proTip: "Playful commands work" }
        ],
        "Lock date 2": [
          { recommendation: "Be specific about plans. Vague = forgettable.", trySaying: "I know a spot you'd love. We're going Thursday.", backup: "Clear your schedule Saturday. You'll thank me later.", proTip: "Certainty is magnetic" },
          { recommendation: "Suggest an activity you discussed during the date.", trySaying: "That thing you mentioned? We're doing it. Next week.", backup: "I already know where I'm taking you next. You'll love it.", proTip: "Callback shows you listened" },
          { recommendation: "Make them excited for what's coming.", trySaying: "Next time, I have something planned you won't forget", backup: "You free next weekend? Good. Keep it that way.", proTip: "Mystery creates anticipation" }
        ],
        // New ending stage options
        "Play smooth": [
          { recommendation: "Be cool, calm, collected. Don't seem too eager. Let them wonder about you.", trySaying: "I had a great time... we should do this again sometime", backup: "Tonight was fun. I'll text you.", proTip: "Cool confidence is magnetic" },
          { recommendation: "Leave with mystery. Don't give them everything tonight.", trySaying: "I'd stay longer but I've got an early morning... next time", backup: "This was nice. To be continued.", proTip: "Scarcity creates value" },
          { recommendation: "End on a high note without overdoing it.", trySaying: "I really enjoyed this. Let's definitely do it again soon", backup: "You're easy to talk to. That's rare.", proTip: "Genuine beats eager" },
          { recommendation: "Keep them guessing about how much you like them.", trySaying: "You're alright I guess... *smile* I'm kidding, tonight was great", backup: "Not bad for a first date. Let's see if you can top it next time.", proTip: "Playful uncertainty" },
          { recommendation: "Show interest but don't be clingy about it.", trySaying: "I'm gonna head out, but text me when you get home safe", backup: "This was fun. Don't be a stranger.", proTip: "Care without pressure" },
          { recommendation: "Leave them with a lingering thought.", trySaying: "You're definitely someone I want to know better", backup: "There's more to you than I expected. I like it.", proTip: "Intrigue creates desire" }
        ],
        "Make them miss you": [
          { recommendation: "End slightly before they expect. Leave them wanting more.", trySaying: "I should probably go... but I don't want to", bodyLanguage: "Hold their gaze, let out a small sigh, touch their hand briefly before pulling away slowly.", backup: "I have to leave but I really don't want this to end", proTip: "Always leave them wanting more" },
          { recommendation: "Create anticipation for next time.", trySaying: "Next time we're finishing what we started...", bodyLanguage: "Lean close to their ear, speak softly, then pull back with a knowing smile. Light touch on their arm.", backup: "To be continued. I promise it'll be worth the wait.", proTip: "Anticipation > instant gratification" },
          { recommendation: "Give them something to think about after you leave.", trySaying: "I'll be thinking about tonight... you should too", bodyLanguage: "Intense eye contact, slight smile, touch their face briefly, then step back maintaining eye contact.", backup: "Don't forget me too quickly", proTip: "Plant the seed" },
          { recommendation: "Make your exit memorable.", trySaying: "This was just the preview. The main show is next time.", bodyLanguage: "Wink or smirk as you say it. Turn to leave, then glance back one more time with a smile.", backup: "I'm leaving on purpose so you miss me", proTip: "Memorable exits matter" },
          { recommendation: "Show you're interested but still leaving.", trySaying: "I don't want to go but if I stay I might not leave", bodyLanguage: "Hand on their waist, pull them slightly closer, look at their lips, then step back with restraint.", backup: "You're making this really hard to leave...", proTip: "Desire + restraint = tension" },
          { recommendation: "Create future anticipation with a tease.", trySaying: "I have plans for us next time... you'll see", bodyLanguage: "Mysterious smile, raised eyebrow. Squeeze their hand once firmly before letting go.", backup: "You have no idea what I have planned for date two", proTip: "Mystery builds excitement" }
        ],
        "Invite over": [
          { recommendation: "Make it natural, not pushy. Have a genuine reason.", trySaying: "I have that thing I told you about at my place... want to see it?", bodyLanguage: "Casual posture, genuine smile, maintain comfortable eye contact. Don't lean in too eagerly.", backup: "My place isn't far. I make great coffee.", proTip: "Genuine invites work" },
          { recommendation: "Be direct but give them an easy out.", trySaying: "Want to come over? No pressure, but I'd love that", bodyLanguage: "Relaxed shoulders, warm smile, hold their hand lightly while asking. No pressure in your body language.", backup: "The night doesn't have to end here...", proTip: "Confidence with no pressure" },
          { recommendation: "Use something from earlier in the conversation.", trySaying: "Remember that song I mentioned? I'll play it for you at mine", bodyLanguage: "Playful expression, light touch on their arm, act like it just occurred to you naturally.", backup: "I promised to show you that thing. Tonight works.", proTip: "Callbacks create continuity" }
        ],
        "Perfect hug": [
          { recommendation: "Make it a real hug - not the awkward side hug. Hold for 3 seconds.", trySaying: "Come here... *pulls in for a proper hug*", bodyLanguage: "Open your arms confidently. Full body contact, not just shoulders. Hold for 3-4 seconds. Breathe them in.", backup: "*hug slightly longer than expected, then pull back slowly*", proTip: "A good hug says everything" },
          { recommendation: "Whisper something as you hug.", trySaying: "*during hug* I really had fun tonight", bodyLanguage: "Pull them in close. One arm around their waist, one higher on their back. Speak softly near their ear.", backup: "*hug* Text me when you're home safe", proTip: "Whispers are intimate" },
          { recommendation: "Let the hug linger slightly, then look at them before leaving.", trySaying: "*pull back from hug slowly, maintain eye contact, smile*", bodyLanguage: "Release slowly. Keep hands on their shoulders or arms for a moment. Hold eye contact. Small genuine smile.", backup: "*hug, pause, look at them* ...okay I'll go now", proTip: "The pause after matters" }
        ],
        // Additional options for other stages
        "Ask questions": [
          { recommendation: "Ask follow-up questions. Show you're genuinely interested.", trySaying: "Wait, tell me more about that - how did that happen?", backup: "That's interesting. What made you get into that?", proTip: "Curiosity is attractive" },
          { recommendation: "Ask questions that reveal personality, not just facts.", trySaying: "If you could do anything for a day with no consequences, what would it be?", backup: "What's something that always makes you smile?", proTip: "Interesting questions = interesting answers" }
        ],
        "Stay relaxed": [
          { recommendation: "Don't try too hard. Just be present and enjoy the moment.", trySaying: "I'm having a good time just hanging out like this", backup: "This is nice. No pressure, just vibes", proTip: "Relaxed energy is contagious" },
          { recommendation: "Let silences be comfortable, not awkward.", trySaying: "*comfortable silence, slight smile*", backup: "I like that we don't have to fill every second with words", proTip: "Comfort > performance" }
        ],
        "Be mysterious": [
          { recommendation: "Don't reveal everything. Let them wonder about you.", trySaying: "I'll tell you that story... but not tonight", backup: "There's a lot you don't know about me yet", proTip: "Mystery creates intrigue" },
          { recommendation: "Give partial answers that make them want to know more.", trySaying: "Let's just say I've had some interesting experiences...", backup: "That's a story for next time", proTip: "Curiosity keeps them hooked" }
        ],
        "Find common": [
          { recommendation: "Look for shared interests, experiences, or values.", trySaying: "Wait, you too? I thought I was the only one!", backup: "No way, I love that too! What are the chances?", proTip: "Connection through similarity" },
          { recommendation: "Build on common ground you discover.", trySaying: "Okay we need to do that together sometime", backup: "See, this is why we get along", proTip: "Common ground = bonding" }
        ],
        "Challenge": [
          { recommendation: "Playfully challenge them. Creates tension and attraction.", trySaying: "I bet you can't [playful challenge]", backup: "Oh really? Prove it.", proTip: "Challenges create investment" },
          { recommendation: "Challenge their opinions in a fun way.", trySaying: "That's a hot take... convince me", backup: "I'm not sure I believe you. Show me.", proTip: "Debate creates chemistry" }
        ],
        "Listen more": [
          { recommendation: "Put away distractions. Make them feel heard.", trySaying: "Hold on, I want to hear this properly", backup: "Wait, that's actually really interesting. Keep going.", proTip: "Feeling heard = feeling valued" },
          { recommendation: "Remember details and bring them up later.", trySaying: "Earlier you mentioned... I've been thinking about that", backup: "I noticed you said... what did you mean by that?", proTip: "Remembering = caring" }
        ],
        "Open up": [
          { recommendation: "Share something personal to invite them to do the same.", trySaying: "Can I tell you something I don't usually share?", backup: "I don't know why but I feel like I can be honest with you", proTip: "Vulnerability invites vulnerability" },
          { recommendation: "Be genuine about your feelings without being intense.", trySaying: "I'm actually really enjoying this more than I expected", backup: "Not gonna lie, you're different from what I expected. In a good way.", proTip: "Authentic beats rehearsed" }
        ],
        "Suggest fun": [
          { recommendation: "Propose something spontaneous or adventurous.", trySaying: "Want to do something random? Trust me.", backup: "I have an idea. You in?", proTip: "Spontaneity is exciting" },
          { recommendation: "Suggest continuing the date somewhere else.", trySaying: "I know a place you'd love. Let's go.", backup: "This is fun but I know something better. Come with me.", proTip: "Leading is attractive" }
        ],
        "Touch them": [
          { recommendation: "Use excuses to close physical distance - show them something, whisper.", trySaying: "Come closer, I want to tell you something", backup: "*lean in* Can you hear me okay?", proTip: "Proximity creates tension" },
          { recommendation: "Create reasons for closeness.", trySaying: "It's loud in here... *moves closer*", backup: "Here, look at this *holds phone close to them*", proTip: "Natural closeness" }
        ],
        "Eye contact": [
          { recommendation: "Hold eye contact slightly longer than comfortable. Then smile.", trySaying: "*hold gaze for 3 seconds, slight smile*", backup: "*look at their eyes, then lips, back to eyes*", proTip: "Eyes speak volumes" },
          { recommendation: "Use the triangle technique - eyes, lips, eyes.", trySaying: "Sorry I keep looking at you... you're distracting", backup: "*maintain eye contact* ...what were we talking about?", proTip: "Breaking eye contact is breaking tension" }
        ],
        "Slow down": [
          { recommendation: "If things feel rushed, pace yourself. Tension builds with time.", trySaying: "We have all night... no rush", backup: "I want to take my time with you", proTip: "Patience builds anticipation" },
          { recommendation: "Pull back slightly to build more tension.", trySaying: "Let's slow down... I want to enjoy this", backup: "There's no hurry. I'm not going anywhere.", proTip: "Slow burn > quick flash" }
        ],
        "Tease hard": [
          { recommendation: "Push the teasing further while keeping it playful.", trySaying: "You're making it really hard to be nice to you", backup: "I can't tell if I want to kiss you or argue with you", proTip: "Tension through playful conflict" },
          { recommendation: "Create push-pull dynamic.", trySaying: "You're so annoying... don't stop", backup: "I hate how much I like talking to you", proTip: "Mixed signals = attraction" }
        ]
      };
      
      // Helper to pick random option
      const pickRandomOption = (options) => options[Math.floor(Math.random() * options.length)];
      
      // Situation-specific fallbacks - MULTIPLE OPTIONS
      const situationFallbackOptions = {
        "silence": [
          { recommendation: "Break the silence with something random - awkward silences are only awkward if you make them awkward.", trySaying: "Okay what's something weird you believed as a kid?", backup: "I feel like we're in a staring contest and I'm losing", proTip: "Own the silence or break it boldly" },
          { recommendation: "Use the pause as an opportunity, not a problem.", trySaying: "You know what I like about you? *pause* I'll tell you later", backup: "I'm not good at small talk. Let's skip to the interesting stuff.", proTip: "Silence isn't always bad" },
          { recommendation: "Make an observation about the moment itself.", trySaying: "This is the part where one of us says something clever... no pressure", backup: "Should we just stare at each other or...?", proTip: "Meta-comments break tension" }
        ],
        "signals": [
          { recommendation: "When in doubt, test with light touch or a bold statement. Their reaction tells you everything.", trySaying: "I can't figure you out... and I kinda like it", backup: "So are we vibing or is this just polite conversation?", proTip: "Ask directly if unsure" },
          { recommendation: "Make a move and observe the response.", trySaying: "Come a little closer", backup: "I have a question but I need you to be honest with me", proTip: "Action reveals truth" },
          { recommendation: "Ask them directly in a playful way.", trySaying: "Real talk - do you actually like me or are you just being nice?", backup: "Give me a sign here... I'm working with limited information", proTip: "Direct can be charming" }
        ],
        "move": [
          { recommendation: "If you're thinking about it, do it. Hesitation shows more than action ever could.", trySaying: "I should probably keep my hands to myself but...", backup: "Come here", proTip: "Confidence > perfection" },
          { recommendation: "Lead with intention, not hesitation.", trySaying: "I've been thinking about doing something...", backup: "Can I be honest with you about something?", proTip: "Boldness is attractive" },
          { recommendation: "Close the gap with purpose.", trySaying: "Stay right there... *moves closer*", backup: "I want to try something", proTip: "Just do it" }
        ],
        "boring": [
          { recommendation: "Change the energy. Suggest something spontaneous or share something unexpected about yourself.", trySaying: "This is getting too normal. Want to do something stupid?", backup: "Let's play a game - you ask me anything, I have to answer honestly", proTip: "Unpredictable = unforgettable" },
          { recommendation: "Inject some chaos into the conversation.", trySaying: "Okay new rule - no boring answers allowed", backup: "Tell me something nobody else knows about you", proTip: "Surprise them" },
          { recommendation: "Change the scenery or activity.", trySaying: "Let's get out of here. I have an idea.", backup: "Want to do something random? Trust me.", proTip: "Movement creates energy" }
        ],
        "nervous": [
          { recommendation: "Own your nerves out loud - vulnerability is attractive when paired with humor.", trySaying: "I'm totally cool and not nervous at all... okay I lied", backup: "Fair warning: I might say something dumb because you're really pretty", proTip: "Authentic beats polished" },
          { recommendation: "Turn anxiety into connection.", trySaying: "Is it obvious I'm nervous? Because I definitely am", backup: "Okay I'll admit it - I was nervous to meet you. You're intimidating.", proTip: "Vulnerability is strength" },
          { recommendation: "Use humor to acknowledge the feeling.", trySaying: "My brain is doing that thing where it forgets words because you're attractive", backup: "Sorry if I'm weird, I'm actually trying really hard right now", proTip: "Honest is endearing" }
        ],
        "awkward": [
          { recommendation: "Call out the awkwardness directly. Naming it destroys its power.", trySaying: "Well this is awkward... want to make it weirder?", backup: "We're both being weird right? Or is it just me?", proTip: "Lean into the awkward" },
          { recommendation: "Turn the awkward into a shared joke.", trySaying: "I think we just had a moment. Or maybe that was just me", backup: "Should we acknowledge how weird this is or just power through?", proTip: "Shared awkwardness bonds" },
          { recommendation: "Reset with something absurd.", trySaying: "Okay pretend I just walked in and said something really smooth", backup: "Let me try that again. *clears throat* Hey, how YOU doin?", proTip: "Absurdity breaks tension" }
        ],
        "topics": [
          { recommendation: "Ask about their passions, not their job. What makes them lose track of time?", trySaying: "What's something you could talk about for hours?", backup: "Okay rapid fire - morning person or night owl?", proTip: "Passion creates connection" },
          { recommendation: "Go for interesting hypotheticals.", trySaying: "If you could have dinner with anyone, dead or alive, who?", backup: "What's your most controversial opinion?", proTip: "Unique questions = memorable" },
          { recommendation: "Ask about their dreams and goals.", trySaying: "If you won the lottery tomorrow, what's the first thing you'd do?", backup: "What's on your bucket list that you haven't done yet?", proTip: "Dreams reveal character" }
        ],
        "impress": [
          { recommendation: "Don't try to impress - be impressed. Ask follow-up questions. Remember details.", trySaying: "Wait, tell me more about that - that's actually fascinating", backup: "I've never met anyone who [thing they mentioned]. That's cool.", proTip: "Interest > impressive" },
          { recommendation: "Be genuinely curious about them.", trySaying: "How did you get into that? That's really interesting", backup: "I want to know more about that. Seriously.", proTip: "Curiosity is attractive" },
          { recommendation: "Make them feel like the interesting one.", trySaying: "You're way more interesting than I expected", backup: "Stop, you're making me look boring", proTip: "Make them the star" }
        ]
      };
      
      // Default fallbacks for when nothing matches - expanded for variety
      const defaultFallbacks = [
        { recommendation: "The vibe is there. Stop overthinking and make your move.", trySaying: "You have my full attention... what are you gonna do with it?", bodyLanguage: "Lean in, lock eyes, let a slow smile spread. Turn your body fully toward them.", backup: "Walk with me, I want to show you something", proTip: "Action beats hesitation" },
        { recommendation: "Be present. Put down your phone, make eye contact, listen.", trySaying: "Tell me something real about you", bodyLanguage: "Phone away. Square your shoulders toward them. Lean slightly forward. Nod as they speak.", backup: "I'm curious about something...", proTip: "Presence is attractive" },
        { recommendation: "Lead the conversation somewhere interesting.", trySaying: "Let's play a game - truth or dare?", bodyLanguage: "Playful expression, raised eyebrow, lean back confidently like you're in charge.", backup: "I have a question but you have to answer honestly", proTip: "Take the lead" },
        { recommendation: "Create a moment of genuine connection.", trySaying: "Can I be honest with you about something?", bodyLanguage: "Lower your voice, lean in closer, pause before speaking. Maintain soft eye contact.", backup: "There's something about you I can't figure out", proTip: "Honesty creates intimacy" },
        { recommendation: "Show confidence by being direct about your interest.", trySaying: "I'm really glad we did this", bodyLanguage: "Warm genuine smile, hold their gaze for 3 seconds, light touch on their arm.", backup: "You're even better in person", proTip: "Direct compliments work" },
        { recommendation: "Keep them engaged with your energy.", trySaying: "Okay your turn - tell me something interesting about yourself", bodyLanguage: "Animated expression, use hands when talking, mirror their energy level.", backup: "What's the craziest thing you've ever done?", proTip: "Energy is contagious" },
        { recommendation: "Be playfully mysterious.", trySaying: "I'll tell you a secret but you have to keep it", bodyLanguage: "Lean in conspiratorially, lower your voice to a near-whisper, glance around playfully.", backup: "There's something I've been wanting to say all night...", proTip: "Mystery intrigues" },
        { recommendation: "Match and mirror their energy.", trySaying: "I like your vibe. It matches mine.", bodyLanguage: "Subtly mirror their posture. If they lean in, you lean in. Match their pace.", backup: "We have the same energy. I noticed that.", proTip: "Similarity bonds" },
        { recommendation: "Create an inside joke together.", trySaying: "Okay that's our thing now. We can never tell anyone.", bodyLanguage: "Conspiratorial smile, maybe a wink. Lean in like you're sharing a secret.", backup: "This is going to be our secret", proTip: "Shared secrets connect" },
        { recommendation: "Show genuine appreciation.", trySaying: "I haven't laughed like this in a while", bodyLanguage: "Genuine smile that reaches your eyes. Relaxed posture. Brief touch on their hand.", backup: "You're refreshing. Most people aren't like you.", proTip: "Appreciation is attractive" }
      ];
      
      // Try situation first, then action type, then default
      let fb;
      if (situation && situationFallbackOptions[situation]) {
        fb = pickRandomOption(situationFallbackOptions[situation]);
      } else if (actionType && fallbackOptions[actionType]) {
        fb = pickRandomOption(fallbackOptions[actionType]);
          } else {
        fb = pickRandomOption(defaultFallbacks);
      }

        setResponse({
          recommendation: fb.recommendation,
          trySaying: fb.trySaying,
          bodyLanguage: fb.bodyLanguage || "Stay calm and present. Maintain relaxed, open body language.",
          backup: fb.backup,
          proTip: fb.proTip,
          vibe: "💫",
          actionType,
          isAI: false,
          isOffline: true
        });
      } // end of if (!isOnline)
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    generateResponse(action.label);
  };

  const handleSituationSelect = (sit) => {
    setSituation(sit.id);
    generateResponse(sit.label);
  };

  const handleCustomQuestion = () => {
    if (customQuestion.trim()) {
      generateResponse('custom question', customQuestion);
      setCustomQuestion('');
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Communication style options
  const styleOptions = [
    { id: 'playful', label: 'Playful', emoji: '😊', description: 'Fun, teasing, lighthearted' },
    { id: 'confident', label: 'Confident', emoji: '😎', description: 'Bold, direct, assertive' },
    { id: 'smooth', label: 'Smooth', emoji: '🎩', description: 'Charming, suave, sophisticated' },
    { id: 'mysterious', label: 'Mysterious', emoji: '🌙', description: 'Intriguing, leave them wanting more' },
    { id: 'romantic', label: 'Romantic', emoji: '💕', description: 'Sweet, sincere, heartfelt' },
    { id: 'witty', label: 'Witty', emoji: '🧠', description: 'Clever, quick, intellectual' },
  ];
  
  const [selectedStyle, setSelectedStyle] = useState('playful');
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showStylePicker || showMyGenderPicker || showDatingGenderPicker) {
        if (!e.target.closest('.dropdown-container')) {
          setShowStylePicker(false);
          setShowMyGenderPicker(false);
          setShowDatingGenderPicker(false);
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showStylePicker, showMyGenderPicker, showDatingGenderPicker]);
  
  // Combined date progression stages
  const dateProgressStages = [
    { id: 'just_met', emoji: '👋', label: 'Just Met', stage: 'starting', venue: null },
    { id: 'drinks', emoji: '🍸', label: 'Drinks', stage: 'vibing', venue: 'drinks' },
    { id: 'dinner', emoji: '🍽️', label: 'Dinner', stage: 'vibing', venue: 'dinner' },
    { id: 'activity', emoji: '🎯', label: 'Activity', stage: 'vibing', venue: 'activity' },
    { id: 'walking', emoji: '🌙', label: 'Walking', stage: 'vibing', venue: 'walk' },
    { id: 'car_ride', emoji: '🚗', label: 'Car/Ride', stage: 'heating_up', venue: 'drive' },
    { id: 'heating_up', emoji: '🔥', label: 'Heating Up', stage: 'heating_up', venue: null },
    { id: 'ending', emoji: '💋', label: 'Ending', stage: 'ending', venue: null },
  ];
  
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);
  
  // Handle date progress selection
  const handleProgressSelect = (index) => {
    setCurrentProgressIndex(index);
    const selected = dateProgressStages[index];
    setDateStage(selected.stage);
    if (selected.venue) {
      setDateVenue(selected.venue);
    }
    setResponse(null);
  };

  return (
    <div className="w-full min-h-screen pb-24 relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        
        {/* ===== NEW HEADER DESIGN ===== */}
        <div className="px-5 pt-6 pb-4">
          {/* Top row: Logo + Title + Shooting star */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Orange lightning icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Live Wingman <span className="text-xl">⚡</span>
                </h1>
                <p className="text-sm text-slate-400">Real-time date coaching</p>
              </div>
            </div>
            {/* Shooting star icon */}
            <div className="text-3xl animate-pulse">💫</div>
          </div>

          {/* Style Dropdown - Full width */}
          <div className="mb-4">
            <div className="relative dropdown-container">
              <button 
                onClick={() => {
                  setShowStylePicker(!showStylePicker);
                  setShowMyGenderPicker(false);
                  setShowDatingGenderPicker(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{styleOptions.find(s => s.id === selectedStyle)?.emoji}</span>
                  <span className="text-white text-sm">Style: <span className="font-semibold">{styleOptions.find(s => s.id === selectedStyle)?.label}</span></span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showStylePicker ? 'rotate-180' : ''}`} />
              </button>
              
              {showStylePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-2xl overflow-hidden z-50 shadow-xl shadow-black/50">
                  {styleOptions.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setSelectedStyle(style.id);
                        setShowStylePicker(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/80 transition-colors ${
                        selectedStyle === style.id ? 'bg-purple-500/20 border-l-2 border-purple-500' : ''
                      }`}
                    >
                      <span className="text-xl">{style.emoji}</span>
                      <div className="text-left">
                        <p className="text-white text-sm font-medium">{style.label}</p>
                        <p className="text-slate-400 text-xs">{style.description}</p>
                      </div>
                      {selectedStyle === style.id && <span className="ml-auto text-purple-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* I am & Dating row */}
          <div className="flex gap-3 mb-6">
            {/* I am Dropdown */}
            <div className="flex-1 relative dropdown-container">
              <button 
                onClick={() => {
                  setShowMyGenderPicker(!showMyGenderPicker);
                  setShowDatingGenderPicker(false);
                  setShowStylePicker(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{genderOptions.find(g => g.id === myGender)?.emoji}</span>
                  <span className="text-white text-sm">I am: <span className="font-semibold">{genderOptions.find(g => g.id === myGender)?.label}</span></span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMyGenderPicker ? 'rotate-180' : ''}`} />
              </button>
              
              {showMyGenderPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-2xl overflow-hidden z-50 shadow-xl shadow-black/50">
                  {genderOptions.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setMyGender(g.id);
                        setShowMyGenderPicker(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/80 transition-colors ${
                        myGender === g.id ? 'bg-blue-500/20 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <p className="text-white text-sm font-medium">{g.label}</p>
                      {myGender === g.id && <span className="ml-auto text-blue-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Dating Dropdown */}
            <div className="flex-1 relative dropdown-container">
              <button 
                onClick={() => {
                  setShowDatingGenderPicker(!showDatingGenderPicker);
                  setShowMyGenderPicker(false);
                  setShowStylePicker(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl hover:border-pink-500/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{genderOptions.find(g => g.id === datingGender)?.emoji}</span>
                  <span className="text-white text-sm">Dating: <span className="font-semibold">{genderOptions.find(g => g.id === datingGender)?.label}</span></span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDatingGenderPicker ? 'rotate-180' : ''}`} />
              </button>
              
                  {showDatingGenderPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-2xl overflow-hidden z-50 shadow-xl shadow-black/50">
                  {genderOptions.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setDatingGender(g.id);
                        setShowDatingGenderPicker(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/80 transition-colors ${
                        datingGender === g.id ? 'bg-pink-500/20 border-l-2 border-pink-500' : ''
                      }`}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <p className="text-white text-sm font-medium">{g.label}</p>
                      {datingGender === g.id && <span className="ml-auto text-pink-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date Stage Selection - 4 stages */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h3 className="text-base font-semibold text-white">Date stage</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{dateStages.findIndex(s => s.id === dateStage) + 1}/{dateStages.length}</span>
                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${((dateStages.findIndex(s => s.id === dateStage) + 1) / dateStages.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 4 Stage buttons */}
            <div className="flex gap-2">
              {dateStages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => {
                    setDateStage(stage.id);
                    setResponse(null);
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                    dateStage === stage.id 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30' 
                      : 'bg-slate-800/80 border border-slate-700 hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-2xl">{stage.emoji}</span>
                  <span className={`text-xs font-medium ${dateStage === stage.id ? 'text-white' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Where are you right now? - Venue Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <h3 className="text-base font-semibold text-white">Where are you right now?</h3>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                SWIPE <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            
            {/* Venue slider with arrows */}
            <div className="relative">
              {/* Left Arrow - only show if scrolled */}
              {showLeftArrow && (
                <button
                  onClick={scrollVenueLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-slate-800/95 border border-slate-600 rounded-full flex items-center justify-center text-white hover:bg-slate-700 shadow-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              
              {/* Venue options */}
              <div 
                ref={venueScrollRef}
                onScroll={handleVenueScroll}
                className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth px-1"
              >
                {venueOptions.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => {
                      setDateVenue(venue.id);
                      setResponse(null);
                    }}
                    className={`flex flex-col items-center gap-1 min-w-[70px] transition-all ${
                      dateVenue === venue.id ? 'scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      dateVenue === venue.id 
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/40' 
                        : 'bg-slate-800/80 border border-slate-700'
                    }`}>
                      <span className="text-2xl">{venue.emoji}</span>
                    </div>
                    <span className={`text-xs font-medium ${dateVenue === venue.id ? 'text-orange-400' : 'text-slate-400'}`}>
                      {venue.label}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Right Arrow */}
              <button
                onClick={scrollVenueRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-slate-800/95 border border-slate-600 rounded-full flex items-center justify-center text-white hover:bg-slate-700 shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="px-5 mb-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-2xl">{dateStages.find(s => s.id === dateStage)?.emoji || '👋'}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  {dateStages.find(s => s.id === dateStage)?.label || 'Just started'}
                  {dateVenue && (
                    <span className="text-orange-400 text-sm">
                      @ {venueOptions.find(v => v.id === dateVenue)?.label}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {dateStage === 'starting' && 'First impressions • Breaking the ice'}
                  {dateStage === 'vibing' && 'Building connection • Keep it flowing'}
                  {(dateStage === 'heating' || dateStage === 'heating_up') && 'Chemistry building • Make your move'}
                  {dateStage === 'ending' && 'Closing time • Leave them wanting more'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xl">{getOrientation().emoji}</span>
              <span className="text-[10px] text-slate-400">{styleOptions.find(s => s.id === selectedStyle)?.label}</span>
            </div>
          </div>
        </div>
                    
        {/* What's happening? - Situations/Problems */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl animate-pulse">🤔</span>
            <h3 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              What's happening?
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {getSituations().map((sit) => (
              <button
                key={sit.id}
                onClick={() => handleSituationSelect(sit)}
                disabled={isLoading}
                className={`p-4 rounded-2xl text-center transition-all active:scale-95 disabled:opacity-50 ${
                  situation === sit.id
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 hover:border-purple-500/50'
                }`}
              >
                <span className="text-3xl block mb-2">{sit.emoji}</span>
                <span className="text-sm font-medium text-white">{sit.label}</span>
                  </button>
            ))}
          </div>
          </div>

        {/* What do you want to do? - Actions */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Make your move
            </h3>
            <span className="text-2xl animate-bounce">⚡</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {getQuickActions().map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                className={`px-2 py-2.5 bg-gradient-to-r ${action.color} rounded-xl font-medium text-white text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:shadow-xl hover:scale-105 flex flex-col items-center gap-1`}
              >
                <span className="text-lg">{action.emoji}</span>
                <span className="truncate w-full text-center">{action.label}</span>
              </button>
            ))}
              </div>
              </div>

        {/* Loading State */}
        {isLoading && (
          <div className="px-5 mb-6">
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-3xl p-8 text-center">
              <div className="inline-block mb-4">
                <div className="relative">
                  <div className="text-5xl animate-bounce">🧠</div>
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin absolute -bottom-1 -right-1" />
            </div>
          </div>
              <p className="text-white font-semibold text-lg mb-1">Reading the room...</p>
              <p className="text-purple-300 text-sm">Cooking up something smooth 🍳</p>
        </div>
          </div>
        )}

        {/* Response Panel - Fun and clean */}
        {response && !isLoading && (
        <div className="px-5 mb-6">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-5 py-4 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                    <span className="text-4xl">{response.vibe || '🔥'}</span>
                    <div>
                      <p className="text-white font-bold text-lg">Here's the play</p>
                      <p className="text-purple-300 text-sm">{response.actionType}</p>
            </div>
              </div>
                  {response.isAI ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-full">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-300">AI Live</span>
              </div>
                  ) : response.isOffline ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-slate-500/20 to-gray-500/20 border border-slate-500/40 rounded-full">
                      <span className="text-xs">📴</span>
                      <span className="text-xs font-medium text-slate-300">Offline Mode</span>
                    </div>
                  ) : response.isError ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-full">
                      <span className="text-xs">⚠️</span>
                      <span className="text-xs font-medium text-red-300">Retry</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-medium text-amber-300">Quick Tip</span>
                    </div>
                  )}
            </div>
          </div>

              <div className="p-5 space-y-4">
                {/* Main recommendation */}
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                  <p className="text-white text-base leading-relaxed">
                    {typeof response.recommendation === 'string' && !response.recommendation.startsWith('{') 
                      ? response.recommendation 
                      : "Stay confident and make your move"}
                  </p>
          </div>

                {/* What to say */}
                <div>
                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">💬 Say this:</p>
                  <div className="flex items-start gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                    <p className="text-emerald-200 text-base flex-1 font-medium">"{response.trySaying}"</p>
                  <button
                      onClick={() => copyToClipboard(response.trySaying)}
                      className="text-emerald-400 hover:text-emerald-300 shrink-0 p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
            </div>
          </div>

                {/* Body Language */}
                {response.bodyLanguage && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">🎭 Body Language:</p>
                    <div className="p-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/30 rounded-2xl">
                      <p className="text-rose-200 text-sm leading-relaxed">{response.bodyLanguage}</p>
                    </div>
                  </div>
                )}

                {/* Backup */}
                {response.backup && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">🔄 Or try:</p>
                    <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-xl">
                      <p className="text-slate-300 text-sm italic">"{response.backup}"</p>
              </div>
            </div>
          )}

                {/* Pro Tip */}
                {response.proTip && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <span className="text-2xl">💎</span>
                    <p className="text-amber-200 text-sm font-medium">{response.proTip}</p>
        </div>
                )}

                {/* Try Another Button */}
                <button
                  onClick={() => generateResponse(response.actionType)}
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Getting new suggestion...' : 'Try another suggestion'}
                </button>

                {/* Consent Disclaimer */}
                <p className="text-center text-slate-500 text-[10px] mt-3 leading-relaxed">
                  💝 All suggestions assume mutual interest. Always respect boundaries and obtain consent.
                </p>
          </div>
        </div>
          </div>
        )}

        {/* Ask Anything - Simplified */}
        <div className="px-5 mb-6">
          <div className="bg-gradient-to-br from-slate-800/80 to-purple-900/30 border border-purple-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-lg">💬</span>
              <p className="text-sm font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Ask me anything
              </p>
              <span className="text-lg animate-pulse">✨</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Should I go for the kiss?"
                className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
              />
              <Button
                onClick={handleCustomQuestion}
                disabled={!customQuestion.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-5 rounded-xl disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* More Options - Always visible */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <h3 className="text-base font-semibold text-white">More moves</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compliment', emoji: '🥰', label: 'Compliment' },
              { id: 'joke', emoji: '😂', label: 'Tell a joke' },
              { id: 'story', emoji: '📖', label: 'Share story' },
              { id: 'question', emoji: '❓', label: 'Ask them' },
              { id: 'pullback', emoji: '↩️', label: 'Pull back' },
              { id: 'rescue', emoji: '🆘', label: 'Save it' }
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => generateResponse(action.label)}
                disabled={isLoading}
                className="p-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl text-center transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="text-2xl block mb-1">{action.emoji}</span>
                <span className="text-xs text-slate-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Encouragement footer */}
        <div className="px-5 text-center mb-4">
          <p className="text-slate-500 text-sm">
            You got this! 💪 Be confident, be yourself.
          </p>
        </div>
        
        {/* Consent Reminder */}
        <div className="px-5 mb-8">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💝</span>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Remember: Consent is everything</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  All suggestions assume mutual interest and attraction. Always read body language, respect boundaries, and ensure enthusiastic consent before physical escalation. If they seem uncomfortable, back off gracefully. A good connection is built on mutual respect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
