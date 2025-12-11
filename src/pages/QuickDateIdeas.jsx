import React, { useState } from 'react';
import { Sparkles, RefreshCw, Heart, DollarSign, MapPin, Clock, Share2, Bookmark, BookmarkCheck, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { trackFeatureUse } from '@/utils/analytics';
import { SaveButton } from '@/components/SaveButton';

export default function QuickDateIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    budget: 'medium',
    mood: 'romantic',
    time: 'evening'
  });

  const budgetOptions = [
    { value: 'low', label: 'Budget-Friendly', emoji: '💸', desc: 'Under $30' },
    { value: 'medium', label: 'Moderate', emoji: '💰', desc: '$30-100' },
    { value: 'high', label: 'Splurge', emoji: '💎', desc: '$100+' }
  ];

  const moodOptions = [
    { value: 'romantic', label: 'Romantic', emoji: '💕' },
    { value: 'fun', label: 'Fun & Playful', emoji: '🎉' },
    { value: 'chill', label: 'Chill & Casual', emoji: '😌' },
    { value: 'adventurous', label: 'Adventurous', emoji: '🚀' },
    { value: 'cultural', label: 'Cultural', emoji: '🎭' }
  ];

  const timeOptions = [
    { value: 'morning', label: 'Morning', emoji: '🌅' },
    { value: 'afternoon', label: 'Afternoon', emoji: '☀️' },
    { value: 'evening', label: 'Evening', emoji: '🌆' },
    { value: 'night', label: 'Night', emoji: '🌙' }
  ];

  const generateIdeas = async () => {
    setIsLoading(true);
    trackFeatureUse('quick_date_ideas');

    const userCountry = localStorage.getItem('userCountry') || 'AL';
    const userCity = localStorage.getItem('userCity') || '';

    try {
      const prompt = `Generate 3 unique date ideas for ${filters.time} with a ${filters.budget} budget and ${filters.mood} mood.
${userCity ? `Location: ${userCity}, ${userCountry}` : `Country: ${userCountry}`}

For each idea provide:
- Title (creative and fun)
- Description (what you'll do, 2-3 sentences)
- Why it works (1 sentence)
- Estimated cost
- Duration
- Pro tip

Format as JSON array with: title, description, why_it_works, cost, duration, pro_tip`;

      const response = await base44.generateResponse(prompt, 'gpt-4o-mini');
      const content = response.choices?.[0]?.message?.content || '';
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setIdeas(parsed);
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Quick Date Ideas</h1>
        </div>
        <p className="text-slate-400">Instant date inspiration in seconds</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <label className="block text-sm font-semibold text-white mb-2">Budget</label>
          <div className="grid grid-cols-3 gap-2">
            {budgetOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, budget: option.value }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  filters.budget === option.value
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs font-semibold text-white">{option.label}</div>
                <div className="text-xs text-slate-400">{option.desc}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <label className="block text-sm font-semibold text-white mb-2">Mood</label>
          <div className="grid grid-cols-3 gap-2">
            {moodOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, mood: option.value }))}
                className={`p-2 rounded-lg border-2 transition-all ${
                  filters.mood === option.value
                    ? 'border-pink-500 bg-pink-500/20'
                    : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <div className="text-xl mb-1">{option.emoji}</div>
                <div className="text-xs font-semibold text-white">{option.label}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <label className="block text-sm font-semibold text-white mb-2">Time of Day</label>
          <div className="grid grid-cols-4 gap-2">
            {timeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, time: option.value }))}
                className={`p-2 rounded-lg border-2 transition-all ${
                  filters.time === option.value
                    ? 'border-cyan-500 bg-cyan-500/20'
                    : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <div className="text-xl mb-1">{option.emoji}</div>
                <div className="text-xs font-semibold text-white">{option.label}</div>
              </button>
            ))}
          </div>
        </Card>

        <Button
          onClick={generateIdeas}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-12"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Generating Ideas...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Date Ideas
            </>
          )}
        </Button>
      </div>

      {/* Ideas */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          {ideas.map((idea, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white flex-1">{idea.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: idea.title,
                          text: `${idea.description}\n\n${idea.why_it_works}`,
                          url: window.location.href
                        });
                      }
                    }}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-slate-400" />
                  </button>
                  <SaveButton
                    item={{
                      id: `quick-date-${Date.now()}-${index}`,
                      title: idea.title,
                      description: idea.description,
                      type: 'date_idea'
                    }}
                    type="dateIdeas"
                  />
                </div>
              </div>

              <p className="text-slate-300 mb-3">{idea.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-semibold">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  {idea.cost}
                </div>
                <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 font-semibold">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {idea.duration}
                </div>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-3">
                <p className="text-sm text-slate-300">
                  <span className="text-purple-400 font-semibold">Why it works: </span>
                  {idea.why_it_works}
                </p>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-slate-300">
                  <span className="text-yellow-400 font-semibold">💡 Pro Tip: </span>
                  {idea.pro_tip}
                </p>
              </div>
            </Card>
          ))}

          <Button
            onClick={generateIdeas}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Ideas
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && ideas.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Ideas Yet</h3>
          <p className="text-slate-500">Set your filters and generate instant date ideas!</p>
        </div>
      )}
    </div>
  );
}
