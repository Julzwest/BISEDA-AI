/**
 * Conversation Strategy Engine™
 * 
 * Centralizes all conversation analysis and decision logic.
 * Used by Chat Co-Pilot and Live Wingman for consistent, personalized advice.
 */

// ============================================================
// A) NORMALIZE CHAT INPUT
// ============================================================

/**
 * Normalizes raw chat input into a structured format
 * @param {string} input - Raw pasted text or extracted screenshot text
 * @param {Object} options - Optional configuration
 * @param {string} options.source - Input source: "screenshot" | "text"
 * @returns {Object} Normalized chat object
 */
export function normalizeChatInput(input, options = {}) {
  const source = options.source || 'text';
  
  if (!input || typeof input !== 'string') {
    return {
      source,
      rawText: '',
      messages: [],
      meta: {
        userMessageStreak: 0,
        themMessageStreak: 0,
        totalUserMessages: 0,
        totalThemMessages: 0,
        sourceNote: source === 'screenshot' ? 'Speaker roles inferred from screenshot' : null
      }
    };
  }

  const rawText = input.trim();
  const lines = rawText.split('\n').filter(line => line.trim());
  
  const messages = lines.map(line => {
    const trimmedLine = line.trim();
    const { from, text } = detectSender(trimmedLine);
    
    // For screenshots, slightly reduce speaker attribution confidence
    const confidence = source === 'screenshot' ? 0.85 : 1.0;
    
    return {
      from,
      text,
      length: text.length,
      hasEmoji: containsEmoji(text),
      confidence // Track speaker attribution confidence
    };
  });

  // Calculate message streaks
  const meta = calculateMessageMeta(messages);
  
  // Add source-specific metadata
  meta.sourceNote = source === 'screenshot' 
    ? 'Speaker roles inferred from screenshot' 
    : null;

  return {
    source,
    rawText,
    messages,
    meta
  };
}

/**
 * Detects the sender from a message line
 */
function detectSender(line) {
  const lowerLine = line.toLowerCase();
  
  // User prefixes
  const userPrefixes = ['me:', 'i:', 'my:', 'user:'];
  for (const prefix of userPrefixes) {
    if (lowerLine.startsWith(prefix)) {
      return {
        from: 'user',
        text: line.substring(prefix.length).trim()
      };
    }
  }
  
  // Them prefixes
  const themPrefixes = ['them:', 'her:', 'him:', 'they:', 'you:', 'she:', 'he:', 'match:'];
  for (const prefix of themPrefixes) {
    if (lowerLine.startsWith(prefix)) {
      return {
        from: 'them',
        text: line.substring(prefix.length).trim()
      };
    }
  }
  
  // Check for common patterns like "[Name]:" or "Name:"
  const colonMatch = line.match(/^([A-Za-z]+):\s*(.+)/);
  if (colonMatch) {
    const name = colonMatch[1].toLowerCase();
    const text = colonMatch[2].trim();
    
    // Common user indicators
    if (['me', 'i', 'myself'].includes(name)) {
      return { from: 'user', text };
    }
    
    // Anything else with a name prefix is likely "them"
    return { from: 'them', text };
  }
  
  return {
    from: 'unknown',
    text: line
  };
}

/**
 * Checks if a string contains emoji
 */
function containsEmoji(text) {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|😀|😂|😍|❤|💕|🔥|👍|😊|🥰|😘|💋|🙈|😏|😉|🤔|😅|🤣|💪/gu;
  return emojiRegex.test(text);
}

/**
 * Calculates message metadata including streaks
 */
function calculateMessageMeta(messages) {
  let userMessageStreak = 0;
  let themMessageStreak = 0;
  let currentStreak = 0;
  let currentSender = null;
  let totalUserMessages = 0;
  let totalThemMessages = 0;

  // Calculate totals and trailing streaks
  for (const msg of messages) {
    if (msg.from === 'user') {
      totalUserMessages++;
      if (currentSender === 'user') {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentSender = 'user';
      }
    } else if (msg.from === 'them') {
      totalThemMessages++;
      if (currentSender === 'them') {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentSender = 'them';
      }
    }
  }

  // Set the final streak
  if (currentSender === 'user') {
    userMessageStreak = currentStreak;
  } else if (currentSender === 'them') {
    themMessageStreak = currentStreak;
  }

  return {
    userMessageStreak,
    themMessageStreak,
    totalUserMessages,
    totalThemMessages
  };
}

// ============================================================
// B) ANALYZE CONVERSATION
// ============================================================

/**
 * Analyzes a normalized chat and returns strategic insights
 * @param {Object} normalizedChat - Output from normalizeChatInput()
 * @returns {Object} Analysis results
 */
export function analyzeConversation(normalizedChat) {
  const { messages, meta, source } = normalizedChat;
  
  if (!messages || messages.length === 0) {
    return {
      interestLevel: 'Medium',
      momentum: 'Stable',
      powerBalance: 'Balanced',
      riskFlags: ['Not enough data to analyze'],
      source: source || 'text',
      sourceNote: meta?.sourceNote || null
    };
  }

  // Extract metrics
  const themMessages = messages.filter(m => m.from === 'them');
  const userMessages = messages.filter(m => m.from === 'user');
  
  // Calculate average message lengths
  const avgThemLength = themMessages.length > 0
    ? themMessages.reduce((sum, m) => sum + m.length, 0) / themMessages.length
    : 0;
  const avgUserLength = userMessages.length > 0
    ? userMessages.reduce((sum, m) => sum + m.length, 0) / userMessages.length
    : 0;
  
  // Count emojis from them
  const themEmojiCount = themMessages.filter(m => m.hasEmoji).length;
  const themEmojiRate = themMessages.length > 0 ? themEmojiCount / themMessages.length : 0;

  // Determine Interest Level
  let interestLevel = 'Medium';
  if (avgThemLength > 50 && themEmojiRate > 0.3) {
    interestLevel = 'High';
  } else if (avgThemLength > 30 || themEmojiRate > 0.2) {
    interestLevel = 'Medium';
  } else if (avgThemLength < 20 && themEmojiRate < 0.1) {
    interestLevel = 'Low';
  }

  // Determine Momentum
  let momentum = 'Stable';
  if (meta.themMessageStreak >= 2) {
    momentum = 'Building';
  } else if (meta.userMessageStreak >= 2) {
    momentum = 'Cooling';
  }

  // Determine Power Balance
  let powerBalance = 'Balanced';
  const messageRatio = meta.totalThemMessages > 0 
    ? meta.totalUserMessages / meta.totalThemMessages 
    : meta.totalUserMessages;
  
  if (messageRatio > 1.5) {
    powerBalance = 'UserChasing';
  } else if (messageRatio < 0.7) {
    powerBalance = 'ThemChasing';
  }

  // Detect Risk Flags
  const riskFlags = [];
  
  if (meta.userMessageStreak > 2) {
    riskFlags.push('Double texting');
  }
  
  if (meta.totalThemMessages === 0 && meta.totalUserMessages > 0) {
    riskFlags.push('Low reciprocity');
  }
  
  if (avgThemLength < 15 && themMessages.length > 0) {
    riskFlags.push('Short responses from them');
  }
  
  if (avgUserLength > avgThemLength * 2 && avgThemLength > 0) {
    riskFlags.push('Over-explaining');
  }
  
  if (messageRatio > 2) {
    riskFlags.push('Message imbalance');
  }
  
  if (themEmojiRate === 0 && themMessages.length > 2) {
    riskFlags.push('No emotional signals');
  }

  // Add positive note if things look good
  if (riskFlags.length === 0) {
    riskFlags.push('Conversation looks healthy');
  }
  
  // Add screenshot-specific note if applicable
  if (source === 'screenshot' && meta?.sourceNote) {
    // Don't add as risk flag, but include in metadata
  }

  return {
    interestLevel,
    momentum,
    source: source || 'text',
    sourceNote: meta?.sourceNote || null,
    powerBalance,
    riskFlags
  };
}

// ============================================================
// C) SUGGEST NEXT MOVE
// ============================================================

/**
 * Suggests the best strategic next move based on analysis and goal
 * @param {Object} analysis - Output from analyzeConversation()
 * @param {string} goal - The user's current goal
 * @returns {string} Strategic recommendation
 */
