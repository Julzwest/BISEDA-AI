import React, { useState, useEffect, useRef } from 'react';
import { Clipboard, Sparkles, MessageSquare, Upload, X, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { UNIFIED_AI_SYSTEM_PROMPT } from '@/utils/unifiedAIPrompt';
import UpgradeModal from '@/components/UpgradeModal';
import CreditsModal from '@/components/CreditsModal';
import LimitReachedModal from '@/components/LimitReachedModal';
import { getBackendUrl } from '@/utils/getBackendUrl';

export default function ClipboardSuggestions() {
  const [clipboardText, setClipboardText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recommendedSuggestion, setRecommendedSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usage, setUsage] = useState(null);
  const fileInputRef = useRef(null);
  const backendUrl = getBackendUrl();

  // Check usage on mount and periodically
  useEffect(() => {
    checkUsage();
    // Refresh usage every 10 seconds
    const interval = setInterval(checkUsage, 10000);
    return () => clearInterval(interval);
  }, []);

  // Show limit reached modal when limit is reached
  useEffect(() => {
    if (isLimitReached) {
      setShowLimitModal(true);
    }
  }, [isLimitReached]);

  // Auto-paste on page load - Multiple attempts for reliability
  useEffect(() => {
    // Immediate check
    checkClipboard(true);
    
    // Check again after a short delay (for iOS/simulator)
    const timeout1 = setTimeout(() => {
      checkClipboard(true);
    }, 500);
    
    // Check again after page is fully loaded
    const timeout2 = setTimeout(() => {
      checkClipboard(true);
    }, 1000);
    
    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkClipboard(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen for paste events (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              handleImageSelect(file);
              return;
            }
          }
        }
      }
      const text = e.clipboardData?.getData('text');
      if (text && text.trim()) {
        setClipboardText(text.trim());
        setAutoDetected(true);
        setTimeout(() => setAutoDetected(false), 3000);
        // Auto-generate suggestions when pasting
        setTimeout(() => generateSuggestions(text.trim()), 500);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Check clipboard when app gets focus (user switches back)
  useEffect(() => {
    const handleFocus = async () => {
      // Small delay to ensure clipboard is updated
      setTimeout(() => {
        checkClipboard(true);
      }, 200);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const checkClipboard = async (autoGenerate = false) => {
    // Don't overwrite if user has already entered text manually
    if (clipboardText && !autoDetected) {
      return;
    }
    
    setHasChecked(false);
    try {
      let text = '';
      
      // Try Capacitor clipboard first (for iOS/Android)
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
          const { Clipboard } = await import('@capacitor/clipboard');
          const { value } = await Clipboard.read();
          text = value || '';
        } catch (err) {
          console.log('Capacitor clipboard not available:', err);
        }
      }
      
      // Fallback to web clipboard API
      if (!text && navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
      
      // Only update if we got new text and it's different
      if (text && text.trim() && text.trim() !== clipboardText) {
        setClipboardText(text.trim());
        setAutoDetected(true);
        setTimeout(() => setAutoDetected(false), 3000);
        // Auto-generate suggestions if requested (only if not blocked)
        if (autoGenerate && !isLimitReached) {
          setTimeout(() => generateSuggestions(text.trim()), 500);
        }
      }
    } catch (err) {
      // Clipboard access denied or not available - this is normal on some browsers
      console.log('Clipboard access:', err.message);
    }
    setHasChecked(true);
  };

  const handleManualInput = (e) => {
    setClipboardText(e.target.value);
    setAutoDetected(false);
  };

  const handlePasteButton = async () => {
    await checkClipboard(true); // Auto-generate after pasting
  };

  const handleImageSelect = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageDataUrl(reader.result);
      setClipboardText('');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageDataUrl(null);
  };

  // Check usage limits before generating
  const checkUsage = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/usage`);
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
        // Block if: no remaining messages AND no credits
        const isBlocked =
          data.dailyUsage.remainingMessages === 0 &&
          (!data.credits || data.credits === 0);
        setIsLimitReached(isBlocked);
        return !isBlocked;
      }
    } catch (error) {
      console.error('Error checking usage:', error);
    }
    return true; // Allow if check fails (fail open for better UX)
  };

  const generateSuggestions = async (text) => {
    if (!text.trim() && !imageDataUrl) return;
    
    // Check limit before generating
    const canProceed = await checkUsage();
    if (!canProceed || isLimitReached) {
      // Show upgrade modal
      setShowUpgradeModal(true);
      return;
    }
    
    setIsLoading(true);
    setSuggestions([]);
    setRecommendedSuggestion(null);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: text || 'Analyze this image and generate chat responses',
        file_urls: imageDataUrl ? [imageDataUrl] : [],
        conversationHistory: [],
        systemPrompt: UNIFIED_AI_SYSTEM_PROMPT + '\n\nTi duhet të gjenerosh 5 përgjigje të ndryshme për mesazhin e kopjuar. Jipu përgjigje të shkurtra, smooth, dhe me personalitet.'
      });

      if (response) {
        const aiResponse = typeof response === 'string' ? response : response.response || JSON.stringify(response);
        
        // Parse the response to extract suggestions
        const lines = aiResponse.split('\n').filter(line => line.trim());
        const extractedSuggestions = [];
        let currentSuggestion = '';

        for (const line of lines) {
          const trimmed = line.trim();
          // Check if line starts with number or bullet
          if (/^[\d\.\)\-\*]/.test(trimmed) || trimmed.startsWith('•') || trimmed.startsWith('⭐')) {
            if (currentSuggestion) {
              extractedSuggestions.push(currentSuggestion.trim());
            }
            currentSuggestion = trimmed.replace(/^[\d\.\)\-\*\⭐\s]+/, '');
          } else if (trimmed && currentSuggestion) {
            currentSuggestion += ' ' + trimmed;
          } else if (trimmed && extractedSuggestions.length === 0) {
            currentSuggestion = trimmed;
          }
        }

        if (currentSuggestion) {
          extractedSuggestions.push(currentSuggestion.trim());
        }

        // If we couldn't parse properly, split by common delimiters
        if (extractedSuggestions.length === 0) {
          const splitBy = aiResponse.split(/\n\n|\n(?=\d+[\.\)])|\n(?=[•\-\*])/);
          extractedSuggestions.push(...splitBy.filter(s => s.trim().length > 10).slice(0, 5));
        }

        // Ensure we have at least 5 suggestions
        while (extractedSuggestions.length < 5 && extractedSuggestions.length > 0) {
          extractedSuggestions.push(...extractedSuggestions);
        }

        const finalSuggestions = extractedSuggestions.slice(0, 5);
        
        // Find recommended response (usually marked with ⭐ or "recommended" or first one)
        const recommendedMatch = aiResponse.match(/⭐[^\n]+|recommended[^\n]+/i);
        const recommended = recommendedMatch 
          ? recommendedMatch[0].replace(/⭐|recommended/gi, '').trim()
          : finalSuggestions[0];

        setSuggestions(finalSuggestions);
        setRecommendedSuggestion(recommended);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      
      // Check if it's a limit error from backend
      if (error.code === 'LIMIT_EXCEEDED' || 
          error.message?.includes('limit') || 
          error.message?.includes('Limiti') ||
          error.message?.includes('Limiti ditor')) {
        setIsLimitReached(true);
        setShowUpgradeModal(true);
        return;
      }
      
      if (error.code === 'LIMIT_EXCEEDED' ||
          error.message?.includes('Daily message limit')) {
        setIsLimitReached(true);
        await checkUsage(); // Refresh usage
        setSuggestions([]);
        setRecommendedSuggestion(null);
        alert('Limiti ditor u arrit! Përmirëso planin ose bli kredite për të vazhduar.');
      } else {
        setSuggestions([error.message || 'Na vjen keq, ka ndodhur një gabim. Provo përsëri.']);
        setRecommendedSuggestion(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromImage = () => {
    if (imageDataUrl) {
      generateSuggestions('');
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950" style={{ height: '100%' }}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-6 pt-20 pb-4 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <MessageSquare className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-slate-900" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-1">
          Biseda Chat
        </h1>
        <p className="text-xs text-slate-400">Kopjo → Merr përgjigje → Kopjo përsëri</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Image Upload */}
        {imageDataUrl ? (
          <div className="mb-4">
            <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 border-2 border-purple-500/50 backdrop-blur-sm">
              <div className="p-4">
                <div className="relative mb-4">
                  <img
                    src={imageDataUrl}
                    alt="Screenshot"
                    className="w-full rounded-lg max-h-48 object-contain"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <Button
                  onClick={async () => {
                    const canProceed = await checkUsage();
                    if (!canProceed || isLimitReached) {
                      setShowUpgradeModal(true);
                      return;
                    }
                    handleGenerateFromImage();
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isLimitReached}
                >
                  {isLoading ? 'Duke analizuar...' : isLimitReached ? 'Limiti u arrit - Përmirëso' : 'Analizo & Gjenero'}
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLimitReached}
            className={`w-full mb-4 p-6 border-2 border-dashed rounded-xl transition-all ${
              isLimitReached
                ? 'border-red-500/50 opacity-50 cursor-not-allowed bg-slate-800/50'
                : 'border-purple-500/50 hover:border-purple-400 bg-gradient-to-br from-purple-500/10 to-pink-500/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageSelect(file);
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-purple-400" />
              <p className="text-sm font-medium text-white">Ngarko screenshot</p>
              <p className="text-xs text-slate-400">Kliko ose ngjiteje</p>
            </div>
          </button>
        )}

        {/* Auto-detected Notification */}
        {autoDetected && (
          <div className="mb-3 p-2 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-xs text-green-300 text-center">✨ U detektua automatikisht!</p>
          </div>
        )}

        {/* Text Input */}
        {!imageDataUrl && (
          <div className="mb-4">
            <div className="relative">
              <textarea
                value={clipboardText}
                onChange={handleManualInput}
                placeholder={isLimitReached ? "🚫 Limiti u arrit - Përmirëso për të vazhduar" : hasChecked ? "💬 Shkruaj ose kopjo mesazhin këtu..." : "⏳ Duke kontrolluar..."}
                className={`w-full p-4 pr-24 pb-16 bg-slate-800/80 border-2 rounded-xl text-white placeholder-slate-400 focus:outline-none resize-none ${isLimitReached ? 'border-red-500/50 opacity-60' : 'border-purple-500/30 focus:border-purple-500'}`}
                rows={3}
                style={{ fontSize: '16px' }}
                disabled={isLimitReached}
              />
              <div className="absolute bottom-2 right-2 flex flex-col gap-2">
                <button
                  onClick={handlePasteButton}
                  disabled={isLimitReached}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${
                    isLimitReached 
                      ? 'bg-slate-600 opacity-50 cursor-not-allowed' 
                      : 'bg-cyan-500 hover:bg-cyan-400'
                  }`}
                >
                  Ngjite
                </button>
                {clipboardText && (
                  <button
                    onClick={() => generateSuggestions(clipboardText)}
                    disabled={isLoading || isLimitReached}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '...' : isLimitReached ? 'Limiti u arrit' : 'Gjenero'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 mt-4 text-sm">Duke gjeneruar përgjigje...</p>
          </div>
        )}

        {/* Suggestions - Show below input section */}
        {!isLoading && (suggestions.length > 0 || recommendedSuggestion) && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              <h2 className="text-base font-bold text-white">Përgjigje të sugjeruara</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            </div>

            {/* Recommended */}
            {recommendedSuggestion && (
              <Card className="mb-4 bg-gradient-to-br from-yellow-500/30 via-amber-500/30 to-orange-500/30 border-2 border-yellow-400/50">
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 text-slate-900 font-bold text-sm">
                      ⭐
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-yellow-300 uppercase">Rekomanduar</span>
                      </div>
                      <p className="text-white text-sm leading-relaxed mb-3">{recommendedSuggestion}</p>
                      <Button
                        onClick={() => copyToClipboard(recommendedSuggestion, 'recommended')}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-xs"
                      >
                        {copiedIndex === 'recommended' ? (
                          <span className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            U kopjua!
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            Kopjo
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Regular Suggestions */}
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="bg-slate-800/80 border border-purple-500/30">
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                        {index + 1}
                      </div>
                      <p className="text-white text-sm leading-relaxed flex-1">{suggestion}</p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(suggestion, index)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs"
                    >
                      {copiedIndex === index ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          U kopjua!
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Copy className="w-4 h-4" />
                          Kopjo
                        </span>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && suggestions.length === 0 && !clipboardText && !imageDataUrl && hasChecked && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📱</div>
            <p className="text-slate-400 text-sm">Kopjo mesazh ose ngarko screenshot</p>
          </div>
        )}
      </div>

      {/* Limit Reached Notification Modal */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          setShowUpgradeModal(true);
        }}
      />

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        onSelectPlan={(plan) => {
          // Plan selection is handled inside UpgradeModal
          setShowUpgradeModal(false);
        }}
      />
    </div>
  );
}
