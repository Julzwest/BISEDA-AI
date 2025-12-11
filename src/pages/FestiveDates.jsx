import React, { useState } from 'react';
import { Calendar, Sparkles, Flag, Heart, Star, Gift, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getCountryByCode } from '@/config/countries';

export default function FestiveDates() {
  // Get user's country from localStorage
  const userCountry = localStorage.getItem('userCountry') || 'AL';
  const currentCountry = getCountryByCode(userCountry);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = [
    'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
    'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
  ];

  // Country-specific festive dates
  const festiveDatesByCountry = {
    // Albania
    AL: {
      0: [ // January
        { date: 1, name: 'Dita e Vitit të Ri', type: 'national', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
        { date: 11, name: 'Dita e Republikës', type: 'national', icon: Flag, color: 'from-red-500 to-orange-500' }
      ],
      1: [ // February
        { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      2: [ // March
        { date: 7, name: 'Dita e Mësuesit', type: 'national', icon: Star, color: 'from-yellow-500 to-amber-500' },
        { date: 14, name: 'Dita e Verës', type: 'national', icon: Sparkles, color: 'from-green-500 to-emerald-500' },
        { date: 22, name: 'Dita e Nevruzit', type: 'cultural', icon: Sparkles, color: 'from-purple-500 to-pink-500' }
      ],
      4: [ // May
        { date: 1, name: 'Dita Ndërkombëtare e Punëtorëve', type: 'international', icon: Star, color: 'from-red-500 to-orange-500' },
        { date: 5, name: 'Dita e Nënës', type: 'national', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      5: [ // June
        { date: 1, name: 'Dita Ndërkombëtare e Fëmijëve', type: 'international', icon: Gift, color: 'from-yellow-500 to-orange-500' }
      ],
      10: [ // November
        { date: 28, name: 'Dita e Flamurit', type: 'national', icon: Flag, color: 'from-red-500 to-orange-500' },
        { date: 29, name: 'Dita e Çlirimit', type: 'national', icon: Flag, color: 'from-red-500 to-orange-500' }
      ],
      11: [ // December
        { date: 25, name: 'Krishtlindjet', type: 'international', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ]
    },
    // Kosovo
    XK: {
      0: [
        { date: 1, name: 'Dita e Vitit të Ri', type: 'national', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ],
      1: [
        { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' },
        { date: 17, name: 'Dita e Pavarësisë së Kosovës', type: 'national', icon: Flag, color: 'from-blue-500 to-yellow-500' }
      ],
      2: [
        { date: 7, name: 'Dita e Mësuesit', type: 'national', icon: Star, color: 'from-yellow-500 to-amber-500' }
      ],
      5: [
        { date: 12, name: 'Dita e Pajtimit', type: 'national', icon: Heart, color: 'from-purple-500 to-pink-500' }
      ],
      11: [
        { date: 25, name: 'Krishtlindjet', type: 'international', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ]
    },
    // United Kingdom
    GB: {
      0: [
        { date: 1, name: 'Dita e Vitit të Ri', type: 'national', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ],
      1: [
        { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      2: [
        { date: 17, name: "Dita e Shën Patrikut", type: 'cultural', icon: Sparkles, color: 'from-green-500 to-emerald-500' }
      ],
      3: [
        { date: 23, name: "Dita e Shën Gjergjit", type: 'national', icon: Flag, color: 'from-red-500 to-white-500' }
      ],
      4: [
        { date: 12, name: 'Dita e Nënës (UK)', type: 'national', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      5: [
        { date: 16, name: 'Dita e Babait (UK)', type: 'national', icon: Star, color: 'from-blue-500 to-cyan-500' }
      ],
      10: [
        { date: 5, name: 'Nata e Fishekzjarreve (Guy Fawkes)', type: 'cultural', icon: Sparkles, color: 'from-orange-500 to-red-500' },
        { date: 11, name: 'Dita e Kujtimit', type: 'national', icon: Flag, color: 'from-red-500 to-orange-500' }
      ],
      11: [
        { date: 25, name: 'Krishtlindjet', type: 'national', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 26, name: 'Boxing Day', type: 'national', icon: Gift, color: 'from-red-500 to-green-500' },
        { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ]
    },
    // Germany
    DE: {
      0: [
        { date: 1, name: 'Dita e Vitit të Ri', type: 'national', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ],
      1: [
        { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      4: [
        { date: 1, name: 'Dita e Punëtorëve', type: 'national', icon: Star, color: 'from-red-500 to-orange-500' },
        { date: 14, name: 'Dita e Nënës (DE)', type: 'national', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      9: [
        { date: 3, name: 'Dita e Unitetit Gjerman', type: 'national', icon: Flag, color: 'from-black-500 to-yellow-500' },
        { date: 31, name: 'Halloween', type: 'cultural', icon: Sparkles, color: 'from-orange-500 to-purple-500' }
      ],
      11: [
        { date: 6, name: 'Shën Nikolla', type: 'cultural', icon: Gift, color: 'from-red-500 to-green-500' },
        { date: 24, name: 'Krishtlindja (Nata e Shenjtë)', type: 'national', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 25, name: 'Krishtlindjet', type: 'national', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ]
    },
    // USA
    US: {
      0: [
        { date: 1, name: 'Dita e Vitit të Ri', type: 'national', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
        { date: 20, name: 'Dita e Martin Luther King Jr.', type: 'national', icon: Star, color: 'from-purple-500 to-blue-500' }
      ],
      1: [
        { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      2: [
        { date: 17, name: "Dita e Shën Patrikut", type: 'cultural', icon: Sparkles, color: 'from-green-500 to-emerald-500' }
      ],
      4: [
        { date: 12, name: 'Dita e Nënës (US)', type: 'national', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      5: [
        { date: 16, name: 'Dita e Babait (US)', type: 'national', icon: Star, color: 'from-blue-500 to-cyan-500' }
      ],
      6: [
        { date: 4, name: 'Dita e Pavarësisë', type: 'national', icon: Flag, color: 'from-red-500 to-blue-500' }
      ],
      9: [
        { date: 31, name: 'Halloween', type: 'cultural', icon: Sparkles, color: 'from-orange-500 to-purple-500' }
      ],
      10: [
        { date: 28, name: 'Thanksgiving', type: 'national', icon: Gift, color: 'from-orange-500 to-amber-500' }
      ],
      11: [
        { date: 25, name: 'Krishtlindjet', type: 'national', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ]
    },
    // Italy
    IT: {
      0: [
        { date: 1, name: 'Dita e Vitit të Ri', type: 'national', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
        { date: 6, name: 'Epifania (La Befana)', type: 'national', icon: Gift, color: 'from-purple-500 to-pink-500' }
      ],
      1: [
        { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      3: [
        { date: 25, name: 'Dita e Çlirimit', type: 'national', icon: Flag, color: 'from-green-500 to-red-500' }
      ],
      4: [
        { date: 1, name: 'Dita e Punëtorëve', type: 'national', icon: Star, color: 'from-red-500 to-orange-500' },
        { date: 12, name: 'Festa della Mamma', type: 'national', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      5: [
        { date: 2, name: 'Festa della Repubblica', type: 'national', icon: Flag, color: 'from-green-500 to-red-500' }
      ],
      7: [
        { date: 15, name: 'Ferragosto', type: 'national', icon: Sparkles, color: 'from-yellow-500 to-orange-500' }
      ],
      11: [
        { date: 8, name: 'Immacolata Concezione', type: 'national', icon: Star, color: 'from-blue-500 to-white-500' },
        { date: 25, name: 'Krishtlindjet', type: 'national', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ]
    },
    // Switzerland
    CH: {
      0: [
        { date: 1, name: 'Dita e Vitit të Ri', type: 'national', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ],
      1: [
        { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      7: [
        { date: 1, name: 'Dita Kombëtare e Zvicrës', type: 'national', icon: Flag, color: 'from-red-500 to-white-500' }
      ],
      11: [
        { date: 6, name: 'Shën Nikolla', type: 'cultural', icon: Gift, color: 'from-red-500 to-green-500' },
        { date: 25, name: 'Krishtlindjet', type: 'national', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ]
    },
    // Greece
    GR: {
      0: [
        { date: 1, name: 'Dita e Vitit të Ri', type: 'national', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
        { date: 6, name: 'Epifania / Theofania', type: 'national', icon: Star, color: 'from-blue-500 to-white-500' }
      ],
      1: [
        { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' }
      ],
      2: [
        { date: 25, name: 'Dita e Pavarësisë së Greqisë', type: 'national', icon: Flag, color: 'from-blue-500 to-white-500' }
      ],
      4: [
        { date: 1, name: 'Dita e Punëtorëve', type: 'national', icon: Star, color: 'from-red-500 to-orange-500' }
      ],
      9: [
        { date: 28, name: 'Dita Oxi (Jo)', type: 'national', icon: Flag, color: 'from-blue-500 to-white-500' }
      ],
      11: [
        { date: 25, name: 'Krishtlindjet', type: 'national', icon: Gift, color: 'from-green-500 to-emerald-500' },
        { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
      ]
    }
  };

  // Default/common dates for countries not specifically defined
  const defaultFestiveDates = {
    0: [
      { date: 1, name: 'Dita e Vitit të Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
    ],
    1: [
      { date: 14, name: 'Dita e Dashurisë', type: 'international', icon: Heart, color: 'from-pink-500 to-rose-500' }
    ],
    4: [
      { date: 1, name: 'Dita Ndërkombëtare e Punëtorëve', type: 'international', icon: Star, color: 'from-red-500 to-orange-500' }
    ],
    11: [
      { date: 25, name: 'Krishtlindjet', type: 'international', icon: Gift, color: 'from-green-500 to-emerald-500' },
      { date: 31, name: 'Viti i Ri', type: 'international', icon: Sparkles, color: 'from-blue-500 to-cyan-500' }
    ]
  };

  // Get festive dates for current country
  const getFestiveDates = () => {
    return festiveDatesByCountry[userCountry] || defaultFestiveDates;
  };

  const getCurrentMonthDates = () => {
    const dates = getFestiveDates();
    return dates[selectedMonth] || [];
  };

  const getDateTypeLabel = (type) => {
    const labels = {
      national: 'Kombëtare',
      international: 'Ndërkombëtare',
      cultural: 'Kulturore'
    };
    return labels[type] || type;
  };

  const getDateTypeColor = (type) => {
    const colors = {
      national: 'from-red-500/20 to-orange-500/20 border-red-500/50',
      international: 'from-blue-500/20 to-cyan-500/20 border-blue-500/50',
      cultural: 'from-purple-500/20 to-pink-500/20 border-purple-500/50'
    };
    return colors[type] || 'from-slate-500/20 to-slate-600/20 border-slate-500/50';
  };

  return (
    <div className="px-6 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/50 animate-pulse">
              <Calendar className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-slate-900" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent mb-2">
          Datat Festive {currentCountry?.flag}
        </h1>
        <p className="text-slate-400 text-sm">Gjej datat e rëndësishme për takime speciale</p>
      </div>

      {/* Current Country Display */}
      <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-orange-400" />
          <span className="text-orange-300 text-sm font-medium">
            Vendndodhja: {currentCountry?.flag} {currentCountry?.name}
          </span>
          <a href="#/profile" className="ml-auto text-xs text-orange-400 hover:text-orange-300 underline">
            Ndrysho
          </a>
        </div>
      </div>

      {/* Month Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Zgjidh Muajin</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {months.map((month, index) => (
            <button
              key={index}
              onClick={() => setSelectedMonth(index)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedMonth === index
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Festive Dates List */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" />
            Data Festive - {months[selectedMonth]}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        </div>

        {getCurrentMonthDates().length > 0 ? (
          <div className="space-y-4">
            {getCurrentMonthDates().map((festive, index) => {
              const Icon = festive.icon;
              return (
                <Card
                  key={index}
                  className={`bg-gradient-to-br ${getDateTypeColor(festive.type)} border-2 backdrop-blur-sm hover:scale-[1.02] transition-all`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${festive.color} flex items-center justify-center shrink-0 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{festive.name}</h3>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                            festive.type === 'national' 
                              ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                              : festive.type === 'international'
                              ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                              : 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                          }`}>
                            {getDateTypeLabel(festive.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 text-sm">
                            {festive.date} {months[selectedMonth]} {new Date().getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-slate-400">Nuk ka data festive për këtë muaj</p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-purple-500/30 backdrop-blur-sm">
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Këshilla për Takime në Datat Festive
          </h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• Datat kombëtare janë perfekte për takime me temë patriotike</li>
            <li>• Festimet kulturore ofrojnë mundësi për eksperienca unike</li>
            <li>• Dita e Dashurisë është perfekte për takime romantike</li>
            <li>• Planifikoni paraprakisht për restorante dhe aktivitete</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
