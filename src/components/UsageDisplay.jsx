import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Image as ImageIcon } from 'lucide-react';
import CreditsModal from './CreditsModal';
import { getBackendUrl } from '@/utils/getBackendUrl';

export default function UsageDisplay({ onUpgrade, onLimitReached }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const backendUrl = getBackendUrl();

  useEffect(() => {
    fetchUsage();
    // Refresh usage every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/usage`);
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
        
        // Check if limit is reached and notify parent
        if (onLimitReached && data.dailyUsage.remainingMessages === 0 && (!data.credits || data.credits === 0)) {
          onLimitReached(true);
        } else if (onLimitReached) {
          onLimitReached(false);
        }
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) {
    return null;
  }

  const { dailyUsage, tier, credits } = usage;
  const percentageUsed = (dailyUsage.messages / dailyUsage.messagesLimit) * 100;
  const isNearLimit = percentageUsed >= 80;
  const isAtLimit = dailyUsage.messages >= dailyUsage.messagesLimit;
  const hasNoCredits = !credits || credits === 0;
  const isBlocked = isAtLimit && hasNoCredits;

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">
            {tier === 'free_trial' ? 'Provë Falas' : 
             tier === 'free' ? 'Plan Falas' : 
             tier === 'starter' ? 'Plan Starter (€6.99)' : 
             tier === 'pro' ? 'Plan Pro (€12.99)' : 
             tier === 'elite' ? 'Plan Elite (€19.99)' : 
             tier === 'premium' ? 'Plan Elite' : 'Plan Bazë'}
          </h3>
        </div>
        <div className="flex gap-2">
          {credits !== undefined && credits > 0 && (
            <Button
              onClick={() => setShowCreditsModal(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3"
            >
              Bli Kredite
            </Button>
          )}
          {(tier === 'free_trial' || tier === 'free' || tier === 'starter' || tier === 'pro') && (
            <Button
              onClick={onUpgrade}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-xs h-7 px-3"
            >
              {(tier === 'free_trial' || tier === 'free') ? 'Përmirëso' : 'Përmirëso Më Shumë'}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {credits !== undefined && credits > 0 && (
          <div className="mb-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-300">Kredite</span>
              <span className="text-sm font-semibold text-purple-300">{credits}</span>
            </div>
          </div>
        )}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Mesazhe Sot</span>
            <span className={isNearLimit ? 'text-red-400 font-semibold' : ''}>
              {dailyUsage.messages} / {dailyUsage.messagesLimit}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isAtLimit
                  ? 'bg-red-500'
                  : isNearLimit
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentageUsed)}%` }}
            />
          </div>
        </div>

        {dailyUsage.remainingMessages === 0 && (
          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400 text-center">
              Limiti ditor u arrit! {tier === 'free' && 'Përmirëso për të vazhduar bisedën.'}
            </p>
          </div>
        )}

        {isNearLimit && !isAtLimit && (tier === 'free' || tier === 'free_trial') && (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-400 text-center">
              Pothuajse në limitin tënd! Përmirëso për mesazhe të pakufizuara.
            </p>
          </div>
        )}
      </div>
      <CreditsModal isOpen={showCreditsModal} onClose={() => setShowCreditsModal(false)} />
    </Card>
  );
}

