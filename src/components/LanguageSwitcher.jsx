import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelectLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('appLanguage', langCode);
    setIsOpen(false);
    
    // Dispatch event for components that might need to know
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { langCode } 
    }));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="group flex items-center gap-1.5 px-3 py-2 bg-slate-800/90 border border-slate-700/60 rounded-xl hover:bg-slate-700/90 hover:border-purple-500/50 transition-all duration-200"
        aria-label="Change language"
        aria-expanded={isOpen}
        type="button"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Modal Overlay - Full screen on mobile */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          
          {/* Dropdown/Modal Container */}
          <div 
            className="fixed inset-x-4 bottom-4 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[9999]"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-purple-400" />
                <p className="text-sm font-semibold text-white">{t('language.selectLanguage')}</p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors md:hidden"
                type="button"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Languages List - Scrollable */}
            <div className="overflow-y-auto" style={{ maxHeight: 'min(350px, calc(100vh - 200px))' }}>
              {languages.map((language) => {
                const isSelected = i18n.language === language.code;
                
                return (
                  <button
                    key={language.code}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectLanguage(language.code);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-150 border-b border-slate-800/50 last:border-b-0 ${
                      isSelected
                        ? 'bg-purple-500/20 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <div className="text-sm font-medium">{language.nativeName}</div>
                        <div className="text-xs text-slate-500">{language.name}</div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-400 font-medium">{t('common.active')}</span>
                        <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
              <p className="text-[10px] text-slate-500 text-center">
                {t('language.hint')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
