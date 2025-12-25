import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Heart, Infinity } from 'lucide-react';

// Everything is FREE now - no credits needed!
export default function CreditsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <Card className="bg-gradient-to-br from-slate-900 to-emerald-900/30 border-emerald-500/40 max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            It's All Free!
          </h2>
          
          <p className="text-emerald-300 mb-6">
            No credits needed - everything is unlimited!
          </p>

          <div className="flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-6">
            <Infinity className="w-6 h-6 text-emerald-400" />
            <span className="text-white font-semibold">Unlimited Access</span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold h-12"
          >
            ✨ Awesome!
          </Button>

          <p className="text-slate-400 text-xs mt-4 flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
            Made with love for you
          </p>
        </div>
      </Card>
    </div>
  );
}