export function suggestNextMove(analysis, goal) {
  const { interestLevel, momentum, powerBalance, riskFlags } = analysis;
  
  const hasDoubleTexting = riskFlags.includes('Double texting');
  const hasLowReciprocity = riskFlags.includes('Low reciprocity');
  
  // Goal-specific suggestions
  switch (goal) {
    case 'flow':
    case 'Keep it flowing':
      if (momentum === 'Cooling') {
        return 'Ask an open-ended question about something they mentioned earlier.';
      }
      if (hasDoubleTexting) {
        return 'Give them space to respond. Wait for their message before sending another.';
      }
      return 'Keep the energy up by sharing something interesting about yourself.';

    case 'flirt':
    case 'Flirt / build attraction':
      if (interestLevel === 'Low') {
        return 'Build more rapport first. Flirting works better with established connection.';
      }
      if (powerBalance === 'UserChasing') {
        return 'Pull back slightly. Let them chase a little before escalating.';
      }
      return 'Add playful teasing or a compliment that shows you\'ve been paying attention.';

    case 'date':
    case 'Ask for the date':
      if (interestLevel === 'Low') {
        return 'Not yet. Build more interest before asking. They need to be more invested.';
      }
      if (momentum === 'Building') {
        return 'Great timing! Be confident and specific. Suggest a time and place.';
      }
      return 'Test the waters with a soft ask: mention something you\'d like to do together.';

    case 'recover':
    case 'Recover from a mistake':
      if (hasLowReciprocity) {
        return 'Give them time and space. One sincere message, then wait.';
      }
      return 'Acknowledge briefly without over-apologizing. Pivot to a new topic.';

    case 'boundaries':
    case 'Set boundaries / slow it down':
      return 'Be direct but kind. State your comfort level clearly without being cold.';

    default:
      return 'Stay authentic and match their energy level.';
  }
}

// ============================================================
// D) GENERATE REPLY
// ============================================================

/**
 * Generates personalized reply options based on goal, analysis, and profile
 * @param {string} goal - The user's goal
 * @param {Object} analysis - Output from analyzeConversation()
 * @param {Object} profile - User's profile from profileMemory
 * @returns {Object} Complete reply recommendations
 */
export function generateReply(goal, analysis, profile) {
  const { communicationStyle, datingGoal, boundaries } = profile || {};
  const { interestLevel, momentum, powerBalance } = analysis || {};
  
  // Get base responses for the goal
  const baseResponses = getBaseResponses(goal, analysis);
  
  // Personalize based on communication style
  const personalizedResponses = personalizeByStyle(baseResponses, communicationStyle);
  
  // Adjust based on dating goal
  const goalAdjustedResponses = adjustByDatingGoal(personalizedResponses, datingGoal);
  
  // Apply boundary filters
  const finalResponses = applyBoundaries(goalAdjustedResponses, boundaries);
  
  // Generate "why it works" explanations
  const whyItWorks = generateWhyItWorks(goal, analysis, communicationStyle);
  
  // Generate "avoid" warnings
  const avoid = generateAvoid(goal, analysis);
  
  // Generate next move suggestion
  const nextMove = suggestNextMove(analysis, goal);

  return {
    recommendedReply: finalResponses.main,
    alternatives: {
      playful: finalResponses.playful,
      confident: finalResponses.confident,
      direct: finalResponses.direct
    },
    whyItWorks,
    avoid,
    nextMove
  };
}

/**
 * Gets base response templates for each goal
 */
function getBaseResponses(goal, analysis) {
  const { interestLevel, momentum, powerBalance } = analysis || {};
  const isPositive = interestLevel !== 'Low' && momentum !== 'Cooling';
  
  const responses = {
    'flow': {
      main: isPositive
        ? "That's really interesting! What got you into that?"
        : "I'd love to hear more about that when you have time.",
      playful: "Okay wait, you can't just drop that without the full story 👀",
      confident: "I like that about you. Tell me more.",
      direct: "That's cool. What else should I know about you?"
    },
    'flirt': {
      main: isPositive
        ? "You're making it really hard to focus on anything else right now 😏"
        : "I have to admit, I was hoping you'd say that.",
      playful: "Careful, you're making me like you even more 😉",
      confident: "Talking to you is quickly becoming the best part of my day.",
      direct: "I'm really enjoying this. You've definitely got my attention."
    },
    'date': {
      main: isPositive
        ? "We should grab coffee this week. How does Thursday look?"
        : "I'd love to continue this in person sometime.",
      playful: "Alright, I've decided - we're getting drinks. You can thank me later 😄",
      confident: "Let's make this happen. When are you free?",
      direct: "I want to meet you. Are you free this weekend?"
    },
    'recover': {
      main: "Hey, I think that came out wrong. Let me try again - how's your day going?",
      playful: "Okay, pretend I didn't say that 😅 Anyway, what are you up to?",
      confident: "I'll own that one - not my smoothest moment. But I'm glad we're talking.",
      direct: "Sorry if that was awkward. Can we start fresh?"
    },
    'boundaries': {
      main: "I'm enjoying getting to know you, but I like to take things a bit slower.",
      playful: "Easy there tiger 😄 Let's save some mystery for later.",
      confident: "I appreciate the energy, but I prefer to build up to that.",
      direct: "I'm not quite there yet. Let's keep getting to know each other."
    }
  };

  // Match goal to response key
  const goalKey = Object.keys(responses).find(key => 
    key.toLowerCase().includes(goal?.toLowerCase()) || 
    goal?.toLowerCase().includes(key.toLowerCase())
  ) || 'flow';

  return responses[goalKey] || responses['flow'];
}

/**
 * Personalizes responses based on communication style
 */
function personalizeByStyle(responses, style) {
  const styleTweaks = {
    Direct: {
      prefix: '',
      suffix: '',
      emojiLevel: 'minimal'
    },
    Playful: {
      prefix: '',
      suffix: ' 😊',
      emojiLevel: 'moderate'
    },
    Calm: {
      prefix: '',
      suffix: '',
      emojiLevel: 'minimal'
    },
    Romantic: {
      prefix: '',
      suffix: ' 💕',
      emojiLevel: 'moderate'
    }
  };

  const tweak = styleTweaks[style] || styleTweaks['Playful'];
  
  // Apply style adjustments
  const adjustedMain = adjustMessageForStyle(responses.main, style);
  
  return {
    ...responses,
    main: adjustedMain
  };
}

/**
 * Adjusts a message for the user's communication style
 */
function adjustMessageForStyle(message, style) {
  if (!message) return message;
  
  switch (style) {
    case 'Direct':
      // Remove excessive emojis, keep it straightforward
      return message.replace(/😏|😉|😊|😄|👀/g, '').trim();
    
    case 'Calm':
      // Soften language, remove urgency
      return message
        .replace('really hard', 'nice')
        .replace('definitely', 'probably')
        .replace(/!/g, '.')
        .replace(/😏|😉/g, '');
    
    case 'Romantic':
      // Add warmth
      return message
        .replace('really hard', 'impossible')
        .replace('interesting', 'fascinating')
        .replace('nice', 'wonderful');
    
    case 'Playful':
    default:
      return message;
  }
}

/**
 * Adjusts responses based on dating goal
 */
function adjustByDatingGoal(responses, datingGoal) {
  if (datingGoal === 'Serious') {
    // Make responses more intentional
    return {
      ...responses,
      main: responses.main.replace('coffee', 'dinner').replace('drinks', 'dinner')
    };
  }
  
  if (datingGoal === 'Casual') {
    // Keep things light
    return {
      ...responses,
      main: responses.main.replace('dinner', 'drinks').replace('serious', 'fun')
    };
  }
  
  return responses;
}

/**
 * Applies user boundaries to filter inappropriate suggestions
 */
function applyBoundaries(responses, boundaries) {
  if (!boundaries || !boundaries.trim()) {
    return responses;
  }
  
  const lowerBoundaries = boundaries.toLowerCase();
  let filtered = { ...responses };
  
  // Check for common boundary keywords and adjust
  if (lowerBoundaries.includes('no kiss') || lowerBoundaries.includes('no physical')) {
    // Remove physical escalation suggestions
    filtered.main = filtered.main.replace(/kiss|touch|physical/gi, 'connect');
  }
  
  if (lowerBoundaries.includes('slow') || lowerBoundaries.includes('take time')) {
    // Soften urgency
    filtered.main = filtered.main
      .replace('this week', 'sometime soon')
      .replace('this weekend', 'when you\'re free');
  }
  
  return filtered;
}

/**
 * Generates "why it works" explanations
 */
function generateWhyItWorks(goal, analysis, style) {
  const baseReasons = {
    'flow': [
      'Shows genuine curiosity without being overwhelming',
      'Open-ended question keeps the conversation going',
      'Matches their energy level'
    ],
    'flirt': [
      'Creates tension and intrigue',
      'Shows vulnerability (attractive quality)',
      'Playful without being too forward'
    ],
    'date': [
      'Confident statement, not a nervous question',
      'Gives specific options (reduces decision paralysis)',
      'Low-pressure suggestion makes it easy to say yes'
    ],
    'recover': [
      'Acknowledges without over-apologizing',
      'Shows self-awareness',
      'Resets conversation to neutral ground'
    ],
    'boundaries': [
      'Clearly states your comfort level',
      'Affirms interest while setting pace',
      'Leaves room for them to respect your needs'
    ]
  };

  const goalKey = Object.keys(baseReasons).find(key => 
    goal?.toLowerCase().includes(key)
  ) || 'flow';

  const reasons = [...baseReasons[goalKey]];
  
  // Add style-specific reason
  if (style === 'Direct') {
    reasons.push('Direct approach shows confidence');
  } else if (style === 'Playful') {
    reasons.push('Playful tone builds rapport');
  } else if (style === 'Romantic') {
    reasons.push('Warm tone creates emotional connection');
  }

  return reasons.slice(0, 3);
}

