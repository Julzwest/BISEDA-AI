import React, { useState } from 'react';
import { UserX, X, Sparkles } from 'lucide-react';
import { clearGuestSession } from '@/pages/AuthComponent';

export default function GuestBanner({ onSignUp }) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not a guest (check is done in Layout now)
  // 🔒 FIX: If user has a real userId, they're logged in - not a guest
  const userId = localStorage.getItem('userId');
  const hasRealAccount = userId && userId.length > 10;
  const isGuest = localStorage.getItem('isGuest') === 'true' && !hasRealAccount;
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

  // Inline guest banner for header
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/50">
      {/* Guest indicator */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
          <UserX className="w-3 h-3 text-cyan-400" />
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] text-slate-400 leading-tight">Mënyra</p>
          <p className="text-xs font-bold text-white leading-tight">{visitorLabel}</p>
        </div>
      </div>

      {/* Sign up button */}
      <button
        onClick={() => {
          clearGuestSession();
          if (onSignUp) onSignUp();
        }}
        className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
      >
        <Sparkles className="w-3 h-3" />
        Regjistrohu
      </button>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 text-slate-500 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
