import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Ban, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 pt-16 pb-4 px-4">
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
              <FileText className="w-6 h-6 text-purple-400" />
              {t('legal.termsOfService', 'Terms of Service')}
            </h1>
            <p className="text-slate-400 text-sm">Last updated: December 2024</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-slate-300">
          {/* Agreement */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3">
              {t('legal.agreement', 'Agreement to Terms')}
            </h2>
            <p className="text-sm leading-relaxed">
              By accessing or using Biseda.ai, you agree to be bound by these Terms of Service. 
              If you disagree with any part of the terms, you may not access the service.
              You must be at least 18 years old to use this application.
            </p>
          </section>

          {/* Service Description */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3">
              {t('legal.serviceDesc', 'Service Description')}
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              Biseda.ai is an AI-powered dating assistant that provides:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Personalized dating advice and conversation suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Screenshot analysis for dating app conversations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Practice scenarios for building confidence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Body language interpretation guidance</span>
              </li>
            </ul>
          </section>

          {/* Subscriptions */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              {t('legal.subscriptions', 'Subscriptions & Payments')}
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Subscriptions are billed monthly through Apple's App Store</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Auto-renewal can be turned off in your App Store settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Cancellations take effect at the end of the billing period</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Refunds are handled according to Apple's refund policy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Credit limits reset monthly; unused credits do not roll over</span>
              </li>
            </ul>
          </section>

          {/* Prohibited Uses */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              {t('legal.prohibited', 'Prohibited Uses')}
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              You agree NOT to use Biseda.ai to:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Harass, abuse, or harm another person</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Send spam or unsolicited messages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Impersonate others or misrepresent your identity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Upload illegal, harmful, or inappropriate content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Attempt to bypass credit limits or abuse free trials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Reverse engineer or copy our AI technology</span>
              </li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/30">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              {t('legal.disclaimer', 'Disclaimer')}
            </h2>
            <p className="text-sm leading-relaxed">
              Biseda.ai provides AI-generated suggestions for entertainment and educational 
              purposes. We do not guarantee dating success or relationship outcomes. 
              The advice provided should not be considered professional counseling. 
              Users are responsible for their own actions and decisions in their 
              personal relationships.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400" />
              {t('legal.liability', 'Limitation of Liability')}
            </h2>
            <p className="text-sm leading-relaxed">
              To the maximum extent permitted by law, Biseda.ai shall not be liable 
              for any indirect, incidental, special, consequential, or punitive damages, 
              including but not limited to loss of profits, data, or other intangible losses, 
              resulting from your use of the service.
            </p>
          </section>

          {/* Changes */}
          <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-3">
              {t('legal.changes', 'Changes to Terms')}
            </h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify 
              users of any material changes via email or in-app notification. 
              Continued use of the service after changes constitutes acceptance 
              of the new terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-5 border border-purple-500/30">
            <h2 className="text-lg font-semibold text-white mb-3">
              {t('legal.questions', 'Questions?')}
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <a 
              href="mailto:legal@biseda.ai" 
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              legal@biseda.ai
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

