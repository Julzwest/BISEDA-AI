import React from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Heart, X } from 'lucide-react';

export default function CrisisHelplineModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const helplines = [
    {
      name: 'Emergjenca',
      number: '112',
      description: 'Numri i emergjencës për urgjenca të menjëhershme',
      isEmergency: true
    },
    {
      name: 'Linja e Ndihmës Psikologjike',
      number: '0800 40 40',
      description: 'Linjë falas për mbështetje psikologjike 24/7',
      isEmergency: false
    },
    {
      name: 'Spitali i Urgjencave',
      number: 'Shkoni në spitalin më të afërt',
      description: 'Për urgjenca mjekësore dhe psikiatrike',
      isEmergency: true
    }
  ];

  const handleCall = (number) => {
    if (number === '112' || number.includes('0800')) {
      window.location.href = `tel:${number.replace(/\s/g, '')}`;
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <Card className="bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 border-2 border-pink-500/50 max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Ndihmë dhe Mbështetje</h2>
                <p className="text-sm text-pink-200">Ju nuk jeni vetëm</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-pink-200 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-white/10 rounded-lg border border-pink-500/30">
            <p className="text-white text-center leading-relaxed">
              <span className="text-2xl">💙</span>
              <br />
              <strong>Bota është e bukur dhe ju jeni të rëndësishëm.</strong>
              <br />
              <br />
              Ka njerëz që ju duan dhe ju mbështesin. Ju lutem, merrni ndihmë profesionale.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {helplines.map((helpline, index) => (
              <Card
                key={index}
                className={`bg-slate-800/80 border-2 ${
                  helpline.isEmergency
                    ? 'border-red-500/50 shadow-lg shadow-red-500/20'
                    : 'border-purple-500/30'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {helpline.name}
                      </h3>
                      <p className="text-sm text-slate-300 mb-2">
                        {helpline.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <span className="text-lg font-semibold text-purple-300">
                          {helpline.number}
                        </span>
                      </div>
                    </div>
                    {helpline.number !== 'Shkoni në spitalin më të afërt' && (
                      <Button
                        onClick={() => handleCall(helpline.number)}
                        className={`${
                          helpline.isEmergency
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-purple-500 hover:bg-purple-600'
                        } text-white`}
                      >
                        <Phone className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-pink-200 mb-4">
              Nëse jeni në rrezik të menjëhershëm, telefononi 112 ose shkoni në spitalin më të afërt.
            </p>
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Mbyll
            </Button>
          </div>
        </div>
      </Card>
    </div>,
    document.body
  );
}

