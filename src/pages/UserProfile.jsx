import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Target, Zap, Calendar, MessageSquare, Heart, Star, Trophy, Flame,
  User, Crown, Shield, LogOut, Bookmark, Settings, MapPin, Globe, Check, CreditCard, Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getLocalizedCountryName, getCountryByCode, countries } from '@/config/countries';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { getFavorites, removeVenueFavorite, removeDateIdeaFavorite, removeTipFavorite, removeGiftFavorite } from '@/utils/favorites';
import UpgradeModal from '@/components/UpgradeModal';

export default function UserProfile({ onLogout }) {
  const [stats, setStats] = useState({
    totalMessages: 0,
    messagesThisWeek: 0,
    datesPlanned: 0,
    rehearsalsSessions: 0,
    tipsViewed: 0,
    photosFeedback: 0,
    conversationStartersUsed: 0,
    currentStreak: 0,
    level: 1
  });

  const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [usage, setUsage] = useState(null);
  const [localFavorites, setLocalFavorites] = useState(getFavorites());
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeSection, setActiveSection] = useState('progress'); // 'progress', 'saved', 'settings'
  const [userCountry, setUserCountry] = useState(localStorage.getItem('userCountry') || 'AL');
  const [userCity, setUserCity] = useState(localStorage.getItem('userCity') || '');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);

  const backendUrl = getBackendUrl();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    fetchData();
    
    // Listen for favorites changes
    const handleFavoritesChanged = () => {
      setLocalFavorites(getFavorites());
    };
    window.addEventListener('favoritesChanged', handleFavoritesChanged);
    
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChanged);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Load stats from localStorage
      const savedStats = localStorage.getItem('userProgressStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      // Calculate weekly activity
      const activity = Array(7).fill(0).map((_, i) => Math.floor(Math.random() * 20));
      setWeeklyActivity(activity);

      // Fetch usage stats from backend
      const usageRes = await fetch(`${backendUrl}/api/usage`, {
        headers: { 'x-user-id': userId }
      });
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = () => {
    localStorage.setItem('userCountry', userCountry);
    localStorage.setItem('userCity', userCity);
    setIsEditingLocation(false);
    setLocationSaved(true);
    setTimeout(() => setLocationSaved(false), 2000);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('countryChanged', { 
      detail: { countryCode: userCountry } 
    }));
  };

  const handleRemoveFavorite = (type, item) => {
    try {
      if (type === 'venue') {
        removeVenueFavorite(item);
      } else if (type === 'dateIdea') {
        removeDateIdeaFavorite(item);
      } else if (type === 'tip') {
        removeTipFavorite(item);
      } else if (type === 'gift') {
        removeGiftFavorite(item);
      }
      setLocalFavorites(getFavorites());
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const getTierBadge = (tier) => {
    const badges = {
      free: { label: 'Free', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Shield },
      pro: { label: 'Pro', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Crown },
      elite: { label: 'Elite', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Crown },
    };
    return badges[tier?.toLowerCase()] || badges.free;
  };

  const currentTier = usage?.tier || localStorage.getItem('userSubscriptionTier') || 'free';
  const tierBadge = getTierBadge(currentTier);
  const TierIcon = tierBadge.icon;
  const currentCountry = getCountryByCode(userCountry);

  const achievements = [
    { id: 'first_message', title: 'First Message', desc: 'Sent your first AI chat', icon: '🎯', unlocked: stats.totalMessages > 0 },
    { id: 'conversationalist', title: 'Conversationalist', desc: 'Sent 50 messages', icon: '💬', unlocked: stats.totalMessages >= 50 },
    { id: 'date_planner', title: 'Date Planner', desc: 'Planned 5 dates', icon: '📅', unlocked: stats.datesPlanned >= 5 },
    { id: 'rehearsal_pro', title: 'Rehearsal Pro', desc: 'Completed 3 rehearsals', icon: '🎭', unlocked: stats.rehearsalsSessions >= 3 },
    { id: 'photo_perfectionist', title: 'Photo Perfectionist', desc: 'Got photo feedback', icon: '📸', unlocked: stats.photosFeedback > 0 },
    { id: 'smooth_talker', title: 'Smooth Talker', desc: 'Used 10 conversation starters', icon: '😎', unlocked: stats.conversationStartersUsed >= 10 },
    { id: 'wisdom_seeker', title: 'Wisdom Seeker', desc: 'Read 20 tips', icon: '📚', unlocked: stats.tipsViewed >= 20 },
    { id: 'on_fire', title: 'On Fire', desc: '7-day streak', icon: '🔥', unlocked: stats.currentStreak >= 7 }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercent = (unlockedCount / achievements.length) * 100;

  const statCards = [
    { label: 'Total Messages', value: usage?.dailyUsage?.messages || stats.totalMessages, icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
    { label: 'This Week', value: stats.messagesThisWeek, icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { label: 'Dates Planned', value: stats.datesPlanned, icon: Calendar, color: 'from-rose-500 to-pink-500' },
    { label: 'Current Level', value: stats.level, icon: Star, color: 'from-yellow-500 to-orange-500' }
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxActivity = Math.max(...weeklyActivity, 1);

  const totalFavorites = localFavorites.venues.length + localFavorites.dateIdeas.length + localFavorites.tips.length + localFavorites.gifts.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 min-h-screen">
      {/* User Header Card - NEW! */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/30 backdrop-blur-sm p-5 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{userName}</h2>
              <p className="text-sm text-slate-400">{userEmail}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${tierBadge.color}`}>
            <TierIcon className="w-4 h-4" />
            <span className="text-sm font-bold">{tierBadge.label}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {currentTier === 'free' && (
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-xl text-sm font-semibold"
            >
              <Crown className="w-4 h-4 mr-1.5" />
              Upgrade to Pro
            </Button>
          )}
          <Button
            onClick={onLogout}
            variant="outline"
            className="px-4 py-2 bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-slate-300 rounded-xl text-sm"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </Card>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-700/50">
        <button
          onClick={() => setActiveSection('progress')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${
            activeSection === 'progress'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-1.5" />
          Progress
        </button>
        <button
          onClick={() => setActiveSection('saved')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${
            activeSection === 'saved'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Bookmark className="w-4 h-4 inline mr-1.5" />
          Saved ({totalFavorites})
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${
            activeSection === 'settings'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-1.5" />
          Settings
        </button>
      </div>

      {/* PROGRESS SECTION (Original ProgressTracking Design) */}
      {activeSection === 'progress' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="bg-slate-800/50 border-slate-700 p-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} bg-opacity-20 rounded-xl flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </Card>
              );
            })}
          </div>

          {/* Weekly Activity */}
          <Card className="bg-slate-800/50 border-slate-700 p-5 mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              This Week's Activity
            </h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyActivity.map((activity, i) => {
                const height = (activity / maxActivity) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-700 rounded-t relative" style={{ height: `${height}%`, minHeight: '8px' }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"></div>
                    </div>
                    <span className="text-xs text-slate-400">{weekDays[i]}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Achievement Progress */}
          <Card className="bg-slate-800/50 border-slate-700 p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Achievements
              </h3>
              <span className="text-sm text-slate-400">{unlockedCount}/{achievements.length}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-4">
              <div 
                className="h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                      : 'bg-slate-900 border-slate-700 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-semibold text-white mb-1">{achievement.title}</div>
                  <div className="text-xs text-slate-400">{achievement.desc}</div>
                  {achievement.unlocked && (
                    <div className="mt-2 text-xs text-green-400 font-semibold">✓ Unlocked!</div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Continue Your Journey
            </h3>
            <div className="space-y-2">
              <Link to="/chat">
                <button className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-left hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-semibold text-sm">Chat with AI Coach</div>
                      <div className="text-slate-400 text-xs">Get personalized advice</div>
                    </div>
                  </div>
                </button>
              </Link>
              <Link to="/rehearsal">
                <button className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-left hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-semibold text-sm">Practice Date Scenarios</div>
                      <div className="text-slate-400 text-xs">Build confidence</div>
                    </div>
                  </div>
                </button>
              </Link>
              <Link to="/tips">
                <button className="w-full p-3 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-xl text-left hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-rose-400" />
                    <div>
                      <div className="text-white font-semibold text-sm">Browse Dating Tips</div>
                      <div className="text-slate-400 text-xs">Expert advice & strategies</div>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </Card>
        </>
      )}

      {/* SAVED SECTION */}
      {activeSection === 'saved' && (
        <div className="space-y-4">
          {totalFavorites === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
              <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">No Saved Items Yet</h3>
              <p className="text-slate-400 text-sm">Start exploring and save your favorite venues, tips, and gift ideas!</p>
            </Card>
          ) : (
            <>
              {/* Saved Venues */}
              {localFavorites.venues.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    Saved Venues ({localFavorites.venues.length})
                  </h3>
                  <div className="space-y-2">
                    {localFavorites.venues.map((venue, index) => (
                      <Card key={index} className="bg-slate-800/50 border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{venue.name}</h4>
                            <p className="text-slate-400 text-sm">{venue.description || venue.location}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFavorite('venue', venue)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Tips */}
              {localFavorites.tips.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    Saved Tips ({localFavorites.tips.length})
                  </h3>
                  <div className="space-y-2">
                    {localFavorites.tips.map((tip, index) => (
                      <Card key={index} className="bg-slate-800/50 border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                          <p className="text-slate-300 text-sm flex-1">{tip.content || tip.text || tip.title}</p>
                          <button
                            onClick={() => handleRemoveFavorite('tip', tip)}
                            className="text-slate-400 hover:text-red-400 transition-colors ml-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Gifts */}
              {localFavorites.gifts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Saved Gift Ideas ({localFavorites.gifts.length})
                  </h3>
                  <div className="space-y-2">
                    {localFavorites.gifts.map((gift, index) => (
                      <Card key={index} className="bg-slate-800/50 border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{gift.name || gift.title}</h4>
                            {gift.description && <p className="text-slate-400 text-sm mt-1">{gift.description}</p>}
                          </div>
                          <button
                            onClick={() => handleRemoveFavorite('gift', gift)}
                            className="text-slate-400 hover:text-red-400 transition-colors ml-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SETTINGS SECTION */}
      {activeSection === 'settings' && (
        <div className="space-y-4">
          {/* Location Settings */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Your Location
            </h3>
            
            {!isEditingLocation ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold">
                      {currentCountry?.flag} {getLocalizedCountryName(userCountry)}
                    </div>
                    {userCity && <div className="text-slate-400 text-sm">{userCity}</div>}
                  </div>
                  <Button
                    onClick={() => setIsEditingLocation(true)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm"
                  >
                    Change
                  </Button>
                </div>
                {locationSaved && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Location saved!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Country</label>
                  <select
                    value={userCountry}
                    onChange={(e) => setUserCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">City (optional)</label>
                  <input
                    type="text"
                    value={userCity}
                    onChange={(e) => setUserCity(e.target.value)}
                    placeholder="Enter your city"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveLocation}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 rounded-xl"
                  >
                    Save Location
                  </Button>
                  <Button
                    onClick={() => setIsEditingLocation(false)}
                    variant="outline"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Subscription Management */}
          {currentTier !== 'free' && (
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Subscription
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${tierBadge.color} mb-2`}>
                    <TierIcon className="w-4 h-4" />
                    <span className="text-sm font-bold">{tierBadge.label} Plan</span>
                  </div>
                  <p className="text-slate-400 text-sm">Manage your subscription</p>
                </div>
                <a
                  href="https://billing.stripe.com/p/login/test_7sI9Df4Mp8M48zm000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm"
                >
                  Manage
                </a>
              </div>
            </Card>
          )}

          {/* Account Actions */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <div className="space-y-2">
              <button
                onClick={onLogout}
                className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <div className="text-sm font-semibold">Logout</div>
                </div>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
