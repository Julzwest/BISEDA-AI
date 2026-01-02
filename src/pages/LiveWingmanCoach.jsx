import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Zap, Copy, Check, Loader2, ChevronRight, ChevronLeft, RefreshCw, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { canPerformAction, useCredits } from '@/utils/credits';
import { trackMessage } from '@/utils/activityTracker';
import SubscriptionModal from '@/components/SubscriptionModal';

// ENGLISH Wingman System Prompt
const WINGMAN_PROMPT_EN = `You're the ultimate wingman - THE MASTER OF RIZZ with 20+ years of dating experience. You're helping your friend who's ON A DATE checking their phone secretly for quick advice.

CRITICAL: You MUST respond ONLY in English. Do NOT use any Albanian words.

FORMATTING: Do NOT use markdown. No asterisks (*), no underscores (_), no bold, no italics. Plain text only. Use emojis for emphasis.

⚡ KEEP IT SHORT - they're on a date!
- "recommendation": 1-2 sentences MAX
- "trySaying": One natural line to say in English
- "bodyLanguage": One specific move
- "proTip": 5-7 words of wisdom

🎭 YOUR VIBE: Confident, witty, supportive. Use English slang naturally: "rizz", "slay", "no cap", "lowkey", "main character energy", "W", "bet".

Return JSON only:
{
  "recommendation": "Strategic advice",
  "trySaying": "Natural line to say",
  "bodyLanguage": "Specific technique",
  "backup": "Alternative approach",
  "proTip": "3-5 word wisdom",
  "vibe": "emoji"
}`;

// ALBANIAN Wingman System Prompt
const WINGMAN_PROMPT_SQ = `Ti je wingman-i im LEGJENDAR nga Tirana! Je bro-ja që di gjithçka për takime. Flet shqip perfekt, je funny dhe cool.

🔥 JI COOL DHE FUNNY:
- Përdor slang: "ore", "plak", "bro", "çmendje", "e fortë"
- Jep këshilla me humor
- Ji i sigurt dhe mbështetës

⚠️ GRAMATIKË PERFEKTE:
- "do të" ✅ jo "do" vetëm ❌
- "për ty" ✅ jo "për ju" ❌
- "ji vetvetja" ✅ jo "të jesh vetvetja" ❌
- "nëse ajo të pëlqen ty" ✅ jo "nëse e pëlqen ty" ❌

⚡ KTHE VETËM JSON:
{
  "recommendation": "Këshillë e shkurtër dhe e qartë",
  "trySaying": "Fjali natyrale për të thënë",
  "bodyLanguage": "Veprim konkret",
  "backup": "Plan B cool",
  "proTip": "Këshillë bro",
  "vibe": "emoji"
}

SHEMBULL:
{
  "recommendation": "Ore bro, buzëqesh dhe shihe në sy! 😎",
  "trySaying": "Më pëlqen shumë biseda me ty",
  "bodyLanguage": "Afrohuni pak dhe buzëqesh",
  "backup": "Fol për muzikën që të pëlqen",
  "proTip": "Ji vetvetja, king!",
  "vibe": "🔥"
}`;

// Gender-specific tone additions for Wingman
const WINGMAN_FEMALE_TONE_EN = `

👑 FOR FEMALE USERS - BE HER ULTIMATE HYPE BESTIE:
- Supportive sisterhood energy: "Girl, you've got this!" "Queen move!"
- Empowering language: "queen", "bestie", "sis", "babe"
- Women supporting women vibes
- "You're a catch, act like it!" "Know your worth!"`;

const WINGMAN_FEMALE_TONE_SQ = `

👑 PËR PËRDORUESET FEMRA - JI SHOQJA E SAJ MË E MIRË:
- Energji mbështetëse motërore: "Gocë, ti e ke!" "Lëvizje mbretëreshe!"
- Gjuhë fuqizuese: "mbretëreshë", "shoqe", "motër", "zemër"
- Gra që mbështesin gra
- "Ti je diamant, sillu si i tillë!" "Dije vlerën tënde!"`;

const WINGMAN_MALE_TONE_EN = `

💪 FOR MALE USERS - BE HIS CONFIDENT WINGMAN:
- Bro energy: "King, you've got this!" "That's the move, bro!"
- Direct and strategic advice
- "Confidence is key!" "She's into you, go for it!"`;

