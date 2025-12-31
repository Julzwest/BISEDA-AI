import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPageUrl } from './utils';
import { Lightbulb, Home, Calendar, Bot, Flag, User, PartyPopper, Sparkles, MessageCircle, Heart, MapPin, Zap, Users, Wrench } from 'lucide-react';
import RegionSwitcher from '@/components/RegionSwitcher';
// GuestBanner removed - guest sessions no longer supported
import TrialCountdown from '@/components/TrialCountdown';
import TrialExpiredModal from '@/components/TrialExpiredModal';
// Guest sessions removed - all users must register
import { trackPageView } from '@/utils/analytics';
import { getBackendUrl } from '@/utils/getBackendUrl';

export default function Layout({ children, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPageName = location.pathname.split('/')[1]?.charAt(0).toUpperCase() + location.pathname.split('/')[1]?.slice(1) || 'Home';
  
  // Trial expiration state
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  
  // All users are now registered - no guest sessions
  
  // Check trial expiration status
  useEffect(() => {
    const checkTrialExpiration = () => {
      const subscriptionTier = localStorage.getItem('subscriptionTier');
      const trialStartTime = localStorage.getItem('trialStartTime');
      
      // Paid users - no modal needed
      if (subscriptionTier && !['free', 'trial'].includes(subscriptionTier)) {
        setShowTrialExpiredModal(false);
        return;
      }
      
      // Check if trial has expired
      if (trialStartTime) {
        const startTime = parseInt(trialStartTime);
        const trialDuration = 12 * 60 * 60 * 1000; // 12 hours
        const endTime = startTime + trialDuration;
        
        if (Date.now() >= endTime) {
          setShowTrialExpiredModal(true);
        }
      }
    };
    
    checkTrialExpiration();
    
    // Check every 10 seconds
    const interval = setInterval(checkTrialExpiration, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Handle subscription purchase
  const handlePurchase = async (tierId) => {
    console.log('💳 Processing purchase for tier:', tierId);
    
    // TODO: Integrate with Apple In-App Purchases
    // For now, simulate successful purchase
    localStorage.setItem('subscriptionTier', tierId);
    localStorage.removeItem('trialStartTime');
    localStorage.removeItem('trialExpired');
    setShowTrialExpiredModal(false);
    
    // Update backend
    try {
      const backendUrl = getBackendUrl();
      const token = localStorage.getItem('authToken');
      await fetch(`${backendUrl}/api/subscription/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tier: tierId })
      });
    } catch (error) {
      console.error('Failed to update subscription on backend:', error);
    }
  };
  
  // Handle restore purchases
  const handleRestore = async () => {
    console.log('🔄 Restoring purchases...');
    // TODO: Integrate with Apple StoreKit restore
    alert('Checking for previous purchases...');
  };

  // Scroll to top on route change
  useEffect(() => {
    // Scroll window to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Also scroll the main container
    const mainContainer = document.getElementById('main-content');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
    
    // Force scroll on document element and body
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // Track page views
  useEffect(() => {
    trackPageView(currentPageName);
  }, [currentPageName]);

  // 5-tab navigation: Home, Wingman, Rehearse, Date Spots, More (Profile moved to header)
  const navItems = [
    { name: t('nav.hub', 'Home'), icon: Home, page: 'Copilot' },
    { name: t('nav.wingman', 'Wingman'), icon: Zap, page: 'Wingman' },
    { name: t('nav.rehearse', 'Rehearse'), icon: Users, page: 'Rehearsal' },
    { name: t('nav.dateEvents', 'Date & Events'), icon: MapPin, page: 'Explore' },
    { name: t('nav.more', 'More'), icon: Wrench, page: 'Tools' }
  ];

  return (
    <>
      {/* 🚫 Trial Expired Modal - Blocks entire app */}
      {showTrialExpiredModal && (
        <TrialExpiredModal 
          onPurchase={handlePurchase}
          onRestore={handleRestore}
        />
      )}
      
      <style>{`
        html, body {
          background: var(--bg-primary, #0f172a) !important;
          -webkit-overflow-scrolling: touch;
          transition: background-color 0.3s ease;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Cover the entire bottom area including home indicator */
        .bottom-safe-area {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: env(safe-area-inset-bottom, 0px);
          background: var(--bg-primary, #0f172a);
          z-index: 9998;
        }
        
        /* Modern nav styling */
        .nav-item {
          position: relative;
          transition: all 0.2s ease;
        }
        
        .nav-item.active {
          color: var(--accent-primary, #a855f7);
        }
        
        .nav-item.active::before {
          content: '';
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-primary, #a855f7), var(--accent-secondary, #ec4899));
          border-radius: 0 0 4px 4px;
        }
        
        .nav-item:not(.active):hover {
          color: var(--accent-primary, #c084fc);
        }
        
        .nav-icon {
          transition: transform 0.2s ease;
        }
        
        .nav-item.active .nav-icon {
          transform: scale(1.15);
        }
      `}</style>
      
      {/* Cover for safe area at bottom */}
      <div className="bottom-safe-area"></div>
      
      {/* Fixed Top Header Bar */}
      <header 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          paddingTop: 'env(safe-area-inset-top, 0px)',
          zIndex: 9999,
          background: 'linear-gradient(to bottom, var(--bg-primary, rgba(15, 23, 42, 0.98)), var(--bg-primary, rgba(15, 23, 42, 0.95)))',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color, rgba(148, 163, 184, 0.1))'
        }}
      >
        <div className="h-14 px-4 flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <Link to="/copilot" className="flex items-center gap-2">
              <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40 overflow-hidden">
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                {/* Speech bubble icon */}
                <MessageCircle className="w-6 h-6 text-white relative z-10" fill="currentColor" strokeWidth={1.5} />
                {/* Small sparkle effect */}
                <Sparkles className="w-3 h-3 text-yellow-300 absolute top-1 right-1 animate-pulse" />
              </div>
              <span className="font-bold text-white text-base">Biseda<span className="text-purple-400">.ai</span></span>
            </Link>
          </div>
          
          {/* Center - Trial Countdown Timer */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <TrialCountdown />
          </div>
          
          {/* Right side - Profile + Region Switcher */}
          <div className="flex items-center gap-2">
            <Link 
              to="/profile"
              className={`p-2 rounded-xl transition-all ${
                currentPageName === 'Profile' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-5 h-5" />
            </Link>
            <RegionSwitcher />
          </div>
        </div>
      </header>
      
      {/* Main Content - with top padding for fixed header + safe area */}
      {/* 🔒 LOCKED: No horizontal scrolling - only vertical */}
      <main 
        id="main-content"
        className="w-full max-w-full"
        style={{ 
          paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))', 
          paddingBottom: '90px', 
          minHeight: '100vh',
          overflowX: 'hidden',
          overflowY: 'auto',
          maxWidth: '100vw',
          width: '100%'
        }}
      >
        <div style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%' }}>
          {children}
        </div>
      </main>

      {/* Fixed Bottom Navigation - Modern Design */}
      <nav style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: 'linear-gradient(to top, var(--bg-primary, rgba(15, 23, 42, 0.98)), var(--bg-primary, rgba(15, 23, 42, 0.95)))',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-color, rgba(148, 163, 184, 0.1))',
        zIndex: 9999,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        <div className="flex justify-around items-center h-16 px-2 max-w-screen-xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl ${
                  isActive ? 'active text-purple-400' : 'text-slate-400'
                }`}
              >
                <div className={`nav-icon p-2 rounded-xl ${isActive ? 'bg-purple-500/20' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-purple-300' : 'text-slate-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
