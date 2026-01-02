import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/SaveButton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Lightbulb, MessageSquare, Heart, Sparkles, TrendingUp, Shield, Upload, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import UpgradeModal from '@/components/UpgradeModal';
import { getBackendUrl } from '@/utils/getBackendUrl';

export default function Tips() {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Get current language for prompts
  const currentLang = i18n.language || 'en';
  const isAlbanian = currentLang === 'sq' || currentLang.startsWith('sq');
  const [customQuestion, setCustomQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // Initially show 5 tips for faster loading
  const [copiedIndex, setCopiedIndex] = useState(null); // Track which item was copied
  const backendUrl = getBackendUrl();

  // Language-aware prompts
  const getPrompt = (type) => {
    const langInstruction = isAlbanian ? 'Shkruaj në shqip.' : `Write in ${currentLang === 'en' ? 'English' : currentLang}.`;
    
    const prompts = {
      first_message: `Write 15 original first messages for dating apps.

RULES:
- ${langInstruction}
- Each message 1-2 sentences maximum  
- Creative, flirty, and interesting
- Not cringy or boring

FORMAT (one message per line):
1. "Message here"
2. "Next message"

Now write 15 new creative messages:`,
      conversation: `Give advice on how to keep an interesting conversation going. How to avoid awkward moments and how to create emotional connection. ${langInstruction}`,
      compliments: `Give 20 creative and authentic compliments that can be used in conversations. Not the usual ones, but something that really makes an impression. Format each on a separate line. ${langInstruction}`,
      red_flags: `List red flags to avoid when talking to someone you're interested in. Things that should be avoided absolutely. ${langInstruction}`,
      confidence: `Give practical advice on how to increase your confidence when talking to someone you're interested in. Tips for body language, mindset and attitude. ${langInstruction}`
    };
    return prompts[type];
  };

  const categories = [
    {
      id: 'first_message',
      icon: MessageSquare,
      title: t('tips.firstMessage'),
      color: 'from-blue-500 to-cyan-600',
      prompt: getPrompt('first_message')
    },
    {
      id: 'conversation',
      icon: TrendingUp,
      title: t('tips.keepConversation'),
      color: 'from-green-500 to-emerald-600',
      prompt: getPrompt('conversation')
    },
    {
      id: 'compliments',
      icon: Heart,
      title: t('tips.compliments'),
      color: 'from-pink-500 to-rose-600',
      prompt: getPrompt('compliments')
    },
    {
      id: 'red_flags',
      icon: Shield,
      title: t('tips.redFlags'),
      color: 'from-red-500 to-orange-600',
      prompt: getPrompt('red_flags')
    },
    {
      id: 'confidence',
      icon: Sparkles,
      title: t('tips.confidence'),
      color: 'from-purple-500 to-indigo-600',
      prompt: getPrompt('confidence')
    }
  ];

  const handleCategoryClick = async (category) => {
    if (category.special === 'screenshot') {
      setSelectedCategory(category);
      return;
    }

    // Check limit before sending
    const canProceed = await checkUsage();
    if (!canProceed || isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    setSelectedCategory(category);
    setAnswer(null);
    setConversation([]);
    setVisibleCount(5); // Reset visible count
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: category.prompt
      });
      
      // Filter and clean the response for first_message category
      let cleanedResponse = response;
      if (category.id === 'first_message') {
        // Split by numbered items and filter valid Albanian lines
        const lines = response.split(/\n|(?=\d+[\.\)])/);
        const validLines = lines.filter(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.length < 15 || trimmed.length > 200) return false;
          
          // Must start with a number or quote
          if (!trimmed.match(/^\d+[\.\)]/) && !trimmed.startsWith('"')) return false;
          
          // Check for gibberish patterns
          const hasGibberish = /[а-яА-Я\u4e00-\u9fff\u0600-\u06ff\u0590-\u05ff]/.test(trimmed) || // Non-Latin scripts
                              /\b[a-z]{1,2}\d+\b/i.test(trimmed) || // Code-like patterns (a12, b3, etc)
                              /[_\{\}\[\]<>\\\/\|@#\$%\^&\*\+=]/.test(trimmed) || // Code symbols
                              /\.\w+\.\w+/.test(trimmed) || // file.extension patterns
                              /[A-Z]{3,}/.test(trimmed) || // All caps words (like CE, ABC)
                              /\b(null|undefined|function|class|const|var|let|import|export|true|false)\b/i.test(trimmed); // Code keywords
          
          if (hasGibberish) return false;
          
          // Check for gibberish words (very long words, unusual patterns)
          const words = trimmed.replace(/[^\w\sëËçÇ]/g, '').split(/\s+/);
          const hasWeirdWords = words.some(word => {
            if (word.length > 15) return true; // Too long for Albanian
            if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(word)) return true; // Too many consonants in a row
            return false;
          });
          
          if (hasWeirdWords) return false;
          
          // Check if line contains mostly Latin/Albanian characters  
          const albanianChars = trimmed.match(/[a-zA-ZëËçÇ\s\d\.\,\!\?\-\"\']+/g);
          const albanianRatio = albanianChars ? albanianChars.join('').length / trimmed.length : 0;
          
          return albanianRatio > 0.9;
        });
        cleanedResponse = validLines.slice(0, 15).join('\n');
      }
      
      setAnswer(cleanedResponse);
      setConversation([{ question: category.title, answer: cleanedResponse }]);
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'LIMIT_EXCEEDED' || error.message?.includes('Limiti ditor')) {
        setIsLimitReached(true);
        setShowUpgradeModal(true);
      }
    }

    setIsLoading(false);
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setScreenshot(result.file_url);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setIsLoading(false);
  };

  const analyzeScreenshot = async () => {
    if (!screenshot) return;

    // Check limit before sending
    const canProceed = await checkUsage();
    if (!canProceed || isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setConversation([]);
    setVisibleCount(5); // Reset visible count
    try {
      const langInstruction = isAlbanian ? 'Përgjigju në shqip.' : `Respond in ${currentLang === 'en' ? 'English' : currentLang}.`;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this screenshot of a conversation. Give detailed feedback. ${langInstruction}
        
1. What's going well in this conversation
2. What could be improved
3. Specific suggestions for future responses
4. Overall rating 1-10

${customQuestion ? `\nSpecific question: ${customQuestion}` : ''}`,
        file_urls: [screenshot]
      });
      setAnswer(response);
      setConversation([{ question: t('tips.chatAnalysis', 'Chat Analysis'), answer: response }]);
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'LIMIT_EXCEEDED' || error.message?.includes('Limiti ditor')) {
        setIsLimitReached(true);
        setShowUpgradeModal(true);
      }
    }
    setIsLoading(false);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Check usage limits
  // Everything is FREE - no limits!
  const checkUsage = async () => {
    setIsLimitReached(false);
    return true; // Always allow - everything is free!
  };

  useEffect(() => {
    checkUsage();
  }, []);

  const askCustomQuestion = async () => {
    if (!customQuestion.trim()) return;

    // Check limit before sending
    const canProceed = await checkUsage();
    if (!canProceed || isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setAnswer(null);
    setConversation([]);
    setVisibleCount(5); // Reset visible count

    try {
      const langInstruction = isAlbanian ? 'Përgjigju në shqip.' : `Respond in ${currentLang === 'en' ? 'English' : currentLang}.`;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Answer this question about dating and relationships: ${customQuestion}\n\nGive detailed and practical advice. ${langInstruction}`
      });
      setAnswer(response);
      setConversation([{ question: customQuestion, answer: response }]);
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'LIMIT_EXCEEDED' || error.message?.includes('Limiti ditor')) {
        setIsLimitReached(true);
        setShowUpgradeModal(true);
      }
    }

    setIsLoading(false);
  };

  const askFollowUp = async () => {
    if (!followUpQuestion.trim() || isLoading) return;

    // Check limit before sending
    const canProceed = await checkUsage();
    if (!canProceed || isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    const newQuestion = followUpQuestion;
    setFollowUpQuestion('');
    setIsLoading(true);

    try {
      const conversationContext = conversation.map(c => `Question: ${c.question}\nAnswer: ${c.answer}`).join('\n\n');
      const langInstruction = isAlbanian ? 'Përgjigju në shqip.' : `Respond in ${currentLang === 'en' ? 'English' : currentLang}.`;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `This is the context of the previous conversation:

${conversationContext}

New question: ${newQuestion}

Respond based on the previous context. Give detailed and practical advice. ${langInstruction}`
      });

      setConversation(prev => [...prev, { question: newQuestion, answer: response }]);
      setAnswer(response);
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'LIMIT_EXCEEDED' || error.message?.includes('Limiti ditor')) {
        setIsLimitReached(true);
        setShowUpgradeModal(true);
      }
    }

    setIsLoading(false);
  };

  // Generate more first liners
  const generateMoreFirstLiners = async () => {
    if (isLoading) return;
    
    // Check limit before sending
    const canProceed = await checkUsage();
    if (!canProceed || isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const langInstruction = isAlbanian ? 'Shkruaj në shqip.' : `Write in ${currentLang === 'en' ? 'English' : currentLang}.`;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Write 10 new original first messages for dating apps.

RULES:
- ${langInstruction}
- Each message 1-2 sentences maximum  
- Creative, flirty or funny
- Not cringy, not common
- Must be DIFFERENT from previous messages

FORMAT (one message per line):
1. "Message here"
2. "Next message"

Now write 10 COMPLETELY new messages:`
      });
      
      // Filter the new response
      const lines = response.split(/\n|(?=\d+[\.\)])/);
      const validLines = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length < 15 || trimmed.length > 200) return false;
        if (!trimmed.match(/^\d+[\.\)]/) && !trimmed.startsWith('"')) return false;
        
        const hasGibberish = /[а-яА-Я\u4e00-\u9fff\u0600-\u06ff\u0590-\u05ff]/.test(trimmed) ||
                            /\b[a-z]{1,2}\d+\b/i.test(trimmed) ||
                            /[_\{\}\[\]<>\\\/\|@#\$%\^&\*\+=]/.test(trimmed) ||
                            /\.\w+\.\w+/.test(trimmed) ||
                            /[A-Z]{3,}/.test(trimmed) ||
                            /\b(null|undefined|function|class|const|var|let|import|export|true|false)\b/i.test(trimmed);
        
        if (hasGibberish) return false;
        
        const words = trimmed.replace(/[^\w\sëËçÇ]/g, '').split(/\s+/);
        const hasWeirdWords = words.some(word => {
          if (word.length > 15) return true;
          if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(word)) return true;
          return false;
        });
        
        if (hasWeirdWords) return false;
        
        const albanianChars = trimmed.match(/[a-zA-ZëËçÇ\s\d\.\,\!\?\-\"\']+/g);
        const albanianRatio = albanianChars ? albanianChars.join('').length / trimmed.length : 0;
        
        return albanianRatio > 0.9;
      });
      
      const cleanedResponse = validLines.slice(0, 10).join('\n');
      
      // Append to existing answer
      if (answer) {
        const newAnswer = answer + '\n' + cleanedResponse;
        setAnswer(newAnswer);
        setConversation([{ question: selectedCategory?.title || 'Mesazhi i parë', answer: newAnswer }]);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'LIMIT_EXCEEDED' || error.message?.includes('Limiti ditor')) {
        setIsLimitReached(true);
        setShowUpgradeModal(true);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="px-4 pt-2 pb-4 w-full max-w-full overflow-x-hidden">
      {/* Header - Centered like other pages */}
      <div className="mb-6 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-pulse">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-slate-900" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{t('tips.title')}</h1>
        <p className="text-slate-400 text-sm">{t('tips.subtitle')}</p>
      </div>

      <div className="px-0 py-4">
        {!selectedCategory && !answer && (
          <div className="space-y-6">
            {/* Categories Grid */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                {t('tips.categories')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl backdrop-blur-sm hover:bg-slate-800/70 transition-all cursor-pointer active:scale-95 p-4 text-left touch-manipulation"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white text-sm">
                        {category.title}
                      </h3>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Question */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t('tips.askQuestion')}
              </h3>
              <Textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder={t('tips.questionPlaceholder')}
                className="bg-slate-900 border-slate-700 text-white mb-3 min-h-[100px]"
              />
              <Button
                onClick={askCustomQuestion}
                disabled={!customQuestion.trim() || isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold"
              >
                {isLoading ? t('tips.preparing') : t('tips.getAnswer')}
              </Button>
            </Card>
          </div>
        )}

        {/* Screenshot Analysis UI */}
        {selectedCategory?.special === 'screenshot' && !answer && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCategory(null);
                setScreenshot(null);
                setCustomQuestion('');
              }}
              className="text-slate-400 hover:text-white mb-2"
            >
              ← {t('tips.back')}
            </Button>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
              <h2 className="text-lg font-bold text-white mb-4">{t('tips.analyzeYourChat', 'Analyze your chat')}</h2>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload">
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-slate-600 transition-colors">
                      {screenshot ? (
                        <div className="space-y-2">
                          <img 
                            src={screenshot} 
                            alt="Screenshot" 
                            className="w-full h-64 object-contain rounded-lg"
                          />
                          <p className="text-sm text-green-400">✓ {t('tips.screenshotUploaded', 'Screenshot uploaded')}</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                          <p className="text-sm text-slate-400">
                            {t('tips.uploadScreenshot', 'Upload chat screenshot')}
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <Textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder={t('tips.specificQuestion', 'Specific question? (optional)')}
                  className="bg-slate-900 border-slate-700 text-white"
                />

                <Button
                  onClick={analyzeScreenshot}
                  disabled={!screenshot || isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
                >
                  {isLoading ? t('tips.analyzing', 'Analyzing...') : t('tips.analyze', 'Analyze')}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Answer Display */}
        {(answer || isLoading) && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCategory(null);
                setAnswer(null);
                setCustomQuestion('');
                setScreenshot(null);
                setConversation([]);
                setFollowUpQuestion('');
                setVisibleCount(5); // Reset visible count
              }}
              className="text-slate-400 hover:text-white"
            >
              ← {t('tips.back')}
            </Button>

            {/* Conversation History */}
            <div className="space-y-4">
              {conversation.map((item, index) => (
                <div key={index}>
                  {/* Question */}
                  <div className="mb-3 flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800/70 rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
                      <p className="text-white font-medium">{item.question}</p>
                    </div>
                  </div>

                  {/* Screenshot if exists */}
                  {index === 0 && screenshot && (
                    <img 
                      src={screenshot} 
                      alt="Reference" 
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}

                  {/* Answer with visual formatting */}
                  <div className="ml-10 space-y-3">
                    {(() => {
                      // Better parsing: split by single newlines first, then numbered items
                      let sections = item.answer.split('\n').filter(s => s.trim());
                      
                      // If not many sections, try to split by numbered items
                      if (sections.length <= 3) {
                        const numberedSplit = item.answer.split(/(?=\d+[\.\)]\s)/);
                        if (numberedSplit.length > sections.length) {
                          sections = numberedSplit.filter(s => s.trim());
                        }
                      }
                      
                      // If still not many, try double newlines
                      if (sections.length <= 3) {
                        const doubleSplit = item.answer.split('\n\n').filter(s => s.trim());
                        if (doubleSplit.length > sections.length) {
                          sections = doubleSplit;
                        }
                      }
                      
                      return sections;
                    })().slice(0, visibleCount).map((section, sIndex) => {
                      const colorSchemes = [
                        { bg: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/40', dot: 'from-blue-400 to-cyan-500', text: 'text-blue-100' },
                        { bg: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/40', dot: 'from-purple-400 to-pink-500', text: 'text-purple-100' },
                        { bg: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/40', dot: 'from-green-400 to-emerald-500', text: 'text-green-100' },
                        { bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/40', dot: 'from-amber-400 to-orange-500', text: 'text-amber-100' },
                        { bg: 'from-rose-500/20 to-red-500/10', border: 'border-rose-500/40', dot: 'from-rose-400 to-red-500', text: 'text-rose-100' },
                        { bg: 'from-indigo-500/20 to-blue-500/10', border: 'border-indigo-500/40', dot: 'from-indigo-400 to-blue-500', text: 'text-indigo-100' },
                        { bg: 'from-teal-500/20 to-cyan-500/10', border: 'border-teal-500/40', dot: 'from-teal-400 to-cyan-500', text: 'text-teal-100' },
                        { bg: 'from-fuchsia-500/20 to-purple-500/10', border: 'border-fuchsia-500/40', dot: 'from-fuchsia-400 to-purple-500', text: 'text-fuchsia-100' }
                      ];

                      // Check if it's a heading (starts with ###)
                      if (section.trim().startsWith('###')) {
                        const title = section.replace(/^###\s*\d*\.?\s*/, '').trim();
                        const emoji = ['🎯', '💡', '✨', '🚀', '💪', '🔥', '⭐', '🎨'][sIndex % 8];
                        const colors = colorSchemes[sIndex % colorSchemes.length];
                        return (
                          <div key={sIndex} className="flex items-center gap-3 mt-6 mb-3">
                            <span className="text-2xl">{emoji}</span>
                            <h3 className={`text-lg font-bold ${colors.text}`}>{title}</h3>
                          </div>
                        );
                      }

                      // Check if it's a bullet list section
                      const lines = section.split('\n');
                      const bullets = lines.filter(line => line.trim().startsWith('-') || line.trim().startsWith('_'));

                      if (bullets.length > 0) {
                        return (
                          <div key={sIndex} className="space-y-2">
                            {bullets.map((bullet, bIndex) => {
                              const text = bullet.replace(/^[-_]\s*\*?\*?/, '').replace(/\*\*:/g, ':').replace(/\*\*/g, '').trim();
                              if (!text) return null;

                              const colors = colorSchemes[(sIndex + bIndex) % colorSchemes.length];
                              return (
                                <Card key={bIndex} className={`bg-gradient-to-br ${colors.bg} ${colors.border} backdrop-blur-sm p-4 hover:scale-[1.02] transition-transform`}>
                                  <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 bg-gradient-to-br ${colors.dot} rounded-full mt-2 shrink-0`} />
                                    <p className="text-white leading-relaxed flex-1">{text}</p>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        );
                      }

                      // Regular paragraph or numbered item
                      if (section.trim()) {
                        const colors = colorSchemes[sIndex % colorSchemes.length];
                        // Clean up the text - remove number prefix if present
                        const cleanText = section.trim().replace(/^\d+[\.\)]\s*/, '').replace(/^[""]|[""]$/g, '').trim();
                        // Use sequential numbering (sIndex + 1) instead of extracted number
                        const displayNumber = sIndex + 1;
                        const uniqueIndex = `${index}-${sIndex}`; // Unique index for each message
                        
                        return (
                          <Card key={sIndex} className={`bg-gradient-to-br ${colors.bg} ${colors.border} backdrop-blur-sm p-4 hover:scale-[1.01] transition-transform`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 bg-gradient-to-br ${colors.dot} rounded-full flex items-center justify-center shrink-0`}>
                                <span className="text-white font-bold text-xs">{displayNumber}</span>
                              </div>
                              <p className="text-white leading-relaxed flex-1">{cleanText || section.trim()}</p>
                              <button
                                onClick={() => copyToClipboard(cleanText || section.trim(), uniqueIndex)}
                                className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Copy to clipboard"
                              >
                                {copiedIndex === uniqueIndex ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
                                )}
                              </button>
                            </div>
                          </Card>
                        );
                      }

                      return null;
                    })}

                    {/* Load More Button */}
                    {(() => {
                      // Same parsing logic as display
                      let sections = item.answer.split('\n').filter(s => s.trim());
                      if (sections.length <= 3) {
                        const numberedSplit = item.answer.split(/(?=\d+[\.\)]\s)/);
                        if (numberedSplit.length > sections.length) {
                          sections = numberedSplit.filter(s => s.trim());
                        }
                      }
                      if (sections.length <= 3) {
                        const doubleSplit = item.answer.split('\n\n').filter(s => s.trim());
                        if (doubleSplit.length > sections.length) {
                          sections = doubleSplit;
                        }
                      }
                      const totalSections = sections.filter(s => s.trim()).length;
                      
                      if (totalSections > visibleCount) {
                        return (
                          <div className="mt-6 mb-4">
                            <Button
                              onClick={() => setVisibleCount(prev => prev + 5)}
                              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 text-base"
                            >
                              {t('tips.showMore', 'Show More')} 👇
                            </Button>
                            <p className="text-center text-slate-400 text-xs mt-2">
                              {Math.min(visibleCount, totalSections)} {t('tips.of', 'of')} {totalSections} {t('tips.results', 'results')}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Save Button */}
                    <div className="mt-4">
                      <SaveButton 
                        item={{
                          title: item.question,
                          content: item.answer,
                          category: selectedCategory?.title || 'Përgjithshme'
                        }} 
                        type="tip"
                        className="text-sm"
                      />
                    </div>

                    {/* Generate More Button - Only for first_message category */}
                    {selectedCategory?.id === 'first_message' && !isLoading && (
                      <div className="mt-6 pt-4 border-t border-slate-700">
                        <Button
                          onClick={generateMoreFirstLiners}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 text-base"
                        >
                          {isLoading ? t('tips.generating', 'Generating...') : t('tips.generateMore', 'Generate More')} 🔄
                        </Button>
                        <p className="text-center text-slate-400 text-xs mt-2">
                          {t('tips.clickForNewMessages', 'Click to get new messages')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400">{t('tips.preparingAnswer', 'Preparing your answer...')}</p>
                </div>
              </Card>
            )}

            {/* Follow-up Question Input */}
            {!isLoading && answer && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    {t('tips.followUpQuestion', 'Follow-up question?')}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && askFollowUp()}
                      placeholder={t('tips.askMore', 'Ask more...')}
                      className="bg-slate-900 border-slate-700 text-white flex-1"
                    />
                    <Button
                      onClick={askFollowUp}
                      disabled={!followUpQuestion.trim()}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}

