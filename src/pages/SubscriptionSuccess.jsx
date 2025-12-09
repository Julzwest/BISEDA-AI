import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, Home, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [planName, setPlanName] = useState('Premium');
  const sessionIdParam = searchParams.get('session_id');

  useEffect(() => {
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      // In production, you'd verify the session with your backend
      // For now, we'll just show success
    }
  }, [sessionIdParam]);

  return (
    <div className="h-screen overflow-y-auto px-6 pt-20 pb-20 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-purple-500/50 backdrop-blur-sm p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 animate-pulse">
                <CheckCircle className="w-12 h-12 text-white" fill="currentColor" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            Abonimi Aktivizuar! 🎉
          </h1>
          
          <p className="text-slate-300 mb-6 leading-relaxed">
            Plani yt {planName} është tani aktiv. Mund të fillosh të përdorësh të gjitha veçoritë premium menjëherë!
          </p>

          {/* Features Unlocked */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold text-white">Veçori Premium të Zhbllokuara</span>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                <span>Mesazhe të pakufizuara</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                <span>Analizë imazhi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                <span>Përgjigje AI të avancuara</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                <span>Mbështetje prioritare</span>
              </div>
            </div>
          </div>

          {/* Session ID (for debugging) */}
          {sessionId && (
            <div className="mb-6 p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">ID Sesioni:</p>
              <p className="text-xs text-slate-400 font-mono break-all">{sessionId}</p>
          </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/home')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold h-12"
            >
              <Home className="w-5 h-5 mr-2" />
              Shko në Shtëpi
            </Button>
            
            <Button
              onClick={() => navigate('/chat')}
              variant="outline"
              className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 h-12"
            >
              Fillo Bisedën
            </Button>
          </div>

          {/* Footer */}
          <p className="mt-6 text-xs text-slate-500">
            Një email konfirmimi është dërguar në adresën tënde email.
          </p>
        </Card>
      </div>
    </div>
  );
}

