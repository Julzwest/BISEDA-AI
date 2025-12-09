import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, DollarSign, MessageSquare, TrendingUp, Shield, 
  Lock, Unlock, RefreshCw, Eye, EyeOff, Crown, Zap,
  Calendar, Activity, CreditCard, AlertCircle, Bot,
  Heart, Gift, PartyPopper, Lightbulb, UserPlus, Clock,
  CheckCircle, XCircle, Mail, Globe, Smartphone, Trash2,
  Search, Filter, MoreVertical, X, Send, Key, ChevronDown,
  ChevronUp, AlertTriangle, UserX, CreditCard as CardIcon,
  History, MessageCircle, Settings, Award, Ban
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
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // User detail modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Gift credits modal
  const [showGiftCredits, setShowGiftCredits] = useState(false);
  const [giftCreditsAmount, setGiftCreditsAmount] = useState(10);
  const [giftCreditsUser, setGiftCreditsUser] = useState(null);
  
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
        headers: { 'Content-Type': 'application/json' },
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
      const [statsRes, usersRes, registeredRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/admin/registered-users`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      if (registeredRes.ok) setRegisteredUsers((await registeredRes.json()).users || []);
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ blocked })
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Block user error:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const token = localStorage.getItem('adminToken');
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userToDelete.odId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        fetchData();
      }
    } catch (error) {
      console.error('Delete user error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGiftCredits = async () => {
    if (!giftCreditsUser) return;
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${giftCreditsUser.odId}/gift-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: giftCreditsAmount })
      });
      
      if (response.ok) {
        setShowGiftCredits(false);
        setGiftCreditsUser(null);
        setGiftCreditsAmount(10);
        fetchData();
      }
    } catch (error) {
      console.error('Gift credits error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Filter users
  const filteredUsers = (registeredUsers.length > 0 ? registeredUsers : users).filter(user => {
    const matchesSearch = searchQuery === '' || 
      (user.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTier = filterTier === 'all' || user.subscriptionTier === filterTier;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'blocked' && user.isBlocked) ||
      (filterStatus === 'active' && !user.isBlocked);
    
    return matchesSearch && matchesTier && matchesStatus;
  });

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
              <label className="block text-sm font-medium text-slate-300 mb-2">👤 Username</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">🔐 Password</label>
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
                  <AlertCircle className="w-4 h-4" /> {authError}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold h-14 rounded-xl text-base shadow-lg shadow-purple-500/20 transition-all"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : '🚀 Hyr në Dashboard'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

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
          <Button onClick={fetchData} disabled={refreshing} className="bg-slate-700 hover:bg-slate-600 text-white">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Rifresko
          </Button>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Dil</Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '📊 Përmbledhje' },
          { id: 'users', label: '👥 Përdoruesit' },
          { id: 'subscriptions', label: '💎 Abonimet' },
          { id: 'activity', label: '📈 Aktiviteti' },
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
                  <p className="text-white text-2xl font-bold">{registeredUsers.length || stats?.overview?.totalUsers || 0}</p>
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
              <TrendingUp className="w-5 h-5 text-green-400" /> Pasqyra Financiare
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

          {/* App Features */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-5 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Veçoritë e Aplikacionit
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { icon: Bot, name: 'AI Coach', color: 'purple' },
                { icon: Heart, name: 'First Dates', color: 'pink' },
                { icon: Lightbulb, name: 'Tips', color: 'amber' },
                { icon: PartyPopper, name: 'Events', color: 'yellow' },
                { icon: Gift, name: 'Gifts', color: 'rose' },
              ].map((feature, i) => (
                <div key={i} className={`bg-${feature.color}-500/10 border border-${feature.color}-500/30 p-4 rounded-xl text-center`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-400 mx-auto mb-2`} />
                  <p className="text-white font-semibold text-sm">{feature.name}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Signups */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" /> Regjistrimet e Fundit
            </h2>
            <div className="space-y-2">
              {registeredUsers.slice(0, 5).map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-slate-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      user.subscriptionTier === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                      user.subscriptionTier === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {user.subscriptionTier === 'free_trial' ? 'Provë' : user.subscriptionTier || 'Free'}
                    </span>
                    <p className="text-slate-500 text-xs mt-1">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('sq-AL') : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="bg-slate-800/50 border-slate-700/50 p-5">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kërko përdorues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Të gjitha planet</option>
              <option value="free_trial">Provë Falas</option>
              <option value="free">Falas</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Të gjithë</option>
              <option value="active">Aktivë</option>
              <option value="blocked">Të bllokuar</option>
            </select>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> 
              Përdoruesit ({filteredUsers.length})
            </h2>
          </div>
          
          {filteredUsers.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div key={user.odId || user._id} className={`p-4 rounded-xl border transition-all ${
                  user.isBlocked 
                    ? 'bg-red-900/20 border-red-500/30' 
                    : 'bg-slate-700/30 border-slate-600/30 hover:border-purple-500/30'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <span className="text-white font-semibold">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email?.split('@')[0]}
                          </span>
                          {user.isBlocked && (
                            <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-300 rounded-lg text-xs font-semibold">
                              <Ban className="w-3 h-3 inline mr-1" /> BLLOKUAR
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          user.subscriptionTier === 'elite' ? 'bg-amber-500/20 text-amber-300' :
                          user.subscriptionTier === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                          user.subscriptionTier === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                          user.subscriptionTier === 'free_trial' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                          {user.subscriptionTier === 'free_trial' ? 'Provë' : user.subscriptionTier || 'Free'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {user.country || 'AL'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('sq-AL') : 'N/A'}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {user.monthlyUsage?.totalMessages || 0} mesazhe</span>
                        <span className="flex items-center gap-1 text-green-400"><DollarSign className="w-3 h-3" /> ${user.costTracking?.totalSpent?.toFixed(4) || '0.00'}</span>
                        <span className="flex items-center gap-1 text-purple-400"><Zap className="w-3 h-3" /> {user.credits || 0} kredite</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                        className="bg-slate-600 hover:bg-slate-500 text-white text-xs h-9 px-3"
                      >
                        <Eye className="w-3 h-3 mr-1" /> Shiko
                      </Button>
                      <Button
                        onClick={() => { setGiftCreditsUser(user); setShowGiftCredits(true); }}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-9 px-3"
                      >
                        <Gift className="w-3 h-3 mr-1" /> Kredite
                      </Button>
                      <Button
                        onClick={() => handleBlockUser(user.odId, !user.isBlocked)}
                        className={`${user.isBlocked ? 'bg-green-600 hover:bg-green-500' : 'bg-orange-600 hover:bg-orange-500'} text-white text-xs h-9 px-3`}
                      >
                        {user.isBlocked ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                        {user.isBlocked ? 'Zhblloko' : 'Blloko'}
                      </Button>
                      <Button
                        onClick={() => { setUserToDelete(user); setShowDeleteConfirm(true); }}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs h-9 px-3"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Fshi
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Asnjë përdorues u gjet</p>
            </div>
          )}
        </Card>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <>
          <Card className="bg-slate-800/50 border-slate-700/50 p-5 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" /> Shpërndarja e Abonesave
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: '🎁 Provë Falas', key: 'free_trial', color: 'emerald', price: '3 ditë' },
                { name: 'Falas', key: 'free', color: 'slate', price: '€0/muaj' },
                { name: '⭐ Starter', key: 'starter', color: 'blue', price: '€6.99/muaj' },
                { name: '💎 Pro', key: 'pro', color: 'purple', price: '€12.99/muaj' },
                { name: '👑 Elite', key: 'elite', color: 'amber', price: '€19.99/muaj' },
              ].map((tier, i) => (
                <div key={i} className={`bg-${tier.color}-500/10 border border-${tier.color}-500/30 p-4 rounded-xl text-center`}>
                  <p className={`text-${tier.color}-300 text-sm mb-1`}>{tier.name}</p>
                  <p className="text-white text-3xl font-bold">{stats?.subscriptions?.[tier.key] || 0}</p>
                  <p className="text-slate-500 text-xs mt-1">{tier.price}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" /> Të Ardhura nga Abonime
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 p-5 rounded-xl">
                <p className="text-green-300 text-sm mb-2">Të Ardhura Mujore</p>
                <p className="text-white text-3xl font-bold">€{stats?.overview?.monthlyRevenue || '0.00'}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 p-5 rounded-xl">
                <p className="text-blue-300 text-sm mb-2">Të Ardhura Vjetore (Est.)</p>
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

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <Card className="bg-slate-800/50 border-slate-700/50 p-5">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" /> Aktiviteti i Fundit
          </h2>
          <div className="space-y-3">
            {stats?.topUsers?.map((user, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  i === 0 ? 'bg-yellow-500 text-black' :
                  i === 1 ? 'bg-slate-300 text-black' :
                  i === 2 ? 'bg-amber-600 text-white' :
                  'bg-slate-600 text-white'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{user.odId?.substring(0, 20)}...</p>
                  <p className="text-slate-400 text-sm">{user.messages} mesazhe • ${user.cost?.toFixed(4)} kosto</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  user.tier === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                  user.tier === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {user.tier === 'free_trial' ? 'Provë' : user.tier}
                </span>
              </div>
            )) || <p className="text-slate-400 text-center py-8">Asnjë aktivitet ende</p>}
          </div>
        </Card>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900 border-slate-700 p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" /> Detajet e Përdoruesit
              </h2>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(selectedUser.firstName?.[0] || selectedUser.email?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Plan</p>
                  <p className="text-white font-semibold">{selectedUser.subscriptionTier || 'Free'}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Status</p>
                  <p className={`font-semibold ${selectedUser.isBlocked ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedUser.isBlocked ? 'Bllokuar' : 'Aktiv'}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Mesazhe Total</p>
                  <p className="text-white font-semibold">{selectedUser.monthlyUsage?.totalMessages || 0}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Kredite</p>
                  <p className="text-purple-400 font-semibold">{selectedUser.credits || 0}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Kosto API</p>
                  <p className="text-green-400 font-semibold">${selectedUser.costTracking?.totalSpent?.toFixed(4) || '0.00'}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Regjistruar</p>
                  <p className="text-white font-semibold">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('sq-AL') : 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => { setGiftCreditsUser(selectedUser); setShowGiftCredits(true); setShowUserModal(false); }}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white">
                  <Gift className="w-4 h-4 mr-2" /> Dhuro Kredite
                </Button>
                <Button onClick={() => { handleBlockUser(selectedUser.odId, !selectedUser.isBlocked); setShowUserModal(false); }}
                  className={`flex-1 ${selectedUser.isBlocked ? 'bg-green-600 hover:bg-green-500' : 'bg-orange-600 hover:bg-orange-500'} text-white`}>
                  {selectedUser.isBlocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {selectedUser.isBlocked ? 'Zhblloko' : 'Blloko'}
                </Button>
                <Button onClick={() => { setUserToDelete(selectedUser); setShowDeleteConfirm(true); setShowUserModal(false); }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white">
                  <Trash2 className="w-4 h-4 mr-2" /> Fshi
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900 border-red-500/30 p-6 rounded-2xl max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Fshi Llogarinë?</h2>
              <p className="text-slate-400">
                Je i sigurt që dëshiron të fshish llogarinë e <span className="text-white font-semibold">{userToDelete.email}</span>?
                Ky veprim nuk mund të kthehet!
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white">
                Anulo
              </Button>
              <Button onClick={handleDeleteUser} disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white">
                {deleteLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" /> Fshi Përgjithmonë</>}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Gift Credits Modal */}
      {showGiftCredits && giftCreditsUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900 border-purple-500/30 p-6 rounded-2xl max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Dhuro Kredite</h2>
              <p className="text-slate-400">
                Dhuro kredite për <span className="text-white font-semibold">{giftCreditsUser.email}</span>
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Sasia e Krediteve</label>
              <input
                type="number"
                value={giftCreditsAmount}
                onChange={(e) => setGiftCreditsAmount(parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-purple-500/50"
              />
              <div className="flex justify-center gap-2 mt-3">
                {[5, 10, 25, 50, 100].map(amount => (
                  <button key={amount} onClick={() => setGiftCreditsAmount(amount)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      giftCreditsAmount === amount ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}>
                    {amount}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => { setShowGiftCredits(false); setGiftCreditsUser(null); }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white">
                Anulo
              </Button>
              <Button onClick={handleGiftCredits}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white">
                <Gift className="w-4 h-4 mr-2" /> Dhuro {giftCreditsAmount} Kredite
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-slate-500 text-xs">
          Përditësuar: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString('sq-AL') : 'N/A'}
        </p>
      </div>
    </div>
  );
}
