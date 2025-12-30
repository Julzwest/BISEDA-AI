import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check connection by trying to fetch a small resource
    try {
      await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    }
    
    setIsRetrying(false);
  };

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-3 shadow-lg animate-slideDown">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {t('offline.title', "You're Offline")}
            </p>
            <p className="text-xs text-white/80">
              {t('offline.message', 'Check your internet connection')}
            </p>
          </div>
        </div>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? t('offline.retrying', 'Retrying...') : t('offline.retry', 'Retry')}
        </button>
      </div>
    </div>
  );
}

