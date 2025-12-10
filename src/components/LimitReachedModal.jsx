import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, Sparkles, Heart, Zap, Crown } from 'lucide-react';

const emojis = ['☕', '💔', '🔥', '💘', '🎯'];

export default function LimitReachedModal({ isOpen, onClose, onUpgrade }) {
  const { t } = useTranslation();
  
  // Pick a random index (memoized so it doesn't change on re-render)
  const randomIndex = useMemo(() => Math.floor(Math.random() * 5), []);
  
  if (!isOpen) return null;

  const titles = t('limitReached.titles', { returnObjects: true });
  const messages = t('limitReached.messages', { returnObjects: true });
  const ctas = t('limitReached.ctas', { returnObjects: true });
  
  const randomMessage = {
    emoji: emojis[randomIndex],
    title: Array.isArray(titles) ? titles[randomIndex] : titles,
    message: Array.isArray(messages) ? messages[randomIndex] : messages,
    cta: Array.isArray(ctas) ? ctas[randomIndex] : ctas
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/50 border-purple-500/50 max-w-md w-full shadow-2xl shadow-purple-500/20">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            {/* Animated emoji */}
            <div className="text-6xl mb-4 animate-bounce">
              {randomMessage.emoji}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              {randomMessage.title}
            </h2>
            
            <p className="text-slate-300 text-base leading-relaxed">
              {randomMessage.message}
            </p>

            {/* Price comparison */}
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl w-full">
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <Coffee className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <p className="text-amber-300 text-xs">{t('limitReached.oneCoffee')}</p>
                  <p className="text-white font-bold">€3-4</p>
                </div>
                <div className="text-2xl">→</div>
                <div className="text-center">
                  <Crown className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-purple-300 text-xs">{t('limitReached.oneMonthAI')}</p>
                  <p className="text-white font-bold">€6.99</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white font-bold h-14 text-lg flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 animate-pulse"
            >
              <Sparkles className="w-5 h-5" />
              {randomMessage.cta}
            </Button>
            
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors"
            >
              {t('limitReached.noThanks')}
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-center text-slate-400 text-xs flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              {t('limitReached.socialProof')}
            </p>
          </div>
        </div>
      </Card>
    </div>,
    document.body
  );
}
