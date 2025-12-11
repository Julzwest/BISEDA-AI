import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, Sparkles, Heart, Zap, Crown } from 'lucide-react';

const cheekyMessages = [
  {
    emoji: '☕',
    title: 'Opa! E ke përfunduar...',
    message: 'Hiq dorë nga NJË kafe këtë muaj dhe merr coach-in tënd personal të dashurisë për 30 ditë. Dashuria > Kafeina 💕',
    cta: 'Po, dua dashuri!'
  },
  {
    emoji: '💔',
    title: 'S\'po më lë të të ndihmoj...',
    message: 'Me çmimin e një ekspresso në ditë, unë punoj 24/7 për ty. Barista yt nuk do të shkruaj mesazhe flirtuese për ty! 😏',
    cta: 'Bindëm!'
  },
  {
    emoji: '🔥',
    title: 'Plot potencial, zero mesazhe!',
    message: 'Më pak se 30 cent në ditë = këshilla të pakufizuara dashurie. Makinë kafeje? €500. Biseda.ai? Priceless. 💎',
    cta: 'Merrem tani!'
  },
  {
    emoji: '💘',
    title: 'Dashuria pret, ti jo!',
    message: 'Një kafe e humbet efektin pas 4 orësh. Këshillat e mia? Ndryshojnë jetën. Skip the latte, get the love! ❤️‍🔥',
    cta: 'Jam gati!'
  },
  {
    emoji: '🎯',
    title: 'Limiti ra, por jo ti!',
    message: 'Harxhon €3-4 për kafe që zgjas 30 minuta. Për €7.99/muaj unë jam në dispozicion GJITHMONË. Do the math! 🧮',
    cta: 'OK, ke të drejtë!'
  }
];

export default function LimitReachedModal({ isOpen, onClose, onUpgrade }) {
  if (!isOpen) return null;

  // Pick a random cheeky message
  const randomMessage = cheekyMessages[Math.floor(Math.random() * cheekyMessages.length)];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-slate-800 via-slate-800 to-purple-900/50 border-purple-500/50 max-w-md w-full shadow-2xl shadow-purple-500/20">
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
                  <p className="text-amber-300 text-xs">1 Kafe</p>
                  <p className="text-white font-bold">€3-4</p>
                </div>
                <div className="text-2xl">→</div>
                <div className="text-center">
                  <Crown className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-purple-300 text-xs">1 Muaj AI</p>
                  <p className="text-white font-bold">€7.99</p>
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
              Jo faleminderit, preferoj të pres ☹️
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-center text-slate-400 text-xs flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              Mbi 1,000 çifte të lumtur falë Biseda.ai
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
