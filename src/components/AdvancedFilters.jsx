import React, { useState } from 'react';
import { X, Sliders, Heart, Target, AlertCircle, Check } from 'lucide-react';

export default function AdvancedFilters({ onClose, onApply, currentFilters = {} }) {
  const [filters, setFilters] = useState({
    ageRange: currentFilters.ageRange || [18, 35],
    distance: currentFilters.distance || 50,
    heightRange: currentFilters.heightRange || [150, 200],
    relationshipGoal: currentFilters.relationshipGoal || [],
    education: currentFilters.education || [],
    drinking: currentFilters.drinking || null,
    smoking: currentFilters.smoking || null,
    kids: currentFilters.kids || null,
    religion: currentFilters.religion || [],
    politics: currentFilters.politics || null,
    exercise: currentFilters.exercise || null,
    interests: currentFilters.interests || [],
    dealbreakers: currentFilters.dealbreakers || []
  });

  const [activeTab, setActiveTab] = useState('essentials'); // essentials, lifestyle, advanced

  const relationshipGoals = [
    { value: 'long-term', label: 'Long-term relationship', emoji: '💕' },
    { value: 'casual', label: 'Casual dating', emoji: '✨' },
    { value: 'friends', label: 'New friends', emoji: '🤝' },
    { value: 'unsure', label: 'Not sure yet', emoji: '🤔' }
  ];

  const educationLevels = [
    { value: 'high-school', label: 'High School' },
    { value: 'bachelors', label: 'Bachelors' },
    { value: 'masters', label: 'Masters' },
    { value: 'phd', label: 'PhD' },
    { value: 'trade', label: 'Trade School' }
  ];

  const drinkingOptions = [
    { value: 'never', label: 'Never', emoji: '🚫' },
    { value: 'socially', label: 'Socially', emoji: '🍷' },
    { value: 'regularly', label: 'Regularly', emoji: '🍺' }
  ];

  const smokingOptions = [
    { value: 'never', label: 'Non-smoker', emoji: '🚭' },
    { value: 'socially', label: 'Social smoker', emoji: '🌬️' },
    { value: 'regularly', label: 'Regular smoker', emoji: '🚬' }
  ];

  const kidsOptions = [
    { value: 'none-no', label: 'Don\'t have, don\'t want', emoji: '❌' },
    { value: 'none-yes', label: 'Don\'t have, want someday', emoji: '👶' },
    { value: 'have-yes', label: 'Have kids, want more', emoji: '👨‍👩‍👧' },
    { value: 'have-no', label: 'Have kids, don\'t want more', emoji: '👨‍👩‍👧‍👦' }
  ];

  const religions = [
    'Agnostic', 'Atheist', 'Buddhist', 'Catholic', 'Christian', 
    'Hindu', 'Jewish', 'Muslim', 'Spiritual', 'Other'
  ];

  const politicsOptions = [
    { value: 'liberal', label: 'Liberal', emoji: '🌈' },
    { value: 'moderate', label: 'Moderate', emoji: '⚖️' },
    { value: 'conservative', label: 'Conservative', emoji: '🏛️' },
    { value: 'apolitical', label: 'Not political', emoji: '🤷' }
  ];

  const exerciseOptions = [
    { value: 'never', label: 'Never', emoji: '🛋️' },
    { value: 'sometimes', label: 'Sometimes', emoji: '🚶' },
    { value: 'active', label: 'Active', emoji: '🏃' },
    { value: 'athlete', label: 'Very active', emoji: '💪' }
  ];

  const commonInterests = [
    'Traveling', 'Coffee', 'Photography', 'Music', 'Fitness', 'Cooking',
    'Yoga', 'Dancing', 'Art', 'Beach', 'Wine', 'Reading', 'Philosophy',
    'Hiking', 'Business', 'Skiing', 'Tech', 'Gaming', 'Movies', 'Sports',
    'Fashion', 'Food', 'Nature', 'Pets', 'Adventure', 'Netflix'
  ];

  const toggleMultiSelect = (field, value) => {
    const current = filters[field] || [];
    if (current.includes(value)) {
      setFilters({ ...filters, [field]: current.filter(v => v !== value) });
    } else {
      setFilters({ ...filters, [field]: [...current, value] });
    }
  };

  const toggleDealbreaker = (key) => {
    const dealbreakers = filters.dealbreakers || [];
    if (dealbreakers.includes(key)) {
      setFilters({ ...filters, dealbreakers: dealbreakers.filter(d => d !== key) });
    } else {
      setFilters({ ...filters, dealbreakers: [...dealbreakers, key] });
    }
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      ageRange: [18, 35],
      distance: 50,
      heightRange: [150, 200],
      relationshipGoal: [],
      education: [],
      drinking: null,
      smoking: null,
      kids: null,
      religion: [],
      politics: null,
      exercise: null,
      interests: [],
      dealbreakers: []
    });
  };

  const isDealbreaker = (key) => (filters.dealbreakers || []).includes(key);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-slate-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            Advanced Filters
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-slate-700 bg-slate-900 sticky top-16 z-10">
          <button
            onClick={() => setActiveTab('essentials')}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'essentials'
                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Essentials
          </button>
          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'lifestyle'
                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Lifestyle
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'advanced'
                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'essentials' && (
            <>
              {/* Age Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">
                    Age: {filters.ageRange[0]} - {filters.ageRange[1]}
                  </label>
                  {isDealbreaker('age') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={filters.ageRange[0]}
                    onChange={(e) => setFilters({
                      ...filters,
                      ageRange: [parseInt(e.target.value), filters.ageRange[1]]
                    })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={filters.ageRange[1]}
                    onChange={(e) => setFilters({
                      ...filters,
                      ageRange: [filters.ageRange[0], parseInt(e.target.value)]
                    })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <button
                  onClick={() => toggleDealbreaker('age')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('age') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Distance */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">
                    Maximum Distance: {filters.distance} km
                  </label>
                  {isDealbreaker('distance') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <button
                  onClick={() => toggleDealbreaker('distance')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('distance') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Height Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">
                    Height: {filters.heightRange[0]}cm - {filters.heightRange[1]}cm
                  </label>
                  {isDealbreaker('height') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="140"
                    max="220"
                    value={filters.heightRange[0]}
                    onChange={(e) => setFilters({
                      ...filters,
                      heightRange: [parseInt(e.target.value), filters.heightRange[1]]
                    })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <input
                    type="range"
                    min="140"
                    max="220"
                    value={filters.heightRange[1]}
                    onChange={(e) => setFilters({
                      ...filters,
                      heightRange: [filters.heightRange[0], parseInt(e.target.value)]
                    })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <button
                  onClick={() => toggleDealbreaker('height')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('height') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Relationship Goals */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Relationship Goals</label>
                  {isDealbreaker('relationshipGoal') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {relationshipGoals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => toggleMultiSelect('relationshipGoal', goal.value)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        filters.relationshipGoal.includes(goal.value)
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="mr-1">{goal.emoji}</span>
                      {goal.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleDealbreaker('relationshipGoal')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('relationshipGoal') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'lifestyle' && (
            <>
              {/* Drinking */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Drinking</label>
                  {isDealbreaker('drinking') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {drinkingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, drinking: filters.drinking === option.value ? null : option.value })}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        filters.drinking === option.value
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{option.emoji}</div>
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleDealbreaker('drinking')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('drinking') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Smoking */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Smoking</label>
                  {isDealbreaker('smoking') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {smokingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, smoking: filters.smoking === option.value ? null : option.value })}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        filters.smoking === option.value
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{option.emoji}</div>
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleDealbreaker('smoking')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('smoking') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Kids */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Kids</label>
                  {isDealbreaker('kids') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {kidsOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, kids: filters.kids === option.value ? null : option.value })}
                      className={`p-3 rounded-xl text-xs font-medium transition-all ${
                        filters.kids === option.value
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{option.emoji}</div>
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleDealbreaker('kids')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('kids') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Exercise */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Exercise</label>
                  {isDealbreaker('exercise') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {exerciseOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, exercise: filters.exercise === option.value ? null : option.value })}
                      className={`p-3 rounded-xl text-xs font-medium transition-all ${
                        filters.exercise === option.value
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{option.emoji}</div>
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleDealbreaker('exercise')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('exercise') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'advanced' && (
            <>
              {/* Education */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Education Level</label>
                  {isDealbreaker('education') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {educationLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => toggleMultiSelect('education', level.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.education.includes(level.value)
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {filters.education.includes(level.value) && <Check className="w-3 h-3 inline mr-1" />}
                      {level.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleDealbreaker('education')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('education') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Religion */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Religion</label>
                  {isDealbreaker('religion') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {religions.map((religion) => (
                    <button
                      key={religion}
                      onClick={() => toggleMultiSelect('religion', religion)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.religion.includes(religion)
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {filters.religion.includes(religion) && <Check className="w-3 h-3 inline mr-1" />}
                      {religion}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleDealbreaker('religion')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('religion') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Politics */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Political Views</label>
                  {isDealbreaker('politics') && <span className="text-xs text-red-400 font-semibold">DEALBREAKER</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {politicsOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, politics: filters.politics === option.value ? null : option.value })}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        filters.politics === option.value
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleDealbreaker('politics')}
                  className="mt-2 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {isDealbreaker('politics') ? '✓ Dealbreaker' : '+ Mark as dealbreaker'}
                </button>
              </div>

              {/* Interests */}
              <div>
                <label className="text-sm font-semibold text-white mb-3 block">
                  Shared Interests ({filters.interests.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleMultiSelect('interests', interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.interests.includes(interest)
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {filters.interests.includes(interest) && <Check className="w-3 h-3 inline mr-1" />}
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Dealbreakers Summary */}
          {filters.dealbreakers && filters.dealbreakers.length > 0 && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">
                  {filters.dealbreakers.length} Dealbreaker{filters.dealbreakers.length > 1 ? 's' : ''} Set
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Only profiles matching these criteria will be shown
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700 bg-slate-900 space-y-2">
          <button
            onClick={handleApply}
            className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-fuchsia-700 transition-all flex items-center justify-center gap-2"
          >
            <Target className="w-5 h-5" />
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

