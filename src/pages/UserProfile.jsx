import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, Award, Target, Zap, Calendar, MessageSquare, Heart, Star, Trophy, Flame,
  User, Crown, Shield, LogOut, Bookmark, Settings, MapPin, Globe, Check, CreditCard, Trash2,
  AlertTriangle, Download, Mail, HelpCircle, FileText, XCircle, X, Sparkles, ChevronRight,
  Edit3, Gift, Clock, ArrowUpRight, Gem, Rocket, Medal
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getLocalizedCountryName, getCountryByCode, countries } from '@/config/countries';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { getFavorites, removeVenueFavorite, removeDateIdeaFavorite, removeTipFavorite, removeGiftFavorite } from '@/utils/favorites';
import SubscriptionModal from '@/components/SubscriptionModal';
import SubscriptionManager, { 
  SUBSCRIPTION_TIERS, 
  getRemainingCredits, 
  getDailyRemainingCredits 
} from '@/components/SubscriptionManager';
import { getProfile, saveProfile, defaultProfile } from '@/utils/profileMemory';
import { getWeeklyActivity, getAllStats, getWeekDayLabels } from '@/utils/activityTracker';

export default function UserProfile({ onLogout }) {
  const { t, i18n } = useTranslation();
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
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [currentSubscriptionTier, setCurrentSubscriptionTier] = useState(localStorage.getItem('subscriptionTier') || 'trial');
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'achievements', 'saved', 'settings'
  const [userCountry, setUserCountry] = useState(localStorage.getItem('userCountry') || 'AL');
  const [userCity, setUserCity] = useState(localStorage.getItem('userCity') || '');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(localStorage.getItem('userName') || '');
  const [nameSaved, setNameSaved] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [cancelSubmitted, setCancelSubmitted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Co-Pilot Profile state
  const [copilotProfile, setCopilotProfile] = useState(defaultProfile());
  const [profileSaved, setProfileSaved] = useState(false);

  const backendUrl = getBackendUrl();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    fetchData();
    trackUserActivity();
    
    const storedProfile = getProfile();
    setCopilotProfile(storedProfile);
    
    const handleFavoritesChanged = () => {
      setLocalFavorites(getFavorites());
    };
    window.addEventListener('favoritesChanged', handleFavoritesChanged);
    
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChanged);
    };
  }, []);

  const trackUserActivity = () => {
    localStorage.setItem('lastActive', new Date().toISOString());
    const profileViews = parseInt(localStorage.getItem('profileViews') || '0') + 1;
    localStorage.setItem('profileViews', profileViews.toString());
  };

  const fetchData = async () => {
    try {
      const savedStats = localStorage.getItem('userProgressStats');
      const trackedStats = getAllStats();
      
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setStats({
          ...parsedStats,
          ...trackedStats,
          totalMessages: Math.max(parsedStats.totalMessages || 0, trackedStats.totalMessages),
          messagesThisWeek: trackedStats.messagesThisWeek
        });
      } else {
        setStats(trackedStats);
      }
      
      setWeeklyActivity(getWeeklyActivity());

      const usageRes = await fetch(`${backendUrl}/api/usage`, {
        headers: { 'x-user-id': userId }
      });
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
        
        if (usageData.dailyUsage) {
          setStats(prev => ({
            ...prev,
            totalMessages: usageData.dailyUsage.messages || prev.totalMessages,
            level: Math.floor((usageData.dailyUsage.messages || 0) / 10) + 1
          }));
        }
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
    
    window.dispatchEvent(new CustomEvent('countryChanged', { 
      detail: { countryCode: userCountry } 
    }));
  };

  const handleRemoveFavorite = (type, item) => {
    try {
      if (type === 'venue') removeVenueFavorite(item);
      else if (type === 'dateIdea') removeDateIdeaFavorite(item);
      else if (type === 'tip') removeTipFavorite(item);
      else if (type === 'gift') removeGiftFavorite(item);
      setLocalFavorites(getFavorites());
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleCancellationRequest = async () => {
    if (!cancelReason) {
      alert('Please select a reason for cancellation');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/subscription/cancel-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          userId,
          userName,
          userEmail,
          reason: cancelReason,
          feedback: cancelFeedback,
          requestDate: new Date().toISOString(),
          currentTier
        })
      });

      if (response.ok) {
        setCancelSubmitted(true);
        setTimeout(() => {
          setShowCancelModal(false);
          setCancelReason('');
          setCancelFeedback('');
          setCancelSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting cancellation:', error);
      const cancellationRequest = {
        userId, userName, userEmail,
        reason: cancelReason, feedback: cancelFeedback,
        requestDate: new Date().toISOString(), status: 'pending'
      };
      localStorage.setItem('cancellationRequest', JSON.stringify(cancellationRequest));
      setCancelSubmitted(true);
      setTimeout(() => {
        setShowCancelModal(false);
        setCancelReason('');
        setCancelFeedback('');
        setCancelSubmitted(false);
      }, 3000);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete my account') {
      alert('Please type exactly: delete my account');
      return;
    }

    if (!window.confirm('This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/user/delete-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          userId, userName, userEmail, requestDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Account deletion request submitted.');
        setShowDeleteModal(false);
        setTimeout(() => { if (onLogout) onLogout(); }, 2000);
      }
    } catch (error) {
      console.error('Error submitting account deletion:', error);
      alert('Failed to submit deletion request. Contact support@biseda.ai');
    }
  };

  const handleExportData = async () => {
    try {
      const userData = {
        profile: { name: userName, email: userEmail, tier: currentTier, country: userCountry, city: userCity },
        stats, favorites: localFavorites, usage, exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biseda-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('Your data has been exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getTierInfo = (tier) => {
    const tiers = {
      trial: { name: t('subscription.freeTrial', 'Free Trial'), color: 'from-emerald-500 to-teal-500', icon: Sparkles, bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
      free_trial: { name: t('subscription.freeTrial', 'Free Trial'), color: 'from-emerald-500 to-teal-500', icon: Sparkles, bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
      starter: { name: t('subscription.starter', 'Starter'), color: 'from-blue-500 to-indigo-500', icon: Zap, bg: 'bg-blue-500/20', border: 'border-blue-500/40' },
      pro: { name: t('subscription.pro', 'Pro'), color: 'from-purple-500 to-pink-500', icon: Star, bg: 'bg-purple-500/20', border: 'border-purple-500/40' },
      elite: { name: t('subscription.elite', 'Elite'), color: 'from-amber-500 to-orange-500', icon: Crown, bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
      expired: { name: t('subscription.expired', 'Expired'), color: 'from-red-500 to-rose-500', icon: XCircle, bg: 'bg-red-500/20', border: 'border-red-500/40' }
    };
    return tiers[tier] || tiers.trial;
  };

  const currentTier = currentSubscriptionTier || usage?.tier || localStorage.getItem('subscriptionTier') || 'trial';
  const tierInfo = getTierInfo(currentTier);
  const tierConfig = SUBSCRIPTION_TIERS[currentTier] || SUBSCRIPTION_TIERS.trial;
  const TierIcon = tierInfo.icon;
  const currentCountry = getCountryByCode(userCountry);
  const totalFavorites = localFavorites.venues.length + localFavorites.dateIdeas.length + localFavorites.tips.length + localFavorites.gifts.length;

  // Achievements with progress tracking
  const achievements = [
    { id: 'first_chat', title: t('achievements.firstChat', 'First Steps'), desc: t('achievements.firstChatDesc', 'Sent your first message'), icon: '💬', unlocked: stats.totalMessages >= 1, progress: Math.min(stats.totalMessages, 1), target: 1 },
    { id: 'first_rehearsal', title: t('achievements.firstRehearsal', 'Stage Ready'), desc: t('achievements.firstRehearsalDesc', 'Completed first rehearsal'), icon: '🎭', unlocked: stats.rehearsalsSessions >= 1, progress: Math.min(stats.rehearsalsSessions, 1), target: 1 },
    { id: 'getting_started', title: t('achievements.gettingStarted', 'Getting Warmed Up'), desc: t('achievements.gettingStartedDesc', 'Sent 5 messages'), icon: '⚡', unlocked: stats.totalMessages >= 5, progress: Math.min(stats.totalMessages, 5), target: 5 },
    { id: 'active_learner', title: t('achievements.activeLearner', 'Active Learner'), desc: t('achievements.activeLearnerDesc', 'Sent 15 messages'), icon: '📖', unlocked: stats.totalMessages >= 15, progress: Math.min(stats.totalMessages, 15), target: 15 },
    { id: 'practice_mode', title: t('achievements.practiceMode', 'Practice Makes Perfect'), desc: t('achievements.practiceModeDesc', 'Did 3 rehearsals'), icon: '🎯', unlocked: stats.rehearsalsSessions >= 3, progress: Math.min(stats.rehearsalsSessions, 3), target: 3 },
    { id: 'confident', title: t('achievements.confident', 'Confidence Boost'), desc: t('achievements.confidentDesc', 'Sent 30 messages'), icon: '💪', unlocked: stats.totalMessages >= 30, progress: Math.min(stats.totalMessages, 30), target: 30 },
    { id: 'rehearsal_pro', title: t('achievements.rehearsalPro', 'Rehearsal Pro'), desc: t('achievements.rehearsalProDesc', 'Did 10 rehearsals'), icon: '🌟', unlocked: stats.rehearsalsSessions >= 10, progress: Math.min(stats.rehearsalsSessions, 10), target: 10 },
    { id: 'streak_3', title: t('achievements.streak3', 'On Fire'), desc: t('achievements.streak3Desc', '3 day streak'), icon: '🔥', unlocked: stats.currentStreak >= 3, progress: Math.min(stats.currentStreak, 3), target: 3 },
    { id: 'streak_7', title: t('achievements.streak7', 'Week Warrior'), desc: t('achievements.streak7Desc', '7 day streak'), icon: '💎', unlocked: stats.currentStreak >= 7, progress: Math.min(stats.currentStreak, 7), target: 7 },
    { id: 'dating_expert', title: t('achievements.datingExpert', 'Dating Expert'), desc: t('achievements.datingExpertDesc', 'Sent 50+ messages'), icon: '🏆', unlocked: stats.totalMessages >= 50, progress: Math.min(stats.totalMessages, 50), target: 50 },
    { id: 'saved_places', title: t('achievements.savedPlaces', 'Explorer'), desc: t('achievements.savedPlacesDesc', 'Saved 3+ places'), icon: '🗺️', unlocked: totalFavorites >= 3, progress: Math.min(totalFavorites, 3), target: 3 },
    { id: 'master', title: t('achievements.master', 'Biseda Master'), desc: t('achievements.masterDesc', '100+ messages'), icon: '👑', unlocked: stats.totalMessages >= 100, progress: Math.min(stats.totalMessages, 100), target: 100 }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercent = (unlockedCount / achievements.length) * 100;
  const weekDays = getWeekDayLabels(i18n.language);
  const maxActivity = Math.max(...weeklyActivity, 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm">{t('common.loading', 'Loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950">
      {/* Hero Profile Header */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative px-5 pt-2 pb-8">
          {/* Top Actions */}
          <div className="flex justify-between items-center mb-6">
            {localStorage.getItem('adminImpersonating') === 'true' && (
              <button
                onClick={() => {
                  localStorage.removeItem('userId');
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('userName');
                  localStorage.removeItem('userSubscriptionTier');
                  localStorage.removeItem('adminImpersonating');
                  localStorage.removeItem('adminOriginalUserId');
                  window.location.hash = '#/admin';
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white text-sm font-bold shadow-lg"
              >
                🚪 Exit Admin View
              </button>
            )}
            <div className="flex-1"></div>
            <button
              onClick={onLogout}
              className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-20 h-20 bg-gradient-to-br ${tierInfo.color} rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30`}>
                <span className="text-3xl font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Tier Badge */}
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br ${tierInfo.color} rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-950`}>
                <TierIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {!isEditingName ? (
                  <>
                    <h1 className="text-2xl font-bold text-white">{userName}</h1>
                    <button
                      onClick={() => { setEditedName(userName); setIsEditingName(true); }}
                      className="p-1 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-white/60" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-bold w-40"
                      autoFocus
                    />
                    <button
                      onClick={async () => {
                        if (editedName.trim()) {
                          try {
                            // Save to backend first
                            const response = await fetch(`${backendUrl}/api/user/profile`, {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json',
                                'x-user-id': userId 
                              },
                              body: JSON.stringify({ name: editedName.trim() })
                            });
                            
                            if (response.ok) {
                              // Only update localStorage after successful backend save
                              localStorage.setItem('userName', editedName.trim());
                              setNameSaved(true);
                              setIsEditingName(false);
                              setTimeout(() => setNameSaved(false), 2000);
                              window.location.reload();
                            } else {
                              console.error('Failed to save name to backend');
                              // Still save locally as fallback
                              localStorage.setItem('userName', editedName.trim());
                              setIsEditingName(false);
                              window.location.reload();
                            }
                          } catch (error) {
                            console.error('Error saving name:', error);
                            // Save locally as fallback
                            localStorage.setItem('userName', editedName.trim());
                            setIsEditingName(false);
                            window.location.reload();
                          }
                        }
                      }}
                      className="p-1.5 bg-green-500 rounded-lg"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => setIsEditingName(false)} className="p-1.5 bg-red-500/50 rounded-lg">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-white/60 text-sm mb-2">{userEmail}</p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${tierInfo.bg} border ${tierInfo.border}`}>
                <TierIcon className="w-3.5 h-3.5 text-white" />
                <span className="text-sm font-semibold text-white">{tierInfo.name}</span>
              </div>
            </div>
          </div>

          {/* Credits Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-purple-300" />
                <span className="text-white font-semibold">{t('subscription.creditsLeft', 'Credits')}</span>
              </div>
              <button
                onClick={() => setShowSubscriptionManager(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all"
              >
                {currentTier === 'elite' ? t('subscription.manage', 'Manage') : t('subscription.upgradePlan', 'Upgrade')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{getRemainingCredits()}</span>
                  <span className="text-white/50 text-sm">/ {tierConfig?.credits || 50}</span>
                </div>
                <p className="text-purple-200 text-xs mt-1">{t('subscription.totalCredits', 'Total')}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{getDailyRemainingCredits()}</span>
                  <span className="text-white/50 text-sm">/ {tierConfig?.dailyLimit || 20}</span>
                </div>
                <p className="text-pink-200 text-xs mt-1">{t('subscription.dailyLeft', 'Today')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-5 -mt-3">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-800/50 flex gap-1">
          {[
            { id: 'overview', label: t('userProfile.overview', 'Overview'), icon: TrendingUp },
            { id: 'achievements', label: t('userProfile.badges', 'Badges'), icon: Trophy },
            { id: 'saved', label: `${t('userProfile.saved', 'Saved')} (${totalFavorites})`, icon: Bookmark },
            { id: 'settings', label: t('userProfile.settings', 'Settings'), icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-5 py-6 pb-4 space-y-5">
        
        {/* OVERVIEW TAB */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('userProfile.totalMessages', 'Messages'), value: usage?.dailyUsage?.messages || stats.totalMessages, icon: MessageSquare, gradient: 'from-purple-500 to-pink-500' },
                { label: t('userProfile.thisWeek', 'This Week'), value: stats.messagesThisWeek, icon: Zap, gradient: 'from-blue-500 to-cyan-500' },
                { label: t('userProfile.rehearsals', 'Rehearsals'), value: stats.rehearsalsSessions, icon: Target, gradient: 'from-orange-500 to-red-500' },
                { label: t('userProfile.level', 'Level'), value: stats.level, icon: Star, gradient: 'from-amber-500 to-yellow-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4 relative overflow-hidden group hover:border-slate-700/50 transition-all">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full transform translate-x-6 -translate-y-6 group-hover:opacity-20 transition-opacity`}></div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white font-bold">{t('userProfile.weeklyActivity', 'Weekly Activity')}</h3>
                </div>
                <div className="flex items-center gap-1 text-orange-400 text-sm font-semibold">
                  <Flame className="w-4 h-4" />
                  <span>{stats.currentStreak} {t('userProfile.dayStreak', 'day streak')}</span>
                </div>
              </div>
              
              <div className="flex items-end justify-between gap-2 h-36">
                {weeklyActivity.map((activity, i) => {
                  const height = Math.max((activity / maxActivity) * 100, 8);
                  const isToday = i === new Date().getDay();
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                        <div 
                          className={`w-full max-w-[36px] rounded-xl transition-all duration-500 ${
                            isToday 
                              ? 'bg-gradient-to-t from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30' 
                              : activity > 0 
                                ? 'bg-gradient-to-t from-slate-600 to-slate-500' 
                                : 'bg-slate-800'
                          }`}
                          style={{ height: `${height}%` }}
                        >
                          {activity > 0 && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white">
                              {activity}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${isToday ? 'text-purple-400' : 'text-slate-500'}`}>
                        {weekDays[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                {t('userProfile.quickActions', 'Quick Actions')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { to: '/copilot', icon: MessageSquare, label: t('nav.home', 'Ask Biseda'), color: 'from-purple-500 to-pink-500' },
                  { to: '/rehearsal', icon: Target, label: t('nav.rehearsal', 'Rehearsal'), color: 'from-blue-500 to-cyan-500' },
                  { to: '/explore', icon: MapPin, label: t('nav.dateAndEvents', 'Date Spots'), color: 'from-orange-500 to-red-500' },
                  { to: '/gifts', icon: Gift, label: t('tools.gifts', 'Gifts'), color: 'from-pink-500 to-rose-500' }
                ].map((action) => (
                  <Link key={action.to} to={action.to}>
                    <div className={`bg-gradient-to-br ${action.color} rounded-2xl p-4 hover:opacity-90 transition-all active:scale-95 shadow-lg`}>
                      <action.icon className="w-6 h-6 text-white mb-2" />
                      <span className="text-white font-semibold text-sm">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeSection === 'achievements' && (
          <>
            {/* Progress Overview */}
            <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-2xl border border-amber-500/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{t('userProfile.achievements', 'Achievements')}</h3>
                    <p className="text-amber-200/70 text-sm">{unlockedCount} / {achievements.length} {t('userProfile.unlocked', 'unlocked')}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-400">{Math.round(progressPercent)}%</div>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative overflow-hidden rounded-2xl border transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30'
                      : 'bg-slate-900/50 border-slate-800/50 opacity-60'
                  }`}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                      achievement.unlocked ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30' : 'bg-slate-800'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <span className="flex items-center gap-1 text-xs text-green-400 font-semibold bg-green-500/20 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mt-0.5">{achievement.desc}</p>
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-slate-400 font-medium">{achievement.progress} / {achievement.target}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                              style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SAVED TAB */}
        {activeSection === 'saved' && (
          <>
            {totalFavorites === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{t('userProfile.noSaved', 'No Saved Items')}</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  {t('userProfile.noSavedDesc', 'Start exploring and save your favorite venues, tips, and gift ideas!')}
                </p>
                <Link to="/explore">
                  <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:opacity-90 transition-all">
                    {t('userProfile.startExploring', 'Start Exploring')}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Venues */}
                {localFavorites.venues.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      {t('userProfile.savedVenues', 'Venues')} ({localFavorites.venues.length})
                    </h3>
                    <div className="space-y-2">
                      {localFavorites.venues.map((venue, index) => (
                        <div key={index} className="bg-slate-900/60 rounded-xl border border-slate-800/50 p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{venue.name}</h4>
                            <p className="text-slate-400 text-sm">{venue.description || venue.location}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFavorite('venue', venue)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {localFavorites.tips.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-rose-400" />
                      {t('userProfile.savedTips', 'Tips')} ({localFavorites.tips.length})
                    </h3>
                    <div className="space-y-2">
                      {localFavorites.tips.map((tip, index) => (
                        <div key={index} className="bg-slate-900/60 rounded-xl border border-slate-800/50 p-4 flex items-center justify-between">
                          <p className="text-slate-300 text-sm flex-1">{tip.content || tip.text || tip.title}</p>
                          <button
                            onClick={() => handleRemoveFavorite('tip', tip)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all ml-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gifts */}
                {localFavorites.gifts.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-yellow-400" />
                      {t('userProfile.savedGifts', 'Gift Ideas')} ({localFavorites.gifts.length})
                    </h3>
                    <div className="space-y-2">
                      {localFavorites.gifts.map((gift, index) => (
                        <div key={index} className="bg-slate-900/60 rounded-xl border border-slate-800/50 p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{gift.name || gift.title}</h4>
                            {gift.description && <p className="text-slate-400 text-sm mt-1">{gift.description}</p>}
                          </div>
                          <button
                            onClick={() => handleRemoveFavorite('gift', gift)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all ml-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {activeSection === 'settings' && (
          <div className="space-y-4">
            {/* Location */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{t('userProfile.location', 'Location')}</h3>
                    <p className="text-slate-400 text-sm">{currentCountry?.flag} {getLocalizedCountryName(userCountry)}{userCity ? `, ${userCity}` : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingLocation(!isEditingLocation)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all"
                >
                  {isEditingLocation ? t('common.cancel', 'Cancel') : t('common.edit', 'Edit')}
                </button>
              </div>
              
              {isEditingLocation && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <select
                    value={userCountry}
                    onChange={(e) => setUserCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.nameEn}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={userCity}
                    onChange={(e) => setUserCity(e.target.value)}
                    placeholder={t('userProfile.enterCity', 'Enter city (optional)')}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                  <button
                    onClick={handleSaveLocation}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:opacity-90 transition-all"
                  >
                    {t('common.save', 'Save')} {t('userProfile.location', 'Location')}
                  </button>
                </div>
              )}
            </div>

            {/* Co-Pilot Preferences */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{t('userProfile.copilotPrefs', 'AI Preferences')}</h3>
                  <p className="text-slate-400 text-sm">{t('userProfile.copilotPrefsDesc', 'Customize your AI experience')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block font-medium">{t('userProfile.commStyle', 'Communication Style')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Direct', 'Playful', 'Calm', 'Romantic'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setCopilotProfile(prev => ({ ...prev, communicationStyle: style }))}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          copilotProfile.communicationStyle === style
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {style === 'Direct' && '🎯 '}
                        {style === 'Playful' && '😄 '}
                        {style === 'Calm' && '🧘 '}
                        {style === 'Romantic' && '💕 '}
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block font-medium">{t('userProfile.datingGoal', 'Dating Goal')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Casual', 'Serious', 'Unsure'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setCopilotProfile(prev => ({ ...prev, datingGoal: goal }))}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          copilotProfile.datingGoal === goal
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {goal === 'Casual' && '🎉 '}
                        {goal === 'Serious' && '💍 '}
                        {goal === 'Unsure' && '🤔 '}
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    saveProfile(copilotProfile);
                    setProfileSaved(true);
                    setTimeout(() => setProfileSaved(false), 2000);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {profileSaved ? (
                    <>
                      <Check className="w-5 h-5" />
                      {t('common.saved', 'Saved!')}
                    </>
                  ) : (
                    t('common.savePreferences', 'Save Preferences')
                  )}
                </button>
              </div>
            </div>

            {/* Privacy & Data */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold">{t('userProfile.privacy', 'Privacy & Data')}</h3>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={handleExportData}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium text-sm">{t('userProfile.exportData', 'Export My Data')}</div>
                      <div className="text-slate-500 text-xs">{t('userProfile.exportDataDesc', 'Download in JSON format')}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>

                <Link to="/privacy">
                  <button className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium text-sm">{t('legal.privacyPolicy', 'Privacy Policy')}</div>
                        <div className="text-slate-500 text-xs">{t('userProfile.readPrivacy', 'Read our privacy policy')}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold">{t('userProfile.support', 'Help & Support')}</h3>
              </div>
              
              <a
                href="mailto:support@biseda.ai"
                className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium text-sm">{t('userProfile.contactSupport', 'Contact Support')}</div>
                    <div className="text-slate-500 text-xs">support@biseda.ai</div>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-600" />
              </a>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 rounded-2xl border border-red-500/20 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-red-400 font-bold">{t('userProfile.dangerZone', 'Danger Zone')}</h3>
                  <p className="text-red-400/60 text-xs">{t('userProfile.dangerZoneDesc', 'Irreversible actions')}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-left transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-red-400 font-medium text-sm">{t('userProfile.deleteAccount', 'Delete Account')}</div>
                    <div className="text-red-400/60 text-xs">{t('userProfile.deleteAccountDesc', 'Permanently delete all data')}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400/50" />
              </button>
            </div>

            {/* App Info */}
            <div className="text-center pt-4">
              <p className="text-slate-600 text-xs">Biseda.ai v1.0 • Made with ❤️ by Emilio Gashi</p>
              <p className="text-slate-700 text-xs mt-1">© 2025 All rights reserved</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Delete Account
              </h3>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-red-300 text-sm font-semibold mb-2">⚠️ Warning: This cannot be undone!</p>
              <ul className="text-red-300/80 text-sm space-y-1">
                <li>• All data permanently deleted</li>
                <li>• Saved items and progress lost</li>
                <li>• Subscription cancelled</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Type <span className="font-bold text-red-400">delete my account</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="delete my account"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAccountDeletion}
                  disabled={deleteConfirmText.toLowerCase() !== 'delete my account'}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modals */}
      <SubscriptionModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={(result) => {
          console.log('Subscription upgraded:', result);
          fetchData();
        }}
      />
      
      <SubscriptionManager
        isOpen={showSubscriptionManager}
        onClose={() => setShowSubscriptionManager(false)}
        currentTier={currentTier}
        onTierChange={(newTier) => {
          setCurrentSubscriptionTier(newTier);
          fetchData();
        }}
      />
    </div>
  );
}
