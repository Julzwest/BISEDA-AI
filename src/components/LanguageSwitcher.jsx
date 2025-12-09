import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/config/languages';

export default function LanguageSwitcher({ compact = false, className = '' }) {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages[language] || languages.en;

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 transition-all"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="max-h-64 overflow-y-auto py-2">
                {Object.values(languages).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 transition-colors ${
                      language === lang.code ? 'bg-purple-500/20 text-purple-400' : 'text-white'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="flex-1 text-left text-sm">{lang.name}</span>
                    {language === lang.code && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700/50 transition-all"
      >
        <Globe className="w-5 h-5 text-purple-400" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="flex-1 text-left text-white">{currentLang.name}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase font-semibold">
                {t('country.changeLanguage') || 'Select Language'}
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto py-2">
              {Object.values(languages).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors ${
                    language === lang.code ? 'bg-purple-500/20 text-purple-400' : 'text-white'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1 text-left font-medium">{lang.name}</span>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-purple-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
