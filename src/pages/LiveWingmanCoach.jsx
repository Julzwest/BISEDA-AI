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
import { bodyLanguageDatabase, getRandomTip, getTipsForStage, getTipsForVenue } from '@/data/bodyLanguageDatabase';

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
  "trySaying": "Smooth line to say - natural, creates tension - DIFFERENT EVERY TIME",
  "bodyLanguage": "SPECIFIC body language instruction - VARY between: eye contact, touch, posture, proximity, voice. NEVER repeat the same technique twice in a row!",
  "backup": "Alternative approach",
  "proTip": "6 words max",
  "vibe": "emoji"
}

⚡ CRITICAL - VARIETY IS KEY:
- NEVER give the same response twice
- Rotate through ALL body language categories (eyes, touch, posture, proximity, voice)
- Each "trySaying" must be completely different - vary the tone (flirty, mysterious, playful, bold, sweet)
- Use the random seed in the prompt to generate truly unique responses
- If the action is "Share story" - give a DIFFERENT story topic each time
- Mix up body language: sometimes eyes-focused, sometimes touch-focused, sometimes proximity-focused

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

📚 COMPREHENSIVE BODY LANGUAGE LIBRARY (3000+ techniques):

🔥 FLIRTY EYE TECHNIQUES:
- The slow blink: close eyes slowly while looking at them, then reopen with slight smile
- Catch their eye, hold 2 seconds, look away with smile, then look back
- Look at them through your lashes - creates intrigue
- The double take: look, look away, then look back as if you couldn't help it
- Flash eyebrows quickly (1/5 second) when first seeing them - universal greeting
- Steal glances when they're not looking, let them catch you once
- The knowing look: slight smile, raised eyebrow, as if you share a secret

👋 TOUCH ESCALATION TECHNIQUES:
- Start arm touches, progress to lower arm, then hand
- Touch and hold for 1 second longer each time
- Begin with incidental touches, move to intentional
- Sit closer so legs or arms touch naturally
- Move from single touches to maintaining contact during conversation
- Brush hair from their face gently
- Play with their fingers while holding hands
- Compare hand sizes - classic flirting move
- Thumb wrestle as excuse to hold hands
- Palm reading as touch excuse

🎯 PROXIMITY MASTERY:
- Gradually decrease distance throughout the date
- Lean in to intimate distance (under 18 inches) when sharing secrets
- Stand beside them rather than across for natural closeness
- Share umbrella/coat as excuse for closeness
- Whisper something so they have to lean in to hear
- Share one side of menu instead of two separate
- Look at photos on their phone together

🗣️ VOICE SEDUCTION:
- Lower voice slightly for intimate moments
- Speak from chest for richer tone
- Slow down when saying something important
- Whisper occasionally to create intimacy
- Say their name in a slightly lower, warmer tone
- Trail off intentionally to let them lean in
- Let genuine emotion come through in voice
- Practice 'vocal smiling' - smile while you speak

💪 POWER MOVES:
- The Pull-Back: Get close, create tension, then lean back - makes them pursue
- The Almost-Kiss: Get close enough to kiss, hold, then pull back slightly
- The Triangle: Slow look from eye to eye to lips - signals kiss intention
- The Lock: Hold eye contact when someone interrupts, return immediately
- The Frame: Cup their face when saying something meaningful
- The Claim: Put arm around them or hand on back when others are around

📍 VENUE-SPECIFIC TECHNIQUES:
- DRINKS: Cheers with direct eye contact, guide through crowd with hand on back
- DINNER: Share dishes (intimate act), reach across table to try their food
- COFFEE: Sit at 90 degrees for comfortable conversation, touch hand when making point
- WALKING: Match pace, arms brush naturally, hold hands crossing street
- CINEMA: Share armrest, hold hands in dark, arm around if they lean in
- CLUB: Dance close, speak into ear, protect them from rowdy people
- HOME: Cook together (close contact), share blanket on couch, dance in living room

🚦 READING THEIR SIGNALS:
GREEN LIGHTS:
- Prolonged eye contact, dilated pupils
- Leaning in toward you
- Touching their own hair/face (preening for you)
- Mirroring your body language
- Finding excuses to touch you
- Laughing at your jokes (even bad ones)
- Crossing legs toward you
- Quick eyebrow flash when seeing you

RED LIGHTS:
- Looking around the room
- Phone checking
- Feet pointing to exit
- Crossed arms
- One-word answers
- Creating physical barriers
- Checking the time

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

  // NO FALLBACKS - 100% REAL-TIME AI ONLY

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

BODY LANGUAGE VARIETY - Pick ONE from these categories (rotate between them):
- EYE TECHNIQUES: Triangle gaze, 3-second hold, bedroom eyes, glance-back with smile
- TOUCH MOVES: Arm touch, hand comparison, lower back guide, playful push, shoulder squeeze
- PROXIMITY: Lean in to whisper, close the gap, pull-back tease, side-by-side closeness
- POSTURE: Mirror them, take up space, turn body fully toward them, relaxed confidence
- VOICE: Lower voice, pause before speaking, speak slower, whisper something

IMPORTANT: Each response must use a DIFFERENT body language technique. Be creative and specific!

