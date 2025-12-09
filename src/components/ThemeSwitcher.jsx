import React from 'react';
import { Moon } from 'lucide-react';

// Theme switcher removed - app now uses dark theme only
export default function ThemeSwitcher() {
  // Always show dark theme indicator, no switching
  return (
    <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/60 text-slate-400">
      <Moon className="w-5 h-5" />
    </div>
  );
}
