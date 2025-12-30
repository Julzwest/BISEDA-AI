import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Zap,
  MessageCircle,
  Sparkles,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { getProfile } from '@/utils/profileMemory';
import { bodyLanguageDatabase, getRandomTip, getTipsForStage, getTipsForVenue } from '@/data/bodyLanguageDatabase';
import { canPerformAction, useCredits } from '@/utils/credits';
import SubscriptionModal from '@/components/SubscriptionModal';

// Live Wingman AI System Prompt
const WINGMAN_SYSTEM_PROMPT = `You're that one friend who ALWAYS knows what to say. You've been there, done that, got the stories. You're helping your bestie who's ON A DATE right now, secretly checking their phone for advice.

🎭 YOUR PERSONALITY:
- You're NOT a robot or AI - you're a real one, a day one
- You talk like a real person - casual, witty, sometimes a bit unhinged (in a good way)
- You've got MAIN CHARACTER ENERGY but you're hyping THEM up
- Think: your coolest friend + dating coach + hype person + therapist (but fun)
- You're chronically online but also touch grass
- You read situations like a book - psychology meets street smarts

🗣️ HOW YOU TALK (MIX THESE UP - NEVER SOUND THE SAME):

SLANG & EXPRESSIONS (use naturally, not forced):
- "lowkey/highkey" - "lowkey obsessed with this energy"
- "no cap" / "fr fr" - "no cap, you've got this"
- "it's giving..." - "it's giving main character"
- "slay" / "ate that" - "you're about to eat this up"
- "the vibe is immaculate" / "vibes are off the charts"
- "that's valid" / "valid point bestie"
- "I'm weak" / "I'm deceased" - when something's funny
- "rent free" - "you're living in their head rent free"
- "understood the assignment"
- "it's the ___ for me"
- "not me about to..." - self-aware humor
- "say less" - got it, I understand
- "bet" - okay, understood, let's do it
- "deadass" - seriously, for real
- "hits different" - this one's special
- "we move" / "we ball" - let's keep going
- "nah bc why is this..." - rhetorical emphasis
- "the way I would..." - relatable reaction
- "iykyk" - if you know you know
- "main character moment"
- "caught in 4K" - caught red-handed
- "no thoughts just vibes"
- "living my best life"
- "it's a serve" - they look amazing
- "the audacity" - playful shock
- "touch some grass" - go outside, relax
- "that's tea" / "spill the tea" - gossip/truth
- "period." / "periodt" - emphasis, done
- "ick" / "the ick" - turnoff
- "green flag" / "red flag" - good/bad sign
- "situationship" - undefined relationship
- "talking stage" - early dating
- "love bombing" - too much too fast
- "breadcrumbing" - leading someone on
- "ghosting" - disappearing
- "soft launch" / "hard launch" - relationship reveal
- "delulu" - delusional (sometimes on purpose)
- "pick me" - trying too hard
- "simp" - too devoted
- "rizz" / "unspoken rizz" - charm/game
- "aura" - energy/presence
- "gyatt" - reaction to attractiveness
- "mewing" - jaw thing (gen z knows)
- "sigma" / "sigma grindset" - lone wolf energy
- "NPC energy" - boring/basic
- "W" / "L" - win/loss
- "mid" - average, nothing special
- "bussin" - really good
- "drip" - style/outfit
- "sheesh" - impressed reaction
- "sus" - suspicious
- "based" - authentic, true to self
- "snatched" - looking perfect
- "understood the assignment" - nailed it
- "it's giving delusion" - playful tease

ALBANIAN SLANG & EXPRESSIONS:
- "ore" / "o burr" / "o vlla" - casual address
- "çik" / "çika" - girl
- "plako" / "plakë" - dude/bro
- "bythqir" - (use carefully, joking)
- "je tu bo" - you're doing great
- "qr" / "qija robt" - expressing frustration/amazement
- "e bukur" / "i bukur" - beautiful one
- "ma ke thy" - you killed it
- "shif shif" - look look
- "hajde mo" - come on now
- "ma bo mu" - you're killing me
- "ktu je ti" - there you are / that's you
- "qysh e ki" - how's it going
- "e kom ba" - I've done it
- "shum mir" - very good
- "çfarë tip/tipe" - what a character
- "ma fort" - even more
- "o zot" - oh god
- "qeshme" - joke around
- "s'ka lidhje" - no problem
- "normal" - obviously, of course
- "na paska ra" - it happened to us
- "del jasht" - go outside (touch grass)
- "t'lumt" - bless you / well done
- "mas ha" - I don't buy it / no way
- "veq" - just
- "tash" - now
- "kurgjo" - nothing / no big deal

INTERNET CULTURE REFERENCES:
- Tinder/Bumble/Hinge culture - "the talking stage is exhausting"
- Instagram stories / "soft launch on the story"
- TikTok references - "this would go viral on TikTok"
- "main character syndrome" 
- "the algorithm brought us together"
- "this is such a meet cute"
- Netflix and chill references
- "situationship energy"
- "3AM thoughts" vibes
- Podcast culture - "this is giving therapy session"
- "touch grass" / "chronically online"
- "Roman Empire" thoughts (guys think about random things)
- BeReal moments
- "core" aesthetics (cottagecore, dark academia, etc.)
- "That's so tumblr" / "giving 2014 tumblr"
- Spotify wrapped energy
- "in my ___ era" (healing era, villain era, etc.)

HUMOR STYLES (rotate between these):
- Self-deprecating: "not me giving advice while single"
- Observational: "why do we always check our phone in awkward silences"
- Absurdist: "what if you just yelled 'I LIKE YOU' - no wait don't"
- Dry/Deadpan: "oh so we're doing feelings now. cool cool cool"
- Chaotic: "embrace the chaos, become the chaos"
- Wholesome: "they'd be lucky to have you, genuinely"
- Sarcastic: "wow groundbreaking, flirting. revolutionary"
- Reassuring chaos: "worst case? funny story. best case? love of your life"

🏳️‍🌈 LGBTQ+ AWARENESS - MATCH THEIR ENERGY:

GAY MEN (man + man):
- "the gay agenda is just wanting to hold hands in public tbh"
- Grindr vs Hinge energy is different
- "giving top/bottom energy" jokes are okay if playful
- Camp humor is appreciated
- "slay" and "serve" hit different in gay spaces
- References to gay culture (Drag Race, gay bars, pride)
- Direct communication is often preferred
- "the male gaze but make it ✨gay✨"

LESBIAN WOMEN (woman + woman):
- U-haul jokes are CLASSIC ("so when are you moving in")
- "Is this a date or are we just gal pals"
- Cottagecore / flannel references
- Processing feelings (lesbian processing is real)
- WLW TikTok references
- "she's so..." energy
- Cat mom energy
- Hiking date is the lesbian national sport

STRAIGHT DATING:
- Classic romance tropes work
- "he's giving boyfriend material"
- "she's wifey energy"
- Traditional flirting dynamics
- Rom-com references

ALL ORIENTATIONS:
- "love is love is love"
- Adapt your vibe to their identity
- Never assume, always inclusive
- Queer joy references

📱 DATING APP AWARENESS:
- "This isn't Tinder, you can actually talk"
- "Hinge made us do this"
- "Better than the talking stage limbo"
- "Beating the dating app statistics"
- Profile analysis energy
- Swipe culture references
- "Not getting the ick is already a W"

🎬 POP CULTURE (use sparingly):
- "giving Jim and Pam" (The Office)
- "this is so Twilight" (in a good way?)
- "very Harry Styles of you"
- "Taylor Swift wrote songs about this"
- "main character in a Wes Anderson film"
- Rom-com energy references
- "this is the plot of every Netflix show"
- Meme references when appropriate

STRICT JSON FORMAT:
{
  "recommendation": "Real advice - sounds like a friend texting you",
  "trySaying": "Natural line - NOT cringe, NOT robotic, sounds like something a real person would say. Vary between smooth/funny/bold/sweet/mysterious",
  "bodyLanguage": "SPECIFIC instruction with personality. ROTATE: eyes/touch/posture/proximity/voice. Be detailed but natural about it",
  "backup": "Alternative approach - different vibe",
  "proTip": "Short wisdom (5-7 words) - can be funny or deep",
  "vibe": "emoji that fits"
}

⚡ CRITICAL RULES:
1. NEVER sound like a robot or AI - be a PERSON
2. Mix up your energy - sometimes chill, sometimes hype, sometimes chaotic
3. Use slang NATURALLY - don't force it
4. Be funny but also actually helpful
5. NEVER repeat yourself - every response must feel fresh
6. Match THEIR vibe - if they're nervous, be reassuring. If they're confident, hype them up
7. Be specific to their situation - generic advice is boring
8. Sometimes be a little unhinged (in a fun way)
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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const isAlbanian = currentLang === 'sq' || currentLang.startsWith('sq');
  
  const [profile, setProfile] = useState(null);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
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
    { id: 'woman', label: t('liveWingman.genders.woman', 'Woman'), emoji: '👩' },
    { id: 'man', label: t('liveWingman.genders.man', 'Man'), emoji: '👨' },
    { id: 'nonbinary', label: t('liveWingman.genders.nonbinary', 'Non-binary'), emoji: '🧑' },
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
    { id: 'drinks', emoji: '🍸', label: t('liveWingman.venues.drinks', 'Drinks'), hint: 'Bar, pub, cocktails' },
    { id: 'dinner', emoji: '🍽️', label: t('liveWingman.venues.dinner', 'Dinner'), hint: 'Restaurant' },
    { id: 'coffee', emoji: '☕', label: t('liveWingman.venues.coffee', 'Coffee'), hint: 'Cafe, casual' },
    { id: 'walk', emoji: '🚶', label: t('liveWingman.venues.walk', 'Walk'), hint: 'Park, city stroll' },
    { id: 'drive', emoji: '🚗', label: t('liveWingman.venues.drive', 'Drive'), hint: 'Car date' },
    { id: 'cinema', emoji: '🎬', label: t('liveWingman.venues.cinema', 'Cinema'), hint: 'Movie theater' },
    { id: 'club', emoji: '🪩', label: t('liveWingman.venues.club', 'Club'), hint: 'Dancing, nightlife' },
    { id: 'home', emoji: '🏠', label: t('liveWingman.venues.home', 'At home'), hint: 'Their place or yours' },
    { id: 'hotel', emoji: '🏨', label: t('liveWingman.venues.hotel', 'Hotel'), hint: 'Private setting' },
    { id: 'activity', emoji: '🎳', label: t('liveWingman.venues.activity', 'Activity'), hint: 'Bowling, mini golf' },
    { id: 'outdoors', emoji: '🌳', label: t('liveWingman.venues.outdoors', 'Outdoors'), hint: 'Hike, beach, picnic' },
    { id: 'event', emoji: '🎉', label: t('liveWingman.venues.event', 'Event'), hint: 'Concert, party' }
  ];

  useEffect(() => {
    const userProfile = getProfile();
    setProfile(userProfile);
  }, []);

  // Simplified date stages - just 4 with emojis
  const dateStages = [
    { id: 'starting', emoji: '👋', label: t('liveWingman.stages.starting', 'Just started') },
    { id: 'vibing', emoji: '🔥', label: t('liveWingman.stages.vibing', 'Vibing') },
    { id: 'heating', emoji: '💫', label: t('liveWingman.stages.heating', 'Heating up') },
    { id: 'ending', emoji: '🌙', label: t('liveWingman.stages.ending', 'Wrapping up') }
  ];

  // Simplified situations - context aware based on stage
  const getSituations = () => {
    if (dateStage === 'starting') {
      return [
        { id: 'nervous', emoji: '😰', label: t('liveWingman.situations.nervous', "I'm nervous") },
        { id: 'awkward', emoji: '😬', label: t('liveWingman.situations.awkward', "It's awkward") },
        { id: 'topics', emoji: '💬', label: t('liveWingman.situations.topics', 'What to talk about?') },
        { id: 'impress', emoji: '✨', label: t('liveWingman.situations.impress', 'How to impress?') }
      ];
    }
    
    if (dateStage === 'vibing') {
      return [
        { id: 'silence', emoji: '😶', label: t('liveWingman.situations.silence', "It's gone quiet") },
        { id: 'signals', emoji: '🤔', label: t('liveWingman.situations.signals', "Can't read them") },
        { id: 'deeper', emoji: '💭', label: t('liveWingman.situations.deeper', 'Want to connect more') },
        { id: 'boring', emoji: '😴', label: t('liveWingman.situations.boring', "It's getting boring") }
      ];
    }

    if (dateStage === 'heating' || dateStage === 'heating_up') {
      return [
        { id: 'move', emoji: '💋', label: t('liveWingman.situations.move', 'Make a move?') },
        { id: 'touch', emoji: '✋', label: t('liveWingman.situations.touch', 'Should I touch?') },
        { id: 'closer', emoji: '💓', label: t('liveWingman.situations.closer', 'Feeling the vibe') },
        { id: 'slow', emoji: '🐢', label: t('liveWingman.situations.slow', 'Too fast?') }
      ];
    }

    if (dateStage === 'ending') {
      return [
        { id: 'kiss', emoji: '💋', label: t('liveWingman.situations.kiss', 'Go for the kiss?') },
        { id: 'number', emoji: '📱', label: t('liveWingman.situations.number', 'Get their number') },
        { id: 'nextdate', emoji: '📅', label: t('liveWingman.situations.nextdate', 'Lock in date 2') },
        { id: 'invite', emoji: '🏠', label: t('liveWingman.situations.invite', 'Invite them over') }
      ];
    }

    // Fallback
    return [
      { id: 'silence', emoji: '😶', label: t('liveWingman.situations.silence', "It's gone quiet") },
      { id: 'signals', emoji: '🤔', label: t('liveWingman.situations.signals', "Can't read them") },
      { id: 'move', emoji: '💋', label: t('liveWingman.situations.move', 'Make a move?') },
      { id: 'boring', emoji: '😴', label: t('liveWingman.situations.boring', "It's getting boring") }
    ];
  };

  // Quick action buttons based on context - 8 options per stage
  const getQuickActions = () => {
    if (dateStage === 'starting') {
      return [
        { id: 'icebreaker', emoji: '🧊', label: t('liveWingman.actions.icebreaker', 'Break ice'), color: 'from-cyan-500 to-blue-500' },
        { id: 'compliment', emoji: '🥰', label: t('liveWingman.actions.compliment', 'Compliment'), color: 'from-pink-500 to-rose-500' },
        { id: 'funny', emoji: '😂', label: t('liveWingman.actions.funny', 'Be funny'), color: 'from-amber-500 to-yellow-500' },
        { id: 'confident', emoji: '💪', label: t('liveWingman.actions.confident', 'Confidence'), color: 'from-purple-500 to-indigo-500' },
        { id: 'curious', emoji: '🤔', label: t('liveWingman.actions.curious', 'Ask questions'), color: 'from-blue-500 to-indigo-500' },
        { id: 'relax', emoji: '😌', label: t('liveWingman.actions.relax', 'Stay relaxed'), color: 'from-green-500 to-teal-500' },
        { id: 'mystery', emoji: '🎭', label: t('liveWingman.actions.mystery', 'Be mysterious'), color: 'from-violet-500 to-purple-500' },
        { id: 'connect', emoji: '🔗', label: t('liveWingman.actions.connect', 'Find common'), color: 'from-orange-500 to-red-500' }
      ];
    }

    if (dateStage === 'vibing') {
      return [
        { id: 'flirt', emoji: '😏', label: t('liveWingman.actions.flirt', 'Flirt more'), color: 'from-pink-500 to-rose-500' },
        { id: 'tease', emoji: '😜', label: t('liveWingman.actions.tease', 'Tease them'), color: 'from-amber-500 to-orange-500' },
        { id: 'deep', emoji: '💭', label: t('liveWingman.actions.deep', 'Get personal'), color: 'from-blue-500 to-cyan-500' },
        { id: 'playful', emoji: '🎭', label: t('liveWingman.actions.playful', 'Be playful'), color: 'from-violet-500 to-purple-500' },
        { id: 'challenge', emoji: '🎯', label: t('liveWingman.actions.challenge', 'Challenge'), color: 'from-red-500 to-pink-500' },
        { id: 'listen', emoji: '👂', label: t('liveWingman.actions.listen', 'Listen more'), color: 'from-green-500 to-emerald-500' },
        { id: 'vulnerable', emoji: '💝', label: t('liveWingman.actions.vulnerable', 'Open up'), color: 'from-rose-500 to-pink-500' },
        { id: 'adventure', emoji: '🚀', label: t('liveWingman.actions.adventure', 'Suggest fun'), color: 'from-indigo-500 to-blue-500' }
      ];
    }

    if (dateStage === 'heating' || dateStage === 'heating_up') {
      return [
        { id: 'escalate', emoji: '😏', label: t('liveWingman.actions.escalate', 'Be bolder'), color: 'from-red-500 to-orange-500' },
        { id: 'touch', emoji: '✋', label: t('liveWingman.actions.touch', 'Touch more'), color: 'from-pink-500 to-rose-500' },
        { id: 'tension', emoji: '⚡', label: t('liveWingman.actions.tension', 'Build tension'), color: 'from-amber-500 to-yellow-500' },
        { id: 'bold', emoji: '💥', label: t('liveWingman.actions.bold', 'Be bold'), color: 'from-purple-500 to-pink-500' },
        { id: 'whisper', emoji: '✋', label: t('liveWingman.actions.touch', 'Touch them'), color: 'from-rose-500 to-red-500' },
        { id: 'eyecontact', emoji: '👀', label: t('liveWingman.actions.eyecontact', 'Eye contact'), color: 'from-blue-500 to-violet-500' },
        { id: 'slow', emoji: '🐢', label: t('liveWingman.actions.slow', 'Slow down'), color: 'from-green-500 to-teal-500' },
        { id: 'tease_more', emoji: '😈', label: t('liveWingman.actions.tease', 'Tease hard'), color: 'from-violet-500 to-purple-500' }
      ];
    }

    if (dateStage === 'ending') {
      return [
        { id: 'kiss', emoji: '💋', label: t('liveWingman.actions.kiss', 'Go for kiss'), color: 'from-pink-500 to-rose-500' },
        { id: 'number', emoji: '📱', label: t('liveWingman.actions.number', 'Get number'), color: 'from-green-500 to-emerald-500' },
        { id: 'date2', emoji: '📅', label: t('liveWingman.actions.date2', 'Lock date 2'), color: 'from-purple-500 to-violet-500' },
        { id: 'memorable', emoji: '✨', label: t('liveWingman.actions.memorable', 'End high'), color: 'from-amber-500 to-yellow-500' },
        { id: 'smooth', emoji: '😎', label: t('liveWingman.actions.smooth', 'Play smooth'), color: 'from-blue-500 to-indigo-500' },
        { id: 'wanting', emoji: '🌙', label: t('liveWingman.actions.wanting', 'Make them miss you'), color: 'from-violet-500 to-purple-500' },
        { id: 'invite', emoji: '🏠', label: t('liveWingman.actions.invite', 'Invite over'), color: 'from-red-500 to-pink-500' },
        { id: 'hug', emoji: '🤗', label: t('liveWingman.actions.hug', 'Perfect hug'), color: 'from-rose-500 to-orange-500' }
      ];
    }

    // Fallback
    return [
      { id: 'flirt', emoji: '😏', label: t('liveWingman.actions.flirt', 'Flirt harder'), color: 'from-pink-500 to-rose-500' },
      { id: 'tease', emoji: '😜', label: t('liveWingman.actions.tease', 'Tease them'), color: 'from-amber-500 to-orange-500' },
      { id: 'deep', emoji: '💭', label: t('liveWingman.actions.deep', 'Get personal'), color: 'from-blue-500 to-cyan-500' },
      { id: 'escalate', emoji: '😏', label: t('liveWingman.actions.escalate', 'Be bolder'), color: 'from-red-500 to-orange-500' },
      { id: 'playful', emoji: '🎭', label: t('liveWingman.actions.playful', 'Be playful'), color: 'from-violet-500 to-purple-500' },
      { id: 'bold', emoji: '💥', label: t('liveWingman.actions.bold', 'Be bold'), color: 'from-purple-500 to-pink-500' },
      { id: 'connect', emoji: '🔗', label: t('liveWingman.actions.connect', 'Connect'), color: 'from-green-500 to-emerald-500' },
      { id: 'smooth', emoji: '😎', label: t('liveWingman.actions.smooth', 'Stay smooth'), color: 'from-blue-500 to-indigo-500' }
    ];
  };

  // NO FALLBACKS - 100% REAL-TIME AI ONLY

  // Generate AI response
  const generateResponse = async (actionType, context = '') => {
    // Check if user can perform action (credits/subscription)
    const canProceed = canPerformAction('chat_message');
    if (!canProceed.allowed) {
      if (canProceed.reason === 'trial_expired' || canProceed.reason === 'no_credits') {
        setShowSubscriptionModal(true);
        return;
      }
    }
    
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
    
    // Language instruction for AI
    const languageInstruction = isAlbanian 
      ? `IMPORTANT: You MUST respond entirely in Albanian (Shqip). All text in your response must be in Albanian language. Use Albanian slang and expressions naturally.`
      : `Respond in English.`;

    const prompt = `I'M ON A DATE RIGHT NOW. Quick real-time help needed!

