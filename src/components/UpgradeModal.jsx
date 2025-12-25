import React from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check, Sparkles, Heart, PartyPopper, Infinity } from 'lucide-react';

// Everything is FREE now!
export default function UpgradeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const freeFeatures = [
    'Unlimited AI coaching',
    'All dating tools unlocked',
    'Live Wingman Coach',
    'Intimacy Coach access',
    'Body Language Guide',
    'Gift Suggestions',
    'Date Ideas & Events',
    'Mood Check',
    'No ads, ever!',
    'All future updates free'
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <Card className="bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-900 border-emerald-500/50 max-w-md w-full shadow-2xl shadow-emerald-500/20">
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">
              🎉
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              Everything is FREE!
            </h2>
            
            <p className="text-emerald-300 text-lg">
              No subscriptions, no limits, no catch
            </p>
          </div>

          {/* Features */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-1 gap-2">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-white text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unlimited badge */}
          <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl mb-6">
            <Infinity className="w-6 h-6 text-purple-400" />
            <span className="text-white font-semibold">Unlimited Access Forever</span>
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>

          {/* CTA */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold h-14 text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
          >
            <PartyPopper className="w-5 h-5" />
            Awesome, let's go!
          </Button>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-center text-slate-400 text-xs flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              Made with love for you
            </p>
          </div>
        </div>
      </Card>
    </div>,
    document.body
  );
}
