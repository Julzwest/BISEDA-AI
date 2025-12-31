import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Crown } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';

export default function TrialCountdown() {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTrialUser, setIsTrialUser] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    // Check if user is on trial
    const checkTrialStatus = () => {
      const subscriptionTier = localStorage.getItem('subscriptionTier');
      const trialStartTime = localStorage.getItem('trialStartTime');
      
      // Only show for trial/free users
      if (subscriptionTier && subscriptionTier !== 'free' && subscriptionTier !== 'trial') {
        setIsTrialUser(false);
        return;
      }

      // If no trial start time, they haven't started trial yet
      if (!trialStartTime) {
        // Set trial start time on first check
        const now = Date.now();
        localStorage.setItem('trialStartTime', now.toString());
        setIsTrialUser(true);
        return;
      }

      const startTime = parseInt(trialStartTime);
      const trialDuration = 12 * 60 * 60 * 1000; // 12 hours in ms
      const endTime = startTime + trialDuration;
      const remaining = endTime - Date.now();

      if (remaining <= 0) {
        // Trial expired
        setTimeLeft(0);
        setIsTrialUser(true);
        localStorage.setItem('trialExpired', 'true');
      } else {
        setTimeLeft(remaining);
        setIsTrialUser(true);
      }
    };

    checkTrialStatus();

    // Update every second
    const interval = setInterval(() => {
      const trialStartTime = localStorage.getItem('trialStartTime');
      if (trialStartTime) {
        const startTime = parseInt(trialStartTime);
        const trialDuration = 12 * 60 * 60 * 1000;
        const endTime = startTime + trialDuration;
        const remaining = endTime - Date.now();
        
        if (remaining <= 0) {
          setTimeLeft(0);
          localStorage.setItem('trialExpired', 'true');
        } else {
          setTimeLeft(remaining);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't show if not a trial user
  if (!isTrialUser) return null;

  // Format time remaining
  const formatTime = (ms) => {
    if (ms <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, expired: false };
  };

  const time = formatTime(timeLeft);

  // Trial expired - show upgrade prompt
  if (time.expired) {
    return (
      <>
        <button
          onClick={() => setShowSubscriptionModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-xs font-bold animate-pulse shadow-lg"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>{t('trial.expired', 'Trial Ended')}</span>
        </button>
        
        {showSubscriptionModal && (
          <SubscriptionModal 
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
          />
        )}
      </>
    );
  }

  // Determine urgency color
  const isUrgent = time.hours < 1;
  const isWarning = time.hours < 6;

  return (
    <>
      <button
        onClick={() => setShowSubscriptionModal(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          isUrgent 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' 
            : isWarning
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
        }`}
      >
        <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'animate-pulse' : ''}`} />
        <span className="font-mono">
          {String(time.hours).padStart(2, '0')}:
          {String(time.minutes).padStart(2, '0')}:
          {String(time.seconds).padStart(2, '0')}
        </span>
        <span className="hidden sm:inline ml-1 opacity-75">
          {t('trial.remaining', 'left')}
        </span>
      </button>
      
      {showSubscriptionModal && (
        <SubscriptionModal 
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}
    </>
  );
}

