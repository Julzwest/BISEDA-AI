import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X, Globe, Languages, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';
import { countries, getCountryByCode, getLocalizedCountryName } from '@/config/countries';

export default function RegionSwitcher() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('language'); // 'language' or 'country'
  const [selectedCountry, setSelectedCountry] = useState(
    localStorage.getItem('userCountry') || 'AL'
  );
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const currentCountry = getCountryByCode(selectedCountry);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideTrigger = triggerRef.current && triggerRef.current.contains(event.target);
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      
      if (!clickedInsideTrigger && !clickedInsideDropdown) {
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
    
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { langCode } 
    }));
  };

  const handleSelectCountry = (countryCode) => {
    setSelectedCountry(countryCode);
    localStorage.setItem('userCountry', countryCode);
    localStorage.removeItem('userCity');
    
    window.dispatchEvent(new CustomEvent('countryChanged', { 
      detail: { countryCode } 
    }));
  };

  // Get trigger button position for desktop dropdown
  const getTriggerRect = () => {
    if (triggerRef.current) {
      return triggerRef.current.getBoundingClientRect();
    }
    return null;
  };

  const triggerRect = isOpen ? getTriggerRect() : null;

  return (
    <div className="relative" ref={triggerRef}>
      {/* Trigger Button - Clean minimal design */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="group flex items-center gap-1.5 px-2.5 py-2 bg-slate-800/90 border border-slate-700/60 rounded-xl hover:bg-slate-700/90 hover:border-purple-500/50 transition-all duration-200"
        aria-label="Change region settings"
        aria-expanded={isOpen}
        type="button"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-xs font-medium text-slate-300 uppercase">{currentLanguage?.code}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Modal Overlay - Rendered via Portal */}
      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          
          {/* Dropdown/Modal Container */}
          <div 
            ref={dropdownRef}
            className="fixed left-4 right-4 bottom-4 md:fixed md:left-auto md:right-auto md:bottom-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[10001]"
            style={{ 
              maxHeight: 'calc(100vh - 120px)',
              ...(triggerRect && window.innerWidth >= 768 ? {
                top: triggerRect.bottom + 8,
                right: window.innerWidth - triggerRect.right,
                width: 320,
                left: 'auto',
                bottom: 'auto'
              } : {})
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Tabs */}
            <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <p className="text-sm font-semibold text-white">Region Settings</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              {/* Tab Buttons */}
              <div className="flex px-2 pb-2 gap-2">
                <button
                  onClick={() => setActiveTab('language')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'language'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                  }`}
                  type="button"
                >
                  <Languages className="w-4 h-4" />
                  <span>Language</span>
                  <span className="text-lg">{currentLanguage?.flag}</span>
                </button>
                <button
                  onClick={() => setActiveTab('country')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'country'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                  }`}
                  type="button"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Region</span>
                  <span className="text-lg">{currentCountry?.flag}</span>
                </button>
              </div>
            </div>

            {/* Content based on active tab */}
            <div className="overflow-y-auto max-h-[350px]">
              {activeTab === 'language' ? (
                // Languages List
                languages.map((language) => {
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
                          <span className="text-xs text-purple-400 font-medium">Active</span>
                          <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                // Countries List
                countries.map((country) => {
                  const isSelected = selectedCountry === country.code;
                  
                  return (
                    <button
                      key={country.code}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectCountry(country.code);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-150 border-b border-slate-800/50 last:border-b-0 ${
                        isSelected
                          ? 'bg-purple-500/20 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'
                      }`}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <div className="text-sm font-medium">{getLocalizedCountryName(country.code)}</div>
                          <div className="text-xs text-slate-500">{country.cities?.length || 0} cities</div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-purple-400 font-medium">Active</span>
                          <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
              <p className="text-[10px] text-slate-500 text-center">
                {activeTab === 'language' 
                  ? 'Language affects app text and AI responses'
                  : 'Region affects local recommendations'}
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
