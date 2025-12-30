// Subscription Modal - Shows tier options for upgrade
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, Crown, Zap, Star, Sparkles, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_TIERS, getPaidTiers } from '@/config/subscriptions';
import { purchaseSubscription, restorePurchases, isIOSDevice } from '@/utils/applePurchases';
import { getSubscription, getTrialStatus } from '@/utils/credits';

export default function SubscriptionModal({ isOpen, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [selectedTier, setSelectedTier] = useState('plus');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  
  const paidTiers = getPaidTiers();
  const subscription = getSubscription();
  const trialStatus = getTrialStatus();
  const isAlbanian = i18n.language === 'sq';

  // Scroll to top when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setLoading(true);
    setError('');

    try {
      const tier = SUBSCRIPTION_TIERS[selectedTier];
      const result = await purchaseSubscription(tier.appleProductId);

      if (result.success) {
        onSuccess?.(result);
        onClose();
      } else {
        setError(result.error || t('subscription.purchaseFailed', 'Purchase failed. Please try again.'));
      }
    } catch (err) {
      setError(err.message || t('subscription.purchaseFailed', 'Purchase failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError('');

    try {
      const result = await restorePurchases();

      if (result.success && result.restored) {
        onSuccess?.(result);
        onClose();
      } else if (result.success && !result.restored) {
        setError(t('subscription.noSubscriptionsFound', 'No active subscriptions found.'));
      } else {
        setError(result.error || t('subscription.restoreFailed', 'Restore failed. Please try again.'));
      }
    } catch (err) {
      setError(err.message || t('subscription.restoreFailed', 'Restore failed. Please try again.'));
    } finally {
      setRestoring(false);
    }
  };

  const getTierIcon = (tierId) => {
    switch (tierId) {
      case 'lite': return Star;
      case 'plus': return Zap;
      case 'vip': return Crown;
      default: return Star;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card ref={modalRef} className="bg-slate-900 border-purple-500/30 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/20 max-w-lg w-full max-h-[95vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-700/50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('subscription.upgradeTitle', 'Upgrade Your Experience')}
            </h2>
            <p className="text-slate-400 text-sm">
              {t('subscription.upgradeSubtitle', 'Choose the plan that works for you')}
            </p>
          </div>

          {/* Trial Warning */}
          {trialStatus && !trialStatus.expired && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm text-center">
                ⏰ {t('subscription.trialEnding', 'Trial ends in')} {trialStatus.hours}h {trialStatus.minutes}m
              </p>
            </div>
          )}
        </div>

        {/* Tier Options */}
        <div className="p-6 space-y-3">
          {paidTiers.map((tier) => {
            const TierIcon = getTierIcon(tier.id);
            const isSelected = selectedTier === tier.id;
            const isPopular = tier.popular;

            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left relative ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full">
                    <span className="text-xs font-bold text-white">
                      {t('subscription.mostPopular', 'MOST POPULAR')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.badge.color}`}>
                      <span className="text-2xl">{tier.badge.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                      <p className="text-slate-400 text-sm">
                        {tier.credits.toLocaleString()} {t('subscription.creditsMonth', 'credits/month')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {isAlbanian ? tier.priceDisplayAlbanian : tier.priceDisplay}
                    </div>
                    {!isAlbanian && (
                      <div className="text-xs text-slate-500">/month</div>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-600'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Features List */}
        <div className="px-6 pb-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              {t('subscription.allPlansInclude', 'All plans include:')}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                t('subscription.feature1', 'AI Chat Coach'),
                t('subscription.feature2', 'Screenshot Analysis'),
                t('subscription.feature3', 'Date Rehearsals'),
                t('subscription.feature4', 'Date Ideas'),
                t('subscription.feature5', 'Gift Suggestions'),
                t('subscription.feature6', 'Explore Places'),
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <div className="p-6 pt-4 border-t border-slate-700/50">
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold h-14 rounded-xl text-lg shadow-lg transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t('subscription.processing', 'Processing...')}</span>
              </div>
            ) : (
              <span>
                {t('subscription.subscribeTo', 'Subscribe to')} {SUBSCRIPTION_TIERS[selectedTier].name} - {SUBSCRIPTION_TIERS[selectedTier].priceDisplay}
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-slate-500 mt-3">
            {t('subscription.cancelAnytime', 'Cancel anytime. Billed monthly via Apple.')}
          </p>

          {/* Restore Purchases */}
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="w-full text-center text-sm text-purple-400 hover:text-purple-300 mt-3 transition-colors disabled:opacity-50"
          >
            {restoring ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                {t('subscription.restoring', 'Restoring...')}
              </span>
            ) : (
              t('subscription.restorePurchases', 'Restore Purchases')
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}

