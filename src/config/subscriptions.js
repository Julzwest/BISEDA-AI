// Subscription Tiers Configuration
// All prices in EUR, credits per month

export const SUBSCRIPTION_TIERS = {
  free_trial: {
    id: 'free_trial',
    name: 'Free Trial',
    nameAlbanian: 'Provë Falas',
    price: 0,
    priceDisplay: '€0',
    credits: 999999, // Unlimited during trial
    durationDays: 3,
    features: {
      chat: true,
      screenshots: true,
      rehearsals: true,
      explore: true,
      dateIdeas: true,
      giftSuggestions: true,
    },
    badge: { icon: '🎁', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
    appleProductId: null, // Free trial doesn't need product ID
  },
  
  lite: {
    id: 'lite',
    name: 'Lite',
    nameAlbanian: 'Lite',
    price: 4.99,
    priceDisplay: '€4.99',
    priceDisplayAlbanian: '€4.99/muaj',
    credits: 500,
    features: {
      chat: true,
      screenshots: true,
      rehearsals: true,
      explore: true,
      dateIdeas: true,
      giftSuggestions: true,
    },
    badge: { icon: '⭐', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    appleProductId: 'com.biseda.lite.monthly',
  },
  
  plus: {
    id: 'plus',
    name: 'Plus',
    nameAlbanian: 'Plus',
    price: 9.99,
    priceDisplay: '€9.99',
    priceDisplayAlbanian: '€9.99/muaj',
    credits: 1500,
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
    appleProductId: 'com.biseda.plus.monthly',
    popular: true, // Show "Most Popular" badge
  },
  
  vip: {
    id: 'vip',
    name: 'VIP',
    nameAlbanian: 'VIP',
    price: 14.99,
    priceDisplay: '€14.99',
    priceDisplayAlbanian: '€14.99/muaj',
    credits: 3000,
    features: {
      chat: true,
      screenshots: true,
      rehearsals: true,
      explore: true,
      dateIdeas: true,
      giftSuggestions: true,
      prioritySupport: true,
      vipBadge: true,
      earlyAccess: true,
    },
    badge: { icon: '👑', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
    appleProductId: 'com.biseda.vip.monthly',
  },
};

// Credit costs per action
export const CREDIT_COSTS = {
  chat_message: 1,
  screenshot_analysis: 2,
  rehearsal_exchange: 1,
  date_idea: 1,
  gift_suggestion: 1,
  explore_search: 1,
};

// Get tier by ID
export const getTier = (tierId) => {
  return SUBSCRIPTION_TIERS[tierId] || SUBSCRIPTION_TIERS.free_trial;
};

// Get all paid tiers (for upgrade modal)
export const getPaidTiers = () => {
  return ['lite', 'plus', 'vip'].map(id => SUBSCRIPTION_TIERS[id]);
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

// Calculate remaining trial time
export const getTrialTimeRemaining = (trialStartDate) => {
  if (!trialStartDate) return null;
  
  const trialEnd = new Date(trialStartDate);
  trialEnd.setDate(trialEnd.getDate() + 3); // 3 days trial
  
  const now = new Date();
  const remaining = trialEnd - now;
  
  if (remaining <= 0) return { expired: true, hours: 0, days: 0 };
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  return { expired: false, hours: hours % 24, days };
};

export default SUBSCRIPTION_TIERS;

