import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-y-auto px-6 pt-20 pb-20 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm p-8 text-center">
          {/* Cancel Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-2xl">
                <XCircle className="w-12 h-12 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent mb-3">
            Pagesa Anuluar
          </h1>
          
          <p className="text-slate-300 mb-6 leading-relaxed">
            Mos u merzit! Pagesa jote nuk u procesua. Mund të përmirësosh kur të duash nga aplikacioni.
          </p>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
            <p className="text-sm text-slate-400">
              Dëshiron të përmirësosh më vonë? Thjesht kliko butonin <span className="text-purple-400 font-semibold">"Përmirëso"</span> kur të duash!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/home')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold h-12"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kthehu në Shtëpi
            </Button>
            
            <Button
              onClick={() => {
                // Trigger upgrade modal - you might want to pass a prop or use context
                navigate('/home');
                // In a real app, you'd open the upgrade modal here
                setTimeout(() => {
                  // This is a workaround - ideally use state management
                  window.location.hash = 'upgrade';
                }, 100);
              }}
              variant="outline"
              className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 h-12"
            >
              Provo Përsëri
            </Button>
          </div>

          {/* Footer */}
          <p className="mt-6 text-xs text-slate-500">
            Pyetje? Kontakto mbështetjen në support@biseda.ai
          </p>
        </Card>
      </div>
    </div>
  );
}

