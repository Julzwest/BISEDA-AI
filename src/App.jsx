import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './pages/Home.jsx';
import Tips from './pages/Tips.jsx';
import ClipboardSuggestions from './pages/ClipboardSuggestions.jsx';
import FirstDates from './pages/FirstDates.jsx';
import Chat from './pages/Chat.jsx';
import GiftSuggestions from './pages/GiftSuggestions.jsx';
import FestiveDates from './pages/FestiveDates.jsx';
import Events from './pages/Events.jsx';
import SubscriptionSuccess from './pages/SubscriptionSuccess.jsx';
import SubscriptionCancel from './pages/SubscriptionCancel.jsx';
import Admin from './pages/Admin.jsx';
import Auth, { clearAllUserData } from '@/pages/AuthComponent';
import UserProfile from './pages/UserProfile.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import OnboardingTutorial from './components/OnboardingTutorial.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (persistent login)
    const authStatus = localStorage.getItem('isAuthenticated');
    const userId = localStorage.getItem('userId');
    const guestId = localStorage.getItem('guestId');
    const guestStatus = localStorage.getItem('isGuest');
    
    // User stays logged in - check for valid session
    if (authStatus === 'true' && (userId || guestId)) {
      setIsAuthenticated(true);
      setIsGuest(guestStatus === 'true');
      
      // Check if should show onboarding
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
    
    setIsCheckingAuth(false);
  }, []);

  const handleAuthSuccess = (user) => {
    console.log('✅ User authenticated:', user);
    setIsAuthenticated(true);
    setIsGuest(user?.isGuest || false);
    
    // Show onboarding for new users
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    // Clear ALL user data to prevent profile confusion
    clearAllUserData();
    setIsAuthenticated(false);
    setIsGuest(false);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  // Check if current URL is privacy policy or admin (allow access without main app auth)
  const isPrivacyPage = window.location.hash.includes('privacy');
  const isAdminPage = window.location.hash.includes('admin');
  
  // Show auth page if not authenticated (except for privacy policy and admin)
  if (!isAuthenticated && !isPrivacyPage && !isAdminPage) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }
  
  // Show admin dashboard without main app auth (admin has its own authentication)
  if (!isAuthenticated && isAdminPage) {
    return (
      <Router>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    );
  }
  
  // Show privacy policy without auth
  if (!isAuthenticated && isPrivacyPage) {
    return (
      <Router>
        <Routes>
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/privacy" replace />} />
        </Routes>
      </Router>
    );
  }

  // Show main app if authenticated
  return (
    <Router>
      {/* Scroll to top on route change */}
      <ScrollToTop />
      
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial 
          onComplete={() => setShowOnboarding(false)} 
          isGuest={isGuest}
        />
      )}
      
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/clipboard" element={<ClipboardSuggestions />} />
          <Route path="/firstdates" element={<FirstDates />} />
          <Route path="/festivedates" element={<FestiveDates />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gifts" element={<GiftSuggestions />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/subscription/success" element={<SubscriptionSuccess />} />
          <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<UserProfile onLogout={handleLogout} />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

