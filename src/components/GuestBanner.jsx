import React, { useState } from 'react';
import { UserX, X, Sparkles } from 'lucide-react';
import { clearGuestSession } from '@/pages/AuthComponent';

export default function GuestBanner({ onSignUp }) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not a guest (check is done in Layout now)
  const isGuest = localStorage.getItem('isGuest') === 'true';
  if (!isGuest) return null;

  // Get unique visitor number
  const guestNumber = localStorage.getItem('guestNumber') || '';
  const visitorLabel = guestNumber ? `Vizitor #${guestNumber}` : 'Vizitor';

  // Dismissed state - show minimal indicator
  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="px-2 py-1 bg-slate-800/90 border border-slate-700 rounded-full flex items-center gap-1.5 hover:bg-slate-700/90 transition-all"
      >
        <UserX className="w-3 h-3 text-cyan-400" />
        <span className="text-xs font-medium text-white">{visitorLabel}</span>
      </button>
    );
  }

  // Inline guest banner for header - Compact design
  return (
    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-800/80 rounded-lg sm:rounded-xl border border-slate-700/50">
      {/* Guest indicator - Hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
          <UserX className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
        </div>
      </div>

      {/* Sign up button - Compact on mobile */}
      <button
        onClick={() => {
          clearGuestSession();
          if (onSignUp) onSignUp();
        }}
        className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all flex items-center gap-0.5 sm:gap-1"
      >
        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="whitespace-nowrap">Sign Up</span>
      </button>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 text-slate-500 hover:text-white transition-colors"
      >
        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
}
