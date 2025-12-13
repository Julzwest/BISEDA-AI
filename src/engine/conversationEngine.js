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
export function getWingmanAdvice(action, signals, profile) {
  const { communicationStyle, boundaries } = profile || {};
  
  // Count positive/negative signals
  const positiveSignals = ['leaningIn', 'eyeContact', 'touchHappening', 'laughingRelaxed']
    .filter(s => signals[s]).length;
  const negativeSignals = ['steppedBack', 'distracted']
    .filter(s => signals[s]).length;
  
  const isPositive = positiveSignals >= 2 && negativeSignals === 0;
  
  // Get base recommendation
  let recommendation = isPositive
    ? getPositiveRecommendation(action, communicationStyle)
    : getNegativeRecommendation(action, communicationStyle);
  
  // Get consent line adjusted for style
  let consentLine = getConsentLine(action, communicationStyle, isPositive);
  
  // Get fallback line
  let fallback = getFallbackLine(action, communicationStyle);
  
  // Apply boundaries
  if (boundaries?.toLowerCase().includes('no kiss') && action === 'kiss') {
    recommendation = "Your boundaries indicate taking physical escalation slow. Focus on connection first.";
    consentLine = "I'm really enjoying this conversation with you.";
  }

  return {
    recommendation,
    consentLine,
    fallback,
    isPositive
  };
}

function getPositiveRecommendation(action, style) {
  const recs = {
    kiss: style === 'Direct' 
      ? "Signals look good. Ask clearly and confidently."
      : "The vibe is right! Consider making your move with consent.",
    holdHands: "Great timing for physical connection. Go for it naturally.",
    flirt: "They're receptive - turn up the charm!",
    silence: "Comfortable silence is fine, but here's a conversation starter if needed.",
    compliment: "Perfect moment for a genuine compliment.",
    endDate: "End on a high note - leave them wanting more.",
    secondDate: "Great timing! Ask confidently."
  };
  return recs[action] || "The signals are positive. Trust your instincts.";
}

function getNegativeRecommendation(action, style) {
  const recs = {
    kiss: "Hold off for now. The vibe isn't quite there yet.",
    holdHands: "Maybe wait a bit. Focus on conversation first.",
    flirt: "Keep it light - build more comfort before escalating.",
    silence: "Re-engage with an interesting question or story.",
    compliment: "Keep it subtle and genuine.",
    endDate: "Ending might be the right call. Keep it positive.",
    secondDate: "Consider waiting and texting tomorrow instead."
  };
  return recs[action] || "Read their body language before proceeding.";
}

function getConsentLine(action, style, isPositive) {
  if (!isPositive) {
    return "I'm really enjoying getting to know you.";
  }
  
  const styleLines = {
    Direct: {
      kiss: "I'd really like to kiss you. Is that okay?",
      holdHands: "Let me take your hand.",
      flirt: "I have to be honest - I'm really attracted to you."
    },
    Playful: {
      kiss: "I really want to kiss you right now... would that be okay? 😊",
      holdHands: "Your hand looks lonely. Mind if I fix that?",
      flirt: "You're making it impossible to focus on anything else 😏"
    },
    Calm: {
      kiss: "I'd like to kiss you, if you're comfortable with that.",
      holdHands: "May I hold your hand?",
      flirt: "I'm really enjoying your company tonight."
    },
    Romantic: {
      kiss: "This moment feels perfect. I'd love to kiss you.",
      holdHands: "I want to be closer to you.",
      flirt: "Something about you is absolutely captivating."
    }
  };
  
  const lines = styleLines[style] || styleLines['Playful'];
  return lines[action] || "I'm having such a great time with you.";
}

function getFallbackLine(action, style) {
  const fallbacks = {
    Direct: "Should we grab another drink?",
    Playful: "So, tell me something I don't know about you!",
    Calm: "This has been really nice.",
    Romantic: "I'm so glad we did this tonight."
  };
  return fallbacks[style] || "This has been really nice.";
}
