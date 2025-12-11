import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, Mail, Phone, Crown, Zap, TrendingUp, Bookmark, 
  Heart, Gift, Lightbulb, Calendar, Trash2, ExternalLink,
  CreditCard, LogOut, Shield, Star, MapPin, Globe, Check, Music, Share2
} from 'lucide-react';
import { getBackendUrl } from '@/utils/getBackendUrl';
import UpgradeModal from '@/components/UpgradeModal';
import { countries, getCitiesForCountry, getCountryByCode } from '@/config/countries';
import { getFavorites, removeVenueFavorite, removeDateIdeaFavorite, removeTipFavorite, removeGiftFavorite } from '@/utils/favorites';

export default function UserProfile({ onLogout }) {
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

  const backendUrl = getBackendUrl();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';

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
        // Refresh saved items
        fetchData();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const getTierBadge = (tier) => {
    const badges = {
      free: { label: 'Free', color: 'bg-slate-500/20 text-slate-300', icon: Shield },
      free_trial: { label: 'Free Trial', color: 'bg-emerald-500/20 text-emerald-300', icon: Star },
      starter: { label: 'Starter', color: 'bg-blue-500/20 text-blue-300', icon: Zap },
      pro: { label: 'Pro', color: 'bg-purple-500/20 text-purple-300', icon: Crown },
      elite: { label: 'Elite', color: 'bg-amber-500/20 text-amber-300', icon: Crown },
      premium: { label: 'Premium', color: 'bg-amber-500/20 text-amber-300', icon: Star }
    };
    return badges[tier?.toLowerCase()] || badges.free;
  };

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

  // Get tier from usage API or localStorage as fallback
  const currentTier = usage?.tier || localStorage.getItem('userSubscriptionTier') || 'free';
  const tierBadge = getTierBadge(currentTier);
  const TierIcon = tierBadge.icon;

  return (
    <div className="px-6 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50">
          <User className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">{userName}</h1>
        <p className="text-slate-400 text-sm">{userEmail}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'saved'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
            {(localFavorites.venues.length + localFavorites.dateIdeas.length + localFavorites.tips.length + localFavorites.gifts.length) > 0 && (
              <span className="px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                {localFavorites.venues.length + localFavorites.dateIdeas.length + localFavorites.tips.length + localFavorites.gifts.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Membership Card */}
          {usage && (
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/50 backdrop-blur-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${tierBadge.color} rounded-xl flex items-center justify-center`}>
                    <TierIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Plan: {tierBadge.label}</h2>
                    <p className="text-slate-400 text-sm">Current membership</p>
                  </div>
                </div>
                {currentTier !== 'premium' && currentTier !== 'elite' && (
                  <Button
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>

              {/* Usage Stats */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Messages Today</span>
                    <span className="text-white font-semibold">
                      {usage.dailyUsage.messages} / {usage.dailyUsage.messagesLimit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${Math.min(100, (usage.dailyUsage.messages / usage.dailyUsage.messagesLimit) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {usage.credits > 0 && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Credits
                      </span>
                      <span className="text-purple-300 font-bold">{usage.credits}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Account Info */}
          <Card className="bg-slate-800/80 border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Username</p>
                  <p className="text-white font-medium">{userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-white font-medium">{userEmail}</p>
                </div>
              </div>
              {localStorage.getItem('userPhone') && (
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-white font-medium">{localStorage.getItem('userPhone')}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Location Settings */}
          <Card className="bg-slate-800/80 border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Location
              </h2>
              {!isEditingLocation && (
                <Button
                  onClick={() => setIsEditingLocation(true)}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-sm h-8"
                >
                  Change
                </Button>
              )}
            </div>

            {!isEditingLocation ? (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                <span className="text-3xl">{currentCountry?.flag || '🌍'}</span>
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
                      setUserCity(''); // Reset city when country changes
                    }}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
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
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
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
                    className="bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Logout Button */}
          <Button
            onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </>
      )}

      {/* Saved Items Tab */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {/* Saved Venues (from Events page) */}
          {localFavorites.venues.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Music className="w-5 h-5 text-yellow-400" />
                Vende të Ruajtura ({localFavorites.venues.length})
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
                          Ruajtur: {new Date(venue.savedAt).toLocaleDateString('sq-AL')}
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
                Ide Takimesh të Ruajtura ({localFavorites.dateIdeas.length})
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
                          Ruajtur: {new Date(idea.savedAt).toLocaleDateString('sq-AL')}
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
                Dhurata të Ruajtura ({localFavorites.gifts.length})
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
                          Ruajtur: {new Date(gift.savedAt).toLocaleDateString('sq-AL')}
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
                Këshilla të Ruajtura ({localFavorites.tips.length})
              </h2>
              <div className="space-y-3">
                {localFavorites.tips.map((tip) => (
                  <Card key={tip.id} className="bg-slate-800/80 border-amber-500/30 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">{tip.title || 'Këshillë'}</h3>
                        <p className="text-slate-300 text-sm">{tip.content}</p>
                        <p className="text-slate-500 text-xs mt-2">
                          Ruajtur: {new Date(tip.savedAt).toLocaleDateString('sq-AL')}
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
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Asnjë element i ruajtur</h3>
              <p className="text-slate-400">Fillo të ruash takime, dhurata dhe këshilla!</p>
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
  );
}

