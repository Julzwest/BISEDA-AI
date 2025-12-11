import React, { useState } from 'react';
import { MessageCircle, Copy, Check, Heart, Laugh, Brain, Zap, Sparkles, Star, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STARTERS_DATABASE = {
  funny: [
    "If you were a vegetable, you'd be a cute-cumber 😊",
    "On a scale of 1-10, you're a 9... and I'm the 1 you need 😏",
    "Do you believe in love at first swipe, or should I unmatch and swipe right again?",
    "Are you a parking ticket? Because you've got FINE written all over you",
    "I'm not a photographer, but I can picture us together",
    "If you were a burger at McDonald's, you'd be McGorgeous",
    "Is your name Google? Because you have everything I've been searching for",
    "Do you have a map? I just got lost in your photos",
    "Are you made of copper and tellurium? Because you're Cu-Te!",
    "I must be a snowflake, because I've fallen for you"
  ],
  flirty: [
    "I usually don't shoot my shot, but you're making it hard to resist 😉",
    "Your smile is so beautiful it made me forget my pickup line",
    "I'd say God bless you, but it looks like he already did 😊",
    "Do you have a name, or can I call you mine?",
    "I'm not great at pickup lines, but I think we'd make a great story",
    "If I could rearrange the alphabet, I'd put U and I together",
    "Your profile caught my eye, but your [interest] made me swipe right",
    "I'm usually shy, but something about you makes me want to take a chance",
    "Fair warning: I'm dangerously charming after the second date",
    "Chemistry check: feeling any sparks yet? ✨"
  ],
  casual: [
    "Hey! Your profile made me smile - [specific detail]. What's the story behind that?",
    "So what brings you to [app name]? Besides my irresistible profile, obviously 😄",
    "I see you're into [interest]. Any recommendations for a curious beginner?",
    "Question: cats or dogs? (This is very important)",
    "If you could have dinner with anyone, dead or alive, who would it be?",
    "What's something you're passionate about that most people don't know?",
    "Settle a debate for me: pineapple on pizza - yes or no?",
    "What's the best concert/show you've ever been to?",
    "If you could live anywhere in the world, where would it be?",
    "What's your go-to karaoke song? (Even if you don't do karaoke)"
  ],
  deep: [
    "What's something you believed as a child that changed as you grew up?",
    "If you could give your younger self one piece of advice, what would it be?",
    "What does a perfect day look like to you?",
    "What's a fear you've overcome that you're proud of?",
    "If you could master any skill instantly, what would you choose?",
    "What's the most valuable lesson life has taught you so far?",
    "What makes you feel most alive?",
    "What's your definition of success in life?",
    "If you wrote an autobiography, what would be the title?",
    "What's something you're working on becoming better at?"
  ],
  profile_specific: [
    "I noticed you're into [hobby] - what got you into that?",
    "Your photo at [location] is amazing! What was that trip like?",
    "Fellow [shared interest] fan! What's your take on [relevant topic]?",
    "That picture with [detail] made me laugh - there's definitely a story there, right?",
    "I see you like [interest]. Have you tried [related thing]?",
    "Your profile says [quote/bio]. That's exactly how I feel about [topic]!",
    "Question about your [nth] picture - is that [place/thing]?",
    "We both love [interest]! What's your favorite [specific thing]?",
    "I have to know more about [interesting detail from profile]",
    "Your passion for [interest] really shows. How did you get into it?"
  ]
};

export default function ConversationStarters() {
  const [selectedCategory, setSelectedCategory] = useState('funny');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteStarters');
    return saved ? JSON.parse(saved) : [];
  });

  const categories = [
    { id: 'funny', name: 'Funny & Witty', icon: Laugh, color: 'from-yellow-500 to-orange-500', emoji: '😄' },
    { id: 'flirty', name: 'Flirty & Fun', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '😘' },
    { id: 'casual', name: 'Casual & Cool', icon: MessageCircle, color: 'from-blue-500 to-cyan-500', emoji: '😎' },
    { id: 'deep', name: 'Deep & Thoughtful', icon: Brain, color: 'from-purple-500 to-indigo-500', emoji: '💭' },
    { id: 'profile_specific', name: 'Profile-Specific', icon: Zap, color: 'from-green-500 to-emerald-500', emoji: '🎯' }
  ];

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const starters = STARTERS_DATABASE[selectedCategory] || [];

  const filteredStarters = starters.filter(starter =>
    starter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleFavorite = (starter) => {
    const newFavorites = favorites.includes(starter)
      ? favorites.filter(f => f !== starter)
      : [...favorites, starter];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteStarters', JSON.stringify(newFavorites));
  };

  return (
    <div className="px-4 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Conversation Starters</h1>
        </div>
        <p className="text-slate-400">Ready-to-use opening messages for dating apps</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search starters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-slate-800 border-slate-700 text-white"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span className="text-lg">{category.emoji}</span>
              <span className="text-sm">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && selectedCategory !== 'favorites' && (
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-semibold text-sm">You have {favorites.length} saved favorite(s)</span>
          </div>
        </Card>
      )}

      {/* Starters List */}
      <div className="space-y-3">
        {filteredStarters.map((starter, index) => {
          const isFavorite = favorites.includes(starter);
          return (
            <Card key={index} className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-white flex-1 leading-relaxed">{starter}</p>
                <button
                  onClick={() => toggleFavorite(starter)}
                  className="flex-shrink-0 mt-1"
                >
                  <Star className={`w-5 h-5 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                </button>
              </div>
              <Button
                onClick={() => copyToClipboard(starter, index)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white h-9"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStarters.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No starters found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Pro Tips
        </h3>
        <ul className="space-y-1 text-sm text-slate-300">
          <li>• Personalize these! Add specific details from their profile</li>
          <li>• Match their energy - if they're playful, be playful back</li>
          <li>• Profile-specific starters get the best response rates</li>
          <li>• Save your favorites for quick access later</li>
        </ul>
      </div>
    </div>
  );
}
