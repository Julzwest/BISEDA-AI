import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Crown, Check, Zap, Star, Sparkles, X, Clock, ChevronRight, RotateCcw
} from 'lucide-react';
import { getBackendUrl } from '@/utils/getBackendUrl';

// Apple IAP Product IDs - for future use when products are set up in App Store Connect
const PRODUCT_IDS = {
  starter: 'com.biseda.starter.monthly',
  pro: 'com.biseda.pro.monthly',
  elite: 'com.biseda.elite.monthly'
};

// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  trial: {
    id: 'trial',
    name: 'Free Trial',
    nameKey: 'subscription.freeTrial',
    price: 0,
    period: 'month',
    credits: 50,
    dailyLimit: 20,
    features: ['50 AI credits', '20 daily limit', '12 hours only'],
    color: 'from-slate-500 to-slate-600',
    icon: Clock,
    order: 0
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    nameKey: 'subscription.starter',
    price: 4.99,
    period: 'month',
    credits: 200,
    dailyLimit: 30,
    features: ['200 credits/mo', '30 daily limit', 'Email support'],
    color: 'from-blue-500 to-cyan-500',
    icon: Zap,
    order: 1
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    nameKey: 'subscription.pro',
    price: 9.99,
    period: 'month',
    credits: 500,
    dailyLimit: 75,
    features: ['500 credits/mo', '75 daily limit', 'All features', 'Priority support'],
    color: 'from-purple-500 to-pink-500',
    icon: Star,
    popular: true,
    order: 2
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    nameKey: 'subscription.elite',
    price: 14.99,
    period: 'month',
    credits: 1000,
    dailyLimit: 150,
    features: ['1000 credits/mo', '150 daily limit', 'VIP support', 'Early access'],
    color: 'from-amber-500 to-orange-500',
    icon: Crown,
    order: 3
  }
};

// Get remaining credits for current user
export function getRemainingCredits() {
  const tier = localStorage.getItem('subscriptionTier') || 'trial';
  const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.trial;
  const creditsUsed = parseInt(localStorage.getItem('creditsUsed') || '0');
  return Math.max(0, tierConfig.credits - creditsUsed);
}

// Get daily remaining credits
export function getDailyRemainingCredits() {
  const tier = localStorage.getItem('subscriptionTier') || 'trial';
  const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.trial;
  
  const today = new Date().toDateString();
  const lastResetDate = localStorage.getItem('creditResetDate');
  
  if (lastResetDate !== today) {
    localStorage.setItem('creditResetDate', today);
    localStorage.setItem('dailyCreditsUsed', '0');
  }
  
  const dailyUsed = parseInt(localStorage.getItem('dailyCreditsUsed') || '0');
  return Math.max(0, tierConfig.dailyLimit - dailyUsed);
}

// Use credits (returns true if successful)
export function useCredits(amount = 1) {
  const monthlyRemaining = getRemainingCredits();
  const dailyRemaining = getDailyRemainingCredits();
  
  if (monthlyRemaining < amount || dailyRemaining < amount) {
    return false;
  }
  
  const creditsUsed = parseInt(localStorage.getItem('creditsUsed') || '0');
  const dailyUsed = parseInt(localStorage.getItem('dailyCreditsUsed') || '0');
  
  localStorage.setItem('creditsUsed', (creditsUsed + amount).toString());
  localStorage.setItem('dailyCreditsUsed', (dailyUsed + amount).toString());
  
  return true;
}

// Check if user can perform action
export function canPerformAction() {
  return getRemainingCredits() > 0 && getDailyRemainingCredits() > 0;
}

