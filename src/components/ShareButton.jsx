import React, { useState } from 'react';
import { Share2, X, MessageCircle, Instagram, Copy, Check, Link2 } from 'lucide-react';
import { trackAction } from '@/utils/analytics';

export default function ShareButton({ 
  title, 
  text, 
  url = window.location.href,
  variant = 'icon', // 'icon' | 'button' | 'mini'
  className = ''
}) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title: title || 'Biseda.ai',
    text: text || 'Shiko këtë në Biseda.ai!',
    url: url
  };

  const handleShare = async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackAction('shares');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Native share failed, showing modal');
        }
      }
    }
    
    // Show modal for desktop
    setShowModal(true);
  };

  const shareToWhatsApp = () => {
    const message = `${shareData.text}\n\n${shareData.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    trackAction('shares');
    setShowModal(false);
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct URL sharing, copy to clipboard instead
    copyToClipboard();
    alert('Linku u kopjua! Ngjite në Instagram Stories ose DM.');
  };

  const shareToMessenger = () => {
    window.open(`fb-messenger://share/?link=${encodeURIComponent(shareData.url)}`, '_blank');
    trackAction('shares');
    setShowModal(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      setCopied(true);
      trackAction('shares');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Render variants
  if (variant === 'mini') {
    return (
      <>
        <button
          onClick={handleShare}
          className={`p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all ${className}`}
          title="Shpërndaj"
        >
          <Share2 className="w-4 h-4" />
        </button>
        {showModal && <ShareModal />}
      </>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/50 rounded-xl text-purple-300 font-semibold transition-all ${className}`}
        >
          <Share2 className="w-4 h-4" />
          Shpërndaj
        </button>
        {showModal && <ShareModal />}
      </>
    );
  }

  // Default icon variant
  const ShareModal = () => (
    <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-3xl p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            Shpërndaj
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share options */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={shareToWhatsApp}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-xs text-slate-400">WhatsApp</span>
          </button>

          <button
            onClick={shareToInstagram}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-slate-400">Instagram</span>
          </button>

          <button
            onClick={shareToMessenger}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-slate-400">Messenger</span>
          </button>

          <button
            onClick={copyToClipboard}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 transition-all group"
          >
            <div className={`w-12 h-12 rounded-full ${copied ? 'bg-green-500' : 'bg-slate-600'} flex items-center justify-center group-hover:scale-110 transition-all`}>
              {copied ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Copy className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="text-xs text-slate-400">{copied ? 'Kopjuar!' : 'Kopjo'}</span>
          </button>
        </div>

        {/* URL preview */}
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Link2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{shareData.url}</span>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );

  return (
    <>
      <button
        onClick={handleShare}
        className={`p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all ${className}`}
        title="Shpërndaj"
      >
        <Share2 className="w-5 h-5" />
      </button>
      {showModal && <ShareModal />}
    </>
  );
}

