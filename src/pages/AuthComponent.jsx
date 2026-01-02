import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Heart, Zap, Star, Crown, ArrowLeft, KeyRound, User, Users, X, Loader2 } from 'lucide-react';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { Capacitor } from '@capacitor/core';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { isDisposableEmail, isValidEmailProvider, getDeviceId, registerDeviceTrial } from '@/utils/deviceFingerprint';

// Free trial constants (exported for use elsewhere)
export const FREE_TRIAL_DAYS = 3;
export const FREE_TRIAL_MESSAGES_PER_DAY = 10;

// Clear ALL session data (for logout functionality)
export const clearGuestSession = () => {
  localStorage.removeItem('guestSession');
  localStorage.removeItem('isGuest');
  localStorage.removeItem('guestId');
};

// Complete logout - clears everything
export const clearAllUserData = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userCountry');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('isGuest');
  localStorage.removeItem('guestSession');
  localStorage.removeItem('guestId');
  localStorage.removeItem('conversationHistory');
  localStorage.removeItem('onboardingCompleted');
  localStorage.removeItem('onboardingComplete');
  localStorage.removeItem('hasSeenOnboarding');
  console.log('🔓 User logged out - all data cleared');
};

export default function Auth({ onAuthSuccess }) {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  
  // Forgot password state
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Age verification state
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [selectedAge, setSelectedAge] = useState('');
  
  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [pendingAuthData, setPendingAuthData] = useState(null);
  
  // Email verification state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingSignupData, setPendingSignupData] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Animated benefits carousel
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const benefits = [
    { emoji: '💬', text: t('auth.benefitChat', 'Perfect conversation starters') },
    { emoji: '🎯', text: t('auth.benefitPractice', 'Practice before real dates') },
    { emoji: '📍', text: t('auth.benefitPlaces', 'Discover amazing date spots') },
    { emoji: '🔥', text: t('auth.benefitConfidence', 'Build dating confidence') },
    { emoji: '✨', text: t('auth.benefitAI', 'AI-powered dating coach') },
  ];
  
  useEffect(() => {
    if (!isLogin) {
      const interval = setInterval(() => {
        setCurrentBenefit((prev) => (prev + 1) % benefits.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLogin, benefits.length]);

  const backendUrl = getBackendUrl();

  // Password strength calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    
    if (strength <= 2) return { level: strength, label: t('auth.passwordWeak', 'Weak'), color: 'bg-red-500' };
    if (strength <= 3) return { level: strength, label: t('auth.passwordMedium', 'Medium'), color: 'bg-yellow-500' };
    return { level: strength, label: t('auth.passwordStrong', 'Strong'), color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);
  
  // Check if running on iOS native app
  const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  // Handle Apple Sign In
  const handleAppleSignIn = async () => {
    if (isNativeIOS) {
      // Native iOS Apple Sign In
      try {
        const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
        const result = await SignInWithApple.authorize({
          clientId: 'com.bisedaai.app',
          redirectURI: 'https://bisedaai.com/auth/callback',
          scopes: 'email name',
          state: 'auth',
          nonce: Math.random().toString(36).substring(2, 15)
        });
        
        if (result.response) {
          // Send to backend for verification
          const response = await fetch(`${backendUrl}/api/auth/apple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identityToken: result.response.identityToken,
              user: result.response.user,
              email: result.response.email,
              fullName: result.response.givenName ? {
                givenName: result.response.givenName,
                familyName: result.response.familyName
              } : null
            })
          });
          
          const data = await response.json();
          
          if (response.ok && data.user) {
            localStorage.setItem('userId', data.user.odId || data.user.userId);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', data.user.firstName || data.user.email?.split('@')[0]);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userCountry', data.user.country || 'AL');
            
            // Check if user has already used their trial (returning user)
            if (data.trialUsed || data.user.trialUsed) {
              localStorage.setItem('trial_used_forever', 'true');
              localStorage.setItem('trialExpired', 'true');
            }
            if (data.subscriptionTier || data.user.subscriptionTier) {
              localStorage.setItem('subscriptionTier', data.subscriptionTier || data.user.subscriptionTier);
            }
            
            if (onAuthSuccess) {
              onAuthSuccess({
                userId: data.user.odId || data.user.userId,
                email: data.user.email,
                userName: data.user.firstName || data.user.email?.split('@')[0],
                country: data.user.country || 'AL'
              });
            }
          } else {
            setError(t('authErrors.appleFailed'));
          }
        }
      } catch (err) {
        console.error('Apple Sign In error:', err);
        if (err.message !== 'The user canceled the authorization attempt.') {
          setError(t('authErrors.appleFailed'));
        }
      }
    } else {
      // Web - show message that Apple Sign In is only available on iOS
      setError(t('authErrors.appleIOSOnly'));
    }
  };

  // Rotating tagline state
  const [taglineIndex, setTaglineIndex] = useState(0);
  const taglines = [
    t('auth.tagline1'),
    t('auth.tagline2'),
    t('auth.tagline3'),
    t('auth.tagline4')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Show age verification modal when guest button is clicked
  const handleGuestButtonClick = () => {
    setShowAgeVerification(true);
    setSelectedAge('');
  };

  // Proceed with guest login after age verification
  const handleGuestLogin = () => {
    if (!selectedAge || parseInt(selectedAge) < 18) {
      return;
    }
    
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    clearAllUserData();
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('guestId', guestId);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userCountry', 'AL');
    localStorage.setItem('userAge', selectedAge);
    console.log('👤 Guest session started:', guestId, 'Age:', selectedAge);
    setShowAgeVerification(false);
    if (onAuthSuccess) onAuthSuccess({ isGuest: true, guestId });
  };

  // 📧 Send verification code to email
  const sendVerificationCode = async (emailAddress) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${backendUrl}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress, language: i18n.language }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // If endpoint doesn't exist (404), skip verification
      if (response.status === 404) {
        console.log('📧 Verification endpoint not available - skipping');
        return { success: true, skip: true };
      }
      
      const data = await response.json();
      
      if (response.ok) {
        setVerificationSent(true);
        setResendCooldown(60); // 60 second cooldown
        return { success: true };
      } else {
        // If email service failed, skip verification temporarily
        console.log('📧 Email service issue - skipping verification');
        return { success: true, skip: true };
      }
    } catch (error) {
      console.error('Send verification error:', error);
      // Connection failed or timeout - skip verification temporarily
      console.log('📧 Verification timeout/error - skipping');
      return { success: true, skip: true };
    }
  };

  // ✅ Verify the code entered by user
  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError(t('authErrors.enterCode', 'Enter the 6-digit code'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: pendingSignupData.email,
          code: verificationCode 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.verified) {
        // Code verified! Now complete registration
        await completeRegistration(pendingSignupData);
      } else {
        setError(t('authErrors.wrongCode', 'Wrong code. Please try again.'));
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setError(t('authErrors.connectionError', 'Connection error. Try again!'));
    } finally {
      setLoading(false);
    }
  };

  // 🎉 Complete registration after verification
  const completeRegistration = async (signupData) => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signupData,
          emailVerified: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear old data
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userCountry');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('isGuest');
        localStorage.removeItem('guestSession');
        localStorage.removeItem('guestId');
        localStorage.removeItem('conversationHistory');

        const userId = data.user.odId || data.user.userId;
        const userName = data.user.firstName
          ? `${data.user.firstName} ${data.user.lastName || ''}`.trim()
          : data.user.username || signupData.email.split('@')[0];

        localStorage.setItem('userId', userId);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userGender', signupData.gender || '');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userCountry', data.user.country || 'AL');
        
        // Check if user has already used their trial before (returning user who deleted account)
        if (data.trialUsed) {
          // They've used their trial before - mark as expired, must subscribe
          localStorage.setItem('trial_used_forever', 'true');
          localStorage.setItem('trialExpired', 'true');
          localStorage.setItem('subscriptionTier', 'free');
          console.log('⚠️ Returning user - trial already used, must subscribe');
        } else {
          // New user - start trial
          localStorage.setItem('trialStartTime', Date.now().toString());
          localStorage.setItem('subscriptionTier', 'trial');
        }
        
        // Register device
        const deviceId = getDeviceId();
        registerDeviceTrial(backendUrl).catch(err => console.log('Device registration failed:', err));
        
        // Mark onboarding complete
        localStorage.setItem('onboardingComplete', 'true');
        localStorage.setItem('hasSeenOnboarding', 'true');
        
        // Close verification modal and show welcome
        setShowEmailVerification(false);
        setPendingAuthData({
          userId,
          email: data.user.email,
          userName,
          country: data.user.country || 'AL',
        });
        setShowWelcomeModal(true);
      } else {
        setError(data.message || t('authErrors.somethingWrong'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(t('authErrors.connectionError'));
    }
  };

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate name for registration
    if (!isLogin && !firstName.trim()) {
      setError(t('authErrors.enterName', 'Please enter your name'));
      return;
    }

    if (!email.trim()) {
      setError(t('authErrors.enterEmail'));
      return;
    }
    
    if (!password || password.length < 6) {
      setError(t('authErrors.passwordLength'));
      return;
    }

    // 🚀 Show loading immediately for faster perceived speed
    setLoading(true);
    
    // 🛡️ Validate email provider for REGISTRATION only (login is validated by backend)
    if (!isLogin) {
      const emailValidation = isValidEmailProvider(email.trim());
      if (!emailValidation.valid) {
        setLoading(false);
        if (emailValidation.reason === 'format') {
          setError(t('authErrors.invalidEmailFormat', 'Please enter a valid email address (e.g., name@gmail.com)'));
        } else if (emailValidation.reason === 'disposable') {
          setError(t('trial.disposableEmail', 'Please use a valid email address. Temporary emails are not allowed.'));
        } else {
          setError(t('authErrors.invalidEmailProvider', 'Please use a valid email provider (Gmail, Outlook, Yahoo, iCloud, etc.)'));
        }
        return;
      }
      
      // Note: We allow registration even if trial was used before
      // The backend will track this and user will see subscription popup after login
    }

    try {
      // 📧 For REGISTRATION: Send verification code first
      if (!isLogin) {
        // Store signup data for after verification
        const signupData = {
          firstName: firstName.trim(),
          lastName: '',
          gender: gender,
          email: email.trim(),
          password,
          country: 'AL'
        };
        
        // Send verification code to email
        const result = await sendVerificationCode(email.trim());
        
        if (result.success) {
          // If skip flag is set (email service issue), proceed directly
          if (result.skip) {
            console.log('📧 Skipping verification - proceeding with registration');
            await completeRegistration(signupData);
            return;
          }
          // Show verification modal
          setPendingSignupData(signupData);
          setShowEmailVerification(true);
          setLoading(false);
          return; // Stop here - wait for verification
        } else {
          setError(result.error || t('authErrors.somethingWrong'));
          setLoading(false);
          return;
        }
      }
      
      // 🔐 For LOGIN: Proceed normally (no verification needed)
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userId = data.user.odId || data.user.userId;
        const userName = data.user.firstName
          ? `${data.user.firstName} ${data.user.lastName || ''}`.trim()
          : data.user.username || email.split('@')[0];

        // 🚀 Set all localStorage in batch for speed
        localStorage.setItem('userId', userId);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', userName);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userCountry', data.user.country || 'AL');
        
        // Check if user has already used their trial (returning user who deleted account)
        if (data.trialUsed || data.user.trialUsed) {
          localStorage.setItem('trial_used_forever', 'true');
          localStorage.setItem('trialExpired', 'true');
        }
        if (data.subscriptionTier || data.user.subscriptionTier) {
          localStorage.setItem('subscriptionTier', data.subscriptionTier || data.user.subscriptionTier);
        }
        
        // Clear any guest data
        localStorage.removeItem('isGuest');
        localStorage.removeItem('guestSession');
        localStorage.removeItem('guestId');

        // 🚀 Immediately proceed to app - no delays
        if (onAuthSuccess) {
          onAuthSuccess({
            userId,
            email: data.user.email,
            userName,
            country: data.user.country || 'AL',
          });
        }
      } else {
        setLoading(false);
        setError(data.error || t('authErrors.somethingWrong'));
      }
    } catch (err) {
      console.error('Auth error:', err);
      setLoading(false);
      setError(t('authErrors.connectionError'));
    }
  };

  if (forgotPasswordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Language Switcher */}
        <div className="fixed top-14 right-4 z-50">
          <LanguageSwitcher />
        </div>
        
        <Card className="bg-slate-900/80 border-purple-500/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-purple-500/20 max-w-md w-full">
          <button
            onClick={() => {
              setForgotPasswordMode(false);
              setResetStep(1);
              setResetEmail('');
              setResetCode('');
              setNewPassword('');
              setError('');
            }}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('tips.back')}</span>
          </button>

          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            <KeyRound className="w-8 h-8 inline-block mr-2" />
            {t('auth.resetPassword')}
          </h2>

          {resetStep === 1 && (
            <div className="space-y-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder={t('auth.email') + " 📧"}
                className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-all"
              />
              <Button
                onClick={async () => {
                  if (!resetEmail.trim()) {
                    setError(t('authErrors.enterEmail'));
                    return;
                  }
                  setLoading(true);
                  try {
                    const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: resetEmail.trim(), language: i18n.language }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setResetStep(2);
                      setSuccessMessage(t('auth.codeSent'));
                      setError('');
                    } else {
                      setError(data.error || t('authErrors.somethingWrong'));
                    }
                  } catch (err) {
                    setError(t('authErrors.connectionError'));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-bold h-14 rounded-xl"
              >
                {loading ? t('common.loading') : t('auth.sendCode')}
              </Button>
            </div>
          )}

          {resetStep === 2 && (
            <div className="space-y-4">
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder={t('auth.sixDigitCode')}
                maxLength={6}
                className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-all text-center text-2xl tracking-widest"
              />
              <Button
                onClick={async () => {
                  if (!resetCode || resetCode.length !== 6) {
                    setError(t('authErrors.enterCode'));
                    return;
                  }
                  setLoading(true);
                  try {
                    const response = await fetch(`${backendUrl}/api/auth/verify-reset-code`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: resetEmail.trim(), code: resetCode }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setResetStep(3);
                      setError('');
                    } else {
                      setError(data.error || t('authErrors.wrongCode'));
                    }
                  } catch (err) {
                    setError(t('authErrors.connectionError'));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-bold h-14 rounded-xl"
              >
                {loading ? t('common.loading') : t('auth.verifyCode')}
              </Button>
            </div>
          )}

          {resetStep === 3 && (
            <div className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('auth.newPassword') + " 🔐"}
                className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-all"
              />
              <Button
                onClick={async () => {
                  if (!newPassword || newPassword.length < 6) {
                    setError(t('authErrors.passwordLength'));
                    return;
                  }
                  setLoading(true);
                  try {
                    const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: resetEmail.trim(),
                        code: resetCode,
                        newPassword,
                      }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setSuccessMessage(t('auth.passwordChanged'));
                      setTimeout(() => {
                        setForgotPasswordMode(false);
                        setIsLogin(true);
                        setResetStep(1);
                        setResetEmail('');
                        setResetCode('');
                        setNewPassword('');
                        setError('');
                        setSuccessMessage('');
                      }, 2000);
                    } else {
                      setError(data.error || t('authErrors.somethingWrong'));
                    }
                  } catch (err) {
                    setError(t('authErrors.connectionError'));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-bold h-14 rounded-xl"
              >
                {loading ? t('common.loading') : t('auth.changePassword')}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-sm text-center">{successMessage}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Language Switcher - Fixed position (pushed down to avoid status bar) */}
      <div className="fixed top-14 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      <div className="w-full max-w-md mt-4">
        {/* Logo & Header - Same as Homepage */}
        <div className="text-center mb-8">
          {/* Logo - Speech bubbles representing conversation */}
          <div className="inline-block mb-5 relative">
            <div className="relative">
              {/* Main speech bubble */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative overflow-hidden animate-bounce-slow">
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                {/* Speech bubble icon */}
                <MessageSquare className="w-12 h-12 text-white relative z-10" fill="currentColor" strokeWidth={1.5} />
                {/* Small sparkle effect */}
                <Sparkles className="w-4 h-4 text-yellow-300 absolute top-2 right-2 animate-pulse" />
              </div>
              {/* Small secondary speech bubble */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* App Name with proper .ai styling */}
          <h1 className="text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
              Biseda
            </span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-4xl">
              .ai
            </span>
          </h1>
          
          {/* Rotating tagline */}
          <div className="h-8 flex items-center justify-center">
            <p className="text-slate-300 text-base font-medium animate-fade-in">
              {taglines[taglineIndex]}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-900/80 border-purple-500/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-purple-500/20">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-md shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('auth.register')}
            </button>
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-md shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('auth.login')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Animated Benefits Carousel - Only show on Register */}
            {!isLogin && (
              <div className="flex items-center justify-center -mt-1 mb-1">
                <div 
                  className="flex items-center justify-center"
                  key={currentBenefit}
                >
                  <div className="flex items-center gap-2 animate-benefit-slide">
                    <span className="text-xl animate-bounce-slow">{benefits[currentBenefit].emoji}</span>
                    <span className="text-white font-medium text-sm">{benefits[currentBenefit].text}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Name & Gender - Only show on Register */}
            {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setError(''); }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-all text-base"
                    placeholder={t('auth.yourName', 'Your Name')}
                      style={{ fontSize: '16px' }}
                      required
                    />
                  </div>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                  <select
                    value={gender}
                    onChange={(e) => { setGender(e.target.value); setError(''); }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition-all text-base appearance-none cursor-pointer"
                      style={{ fontSize: '16px' }}
                      required
                  >
                    <option value="" disabled className="text-slate-500">{t('auth.selectGender', 'Gender')}</option>
                    <option value="male" className="bg-slate-800">{t('auth.male', 'Male')}</option>
                    <option value="female" className="bg-slate-800">{t('auth.female', 'Female')}</option>
                    <option value="other" className="bg-slate-800">{t('auth.other', 'Other')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-all text-base"
                placeholder={t('auth.email', 'Email')}
                style={{ fontSize: '16px' }}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-all text-base"
                placeholder={isLogin ? t('auth.password', 'Password') : t('auth.createPassword', 'Create Password')}
                style={{ fontSize: '16px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator - Only show on Register */}
            {!isLogin && password && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs text-right ${
                  passwordStrength.level <= 2 ? 'text-red-400' : 
                  passwordStrength.level <= 3 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {passwordStrength.label} {passwordStrength.level >= 4 ? '💪' : passwordStrength.level <= 2 ? '⚠️' : ''}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button - Full Width */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-bold h-14 rounded-xl text-base shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <span>{isLogin ? t('auth.login') : t('auth.createAccount')}</span>
                )}
              </Button>

            {/* Apple Sign In Button */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold h-14 rounded-xl text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {isLogin ? t('auth.continueWithApple', 'Continue with Apple') : t('auth.signUpWithApple', 'Sign up with Apple')}
            </button>

            {/* Social Proof */}
            {!isLogin && (
              <div className="text-center pt-2">
                <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                  <span className="flex -space-x-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-xs">💕</span>
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center text-xs">🔥</span>
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-xs">✨</span>
                  </span>
                  <span>{t('auth.socialProof', '10,000+ users finding love')}</span>
                </p>
              </div>
            )}
          </form>

          {/* Forgot Password Link */}
          {isLogin && (
            <div className="mt-4">
              <button
                onClick={() => setForgotPasswordMode(true)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors w-full text-center"
              >
                🔑 {t('auth.forgotPassword')}
              </button>
            </div>
          )}

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs">
              {t('auth.termsAgree')}{' '}
              <span className="text-purple-400 font-medium">{t('auth.terms')} & {t('auth.privacy')}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Age Verification Modal */}
      {showAgeVerification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/95 border-purple-500/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-purple-500/20 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔞</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('ageVerification.title')}</h2>
              <p className="text-slate-400 text-sm">{t('ageVerification.subtitle')}</p>
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {t('ageVerification.selectAge')}
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  className="flex-1 px-4 py-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl text-white text-lg focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                  style={{ fontSize: '18px' }}
                >
                  <option value="" disabled>{t('ageVerification.chooseAge')}</option>
                  {Array.from({ length: 83 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
                <span className="text-slate-300 text-lg font-medium whitespace-nowrap">
                  {t('ageVerification.yearsOld')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGuestLogin}
                disabled={!selectedAge || parseInt(selectedAge) < 18}
                className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-bold h-14 rounded-xl text-base shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ {t('ageVerification.confirm')}
              </Button>
              <button
                onClick={() => setShowAgeVerification(false)}
                className="w-full text-slate-400 hover:text-white py-3 transition-colors text-sm"
              >
                {t('common.cancel')}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              {t('ageVerification.disclaimer')}
            </p>
          </Card>
        </div>
      )}

      {/* 📧 Email Verification Modal */}
      {showEmailVerification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/95 border-purple-500/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-purple-500/20 max-w-md w-full animate-fade-in relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowEmailVerification(false);
                setPendingSignupData(null);
                setVerificationCode('');
                setError('');
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-700/80 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
            
            <div className="text-center">
              {/* Email icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('auth.verifyEmail', 'Verify Your Email')} 📧
              </h2>
              <p className="text-slate-400 mb-2">
                {t('auth.codeSentTo', "We've sent a 6-digit code to:")}
              </p>
              <p className="text-white font-bold mb-6">{pendingSignupData?.email}</p>
              
              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}
              
              {/* Code input */}
              <div className="mb-6">
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              {/* Verify button */}
              <Button
                onClick={verifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold h-14 rounded-xl text-lg shadow-lg mb-4 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('common.loading', 'Verifying...')}
                  </span>
                ) : (
                  <>✅ {t('auth.verifyCode', 'Verify Code')}</>
                )}
              </Button>
              
              {/* Resend code */}
              <button
                onClick={async () => {
                  if (resendCooldown === 0 && pendingSignupData) {
                    await sendVerificationCode(pendingSignupData.email);
                  }
                }}
                disabled={resendCooldown > 0}
                className="text-slate-400 hover:text-white transition-colors text-sm disabled:opacity-50"
              >
                {resendCooldown > 0 
                  ? t('auth.resendIn', { seconds: resendCooldown, defaultValue: `Resend code in ${resendCooldown}s` })
                  : t('auth.resendCode', "Didn't receive code? Resend")}
              </button>
              
              {/* Check spam folder note */}
              <p className="text-slate-500 text-xs mt-4">
                {t('auth.checkSpam', "Can't find it? Check your spam folder")}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Welcome Modal - Shows after successful registration */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/95 border-purple-500/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-purple-500/20 max-w-md w-full animate-fade-in relative">
            {/* Close button - same action as Let's Go */}
            <button
              onClick={() => {
                setShowWelcomeModal(false);
                if (onAuthSuccess && pendingAuthData) {
                  onAuthSuccess(pendingAuthData);
                }
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-700/80 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
            
            <div className="text-center">
              {/* Animated emoji */}
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                  <span className="text-5xl">🎉</span>
                </div>
              </div>

              {/* Welcome text */}
              <h2 className="text-3xl font-bold text-white mb-3">
                {t('auth.welcomeTitle', 'Welcome!')} 🥳
              </h2>
              <p className="text-lg text-slate-300 mb-6">
                {t('auth.welcomeMessage', "Let's level up your dating game! 💕")}
              </p>

              {/* Features preview */}
              <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <span className="text-slate-300 text-sm">{t('auth.feature1', 'AI-powered conversation tips')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <span className="text-slate-300 text-sm">{t('auth.feature2', 'Practice date scenarios')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <span className="text-slate-300 text-sm">{t('auth.feature3', 'Discover perfect date spots')}</span>
                </div>
              </div>

              {/* Continue button */}
              <Button
                onClick={() => {
                  setShowWelcomeModal(false);
                  if (onAuthSuccess && pendingAuthData) {
                    onAuthSuccess(pendingAuthData);
                  }
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold h-14 rounded-xl text-lg shadow-lg transition-all duration-300"
              >
                {t('auth.letsGo', "Let's Go!")} 🚀
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Custom animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes benefit-slide {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.9);
          }
          15% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.9);
          }
        }
        .animate-benefit-slide {
          animation: benefit-slide 2.5s ease-in-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
