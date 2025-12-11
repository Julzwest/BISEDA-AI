import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check, Zap, Sparkles, ExternalLink } from 'lucide-react';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { Capacitor } from '@capacitor/core';

export default function UpgradeModal({ isOpen, onClose, onSelectPlan }) {
  const { t } = useTranslation();
  
  if (!isOpen) return null;
  
  // Check if running on iOS native app
  const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  const plans = [
    {
      name: 'Pro',
      tier: 'pro',
      price: '€9.99',
      period: 'month',
      priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
      features: [
        '100 messages per day',
        'All AI Coach categories',
        'Unlimited Text Response Helper',
        'Unlimited Photo Feedback',
        'All dating tools unlocked',
        'Priority support'
      ],
      color: 'from-purple-500 to-pink-600',
      popular: true
    },
    {
      name: 'Elite',
      tier: 'elite',
      price: '€19.99',
      period: 'month',
      priceId: import.meta.env.VITE_STRIPE_ELITE_PRICE_ID,
      features: [
        'Unlimited everything',
        'Intimacy Coach access',
        'VIP priority support 24/7',
        'Early access to new features',
        'Custom AI training',
        'Personal success coach'
      ],
      color: 'from-amber-500 to-orange-600',
      popular: false
    }
  ];

  const handleSelectPlan = async (plan) => {
    // For iOS native app, redirect to website for subscription
    if (isNativeIOS) {
      window.open('https://bisedaai.com/#/home', '_blank');
      return;
    }
    
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: localStorage.getItem('userId') || 'anonymous'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to create checkout session:', errorData);
        alert(t('common.error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t('common.error'));
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <Card className="bg-slate-900 border-slate-700 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{t('upgrade.title')}</h2>
              <p className="text-slate-400 text-sm">{t('upgrade.choosePlan')}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`bg-slate-700/50 border-2 ${
                  plan.popular
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-slate-600'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {t('plans.mostPopular')}
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center`}>
                      {plan.popular ? (
                        <Sparkles className="w-6 h-6 text-white" />
                      ) : (
                        <Zap className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{plan.price}</span>
                        <span className="text-slate-400 text-sm">/{t('upgrade.monthly').toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                        : 'bg-slate-600 hover:bg-slate-500'
                    } text-white font-semibold h-11`}
                  >
                    {isNativeIOS ? (
                      <span className="flex items-center gap-2">
                        {t('plans.subscribeWeb')} <ExternalLink className="w-4 h-4" />
                      </span>
                    ) : (
                      `${t('plans.select')} ${plan.name}`
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              {isNativeIOS 
                ? t('plans.webSubscription')
                : t('plans.securePayment')
              }
            </p>
          </div>
        </div>
      </Card>
    </div>,
    document.body
  );
}
