import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Check, Zap, Star, Sparkles, Clock, Shield, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4.99,
    period: 'month',
    credits: 200,
    dailyLimit: 30,
    features: ['200 AI credits/month', '30 daily limit', 'Basic features', 'Email support'],
    color: 'from-blue-500 to-cyan-500',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    period: 'month',
    credits: 500,
    dailyLimit: 75,
    features: ['500 AI credits/month', '75 daily limit', 'All features', 'Priority support', 'Screenshot analysis'],
    color: 'from-purple-500 to-pink-500',
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 14.99,
    period: 'month',
    credits: 1000,
    dailyLimit: 150,
    features: ['1000 AI credits/month', '150 daily limit', 'All features', '24/7 VIP support', 'Unlimited screenshots', 'Early access'],
    color: 'from-amber-500 to-orange-500',
    popular: false
  }
];

export default function TrialExpiredModal({ onPurchase, onRestore }) {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState('pro');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (tierId) => {
    setIsProcessing(true);
    setSelectedTier(tierId);
    
    try {
      if (onPurchase) {
        await onPurchase(tierId);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      if (onRestore) {
        await onRestore();
      }
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('trialExpired.title', 'Your Free Trial Has Ended')} ⏰
          </h1>
          <p className="text-slate-400 text-lg">
            {t('trialExpired.subtitle', 'Choose a plan to continue using Biseda.ai')}
          </p>
        </div>

        {/* Tiers */}
        <div className="space-y-4 mb-6">
          {TIERS.map((tier) => (
            <Card
              key={tier.id}
              onClick={() => !isProcessing && setSelectedTier(tier.id)}
              className={`relative p-4 cursor-pointer transition-all duration-300 ${
                selectedTier === tier.id
                  ? `bg-gradient-to-r ${tier.color} border-2 border-white/50 scale-[1.02]`
                  : 'bg-slate-800/80 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    ⭐ {t('subscription.mostPopular', 'MOST POPULAR')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
                    {tier.id === 'starter' && <Zap className="w-6 h-6 text-white" />}
                    {tier.id === 'pro' && <Star className="w-6 h-6 text-white" />}
                    {tier.id === 'elite' && <Crown className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <p className="text-slate-300 text-sm">{tier.credits} {t('subscription.creditsMonth', 'credits/month')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">€{tier.price}</div>
                  <div className="text-slate-400 text-xs">/{t('subscription.month', 'month')}</div>
                </div>
              </div>

              {selectedTier === tier.id && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-2">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-white/90 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Purchase Button */}
        <Button
          onClick={() => handlePurchase(selectedTier)}
          disabled={isProcessing}
          className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('subscription.processing', 'Processing...')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t('subscription.subscribe', 'Subscribe Now')} - €{TIERS.find(t => t.id === selectedTier)?.price}/{t('subscription.month', 'month')}
            </div>
          )}
        </Button>

        {/* Restore Purchases */}
        <button
          onClick={handleRestore}
          disabled={isProcessing}
          className="w-full mt-4 text-center text-slate-400 hover:text-white transition-colors text-sm py-2"
        >
          {t('subscription.restorePurchases', 'Restore Previous Purchases')}
        </button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-xs">
          <Shield className="w-4 h-4" />
          <span>{t('subscription.securePayment', 'Secure payment via Apple Pay')}</span>
        </div>

        {/* Terms */}
        <p className="text-center text-slate-500 text-xs mt-4 pb-4">
          {t('subscription.terms', 'Subscription auto-renews monthly. Cancel anytime in App Store settings.')}
        </p>
      </div>
    </div>
  );
}

