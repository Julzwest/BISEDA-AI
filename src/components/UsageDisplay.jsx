import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Sparkles, Heart, Infinity } from 'lucide-react';

// Everything is FREE now - no limits!
export default function UsageDisplay() {
  const { t } = useTranslation();

  return (
    <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 backdrop-blur-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              100% Free Access 🎉
            </h3>
            <p className="text-emerald-300 text-sm">All features unlocked!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
          <Infinity className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">Unlimited</span>
        </div>
      </div>
      
      <div className="mt-3 p-3 bg-white/5 rounded-xl">
        <div className="flex items-center justify-center gap-2 text-slate-300 text-sm">
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
          <span>Enjoy all features for free - no limits, no ads!</span>
        </div>
      </div>
    </Card>
  );
}
