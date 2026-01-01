// BULLETPROOF Subscription Tiers Configuration
// Guaranteed profit on every user with GPT-4o-mini
// All prices in EUR, credits per month

export const SUBSCRIPTION_TIERS = {
  free_trial: {
    id: 'free_trial',
    name: 'Free Trial',
    nameAlbanian: 'Provë Falas',
    price: 0,
    priceDisplay: '€0',
    priceDisplayAlbanian: '€0',
    credits: 30, // REDUCED: 30 credits max (prevents any possible abuse)
    dailyLimit: 15, // REDUCED: Max 15 messages per day during trial
    durationHours: 12, // 12-hour trial (TESTING: change to 60 seconds below)
    maxCost: 0.0105, // Max €0.01 cost per trial user (30 × €0.00035)
    features: {
      chat: true,
      screenshots: true,
      rehearsals: true,
      explore: true,
      dateIdeas: true,
      giftSuggestions: true,
    },
    badge: { icon: '🎁', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
    appleProductId: null,
  },
  
  // STARTER - €3.99/month
  // Revenue: €3.39 (after 15% Apple) | Max Cost: €0.07 | Profit: €3.32 (98% margin)
  starter: {
    id: 'starter',
    name: 'Starter',
    nameAlbanian: 'Fillues',
    price: 4.99,
    priceDisplay: '€4.99',
    priceDisplayAlbanian: '€4.99/muaj',
    credits: 200,
    dailyLimit: 15, // Prevents heavy usage spikes
    features: {
      chat: true,
      screenshots: true,
      rehearsals: true,
      explore: true,
      dateIdeas: true,
      giftSuggestions: true,
    },
    badge: { icon: '⭐', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    appleProductId: 'com.biseda.starter.monthly',
  },
  
  // PRO - €7.99/month (MOST POPULAR)
  // Revenue: €6.79 (after 15% Apple) | Max Cost: €0.18 | Profit: €6.61 (97% margin)
  pro: {
    id: 'pro',
    name: 'Pro',
    nameAlbanian: 'Pro',
    price: 9.99,
    priceDisplay: '€9.99',
    priceDisplayAlbanian: '€9.99/muaj',
    credits: 500,
    dailyLimit: 30, // Generous daily allowance
    features: {
      chat: true,
      screenshots: true,
      rehearsals: true,
      explore: true,
      dateIdeas: true,
      giftSuggestions: true,
      prioritySupport: true,
    },
    badge: { icon: '🔥', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    appleProductId: 'com.biseda.pro.monthly',
    popular: true, // Show "Most Popular" badge
  },
  
  // ELITE - €12.99/month
  // Revenue: €11.04 (after 15% Apple) | Max Cost: €0.35 | Profit: €10.69 (97% margin)
  elite: {
    id: 'elite',
    name: 'Elite',
    nameAlbanian: 'Elitë',
    price: 14.99,
    priceDisplay: '€14.99',
    priceDisplayAlbanian: '€14.99/muaj',
    credits: 1000,
    dailyLimit: 50, // Power user daily limit
    features: {
      chat: true,
      screenshots: true,
      rehearsals: true,
      explore: true,
      dateIdeas: true,
      giftSuggestions: true,
      prioritySupport: true,
      eliteBadge: true,
      earlyAccess: true,
    },
    badge: { icon: '👑', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
    appleProductId: 'com.biseda.elite.monthly',
  },
};

// Credit costs per action (all cost 1 credit for simplicity)
export const CREDIT_COSTS = {
  chat_message: 1,
  screenshot_analysis: 2, // Screenshots cost more (image processing)
  rehearsal_exchange: 1,
  date_idea: 1,
  gift_suggestion: 1,
  explore_search: 1,
};

// Rate limiting: minimum seconds between requests
export const RATE_LIMIT_SECONDS = 3;

// Get tier by ID
export const getTier = (tierId) => {
  return SUBSCRIPTION_TIERS[tierId] || SUBSCRIPTION_TIERS.free_trial;
};

// Get all paid tiers (for upgrade modal)
export const getPaidTiers = () => {
  return ['starter', 'pro', 'elite'].map(id => SUBSCRIPTION_TIERS[id]);
};

// Check if user has enough credits
export const hasCredits = (userCredits, action) => {
  const cost = CREDIT_COSTS[action] || 1;
  return userCredits >= cost;
};

// Deduct credits for action
export const deductCredits = (userCredits, action) => {
  const cost = CREDIT_COSTS[action] || 1;
  return Math.max(0, userCredits - cost);
};

// Check daily limit
export const checkDailyLimit = (tierId, todayUsage) => {
  const tier = getTier(tierId);
  const dailyLimit = tier.dailyLimit || 50;
  return todayUsage < dailyLimit;
};

// Get remaining daily credits
export const getRemainingDailyCredits = (tierId, todayUsage) => {
  const tier = getTier(tierId);
  const dailyLimit = tier.dailyLimit || 50;
  return Math.max(0, dailyLimit - todayUsage);
};

// Calculate remaining trial time
// 12 hours trial for new users
const TRIAL_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export const getTrialTimeRemaining = (trialStartDate) => {
  if (!trialStartDate) return null;
  
  const startTime = new Date(trialStartDate).getTime();
  const trialEnd = startTime + TRIAL_DURATION_MS;
  
  const now = Date.now();
  const remaining = trialEnd - now;
  
  if (remaining <= 0) return { expired: true, hours: 0, minutes: 0, seconds: 0 };
  
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { expired: false, hours, minutes, seconds };
};

export const TRIAL_DURATION = TRIAL_DURATION_MS;

// PROFIT CALCULATION (for reference):
// GPT-4o-mini cost: ~€0.00035 per message
// 
// Starter (200 credits): €3.39 revenue - €0.07 cost = €3.32 profit (98% margin)
// Pro (500 credits): €6.79 revenue - €0.18 cost = €6.61 profit (97% margin)  
// Elite (1000 credits): €11.04 revenue - €0.35 cost = €10.69 profit (97% margin)
//
// Even if API costs go up 10x, still profitable!

export default SUBSCRIPTION_TIERS;
