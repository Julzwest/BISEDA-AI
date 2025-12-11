import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Heart, Lock, AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdultVerificationModal({ isOpen, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [hasAccepted, setHasAccepted] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (hasAccepted) {
      // Store verification in localStorage
      localStorage.setItem('adultContentVerified', 'true');
      localStorage.setItem('adultContentVerifiedAt', new Date().toISOString());
      onConfirm();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
    >
      <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-pink-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-slate-700/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mb-4 shadow-lg shadow-pink-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('intimacy.ageVerification.title', 'Adult Content')}
          </h2>
          <p className="text-slate-400 text-sm">
            {t('intimacy.ageVerification.subtitle', 'This section contains mature content for adults only')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-300 font-semibold text-sm">
                {t('intimacy.ageVerification.warning', '18+ Only')}
              </h3>
              <p className="text-amber-200/70 text-xs mt-1">
                {t('intimacy.ageVerification.warningText', 'This section contains educational content about intimacy and sexual wellness intended for adults only.')}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {t('intimacy.features.education', 'Intimacy Education')}
                </p>
                <p className="text-slate-400 text-xs">
                  {t('intimacy.features.educationDesc', 'Professional guidance like a sex therapist')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {t('intimacy.features.private', 'Private & Confidential')}
                </p>
                <p className="text-slate-400 text-xs">
                  {t('intimacy.features.privateDesc', 'Your conversations are private and secure')}
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-all">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                hasAccepted 
                  ? 'bg-pink-500 border-pink-500' 
                  : 'border-slate-500 hover:border-pink-400'
              }`}>
                {hasAccepted && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-slate-300 text-sm">
              {t('intimacy.ageVerification.confirm', 'I confirm that I am 18 years of age or older and consent to viewing adult educational content.')}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={!hasAccepted}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              hasAccepted
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-lg shadow-pink-500/30'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {t('intimacy.ageVerification.enter', 'Enter Intimacy Coach')}
          </Button>
          
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-400 hover:text-white text-sm font-medium transition-all"
          >
            {t('intimacy.ageVerification.cancel', 'Go Back')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