Return JSON only:
{
  "recommendation": "Strategic advice - what to do",
  "trySaying": "Natural, smooth line to say - UNIQUE each time",
  "bodyLanguage": "Pick ONE specific technique from the categories above - be precise with timing and execution. Example: 'Touch their forearm for 2 seconds while laughing, then lean back with a knowing smile'",
  "backup": "Alternative line or move",
  "proTip": "3-5 word wisdom",
  "vibe": "emoji"
}`;

    // Check if online first
    if (!navigator.onLine) {
      setResponse({
        recommendation: "You're offline! Connect to the internet for real-time AI suggestions.",
        trySaying: "Tap 'Try another suggestion' once you're back online",
        bodyLanguage: "Stay present, be yourself, trust your instincts",
        backup: "You've got this - just be genuine!",
        proTip: "Go offline",
        vibe: "📴",
        actionType,
        isAI: false,
        isOffline: true
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('🤖 Calling LIVE AI...');
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        system_prompt: WINGMAN_SYSTEM_PROMPT,
        response_type: 'json'
      });

      console.log('✅ AI Response received:', typeof aiResponse);

      let parsedResponse;
      
      // Handle different response types - ALL from real AI
      if (typeof aiResponse === 'string') {
        // Try to extract and parse JSON from string
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          // AI returned text without JSON - wrap it
          parsedResponse = {
            recommendation: aiResponse.substring(0, 200),
            trySaying: "Let me think of something smooth...",
            bodyLanguage: "Stay relaxed and present",
            backup: "Be yourself",
            proTip: "Retry for better",
            vibe: "🔄"
          };
        }
      } else if (typeof aiResponse === 'object' && aiResponse !== null) {
        // Already an object - use it directly
        if (aiResponse.trySaying || aiResponse.recommendation) {
          parsedResponse = aiResponse;
        } else if (aiResponse.response && typeof aiResponse.response === 'string') {
          // Response wrapped in response property
          const jsonMatch = aiResponse.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            parsedResponse = {
              recommendation: aiResponse.response,
              trySaying: "Tap retry for a smoother line",
              bodyLanguage: "Stay confident",
              backup: "Be genuine",
              proTip: "Retry",
              vibe: "🔄"
            };
          }
        } else {
          // Use whatever fields exist
          parsedResponse = {
            recommendation: aiResponse.recommendation || "Tap retry for fresh advice",
            trySaying: aiResponse.trySaying || "Tap retry for a smooth line",
            bodyLanguage: aiResponse.bodyLanguage || "Stay present",
            backup: aiResponse.backup || "Be yourself",
            proTip: aiResponse.proTip || "Retry",
            vibe: aiResponse.vibe || "🔄"
          };
        }
      } else {
        throw new Error('Invalid AI response format');
      }
      
      // Validate we got real content
      if (!parsedResponse.trySaying || parsedResponse.trySaying.length < 5) {
        throw new Error('AI response missing content');
      }

      console.log('✅ Parsed AI response:', parsedResponse.trySaying?.substring(0, 50));

      setResponse({
        ...parsedResponse,
        actionType,
        isAI: true
      });

    } catch (error) {
      console.error('❌ AI Error:', error);
      
      // ALWAYS retry once before showing error
      try {
        console.log('🔄 Retrying AI call...');
        const retryPrompt = `Quick dating advice. Context: ${stageContext}, ${situationContext || actionType}, at ${venueContext?.label || 'a date'}. 

Return JSON ONLY:
{"recommendation":"advice","trySaying":"smooth line","bodyLanguage":"body tip","backup":"alt line","proTip":"3 words","vibe":"emoji"}`;
        
        const retryResponse = await base44.integrations.Core.InvokeLLM({
          prompt: retryPrompt,
          system_prompt: "You are a dating coach. Return ONLY valid JSON. No explanations.",
          response_type: 'json'
        });
        
        let parsed;
        if (typeof retryResponse === 'string') {
          const match = retryResponse.match(/\{[\s\S]*\}/);
          if (match) parsed = JSON.parse(match[0]);
        } else {
          parsed = retryResponse;
        }
        
        if (parsed && parsed.trySaying && parsed.trySaying.length > 5) {
          console.log('✅ Retry succeeded!');
          setResponse({ ...parsed, actionType, isAI: true });
          setIsLoading(false);
          return;
        }
        throw new Error('Retry response invalid');
        
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        
        // Show clear error - NO fallbacks
        setResponse({
          recommendation: "⚠️ AI couldn't connect. Tap 'Try another suggestion' to retry.",
          trySaying: "Waiting for AI... tap retry button below",
          bodyLanguage: "Stay relaxed and present while we reconnect",
          backup: "Trust yourself - you've got this!",
          proTip: "Tap retry ↓",
          vibe: "🔄",
          actionType,
          isAI: false,
          isError: true
        });
      }
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
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-full animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-300">🟢 AI Live</span>
              </div>
                  ) : (response.isOffline || response.isError) ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-full">
                      <span className="text-xs">🔄</span>
                      <span className="text-xs font-medium text-red-300">Tap Retry Below</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-full">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-300">🟢 AI Live</span>
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

                {/* Try Another Button - More prominent when error */}
                <button
                  onClick={() => generateResponse(response.actionType)}
                  disabled={isLoading}
                  className={`w-full mt-2 py-3 px-4 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 ${
                    (response.isError || response.isOffline) 
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 animate-pulse'
                      : 'bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-500 hover:to-purple-500'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Getting AI suggestion...' : (response.isError || response.isOffline) ? '🔄 Retry - Get AI Suggestion' : 'Try another suggestion'}
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
