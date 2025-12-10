import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, X, MapPin } from 'lucide-react';
import { countries, getCountryByCode, getLocalizedCountryName } from '@/config/countries';

export default function CountrySwitcher() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    localStorage.getItem('userCountry') || 'AL'
  );
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

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

  const handleSelectCountry = (countryCode) => {
    setSelectedCountry(countryCode);
    localStorage.setItem('userCountry', countryCode);
    localStorage.removeItem('userCity');
    
    window.dispatchEvent(new CustomEvent('countryChanged', { 
      detail: { countryCode } 
    }));
    
    setIsOpen(false);
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
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="group flex items-center gap-1.5 px-3 py-2 bg-slate-800/90 border border-slate-700/60 rounded-xl hover:bg-slate-700/90 hover:border-purple-500/50 transition-all duration-200"
        aria-label="Change country"
        aria-expanded={isOpen}
        type="button"
      >
        <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400" />
        <span className="text-lg">{currentCountry?.flag}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Modal Overlay - Rendered via Portal to escape header stacking context */}
      {isOpen && createPortal(
        <>
          {/* Backdrop - only visible on mobile */}
          <div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
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
                width: 288,
                left: 'auto',
                bottom: 'auto'
              } : {})
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <p className="text-sm font-semibold text-white">{t('country.selectCountry')}</p>
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

            {/* Countries List - Scrollable */}
            <div className="overflow-y-auto max-h-[400px]">
              {countries.map((country) => {
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
                        <div className="text-xs text-slate-500">{country.cities?.length || 0} {t('country.cities')}</div>
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
                {t('country.hint')}
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
