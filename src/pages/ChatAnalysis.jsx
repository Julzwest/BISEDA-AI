import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Thermometer,
  Target,
  MessageCircle,
  Heart,
  Calendar,
  RotateCcw,
  Shield,
  Sparkles,
  Loader2,
  Scale,
  Camera,
  FileText,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { normalizeChatInput, analyzeConversation } from '@/engine/conversationEngine';

export default function ChatAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputData = location.state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [normalizedChat, setNormalizedChat] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Use Conversation Strategy Engine™ for analysis
  useEffect(() => {
    if (!inputData) {
      navigate('/copilot/upload');
      return;
    }

    // Simulate processing delay for UX
    const timer = setTimeout(() => {
      // Step 1: Normalize the input using the engine
      // Pass the source type for screenshot vs text differentiation
      const content = inputData.content || '';
      const source = inputData.source || inputData.mode || 'text';
      
      const normalized = normalizeChatInput(content, { source });
      setNormalizedChat(normalized);
      
      // Step 2: Analyze the conversation using the engine
      const engineAnalysis = analyzeConversation(normalized);
      setAnalysis(engineAnalysis);
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [inputData, navigate]);

  const goals = [
    {
      id: 'flow',
      icon: MessageCircle,
      title: 'Keep it flowing',
      description: 'Maintain the conversation naturally',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'flirt',
      icon: Heart,
      title: 'Flirt / build attraction',
      description: 'Add playfulness and chemistry',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'date',
      icon: Calendar,
      title: 'Ask for the date',
      description: 'Make your move confidently',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'recover',
      icon: RotateCcw,
      title: 'Recover from a mistake',
      description: 'Get things back on track',
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'boundaries',
      icon: Shield,
      title: 'Set boundaries / slow down',
      description: 'Take control of the pace',
      color: 'from-slate-500 to-slate-600'
    }
  ];

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal.id);
    
    // Navigate to results with analysis + goal + normalized chat + scores
    setTimeout(() => {
      navigate('/copilot/results', {
        state: {
          inputData,
          analysis,
          normalizedChat,
          goal: goal.id,
          goalTitle: goal.title,
          // Pass scores for confidence prediction (Prompt 9)
          scores: {
            confidence: confidenceScore,
            momentum: momentumScore
          }
        }
      });
    }, 300);
  };

  // Power balance helpers
  const getPowerBalanceIcon = () => {
    switch (analysis?.powerBalance) {
      case 'ThemChasing': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'UserChasing': return <TrendingDown className="w-5 h-5 text-red-400" />;
      default: return <Scale className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPowerBalanceColor = () => {
    switch (analysis?.powerBalance) {
      case 'ThemChasing': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'UserChasing': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getPowerBalanceLabel = () => {
    switch (analysis?.powerBalance) {
      case 'ThemChasing': return 'They\'re keen';
      case 'UserChasing': return 'You\'re chasing';
      default: return 'Balanced';
    }
  };

  const getInterestIcon = () => {
    switch (analysis?.interestLevel) {
      case 'High': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'Low': return <TrendingDown className="w-5 h-5 text-red-400" />;
      default: return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getInterestColor = () => {
    switch (analysis?.interestLevel) {
      case 'High': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Low': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getMomentumIcon = () => {
    switch (analysis?.momentum) {
      case 'Building': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'Cooling': return <TrendingDown className="w-5 h-5 text-red-400" />;
      default: return <Minus className="w-5 h-5 text-blue-400" />;
    }
  };

  const getMomentumColor = () => {
    switch (analysis?.momentum) {
      case 'Building': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Cooling': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  // ============================================================
  // CONFIDENCE & MOMENTUM SCORING (Prompt 9)
  // ============================================================
  
  // Convert interest level to confidence score (0-100)
  const getConfidenceScore = () => {
    switch (analysis?.interestLevel) {
      case 'High': return Math.floor(Math.random() * 20) + 75; // 75-95
      case 'Medium': return Math.floor(Math.random() * 30) + 45; // 45-75
      case 'Low': return Math.floor(Math.random() * 30) + 15; // 15-45
      default: return 50;
    }
  };

  // Convert momentum to score (0-100)
  const getMomentumScore = () => {
    switch (analysis?.momentum) {
      case 'Building': return Math.floor(Math.random() * 20) + 70; // 70-90
      case 'Stable': return Math.floor(Math.random() * 20) + 45; // 45-65
      case 'Cooling': return Math.floor(Math.random() * 25) + 15; // 15-40
      default: return 50;
    }
  };

  // Get color for progress bar based on score
  const getScoreColor = (score) => {
    if (score >= 70) return 'from-green-500 to-emerald-400';
    if (score >= 45) return 'from-amber-500 to-yellow-400';
    return 'from-red-500 to-orange-400';
  };

  // Memoize scores to prevent re-calculation on re-render
  const [confidenceScore] = useState(() => getConfidenceScore());
  const [momentumScore] = useState(() => getMomentumScore());

  // Loading state
  if (isAnalyzing) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analyzing your chat...</h2>
          <p className="text-slate-400">Reading between the lines ✨</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-purple-300 text-sm">This takes a few seconds</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-4">
      {/* Header */}
      <div className="px-4 pt-2 pb-4">
        <button 
          onClick={() => navigate('/copilot/upload')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <h1 className="text-2xl font-bold text-white mb-2">Chat Analysis</h1>
        <p className="text-slate-400">Here's what we found in your conversation</p>
        
        {/* Input Source Indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            analysis?.source === 'screenshot'
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
              : 'bg-slate-500/10 border border-slate-500/30 text-slate-300'
          }`}>
            {analysis?.source === 'screenshot' ? (
              <Camera className="w-3.5 h-3.5" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>
              {analysis?.source === 'screenshot' 
                ? 'Analyzed from screenshot' 
                : 'Analyzed from pasted text'}
            </span>
          </div>
        </div>
        
        {/* Screenshot confidence note */}
        {analysis?.sourceNote && (
          <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{analysis.sourceNote}</span>
          </div>
        )}
      </div>

      {/* Analysis Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Interest Level */}
          <Card className={`border p-3 ${getInterestColor()}`}>
            <div className="flex items-center gap-1 mb-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium opacity-80">Interest</span>
            </div>
            <div className="flex items-center gap-1">
              {getInterestIcon()}
              <span className="text-sm font-bold">{analysis?.interestLevel}</span>
            </div>
          </Card>

          {/* Momentum */}
          <Card className={`border p-3 ${getMomentumColor()}`}>
            <div className="flex items-center gap-1 mb-1">
              <Target className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium opacity-80">Momentum</span>
            </div>
            <div className="flex items-center gap-1">
              {getMomentumIcon()}
              <span className="text-sm font-bold">{analysis?.momentum}</span>
            </div>
          </Card>

          {/* Power Balance */}
          <Card className={`border p-3 ${getPowerBalanceColor()}`}>
            <div className="flex items-center gap-1 mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium opacity-80">Balance</span>
            </div>
            <div className="flex items-center gap-1">
              {getPowerBalanceIcon()}
              <span className="text-sm font-bold">{getPowerBalanceLabel()}</span>
            </div>
          </Card>
        </div>

        {/* Confidence & Momentum Scores (Prompt 9) */}
        <Card className="bg-slate-800/50 border-slate-700/50 p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Strategy Scores
          </h3>
          
          {/* Confidence Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Confidence</span>
              <span className="text-sm font-bold text-white">{confidenceScore}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getScoreColor(confidenceScore)} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {confidenceScore >= 70 ? 'They seem interested!' : 
               confidenceScore >= 45 ? 'Mixed signals detected' : 
               'Low engagement detected'}
            </p>
          </div>
          
          {/* Momentum Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Momentum</span>
              <span className="text-sm font-bold text-white">{momentumScore}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getScoreColor(momentumScore)} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${momentumScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {momentumScore >= 70 ? 'Conversation is heating up' : 
               momentumScore >= 45 ? 'Steady pace' : 
               'Energy is dropping'}
            </p>
          </div>
        </Card>

        {/* Risk Flags */}
        {analysis?.riskFlags?.length > 0 && (
          <Card className="bg-amber-500/10 border-amber-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-amber-300">Things to watch</span>
            </div>
            <ul className="space-y-2">
              {analysis.riskFlags.map((flag, index) => (
                <li key={index} className="flex items-start gap-2 text-amber-200/80 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Goal Selection */}
      <div className="px-4">
        <h2 className="text-lg font-bold text-white mb-1">What's your goal right now?</h2>
        <p className="text-slate-400 text-sm mb-4">Choose what you want to achieve with your next message</p>

        <div className="space-y-3">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoal === goal.id;
            
            return (
              <button
                key={goal.id}
                onClick={() => handleGoalSelect(goal)}
                className={`w-full text-left transition-all ${isSelected ? 'scale-[0.98]' : ''}`}
              >
                <Card className={`border transition-all ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-slate-700/50 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800'
                }`}>
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-0.5">{goal.title}</h3>
                      <p className="text-slate-400 text-sm">{goal.description}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center shrink-0">
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
