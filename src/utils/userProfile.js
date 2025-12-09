// User Profile System - Learns user patterns, vocabulary, and style

// Generate or retrieve user ID
function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
}

// Get user profile
function getUserProfile() {
  const userId = getUserId();
  const profileKey = `userProfile_${userId}`;
  const stored = localStorage.getItem(profileKey);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing user profile:', e);
    }
  }
  
  // Default profile
  return {
    userId,
    vocabulary: [], // Words/phrases user commonly uses
    style: {
      formality: 'casual', // casual, formal, mixed
      slangLevel: 'medium', // low, medium, high
      explicitLevel: 'high', // low, medium, high
      humorLevel: 'medium', // low, medium, high
    },
    patterns: {
      commonPhrases: [], // Frequently used phrases
      sentenceLength: 'medium', // short, medium, long
      punctuationStyle: 'normal', // normal, minimal, excessive
    },
    preferences: {
      topics: [], // Topics user likes to discuss
      responseLength: 'medium', // short, medium, long
      responseStyle: 'conversational', // conversational, direct, detailed
    },
    stats: {
      totalMessages: 0,
      averageMessageLength: 0,
      mostUsedWords: {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }
  };
}

// Save user profile
function saveUserProfile(profile) {
  const profileKey = `userProfile_${profile.userId}`;
  profile.lastUpdated = new Date().toISOString();
  localStorage.setItem(profileKey, JSON.stringify(profile));
}

// Analyze message and update profile
function learnFromMessage(message, profile) {
  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  // Update vocabulary
  words.forEach(word => {
    if (!profile.vocabulary.includes(word)) {
      profile.vocabulary.push(word);
    }
    // Track word frequency
    profile.stats.mostUsedWords[word] = (profile.stats.mostUsedWords[word] || 0) + 1;
  });
  
  // Update style patterns
  const messageLength = message.length;
  profile.stats.totalMessages++;
  profile.stats.averageMessageLength = 
    (profile.stats.averageMessageLength * (profile.stats.totalMessages - 1) + messageLength) / 
    profile.stats.totalMessages;
  
  // Detect sentence length preference
  if (messageLength < 30) {
    profile.patterns.sentenceLength = 'short';
  } else if (messageLength > 100) {
    profile.patterns.sentenceLength = 'long';
  }
  
  // Detect slang level
  const slangWords = ['kar', 'pidh', 'lep', 'fut', 'topet', 'kurv', 'qim', 'shkatht', 'pidhsome', 'llafazan'];
  const hasSlang = slangWords.some(word => message.toLowerCase().includes(word));
  if (hasSlang) {
    profile.style.slangLevel = 'high';
  }
  
  // Detect explicit level
  const explicitWords = ['kar', 'pidh', 'orgazm', 'sperma', 'squirt', 'ejakuloj', 'vij'];
  const explicitCount = explicitWords.filter(word => message.toLowerCase().includes(word)).length;
  if (explicitCount > 2) {
    profile.style.explicitLevel = 'high';
  } else if (explicitCount > 0) {
    profile.style.explicitLevel = 'medium';
  }
  
  // Detect punctuation style
  const exclamationCount = (message.match(/!/g) || []).length;
  const questionCount = (message.match(/\?/g) || []).length;
  if (exclamationCount > 2 || questionCount > 2) {
    profile.patterns.punctuationStyle = 'excessive';
  } else if (exclamationCount === 0 && questionCount === 0 && message.length > 20) {
    profile.patterns.punctuationStyle = 'minimal';
  }
  
  // Track common phrases (2-4 word combinations)
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = words.slice(i, Math.min(i + 3, words.length)).join(' ');
    if (phrase.length > 5 && phrase.length < 30) {
      if (!profile.patterns.commonPhrases.includes(phrase)) {
        profile.patterns.commonPhrases.push(phrase);
      }
    }
  }
  
  // Keep only top 50 most used words
  const sortedWords = Object.entries(profile.stats.mostUsedWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
  profile.vocabulary = sortedWords;
  
  // Keep only top 20 common phrases
  profile.patterns.commonPhrases = profile.patterns.commonPhrases.slice(0, 20);
  
  saveUserProfile(profile);
  return profile;
}

// Build style context for AI prompt
function buildStyleContext(profile) {
  const context = [];
  
  // Vocabulary
  if (profile.vocabulary.length > 0) {
    const topWords = profile.vocabulary.slice(0, 10).join(', ');
    context.push(`Përdoruesi përdor këto fjalë shpesh: ${topWords}`);
  }
  
  // Style
  context.push(`Stili i përdoruesit: ${profile.style.formality}, slang: ${profile.style.slangLevel}, eksplicite: ${profile.style.explicitLevel}`);
  
  // Patterns
  if (profile.patterns.commonPhrases.length > 0) {
    const phrases = profile.patterns.commonPhrases.slice(0, 5).join(', ');
    context.push(`Fraza të zakonshme: ${phrases}`);
  }
  
  // Preferences
  context.push(`Preferon përgjigje: ${profile.preferences.responseLength}, stil: ${profile.preferences.responseStyle}`);
  
  return context.join('. ') + '.';
}

export { getUserId, getUserProfile, saveUserProfile, learnFromMessage, buildStyleContext };

