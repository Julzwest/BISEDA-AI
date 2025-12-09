import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Zap, Sparkles } from 'lucide-react';
import { getBackendUrl } from '@/utils/getBackendUrl';

export default function CreditsModal({ isOpen, onClose }) {
  const [packages, setPackages] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const backendUrl = getBackendUrl();
  const userId = localStorage.getItem('userId') || 'anonymous';

  useEffect(() => {
    if (isOpen) {
      fetchCredits();
    }
  }, [isOpen]);

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/credits/balance`, {
        headers: {
          'x-user-id': userId
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setPackages(data.packages);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handlePurchase = async (packageId) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/credits/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ packageId })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        alert('Dështoi fillimi i pagesës. Provo përsëri.');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('Ndodhi një gabim. Provo përsëri.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const creditPackages = packages || {
    starter: { name: 'Paketa Starter', price: 2.99, credits: 100 },
    popular: { name: 'Paketa Popullore', price: 9.99, credits: 400 },
    pro: { name: 'Paketa Pro', price: 19.99, credits: 900 }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Bli Kredite</h2>
              <p className="text-slate-400 text-sm">Zgjat limitin tënd ditor</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Current Balance */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Bilanci Aktual</span>
              </div>
              <span className="text-2xl font-bold text-white">{balance}</span>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="space-y-3 mb-6">
            {Object.entries(creditPackages).map(([id, pkg]) => (
              <Card
                key={id}
                className="bg-slate-700/50 border-slate-600 hover:border-purple-500/50 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                      <p className="text-sm text-slate-400">{pkg.credits} kredite</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">€{pkg.price}</div>
                      <div className="text-xs text-slate-400">
                        €{(pkg.price / pkg.credits).toFixed(4)} për kredit
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePurchase(id)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  >
                    {loading ? 'Duke procesuar...' : 'Bli Tani'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Kredite përdoren kur tejkalon limitin tënd ditor të mesazheve. 1 kredit = 1 mesazh.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

