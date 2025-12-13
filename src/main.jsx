import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { trackSessionStart, trackSessionEnd } from './utils/analytics.js';
import './index.css';

// Initialize i18n
import './i18n';

// 🔒 AUTO CACHE BUSTER - Prevents stale cached versions
const APP_VERSION = '3.0.20251213';
const storedVersion = localStorage.getItem('biseda_app_version');

if (storedVersion !== APP_VERSION) {
  console.log('🔄 New version detected! Clearing cache...', { old: storedVersion, new: APP_VERSION });
  
  // Clear caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('🗑️ Cleared cache:', name);
      });
    });
  }
  
  // Unregister service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('🗑️ Unregistered service worker');
      });
    });
  }
  
  // Store new version
  localStorage.setItem('biseda_app_version', APP_VERSION);
  
  // Force reload if this is an update (not first visit)
  if (storedVersion) {
    console.log('🔄 Reloading with fresh version...');
    window.location.reload(true);
  }
}

// Track session start
trackSessionStart();

// Track session end on page unload
window.addEventListener('beforeunload', trackSessionEnd);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
