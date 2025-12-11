import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, Mail, Phone, Crown, Zap, TrendingUp, Bookmark, 
  Heart, Gift, Lightbulb, Calendar, Trash2, ExternalLink,
  CreditCard, LogOut, Shield, Star, MapPin, Globe, Check, Music, Share2,
  AlertTriangle, X, Clock, XCircle, Flame, Trophy, Target, Sparkles,
  MessageCircle, Camera, ChevronRight, Settings, Award, Rocket
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { getBackendUrl } from '@/utils/getBackendUrl';
import UpgradeModal from '@/components/UpgradeModal';
import { countries, getCitiesForCountry, getCountryByCode } from '@/config/countries';
import { getFavorites, removeVenueFavorite, removeDateIdeaFavorite, removeTipFavorite, removeGiftFavorite } from '@/utils/favorites';

export default function UserProfile({ onLogout }) {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState(null);
  const [usage, setUsage] = useState(null);
  const [savedItems, setSavedItems] = useState(null);
  const [localFavorites, setLocalFavorites] = useState(getFavorites());
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userCountry, setUserCountry] = useState(localStorage.getItem('userCountry') || 'AL');
  const [userCity, setUserCity] = useState(localStorage.getItem('userCity') || '');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitted, setCancelSubmitted] = useState(false);

  const backendUrl = getBackendUrl();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userGender = localStorage.getItem('userGender') || 'male';

  // Fun stats (could be fetched from backend in future)
  const [stats, setStats] = useState({
    messagesTotal: 0,
    daysActive: 0,
    savedCount: 0,
    streak: 0
  });

  const handleSaveLocation = () => {
    localStorage.setItem('userCountry', userCountry);
    localStorage.setItem('userCity', userCity);
    setIsEditingLocation(false);
    setLocationSaved(true);
    setTimeout(() => setLocationSaved(false), 2000);
  };

  const currentCountry = getCountryByCode(userCountry);

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
      // Fetch usage stats
      const usageRes = await fetch(`${backendUrl}/api/usage`, {
        headers: { 'x-user-id': userId }
      });
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
        
        // Calculate fun stats
        setStats({
          messagesTotal: usageData.dailyUsage?.messages || 0,
          daysActive: Math.floor(Math.random() * 30) + 1, // Placeholder - would come from backend
          savedCount: localFavorites.venues.length + localFavorites.dateIdeas.length + localFavorites.tips.length + localFavorites.gifts.length,
          streak: Math.floor(Math.random() * 7) + 1 // Placeholder - would come from backend
        });
      }

      // Fetch saved items
      const savedRes = await fetch(`${backendUrl}/api/user/saved`, {
        headers: { 'x-user-id': userId }
      });
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedItems(savedData.savedItems);
      }

      setUserInfo({ userName, userEmail });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (savedId) => {
    try {
      const res = await fetch(`${backendUrl}/api/user/saved/${savedId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const getTierBadge = (tier) => {
    const badges = {
      free: { label: 'Free Plan', color: 'from-slate-500 to-slate-600', icon: Shield, emoji: '🆓' },
      free_trial: { label: 'Free Trial', color: 'from-emerald-500 to-teal-600', icon: Gift, emoji: '🎁' },
      starter: { label: 'Starter', color: 'from-blue-500 to-cyan-600', icon: Zap, emoji: '⚡' },
      pro: { label: 'Pro', color: 'from-purple-500 to-pink-600', icon: Crown, emoji: '👑' },
      elite: { label: 'Elite', color: 'from-amber-500 to-orange-600', icon: Star, emoji: '⭐' },
      premium: { label: 'Elite', color: 'from-amber-500 to-orange-600', icon: Star, emoji: '⭐' }
    };
    return badges[tier] || badges.free;
  };

  const getLevel = () => {
    const messages = stats.messagesTotal;
    if (messages >= 500) return { level: 10, title: 'Love Master', emoji: '💎' };
    if (messages >= 300) return { level: 8, title: 'Romance Expert', emoji: '💜' };
    if (messages >= 150) return { level: 6, title: 'Dating Pro', emoji: '💙' };
    if (messages >= 75) return { level: 4, title: 'Charmer', emoji: '💚' };
    if (messages >= 25) return { level: 2, title: 'Beginner', emoji: '💛' };
    return { level: 1, title: 'Newbie', emoji: '🌱' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const tierBadge = usage ? getTierBadge(usage.tier) : getTierBadge('free');
  const TierIcon = tierBadge.icon;
  const levelInfo = getLevel();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Fixed Header with Logo */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Biseda.ai</span>
          </div>
          <button className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-20 pb-32">
        {/* Hero Profile Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/50 via-slate-800/80 to-pink-900/50 border-purple-500/30 backdrop-blur-xl p-6 mb-6">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10">
            {/* Avatar with animated ring */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full animate-spin" style={{ animationDuration: '3s', padding: '3px' }}></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center m-1 shadow-2xl">
                  <span className="text-4xl">{userGender === 'female' ? '👩' : '👨'}</span>
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                  <span className="text-xs font-bold text-white">{levelInfo.level}</span>
                </div>
              </div>
            </div>
            
            {/* Name and email */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-white mb-1">{userName}</h1>
              <p className="text-slate-400 text-sm">{userEmail}</p>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-slate-800/50 rounded-full">
                <span>{levelInfo.emoji}</span>
                <span className="text-sm text-purple-300 font-medium">{levelInfo.title}</span>
              </div>
            </div>

            {/* Membership Badge */}
            <div className={`flex items-center justify-center gap-3 p-3 bg-gradient-to-r ${tierBadge.color} rounded-2xl shadow-lg`}>
              <TierIcon className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">{tierBadge.label} Member</span>
              <span className="text-2xl">{tierBadge.emoji}</span>
            </div>
          </div>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 p-3 text-center">
            <MessageCircle className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{usage?.dailyUsage?.messages || 0}</p>
            <p className="text-[10px] text-slate-400">Today</p>
          </Card>
          <Card className="bg-gradient-to-br from-orange-600/20 to-red-800/20 border-orange-500/30 p-3 text-center">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.streak}</p>
            <p className="text-[10px] text-slate-400">Streak</p>
          </Card>
          <Card className="bg-gradient-to-br from-pink-600/20 to-rose-800/20 border-pink-500/30 p-3 text-center">
            <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.savedCount}</p>
            <p className="text-[10px] text-slate-400">Saved</p>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600/20 to-violet-800/20 border-purple-500/30 p-3 text-center">
            <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{usage?.credits || 0}</p>
            <p className="text-[10px] text-slate-400">Credits</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-900/50 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {stats.savedCount > 0 && (
                <span className="px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                  {stats.savedCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Usage Progress Card */}
            {usage && (
              <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Daily Progress
                  </h3>
                  <span className="text-sm text-slate-400">
                    {usage.dailyUsage.messages} / {usage.dailyUsage.messagesLimit}
                  </span>
                </div>
                
                {/* Beautiful progress bar */}
                <div className="relative h-4 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (usage.dailyUsage.messages / usage.dailyUsage.messagesLimit) * 100)}%`,
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 text-center">
                  {usage.dailyUsage.messagesLimit - usage.dailyUsage.messages} messages remaining today 🎯
                </p>

                {usage.tier !== 'premium' && usage.tier !== 'elite' && (
                  <Button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-purple-500/30"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Upgrade for More Messages
                  </Button>
                )}
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-slate-800/60 border-slate-700/50 p-5 mb-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => window.location.href = '/chat'}
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">AI Coach</p>
                    <p className="text-slate-400 text-xs">Get advice</p>
                  </div>
                </button>
                <button 
                  onClick={() => window.location.href = '/dates'}
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/30 rounded-xl hover:border-pink-400/50 transition-all group"
                >
                  <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">Date Ideas</p>
                    <p className="text-slate-400 text-xs">Plan dates</p>
                  </div>
                </button>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="bg-slate-800/60 border-slate-700/50 p-5 mb-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Username</p>
                    <p className="text-white font-medium">{userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-white font-medium">{userEmail}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location Settings */}
            <Card className="bg-slate-800/60 border-slate-700/50 p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  Location
                </h3>
                {!isEditingLocation && (
                  <Button
                    onClick={() => setIsEditingLocation(true)}
                    size="sm"
                    className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 h-8 rounded-lg"
                  >
                    Change
                  </Button>
                )}
              </div>

              {!isEditingLocation ? (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
                  <span className="text-4xl">{currentCountry?.flag || '🌍'}</span>
                  <div>
                    <p className="text-white font-bold">{currentCountry?.name || 'Not set'}</p>
                    <p className="text-slate-400 text-sm">{userCity || 'Select city'}</p>
                  </div>
                  {locationSaved && (
                    <div className="ml-auto flex items-center gap-1 text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Saved!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Country
                    </label>
                    <select
                      value={userCountry}
                      onChange={(e) => {
                        setUserCountry(e.target.value);
                        setUserCity('');
                      }}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors"
                      style={{ fontSize: '16px' }}
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      City
                    </label>
                    <select
                      value={userCity}
                      onChange={(e) => setUserCity(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors"
                      style={{ fontSize: '16px' }}
                    >
                      <option value="">Select city...</option>
                      {getCitiesForCountry(userCountry).map((city) => (
                        <option key={city.nameEn} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveLocation}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Location
                    </Button>
                    <Button
                      onClick={() => {
                        setUserCountry(localStorage.getItem('userCountry') || 'AL');
                        setUserCity(localStorage.getItem('userCity') || '');
                        setIsEditingLocation(false);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Membership Cancellation Section - Only show for paid users */}
            {usage && ['starter', 'pro', 'elite', 'premium'].includes(usage.tier) && (
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-orange-500/30 backdrop-blur-sm p-5 mb-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">Cancel Membership</h3>
                    <p className="text-slate-400 text-sm">Need to cancel your subscription?</p>
                  </div>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-300 font-semibold text-sm">30-Day Notice Required</p>
                      <p className="text-orange-200/70 text-xs mt-1">
                        Cancellation requests require 30 days advance notice. Your membership will remain active until the notice period ends.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-300 font-semibold rounded-xl"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Request Cancellation
                </Button>
              </Card>
            )}

            {/* Logout Button */}
            <Button
              onClick={onLogout}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold h-14 rounded-2xl shadow-lg shadow-red-500/20"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Log Out
            </Button>
          </>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
            <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-orange-500/30 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 text-center border-b border-slate-700/50">
                <button
                  onClick={() => { setShowCancelModal(false); setCancelSubmitted(false); setCancelReason(''); }}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 shadow-lg shadow-orange-500/30">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {cancelSubmitted ? 'Request Sent' : 'Cancel Membership'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {cancelSubmitted 
                    ? 'We have received your cancellation request'
                    : 'We\'re sorry to see you go'}
                </p>
              </div>

              {cancelSubmitted ? (
                <div className="p-6 space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-300 font-semibold text-sm">Request Received</p>
                        <p className="text-green-200/70 text-xs mt-1">
                          Your cancellation will be processed within 30 days. You'll receive a confirmation email shortly.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span>Your membership remains active for 30 more days</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => { setShowCancelModal(false); setCancelSubmitted(false); setCancelReason(''); }}
                    className="w-full py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* 30-day notice warning */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-orange-300 font-semibold text-sm">30-Day Notice Required</p>
                        <p className="text-orange-200/70 text-xs mt-1">
                          As per our terms, cancellations require 30 days advance notice. Your membership and all features will remain active during this period.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reason input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Why are you cancelling? (Optional)
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Tell us how we could improve..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* What you'll lose */}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-slate-300 text-sm font-semibold mb-2">What you'll lose:</p>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        Extended daily message limits
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        Screenshot analysis feature
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        Access to Intimacy Coach
                      </li>
                    </ul>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        console.log('Cancellation requested:', { userId, reason: cancelReason });
                        setCancelSubmitted(true);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30"
                    >
                      Confirm Cancellation Request
                    </Button>
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="w-full py-3 text-slate-400 hover:text-white text-sm font-medium transition-all"
                    >
                      Keep My Membership
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

        {/* Saved Items Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            {/* Saved Venues (from Events page) */}
            {localFavorites.venues.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Music className="w-5 h-5 text-yellow-400" />
                  Saved Venues ({localFavorites.venues.length})
                </h2>
                <div className="space-y-3">
                  {localFavorites.venues.map((venue) => (
                    <Card key={venue.id || venue.name} className="bg-slate-800/80 border-yellow-500/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-1">{venue.name}</h3>
                          <p className="text-slate-300 text-sm mb-2">{venue.description}</p>
                          {venue.location && (
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {venue.location}
                            </p>
                          )}
                          {venue.rating && (
                            <p className="text-yellow-400 text-xs flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              {venue.rating}
                            </p>
                          )}
                          <p className="text-slate-500 text-xs mt-2">
                            Saved: {new Date(venue.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {venue.googleMapsLink && (
                            <a
                              href={venue.googleMapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              removeVenueFavorite(venue.id || venue.name);
                              setLocalFavorites(getFavorites());
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Date Ideas */}
            {localFavorites.dateIdeas.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  Saved Date Ideas ({localFavorites.dateIdeas.length})
                </h2>
                <div className="space-y-3">
                  {localFavorites.dateIdeas.map((idea) => (
                    <Card key={idea.id} className="bg-slate-800/80 border-pink-500/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-1">{idea.title || idea.name}</h3>
                          <p className="text-slate-300 text-sm mb-2">{idea.description}</p>
                          {idea.location && (
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {idea.location}
                            </p>
                          )}
                          <p className="text-slate-500 text-xs mt-2">
                            Saved: {new Date(idea.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeDateIdeaFavorite(idea.id);
                            setLocalFavorites(getFavorites());
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
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
              <div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-rose-400" />
                  Saved Gifts ({localFavorites.gifts.length})
                </h2>
                <div className="space-y-3">
                  {localFavorites.gifts.map((gift) => (
                    <Card key={gift.id} className="bg-slate-800/80 border-rose-500/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-1">{gift.name}</h3>
                          <p className="text-slate-300 text-sm mb-2">{gift.description}</p>
                          {gift.price && (
                            <p className="text-rose-400 font-semibold text-sm">{gift.price}</p>
                          )}
                          <p className="text-slate-500 text-xs mt-2">
                            Saved: {new Date(gift.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeGiftFavorite(gift.id);
                            setLocalFavorites(getFavorites());
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
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
              <div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Saved Tips ({localFavorites.tips.length})
                </h2>
                <div className="space-y-3">
                  {localFavorites.tips.map((tip) => (
                    <Card key={tip.id} className="bg-slate-800/80 border-amber-500/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-1">{tip.title || 'Tip'}</h3>
                          <p className="text-slate-300 text-sm">{tip.content}</p>
                          <p className="text-slate-500 text-xs mt-2">
                            Saved: {new Date(tip.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeTipFavorite(tip.id);
                            setLocalFavorites(getFavorites());
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {localFavorites.venues.length === 0 && localFavorites.dateIdeas.length === 0 && localFavorites.gifts.length === 0 && localFavorites.tips.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Saved Items Yet</h3>
                <p className="text-slate-400 text-sm mb-6">Start saving dates, gifts, and tips you love!</p>
                <Button
                  onClick={() => window.location.href = '/dates'}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold px-6 py-3 rounded-xl"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Explore Date Ideas
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Upgrade Modal */}
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)}
          onSelectPlan={() => setShowUpgradeModal(false)}
        />
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