/**
 * Generates "what to avoid" warnings
 */
function generateAvoid(goal, analysis) {
  const { riskFlags, powerBalance, interestLevel } = analysis || {};
  
  const avoidList = [];
  
  if (riskFlags?.includes('Double texting')) {
    avoidList.push("Don't send another message before they respond");
  }
  
  if (powerBalance === 'UserChasing') {
    avoidList.push("Avoid being too eager - let them invest too");
  }
  
  if (interestLevel === 'Low') {
    avoidList.push("Don't push for escalation when interest is low");
  }
  
  // Goal-specific warnings
  if (goal?.includes('date')) {
    avoidList.push("Don't use weak language like 'maybe' or 'if you want'");
  }
  
  if (goal?.includes('recover')) {
    avoidList.push("Don't keep apologizing - acknowledge once and move on");
  }

  // Ensure at least 2 items
  if (avoidList.length < 2) {
    avoidList.push("Avoid generic responses that could apply to anyone");
    avoidList.push("Don't match their energy if it's low - set the tone");
  }

  return avoidList.slice(0, 2);
}

// ============================================================
// LIVE WINGMAN HELPERS
// ============================================================

/**
 * Gets personalized advice for Live Wingman based on action and profile
 * @param {string} action - The action being considered (kiss, flirt, etc.)
 * @param {Object} signals - Current signals from the date
 * @param {Object} profile - User profile
 * @returns {Object} Personalized advice
 */
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE HITCH WINGMAN ENGINE™ - PhD-Level Dating Intelligence
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This is where the magic happens. Real-life Hitch, but in your pocket.
 * Deep signal reading, smooth delivery, and humor that actually lands.
 */

export function getWingmanAdvice(action, signals, profile) {
  const { communicationStyle, boundaries } = profile || {};
  const style = communicationStyle || 'Playful';
  
  // Deep signal analysis
  const signalAnalysis = analyzeSignals(signals);
  const { positiveCount, negativeCount, signalStrength, vibe } = signalAnalysis;
  
  // Get the perfect advice based on signal combination
  let recommendation = getHitchRecommendation(action, signalAnalysis, style);
  let consentLine = getSmooothLine(action, style, signalAnalysis);
  let fallback = getGracefulPivot(action, style, signalAnalysis);
  
  // Apply boundaries with class
  if (boundaries) {
    const boundaryCheck = checkBoundaries(boundaries, action, recommendation, consentLine);
    recommendation = boundaryCheck.recommendation;
    consentLine = boundaryCheck.consentLine;
  }

  return {
    recommendation,
    consentLine,
    fallback,
    isPositive: signalStrength === 'strong' || signalStrength === 'moderate',
    vibe,
    signalStrength
  };
}

function analyzeSignals(signals) {
  const positive = ['leaningIn', 'eyeContact', 'touchHappening', 'laughingRelaxed'];
  const negative = ['steppedBack', 'distracted'];
  
  const positiveCount = positive.filter(s => signals[s]).length;
  const negativeCount = negative.filter(s => signals[s]).length;
  
  // The magic: understanding WHAT combination of signals means
  const hasEyeContact = signals.eyeContact;
  const hasPhysicalConnection = signals.touchHappening || signals.leaningIn;
  const isRelaxed = signals.laughingRelaxed;
  const hasRedFlags = negativeCount > 0;
  
  let signalStrength, vibe;
  
  if (positiveCount >= 3 && !hasRedFlags) {
    signalStrength = 'strong';
    vibe = 'They are INTO you. Like, really into you.';
  } else if (positiveCount >= 2 && !hasRedFlags) {
    signalStrength = 'moderate';
    vibe = 'Good energy here. They\'re definitely interested.';
  } else if (positiveCount >= 1 && !hasRedFlags) {
    signalStrength = 'building';
    vibe = 'Interest is there, just warming up.';
  } else if (hasRedFlags && positiveCount >= 2) {
    signalStrength = 'mixed';
    vibe = 'Mixed signals - proceed with emotional intelligence.';
  } else if (hasRedFlags) {
    signalStrength = 'caution';
    vibe = 'Pump the brakes. Read the room.';
  } else {
    signalStrength = 'neutral';
    vibe = 'Not enough data yet. Keep vibing.';
  }
  
  return {
    positiveCount,
    negativeCount,
    signalStrength,
    vibe,
    hasEyeContact,
    hasPhysicalConnection,
    isRelaxed,
    hasRedFlags,
    signals
  };
}

