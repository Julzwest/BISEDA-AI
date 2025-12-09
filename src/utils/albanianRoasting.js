// Albanian Roasting & Banter System
// Friendly teasing (Albanian style), playful roasting, banter that builds connection

export const albanianRoasting = {
  // Friendly Teasing (Albanian Style)
  friendlyTeasing: [
    {
      context: 'Generic message',
      roast: "Haha, plak! Mesazhi yt është si 'ç'kemi' - e mërzitshme! Le ta bëjmë më cool! 😂",
      vibe: 'Playful, helpful, cool'
    },
    {
      context: 'Boring message',
      roast: "Vajzë, mesazhi yt është si Tinder në Shqipëri - nuk funksionon! Le ta bëjmë më fire! 🔥",
      vibe: 'Funny, encouraging, cool'
    },
    {
      context: 'Too formal',
      roast: "Plak, flet si në zyrë! Le ta bëjmë më natyrshëm dhe cool! 😂",
      vibe: 'Playful, helpful, cool'
    },
    {
      context: 'Too casual',
      roast: "Vajzë, mesazhi yt është shumë casual! Le ta bëjmë më interesant! 🔥",
      vibe: 'Playful, helpful, cool'
    },
    {
      context: 'No personality',
      roast: "Haha, mesazhi yt është si robot! Le ta bëjmë më human dhe cool! 😂",
      vibe: 'Funny, encouraging, cool'
    },
  ],

  // Playful Roasting Guidelines
  playfulRoasting: [
    {
      level: 'light',
      examples: [
        "Haha, plak! Le ta bëjmë më cool! 😂",
        "Vajzë, mesazhi yt është fire, por le ta bëjmë më fire! 🔥",
        "Plak, e di që duket si këshillë e vjetër, por trust me, funksionon!",
      ],
      vibe: 'Playful, encouraging, cool'
    },
    {
      level: 'medium',
      examples: [
        "Haha, mesazhi yt është si 'ç'kemi' - e mërzitshme! Le ta bëjmë më cool! 😂",
        "Vajzë, mesazhi yt është si Tinder në Shqipëri - nuk funksionon! Le ta bëjmë më fire! 🔥",
        "Plak, flet si në zyrë! Le ta bëjmë më natyrshëm dhe cool! 😂",
      ],
      vibe: 'Playful, funny, cool'
    },
    {
      level: 'heavy',
      examples: [
        "Haha, mesazhi yt është si robot! Le ta bëjmë më human dhe cool! 😂",
        "Vajzë, mesazhi yt është shumë generic! Le ta bëjmë më unik dhe fire! 🔥",
        "Plak, mesazhi yt është si ato mesazhe që të gjithë djemtë dërgojnë! Le ta bëjmë më cool! 😂",
      ],
      vibe: 'Playful, funny, encouraging'
    },
  ],

  // Banter That Builds Connection
  connectionBanter: [
    {
      type: 'encouraging',
      examples: [
        "Plak, e di që duket si këshillë e vjetër, por trust me, funksionon!",
        "Vajzë, real talk, kjo do të funksionojë!",
        "Deadass, mesazhi yt është fire!",
        "No cap, ti je cool, plak!",
      ],
      vibe: 'Encouraging, supportive, cool'
    },
    {
      type: 'playful',
      examples: [
        "Haha, plak! Le ta bëjmë më cool! 😂",
        "Vajzë, mesazhi yt është fire, por le ta bëjmë më fire! 🔥",
        "Plak, e di që duket si këshillë e vjetër, por trust me, funksionon!",
      ],
      vibe: 'Playful, funny, cool'
    },
    {
      type: 'confident',
      examples: [
        "Real talk: Kjo do të funksionojë!",
        "Deadass: Mesazhi yt është fire!",
        "No cap: Ti je cool, plak!",
      ],
      vibe: 'Confident, supportive, cool'
    },
  ],

  // When to Use Roasting
  roastingGuidelines: {
    appropriate: [
      'User is being too generic',
      'User is being too formal',
      'User is being too casual',
      'User needs encouragement',
      'User is open to feedback',
      'Conversation is light and playful',
    ],
    inappropriate: [
      'User is frustrated',
      'User is sad',
      'User is angry',
      'User is vulnerable',
      'Conversation is serious',
      'User just got rejected',
    ],
  },
};

// Get appropriate roast based on context
export function getRoast(context, userEmotion = 'neutral') {
  // Don't roast if user is in negative emotional state
  if (['frustrated', 'sad', 'angry', 'vulnerable'].includes(userEmotion)) {
    return null;
  }

  // Get appropriate roast based on context
  if (context.includes('generic') || context.includes('boring')) {
    const roasts = albanianRoasting.friendlyTeasing.filter(r => 
      r.context === 'Generic message' || r.context === 'Boring message'
    );
    return roasts[Math.floor(Math.random() * roasts.length)];
  }

  if (context.includes('formal')) {
    const roasts = albanianRoasting.friendlyTeasing.filter(r => 
      r.context === 'Too formal'
    );
    return roasts[Math.floor(Math.random() * roasts.length)];
  }

  // Default playful roast
  const roasts = albanianRoasting.playfulRoasting[0].examples;
  return { roast: roasts[Math.floor(Math.random() * roasts.length)], vibe: 'Playful, encouraging, cool' };
}

export default albanianRoasting;

