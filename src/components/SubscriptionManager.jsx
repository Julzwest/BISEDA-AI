import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Crown, Check, Zap, Star, Sparkles, X, AlertTriangle, 
  ArrowUp, ArrowDown, Calendar, CreditCard, Shield, Clock,
  ChevronRight, Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBackendUrl } from '@/utils/getBackendUrl';

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
    features: ['50 AI credits total', '20 daily limit', 'Basic features', '24 hours only'],
    color: 'from-slate-500 to-slate-600',
    icon: Clock,
    order: 0
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    nameKey: 'subscription.starter',
    price: 2.99,
    period: 'month',
    credits: 200,
    dailyLimit: 30,
    features: ['200 AI credits/month', '30 daily limit', 'Basic features', 'Email support'],
    color: 'from-blue-500 to-cyan-500',
    icon: Zap,
    order: 1
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    nameKey: 'subscription.pro',
    price: 5.99,
    period: 'month',
    credits: 500,
    dailyLimit: 75,
    features: ['500 AI credits/month', '75 daily limit', 'All features', 'Priority support', 'Screenshot analysis'],
    color: 'from-purple-500 to-pink-500',
    icon: Star,
    popular: true,
    order: 2
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    nameKey: 'subscription.elite',
    price: 9.99,
    period: 'month',
    credits: 1000,
    dailyLimit: 150,
    features: ['1000 AI credits/month', '150 daily limit', 'All features', '24/7 VIP support', 'Unlimited screenshots', 'Early access'],
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
  const [selectedTier, setSelectedTier] = useState(currentTier || 'starter');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'manage'

  const currentTierConfig = SUBSCRIPTION_TIERS[currentTier] || SUBSCRIPTION_TIERS.trial;
  const selectedTierConfig = SUBSCRIPTION_TIERS[selectedTier];

  // Determine if upgrade, downgrade, or same
  const getChangeType = (newTier) => {
    const currentOrder = currentTierConfig.order;
    const newOrder = SUBSCRIPTION_TIERS[newTier].order;
    if (newOrder > currentOrder) return 'upgrade';
    if (newOrder < currentOrder) return 'downgrade';
    return 'same';
  };

  const handleSubscribe = async (tierId) => {
    if (tierId === currentTier) return;
    
    setIsProcessing(true);
    setSelectedTier(tierId);

    try {
      // TODO: Integrate with Apple StoreKit 2 for actual purchase
      // For now, simulate the process
      console.log(`💳 Processing ${getChangeType(tierId)} to ${tierId}...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local storage
      localStorage.setItem('subscriptionTier', tierId);
      localStorage.setItem('subscriptionStartDate', Date.now().toString());
      localStorage.setItem('creditsUsed', '0'); // Reset credits on tier change
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
        body: JSON.stringify({ 
          userId,
          tier: tierId,
          previousTier: currentTier,
          changeType: getChangeType(tierId)
        })
      }).catch(err => console.log('Backend update failed:', err));

      if (onTierChange) {
        onTierChange(tierId);
      }
      
      alert(t('subscription.success', `Successfully ${getChangeType(tierId)}d to ${SUBSCRIPTION_TIERS[tierId].name}!`));
      onClose();
      
    } catch (error) {
      console.error('Subscription change failed:', error);
      alert(t('subscription.error', 'Failed to process subscription. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    
    try {
      // Calculate end date (30 days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      console.log('📅 Subscription cancelled. Access until:', endDate.toLocaleDateString());
      
      // Set cancellation pending
      localStorage.setItem('subscriptionCancelPending', 'true');
      localStorage.setItem('subscriptionEndDate', endDate.getTime().toString());
      
      // Update backend
      const backendUrl = getBackendUrl();
      const token = localStorage.getItem('authToken');
      
      await fetch(`${backendUrl}/api/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          endDate: endDate.getTime(),
          reason: 'user_requested'
        })
      }).catch(err => console.log('Backend cancel failed:', err));

      alert(t('subscription.cancelConfirmed', `Your subscription will end on ${endDate.toLocaleDateString()}. You'll have full access until then.`));
      setShowCancelConfirm(false);
      onClose();
      
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert(t('subscription.cancelError', 'Failed to cancel subscription. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const isPaidTier = currentTier && !['trial', 'free'].includes(currentTier);
  const cancelPending = localStorage.getItem('subscriptionCancelPending') === 'true';
  const subscriptionEndDate = localStorage.getItem('subscriptionEndDate');

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-purple-900/50 to-pink-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('subscription.manageTitle', 'Manage Subscription')}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {t('subscription.manageSubtitle', 'Upgrade, downgrade, or cancel anytime')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Current Plan Status */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTierConfig.color} flex items-center justify-center`}>
                <currentTierConfig.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">{t('subscription.currentPlan', 'Current Plan')}</p>
                <p className="text-white font-bold text-lg">{currentTierConfig.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {currentTierConfig.price === 0 ? t('subscription.free', 'Free') : `€${currentTierConfig.price}`}
              </p>
              {currentTierConfig.price > 0 && (
                <p className="text-slate-400 text-xs">/{t('subscription.month', 'month')}</p>
              )}
            </div>
          </div>
          
          {/* Credits Status */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">{t('subscription.monthlyCredits', 'Monthly Credits')}</p>
              <p className="text-white font-bold">{getRemainingCredits()} / {currentTierConfig.credits}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">{t('subscription.dailyLimit', 'Daily Remaining')}</p>
              <p className="text-white font-bold">{getDailyRemainingCredits()} / {currentTierConfig.dailyLimit}</p>
            </div>
          </div>

          {/* Cancel Pending Warning */}
          {cancelPending && subscriptionEndDate && (
            <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 font-semibold text-sm">
                  {t('subscription.cancelPending', 'Cancellation Pending')}
                </p>
                <p className="text-amber-300/80 text-xs mt-1">
                  {t('subscription.accessUntil', 'You have access until')} {new Date(parseInt(subscriptionEndDate)).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${
              activeTab === 'plans' 
                ? 'text-purple-400 border-b-2 border-purple-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('subscription.changePlan', 'Change Plan')}
          </button>
          {isPaidTier && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${
                activeTab === 'manage' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('subscription.manageTab', 'Manage')}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'plans' && (
            <div className="space-y-3">
              {Object.values(SUBSCRIPTION_TIERS)
                .filter(tier => tier.id !== 'trial')
                .map((tier) => {
                  const changeType = getChangeType(tier.id);
                  const isCurrentTier = tier.id === currentTier;
                  const TierIcon = tier.icon;
                  
                  return (
                    <Card
                      key={tier.id}
                      onClick={() => !isProcessing && !isCurrentTier && setSelectedTier(tier.id)}
                      className={`relative p-4 cursor-pointer transition-all duration-300 ${
                        isCurrentTier
                          ? 'bg-slate-700/50 border-2 border-green-500/50 cursor-default'
                          : selectedTier === tier.id
                            ? `bg-gradient-to-r ${tier.color} border-2 border-white/50`
                            : 'bg-slate-800/80 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {tier.popular && !isCurrentTier && (
                        <div className="absolute -top-2 right-4">
                          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                            ⭐ {t('subscription.popular', 'POPULAR')}
                          </span>
                        </div>
                      )}
                      
                      {isCurrentTier && (
                        <div className="absolute -top-2 right-4">
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            ✓ {t('subscription.current', 'CURRENT')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                            <TierIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              {tier.name}
                              {!isCurrentTier && changeType === 'upgrade' && (
                                <ArrowUp className="w-4 h-4 text-green-400" />
                              )}
                              {!isCurrentTier && changeType === 'downgrade' && (
                                <ArrowDown className="w-4 h-4 text-amber-400" />
                              )}
                            </h3>
                            <p className="text-slate-300 text-sm">{tier.credits} {t('subscription.creditsMonth', 'credits/month')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">€{tier.price}</div>
                          <div className="text-slate-400 text-xs">/{t('subscription.month', 'month')}</div>
                        </div>
                      </div>

                      {/* Features on select */}
                      {(selectedTier === tier.id || isCurrentTier) && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-1">
                            {tier.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-white/80 text-xs">
                                <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}

              {/* Action Button */}
              {selectedTier !== currentTier && (
                <Button
                  onClick={() => handleSubscribe(selectedTier)}
                  disabled={isProcessing}
                  className={`w-full h-12 mt-4 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 ${
                    getChangeType(selectedTier) === 'upgrade'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  } text-white`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('subscription.processing', 'Processing...')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {getChangeType(selectedTier) === 'upgrade' ? (
                        <>
                          <ArrowUp className="w-5 h-5" />
                          {t('subscription.upgradeTo', 'Upgrade to')} {SUBSCRIPTION_TIERS[selectedTier].name} - €{SUBSCRIPTION_TIERS[selectedTier].price}/{t('subscription.month', 'month')}
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-5 h-5" />
                          {t('subscription.downgradeTo', 'Downgrade to')} {SUBSCRIPTION_TIERS[selectedTier].name} - €{SUBSCRIPTION_TIERS[selectedTier].price}/{t('subscription.month', 'month')}
                        </>
                      )}
                    </div>
                  )}
                </Button>
              )}

              {/* Info about tier changes */}
              <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg mt-4">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-400 text-xs">
                  {t('subscription.changeInfo', 'When you change plans, your current subscription will be cancelled and replaced with the new one. Your new credit allowance starts immediately.')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'manage' && isPaidTier && (
            <div className="space-y-4">
              {/* Billing Info */}
              <Card className="p-4 bg-slate-800/50 border-slate-700">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('subscription.billingInfo', 'Billing Information')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('subscription.nextBilling', 'Next billing date')}</span>
                    <span className="text-white">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('subscription.amount', 'Amount')}</span>
                    <span className="text-white">€{currentTierConfig.price}/{t('subscription.month', 'month')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('subscription.paymentMethod', 'Payment method')}</span>
                    <span className="text-white flex items-center gap-1">
                       Apple Pay
                    </span>
                  </div>
                </div>
              </Card>

              {/* Cancel Subscription */}
              {!cancelPending && (
                <Card className="p-4 bg-red-900/20 border-red-500/30">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    {t('subscription.cancelTitle', 'Cancel Subscription')}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {t('subscription.cancelNotice', 'You will have 30 days of access after cancellation. Your subscription will not renew.')}
                  </p>
                  
                  {!showCancelConfirm ? (
                    <Button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                    >
                      {t('subscription.cancelButton', 'Cancel Subscription')}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-red-400 font-semibold text-sm">
                        {t('subscription.confirmCancel', 'Are you sure? You will lose access to premium features after 30 days.')}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowCancelConfirm(false)}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                          disabled={isProcessing}
                        >
                          {t('common.nevermind', 'Never mind')}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            t('subscription.confirmCancelButton', 'Yes, Cancel')
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Restore Subscription (if cancelled) */}
              {cancelPending && (
                <Card className="p-4 bg-green-900/20 border-green-500/30">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    {t('subscription.restoreTitle', 'Restore Subscription')}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {t('subscription.restoreInfo', 'Changed your mind? You can restore your subscription before it ends.')}
                  </p>
                  <Button
                    onClick={() => {
                      localStorage.removeItem('subscriptionCancelPending');
                      localStorage.removeItem('subscriptionEndDate');
                      alert(t('subscription.restored', 'Your subscription has been restored!'));
                      onClose();
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    {t('subscription.restoreButton', 'Restore My Subscription')}
                  </Button>
                </Card>
              )}

              {/* Apple Pay Info */}
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs pt-4">
                <Shield className="w-4 h-4" />
                <span>{t('subscription.appleManage', 'Manage in App Store Settings → Subscriptions')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-center text-slate-500 text-xs">
            {t('subscription.termsFooter', 'Subscriptions are managed through Apple. Cancel anytime via App Store settings.')}
          </p>
        </div>
      </div>
    </div>
  );
}

