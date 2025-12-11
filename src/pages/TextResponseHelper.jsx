import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Copy, Check, Zap, Heart, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { trackFeatureUse } from '@/utils/analytics';
import UpgradeModal from '@/components/UpgradeModal';
import LimitReachedModal from '@/components/LimitReachedModal';

export default function TextResponseHelper() {
  const [receivedMessage, setReceivedMessage] = useState('');
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [maxUsage] = useState(10); // Free users: 10 per day

  const subscriptionTier = localStorage.getItem('userSubscriptionTier') || 'free';
  const isPaidUser = ['pro', 'elite', 'premium'].includes(subscriptionTier?.toLowerCase());

  const handleGetSuggestions = async () => {
    if (!receivedMessage.trim()) return;

    // Check usage limits for free users
    if (!isPaidUser && usageCount >= maxUsage) {
      setShowLimitModal(true);
      return;
    }

    setIsLoading(true);
    trackFeatureUse('text_response_helper');

    try {
      const prompt = `You are a dating and conversation expert. A user received this message on a dating app:

"${receivedMessage}"

${context ? `Additional context: ${context}` : ''}

Provide 5 different response suggestions:
1. Flirty & Fun - Playful, shows interest
2. Casual & Cool - Laid-back, friendly
3. Deep & Thoughtful - Shows depth, emotional intelligence
4. Funny & Witty - Makes them laugh
5. Direct & Confident - Clear intentions

For each response:
- Keep it natural and authentic
- Match the tone of the original message
- Be 1-3 sentences max
- Show interest without being desperate
- Give them something to respond to

Format as JSON array with "type" and "message" fields.`;

      const response = await base44.generateResponse(prompt, 'gpt-4o-mini');
      
      // Parse AI response
      const content = response.choices?.[0]?.message?.content || '';
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSuggestions(parsed);
      } else {
        // Fallback: split by numbers and create suggestions
        const lines = content.split(/\n\d+\./).filter(l => l.trim());
        const fallbackSuggestions = lines.map((line, i) => {
          const types = ['Flirty & Fun', 'Casual & Cool', 'Deep & Thoughtful', 'Funny & Witty', 'Direct & Confident'];
          return {
            type: types[i] || 'Suggestion',
            message: line.replace(/^.*?:/, '').trim()
          };
        }).slice(0, 5);
        setSuggestions(fallbackSuggestions);
      }

      setUsageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      alert('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getTypeColor = (type) => {
    if (type.includes('Flirty')) return 'from-pink-500 to-rose-500';
    if (type.includes('Casual')) return 'from-blue-500 to-cyan-500';
    if (type.includes('Deep')) return 'from-purple-500 to-indigo-500';
    if (type.includes('Funny')) return 'from-yellow-500 to-orange-500';
    if (type.includes('Direct')) return 'from-green-500 to-emerald-500';
    return 'from-slate-500 to-slate-600';
  };

  const getTypeIcon = (type) => {
    if (type.includes('Flirty')) return '😘';
    if (type.includes('Casual')) return '😎';
    if (type.includes('Deep')) return '💭';
    if (type.includes('Funny')) return '😄';
    if (type.includes('Direct')) return '🎯';
    return '💬';
  };

  return (
    <div className="px-4 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Text Response Helper</h1>
          </div>
          {!isPaidUser && (
            <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg">
              <span className="text-slate-400 text-sm">{usageCount}/{maxUsage} today</span>
            </div>
          )}
        </div>
        <p className="text-slate-400">Get AI-powered response suggestions for any message you receive</p>
      </div>

      {/* Input Section */}
      <Card className="bg-slate-800/50 border-slate-700 p-5 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Message You Received <span className="text-red-400">*</span>
            </label>
            <Textarea
              value={receivedMessage}
              onChange={(e) => setReceivedMessage(e.target.value)}
              placeholder="Paste the message you received here..."
              className="w-full bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Context (Optional)
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g., 'We've been talking for 2 days', 'This is our first message', 'We matched on their dog photo'"
              className="w-full bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              style={{ fontSize: '16px' }}
            />
          </div>

          <Button
            onClick={handleGetSuggestions}
            disabled={isLoading || !receivedMessage.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating Suggestions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Response Suggestions
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Response Suggestions
          </h2>

          {suggestions.map((suggestion, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                  <div className={`px-2 py-1 bg-gradient-to-r ${getTypeColor(suggestion.type)} bg-opacity-20 rounded-lg`}>
                    <span className="text-xs font-semibold text-white">{suggestion.type}</span>
                  </div>
                </div>
                <Button
                  onClick={() => copyToClipboard(suggestion.message, index)}
                  className="bg-slate-700 hover:bg-slate-600 text-white h-8 px-3"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-white leading-relaxed">{suggestion.message}</p>
            </Card>
          ))}

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-slate-300">
              <strong className="text-white">💡 Pro Tip:</strong> Use these as inspiration and make them your own! 
              Add your personality and adjust based on your conversation style.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && suggestions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Suggestions Yet</h3>
          <p className="text-slate-500">Paste a message above and we'll generate smart response options for you!</p>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <LimitReachedModal
          onClose={() => setShowLimitModal(false)}
          featureName="Text Response Helper"
          limit={maxUsage}
          onUpgrade={() => {
            setShowLimitModal(false);
            setShowUpgradeModal(true);
          }}
        />
      )}
    </div>
  );
}
