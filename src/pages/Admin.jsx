import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, DollarSign, MessageSquare, TrendingUp, Shield, 
  Lock, Unlock, RefreshCw, Eye, EyeOff, Crown, Zap,
  Calendar, Activity, CreditCard, AlertCircle
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
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
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
        setAuthError('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Connection error');
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

      // Fetch users
      const usersResponse = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBlockUser = async (userId, blocked) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blocked })
      });

      if (response.ok) {
        fetchData(); // Refresh data
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
      <div className="px-6 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="max-w-md mx-auto mt-20">
          <Card className="bg-slate-800/80 border-purple-500/50 backdrop-blur-sm p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm">Enter password to access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  placeholder="Enter username"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{authError}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold h-12"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </Button>
            </form>

          </Card>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="px-6 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Biseda.ai Analytics & Management</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchData}
            disabled={refreshing}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total Users</p>
                  <p className="text-white text-2xl font-bold">{stats.overview.totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Active Today</p>
                  <p className="text-white text-2xl font-bold">{stats.overview.activeToday}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total Messages</p>
                  <p className="text-white text-2xl font-bold">{stats.overview.totalMessages}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Monthly Revenue</p>
                  <p className="text-white text-2xl font-bold">€{stats.overview.monthlyRevenue}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Financial Overview */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Financial Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Monthly Revenue</p>
                <p className="text-white text-xl font-bold">€{stats.overview.monthlyRevenue}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total API Cost</p>
                <p className="text-white text-xl font-bold">${stats.overview.totalCost}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Profit</p>
                <p className="text-green-400 text-xl font-bold">€{stats.overview.profit}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Credits Balance</p>
                <p className="text-purple-400 text-xl font-bold">{stats.overview.totalCreditsBalance}</p>
              </div>
            </div>
          </Card>

          {/* Subscription Breakdown */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Subscription Breakdown
            </h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                <p className="text-emerald-300 text-sm mb-1">Provë Falas</p>
                <p className="text-white text-2xl font-bold">{stats.subscriptions.free_trial || 0}</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Free</p>
                <p className="text-white text-2xl font-bold">{stats.subscriptions.free}</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
                <p className="text-blue-300 text-sm mb-1">Starter (€6.99)</p>
                <p className="text-white text-2xl font-bold">{stats.subscriptions.starter}</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
                <p className="text-purple-300 text-sm mb-1">Pro (€12.99)</p>
                <p className="text-white text-2xl font-bold">{stats.subscriptions.pro}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                <p className="text-amber-300 text-sm mb-1">Elite (€19.99)</p>
                <p className="text-white text-2xl font-bold">{stats.subscriptions.elite || stats.subscriptions.premium || 0}</p>
              </div>
            </div>
          </Card>

          {/* Top Users */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Top 10 Users by Usage
            </h2>
            <div className="space-y-2">
              {stats.topUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-sm w-6">#{index + 1}</span>
                    <span className="text-white font-mono text-sm">{user.userId.substring(0, 20)}...</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.tier === 'elite' || user.tier === 'premium' ? 'bg-amber-500/20 text-amber-300' :
                      user.tier === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                      user.tier === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                      user.tier === 'free_trial' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {user.tier === 'free_trial' ? 'Trial' : user.tier}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm">{user.messages} msgs</span>
                    <span className="text-green-400 text-sm font-mono">${user.cost.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Users List */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          All Users ({users.length})
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div key={user.userId} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-mono text-sm">{user.userId}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      user.subscriptionTier === 'elite' || user.subscriptionTier === 'premium' ? 'bg-amber-500/20 text-amber-300' :
                      user.subscriptionTier === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                      user.subscriptionTier === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                      user.subscriptionTier === 'free_trial' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {user.subscriptionTier === 'free_trial' ? 'Trial' : user.subscriptionTier}
                    </span>
                    {user.isBlocked && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs font-semibold">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                    <span>📅 Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span>⏰ Last Active: {new Date(user.lastActiveAt).toLocaleString()}</span>
                    <span>💬 Daily: {user.dailyUsage.messages} msgs</span>
                    <span>📊 Monthly: {user.monthlyUsage.totalMessages} msgs</span>
                    <span>💰 Cost: ${user.costTracking.totalSpent.toFixed(4)}</span>
                    <span>⚡ Credits: {user.credits}</span>
                    {user.stripeCustomerId && (
                      <span className="text-green-400">💳 Stripe ID: {user.stripeCustomerId.substring(0, 12)}...</span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleBlockUser(user.userId, !user.isBlocked)}
                  className={`${
                    user.isBlocked 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white text-xs h-8 px-3`}
                >
                  {user.isBlocked ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                  {user.isBlocked ? 'Unblock' : 'Block'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

