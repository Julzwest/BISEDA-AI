import React, { useState } from 'react';
import { ArrowLeft, Eye, Search, Heart, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BodyLanguageGuide = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('positive');
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'positive', label: 'Attraction', icon: '💚', color: 'emerald' },
    { id: 'neutral', label: 'Uncertain', icon: '💛', color: 'amber' },
    { id: 'negative', label: 'Disinterest', icon: '❤️‍🩹', color: 'red' },
  ];

  const bodyLanguageSignals = {
    positive: [
      {
        id: 'eye_contact',
        emoji: '👀',
        title: 'Prolonged Eye Contact',
        shortDesc: 'They hold your gaze',
        meaning: 'Strong interest and attraction. When someone maintains eye contact longer than usual, they\'re signaling they want to connect with you.',
        whatToDo: 'Hold their gaze back with a slight smile. Break eye contact slowly by looking down (submissive/flirty) rather than to the side (dismissive).',
        intensity: 'high'
      },
      {
        id: 'leaning_in',
        emoji: '↗️',
        title: 'Leaning In',
        shortDesc: 'They move closer to you',
        meaning: 'They want to be in your space. This is a subconscious way of showing they\'re comfortable and interested in what you have to say.',
        whatToDo: 'Mirror their energy. Lean in slightly when sharing something interesting. Create moments of closeness.',
        intensity: 'high'
      },
      {
        id: 'touching',
        emoji: '✋',
        title: 'Light Touching',
        shortDesc: 'Arm, shoulder, hand touches',
        meaning: 'Physical touch is a strong indicator of attraction. They\'re testing the waters and want to create a physical connection.',
        whatToDo: 'Reciprocate with natural, confident touches. A light touch on the arm when making a point works well.',
        intensity: 'high'
      },
      {
        id: 'hair_play',
        emoji: '💇',
        title: 'Playing with Hair',
        shortDesc: 'Twirling, touching their hair',
        meaning: 'Self-grooming behavior that signals they want to look good for you. Often subconscious and indicates attraction.',
        whatToDo: 'Take it as a green light. They\'re invested in the interaction. Compliment something specific about them.',
        intensity: 'medium'
      },
      {
        id: 'mirroring',
        emoji: '🪞',
        title: 'Mirroring Your Movements',
        shortDesc: 'Copying your gestures/posture',
        meaning: 'Subconscious imitation shows rapport and connection. When someone mirrors you, they\'re in sync with you mentally.',
        whatToDo: 'Test it by changing your posture and see if they follow. Use this connection to deepen the conversation.',
        intensity: 'high'
      },
      {
        id: 'laughing',
        emoji: '😄',
        title: 'Laughing at Your Jokes',
        shortDesc: 'Even when you\'re not that funny',
        meaning: 'Genuine laughter (especially at mediocre jokes) is a strong attraction signal. They want you to feel good.',
        whatToDo: 'Keep the playful energy going. Don\'t try too hard to be funny - stay relaxed and confident.',
        intensity: 'medium'
      },
      {
        id: 'lip_looking',
        emoji: '👄',
        title: 'Looking at Your Lips',
        shortDesc: 'Eyes drift to your mouth',
        meaning: 'Classic sign they\'re thinking about kissing you. The triangle gaze (eyes → lips → eyes) is a strong signal.',
        whatToDo: 'If you notice this multiple times, the moment is right. Move closer, lower your voice, and go for it.',
        intensity: 'high'
      },
      {
        id: 'open_body',
        emoji: '🧍',
        title: 'Open Body Language',
        shortDesc: 'Facing you, arms uncrossed',
        meaning: 'They\'re receptive and comfortable. An open stance facing directly toward you shows full attention and interest.',
        whatToDo: 'Match their openness. Face them directly and keep your body language relaxed and inviting.',
        intensity: 'medium'
      },
      {
        id: 'feet_pointing',
        emoji: '👟',
        title: 'Feet Pointing Toward You',
        shortDesc: 'Their feet face your direction',
        meaning: 'People unconsciously point their feet toward what interests them. Even if they\'re looking elsewhere, feet don\'t lie.',
        whatToDo: 'A subtle but reliable signal. If their feet point at you, they want to stay in the conversation.',
        intensity: 'medium'
      },
      {
        id: 'preening',
        emoji: '✨',
        title: 'Self-Grooming',
        shortDesc: 'Adjusting clothes, checking appearance',
        meaning: 'They care about how they look to you. Straightening clothes, fixing hair, or checking their reflection near you is attraction.',
        whatToDo: 'They\'re investing effort. Return the energy by being present and attentive.',
        intensity: 'medium'
      }
    ],
    neutral: [
      {
        id: 'nervous_energy',
        emoji: '😰',
        title: 'Nervous Energy',
        shortDesc: 'Fidgeting, restless movements',
        meaning: 'Could be attraction (butterflies) or discomfort. Context matters. If they\'re staying in the conversation, it\'s likely good nervousness.',
        whatToDo: 'Make them comfortable. Slow down your energy, speak calmly, and give them space to relax.',
        intensity: 'medium'
      },
      {
        id: 'mixed_signals',
        emoji: '🔄',
        title: 'Hot and Cold',
        shortDesc: 'Engaged then distant',
        meaning: 'They might be unsure, testing you, or processing their feelings. Don\'t panic - inconsistency isn\'t always rejection.',
        whatToDo: 'Stay grounded and confident. Don\'t chase their validation. Let them come to you.',
        intensity: 'medium'
      },
      {
        id: 'polite_smile',
        emoji: '🙂',
        title: 'Polite Smile Only',
        shortDesc: 'Smiles but no eye crinkles',
        meaning: 'A polite smile doesn\'t engage the eyes (Duchenne smile). They\'re being friendly but may not be attracted yet.',
        whatToDo: 'Build more rapport. Try to get a genuine laugh or reaction before escalating.',
        intensity: 'low'
      },
      {
        id: 'short_answers',
        emoji: '💬',
        title: 'Short Responses',
        shortDesc: 'Brief answers, no follow-up',
        meaning: 'They might be shy, distracted, or uninterested. If combined with other positive signals, it could just be their style.',
        whatToDo: 'Ask open-ended questions. If they consistently don\'t engage, consider gracefully moving on.',
        intensity: 'medium'
      },
      {
        id: 'checking_phone',
        emoji: '📱',
        title: 'Quick Phone Checks',
        shortDesc: 'Occasional glances at phone',
        meaning: 'Modern habit, not always a red flag. If they quickly put it away, they\'re choosing you over distractions.',
        whatToDo: 'Don\'t call it out. If it becomes constant, re-engage with something interesting or give them an out.',
        intensity: 'low'
      }
    ],
    negative: [
      {
        id: 'crossed_arms',
        emoji: '🙅',
        title: 'Crossed Arms',
        shortDesc: 'Defensive, closed posture',
        meaning: 'Creates a barrier between you. They may feel uncomfortable, defensive, or simply cold. Context is key.',
        whatToDo: 'Don\'t pressure. Take a step back emotionally. Give them a reason to open up or exit gracefully.',
        intensity: 'medium'
      },
      {
        id: 'leaning_away',
        emoji: '↙️',
        title: 'Leaning Away',
        shortDesc: 'Creating physical distance',
        meaning: 'They\'re trying to increase space between you. A clear sign of discomfort or disinterest.',
        whatToDo: 'Respect their space. Don\'t chase. Either re-establish comfort from a distance or wrap up the interaction.',
        intensity: 'high'
      },
      {
        id: 'looking_around',
        emoji: '👁️',
        title: 'Scanning the Room',
        shortDesc: 'Eyes wandering, not focused',
        meaning: 'They\'re looking for something more interesting or an escape route. You don\'t have their full attention.',
        whatToDo: 'Re-engage with a pattern interrupt - change topics dramatically or suggest moving somewhere.',
        intensity: 'high'
      },
      {
        id: 'minimal_response',
        emoji: '😐',
        title: 'One-Word Answers',
        shortDesc: '"Yeah" "Cool" "Nice"',
        meaning: 'They\'re not investing in the conversation. This is their way of being polite while signaling disinterest.',
        whatToDo: 'Time to exit with grace. "I should get back to my friends, nice meeting you" keeps your dignity intact.',
        intensity: 'high'
      },
      {
        id: 'checking_time',
        emoji: '⌚',
        title: 'Checking the Time',
        shortDesc: 'Looking at watch/phone for time',
        meaning: 'They\'re counting down to leave. Even if they have somewhere to be, interested people don\'t remind themselves.',
        whatToDo: 'Acknowledge it: "I won\'t keep you" - this shows social awareness and gives them a graceful exit.',
        intensity: 'high'
      },
      {
        id: 'turning_away',
        emoji: '↪️',
        title: 'Body Angled Away',
        shortDesc: 'Shoulders/torso facing elsewhere',
        meaning: 'Their body wants to leave even if they\'re still talking. Feet and torso point where they want to go.',
        whatToDo: 'Read the room. Wrap up the conversation before they have to. Leave them with a positive last impression.',
        intensity: 'medium'
      },
      {
        id: 'fake_busy',
        emoji: '📋',
        title: 'Suddenly Busy',
        shortDesc: '"I have to go find my friend"',
        meaning: 'A polite escape. They\'re manufacturing a reason to leave the conversation.',
        whatToDo: 'Let them go gracefully: "Of course, nice talking to you." Never make them feel trapped.',
        intensity: 'high'
      },
      {
        id: 'avoiding_touch',
        emoji: '🚫',
        title: 'Avoiding Physical Contact',
        shortDesc: 'Pulling away from touches',
        meaning: 'Clear boundary. They don\'t want physical escalation with you.',
        whatToDo: 'Respect it immediately. Don\'t try again. Either reset to friendly conversation or exit.',
        intensity: 'high'
      }
    ]
  };

  const filteredSignals = bodyLanguageSignals[selectedCategory].filter(signal =>
    signal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signal.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'high': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'low': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'positive': return 'emerald';
      case 'neutral': return 'amber';
      case 'negative': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center gap-3 px-5 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-800/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-violet-400" />
              Body Language Guide
            </h1>
            <p className="text-xs text-slate-500">Learn to read the signs</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search signals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-5 pb-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                selectedCategory === cat.id
                  ? cat.id === 'positive' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : cat.id === 'neutral'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:bg-slate-700/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      <div className="px-5 py-4 space-y-3">
        {filteredSignals.map(signal => (
          <button
            key={signal.id}
            onClick={() => setSelectedSignal(signal)}
            className={`w-full p-4 rounded-2xl border transition-all text-left ${
              selectedCategory === 'positive'
                ? 'bg-slate-800/40 border-emerald-500/20 hover:border-emerald-500/40'
                : selectedCategory === 'neutral'
                  ? 'bg-slate-800/40 border-amber-500/20 hover:border-amber-500/40'
                  : 'bg-slate-800/40 border-red-500/20 hover:border-red-500/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                selectedCategory === 'positive'
                  ? 'bg-emerald-500/20'
                  : selectedCategory === 'neutral'
                    ? 'bg-amber-500/20'
                    : 'bg-red-500/20'
              }`}>
                {signal.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white text-sm">{signal.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getIntensityColor(signal.intensity)}`}>
                    {signal.intensity}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{signal.shortDesc}</p>
              </div>
              <div className="text-slate-600">→</div>
            </div>
          </button>
        ))}
      </div>

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSignal(null)}
          />
          <div className={`relative w-full max-w-lg bg-slate-900 rounded-t-3xl border-t ${
            selectedCategory === 'positive'
              ? 'border-emerald-500/30'
              : selectedCategory === 'neutral'
                ? 'border-amber-500/30'
                : 'border-red-500/30'
          } p-6 pb-10 max-h-[80vh] overflow-y-auto`}>
            {/* Close button */}
            <button
              onClick={() => setSelectedSignal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                selectedCategory === 'positive'
                  ? 'bg-emerald-500/20'
                  : selectedCategory === 'neutral'
                    ? 'bg-amber-500/20'
                    : 'bg-red-500/20'
              }`}>
                {selectedSignal.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSignal.title}</h2>
                <p className="text-sm text-slate-400">{selectedSignal.shortDesc}</p>
              </div>
            </div>

            {/* Meaning */}
            <div className="mb-5">
              <h3 className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                selectedCategory === 'positive'
                  ? 'text-emerald-400'
                  : selectedCategory === 'neutral'
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}>
                <Heart className="w-3.5 h-3.5" />
                What it means
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl">
                {selectedSignal.meaning}
              </p>
            </div>

            {/* What to do */}
            <div>
              <h3 className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-2">
                ⚡ What to do
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl">
                {selectedSignal.whatToDo}
              </p>
            </div>

            {/* Intensity indicator */}
            <div className="mt-5 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Signal Strength</span>
                <span className={`text-xs px-3 py-1 rounded-full border ${getIntensityColor(selectedSignal.intensity)}`}>
                  {selectedSignal.intensity === 'high' ? '🔥 Strong Signal' : selectedSignal.intensity === 'medium' ? '✨ Moderate Signal' : '💫 Subtle Signal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyLanguageGuide;
