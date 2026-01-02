import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPageUrl } from './utils';
import { Lightbulb, Home, Calendar, Bot, Flag, User, PartyPopper, Sparkles, MessageCircle, MessageSquare, Heart, MapPin, Zap, Users, Wrench } from 'lucide-react';
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
  
  // Trial expiration state - Check immediately on load
  const checkIfTrialExpired = () => {
    const subscriptionTier = localStorage.getItem('subscriptionTier') || localStorage.getItem('userSubscriptionTier');
    const subscriptionData = localStorage.getItem('user_subscription');
    const trialStartTime = localStorage.getItem('trialStartTime') || localStorage.getItem('trial_start_date');
    
    // Paid users are fine
    const paidTiers = ['starter', 'pro', 'elite'];
    if (paidTiers.includes(subscriptionTier)) return false;
    
    // Check subscription data
    if (subscriptionData) {
      try {
        const parsed = JSON.parse(subscriptionData);
        if (paidTiers.includes(parsed.tier)) return false;
        if (parsed.tier === 'expired') return true;
        if (parsed.credits <= 0) return true;
      } catch (e) {}
    }
    
    // Check trial time
    if (trialStartTime) {
      const startTime = typeof trialStartTime === 'string' && trialStartTime.includes('T') 
        ? new Date(trialStartTime).getTime() 
        : parseInt(trialStartTime);
      const trialDuration = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
      if (Date.now() >= startTime + trialDuration) return true;
    }
    
    return false;
  };
  
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(checkIfTrialExpired());
  
  // All users are now registered - no guest sessions
  
  // Check trial expiration status - BULLETPROOF VERSION
  useEffect(() => {
    const checkTrialExpiration = () => {
      // Check multiple sources for subscription status
      const subscriptionTier = localStorage.getItem('subscriptionTier') || localStorage.getItem('userSubscriptionTier');
      const subscriptionData = localStorage.getItem('user_subscription');
      const trialStartTime = localStorage.getItem('trialStartTime') || localStorage.getItem('trial_start_date');
      
      // Parse subscription data if exists
      let parsedSub = null;
      if (subscriptionData) {
        try {
          parsedSub = JSON.parse(subscriptionData);
        } catch (e) {}
      }
      
      // Check if user has valid paid subscription
      const paidTiers = ['starter', 'pro', 'elite'];
      const hasPaidSubscription = paidTiers.includes(subscriptionTier) || 
                                   (parsedSub && paidTiers.includes(parsedSub.tier));
      
      if (hasPaidSubscription) {
        setShowTrialExpiredModal(false);
        return;
      }
      
      // Check if subscription is expired
      if (parsedSub && parsedSub.tier === 'expired') {
        setShowTrialExpiredModal(true);
        return;
      }
      
      // Check if trial has expired (from any source)
      if (trialStartTime) {
        const startTime = typeof trialStartTime === 'string' && trialStartTime.includes('T') 
          ? new Date(trialStartTime).getTime() 
          : parseInt(trialStartTime);
        const trialDuration = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        const endTime = startTime + trialDuration;
        
        if (Date.now() >= endTime) {
          // Mark as expired in all storage locations
          localStorage.setItem('trialExpired', 'true');
          if (parsedSub) {
            parsedSub.tier = 'expired';
            parsedSub.credits = 0;
            localStorage.setItem('user_subscription', JSON.stringify(parsedSub));
          }
          setShowTrialExpiredModal(true);
          return;
        }
      }
      
      // Check credits - if 0 credits, show modal
      if (parsedSub && parsedSub.credits <= 0 && parsedSub.tier === 'free_trial') {
        parsedSub.tier = 'expired';
        localStorage.setItem('user_subscription', JSON.stringify(parsedSub));
        setShowTrialExpiredModal(true);
        return;
      }
    };
    
    // Check immediately on mount
    checkTrialExpiration();
    
    // Check every 3 seconds (more aggressive)
    const interval = setInterval(checkTrialExpiration, 3000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Also check on route change
  
  // Handle subscription purchase
  const handlePurchase = async (tierId) => {
    console.log('💳 Processing purchase for tier:', tierId);
    
    // TODO: Integrate with Apple In-App Purchases
    // For now, simulate successful purchase
    
    // Get tier credits based on selection
    const tierCredits = {
      'starter': 200,
      'pro': 500,
      'elite': 1000
    };
    
    // Update ALL localStorage keys that the credit system checks
    localStorage.setItem('subscriptionTier', tierId);
    localStorage.setItem('userSubscriptionTier', tierId);
    localStorage.removeItem('trialStartTime');
    localStorage.removeItem('trial_start_date');
    localStorage.removeItem('trialExpired');
    localStorage.removeItem('trial_used_forever');
    
    // Update the user_subscription object (this is what credits.js checks!)
    const newSubscription = {
      tier: tierId,
      credits: tierCredits[tierId] || 500,
      creditsUsedToday: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      purchaseDate: new Date().toISOString()
    };
    localStorage.setItem('user_subscription', JSON.stringify(newSubscription));
    
    console.log('✅ Subscription updated:', newSubscription);
    
    // Hide the modal
    setShowTrialExpiredModal(false);
    
    // Force page reload to reset all states
    window.location.reload();
    
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
          borderBottom: '1px solid var(--border-color, rgba(148, 163, 184, 0.1))',
          // Blur and disable when trial expired
          filter: showTrialExpiredModal ? 'blur(8px)' : 'none',
          pointerEvents: showTrialExpiredModal ? 'none' : 'auto'
        }}
      >
        <div className="h-11 px-4 flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <Link to="/copilot" className="flex items-center gap-2">
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40 overflow-hidden">
                {/* Speech bubble icon - matching app icon */}
                <MessageSquare className="w-5 h-5 text-white relative z-10" fill="white" strokeWidth={0} />
                {/* Sparkle stars in top right - matching app icon */}
                <div className="absolute -top-0.5 -right-0.5">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
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
          paddingTop: 'calc(44px + env(safe-area-inset-top, 0px))', 
          paddingBottom: '75px', 
          minHeight: '100vh',
          overflowX: 'hidden',
          overflowY: 'auto',
          maxWidth: '100vw',
          width: '100%'
        }}
      >
        <div style={{ 
          overflowX: 'hidden', 
          maxWidth: '100%', 
          width: '100%',
          // Blur and disable interaction when trial expired
          filter: showTrialExpiredModal ? 'blur(8px)' : 'none',
          pointerEvents: showTrialExpiredModal ? 'none' : 'auto',
          userSelect: showTrialExpiredModal ? 'none' : 'auto'
        }}>
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
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        // Blur and disable when trial expired
        filter: showTrialExpiredModal ? 'blur(8px)' : 'none',
        pointerEvents: showTrialExpiredModal ? 'none' : 'auto'
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