const WINGMAN_MALE_TONE_SQ = `

💪 PËR PËRDORUESIT MESHKUJ - JI WINGMAN-I I TIJ I SIGURT:
- Energji vëllazërore: "Mbret, ti e ke!" "Kjo është lëvizja, vlla!"
- Këshilla direkte dhe strategjike
- "Besimi është çelësi!" "Ajo është e interesuar, shko për të!"`;

// Get the appropriate prompt based on language and user gender
const getWingmanPrompt = (isAlbanian, userGender) => {
  const basePrompt = isAlbanian ? WINGMAN_PROMPT_SQ : WINGMAN_PROMPT_EN;
  
  if (userGender === 'female') {
    return basePrompt + (isAlbanian ? WINGMAN_FEMALE_TONE_SQ : WINGMAN_FEMALE_TONE_EN);
  } else if (userGender === 'male') {
    return basePrompt + (isAlbanian ? WINGMAN_MALE_TONE_SQ : WINGMAN_MALE_TONE_EN);
  }
  
  return basePrompt;
};

export default function LiveWingmanCoach() {
  const { t, i18n } = useTranslation();
  const isAlbanian = i18n.language?.startsWith('sq');
  
  // Get user gender from localStorage
  const userGender = localStorage.getItem('userGender') || null;
  
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  
  // Core settings
  const [dateStage, setDateStage] = useState('vibing');
  const [dateVenue, setDateVenue] = useState('drinks');
  const [myGender, setMyGender] = useState('man');
  const [datingGender, setDatingGender] = useState('woman');
  const [showExitStrategy, setShowExitStrategy] = useState(false);
  
  const venueScrollRef = useRef(null);
  const responseRef = useRef(null);

  // Auto-scroll to response/loading when it appears
  useEffect(() => {
    if ((response || isLoading) && responseRef.current) {
      setTimeout(() => {
        responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [response, isLoading]);
  
  // Options
  const genderOptions = [
    { id: 'woman', label: t('liveWingman.genders.woman', 'Woman'), emoji: '👩' },
    { id: 'man', label: t('liveWingman.genders.man', 'Man'), emoji: '👨' },
    { id: 'nonbinary', label: t('liveWingman.genders.nonbinary', 'Non-binary'), emoji: '🧑' },
  ];

  const dateStages = [
    { id: 'starting', emoji: '👋', label: t('liveWingman.stages.starting', 'First Meet'), color: 'from-cyan-500 to-blue-500' },
    { id: 'vibing', emoji: '💬', label: t('liveWingman.stages.vibing', 'Connecting'), color: 'from-purple-500 to-pink-500' },
    { id: 'heating', emoji: '🔥', label: t('liveWingman.stages.heating', 'Sparks Flying'), color: 'from-orange-500 to-red-500' },
    { id: 'ending', emoji: '🌙', label: t('liveWingman.stages.ending', 'Goodnight'), color: 'from-violet-500 to-purple-500' }
  ];

  const venueOptions = [
    { id: 'drinks', emoji: '🍸', label: t('liveWingman.venues.drinks', 'Drinks') },
    { id: 'dinner', emoji: '🍽️', label: t('liveWingman.venues.dinner', 'Dinner') },
    { id: 'coffee', emoji: '☕', label: t('liveWingman.venues.coffee', 'Coffee') },
    { id: 'walk', emoji: '🚶', label: t('liveWingman.venues.walk', 'Walk') },
    { id: 'cinema', emoji: '🎬', label: t('liveWingman.venues.cinema', 'Cinema') },
    { id: 'club', emoji: '🪩', label: t('liveWingman.venues.club', 'Club') },
    { id: 'home', emoji: '🏠', label: t('liveWingman.venues.home', 'Home') },
    { id: 'outdoors', emoji: '🌳', label: t('liveWingman.venues.outdoors', 'Outdoors') }
  ];

  // Dynamic actions based on stage
  const getActions = () => {
    const actions = {
      starting: [
        { id: 'icebreaker', emoji: '🧊', label: t('liveWingman.actions.icebreaker', 'Break ice'), color: 'from-cyan-500 to-blue-500' },
        { id: 'compliment', emoji: '🥰', label: t('liveWingman.actions.compliment', 'Compliment'), color: 'from-pink-500 to-rose-500' },
        { id: 'funny', emoji: '😂', label: t('liveWingman.actions.funny', 'Be funny'), color: 'from-amber-500 to-yellow-500' },
        { id: 'confident', emoji: '💪', label: t('liveWingman.actions.confident', 'Confidence'), color: 'from-purple-500 to-indigo-500' },
        { id: 'curious', emoji: '🤔', label: t('liveWingman.actions.curious', 'Ask Qs'), color: 'from-blue-500 to-indigo-500' },
        { id: 'relax', emoji: '😌', label: t('liveWingman.actions.relax', 'Stay chill'), color: 'from-green-500 to-teal-500' },
      ],
      vibing: [
        { id: 'flirt', emoji: '😏', label: t('liveWingman.actions.flirt', 'Flirt more'), color: 'from-pink-500 to-rose-500' },
        { id: 'tease', emoji: '😜', label: t('liveWingman.actions.tease', 'Tease them'), color: 'from-amber-500 to-orange-500' },
        { id: 'deep', emoji: '💭', label: t('liveWingman.actions.deep', 'Go deeper'), color: 'from-blue-500 to-cyan-500' },
        { id: 'playful', emoji: '🎭', label: t('liveWingman.actions.playful', 'Be playful'), color: 'from-violet-500 to-purple-500' },
        { id: 'listen', emoji: '👂', label: t('liveWingman.actions.listen', 'Listen'), color: 'from-green-500 to-emerald-500' },
        { id: 'adventure', emoji: '🚀', label: t('liveWingman.actions.adventure', 'Suggest fun'), color: 'from-indigo-500 to-blue-500' },
      ],
      heating: [
        { id: 'escalate', emoji: '🔥', label: t('liveWingman.actions.escalate', 'Be bolder'), color: 'from-red-500 to-orange-500' },
        { id: 'touch', emoji: '✋', label: t('liveWingman.actions.touch', 'Touch more'), color: 'from-pink-500 to-rose-500' },
        { id: 'tension', emoji: '⚡', label: t('liveWingman.actions.tension', 'Tension'), color: 'from-amber-500 to-yellow-500' },
        { id: 'eyecontact', emoji: '👀', label: t('liveWingman.actions.eyecontact', 'Eye contact'), color: 'from-blue-500 to-violet-500' },
        { id: 'whisper', emoji: '🤫', label: t('liveWingman.actions.whisper', 'Whisper'), color: 'from-purple-500 to-pink-500' },
        { id: 'tease_more', emoji: '😈', label: t('liveWingman.actions.tease', 'Tease hard'), color: 'from-violet-500 to-purple-500' },
      ],
      ending: [
        { id: 'kiss', emoji: '💋', label: t('liveWingman.actions.kiss', 'Go for kiss'), color: 'from-pink-500 to-rose-500' },
        { id: 'number', emoji: '📱', label: t('liveWingman.actions.number', 'Get number'), color: 'from-green-500 to-emerald-500' },
        { id: 'date2', emoji: '📅', label: t('liveWingman.actions.date2', 'Lock date 2'), color: 'from-purple-500 to-violet-500' },
        { id: 'memorable', emoji: '✨', label: t('liveWingman.actions.memorable', 'End high'), color: 'from-amber-500 to-yellow-500' },
        { id: 'invite', emoji: '🏠', label: t('liveWingman.actions.invite', 'Invite over'), color: 'from-red-500 to-pink-500' },
        { id: 'hug', emoji: '🤗', label: t('liveWingman.actions.hug', 'Perfect hug'), color: 'from-rose-500 to-orange-500' },
      ]
    };
    return actions[dateStage] || actions.vibing;
  };

  const exitExcuses = [
    { id: 'emergency', emoji: '📱', label: t('liveWingman.excuses.emergencyCall', 'Emergency call') },
    { id: 'early', emoji: '⏰', label: t('liveWingman.excuses.earlyMorning', 'Early morning') },
    { id: 'friend', emoji: '🆘', label: t('liveWingman.excuses.friendCrisis', 'Friend needs me') },
    { id: 'unwell', emoji: '🤒', label: t('liveWingman.excuses.notFeelingWell', 'Feeling unwell') },
    { id: 'work', emoji: '💼', label: t('liveWingman.excuses.workEmergency', 'Work emergency') },
    { id: 'pet', emoji: '🐕', label: t('liveWingman.excuses.petSitter', 'Pet sitter issue') },
    { id: 'family', emoji: '👨‍👩‍👧', label: t('liveWingman.excuses.familyCall', 'Family matter') },
    { id: 'parking', emoji: '🚗', label: t('liveWingman.excuses.carParking', 'Car/Parking') },
    { id: 'roommate', emoji: '🔑', label: t('liveWingman.excuses.roommateLocked', 'Roommate locked out') },
    { id: 'migraine', emoji: '🤕', label: t('liveWingman.excuses.migraine', 'Migraine coming') },
    { id: 'babysitter', emoji: '👶', label: t('liveWingman.excuses.babysitter', 'Babysitter issue') },
    { id: 'uber', emoji: '🚕', label: t('liveWingman.excuses.uberWaiting', 'Uber waiting') },
  ];

  // Generate AI response
  const generateResponse = async (actionType, context = '') => {
    const canProceed = canPerformAction('chat_message');
    if (!canProceed.allowed) {
      setShowSubscriptionModal(true);
      return;
    }
    
    setIsLoading(true);
    
    const stageInfo = dateStages.find(s => s.id === dateStage);
    const venueInfo = venueOptions.find(v => v.id === dateVenue);
    
    const prompt = `Quick dating help - I'm ON A DATE!

CONTEXT:
- I am: ${genderOptions.find(g => g.id === myGender)?.label}
- Dating: ${genderOptions.find(g => g.id === datingGender)?.label}
- Stage: ${stageInfo?.label}
- Location: ${venueInfo?.label}
- What I need: ${actionType}
${context ? `- My question: ${context}` : ''}

Generate unique response (seed: ${Math.random().toString(36).substring(7)}).
Return JSON: recommendation, trySaying, bodyLanguage, backup, proTip, vibe`;

    if (!navigator.onLine) {
      setResponse({
        recommendation: "You're offline! Connect to get AI suggestions.",
        trySaying: "Tap retry once you're back online",
        bodyLanguage: "Stay present, be yourself",
        proTip: "Go offline",
        vibe: "📴",
        isError: true
      });
      setIsLoading(false);
      return;
    }

    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        system_prompt: getWingmanPrompt(isAlbanian, userGender),
        response_type: 'json'
      });

      let parsed;
      if (typeof aiResponse === 'string') {
        const match = aiResponse.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
          } else {
        parsed = aiResponse;
      }
      
      if (parsed?.trySaying) {
        setResponse({ ...parsed, actionType, isAI: true });
        useCredits('chat_message');
        trackMessage();
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('AI Error:', error);
      setResponse({
        recommendation: "Couldn't connect. Tap retry below.",
        trySaying: "Waiting for AI...",
        bodyLanguage: "Stay confident",
        proTip: "Tap retry",
        vibe: "🔄",
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollVenue = (direction) => {
    if (venueScrollRef.current) {
      venueScrollRef.current.scrollBy({ left: direction * 150, behavior: 'smooth' });
    }
  };

  const currentStage = dateStages.find(s => s.id === dateStage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950 pb-4 -mt-4">
      
      {/* ========== HEADER ========== */}
      <div className="px-5 pt-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
            <h1 className="text-xl font-bold text-white">{t('liveWingman.title', 'Live Wingman')} ⚡</h1>
            <p className="text-sm text-white/80">{t('liveWingman.subtitle', 'Real-time dating advice')}</p>
          </div>
            </div>
          </div>

      {/* ========== SECTION 1: WHO ========== */}
      <div className="px-5 mb-5">
        <div className="flex gap-2">
          {/* I am */}
          <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <p className="text-sm font-bold text-white mb-2">
              {t('liveWingman.iAm', 'I am')}
              <span className="text-white/70 font-normal ml-1">: {genderOptions.find(g => g.id === myGender)?.label}</span>
            </p>
            <div className="flex gap-1.5">
              {genderOptions.map((g) => (
              <button
                  key={g.id}
                  onClick={() => setMyGender(g.id)}
                  className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                    myGender === g.id 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' 
                      : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                    </button>
                  ))}
                </div>
            </div>

          {/* Dating */}
          <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <p className="text-sm font-bold text-white mb-2">
              {t('liveWingman.dating', 'Dating')}
              <span className="text-white/70 font-normal ml-1">: {genderOptions.find(g => g.id === datingGender)?.label}</span>
            </p>
            <div className="flex gap-1.5">
              {genderOptions.map((g) => (
              <button
                  key={g.id}
                  onClick={() => setDatingGender(g.id)}
                  className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                    datingGender === g.id 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg' 
                      : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                    </button>
                  ))}
                </div>
            </div>
          </div>
        </div>

      {/* ========== SECTION 2: DATE STAGE ========== */}
      <div className="px-5 mb-5">
        <p className="text-sm uppercase tracking-[0.15em] text-slate-400 text-center mb-3 font-semibold">
          {t('liveWingman.dateStage', 'Date Stage')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {dateStages.map((stage) => (
                  <button
                    key={stage.id}
              onClick={() => { setDateStage(stage.id); setResponse(null); }}
              className={`py-3 rounded-xl text-center transition-all ${
                dateStage === stage.id 
                  ? `bg-gradient-to-br ${stage.color} shadow-lg shadow-purple-500/20` 
                  : 'bg-slate-800/60 border border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <span className="text-2xl block mb-1">{stage.emoji}</span>
              <span className="text-sm font-bold text-white">
                      {stage.label}
                    </span>
                  </button>
          ))}
          </div>
          </div>

      {/* ========== SECTION 3: VENUE ========== */}
      <div className="px-5 mb-5">
        <p className="text-sm uppercase tracking-[0.15em] text-slate-400 text-center mb-3 font-semibold">
          {t('liveWingman.whereAreYou', 'Location')}
        </p>
        <div className="relative">
              <button
            onClick={() => scrollVenue(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-white shadow-lg"
              >
            <ChevronLeft className="w-4 h-4" />
              </button>
          
          <div ref={venueScrollRef} className="flex gap-2 overflow-x-auto no-scrollbar px-8 py-1">
            {venueOptions.map((venue) => (
                  <button
                key={venue.id}
                onClick={() => { setDateVenue(venue.id); setResponse(null); }}
                className={`flex-shrink-0 flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                  dateVenue === venue.id 
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30' 
                    : 'bg-slate-800/60 border border-slate-700/50 hover:border-orange-500/50'
                }`}
              >
                <span className="text-2xl">{venue.emoji}</span>
                <span className="text-sm font-bold text-white">
                  {venue.label}
                </span>
                  </button>
            ))}
          </div>

                  <button
            onClick={() => scrollVenue(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-white shadow-lg"
          >
            <ChevronRight className="w-4 h-4" />
                  </button>
            </div>
          </div>

      {/* ========== SECTION 4: ACTIONS ========== */}
        <div className="px-5 mb-5">
        <p className="text-sm uppercase tracking-[0.15em] text-slate-400 text-center mb-3 font-semibold">
          {t('liveWingman.whatDoYouNeed', 'Quick Actions')}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {getActions().map((action) => (
                <button
                  key={action.id}
              onClick={() => generateResponse(action.label)}
                  disabled={isLoading}
              className={`bg-gradient-to-br ${action.color} p-3 rounded-xl text-center transition-all active:scale-95 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02]`}
            >
              <span className="text-2xl block mb-1">{action.emoji}</span>
              <span className="text-sm font-bold text-white">{action.label}</span>
                </button>
          ))}
          </div>
        </div>

      {/* ========== SECTION 5: ASK ANYTHING ========== */}
        <div className="px-5 mb-5">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400 text-center mb-3 font-semibold">
            {t('liveWingman.askAnything', 'Ask Anything')}
          </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder={t('liveWingman.placeholder', 'Should I go for the kiss?')}
              className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && customQuestion.trim() && generateResponse('custom', customQuestion)}
              />
              <Button
              onClick={() => { if (customQuestion.trim()) { generateResponse('custom', customQuestion); setCustomQuestion(''); }}}
                disabled={!customQuestion.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 rounded-xl disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

      {/* ========== LOADING ========== */}
        {isLoading && (
        <div ref={responseRef} className="px-5 mb-5">
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2 animate-bounce">🧠</div>
            <p className="text-white font-semibold text-sm">{t('liveWingman.loading.readingRoom', 'Reading the room...')}</p>
                  </div>
                  </div>
        )}

      {/* ========== RESPONSE ========== */}
      {response && !isLoading && (
        <div ref={responseRef} className="px-5 mb-5">
          <div className="bg-slate-800/80 border-2 border-purple-500/40 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-3 flex items-center justify-between border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{response.vibe || '🔥'}</span>
                <span className="text-white font-bold text-sm">{t('liveWingman.response.hereIsThePlan', "Here's the play")}</span>
                </div>
              {response.isAI && <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">🟢 AI</span>}
                </div>

            <div className="p-4 space-y-3">
              {/* Main */}
              <p className="text-white text-sm">{response.recommendation}</p>

              {/* Say this */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-emerald-400 uppercase mb-1 font-bold">💬 Say this</p>
                    <p className="text-emerald-200 text-sm font-medium">"{response.trySaying}"</p>
              </div>
                  <button onClick={() => copyToClipboard(response.trySaying)} className="text-emerald-400 p-1.5 hover:bg-emerald-500/20 rounded-lg">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
            </div>
          </div>

              {/* Body language */}
              {response.bodyLanguage && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
                  <p className="text-xs text-rose-400 uppercase mb-1 font-bold">🎭 Body Language</p>
                  <p className="text-rose-200 text-sm">{response.bodyLanguage}</p>
                </div>
              )}

              {/* Pro tip */}
              {response.proTip && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
                  <span>💎</span>
                  <p className="text-amber-200 text-xs font-medium">{response.proTip}</p>
              </div>
              )}

              {/* Retry */}
                  <button
                onClick={() => generateResponse(response.actionType || 'advice')}
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                <RefreshCw className="w-4 h-4" />
                {t('liveWingman.response.tryAnother', 'Try another')}
                  </button>
                </div>
              </div>
          </div>
        )}

      {/* ========== MORE + EXIT ========== */}
      <div className="px-5 mb-5 space-y-3">
        {/* More moves */}
              <div>
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400 text-center mb-3 font-semibold">
            {t('liveWingman.moreMoves', 'More Options')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'compliment', emoji: '🥰', label: t('liveWingman.moreActions.compliment', 'Compliment') },
              { id: 'joke', emoji: '😂', label: t('liveWingman.moreActions.joke', 'Joke') },
              { id: 'story', emoji: '📖', label: t('liveWingman.moreActions.story', 'Story') },
              { id: 'rescue', emoji: '🆘', label: t('liveWingman.moreActions.rescue', 'Save it') },
            ].map((action) => (
                  <button
                key={action.id}
                onClick={() => generateResponse(action.label)}
                disabled={isLoading}
                className="p-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl text-center transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="text-2xl block mb-1">{action.emoji}</span>
                <span className="text-sm font-bold text-white">{action.label}</span>
                  </button>
            ))}
                </div>
              </div>

        {/* Exit Strategy - ALARMING RED */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-4 shadow-lg shadow-red-500/40">
          <button
            onClick={() => setShowExitStrategy(!showExitStrategy)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚨</span>
                </div>
              <div className="text-left">
                <p className="text-white font-bold text-base">{t('liveWingman.exitStrategy.title', 'Exit Strategy')}</p>
                <p className="text-white text-sm">{t('liveWingman.exitStrategy.subtitle', 'Need to escape? Tap here')}</p>
            </div>
          </div>
            <ChevronRight className={`w-6 h-6 text-white transition-transform ${showExitStrategy ? 'rotate-90' : ''}`} />
          </button>
          
          {showExitStrategy && (
            <div className="mt-4 grid grid-cols-2 gap-2 animate-fadeIn">
              {exitExcuses.map((excuse) => (
                <button
                  key={excuse.id}
                  onClick={() => generateResponse(`Exit: ${excuse.label}`, `Need to leave smoothly with: "${excuse.label}"`)}
                  disabled={isLoading}
                  className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-center transition-all active:scale-95"
                >
                  <span className="text-2xl block mb-1">{excuse.emoji}</span>
                  <span className="text-sm text-white font-bold">{excuse.label}</span>
                </button>
              ))}
              </div>
          )}
              </div>
            </div>

      {/* Footer */}
      <div className="px-5 text-center">
        <p className="text-white/50 text-xs">💝 {t('liveWingman.consent', 'Always respect boundaries')}</p>
          </div>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
}
