import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, Award, Target, Zap, Calendar, MessageSquare, Heart, Star, Trophy, Flame,
  User, Crown, Shield, LogOut, Bookmark, Settings, MapPin, Globe, Check, CreditCard, Trash2,
  AlertTriangle, Download, Mail, HelpCircle, FileText, XCircle, X, Sparkles
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

export default function UserProfile({ onLogout }) {
  const { t } = useTranslation();
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
  const [activeSection, setActiveSection] = useState('progress'); // 'progress', 'saved', 'settings'
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
    trackUserActivity(); // Track that user visited profile
    
    // Load Co-Pilot profile
    const storedProfile = getProfile();
    setCopilotProfile(storedProfile);
    
    // Listen for favorites changes
    const handleFavoritesChanged = () => {
      setLocalFavorites(getFavorites());
    };
    window.addEventListener('favoritesChanged', handleFavoritesChanged);
    
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChanged);
    };
  }, []);

  const trackUserActivity = () => {
    // Update last active timestamp
    localStorage.setItem('lastActive', new Date().toISOString());
    
    // Increment profile views
    const profileViews = parseInt(localStorage.getItem('profileViews') || '0') + 1;
    localStorage.setItem('profileViews', profileViews.toString());
  };

  const fetchData = async () => {
    try {
      // Load stats from localStorage
      const savedStats = localStorage.getItem('userProgressStats');
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      } else {
        // Initialize default stats
        const defaultStats = {
          totalMessages: 0,
          messagesThisWeek: 0,
          datesPlanned: 0,
          rehearsalsSessions: 0,
          tipsViewed: 0,
          photosFeedback: 0,
          conversationStartersUsed: 0,
          currentStreak: 0,
          level: 1
        };
        setStats(defaultStats);
        localStorage.setItem('userProgressStats', JSON.stringify(defaultStats));
      }

      // Calculate real weekly activity from user actions
      const calculateWeeklyActivity = () => {
        const activity = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const dayDate = new Date(today);
          dayDate.setDate(today.getDate() - i);
          const dayKey = `activity_${dayDate.toISOString().split('T')[0]}`;
          const dayActivity = parseInt(localStorage.getItem(dayKey) || '0');
          activity.push(dayActivity);
        }
        
        return activity;
      };
      
      setWeeklyActivity(calculateWeeklyActivity());

      // Fetch usage stats from backend
      const usageRes = await fetch(`${backendUrl}/api/usage`, {
        headers: { 'x-user-id': userId }
      });
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
        
        // Update stats from backend
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
      } else {
        alert('Failed to submit cancellation request. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error submitting cancellation:', error);
      // Still save locally as backup
      const cancellationRequest = {
        userId,
        userName,
        userEmail,
        reason: cancelReason,
        feedback: cancelFeedback,
        requestDate: new Date().toISOString(),
        status: 'pending'
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

    if (!window.confirm('This action cannot be undone. Are you absolutely sure you want to delete your account?')) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/user/delete-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          userId,
          userName,
          userEmail,
          requestDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Account deletion request submitted. You will receive an email confirmation within 24 hours.');
        setShowDeleteModal(false);
        // Logout after deletion request
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 2000);
      } else {
        alert('Failed to submit deletion request. Please contact support@biseda.ai');
      }
    } catch (error) {
      console.error('Error submitting account deletion:', error);
      alert('Failed to submit deletion request. Please contact support@biseda.ai');
    }
  };

  const handleExportData = async () => {
    try {
      const userData = {
        profile: {
          name: userName,
          email: userEmail,
          tier: currentTier,
          country: userCountry,
          city: userCity
        },
        stats,
        favorites: localFavorites,
        usage,
        exportDate: new Date().toISOString()
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
      alert('Failed to export data. Please try again.');
    }
  };

  const getTierBadge = (tier) => {
    switch(tier) {
      case 'trial':
      case 'free_trial':
      case 'free':
        return { 
          label: t('subscription.freeTrial', 'Free Trial'), 
          color: 'bg-green-500/20 text-green-300 border-green-500/30', 
          icon: Sparkles 
        };
      case 'starter':
        return { 
          label: t('subscription.starter', 'Starter'), 
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', 
          icon: Zap 
        };
      case 'pro':
        return { 
          label: t('subscription.pro', 'Pro'), 
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', 
          icon: Star 
        };
      case 'elite':
        return { 
          label: t('subscription.elite', 'Elite'), 
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', 
          icon: Crown 
        };
      case 'expired':
        return { 
          label: t('subscription.expired', 'Expired'), 
          color: 'bg-red-500/20 text-red-300 border-red-500/30', 
          icon: XCircle 
        };
      default:
        return { 
          label: t('subscription.freeTrial', 'Free Trial'), 
          color: 'bg-green-500/20 text-green-300 border-green-500/30', 
          icon: Sparkles 
        };
    }
  };

  const currentTier = currentSubscriptionTier || usage?.tier || localStorage.getItem('subscriptionTier') || 'trial';
  const tierBadge = getTierBadge(currentTier);
  const tierConfig = SUBSCRIPTION_TIERS[currentTier] || SUBSCRIPTION_TIERS.trial;
  const TierIcon = tierBadge.icon;
  const currentCountry = getCountryByCode(userCountry);

  // Fun achievements to unlock!
  const achievements = [
    { id: 'first_message', title: 'Hello World 👋', desc: 'Started your first chat', icon: '🎯', unlocked: stats.totalMessages > 0 },
    { id: 'conversationalist', title: 'Chatterbox', desc: 'Sent 50+ messages', icon: '💬', unlocked: stats.totalMessages >= 50 },
    { id: 'chat_master', title: 'Chat Master', desc: 'Sent 200+ messages', icon: '🏆', unlocked: stats.totalMessages >= 200 },
    { id: 'date_planner', title: 'Date Planner', desc: 'Planned 5+ dates', icon: '📅', unlocked: stats.datesPlanned >= 5 },
    { id: 'rehearsal_pro', title: 'Practice Makes Perfect', desc: 'Did 3+ rehearsals', icon: '🎭', unlocked: stats.rehearsalsSessions >= 3 },
    { id: 'smooth_talker', title: 'Smooth Operator 😎', desc: 'Used 10 convo starters', icon: '✨', unlocked: stats.conversationStartersUsed >= 10 },
    { id: 'wisdom_seeker', title: 'Knowledge Seeker', desc: 'Read 20+ tips', icon: '📚', unlocked: stats.tipsViewed >= 20 },
    { id: 'on_fire', title: 'On Fire! 🔥', desc: 'Used app 7 days straight', icon: '🔥', unlocked: stats.currentStreak >= 7 },
    { id: 'dedicated', title: 'Dedicated Dater', desc: 'Used app 30 days', icon: '💪', unlocked: stats.currentStreak >= 30 },
    { id: 'vip', title: 'VIP Status', desc: 'You have full access!', icon: '👑', unlocked: true }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercent = (unlockedCount / achievements.length) * 100;

  const statCards = [
    { label: t('userProfile.totalMessages', 'Total Messages'), value: usage?.dailyUsage?.messages || stats.totalMessages, icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
    { label: t('userProfile.thisWeek', 'This Week'), value: stats.messagesThisWeek, icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { label: t('userProfile.datesPlanned', 'Dates Planned'), value: stats.datesPlanned, icon: Calendar, color: 'from-rose-500 to-pink-500' },
    { label: t('userProfile.level', 'Level'), value: stats.level, icon: Star, color: 'from-yellow-500 to-orange-500' }
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
        <div className="flex flex-col gap-2 mt-4">
          {/* Exit Impersonation Button (Admin Only) */}
          {localStorage.getItem('adminImpersonating') === 'true' && (
            <Button
              onClick={() => {
                // Restore admin session
                const originalUserId = localStorage.getItem('adminOriginalUserId');
                const adminKey = localStorage.getItem('adminKey');
                
                // Clear user session
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
                localStorage.removeItem('userSubscriptionTier');
                localStorage.removeItem('adminImpersonating');
                localStorage.removeItem('adminOriginalUserId');
                
                // Restore admin key
                if (adminKey) {
                  localStorage.setItem('adminKey', adminKey);
                }
                
                alert('👋 Exited impersonation mode!\n\nReturning to Admin Panel...');
                
                // Redirect to admin
                window.location.hash = '#/admin';
                window.location.reload();
              }}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold py-3 rounded-xl"
            >
              🚪 Exit Impersonation (Return to Admin)
            </Button>
          )}
          
          {/* Subscription Status Card */}
          <div className={`p-3 rounded-xl border bg-gradient-to-r ${tierConfig?.color || 'from-slate-700 to-slate-600'} border-white/20`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TierIcon className="w-5 h-5 text-white" />
                <span className="text-white font-bold">{tierBadge.label}</span>
              </div>
              <button
                onClick={() => setShowSubscriptionManager(true)}
                className="text-white/80 hover:text-white text-sm underline"
              >
                {t('subscription.manage', 'Manage')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-white/60">{t('subscription.creditsLeft', 'Credits Left')}</p>
                <p className="text-white font-bold">{getRemainingCredits()} / {tierConfig?.credits || 50}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-white/60">{t('subscription.dailyLeft', 'Today')}</p>
                <p className="text-white font-bold">{getDailyRemainingCredits()} / {tierConfig?.dailyLimit || 20}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Upgrade/Manage Button */}
            <Button
              onClick={() => setShowSubscriptionManager(true)}
              className={`flex-1 font-semibold py-3 rounded-xl text-sm ${
                currentTier === 'elite' 
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              {currentTier === 'elite' 
                ? t('subscription.manageSubscription', 'Manage Subscription')
                : t('subscription.upgradePlan', 'Upgrade Plan')
              }
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="px-4 py-2 bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-slate-300 rounded-xl text-sm"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              {t('userProfile.logout', 'Logout')}
            </Button>
          </div>
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
          {t('userProfile.progress', 'Progress')}
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
          {t('userProfile.saved', 'Saved')} ({totalFavorites})
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
          {t('userProfile.settings', 'Settings')}
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
              {t('userProfile.weeklyActivity', "This Week's Activity")}
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
          {/* Name Settings */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              {t('userProfile.yourName', 'Your Name')}
            </h3>
            
            {!isEditingName ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold text-lg">{userName}</div>
                    <div className="text-slate-400 text-sm">{userEmail}</div>
                  </div>
                  <Button
                    onClick={() => {
                      setEditedName(userName);
                      setIsEditingName(true);
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm"
                  >
                    {t('common.edit', 'Edit')}
                  </Button>
                </div>
                {nameSaved && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">{t('userProfile.nameSaved', 'Name saved!')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">{t('userProfile.displayName', 'Display Name')}</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder={t('userProfile.enterName', 'Enter your name')}
                    className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-lg"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (editedName.trim()) {
                        localStorage.setItem('userName', editedName.trim());
                        setIsEditingName(false);
                        setNameSaved(true);
                        setTimeout(() => setNameSaved(false), 3000);
                        // Force re-render
                        window.location.reload();
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-2.5"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {t('common.save', 'Save')}
                  </Button>
                  <Button
                    onClick={() => setIsEditingName(false)}
                    className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Location Settings */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              {t('userProfile.yourLocation', 'Your Location')}
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

          {/* Co-Pilot Preferences */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Co-Pilot Preferences
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Personalize how the AI gives you advice. These settings affect all Co-Pilot features.
            </p>
            
            <div className="space-y-4">
              {/* Communication Style */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Communication Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Direct', 'Playful', 'Calm', 'Romantic'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setCopilotProfile(prev => ({ ...prev, communicationStyle: style }))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        copilotProfile.communicationStyle === style
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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

              {/* Dating Goal */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Dating Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Casual', 'Serious', 'Unsure'].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setCopilotProfile(prev => ({ ...prev, datingGoal: goal }))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        copilotProfile.datingGoal === goal
                          ? 'bg-pink-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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

              {/* Boundaries */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Boundaries (Optional)</label>
                <textarea
                  value={copilotProfile.boundaries}
                  onChange={(e) => setCopilotProfile(prev => ({ ...prev, boundaries: e.target.value }))}
                  placeholder="E.g., 'No physical escalation on first date', 'Take things slow', 'No late-night texts'"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none h-20"
                />
                <p className="text-slate-500 text-xs mt-1">The AI will respect these when giving advice</p>
              </div>

              {/* Save Button */}
              <Button
                onClick={() => {
                  saveProfile(copilotProfile);
                  setProfileSaved(true);
                  setTimeout(() => setProfileSaved(false), 2000);
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2.5 rounded-xl font-semibold"
              >
                {profileSaved ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Saved!
                  </span>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </Card>

          {/* Subscription Management */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Subscription
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${tierBadge.color} mb-2`}>
                    <TierIcon className="w-4 h-4" />
                    <span className="text-sm font-bold">{tierBadge.label} Plan</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {currentTier === 'free' ? 'Upgrade to unlock premium features' : 'Manage your subscription'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {(currentTier === 'free' || currentTier === 'free_trial' || currentTier === 'expired') ? (
                  <Button
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2.5 rounded-xl text-sm font-semibold"
                  >
                    <Crown className="w-4 h-4 mr-1.5" />
                    {t('subscription.upgradeNow', 'Upgrade Now')}
                  </Button>
                ) : (
                  <>
                    {/* Show upgrade button if not on Elite (top tier) */}
                    {currentTier !== 'elite' && (
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2.5 rounded-xl text-sm font-semibold"
                      >
                        <Crown className="w-4 h-4 mr-1.5" />
                        {t('subscription.upgrade', 'Upgrade')}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        // Open Apple subscription management
                        window.location.href = 'itms-apps://apps.apple.com/account/subscriptions';
                      }}
                      className={`${currentTier === 'elite' ? 'flex-1' : ''} px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold`}
                    >
                      {t('subscription.manageSubscription', 'Manage')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Data & Privacy */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Data & Privacy
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleExportData}
                className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-sm font-semibold">Export My Data</div>
                    <div className="text-xs text-slate-400">Download all your data in JSON format</div>
                  </div>
                </div>
              </button>

              <Link to="/privacy">
                <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-left transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm font-semibold">Privacy Policy</div>
                      <div className="text-xs text-slate-400">Read our privacy policy</div>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </Card>

          {/* Support Resources */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              Support Resources
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Additional guidance for sensitive topics
            </p>
            <div className="space-y-2">
              <Link to="/intimacycoach">
                <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-left transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Communication Coach</div>
                      <div className="text-xs text-slate-400">Guidance on healthy communication</div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-full">
                      <Crown className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] text-purple-400 font-semibold">PRO</span>
                    </div>
                  </div>
                </button>
              </Link>
              <Link to="/breakupcoach">
                <button className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-left transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Breakup Recovery</div>
                      <div className="text-xs text-slate-400">Support for moving forward</div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-full">
                      <Crown className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] text-purple-400 font-semibold">PRO</span>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </Card>

          {/* Help & Contact */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-400" />
              Help & Contact
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:support@biseda.ai"
                className="block w-full p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-sm font-semibold">Contact Support</div>
                    <div className="text-xs text-slate-400">support@biseda.ai</div>
                  </div>
                </div>
              </a>
            </div>
          </Card>

          {/* About App */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              About App
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-400 mb-1">DEVELOPER</div>
                    <div className="text-sm font-semibold text-white">Emilio Gashi</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Email</div>
                    <a 
                      href="mailto:thehiddenclinic@gmail.com"
                      className="text-sm font-semibold text-purple-300 hover:text-purple-200"
                    >
                      thehiddenclinic@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">Biseda.ai v1.0 • © 2025</p>
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="bg-slate-800/50 border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4">Account Actions</h3>
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

          {/* Danger Zone */}
          <Card className="bg-red-900/20 border-red-500/30 p-5">
            <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Permanent actions that cannot be undone
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <div>
                  <div className="text-sm font-semibold">Delete Account</div>
                  <div className="text-xs text-red-400/70">Permanently delete your account and all data</div>
                </div>
              </div>
            </button>
          </Card>
        </div>
      )}

      {/* Cancellation Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-900 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle className="w-6 h-6 text-orange-400" />
                Cancel Subscription
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!cancelSubmitted ? (
              <>
                <p className="text-slate-400 text-sm mb-4">
                  Your cancellation will take effect after 30 days. You'll continue to have access until then.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">
                      Why are you canceling? <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="">Select a reason...</option>
                      <option value="too_expensive">Too expensive</option>
                      <option value="not_using">Not using enough</option>
                      <option value="found_alternative">Found alternative</option>
                      <option value="technical_issues">Technical issues</option>
                      <option value="missing_features">Missing features I need</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">
                      Additional feedback (optional)
                    </label>
                    <textarea
                      value={cancelFeedback}
                      onChange={(e) => setCancelFeedback(e.target.value)}
                      placeholder="Tell us how we can improve..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancellationRequest}
                      disabled={!cancelReason}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Cancellation Request
                    </Button>
                    <Button
                      onClick={() => setShowCancelModal(false)}
                      variant="outline"
                      className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
                    >
                      Keep Subscription
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-white font-semibold text-lg mb-2">Request Submitted!</h4>
                <p className="text-slate-400 text-sm">
                  Your cancellation will take effect in 30 days. You'll receive a confirmation email shortly.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-900 border-red-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Delete Account
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-red-300 text-sm font-semibold mb-2">⚠️ Warning: This action cannot be undone!</p>
              <ul className="text-red-300/80 text-sm space-y-1">
                <li>• All your data will be permanently deleted</li>
                <li>• Your saved items and progress will be lost</li>
                <li>• Your subscription will be cancelled</li>
                <li>• You won't be able to recover your account</li>
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
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAccountDeletion}
                  disabled={deleteConfirmText.toLowerCase() !== 'delete my account'}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete My Account
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  variant="outline"
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Subscription Modal (old) */}
      <SubscriptionModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={(result) => {
          console.log('Subscription upgraded:', result);
          fetchData(); // Refresh usage data
        }}
      />
      
      {/* Subscription Manager (new - full management) */}
      <SubscriptionManager
        isOpen={showSubscriptionManager}
        onClose={() => setShowSubscriptionManager(false)}
        currentTier={currentTier}
        onTierChange={(newTier) => {
          setCurrentSubscriptionTier(newTier);
          fetchData(); // Refresh usage data
        }}
      />
    </div>
  );
}