function getHitchRecommendation(action, analysis, style) {
  const { signalStrength, hasEyeContact, hasPhysicalConnection, isRelaxed, hasRedFlags, signals } = analysis;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  
  // Slang and natural language helpers
  const hype = pick(['lowkey', 'highkey', 'literally', 'honestly', 'real talk', 'no cap', 'fr fr', 'deadass', 'straight up', 'not gonna lie']);
  const positive = pick(['fire', 'vibing', 'hitting different', 'chef\'s kiss', 'immaculate', 'elite', 'A-tier', 'top tier', 'golden', 'money']);
  const negative = pick(['sus', 'mid', 'giving off weird vibes', 'not it', 'a bit off', 'yikes energy']);
  const excitement = pick(['bro', 'yo', 'okay so', 'alright listen', 'hear me out', 'okay wait', 'hold up']);
  const transitions = pick(['anyway', 'but like', 'so basically', 'the thing is', 'here\'s the deal', 'plot twist', 'fun fact']);
  const emphasis = pick(['super', 'hella', 'mad', 'crazy', 'dummy', 'stupid', 'ridiculously', 'insanely']);
  const casual = pick(['tbh', 'ngl', 'imo', 'fyi', 'btw', 'just saying', 'for real though', 'I mean']);
  const reactions = pick(['sheesh', 'damn', 'bruh', 'yooo', 'ayy', 'oof', 'whew', 'mannnn']);
  const encouragement = pick(['you got this', 'trust the process', 'main character energy', 'king/queen shit', 'that\'s the move', 'secured the bag', 'W']);
  const warnings = pick(['red flag alert', 'proceed with caution', 'pump the brakes', 'hold your horses', 'slow your roll', 'easy tiger']);
  
  // ═══════════════════════════════════════════════════════════════
  // KISS - The most requested, most nerve-wracking move
  // ═══════════════════════════════════════════════════════════════
  if (action === 'kiss') {
    if (signalStrength === 'strong') {
      return pick([
        `${excitement}! Listen to me very carefully: they want you to kiss them. Like, ${hype} it's written all over their face. The eye contact, the leaning in, the laughing - that's not just "being friendly." That's straight up an invitation. The 90/10 rule applies here: you go 90%, let them come the final 10%. It's not just consent - it's the anticipation that makes it unforgettable. This is ${positive} energy right here.`,
        
        `Okay I'm gonna level with you real quick: if you DON'T go for this kiss, you're gonna be kicking yourself later. Like, in the shower tomorrow you'll be thinking "why didn't I just..." They're giving you every green light imaginable. Sustained eye contact + leaning in + touching? That's the dating trifecta, the holy grail, the whole nine yards. Pause the conversation, hold that eye contact for like 2 seconds longer than normal, then go for it. Slowly. Confidently. ${encouragement}.`,
        
        `${reactions}! Here's what I'm reading: they're not just interested, they're WAITING. The body language is ${hype} screaming "please kiss me already." Don't ask "can I kiss you?" like it's some business transaction or a terms and conditions thing. Instead, lean in close, pause for a hot second, and whisper "I've been wanting to do this all night." Then let the moment happen naturally. Trust me on this one, I've seen this movie before and you're the main character rn.`,
        
        `All systems are GO. 🚀 They're physically close, maintaining eye contact like their life depends on it, relaxed and laughing with you. In my professional dating opinion? This kiss will be remembered. Like, they're gonna text their bestie about this later type of remembered. Move slow though - urgency kills the vibe faster than you can say "what happened." Let your eyes drop to their lips, then back to their eyes. They'll get the message. This is textbook ${positive} territory.`,
        
        `Bruh. BRUH. The signals are immaculate rn. Like chef's kiss level body language. They've basically rolled out the red carpet and you're just standing there like 🧍. The vibe is ${hype} perfect - eye contact on point, they keep finding excuses to touch you, laughing at stuff that's not even that funny (no offense). This is your moment. Don't fumble the bag. Go 90% of the way, let them close the gap. It's romantic AND respectful. W move incoming.`,
        
        `${casual}, I don't even know why you're asking me - the answer is so obvious. They're into you. Like, INTO into you. The way they're looking at you? That's not how you look at someone you want to be "just friends" with. That's "I've been thinking about kissing you for the last 20 minutes" energy. Create a little pause in the conversation, let the silence build some tension, then make your move. Slow and confident. You literally cannot miss here.`,
        
        `Hold up, let me break this down for you real quick. Eye contact? ✓ Leaning in? ✓ Touch happening? ✓ Laughing and vibing? ✓ That's not just signals, that's a whole billboard saying "KISS ME." I've seen enough first dates to know when someone's ready, and ${hype} they're ready. The only way you mess this up is by overthinking it. Stop being in your head and be in the moment. You got this, champ.`
      ]);
    } else if (signalStrength === 'moderate') {
      return pick([
        `You're in solid territory, but don't rush it fam. The interest is there - I can see it in the signals, it's just not at fever pitch yet. Here's the move: create a moment. Get a little closer, lower your voice a bit, say something genuine about the night. If they lean in when you do, boom, green light. No lean? Keep building. Timing is ${hype} everything in this game.`,
        
        `The vibe is positive, but a kiss right now might feel slightly premature - like asking someone to move in on the second date, you know? Think of it like a song - you're at the bridge, not the chorus yet. Keep doing what you're doing: eye contact, light touches, genuine conversation. Give it another 10-15 minutes, then re-evaluate. The moment will feel more natural and ${positive}.`,
        
        `Okay, real talk: the signals are good but not overwhelming. They're vibing with you for sure, but I'm not seeing the "kiss me NOW" energy just yet. My advice? Test the waters with the triangle gaze - eyes to lips, back to eyes. If they do it back? You're cleared for landing. If not? You haven't lost anything and you didn't make it weird. It's reconnaissance, not rejection. Big brain moves only.`,
        
        `${casual}, the interest is definitely there but it's more of a slow burn situation. Which honestly? Can be even better than instant chemistry sometimes. Keep building that connection, throw in some light flirting, maybe accidentally-on-purpose let your hand brush against theirs. You're laying groundwork here. The kiss will come, and when it does, it'll hit different because you built up to it.`,
        
        `Moderate signals don't mean "no" - they mean "not yet, but keep doing what you're doing." You're on the right track, just maybe pump the brakes a tiny bit on the physical escalation. Focus on making them laugh, making them feel heard. Create some inside jokes. Build that emotional intimacy first. The physical stuff follows the emotional stuff like 99% of the time. ${encouragement}.`
      ]);
    } else if (signalStrength === 'mixed') {
      return pick([
        `I'm seeing conflicting data here and I gotta keep it real with you. They're showing interest but also some hesitation - it's giving mixed vibes. This isn't a "no" though - it's a "not yet." The worst thing you can do is force it or get in your feels about it. Instead, take a small step back (literally and figuratively). Create some space. Plot twist: often people need to miss your proximity to realize they want it. Absence makes the heart grow fonder and all that.`,
        
        `Mixed signals usually mean one thing: they're interested but nervous. Like, they WANT to be into it but there's something holding them back - maybe a bad experience, maybe they're just shy, maybe they had too much coffee and their brain is doing the most. Your job isn't to push through that nervousness - it's to dissolve it. Be warm, be patient, be present. Ask about something they're passionate about. When someone feels truly heard, walls come down naturally. It's psychology, baby.`,
        
        `${casual}, here's what I've learned about mixed signals in my years of studying this stuff: it's rarely about YOU. It's about their internal dialogue. They like you - that part is clear - but they're in their head about something. Maybe comparing you to an ex, maybe worried about getting hurt, maybe just overthinking everything like we all do sometimes. Don't take it personally. Keep being your charming self, and watch for the moment that tension breaks into a genuine smile.`,
        
        `Okay so the signals are a bit all over the place rn. They're laughing and engaged but also pulled back a little. That's not necessarily a bad thing - some people just take longer to warm up. Think of it like a cat. You can't just run up and pet a cat, they'll run away. You gotta let them come to you. Same energy here. Be chill, be present, don't force anything. The vibe will shift when they're ready.`,
        
        `Real talk? The energy is ${hype} confusing right now and I don't want you making a move and getting left on read in real life. Mixed signals call for a different strategy - dial back the intensity just a notch. Focus on conversation. Be genuinely curious about them. When you stop trying so hard to get somewhere, often that's when you actually get there. Ironic but true.`
      ]);
    } else {
      return pick([
        `Not gonna sugarcoat it chief: this isn't the moment. They've stepped back or seem distracted, and going for a kiss right now would be... not ideal. But here's the thing - that's information, not rejection. Pull back your energy just slightly. Create some space. Sometimes people need distance to realize they want you closer. It's counterintuitive, I know, but it ${hype} works.`,
        
        `The signals are telling me to hold off, and honestly? That's totally okay. The best kisses happen when BOTH people are dying for it, not when one person is mid-thought about what they're gonna have for breakfast tomorrow. Right now, focus on the connection. Make them laugh. Get them comfortable. The kiss will come, and when it does, it'll actually mean something. Patience, young grasshopper.`,
        
        `I'm gonna save you from an awkward moment here because that's what I do. The energy just isn't there for a kiss right now - I'm seeing distracted vibes, maybe some stepping back. But don't panic or spiral about it. Dates have ebbs and flows, that's totally normal. Re-engage with the conversation. Ask a deeper question. Drop something funny. The physical stuff will follow the emotional connection once you rebuild that vibe.`,
        
        `${warnings}. The body language is telling me now is not the time. But that's literally fine - you're not trying to speedrun this. Sometimes the best thing you can do is nothing. Just vibe. Let the conversation flow. Be present without being pushy. The moment will come when it comes, and when it does, it'll be because they're actually ready for it, not because you forced it.`,
        
        `Okay so ${hype} the vibe is not quite there for the kiss yet. They seem a bit in their head or distracted. But plot twist: this is actually useful information! Now you know to focus on reconnecting before escalating. Ask them something interesting. Share a funny story. Get them laughing again. Once that energy shifts back to engaged and present, then we can revisit the kissing conversation. No rush.`,
        
        `Ngl the signals right now are giving "maybe later" not "kiss me now." And that's totally valid! Not every moment is THE moment. What I'd do: take a breath, stop thinking about the kiss for now, and just focus on enjoying the conversation. Be genuinely interested in what they're saying. When people feel truly seen and heard, that's when the chemistry starts bubbling up naturally. You're playing the long game here.`
      ]);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // HOLD HANDS - The underrated power move
  // ═══════════════════════════════════════════════════════════════
  if (action === 'holdHands') {
    if (signalStrength === 'strong' || signalStrength === 'moderate') {
      return pick([
        `Hand holding is ${hype} so underrated it's criminal. It's intimate without being aggressive, sweet without being over the top. And the signals are totally right for it rn. Here's the smooth move: during a laugh or genuine moment, just reach over and take their hand naturally. Don't ask, don't hesitate, don't make it weird. Do it like you've done it a hundred times before. Confidence is ${positive}.`,
        
        `Okay fun science fact for you: hand holding literally releases oxytocin in both of you. It chemically creates a bond. I'm not making this up, it's biology working in your favor. The signals are good so capitalize on that. If you're walking, offer your hand when crossing a street - very rom-com, very effective. If sitting, during a meaningful moment, just let your hand find theirs. Make it feel inevitable, not calculated. Smooth operator energy.`,
        
        `Perfect timing tbh. They're relaxed, enjoying themselves, the vibe is ${positive}. The hand hold is your bridge to the next level of connection. Don't overthink it - reach over, interlock fingers (not that awkward palm-to-palm thing your grandparents do), and keep the conversation going like it's the most natural thing in the world. Because it literally is. Humans have been doing this for like a million years, you got this.`,
        
        `${casual}, hand holding might seem small but it's actually a huge move in the intimacy escalation ladder. It's like... it's the gateway. Once you're holding hands, everything else flows more naturally. The vibe is right for it - they're comfortable with you, the energy is good. Just slide your hand over there like you own the place. Main character energy. Don't second guess yourself.`,
        
        `The signals are telling me they'd be totally receptive to some hand holding action rn. Here's the clutch move: wait for a moment where you're both laughing or there's a little pause in the convo, then just reach over and take their hand. Don't announce it, don't ask permission like it's a big deal, just do it naturally. If they squeeze back? ${positive}. If they don't pull away? Still a W. You're building something here.`,
        
        `Yo the vibe is immaculate for a hand hold right now. They're leaned in, they're engaged, they're clearly feeling comfortable with you. Hand holding is like... it's intimate but it's also safe, you know? It says "I'm into you" without being too forward. Just reach over during a nice moment and let your fingers intertwine with theirs. Watch how they react. Spoiler: it's gonna be cute.`
      ]);
    } else {
      return pick([
        `Maybe pump the brakes on the hand hold for now. It might feel a bit forced given the current vibe, and forced physical contact is never the move. Instead, try the 'accidental touch' test - a brief touch on the arm during a laugh, let your knees bump when you're sitting. See how they respond. Do they lean into it? Good sign, keep building. Do they subtly create space? That's your answer, give it more time.`,
        
        `The energy isn't quite there for hand holding yet, and that's totally fine - we're not trying to speedrun intimacy here. Pro tip though: focus on micro-touches first. Touch their arm when making a point, high five after a good joke, let your shoulders brush while walking. These small moments build touch comfort over time, making the eventual hand hold feel natural instead of random.`,
        
        `${casual}, I'd wait on the hand hold. The signals aren't screaming "touch me" yet, and you don't wanna be that person who makes it awkward. But here's the move: build up to it. Little touches here and there, getting comfortable in each other's space. Once that foundation is there, the hand hold will happen naturally and it'll actually mean something.`,
        
        `The timing isn't quite right for jumping straight to hand holding - the vibe needs a little more warming up first. Think of it like... you wouldn't skip to the last chapter of a book, right? Build the story first. Light arm touches, getting physically closer during conversation, maybe a playful nudge. Once that touch barrier is broken on a smaller level, the hand hold becomes the obvious next step.`
      ]);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // FLIRT - The art of playful tension
  // ═══════════════════════════════════════════════════════════════
  if (action === 'flirt') {
    if (signalStrength === 'strong' || signalStrength === 'moderate') {
      return pick([
        `Green light to turn up the charm, bestie! Here's the thing about flirting that most people get wrong: it's not about cheesy pickup lines or being cringe. It's about TENSION. That push-pull, that playful energy, that "are we or aren't we" vibe. Tease them gently - like roast them a little but make it flirty. Hold eye contact a beat too long. Let your voice drop slightly when you compliment them. Make them FEEL desired, not just told they're attractive. There's a difference.`,
        
        `The vibe is ${positive} for some playful flirting rn. My best advice? Tease them about something they're clearly proud of. Like if they brag about their cooking, hit them with "Oh really? I'm gonna need proof of that. I'm very hard to impress." It's a compliment wrapped in a challenge wrapped in a flirt. That's like... flirting inception. Works every time.`,
        
        `Time to add some spice to this situation! 🌶️ But remember: the best flirting feels like an inside joke that only you two understand. Callback to something from earlier in the conversation, give them a look that says "I see you," add that little smirk. Flirting is ${hype} less about WHAT you say and way more about HOW you say it. The tone, the eye contact, the timing - that's where the magic is.`,
        
        `The signals say they're ready for you to bring the heat so let's gooo. Here's a certified pro move: lean in close like you're about to share a secret, pause for dramatic effect, then say something unexpected like "You know what? You're trouble." Then smile. Don't explain. Let them sit in that. The tension will be absolutely palpable. ${encouragement}.`,
        
        `${reactions}! The flirt opportunity is WIDE open rn. They're receptive, the energy is good, it's basically a green light. Here's the secret sauce: confident but not arrogant, playful but not clownish, interested but not desperate. Tease them about something silly, then immediately compliment them genuinely. The contrast is ${positive}. It keeps them on their toes and that's exactly where you want them.`,
        
        `Okay so the vibe is right to turn up the flirt factor. But let me school you on something real quick: the best flirts don't try to be smooth. They're just... present. Focused. They make the other person feel like they're the only one in the room. So put that phone away, maintain that eye contact, and let your genuine interest show through. That IS flirting, even without the clever lines.`,
        
        `The signals are saying "yes please flirt with me" and who are we to ignore that? Here's my move for you: find something to playfully disagree about. Not something serious, something stupid. Like pineapple on pizza or the best Avenger or whatever. Playful arguments = tension = flirting. And then when you "lose" the argument, say something like "Fine, you win. But only because you're cute." Boom. Flirt completed.`,
        
        `Listen, they're practically begging you to flirt with them right now, the energy is immaculate. Here's a slept-on technique: the compliment sandwich. Light tease, genuine compliment, light tease. "You're actually kind of annoying... annoyingly charming. It's very rude of you." Delivered with a smile, that's chef's kiss flirting. Not too intense, not too jokey. Just right.`
      ]);
    } else if (signalStrength === 'mixed' || signalStrength === 'building') {
      return pick([
        `Flirting is definitely possible here, but keep it light - we're going for a gentle simmer, not a full boil, ya know? Think playful vibes, not intense "I want to marry you" energy. Make them laugh first. Once they're genuinely smiling and the guard is down a bit, you can slide in a subtle compliment. The goal rn is to raise their comfort level before raising the temperature.`,
        
        `Gentle flirting only at this stage. The vibe needs a little more warming up before you go full charm offensive. Try what I call the "observational compliment" - notice something specific about them that others might miss. "I like how your eyes literally light up when you talk about music." It shows you're paying real attention, which is ${hype} more attractive than any pickup line.`,
        
        `The signals are there but they're not overwhelming, so let's play it smooth. Flirt, but make it subtle. A knowing smile, a slightly longer glance, a playful comment that could be interpreted multiple ways. You're planting seeds here, not trying to harvest the whole garden. Build that rapport first and the flirting will land so much better later.`,
        
        `${casual}, the vibe is promising but I'd keep the flirting on the lighter side for now. Not because they're not interested - they clearly are - but because anticipation is part of the game. Let the tension build naturally. A little mystery, a little playfulness, don't show all your cards at once. By the end of the date they should be wondering "wait, are they into me?" and the answer should be obvious but not over the top.`
      ]);
    } else {
      return pick([
        `Gonna be honest with you: dial back the flirting for now. Focus on genuine connection first, the flirty stuff can come later. Here's the thing - you literally cannot flirt your way out of a bad vibe. It just comes across as try-hard. You need to fix the foundation first. Ask about their passions. Show genuine curiosity. Be a good listener. The flirting will land 10x better when they actually feel comfortable around you.`,
        
        `The timing isn't quite right for heavy flirting rn. But here's a secret that took me years to figure out: sometimes the ABSENCE of flirting is powerful. Be genuinely interested, present, and warm without any agenda. When you finally DO flirt later, the contrast will make it hit completely different. It's like... the buildup makes the payoff better, you know?`,
        
        `${warnings} on the flirting front. The energy isn't there yet, and flirting into a cold vibe just makes things awkward for everyone. Pivot to genuine curiosity instead. Ask them about something they're passionate about and actually listen to the answer. Get them talking, get them comfortable. Once that foundation is solid, THEN you bring the charm. Patience, young padawan.`,
        
        `Ngl the signals are telling me to hold off on the flirting for now. But that's okay - every date has its rhythm. Right now, focus on being present and interesting. Share a good story, ask engaging questions, find common ground. The flirty energy will come naturally once you're both more comfortable. No need to force it.`
      ]);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // SILENCE FIX - The conversation resuscitator
  // ═══════════════════════════════════════════════════════════════
  if (action === 'silence') {
    if (signalStrength === 'strong' || signalStrength === 'moderate') {
      return pick([
        `Wait hold up - silence with good signals? That's not awkward, that's TENSION. That's cinematic. Sometimes the most powerful move is to NOT fill the space. Seriously. Hold their eyes, smile slightly, let the moment breathe. If it goes on too long and you need an out, just say "I'm sorry, I got lost in your eyes for a second there." Then smile. Confident as hell, absolutely ${positive}.`,
        
        `Here's a secret most people don't realize: comfortable silence is actually GOOD. It means you're both present, you're both vibing, nobody feels the need to perform. But if you wanna break it without being random, make an observation: "You know what I noticed about you?" Then pause. They'll lean in. You've got their attention. Now you can say literally anything and it'll land.`,
        
        `The silence isn't a problem here - the vibe is solid and honestly sometimes silence is more intimate than talking. But if you want to restart the conversation, use what I call the "random curiosity" technique: "Okay random question - if you could have dinner with anyone, alive or dead, who and why?" It's deeper than small talk, it's interesting, and ${hype} it tells you a lot about what kind of person they are.`,
        
        `${casual}, comfortable silence with someone you just met is actually a really good sign. It means neither of you feels the need to fill every second with noise. That's rare. But if you wanna break it, try sharing a random observation about the moment - "I like this. This is nice." Simple but it acknowledges the vibe without making it weird. Very emotionally intelligent, very attractive.`,
        
        `Some people panic in silence but you shouldn't. The signals are good, they're clearly comfortable with you. Sometimes just existing in the same space quietly is intimate. If you wanna say something though, go with a genuine thought: "I'm really glad I swiped right" or "This is the most fun I've had in a while." Simple, honest, hits different than trying to be clever.`,
        
        `Ngl comfortable silence is ${hype} underrated. It means you've reached a level of comfort where you don't need to perform for each other. That said, if you wanna restart the convo, the move is to say something slightly vulnerable: "I'm having a really good time. Like genuinely." It breaks the silence while also being authentic. Win-win.`
      ]);
    } else if (isRelaxed) {
      return pick([
        `They seem pretty relaxed, so the silence isn't fatal or anything. Break it with something genuine and simple: "I'm really glad we did this." That's it. Simple, warm, resets the conversation on a positive note. From there, ask about something you're actually curious about. Don't overthink it.`,
        
        `Relaxed silence is totally fine tbh. But here's a power move if you wanna use it: acknowledge it directly. "I love that we can just sit here without it being weird." It reframes the silence as intimacy, not awkwardness. Plus it shows emotional intelligence which is ${hype} attractive. It's like saying "yeah we're vibing" without actually saying that.`,
        
        `The silence isn't awkward if you don't make it awkward, you know? They're relaxed, so just go with it. But if you wanna break it, try something light: "What's on your mind?" or just share a random thought you're having. "I was just thinking about how good the music is here" or whatever. Easy, natural, no pressure.`,
        
        `They're chill, you're chill, the silence is fine. But if you're feeling the need to fill it, don't panic-ask a boring question. Instead say something observational about the moment or the place. "This place has really good vibes" or "You have a really calming presence, you know that?" Something that feels natural, not interview-y.`
      ]);
    } else {
      return pick([
        `Okay the silence is feeling a bit heavier here and we should probably address that. Quick fix: share a random thought or observation about your surroundings. "This place has such a weird vibe, I love it." Or "I wonder what the story is with that painting." It gives them something to react to without putting any pressure on them to carry the conversation.`,
        
        `The silence is getting kinda awkward ngl - time to rescue this situation. Here's what works: a little self-deprecating humor. "I'm way more charming in my head, I promise." It breaks the tension, shows you're human and don't take yourself too seriously, and almost always gets a laugh. From there, you can reset.`,
        
        `When in doubt, ask about THEM. People ${hype} love talking about themselves, it's basic psychology, and it takes all the pressure off you. Try something unexpected: "What's the most random skill you have that nobody knows about?" or "If you could instantly master any skill, what would it be?" It's fun, it's interesting, and it opens new conversation paths.`,
        
        `${casual}, awkward silences happen to everyone, it's not a big deal. The key is not to panic. Take a breath, look around, and find something to comment on. Or share something about yourself - "You know what I've been really into lately?" People can react to that, it gives them an in. Way better than just sitting there staring at each other getting more and more uncomfortable.`,
        
        `Okay so the vibe needs a little jumpstart. That's fine, we can work with this. The move is to say something slightly random that changes the energy: "Okay but real talk, what's your most unpopular opinion?" or "I feel like I need to know your go-to karaoke song." Something unexpected that makes them laugh or think. Gets you out of the silence spiral real quick.`,
        
        `The silence is hitting different rn and not in a good way. Quick rescue: vulnerability works. Something like "I'm usually better at this, I swear" with a little laugh. It acknowledges the awkwardness without making it a thing, shows you're self-aware, and usually resets the energy. Then immediately pivot to asking them something interesting. You got this.`
      ]);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPLIMENT - The art of making them feel seen
  // ═══════════════════════════════════════════════════════════════
  if (action === 'compliment') {
    if (signalStrength === 'strong' || signalStrength === 'moderate') {
      return pick([
        `Perfect time for a compliment, the vibe is ${positive}. But here's the key that separates the amateurs from the pros: make it SPECIFIC. Not "you're pretty" - literally everyone says that and it means nothing. Notice something unique. "The way you laugh at your own jokes before you tell them? Adorable." THAT hits different. It shows you're actually paying attention and not just running a script.`,
        
        `Compliment time! But let me put you on game real quick: compliment something they CHOSE, not just genetics. Their style, their passion, their perspective, their vibe. "I love how passionate you get when you talk about travel" beats "you have nice eyes" every single time. It's deeper, it shows you're actually listening, and it makes them feel seen for who they ARE, not just how they look.`,
        
        `The signals are great - time to land a meaningful compliment. Here's the move: pause the conversation, look at them for a moment like you're really seeing them, then say something real. "Can I just say? You're really easy to be around. Like, genuinely." The pause before makes it feel considered, not rehearsed. It's ${hype} chef's kiss level smooth.`,
        
        `Time to make them feel special, and I'm gonna teach you how to do it right. Delivery is literally everything with compliments. Lower your voice just a touch, hold that eye contact, and be genuine: "I keep trying to find a flaw, and I can't. It's very annoying." Humor + compliment = the perfect combo. They'll remember that one.`,
        
        `${reactions}, the vibe is right for a compliment. But don't be generic about it - that's how you end up in the "nice but forgettable" category. Notice something specific. How they tell stories, how their whole face changes when they talk about something they love, the way they dress, literally anything that shows you're paying attention. That specificity is what makes a compliment land.`,
        
        `Okay so the energy is perfect for a compliment rn. Pro tip: the best compliments are the ones that make someone go "wait, really? you noticed that?" Because it means you're seeing them, like REALLY seeing them. "I love how animated you get" or "You have this really warm energy" - specific, genuine, memorable. Not "you're hot." We're better than that.`,
        
        `The signals are ${positive} so let's hit them with a compliment that actually means something. Here's my go-to framework: notice something about them + what it makes you feel. "The way you talk about your friends - I can tell you really care about people. That's really attractive to me." It's specific, it's genuine, and it tells them something about how you see them. Top tier complimenting.`,
        
        `Perfect moment for a compliment. But I need you to understand something: the WAY you say it matters as much as what you say. Slow down a bit. Make eye contact. Let there be a little pause before you say it, like you're considering your words. "You know what I really like about you?" Then wait a beat before continuing. The anticipation makes whatever you say next land 10x harder.`
      ]);
    } else {
      return pick([
        `You can definitely still compliment, but keep it lighter given the current vibe. Something observational works well: "Your energy is really nice. Very calming." It's positive without being too intense. You're warming them up, not overwhelming them with feelings they're not ready for yet.`,
        
        `Gentle compliment territory only rn. Acknowledge something about the interaction rather than them directly: "This is actually really fun. I wasn't expecting to enjoy myself this much." It's a compliment by implication - you're saying THEY'RE fun without being too forward about it. Low pressure, still impactful.`,
        
        `${casual}, the vibe isn't quite at "intense compliment" level yet, but you can still drop something nice. Keep it light and observational: "You have a cool vibe" or "You're actually pretty easy to talk to." Nothing too deep, just a little positive reinforcement to keep the energy moving in the right direction.`,
        
        `I'd go with a lighter touch on the compliments given the current signals. Something indirect works great: "I'm glad we did this. You're fun." Simple, genuine, not overwhelming. You're planting seeds here, not proposing marriage. The bigger compliments can come later when the vibe is more established.`
      ]);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // END DATE - Leaving them wanting more
  // ═══════════════════════════════════════════════════════════════
  if (action === 'endDate') {
    if (signalStrength === 'strong' || signalStrength === 'moderate') {
      return pick([
        `Here's the dating secret that literally nobody talks about: leave on a HIGH. End when things are going amazing, not when they're starting to fade. Sounds counterintuitive right? But trust me - they'll remember the FEELING, not the length. Say something like "I don't want to, but I should probably go before I like you too much." Playful, confident, leaves them absolutely wanting more. ${encouragement}.`,
        
        `End on top, that's the move! The best dates end with someone thinking "wait, already??" not "thank god that's finally over." Keep it confident: "I have to head out, but this was really fun. We're definitely doing this again." Simple, direct, leaves the door wide open. Don't linger too long, don't overthink the goodbye. Just be smooth about it.`,
        
        `Perfect timing to end this on a high note. Here's how to make the goodbye memorable: during the actual goodbye moment, hold eye contact a second longer than you normally would. If the vibe is right, a brief touch on their arm or a slightly lingering hug. Make the goodbye almost as good as the date itself. Leave them thinking about you on the drive home.`,
        
        `${reactions}, the vibe is ${positive} which means this is actually the PERFECT time to end. I know it seems weird to leave when things are good, but hear me out: you want them to remember the high point, not the awkward "well I guess we're done" moment. Hit them with "I really don't want to leave but I should. Let's do this again soon?" Boom. Perfect ending.`,
        
        `Here's some high-level dating strategy for you: always leave them wanting more. It's like a TV show ending on a cliffhanger - they'll be thinking about the next episode. "This was amazing. I'm already thinking about what we're gonna do next time." Confident, forward-looking, sets up the sequel perfectly. Don't overstay your welcome, even if things are going great.`,
        
        `The vibe is good so let's end it on a high. Don't drag it out until things get awkward. Say something genuine but with a little flirt: "I had way more fun than I expected. You're dangerous." Smile, maybe a lingering look, and bounce. Leave them wanting more. That's the whole game right there.`,
        
        `Time to make your exit, and I'm gonna teach you how to do it right. The goodbye should feel like a continuation, not an ending. "I'm not ready for this to be over, but I gotta go. Text me when you get home." It's caring, it's confident, and it keeps the conversation going even after you leave. ${positive} move.`
      ]);
    } else {
      return pick([
        `Ending might be the right call if things aren't exactly clicking. But do it gracefully - no need to make it weird. "I've had a nice time, thank you for tonight." Simple, classy, no drama. Not every date is a match and ${hype} that's totally okay. You put yourself out there, that's what matters.`,
        
        `If you're feeling the need to end things, trust that instinct. Your gut usually knows. But make it elegant: "I should probably head out, but it was really nice meeting you." Warm but clear. And hey, sometimes a lukewarm first date leads to a great second one when there's less pressure. You never know.`,
        
        `${casual}, if the vibe isn't there, it's totally fine to wrap things up. No need to force it or feel guilty about it. A simple "Thanks for meeting up, I had a nice time" is perfectly adequate. Keep it positive, keep it brief. Not every connection is meant to be a love story and that's part of the game.`,
        
        `Look, if it's not vibing the way you hoped, there's no shame in calling it a night. Be gracious about it though: "I'm gonna head out, but thanks for the evening." Polite, not cold. You're not burning bridges, just acknowledging that maybe the chemistry wasn't quite there. Happens to everyone, don't sweat it.`
      ]);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // SECOND DATE - Sealing the deal
  // ═══════════════════════════════════════════════════════════════
  if (action === 'secondDate') {
    if (signalStrength === 'strong') {
      return pick([
        `Ask for that second date like it's inevitable - because with these signals? It basically is. Don't be wishy-washy about it. Don't say "Would you maybe possibly want to perhaps..." No. Say "So when are we doing this again?" Assume the yes. Confidence is ${hype} attractive and you've earned the right to be confident here.`,
        
        `The signals are screaming YES so let's capitalize on that. Here's the clutch move: tie the second date to something from the conversation. If they mentioned loving tacos, hit them with "Okay, there's this spot I need to take you to. Best tacos in the city. When are you free?" It shows you actually listened AND creates anticipation. Double win.`,
        
        `Lock it in! But make it easy for them: have a specific plan, not a vague "let's hang out sometime." That's weak sauce. Try: "There's this [place/event] I've been wanting to check out. You're coming with me next weekend." Playfully assertive, not pushy. Works literally every time. ${encouragement}.`,
        
        `These signals are ${positive}. Ask confidently: "So I'm thinking we do this again. Same time next week?" When they say yes (and they will, the vibe is immaculate), add "I'm already looking forward to it." Leave them on a high, thinking about you, excited for round two.`,
        
        `${reactions}, the vibe is so good that NOT asking for a second date would be criminal. Make your move. "I'm not letting you disappear. When can I see you again?" Direct, confident, makes your interest crystal clear. They're into you, you're into them, why play games? Secure that second date.`,
        
        `Okay so the green lights are everywhere and it's time to close. Here's my favorite approach: be specific and enthusiastic. "I know exactly what we're doing next time - there's this place you're gonna love. You free Saturday?" You're not asking IF there's a next time, you're assuming it and just working out logistics. Big difference in energy.`,
        
        `The chemistry is undeniable rn so let's lock in that sequel. Don't be vague about it. "I'm not done hanging out with you. What does next week look like?" Confident without being arrogant, enthusiastic without being desperate. That's the sweet spot. They're gonna say yes. Book it.`,
        
        `Everything is pointing to GO so let's make it happen. Here's the smooth way to do it: "I feel like we've barely scratched the surface. Same time next week, different place?" It implies there's more to discover, sets up the next date, and shows you're genuinely interested in knowing them better. ${positive} energy all around.`
      ]);
    } else if (signalStrength === 'moderate' || signalStrength === 'building') {
      return pick([
        `Solid ground for asking. Here's the key: be specific but keep it low-pressure. "I'd really like to see you again. What does your weekend look like?" Direct, shows clear interest, but gives them an easy out if they need one. Spoiler: they probably won't need it.`,
        
        `The interest is definitely there. Go for it, but leave room for them to be enthusiastic too: "I had a really good time. I'd love to do this again if you're down." The "if you're down" is gracious without being insecure. It's collaborative, not demanding.`,
        
        `Time to shoot your shot. Pro tip: reference something you both wanted to do or talked about. "Remember when you mentioned wanting to try that new place? Let's go together next week." It frames the second date as a shared adventure, not a formal interrogation. Much better energy.`,
        
        `The vibe is promising so don't leave things open-ended. "I had a great time. Let's do this again - maybe [specific day/activity]?" Having something specific in mind shows you've actually thought about it, not just throwing out a generic "we should hang out sometime."`,
        
        `${casual}, the signals are good enough to ask for round two. Keep it confident but not over the top: "This was fun. I'd like to see you again - you free this weekend?" Simple, direct, no games. If they're feeling it too (and the signals suggest they are), they'll say yes.`
      ]);
    } else {
      return pick([
        `The signals aren't overwhelmingly positive, but you can still plant the seed. Something casual: "I had a nice time. Let me know if you want to do this again sometime." It's an invitation, not pressure. Ball's in their court. No harm in putting it out there.`,
        
        `If you're feeling it even though the signals are mixed, you can still ask - just keep expectations in check. "I'd like to see you again. No pressure, but think about it?" It's honest and gives them space to make their own decision. Sometimes lukewarm first dates lead to great second ones when both people are more relaxed.`,
        
        `Look, the vibe wasn't fireworks but that doesn't mean you can't try. Keep it light: "I had a nice time tonight. If you're ever up for round two, let me know." Leaves the door open without putting pressure on either of you. Sometimes chemistry takes time to develop.`,
        
        `${casual}, even if the signals aren't screaming "YES!", you can still express interest. "Thanks for tonight. I'd be open to doing this again if you are." It's honest, it's low-pressure, and it lets them know where you stand without being pushy about it.`
      ]);
    }
  }
  
  // Default fallback with more personality
  return pick([
    `Honestly? Trust your instincts here. You know the vibe better than I do from my position as your phone's AI wingman lol. Be confident, be genuine, and remember: the goal isn't perfection, it's connection. You're doing great.`,
    
    `Here's my advice, and it's gonna sound simple but it's true: stay present. Stop overthinking. The fact that you're here, on this date, already means something. You showed up. That takes guts. Now just enjoy the moment and let yourself have fun with it.`,
    
    `Dating is ${hype} just two people trying to figure out if they vibe with each other. That's literally all it is. No pressure. Be yourself, be genuinely interested in them, and let things unfold naturally. You've got this. ${encouragement}.`,
    
    `Look, I can give you all the tips in the world, but at the end of the day, you're the one in the moment. Read the room, trust your gut, be authentic. The best version of you is the real version of you. Now go make some magic happen.`,
    
    `${casual}, you're overthinking this. Just be present, be interested, and be yourself. Dating isn't rocket science even though our brains try to make it seem that way. Relax, have fun, and whatever happens, happens. The right person will appreciate the real you.`,
    
    `My best advice? Stop trying to be perfect and just be REAL. Nobody wants to date someone performing their idea of what a date should be. They want to connect with an actual human. So be that. Be curious, be warm, be yourself. That's the whole secret, honestly.`,
    
    `Alright, here's some real talk: the most attractive thing you can be is genuinely interested in the other person. Not trying to impress them, not running through mental checklists, just... actually wanting to know who they are. Do that and you're already ahead of 90% of people on dates.`
  ]);
}

function getSmooothLine(action, style, analysis) {
  const { signalStrength, hasEyeContact, isRelaxed } = analysis;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  
  const isGoodVibes = signalStrength === 'strong' || signalStrength === 'moderate';
  
  const lines = {
    Direct: {
      kiss: isGoodVibes 
        ? pick([
            "I really want to kiss you right now.",
            "I'm going to kiss you now. Come here.",
            "Can I kiss you? Because I really, really want to.",
            "I've been thinking about this all night. Come here."
          ])
        : pick(["I've really enjoyed tonight.", "This has been nice."]),
      holdHands: pick([
        "Give me your hand.",
        "Come here.",
        "I want to hold your hand. Is that okay?",
        "Let me take your hand."
      ]),
      flirt: pick([
        "You're dangerously attractive, you know that?",
        "I'm trying really hard to focus on what you're saying, but you're very distracting.",
        "I have to be honest - I'm really attracted to you.",
        "You're making it very hard to concentrate right now.",
        "I like looking at you. Just thought you should know."
      ]),
      silence: pick([
        "Tell me something real about you.",
        "What's on your mind?",
        "What's the one thing you want me to know about you?",
        "Talk to me. What are you thinking?"
      ]),
      compliment: pick([
        "You're impressive. The whole package.",
        "I don't know what it is about you, but I like it.",
        "You're different from other people. In a good way.",
        "There's something about you that I can't quite figure out. I like it."
      ]),
      endDate: pick([
        "I have to go, but I didn't want this to end.",
        "Best date I've had in a while. Let's do it again.",
        "I should leave before I like you too much.",
        "Leaving is the last thing I want to do right now."
      ]),
      secondDate: pick([
        "Same time next week?",
        "When can I see you again?",
        "We're doing this again. When works for you?",
        "I'm not letting you disappear. When can I see you?"
      ])
    },
    Playful: {
      kiss: isGoodVibes 
        ? pick([
            "So... are we gonna address the elephant in the room, or should I just kiss you already? 😏",
            "I've been thinking about kissing you for the last 20 minutes. Just thought you should know.",
            "Plot twist: I really want to kiss you right now.",
            "Okay but like... can we just skip to the part where I kiss you?",
            "I'm trying really hard to be cool but I really want to kiss you rn.",
            "This would be a really good moment for a kiss. Just saying. 😊"
          ])
        : pick([
            "You know, you're actually kind of fun to hang out with.",
            "Ngl, I didn't expect to like you this much.",
            "Okay fine, you're pretty cool. Don't let it go to your head though."
          ]),
      holdHands: pick([
        "Your hand looks lonely. I should fix that.",
        "I'm taking your hand now. Don't make it weird. 😊",
        "Okay but your hand needs to be in my hand. It's science.",
        "Is it too forward if I just... *takes hand*",
        "Give me your hand. I promise I'll give it back. Maybe."
      ]),
      flirt: pick([
        "Stop being so cute, it's very distracting.",
        "Are you always this charming, or am I just lucky tonight?",
        "You're kind of annoying, you know that? Annoyingly attractive.",
        "I'm trying to play it cool but you're making it really difficult.",
        "You're trouble. I can tell. I'm into it. 😏",
        "Why are you like this? Like, in a good way.",
        "Okay but you're not allowed to be this attractive AND funny. Pick one."
      ]),
      silence: pick([
        "Okay, random question time - if you were a pizza topping, what would you be and why?",
        "Quick, tell me your most controversial opinion.",
        "Pop quiz: what's the most random fact you know?",
        "Okay but what's your hot take on pineapple on pizza? This is important.",
        "Tell me something that would make me go 'wait, really?'",
        "What's your villain origin story?"
      ]),
      compliment: pick([
        "I'm trying to find something wrong with you. It's not working.",
        "You're kind of annoyingly perfect, you know that?",
        "Okay but like... who gave you permission to be this cute?",
        "You're not supposed to be this attractive AND interesting. It's unfair.",
        "I have a complaint: you're too charming and it's very distracting.",
        "I keep trying to play it cool but you're making it impossible."
      ]),
      endDate: pick([
        "Ugh, I don't want to leave but I have to adult tomorrow. 😩",
        "This was disgustingly fun. We're doing it again.",
        "I'm leaving before I do something embarrassing like ask you to marry me.",
        "Okay I'm gonna go but just know I'm already thinking about next time.",
        "I'm gonna leave while the vibes are still immaculate. You're welcome. 😊"
      ]),
      secondDate: pick([
        "So when's round two? I need to redeem myself on that trivia question.",
        "You. Me. Next weekend. I'm not asking, I'm telling. 😊",
        "Same time next week? Cool, it's a date. I'm putting it in my calendar right now.",
        "We're doing this again. I don't make the rules. Actually I do. And I made this one.",
        "Okay but when am I seeing you again? Asking for myself."
      ])
    },
    Calm: {
      kiss: isGoodVibes 
        ? pick([
            "I'd really like to kiss you, if that's okay.",
            "This feels like a perfect moment.",
            "May I kiss you? I've been thinking about it.",
            "I feel like this is the right moment. Can I?",
            "I want to kiss you. Is that okay?"
          ])
        : pick([
            "Thank you for such a lovely evening.",
            "I'm really glad we did this.",
            "This has been really nice."
          ]),
      holdHands: pick([
        "May I?",
        "Is this okay?",
        "I'd like to hold your hand, if you're comfortable with that.",
        "Can I?"
      ]),
      flirt: pick([
        "There's something really special about you.",
        "I feel very comfortable with you.",
        "You have a really calming presence. I like it.",
        "I'm really enjoying your company.",
        "You're very easy to be around."
      ]),
      silence: pick([
        "I'm really enjoying this.",
        "It's nice to just... be here with you.",
        "I like this. Just being here together.",
        "This is nice, isn't it?",
        "I'm really glad we did this."
      ]),
      compliment: pick([
        "You have this calming presence. I really appreciate it.",
        "You're genuinely kind. That's rare.",
        "I really like your energy.",
        "You're very thoughtful. I noticed.",
        "There's something very genuine about you."
      ]),
      endDate: pick([
        "This was really lovely. Thank you.",
        "I don't want to leave, but I should. I had a wonderful time.",
        "Thank you for tonight. It meant a lot.",
        "I really enjoyed this. Thank you for sharing your time with me."
      ]),
      secondDate: pick([
        "I'd really like to see you again. Would you be open to that?",
        "Can we do this again soon? I'd like that.",
        "I hope we can do this again sometime.",
        "I'd really like to see you again. What do you think?"
      ])
    },
    Romantic: {
      kiss: isGoodVibes 
        ? pick([
            "I've been wanting to do this all night.",
            "You're beautiful. I can't help myself.",
            "This moment feels perfect. May I?",
            "I want to kiss you. I've wanted to all night.",
            "Everything about this moment is right.",
            "I've never wanted to kiss someone more than I want to kiss you right now."
          ])
        : pick([
            "Tonight has been magical.",
            "I don't want this night to end.",
            "Being here with you... it means something."
          ]),
      holdHands: pick([
        "I want to be closer to you.",
        "Your hand fits perfectly in mine.",
        "I need to hold your hand. It feels right.",
        "Let me hold your hand. I want to be close to you."
      ]),
      flirt: pick([
        "You take my breath away. Literally.",
        "I could get lost in your eyes.",
        "Something about you is absolutely captivating.",
        "You're enchanting. There's no other word for it.",
        "I can't stop looking at you.",
        "You're the most interesting person in any room you walk into."
      ]),
      silence: pick([
        "Some moments don't need words.",
        "Just you. This. It's perfect.",
        "I could stay here forever.",
        "This silence says more than words could."
      ]),
      compliment: pick([
        "You're extraordinary. Every little thing about you.",
        "I didn't know people like you existed.",
        "Everything about you is captivating.",
        "You're unlike anyone I've ever met.",
        "You're beautiful. Inside and out."
      ]),
      endDate: pick([
        "Leaving you is the hardest part of tonight.",
        "I'll be thinking about you until I see you again.",
        "I don't want to say goodnight. Not yet.",
        "Every moment with you has been perfect. Thank you.",
        "This isn't goodbye. It's just... until next time."
      ]),
      secondDate: pick([
        "I need to see you again. Soon.",
        "Tell me when I can see you next. I'm already counting the hours.",
        "When can I see you again? I'm already looking forward to it.",
        "I can't wait to see you again. When are you free?",
        "Say you'll see me again. Please."
      ])
    }
  };
  
  const styleLines = lines[style] || lines['Playful'];
  return styleLines[action] || pick([
    "I'm having such a great time with you.",
    "This has been really nice.",
    "I like this. I like you.",
    "You're pretty cool, you know that?",
    "I'm really glad we did this.",
    "This is fun. You're fun."
  ]);
}

function getGracefulPivot(action, style, analysis) {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  
  const pivots = {
    Direct: pick([
      "Anyway, tell me more about that trip you mentioned.",
      "So what's the most interesting thing you've done this week?",
      "Should we get another drink?",
      "What's something you're really passionate about?",
      "Tell me more about yourself. What should I know?",
      "So what do you do when you're not on dates with strangers?",
      "What's the best thing that happened to you this week?",
      "I want to know more about you. What makes you tick?"
    ]),
    Playful: pick([
      "Okay, new topic - if you had to survive on three foods forever, what are they? This is important.",
      "Wait, I need to know your most embarrassing story. For research purposes.",
      "Quick, what's your most controversial food opinion? Pineapple on pizza, go!",
      "Okay but what's your unpopular opinion that would get you cancelled?",
      "Random question: if you could have dinner with anyone, alive or dead, who?",
      "What's the most random skill you have that nobody knows about?",
      "If you could instantly be an expert at something, what would it be?",
      "Tell me something about you that would surprise me.",
      "What's your villain origin story?",
      "If you won the lottery tomorrow, what's the first thing you'd do?",
      "What would your TED talk be about?",
      "If your life was a movie, what genre would it be?",
      "What's on your bucket list that you haven't told anyone about?",
      "What's the weirdest Wikipedia rabbit hole you've gone down?"
    ]),
    Calm: pick([
      "This is really nice. I'm glad we did this.",
      "So what does the rest of your week look like?",
      "Tell me something you're looking forward to.",
      "What do you like to do in your free time?",
      "I'm curious - what made you want to go on this date?",
      "What's something that always makes you happy?",
      "Tell me about your favorite place.",
      "What's something you've been thinking about lately?",
      "Is there anything you've been wanting to try recently?",
      "What does a perfect day look like for you?"
    ]),
    Romantic: pick([
      "I love how easy this feels.",
      "There's something about tonight that feels special.",
      "I could talk to you for hours.",
      "Tell me your dreams. What do you really want in life?",
      "What's something that means a lot to you?",
      "I want to know what makes you you.",
      "What's the most meaningful thing in your life right now?",
      "Tell me about a moment that changed you.",
      "What do you look for in a connection?",
      "What makes you feel most alive?"
    ])
  };
  
  return pivots[style] || pivots['Playful'];
}

function checkBoundaries(boundaries, action, recommendation, consentLine) {
  const lower = boundaries.toLowerCase();
  
  if ((lower.includes('no kiss') || lower.includes('take it slow') || lower.includes('no physical')) && action === 'kiss') {
    return {
      recommendation: "Your boundaries are important. Focus on emotional connection first - the physical stuff can wait. There's no rush. The right person will respect your pace.",
      consentLine: "I'm really enjoying getting to know you."
    };
  }
  
  if ((lower.includes('no touch') || lower.includes('no physical')) && (action === 'holdHands' || action === 'kiss')) {
    return {
      recommendation: "Respecting your boundaries here. Keep building that emotional connection. Great conversation and genuine interest are just as powerful as physical touch.",
      consentLine: "I could talk to you for hours."
    };
  }
  
  return { recommendation, consentLine };
}
