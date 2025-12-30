// Credits Management System
import { CREDIT_COSTS, getTier, getTrialTimeRemaining } from '../config/subscriptions';

const CREDITS_STORAGE_KEY = 'user_credits';
const SUBSCRIPTION_STORAGE_KEY = 'user_subscription';
const TRIAL_START_KEY = 'trial_start_date';

// Initialize user subscription data
export const initializeUserSubscription = () => {
  const existing = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  if (!existing) {
    // New user - start free trial
    const subscription = {
      tier: 'free_trial',
      credits: 999999, // Unlimited during trial
      creditsUsedToday: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      trialStartDate: new Date().toISOString(),
    };
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
    localStorage.setItem(TRIAL_START_KEY, new Date().toISOString());
    return subscription;
  }
  return JSON.parse(existing);
};

// Get current subscription
export const getSubscription = () => {
  const data = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  if (!data) return initializeUserSubscription();
  
  const subscription = JSON.parse(data);
  
  // Check if trial expired
  if (subscription.tier === 'free_trial') {
    const trialStart = localStorage.getItem(TRIAL_START_KEY);
    const remaining = getTrialTimeRemaining(trialStart);
    if (remaining?.expired) {
      // Trial expired - downgrade to no access
      subscription.tier = 'expired';
      subscription.credits = 0;
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
    }
  }
  
  // Reset credits if new day (for monthly subscribers)
  const today = new Date().toISOString().split('T')[0];
  if (subscription.lastResetDate !== today && subscription.tier !== 'free_trial') {
    // Don't reset monthly credits daily - they're monthly totals
    subscription.creditsUsedToday = 0;
    subscription.lastResetDate = today;
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
  }
  
  return subscription;
};

// Get remaining credits
export const getCredits = () => {
  const subscription = getSubscription();
  return subscription.credits;
};

// Check if user can perform action
export const canPerformAction = (action) => {
  const subscription = getSubscription();
  
  // Trial expired
  if (subscription.tier === 'expired') {
    return { allowed: false, reason: 'trial_expired' };
  }
  
  // Free trial - always allowed
  if (subscription.tier === 'free_trial') {
    return { allowed: true, reason: 'trial' };
  }
  
  // Check credits
  const cost = CREDIT_COSTS[action] || 1;
  if (subscription.credits < cost) {
    return { allowed: false, reason: 'no_credits' };
  }
  
  return { allowed: true, reason: 'has_credits' };
};

// Use credits for action
export const useCredits = (action) => {
  const subscription = getSubscription();
  
  // Free trial doesn't consume credits
  if (subscription.tier === 'free_trial') {
    return { success: true, remaining: 999999 };
  }
  
  const cost = CREDIT_COSTS[action] || 1;
  
  if (subscription.credits < cost) {
    return { success: false, remaining: subscription.credits };
  }
  
  subscription.credits -= cost;
  subscription.creditsUsedToday += cost;
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
  
  return { success: true, remaining: subscription.credits };
};

// Upgrade subscription (called after successful Apple purchase)
export const upgradeSubscription = (tierName, credits) => {
  const tier = getTier(tierName);
  const subscription = {
    tier: tierName,
    credits: credits || tier.credits,
    creditsUsedToday: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    purchaseDate: new Date().toISOString(),
    nextRenewal: getNextMonthDate(),
  };
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
  localStorage.setItem('userSubscriptionTier', tierName);
  return subscription;
};

// Cancel subscription
export const cancelSubscription = () => {
  const subscription = getSubscription();
  subscription.cancelledAt = new Date().toISOString();
  subscription.willExpireAt = subscription.nextRenewal;
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
  return subscription;
};

// Get next month date
const getNextMonthDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
};

// Get trial status
export const getTrialStatus = () => {
  const trialStart = localStorage.getItem(TRIAL_START_KEY);
  if (!trialStart) return null;
  
  return getTrialTimeRemaining(trialStart);
};

// Format credits display
export const formatCredits = (credits) => {
  if (credits >= 999999) return '∞';
  if (credits >= 1000) return `${(credits / 1000).toFixed(1)}K`;
  return credits.toString();
};

// Get usage percentage
export const getUsagePercentage = (tier, creditsRemaining) => {
  const tierData = getTier(tier);
  if (!tierData || tier === 'free_trial') return 0;
  
  const totalCredits = tierData.credits;
  const used = totalCredits - creditsRemaining;
  return Math.round((used / totalCredits) * 100);
};

export default {
  initializeUserSubscription,
  getSubscription,
  getCredits,
  canPerformAction,
  useCredits,
  upgradeSubscription,
  cancelSubscription,
  getTrialStatus,
  formatCredits,
  getUsagePercentage,
};

