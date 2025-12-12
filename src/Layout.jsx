import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPageUrl } from './utils';
import { Lightbulb, Home, Calendar, Bot, Flag, User, PartyPopper, Sparkles, MessageCircle, Heart, MapPin } from 'lucide-react';
import RegionSwitcher from '@/components/RegionSwitcher';
import GuestBanner from '@/components/GuestBanner';
import { clearGuestSession } from '@/pages/AuthComponent';
import { trackPageView } from '@/utils/analytics';

export default function Layout({ children, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPageName = location.pathname.split('/')[1]?.charAt(0).toUpperCase() + location.pathname.split('/')[1]?.slice(1) || 'Home';
  
  // 🔒 FIX: Only show guest banner if TRULY a guest (no real userId)
  // If user has a userId, they're logged in - ignore stale isGuest flag
  const userId = localStorage.getItem('userId');
  const hasRealAccount = userId && userId.length > 10; // Real user IDs are long
  const isGuest = localStorage.getItem('isGuest') === 'true' && !hasRealAccount;

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

  // Modern nav items with updated icons - using translations
  // Bottom nav: Home, AI Coach, Intimacy Coach, Tips (4 items only)
  const navItems = [
    { name: t('nav.home'), icon: Home, page: 'Home' },
    { name: t('nav.aiCoach'), icon: Sparkles, page: 'Chat' },
    { name: 'Intimacy', icon: Heart, page: 'IntimacyCoach' },
    { name: t('nav.tips'), icon: Lightbulb, page: 'Tips' }
  ];

  return (
    <>
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
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Biseda<span className="text-purple-400">.ai</span></span>
            </Link>
          </div>
          
          {/* Center - Guest Banner (if guest) */}
          {isGuest && (
            <GuestBanner 
              onExpired={() => {
                clearGuestSession();
                if (onLogout) onLogout();
              }}
              onSignUp={() => {
                clearGuestSession();
                if (onLogout) onLogout();
              }}
            />
          )}
          
          {/* Right side - Combined Region Switcher & Profile */}
          <div className="flex items-center gap-2">
            <RegionSwitcher />
            <Link to="/profile">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-purple-500/30 transition-all duration-200">
                <User className="w-5 h-5 text-white" />
              </div>
            </Link>
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
