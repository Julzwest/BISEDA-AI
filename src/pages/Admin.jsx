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
  History, MessageCircle, Settings, Award, Ban, MessagesSquare,
  ChevronRight, User, Image
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
  
  // Change tier modal
  const [showChangeTier, setShowChangeTier] = useState(false);
  const [changeTierUser, setChangeTierUser] = useState(null);
  const [selectedTier, setSelectedTier] = useState('starter');
  const [changeTierLoading, setChangeTierLoading] = useState(false);
  
  // Conversations
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  
  // Create User
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserSuccess, setCreateUserSuccess] = useState('');
  const [createUserError, setCreateUserError] = useState('');
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: '',
    tier: 'starter'
  });
  
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

  const handleChangeTier = async () => {
    if (!changeTierUser) return;
    const token = localStorage.getItem('adminToken');
    setChangeTierLoading(true);
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${changeTierUser.odId}/update-tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tier: selectedTier })
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowChangeTier(false);
        setChangeTierUser(null);
        setSelectedTier('starter');
        fetchData();
        alert(`✅ Plani u ndryshua në ${selectedTier.toUpperCase()}!\n\n📊 Mesazhe/ditë: ${selectedTier === 'elite' ? 500 : selectedTier === 'pro' ? 200 : selectedTier === 'starter' ? 75 : 3}\n💰 Kredite të shtuara: +${data.creditsAdded || 0}\n💎 Balanca e re: ${data.newCreditsBalance || 0} kredite`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to change tier');
      }
    } catch (error) {
      console.error('Change tier error:', error);
      alert('Error changing tier');
    } finally {
      setChangeTierLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserError('');
    setCreateUserSuccess('');
    
    // Validation
    if (!newUser.firstName.trim() || !newUser.lastName.trim()) {
      setCreateUserError('First name and last name are required');
      return;
    }
    if (!newUser.email.trim() || !newUser.email.includes('@')) {
      setCreateUserError('Valid email is required');
      return;
    }
    if (!newUser.password || newUser.password.length < 6) {
      setCreateUserError('Password must be at least 6 characters');
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    setCreateUserLoading(true);
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/create-test-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          firstName: newUser.firstName.trim(),
          lastName: newUser.lastName.trim(),
          email: newUser.email.trim(),
          password: newUser.password,
          gender: newUser.gender || null,
          tier: newUser.tier
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCreateUserSuccess(`✅ User created successfully! Email: ${data.user.email}, Tier: ${data.user.tier}`);
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          gender: '',
          tier: 'starter'
        });
        fetchData(); // Refresh user list
      } else {
        setCreateUserError(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      setCreateUserError('Connection error. Please try again.');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const fetchConversations = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    setLoadingConversations(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/conversations?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchUserConversations = async (odId) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return [];
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${odId}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.conversations || [];
      }
    } catch (error) {
      console.error('Fetch user conversations error:', error);
    }
    return [];
  };

  const viewUserConversations = async (user) => {
    const userConvs = await fetchUserConversations(user.odId);
    if (userConvs.length > 0) {
      setSelectedUser(user);
      setConversations(userConvs);
      setActiveTab('conversations');
    } else {
      alert('Ky përdorues nuk ka biseda ende.');
    }
  };

  // Filter users
  const filteredUsers = (registeredUsers.length > 0 ? registeredUsers : users).filter(user => {
    const matchesSearch = searchQuery === '' || 
      (user.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTier = filterTier === 'all' || user.subscriptionTier === filterTier;
    
    let matchesStatus = true;
    if (filterStatus === 'blocked') matchesStatus = user.isBlocked;
    else if (filterStatus === 'active') matchesStatus = !user.isBlocked;
    else if (filterStatus === 'online') matchesStatus = user.onlineStatus === 'online';
    else if (filterStatus === 'away') matchesStatus = user.onlineStatus === 'away';
    else if (filterStatus === 'offline') matchesStatus = user.onlineStatus === 'offline' || !user.onlineStatus;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Online counts
  const onlineCount = registeredUsers.filter(u => u.onlineStatus === 'online').length;
  const awayCount = registeredUsers.filter(u => u.onlineStatus === 'away').length;

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
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="truncate">Admin</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm truncate">Manage app and users</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
          <Button onClick={fetchData} disabled={refreshing} className="bg-slate-700 hover:bg-slate-600 text-white px-2 sm:px-4 py-2">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-2">
            <span className="sm:hidden">Exit</span>
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation - Scrollable on mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'users', label: '👥 Users', icon: '👥' },
          { id: 'createUser', label: '➕ Create', icon: '➕' },
          { id: 'conversations', label: '💬 Chats', icon: '💬' },
          { id: 'subscriptions', label: '💎 Subs', icon: '💎' },
          { id: 'activity', label: '📈 Activity', icon: '📈' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'conversations') fetchConversations();
            }}
            className={`px-3 py-2 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0 ${
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg relative">
                  <Activity className="w-6 h-6 text-white" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Online Tani</p>
                  <p className="text-white text-2xl font-bold">{registeredUsers.filter(u => u.onlineStatus === 'online').length}</p>
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
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-700 ${
                        user.onlineStatus === 'online' ? 'bg-green-500' :
                        user.onlineStatus === 'away' ? 'bg-yellow-500' :
                        'bg-slate-500'
                      }`}></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                        {user.onlineStatus === 'online' && (
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        )}
                      </div>
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
              <option value="online">🟢 Online tani</option>
              <option value="away">🟡 Larg</option>
              <option value="offline">⚫ Offline</option>
              <option value="active">✅ Jo të bllokuar</option>
              <option value="blocked">🚫 Të bllokuar</option>
            </select>
          </div>

          {/* Online Status Summary */}
          <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-slate-700/30 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-400 font-semibold">{onlineCount}</span>
              <span className="text-slate-400 text-sm">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-yellow-400 font-semibold">{awayCount}</span>
              <span className="text-slate-400 text-sm">Larg</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-500 rounded-full"></span>
              <span className="text-slate-400 font-semibold">{registeredUsers.length - onlineCount - awayCount}</span>
              <span className="text-slate-400 text-sm">Offline</span>
            </div>
            <div className="ml-auto text-slate-500 text-xs">
              Total: {registeredUsers.length} përdorues
            </div>
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
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                          </div>
                          {/* Online Status Indicator */}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${
                            user.onlineStatus === 'online' ? 'bg-green-500 animate-pulse' :
                            user.onlineStatus === 'away' ? 'bg-yellow-500' :
                            'bg-slate-500'
                          }`} title={
                            user.onlineStatus === 'online' ? 'Online tani' :
                            user.onlineStatus === 'away' ? 'Larg' :
                            'Offline'
                          }></span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email?.split('@')[0]}
                            </span>
                            {/* Online Status Badge */}
                            {user.onlineStatus === 'online' && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-lg text-xs font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                              </span>
                            )}
                            {user.onlineStatus === 'away' && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-lg text-xs font-semibold">
                                Larg
                              </span>
                            )}
                          </div>
                          {user.lastSeenText && user.onlineStatus !== 'online' && (
                            <span className="text-slate-500 text-xs">{user.lastSeenText}</span>
                          )}
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
                        onClick={() => viewUserConversations(user)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-9 px-3"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" /> Bisedat
                      </Button>
                      <Button
                        onClick={() => { setGiftCreditsUser(user); setShowGiftCredits(true); }}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-9 px-3"
                      >
                        <Gift className="w-3 h-3 mr-1" /> Kredite
                      </Button>
                      <Button
                        onClick={() => { setChangeTierUser(user); setSelectedTier(user.subscriptionTier || 'free'); setShowChangeTier(true); }}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-9 px-3"
                      >
                        <Crown className="w-3 h-3 mr-1" /> Plan
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

      {/* Create User Tab */}
      {activeTab === 'createUser' && (
        <Card className="bg-slate-800/50 border-slate-700/50 p-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Krijo Përdorues të Ri</h2>
            <p className="text-slate-400">Krijo llogari të re me planin e dëshiruar</p>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">👤 Emri</label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50"
                  placeholder="Emri"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">👤 Mbiemri</label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50"
                  placeholder="Mbiemri"
                  required
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">⚧ Gjinia</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewUser({...newUser, gender: 'male'})}
                  className={`py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    newUser.gender === 'male'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-400'
                      : 'bg-slate-700/50 border-2 border-slate-600/50 text-slate-400 hover:text-white hover:border-blue-500/50'
                  }`}
                >
                  <span className="text-xl">👨</span>
                  <span>Mashkull</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewUser({...newUser, gender: 'female'})}
                  className={`py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    newUser.gender === 'female'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 border-2 border-pink-400'
                      : 'bg-slate-700/50 border-2 border-slate-600/50 text-slate-400 hover:text-white hover:border-pink-500/50'
                  }`}
                >
                  <span className="text-xl">👩</span>
                  <span>Femër</span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">📧 Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50"
                placeholder="email@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">🔐 Fjalëkalimi</label>
              <input
                type="text"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50"
                placeholder="Minimum 6 karaktere"
                required
              />
            </div>

            {/* Subscription Tier */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">💎 Plani i Abonimit</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'free', name: 'Falas', price: '€0', color: 'slate', icon: '🆓' },
                  { id: 'starter', name: 'Starter', price: '€6.99', color: 'blue', icon: '⭐' },
                  { id: 'pro', name: 'Pro', price: '€12.99', color: 'purple', icon: '💎' },
                  { id: 'elite', name: 'Elite', price: '€19.99', color: 'amber', icon: '👑' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setNewUser({...newUser, tier: tier.id})}
                    className={`p-4 rounded-xl font-semibold transition-all text-center ${
                      newUser.tier === tier.id
                        ? tier.id === 'elite' ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 border-2 border-amber-400' :
                          tier.id === 'pro' ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 border-2 border-purple-400' :
                          tier.id === 'starter' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-400' :
                          'bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg border-2 border-slate-400'
                        : 'bg-slate-700/50 border-2 border-slate-600/50 text-slate-400 hover:text-white hover:border-slate-500/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{tier.icon}</span>
                    <span className="block text-sm font-bold">{tier.name}</span>
                    <span className="block text-xs opacity-75">{tier.price}/muaj</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {createUserError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {createUserError}
                </p>
              </div>
            )}

            {/* Success Message */}
            {createUserSuccess && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {createUserSuccess}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createUserLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold h-14 rounded-xl text-base shadow-lg shadow-green-500/20 transition-all"
            >
              {createUserLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Krijo Përdoruesin
                </>
              )}
            </Button>
          </form>

          {/* Quick Create Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-sm text-center mb-4">Ose krijo shpejt një llogari testi:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => setNewUser({
                  firstName: 'Test',
                  lastName: 'User',
                  email: `test${Date.now()}@test.com`,
                  password: 'testpassword123',
                  gender: 'male',
                  tier: 'elite'
                })}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                👑 Elite Test User
              </Button>
              <Button
                type="button"
                onClick={() => setNewUser({
                  firstName: 'Test',
                  lastName: 'User',
                  email: `test${Date.now()}@test.com`,
                  password: 'testpassword123',
                  gender: 'female',
                  tier: 'pro'
                })}
                className="bg-purple-600 hover:bg-purple-500 text-white"
              >
                💎 Pro Test User
              </Button>
            </div>
          </div>
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

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <Card className="bg-slate-800/50 border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessagesSquare className="w-5 h-5 text-cyan-400" />
              {selectedUser ? `Bisedat e ${selectedUser.firstName || selectedUser.email}` : 'Të Gjitha Bisedat'}
            </h2>
            {selectedUser && (
              <Button onClick={() => { setSelectedUser(null); fetchConversations(); }} className="bg-slate-600 hover:bg-slate-500 text-white text-xs">
                <X className="w-4 h-4 mr-1" /> Pastro filtrin
              </Button>
            )}
          </div>
          
          {loadingConversations ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Duke ngarkuar bisedat...</p>
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {conversations.map((conv, i) => (
                <div 
                  key={conv._id || i} 
                  className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-cyan-500/30 cursor-pointer transition-all"
                  onClick={() => { setSelectedConversation(conv); setShowConversationModal(true); }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {(conv.userName?.[0] || conv.userEmail?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{conv.userName || 'Unknown'}</p>
                          <p className="text-slate-500 text-xs">{conv.userEmail}</p>
                        </div>
                        <span className={`ml-auto px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          conv.topic === 'Dating' ? 'bg-pink-500/20 text-pink-300' :
                          conv.topic === 'Messaging' ? 'bg-blue-500/20 text-blue-300' :
                          conv.topic === 'Gifts' ? 'bg-rose-500/20 text-rose-300' :
                          conv.topic === 'Tips' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                          {conv.topic}
                        </span>
                      </div>
                      
                      {/* Preview of last message */}
                      <div className="bg-slate-800/50 p-2 rounded-lg mb-2">
                        <p className="text-slate-300 text-xs line-clamp-2">
                          {conv.messages?.[conv.messages.length - 1]?.content?.substring(0, 150) || 'No messages'}...
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {conv.messageCount || conv.messages?.length || 0} mesazhe
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString('sq-AL') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessagesSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">Asnjë bisedë ende</p>
              <p className="text-slate-500 text-sm">Bisedat e përdoruesve do të shfaqen këtu</p>
            </div>
          )}
        </Card>
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
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(selectedUser.firstName?.[0] || selectedUser.email?.[0] || '?').toUpperCase()}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-3 border-slate-900 ${
                    selectedUser.onlineStatus === 'online' ? 'bg-green-500 animate-pulse' :
                    selectedUser.onlineStatus === 'away' ? 'bg-yellow-500' :
                    'bg-slate-500'
                  }`}></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white text-lg font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    {selectedUser.onlineStatus === 'online' && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400">{selectedUser.email}</p>
                  {selectedUser.lastSeenText && selectedUser.onlineStatus !== 'online' && (
                    <p className="text-slate-500 text-xs mt-1">Parë: {selectedUser.lastSeenText}</p>
                  )}
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

      {/* Change Tier Modal */}
      {showChangeTier && changeTierUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900 border-amber-500/30 p-6 rounded-2xl max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Ndrysho Planin</h2>
              <p className="text-slate-400">
                Ndrysho planin për <span className="text-white font-semibold">{changeTierUser.email}</span>
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Plani aktual: <span className="text-amber-400 font-semibold">{changeTierUser.subscriptionTier || 'free'}</span>
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">Zgjidh Planin e Ri</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'free', name: 'Falas', price: '€0', credits: 0, messages: 3 },
                  { id: 'starter', name: 'Starter', price: '€6.99', credits: 25, messages: 75 },
                  { id: 'pro', name: 'Pro', price: '€12.99', credits: 50, messages: 200 },
                  { id: 'elite', name: 'Elite', price: '€19.99', credits: 100, messages: 500 },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-3 rounded-xl font-semibold transition-all text-center ${
                      selectedTier === tier.id
                        ? tier.id === 'elite' ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg border-2 border-amber-400' :
                          tier.id === 'pro' ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg border-2 border-purple-400' :
                          tier.id === 'starter' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg border-2 border-blue-400' :
                          'bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg border-2 border-slate-400'
                        : 'bg-slate-700/50 border-2 border-slate-600/50 text-slate-400 hover:text-white hover:border-slate-500/50'
                    }`}
                  >
                    <span className="block text-sm font-bold">{tier.name}</span>
                    <span className="block text-xs opacity-75">{tier.price}/muaj</span>
                    <span className="block text-xs mt-1 opacity-60">{tier.messages} msg/ditë</span>
                    {tier.credits > 0 && <span className="block text-xs text-green-300">+{tier.credits} kredite</span>}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => { setShowChangeTier(false); setChangeTierUser(null); }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white">
                Anulo
              </Button>
              <Button onClick={handleChangeTier} disabled={changeTierLoading}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white">
                {changeTierLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Crown className="w-4 h-4 mr-2" /> Ndrysho Planin</>}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Conversation Detail Modal */}
      {showConversationModal && selectedConversation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900 border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {(selectedConversation.userName?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-white font-bold">{selectedConversation.userName || 'Unknown'}</h2>
                  <p className="text-slate-400 text-xs">{selectedConversation.userEmail} • {selectedConversation.topic}</p>
                </div>
              </div>
              <button onClick={() => { setShowConversationModal(false); setSelectedConversation(null); }} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages?.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md' 
                      : 'bg-slate-700 text-slate-200 rounded-bl-md'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {msg.role === 'user' ? 'Përdoruesi' : 'AI Coach'}
                      </span>
                      {msg.hasImages && <Image className="w-3 h-3" />}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1 text-right">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('sq-AL') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{selectedConversation.messages?.length || 0} mesazhe total</span>
                <span>Filloi: {selectedConversation.startedAt ? new Date(selectedConversation.startedAt).toLocaleString('sq-AL') : 'N/A'}</span>
              </div>
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
