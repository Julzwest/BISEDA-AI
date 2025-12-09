import React, { useState, useEffect } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // Initially show 5 tips for faster loading
  const backendUrl = getBackendUrl();

  const categories = [
    {
      id: 'first_message',
      icon: MessageSquare,
      title: 'Mesazhi i parë',
      color: 'from-blue-500 to-cyan-600',
      prompt: 'Jep 25 ide të ndryshme për mesazhe të para në dating apps në shqip. Bëji krijuese, interesante dhe të ndryshme nga njëra-tjetra. Disa flirty, disa funny, disa smooth. Që tërheqin vëmendjen pa qenë cringe. Formato secilën në një rresht të veçantë.'
    },
    {
      id: 'conversation',
      icon: TrendingUp,
      title: 'Ruajtja e bisedës',
      color: 'from-green-500 to-emerald-600',
      prompt: 'Jep këshilla në shqip se si të mbash një bisedë interesante me një vajzë. Si të shmangësh momentet e sikletshme dhe si të krijosh lidhje emocionale.'
    },
    {
      id: 'compliments',
      icon: Heart,
      title: 'Komplimente',
      color: 'from-pink-500 to-rose-600',
      prompt: 'Jep 20 komplimente krijuese dhe autentike në shqip që mund të përdoren në biseda. Jo të zakonshmet, por diçka që vërtetë bën përshtypje. Formato secilën në një rresht të veçantë.'
    },
    {
      id: 'red_flags',
      icon: Shield,
      title: 'Red flags',
      color: 'from-red-500 to-orange-600',
      prompt: 'Listo red flags që duhet të shmangësh kur flet me vajza në shqip. Gjëra që duhen evituar absolutisht.'
    },
    {
      id: 'confidence',
      icon: Sparkles,
      title: 'Konfidenca',
      color: 'from-purple-500 to-indigo-600',
      prompt: 'Jep këshilla praktike në shqip se si të rritësh konfidencën tënde kur flet me vajza. Tips për body language, mentalitet dhe attitude.'
    },
    {
      id: 'analyze',
      icon: Upload,
      title: 'Analizo bisedë',
      color: 'from-amber-500 to-yellow-600',
      special: 'screenshot'
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
      setAnswer(response);
      setConversation([{ question: category.title, answer: response }]);
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
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analizo këtë screenshot të një bisede. Jep feedback të detajuar në shqip:
        
1. Çfarë po shkon mirë në këtë bisedë
2. Çfarë mund të përmirësohet
3. Sugjerime konkrete për përgjigje të ardhshme
4. Rating i përgjithshëm 1-10



${customQuestion ? `\nPyetje specifike: ${customQuestion}` : ''}`,
        file_urls: [screenshot]
      });
      setAnswer(response);
      setConversation([{ question: 'Analiza e bisedës', answer: response }]);
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'LIMIT_EXCEEDED' || error.message?.includes('Limiti ditor')) {
        setIsLimitReached(true);
        setShowUpgradeModal(true);
      }
    }
    setIsLoading(false);
  };

  // Check usage limits
  const checkUsage = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/usage`);
      if (response.ok) {
        const data = await response.json();
        const isBlocked =
          data.dailyUsage.remainingMessages === 0 &&
          (!data.credits || data.credits === 0);
        setIsLimitReached(isBlocked);
        return !isBlocked;
      }
    } catch (error) {
      console.error('Error checking usage:', error);
    }
    return true; // Allow if check fails
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
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Përgjigju kësaj pyetjeje në shqip për dating dhe marrëdhënie: ${customQuestion}\n\nJep këshilla të detajuara dhe praktike.`
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
      const conversationContext = conversation.map(c => `Pyetje: ${c.question}\nPërgjigje: ${c.answer}`).join('\n\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Ky është konteksti i bisedës së mëparshme:



${conversationContext}



Pyetja e re: ${newQuestion}



Përgjigju në shqip duke u bazuar në kontekstin e mëparshëm. Jep këshilla të detajuara dhe praktike.`
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

  return (
    <div className="px-4 pt-6 pb-32 w-full max-w-full overflow-x-hidden">
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
        <h1 className="text-2xl font-bold text-white mb-1">Këshilla & Tips</h1>
        <p className="text-slate-400 text-sm">Përmirëso lojën tënde ✨</p>
      </div>

      <div className="px-0 py-4">
        {!selectedCategory && !answer && (
          <div className="space-y-6">
            {/* Categories Grid */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                Kategorite
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
                Bëj një pyetje
              </h3>
              <Textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Shkruaj pyetjen tënde këtu..."
                className="bg-slate-900 border-slate-700 text-white mb-3 min-h-[100px]"
              />
              <Button
                onClick={askCustomQuestion}
                disabled={!customQuestion.trim() || isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold"
              >
                {isLoading ? 'Duke përgatitur...' : 'Merr përgjigje'}
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
              ← Kthehu
            </Button>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
              <h2 className="text-lg font-bold text-white mb-4">Analizo bisedën tënde</h2>
              
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
                          <p className="text-sm text-green-400">✓ Screenshot u ngarkua</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                          <p className="text-sm text-slate-400">
                            Ngarko screenshot të bisedës
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <Textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Pyetje specifike? (opsionale)"
                  className="bg-slate-900 border-slate-700 text-white"
                />

                <Button
                  onClick={analyzeScreenshot}
                  disabled={!screenshot || isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
                >
                  {isLoading ? 'Duke analizuar...' : 'Analizo'}
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
              ← Kthehu
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
                      // Better parsing: split by numbered items or double newlines
                      let sections = item.answer.split('\n\n');
                      
                      // If only one section, try to split by numbered items
                      if (sections.length <= 2) {
                        const numberedSplit = item.answer.split(/(?=\d+[\.\)]\s)/);
                        if (numberedSplit.length > 2) {
                          sections = numberedSplit.filter(s => s.trim());
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
                        const itemNumber = section.trim().match(/^(\d+)[\.\)]/)?.[1];
                        
                        return (
                          <Card key={sIndex} className={`bg-gradient-to-br ${colors.bg} ${colors.border} backdrop-blur-sm p-4 hover:scale-[1.01] transition-transform`}>
                            <div className="flex items-start gap-3">
                              {itemNumber && (
                                <div className={`w-8 h-8 bg-gradient-to-br ${colors.dot} rounded-full flex items-center justify-center shrink-0`}>
                                  <span className="text-white font-bold text-sm">{itemNumber}</span>
                                </div>
                              )}
                              <p className="text-white leading-relaxed flex-1">{cleanText || section.trim()}</p>
                            </div>
                          </Card>
                        );
                      }

                      return null;
                    })}

                    {/* Load More Button */}
                    {(() => {
                      let sections = item.answer.split('\n\n');
                      if (sections.length <= 2) {
                        const numberedSplit = item.answer.split(/(?=\d+[\.\)]\s)/);
                        if (numberedSplit.length > 2) {
                          sections = numberedSplit.filter(s => s.trim());
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
                              Më shumë 👇
                            </Button>
                            <p className="text-center text-slate-400 text-xs mt-2">
                              {Math.min(visibleCount, totalSections)} nga {totalSections} rezultate
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
                  </div>
                </div>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400">Duke përgatitur përgjigjen...</p>
                </div>
              </Card>
            )}

            {/* Follow-up Question Input */}
            {!isLoading && answer && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    Pyetje shtesë?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && askFollowUp()}
                      placeholder="Pyet më shumë..."
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