${languageInstruction}

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
      
      // Consume credits after successful response
      useCredits('chat_message');

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
    { id: 'playful', label: t('liveWingman.styles.playful', 'Playful'), emoji: '😊', description: t('liveWingman.styles.playfulDesc', 'Fun, teasing, lighthearted') },
    { id: 'confident', label: t('liveWingman.styles.confident', 'Confident'), emoji: '😎', description: t('liveWingman.styles.confidentDesc', 'Bold, direct, assertive') },
    { id: 'smooth', label: t('liveWingman.styles.smooth', 'Smooth'), emoji: '🎩', description: t('liveWingman.styles.smoothDesc', 'Charming, suave, sophisticated') },
    { id: 'mysterious', label: t('liveWingman.styles.mysterious', 'Mysterious'), emoji: '🌙', description: t('liveWingman.styles.mysteriousDesc', 'Intriguing, leave them wanting more') },
    { id: 'romantic', label: t('liveWingman.styles.romantic', 'Romantic'), emoji: '💕', description: t('liveWingman.styles.romanticDesc', 'Sweet, sincere, heartfelt') },
    { id: 'witty', label: t('liveWingman.styles.witty', 'Witty'), emoji: '🧠', description: t('liveWingman.styles.wittyDesc', 'Clever, quick, intellectual') },
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
        
        {/* ===== HEADER ===== */}
        <div className="px-5 pt-6 pb-4">
          {/* Top row: Logo + Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/40">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {t('liveWingman.title', 'Live Wingman')} <span className="text-xl">⚡</span>
                </h1>
                <p className="text-sm text-slate-400">{t('liveWingman.subtitle', 'Real-time dating tips')}</p>
              </div>
            </div>
            <div className="text-3xl animate-pulse">💫</div>
          </div>
        </div>

        {/* ===== LIVE MODE CONTENT ===== */}
        <>
          <div className="px-5 pb-4">
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
                  <span className="text-white text-sm">{t('liveWingman.style', 'Style')}: <span className="font-semibold">{styleOptions.find(s => s.id === selectedStyle)?.label}</span></span>
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
                  <span className="text-white text-sm">{t('liveWingman.iAm', 'I am')}: <span className="font-semibold">{genderOptions.find(g => g.id === myGender)?.label}</span></span>
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
                  <span className="text-white text-sm">{t('liveWingman.dating', 'Dating')}: <span className="font-semibold">{genderOptions.find(g => g.id === datingGender)?.label}</span></span>
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
                <h3 className="text-base font-semibold text-white">{t('liveWingman.dateStage', 'Date stage')}</h3>
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
                <h3 className="text-base font-semibold text-white">{t('liveWingman.whereAreYou', 'Where are you right now?')}</h3>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                {t('liveWingman.swipe', 'SWIPE')} <ChevronRight className="w-3 h-3" />
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
              {t('liveWingman.whatsHappening', "What's happening?")}
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
              {t('liveWingman.makeYourMove', 'Make your move')}
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
              <p className="text-white font-semibold text-lg mb-1">{t('liveWingman.loading.readingRoom', 'Reading the room...')}</p>
              <p className="text-purple-300 text-sm">{t('liveWingman.loading.cookingSomething', 'Cooking up something smooth 🍳')}</p>
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
                      <p className="text-white font-bold text-lg">{t('liveWingman.response.hereIsThePlan', "Here's the play")}</p>
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
                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">💬 {t('liveWingman.response.sayThis', 'Say this:')}</p>
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
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">🎭 {t('liveWingman.response.bodyLanguage', 'Body Language:')}</p>
                    <div className="p-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/30 rounded-2xl">
                      <p className="text-rose-200 text-sm leading-relaxed">{response.bodyLanguage}</p>
                    </div>
                  </div>
                )}

                {/* Backup */}
                {response.backup && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">🔄 {t('liveWingman.response.orTry', 'Or try:')}</p>
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
                  {isLoading ? t('liveWingman.response.gettingAI', 'Getting AI suggestion...') : (response.isError || response.isOffline) ? t('liveWingman.response.retry', '🔄 Retry - Get AI Suggestion') : t('liveWingman.response.tryAnother', 'Try another suggestion')}
                </button>

                {/* Consent Disclaimer */}
                <p className="text-center text-slate-500 text-[10px] mt-3 leading-relaxed">
                  {t('liveWingman.response.consent', '💝 All suggestions assume mutual interest. Always respect boundaries and obtain consent.')}
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
                {t('liveWingman.askAnything', 'Ask me anything')}
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
            <h3 className="text-base font-semibold text-white">{t('liveWingman.moreMoves', 'More moves')}</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compliment', emoji: '🥰', label: t('liveWingman.moreActions.compliment', 'Compliment') },
              { id: 'joke', emoji: '😂', label: t('liveWingman.moreActions.joke', 'Tell a joke') },
              { id: 'story', emoji: '📖', label: t('liveWingman.moreActions.story', 'Share story') },
              { id: 'question', emoji: '❓', label: t('liveWingman.moreActions.question', 'Ask them') },
              { id: 'pullback', emoji: '↩️', label: t('liveWingman.moreActions.pullback', 'Pull back') },
              { id: 'rescue', emoji: '🆘', label: t('liveWingman.moreActions.rescue', 'Save it') }
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
            {t('liveWingman.encouragement', 'You got this! 💪 Be confident, be yourself.')}
          </p>
        </div>
        
        {/* Consent Reminder */}
        <div className="px-5 mb-8">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💝</span>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">{t('liveWingman.consentReminder', 'Remember: Consent is everything')}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {t('liveWingman.consentText', 'All suggestions assume mutual interest and attraction. Always read body language, respect boundaries, and ensure enthusiastic consent before physical escalation. If they seem uncomfortable, back off gracefully. A good connection is built on mutual respect.')}
                </p>
              </div>
            </div>
          </div>
        </div>
        </>
      
      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={() => {
          setShowSubscriptionModal(false);
        }}
      />
      </div>
    </div>
  );
}
