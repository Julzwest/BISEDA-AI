import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, Eye, Lock, Trash2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 pt-16 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 hover:bg-slate-800 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              {t('legal.privacyPolicy', 'Privacy Policy')}
            </h1>
            <p className="text-slate-400 text-sm">Last updated: December 2024</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-slate-300">
          {/* Introduction */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              {t('legal.introduction', 'Introduction')}
            </h2>
            <p className="text-sm leading-relaxed">
              Biseda.ai ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our mobile application.
            </p>
          </section>

          {/* Data Collection */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3">
              {t('legal.dataCollection', 'Information We Collect')}
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Account Information:</strong> Email address, name, and gender when you register.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Usage Data:</strong> How you interact with the app, features used, and preferences.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Chat Data:</strong> Conversations with our AI are processed to provide advice but not permanently stored.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Screenshots:</strong> Images you upload are analyzed and immediately deleted after processing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Device Information:</strong> Device type, OS version, and app version for troubleshooting.</span>
              </li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3">
              {t('legal.howWeUse', 'How We Use Your Information')}
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Provide personalized dating advice and coaching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Improve our AI models and service quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Process payments and manage subscriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Send important updates about your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>We do NOT sell your personal data to third parties</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-400" />
              {t('legal.dataSecurity', 'Data Security')}
            </h2>
            <p className="text-sm leading-relaxed">
              We implement industry-standard security measures including encryption, 
              secure servers, and regular security audits. Your payment information 
              is processed securely through Apple's payment system and is never stored 
              on our servers.
            </p>
          </section>

          {/* Your Rights */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              {t('legal.yourRights', 'Your Rights')}
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Access:</strong> Request a copy of your personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Correction:</strong> Update or correct your information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Deletion:</strong> Request deletion of your account and data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Export:</strong> Download your data in a portable format</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-5 border border-purple-500/30">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" />
              {t('legal.contact', 'Contact Us')}
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              If you have questions about this Privacy Policy or wish to exercise 
              your rights, please contact us at:
            </p>
            <a 
              href="mailto:privacy@biseda.ai" 
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              privacy@biseda.ai
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