export default function SubscriptionManager({ isOpen, onClose, currentTier, onTierChange }) {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const currentTierConfig = SUBSCRIPTION_TIERS[currentTier] || SUBSCRIPTION_TIERS.trial;

  // Restore purchases - opens App Store subscriptions
  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      // Open App Store subscriptions page for restore
      window.location.href = 'itms-apps://apps.apple.com/account/subscriptions';
    } catch (error) {
      console.error('Restore failed:', error);
      alert(t('subscription.restoreFailed', 'Failed to restore purchases. Please try again.'));
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSubscribe = async (tierId) => {
    if (tierId === currentTier) return;
    
    setIsProcessing(true);
    setSelectedTier(tierId);

    try {
      // TODO: Integrate with Apple StoreKit when products are set up in App Store Connect
      // For now, simulate subscription update
      console.log(`💳 Processing subscription to ${tierId}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local storage
      localStorage.setItem('subscriptionTier', tierId);
      localStorage.setItem('subscriptionStartDate', Date.now().toString());
      localStorage.setItem('creditsUsed', '0');
      localStorage.removeItem('trialStartTime');
      localStorage.removeItem('trialExpired');
      
      // Update backend
      const backendUrl = getBackendUrl();
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      await fetch(`${backendUrl}/api/subscription/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, tier: tierId, previousTier: currentTier })
      }).catch(err => console.log('Backend update failed:', err));

      if (onTierChange) onTierChange(tierId);
      
      onClose();
      window.location.reload();
      
    } catch (error) {
      console.error('Subscription failed:', error);
      alert(t('subscription.error', 'Failed to process. Please try again.'));
    } finally {
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };

  if (!isOpen) return null;

  const plans = [
    SUBSCRIPTION_TIERS.starter,
    SUBSCRIPTION_TIERS.pro,
    SUBSCRIPTION_TIERS.elite
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Header */}
        <div className="relative p-6 pb-4 text-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Crown Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/40">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">
            {t('subscription.choosePlan', 'Choose Your Plan')}
          </h2>
          <p className="text-slate-400 text-sm">
            {t('subscription.unlockPower', 'Unlock the full power of Biseda')}
          </p>

          {/* Current Plan Badge */}
          {currentTier && currentTier !== 'trial' && currentTier !== 'free_trial' && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full">
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 text-xs font-semibold">
                {t('subscription.currentlyOn', 'Currently on')} {currentTierConfig.name}
              </span>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="px-4 pb-4 space-y-3">
          {plans.map((plan) => {
            const TierIcon = plan.icon;
            const isCurrentPlan = plan.id === currentTier;
            const isSelected = selectedTier === plan.id;
            const isPopular = plan.popular;
            
            return (
              <button
                key={plan.id}
                onClick={() => !isProcessing && !isCurrentPlan && handleSubscribe(plan.id)}
                disabled={isProcessing || isCurrentPlan}
                className={`relative w-full p-4 rounded-2xl text-left transition-all duration-300 ${
                  isCurrentPlan
                    ? 'bg-green-500/10 border-2 border-green-500/50 cursor-default'
                    : isSelected
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-500 scale-[1.02]'
                      : isPopular
                        ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/50 hover:border-purple-400'
                        : 'bg-slate-800/60 border border-slate-700 hover:border-slate-600'
                } ${isProcessing && !isSelected ? 'opacity-50' : ''}`}
              >
                {/* Popular Badge */}
                {isPopular && !isCurrentPlan && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                      ⭐ {t('subscription.mostPopular', 'MOST POPULAR')}
                    </span>
                  </div>
                )}

                {/* Current Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-2.5 right-4">
                    <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                      ✓ {t('subscription.current', 'CURRENT')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <TierIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {plan.credits} {t('subscription.creditsPerMonth', 'credits/month')}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-white">€{plan.price}</div>
                    <div className="text-slate-500 text-xs">/{t('subscription.mo', 'mo')}</div>
                  </div>
                </div>

                {/* Processing Indicator */}
                {isSelected && isProcessing && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-purple-400">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">{t('subscription.processing', 'Processing...')}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Features Comparison (Compact) */}
        <div className="px-4 pb-4">
          <div className="bg-slate-800/40 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-medium mb-3 text-center">{t('subscription.allPlansInclude', 'ALL PLANS INCLUDE')}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                t('subscription.feature1', 'Screenshot Analysis'),
                t('subscription.feature2', 'Date Rehearsal'),
                t('subscription.feature3', 'Live Wingman'),
                t('subscription.feature4', 'Date Spots Finder')
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="text-white text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Restore Purchases Button */}
        <div className="px-4 pb-2">
          <button
            onClick={handleRestorePurchases}
            disabled={isRestoring}
            className="w-full py-3 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isRestoring ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                {t('subscription.restoring', 'Restoring...')}
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                {t('subscription.restorePurchases', 'Restore Purchases')}
              </>
            )}
          </button>
        </div>

        {/* Cancel/Manage Link */}
        {currentTier && currentTier !== 'trial' && currentTier !== 'free_trial' && (
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                window.location.href = 'itms-apps://apps.apple.com/account/subscriptions';
              }}
              className="w-full py-3 text-slate-400 hover:text-white text-sm font-medium flex items-center justify-center gap-1 transition-colors"
            >
              {t('subscription.manageInAppStore', 'Manage Subscription in App Store')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pb-6 pt-2 border-t border-slate-800/50">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('subscription.securePayment', 'Secure payment via Apple')}</span>
          </div>
          <p className="text-center text-slate-600 text-[10px] mt-2">
            {t('subscription.cancelAnytime', 'Cancel anytime in App Store settings')}
          </p>
        </div>
      </div>
    </div>
  );
}
