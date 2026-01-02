import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Smile,
  Zap,
  Target,
  Home,
  User,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  Crown,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateReply } from '@/engine/conversationEngine';
import { getProfile } from '@/utils/profileMemory';
import { getBackendUrl } from '@/utils/getBackendUrl';

// ============================================================
// FEEDBACK STORAGE UTILS (Prompt 8)
// ============================================================
const FEEDBACK_STORAGE_KEY = 'copilot_feedback_log';

function saveFeedback(feedbackData) {
  try {
    const existing = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    existing.push(feedbackData);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (error) {
    console.error('Error saving feedback:', error);
    return false;
  }
}

// ============================================================
// PRO STATUS CHECK (Prompt 10)
// ============================================================
// 🎉 EVERYTHING IS FREE NOW!
function checkProStatus() {
  return true; // All features are free!
}

export default function ReplyResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { inputData, analysis, goal, goalTitle, scores } = location.state || {};
  
  const [copied, setCopied] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(null);
  const [results, setResults] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Feedback state (Prompt 8)
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  
  // Pro status (Prompt 10)
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!goal) {
      navigate('/copilot/upload');
      return;
    }

    // Check Pro status
    setIsPro(checkProStatus());

    // Get user profile for personalization
    const userProfile = getProfile();
    setProfile(userProfile);

    // Generate AI-powered replies based on actual conversation
    generateAIReplies(goal, analysis, inputData, userProfile);
  }, [goal, analysis, inputData, navigate]);

  // AI-powered reply generation
  const generateAIReplies = async (selectedGoal, analysisData, conversationData, userProfile) => {
    const backendUrl = getBackendUrl();
    
    // Get the actual conversation content
    const conversationContent = conversationData?.content || '';
    const extractedMessages = conversationData?.rawExtraction?.messages || [];
    
    // Format extracted messages for the AI
    const formattedConversation = extractedMessages.length > 0
      ? extractedMessages.map(m => `${m.sender === 'user' ? 'Me' : 'Them'}: "${m.text}"`).join('\n')
      : conversationContent;
    
    // Goal descriptions
    const goalDescriptions = {
      'flow': 'Keep the conversation flowing naturally',
      'flirt': 'Add flirtation and build attraction/chemistry',
      'date': 'Ask them out on a date confidently',
      'recover': 'Recover from an awkward moment or mistake',
      'boundaries': 'Set healthy boundaries or slow things down'
    };
    
    const goalDescription = goalDescriptions[selectedGoal] || 'Continue the conversation naturally';
    
    const prompt = `You are an expert dating coach. Generate personalized reply suggestions based on this ACTUAL conversation.

CONVERSATION (REAL EXTRACTED TEXT):
${formattedConversation || 'No conversation provided'}

ANALYSIS:
- Interest Level: ${analysisData?.interestLevel || 'Unknown'}
- Momentum: ${analysisData?.momentum || 'Unknown'}
- Power Balance: ${analysisData?.powerBalance || 'Unknown'}

USER'S GOAL: ${goalDescription}

USER'S STYLE: ${userProfile?.communicationStyle || 'Playful'}
USER'S DATING GOAL: ${userProfile?.datingGoal || 'Casual'}

⚠️ CRITICAL INSTRUCTIONS:
1. Your replies MUST directly reference the ACTUAL conversation above
2. DO NOT give generic responses like "Tell me more about that"
3. PLAY OFF specific words, phrases, or topics from their messages
4. Match their energy and vibe
5. Be confident but not arrogant

Generate a JSON response with this EXACT structure:
{
  "mainReply": "Your best response that directly references their last message",
  "alternatives": {
    "playful": "A playful/teasing version that references the conversation",
    "confident": "A bold/direct version that references the conversation",
    "direct": "A straightforward version that references the conversation"
  },
  "whyItWorks": [
    "Reason 1 - specific to THIS conversation",
    "Reason 2 - specific to THIS conversation",
    "Reason 3 - specific to THIS conversation"
  ],
  "whatNotToSay": [
    "Something to avoid in THIS specific situation",
    "Another thing to avoid based on this conversation",
    "Generic mistake to avoid"
  ],
  "nextMove": "Strategic next step based on this specific conversation"
}

IMPORTANT: Each reply should feel like it was written FOR this specific conversation, not a generic template. Reference their words!

Return ONLY valid JSON.`;

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': window.chatSessionId || `reply_${Date.now()}`,
          'x-user-id': localStorage.getItem('odId') || localStorage.getItem('guestId') || ''
        },
        body: JSON.stringify({
          prompt: prompt,
          conversationHistory: [],
          systemPrompt: 'You are an expert dating coach. Return ONLY valid JSON with contextual, conversation-specific replies.'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.response;
        
        // Parse JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResults({
            mainReply: parsed.mainReply || "I'd love to hear more about that!",
            whyItWorks: parsed.whyItWorks || ['Shows genuine interest'],
            alternatives: parsed.alternatives || {
              playful: "Tell me more, I'm curious 😊",
              confident: "I like where this is going",
              direct: "That's interesting, go on"
            },
            whatNotToSay: parsed.whatNotToSay || ['Avoid being too eager'],
            nextMove: parsed.nextMove || 'Keep building the connection'
          });
          return;
        }
      }
    } catch (error) {
      console.error('AI reply generation error:', error);
    }
    
    // Fallback to engine-generated replies if AI fails
    const engineResults = generateReply(selectedGoal, analysisData, userProfile);
    setResults({
      mainReply: engineResults.recommendedReply,
      whyItWorks: engineResults.whyItWorks,
      alternatives: engineResults.alternatives,
      whatNotToSay: engineResults.avoid,
      nextMove: engineResults.nextMove
    });
  };

  // ============================================================
  // FEEDBACK HANDLERS (Prompt 8)
  // ============================================================
  const handleFeedback = (type) => {
    const feedbackData = {
      timestamp: new Date().toISOString(),
      goal: goal,
      interestLevel: analysis?.interestLevel || 'Unknown',
      momentum: analysis?.momentum || 'Unknown',
      userFeedback: type
    };
    
    saveFeedback(feedbackData);
    setFeedbackType(type);
    setFeedbackGiven(true);
  };

  // ============================================================
  // CONFIDENCE PREDICTION (Prompt 9)
  // ============================================================
  const getConfidencePrediction = () => {
    // Predict confidence change based on goal and current state
    const currentConfidence = scores?.confidence || 50;
    
    switch (goal) {
      case 'flow':
        return { direction: 'up', label: '↑ Likely to improve', delta: '+5-10%' };
      case 'flirt':
        if (analysis?.interestLevel === 'High') {
          return { direction: 'up', label: '↑ Building attraction', delta: '+10-15%' };
        }
        return { direction: 'neutral', label: '→ Depends on response', delta: '±5%' };
      case 'date':
        if (analysis?.interestLevel === 'Low') {
          return { direction: 'down', label: '↓ Risk of rejection', delta: '-5-10%' };
        }
        return { direction: 'up', label: '↑ Bold move, high reward', delta: '+15-20%' };
      case 'recover':
        return { direction: 'up', label: '↑ Damage control active', delta: '+10%' };
      case 'boundaries':
        return { direction: 'neutral', label: '→ Healthy boundary', delta: '±0%' };
      default:
        return { direction: 'neutral', label: '→ Steady', delta: '±5%' };
    }
  };

  const confidencePrediction = getConfidencePrediction();

  const handleCopyMain = async () => {
    if (results?.mainReply) {
      await navigator.clipboard.writeText(results.mainReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAlt = async (key, text) => {
    await navigator.clipboard.writeText(text);
    setCopiedAlt(key);
    setTimeout(() => setCopiedAlt(null), 2000);
  };

  const handleStartOver = () => {
    navigate('/copilot/upload');
  };

  const handleGoHome = () => {
    navigate('/copilot');
  };

  if (!results) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <h2 className="text-white font-semibold text-lg mb-2">Crafting your perfect reply...</h2>
        <p className="text-slate-400 text-sm text-center">
          Analyzing the conversation and generating personalized suggestions
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Your Perfect Reply</h1>
        </div>
        <p className="text-slate-400">Goal: <span className="text-purple-300">{goalTitle}</span></p>
        
        {/* Personalization Badge */}
        {profile && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-purple-300">
                Personalized to: <span className="font-medium">{profile.communicationStyle}</span> • <span className="font-medium">{profile.datingGoal}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Reply */}
      <div className="px-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <p className="text-white text-lg leading-relaxed flex-1">
              "{results.mainReply}"
            </p>
          </div>
          <Button
            onClick={handleCopyMain}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              copied 
                ? 'bg-green-500 hover:bg-green-500 text-white' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy to clipboard
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Confidence Prediction (Prompt 9) */}
      <div className="px-4 mb-6">
        <Card className={`p-4 border ${
          confidencePrediction.direction === 'up' 
            ? 'bg-green-500/10 border-green-500/30' 
            : confidencePrediction.direction === 'down'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-blue-500/10 border-blue-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {confidencePrediction.direction === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
            {confidencePrediction.direction === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
            {confidencePrediction.direction === 'neutral' && <Minus className="w-5 h-5 text-blue-400" />}
            <div>
              <p className={`text-sm font-medium ${
                confidencePrediction.direction === 'up' ? 'text-green-300' :
                confidencePrediction.direction === 'down' ? 'text-red-300' : 'text-blue-300'
              }`}>
                Confidence after this reply: {confidencePrediction.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Expected change: {confidencePrediction.delta}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Why It Works - Show 1 bullet free, rest Pro-locked (Prompt 10) */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="font-semibold text-white">Why it works</h2>
        </div>
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <ul className="space-y-3">
            {/* First bullet always visible */}
            {results.whyItWorks.slice(0, 1).map((reason, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-green-400" />
                </div>
                <span className="text-slate-300 text-sm">{reason}</span>
              </li>
            ))}
            
            {/* Rest Pro-locked */}
            {isPro ? (
              results.whyItWorks.slice(1).map((reason, index) => (
                <li key={index + 1} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{reason}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-3 relative">
                <div className="absolute inset-0 backdrop-blur-sm bg-slate-800/50 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 text-purple-300 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>+{results.whyItWorks.length - 1} more insights</span>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-slate-500 text-sm blur-sm select-none">Additional insight locked</span>
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* Alternatives - Pro-locked (Prompt 10) */}
      <div className="px-4 mb-6 relative">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Alternative styles</h2>
          {!isPro && (
            <span className="flex items-center gap-1 text-xs text-purple-400">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          )}
        </div>
        
        {isPro ? (
          <div className="space-y-3">
            {Object.entries(results.alternatives).map(([style, text]) => {
              const icons = {
                playful: <Smile className="w-5 h-5" />,
                confident: <Zap className="w-5 h-5" />,
                direct: <Target className="w-5 h-5" />
              };
              const colors = {
                playful: 'from-pink-500 to-rose-500',
                confident: 'from-amber-500 to-orange-500',
                direct: 'from-blue-500 to-cyan-500'
              };
              
              return (
                <Card key={style} className="bg-slate-800/50 border-slate-700/50 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${colors[style]} rounded-xl flex items-center justify-center shrink-0`}>
                      {icons[style]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white capitalize mb-1">{style}</h3>
                      <p className="text-slate-400 text-sm">"{text}"</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCopyAlt(style, text)}
                    variant="outline"
                    className={`w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all ${
                      copiedAlt === style
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {copiedAlt === style ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy this version
                      </>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Pro-locked blur overlay */
          <div className="relative">
            <div className="space-y-3 blur-sm pointer-events-none select-none">
              {Object.entries(results.alternatives).slice(0, 2).map(([style, text]) => {
                const icons = {
                  playful: <Smile className="w-5 h-5" />,
                  confident: <Zap className="w-5 h-5" />,
                  direct: <Target className="w-5 h-5" />
                };
                const colors = {
                  playful: 'from-pink-500 to-rose-500',
                  confident: 'from-amber-500 to-orange-500',
                  direct: 'from-blue-500 to-cyan-500'
                };
                
                return (
                  <Card key={style} className="bg-slate-800/50 border-slate-700/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${colors[style]} rounded-xl flex items-center justify-center shrink-0`}>
                        {icons[style]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white capitalize mb-1">{style}</h3>
                        <p className="text-slate-400 text-sm">"Alternative message here..."</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl">
              <div className="text-center">
                <Lock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-300 font-medium mb-1">3 alternative styles</p>
                <p className="text-slate-400 text-sm">Unlock with Pro</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What NOT to Say - Pro-locked (Prompt 10) */}
      <div className="px-4 mb-6 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="font-semibold text-white">What NOT to say</h2>
          </div>
          {!isPro && (
            <span className="flex items-center gap-1 text-xs text-purple-400">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          )}
        </div>
        
        {isPro ? (
          <Card className="bg-red-500/10 border-red-500/30 p-4">
            <ul className="space-y-2">
              {results.whatNotToSay.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-red-200/80 text-sm">
                  <span className="text-red-400">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <div className="relative">
            <Card className="bg-red-500/10 border-red-500/30 p-4 blur-sm pointer-events-none select-none">
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-red-200/80 text-sm">
                  <span className="text-red-400">✗</span>
                  What to avoid saying...
                </li>
                <li className="flex items-start gap-3 text-red-200/80 text-sm">
                  <span className="text-red-400">✗</span>
                  Another thing to avoid...
                </li>
              </ul>
            </Card>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 rounded-xl">
              <div className="flex items-center gap-2 text-purple-300 text-sm">
                <Lock className="w-4 h-4" />
                <span>Unlock with Pro</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Move - Pro-locked (Prompt 10) */}
      <div className="px-4 mb-6 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-white">Suggested next move</h2>
          </div>
          {!isPro && (
            <span className="flex items-center gap-1 text-xs text-purple-400">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          )}
        </div>
        
        {isPro ? (
          <Card className="bg-purple-500/10 border-purple-500/30 p-4">
            <p className="text-purple-200 text-sm">{results.nextMove}</p>
          </Card>
        ) : (
          <div className="relative">
            <Card className="bg-purple-500/10 border-purple-500/30 p-4 blur-sm pointer-events-none select-none">
              <p className="text-purple-200/50 text-sm">Your next strategic move will appear here...</p>
            </Card>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 rounded-xl">
              <div className="flex items-center gap-2 text-purple-300 text-sm">
                <Lock className="w-4 h-4" />
                <span>Unlock with Pro</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pro CTA for non-Pro users (Prompt 10) */}
      {!isPro && (
        <div className="px-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-1">Unlock Pro Co-Pilot</h3>
                <p className="text-slate-300 text-sm">Say the right thing when it matters.</p>
              </div>
            </div>
            <Link to="/profile">
              <Button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl">
                Upgrade Now
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {/* Feedback Section (Prompt 8) */}
      <div className="px-4 mb-6">
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          {!feedbackGiven ? (
            <>
              <p className="text-center text-slate-300 mb-3">Did this advice help?</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleFeedback('yes')}
                  variant="outline"
                  className="flex-1 py-3 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-xl flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-5 h-5" />
                  Yes
                </Button>
                <Button
                  onClick={() => handleFeedback('no')}
                  variant="outline"
                  className="flex-1 py-3 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-5 h-5" />
                  No
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-green-300 font-medium mb-1">Thanks for your feedback!</p>
              <p className="text-slate-400 text-sm">This helps improve your co-pilot.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-8">
        <div className="flex gap-3">
          <Button
            onClick={handleStartOver}
            variant="outline"
            className="flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <RefreshCw className="w-5 h-5" />
            New Chat
          </Button>
          <Button
            onClick={handleGoHome}
            className="flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
          >
            <Home className="w-5 h-5" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
