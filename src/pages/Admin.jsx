import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, DollarSign, MessageSquare, TrendingUp, Shield, 
  Lock, Unlock, RefreshCw, Eye, EyeOff, Crown, Zap,
  Calendar, Activity, CreditCard, AlertCircle, Bot,
  Heart, Gift, PartyPopper, Lightbulb, UserPlus, Clock,
  CheckCircle, XCircle, Mail, Globe, Smartphone
} from 'lucide-react';
import { getBackendUrl } from '@/utils/getBackendUrl';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const backendUrl = getBackendUrl();
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (adminToken) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, [adminToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', data.username);
        setIsAuthenticated(true);
        fetchData();
      } else {
        setAuthError('Emër përdoruesi ose fjalëkalim i gabuar');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Gabim lidhje me serverin');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setRefreshing(true);

    try {
      // Fetch stats
      const statsResponse = await fetch(`${backendUrl}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch users (usage data)
      const usersResponse = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Fetch registered users (accounts)
      const registeredResponse = await fetch(`${backendUrl}/api/admin/registered-users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (registeredResponse.ok) {
        const registeredData = await registeredResponse.json();
        setRegisteredUsers(registeredData.users || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBlockUser = async (odId, blocked) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${odId}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blocked })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Block user error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
        <Card className="bg-slate-900/90 border-purple-500/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-purple-500/20 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Biseda.ai Management Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👤 Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                placeholder="Shkruaj username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔐 Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                  placeholder="Shkruaj password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {authError}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold h-14 rounded-xl text-base shadow-lg shadow-purple-500/20 transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Duke u kyçur...
                </div>
              ) : (
                '🚀 Hyr në Dashboard'
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Biseda.ai Admin
          </h1>
          <p className="text-slate-400 text-sm">Menaxho aplikacionin dhe përdoruesit</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchData}
            disabled={refreshing}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Rifresko
          </Button>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Dil
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '📊 Përmbledhje', icon: TrendingUp },
          { id: 'users', label: '👥 Përdoruesit', icon: Users },
          { id: 'subscriptions', label: '💎 Abonimet', icon: Crown },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total Përdorues</p>
                  <p className="text-white text-2xl font-bold">{stats?.overview?.totalUsers || registeredUsers.length || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Aktivë Sot</p>
                  <p className="text-white text-2xl font-bold">{stats?.overview?.activeToday || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total Mesazhe</p>
                  <p className="text-white text-2xl font-bold">{stats?.overview?.totalMessages || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-amber-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Të Ardhura/Muaj</p>
                  <p className="text-white text-2xl font-bold">€{stats?.overview?.monthlyRevenue || '0.00'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Financial Overview */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-5 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Pasqyra Financiare
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/30 p-4 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Të Ardhura Mujore</p>
                <p className="text-white text-xl font-bold">€{stats?.overview?.monthlyRevenue || '0.00'}</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Kosto API (OpenAI)</p>
                <p className="text-white text-xl font-bold">${stats?.overview?.totalCost || '0.00'}</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Fitimi Neto</p>
                <p className="text-green-400 text-xl font-bold">€{stats?.overview?.profit || '0.00'}</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Kredite Aktive</p>
                <p className="text-purple-400 text-xl font-bold">{stats?.overview?.totalCreditsBalance || 0}</p>
              </div>
            </div>
          </Card>

          {/* App Features Usage */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-5 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Veçoritë e Aplikacionit
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 rounded-xl text-center">
                <Bot className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-semibold">AI Coach</p>
                <p className="text-slate-400 text-xs">Chat me AI</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 p-4 rounded-xl text-center">
                <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-white font-semibold">First Dates</p>
                <p className="text-slate-400 text-xs">Ide takimesh</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-4 rounded-xl text-center">
                <Lightbulb className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Tips</p>
                <p className="text-slate-400 text-xs">Këshilla</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-4 rounded-xl text-center">
                <PartyPopper className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Events</p>
                <p className="text-slate-400 text-xs">Evente lokale</p>
              </div>
              <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30 p-4 rounded-xl text-center">
                <Gift className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Gifts</p>
                <p className="text-slate-400 text-xs">Dhurata</p>
              </div>
            </div>
          </Card>

          {/* Top Users */}
          {stats?.topUsers && stats.topUsers.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700/50 p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Top 10 Përdoruesit më Aktivë
              </h2>
              <div className="space-y-2">
                {stats.topUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-slate-300 text-black' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-600 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-white font-mono text-sm">{user.userId.substring(0, 16)}...</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        user.tier === 'elite' || user.tier === 'premium' ? 'bg-amber-500/20 text-amber-300' :
                        user.tier === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                        user.tier === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                        user.tier === 'free_trial' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {user.tier === 'free_trial' ? 'Provë' : user.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">{user.messages} mesazhe</span>
                      <span className="text-green-400 font-mono">${user.cost.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="bg-slate-800/50 border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Të Gjithë Përdoruesit ({registeredUsers.length || users.length})
            </h2>
          </div>
          
          {(registeredUsers.length > 0 || users.length > 0) ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {(registeredUsers.length > 0 ? registeredUsers : users).map((user) => (
                <div key={user.odId || user.odId || user._id} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-white font-semibold">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username || user.email?.split('@')[0] || 'Përdorues'}
                        </span>
                        {user.subscriptionTier && (
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                            user.subscriptionTier === 'elite' || user.subscriptionTier === 'premium' ? 'bg-amber-500/20 text-amber-300' :
                            user.subscriptionTier === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                            user.subscriptionTier === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                            user.subscriptionTier === 'free_trial' ? 'bg-emerald-500/20 text-emerald-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>
                            {user.subscriptionTier === 'free_trial' ? 'Provë Falas' : user.subscriptionTier}
                          </span>
                        )}
                        {user.isBlocked && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> BLLOKUAR
                          </span>
                        )}
                        {user.isVerified && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verifikuar
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-400">
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </span>
                        )}
                        {user.country && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {user.country}
                          </span>
                        )}
                        {user.createdAt && (
                          <span className="flex items-center gap-1">
                            <UserPlus className="w-3 h-3" /> Regjistruar: {new Date(user.createdAt).toLocaleDateString('sq-AL')}
                          </span>
                        )}
                        {user.lastLogin && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Hyrje e fundit: {new Date(user.lastLogin).toLocaleDateString('sq-AL')}
                          </span>
                        )}
                        {user.dailyUsage && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Mesazhe sot: {user.dailyUsage.messages || 0}
                          </span>
                        )}
                        {user.monthlyUsage && (
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Mesazhe/muaj: {user.monthlyUsage.totalMessages || 0}
                          </span>
                        )}
                        {user.costTracking && (
                          <span className="flex items-center gap-1 text-green-400">
                            <DollarSign className="w-3 h-3" /> Kosto: ${user.costTracking.totalSpent?.toFixed(4) || '0.00'}
                          </span>
                        )}
                        {user.credits !== undefined && (
                          <span className="flex items-center gap-1 text-purple-400">
                            <Zap className="w-3 h-3" /> Kredite: {user.credits}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleBlockUser(user.odId || user.userId, !user.isBlocked)}
                      className={`${
                        user.isBlocked 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      } text-white text-xs h-9 px-4`}
                    >
                      {user.isBlocked ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                      {user.isBlocked ? 'Zhblloko' : 'Blloko'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">Asnjë përdorues ende</p>
              <p className="text-slate-500 text-sm">Përdoruesit e regjistruar do të shfaqen këtu</p>
            </div>
          )}
        </Card>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <>
          <Card className="bg-slate-800/50 border-slate-700/50 p-5 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Shpërndarja e Abonesave
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
                <p className="text-emerald-300 text-sm mb-1">🎁 Provë Falas</p>
                <p className="text-white text-3xl font-bold">{stats?.subscriptions?.free_trial || 0}</p>
                <p className="text-slate-500 text-xs mt-1">3 ditë falas</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                <p className="text-slate-400 text-sm mb-1">Falas</p>
                <p className="text-white text-3xl font-bold">{stats?.subscriptions?.free || 0}</p>
                <p className="text-slate-500 text-xs mt-1">€0/muaj</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center">
                <p className="text-blue-300 text-sm mb-1">⭐ Starter</p>
                <p className="text-white text-3xl font-bold">{stats?.subscriptions?.starter || 0}</p>
                <p className="text-slate-500 text-xs mt-1">€6.99/muaj</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl text-center">
                <p className="text-purple-300 text-sm mb-1">💎 Pro</p>
                <p className="text-white text-3xl font-bold">{stats?.subscriptions?.pro || 0}</p>
                <p className="text-slate-500 text-xs mt-1">€12.99/muaj</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-center">
                <p className="text-amber-300 text-sm mb-1">👑 Elite</p>
                <p className="text-white text-3xl font-bold">{stats?.subscriptions?.elite || stats?.subscriptions?.premium || 0}</p>
                <p className="text-slate-500 text-xs mt-1">€19.99/muaj</p>
              </div>
            </div>
          </Card>

          {/* Subscription Revenue */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Të Ardhura nga Abonime
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 p-5 rounded-xl">
                <p className="text-green-300 text-sm mb-2">Të Ardhura Mujore</p>
                <p className="text-white text-3xl font-bold">€{stats?.overview?.monthlyRevenue || '0.00'}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 p-5 rounded-xl">
                <p className="text-blue-300 text-sm mb-2">Të Ardhura të Pritshme/Vit</p>
                <p className="text-white text-3xl font-bold">€{((parseFloat(stats?.overview?.monthlyRevenue) || 0) * 12).toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 p-5 rounded-xl">
                <p className="text-purple-300 text-sm mb-2">Fitimi Neto/Muaj</p>
                <p className="text-white text-3xl font-bold">€{stats?.overview?.profit || '0.00'}</p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Last Updated */}
      <div className="mt-6 text-center">
        <p className="text-slate-500 text-xs">
          Përditësuar së fundmi: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString('sq-AL') : 'N/A'}
        </p>
      </div>
    </div>
  );
}
