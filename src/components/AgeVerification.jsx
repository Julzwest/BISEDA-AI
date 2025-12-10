import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AgeVerification({ onVerified }) {
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if already verified
  useEffect(() => {
    const verified = localStorage.getItem('ageVerified');
    const verifiedDate = localStorage.getItem('ageVerifiedDate');
    
    // Re-verify every 30 days for security
    if (verified === 'true' && verifiedDate) {
      const daysSince = (Date.now() - parseInt(verifiedDate)) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) {
        onVerified(true);
      } else {
        localStorage.removeItem('ageVerified');
        localStorage.removeItem('ageVerifiedDate');
      }
    }
  }, [onVerified]);

  const verifyAge = () => {
    if (!birthDate) {
      setError(t('ageVerification.enterBirthdate', 'Please enter your birthdate'));
      return;
    }

    setIsVerifying(true);
    setError('');

    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--;
    }

    setTimeout(() => {
      setIsVerifying(false);
      
      if (actualAge >= 18) {
        localStorage.setItem('ageVerified', 'true');
        localStorage.setItem('ageVerifiedDate', Date.now().toString());
        onVerified(true);
      } else {
        setError(t('ageVerification.mustBe18', 'You must be at least 18 years old to use this app'));
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="bg-slate-800 border-slate-700 max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-rose-700 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {t('ageVerification.title', 'Age Verification')}
          </h1>
          <p className="text-slate-400 text-sm">
            {t('ageVerification.subtitle', 'This app contains explicit content and is only for adults 18+')}
          </p>
        </div>

        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <p className="font-semibold mb-1">{t('ageVerification.warning', 'Warning: Explicit Content')}</p>
              <p className="text-amber-300/80">
                {t('ageVerification.warningDesc', 'This app contains explicit sexual content, adult language, and detailed discussions about sex. Only adults 18+ may use this app.')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('ageVerification.birthDate', 'Date of birth')}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setError('');
              }}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={verifyAge}
            disabled={isVerifying || !birthDate}
            className="w-full bg-gradient-to-r from-red-500 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white font-semibold h-12"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('ageVerification.verifying', 'Verifying...')}</span>
              </div>
            ) : (
              t('ageVerification.confirmAge', 'Confirm I am 18+')
            )}
          </Button>

          <Button
            onClick={() => {
              window.location.href = 'https://www.google.com';
            }}
            variant="outline"
            className="w-full border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            {t('ageVerification.notAdult', "I'm not 18+ - Exit")}
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          {t('ageVerification.disclaimer', 'By clicking "Confirm", you confirm that you are 18+ and accept the explicit content of this app.')}
        </p>
      </Card>
    </div>
  );
}

