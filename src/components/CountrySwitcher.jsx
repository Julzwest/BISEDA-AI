import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { countries, getCountryByCode } from '@/config/countries';

export default function CountrySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    localStorage.getItem('userCountry') || 'AL'
  );
  const dropdownRef = useRef(null);

  const currentCountry = getCountryByCode(selectedCountry);

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

  const handleSelectCountry = (countryCode) => {
    setSelectedCountry(countryCode);
    localStorage.setItem('userCountry', countryCode);
    localStorage.removeItem('userCity');
    
    window.dispatchEvent(new CustomEvent('countryChanged', { 
      detail: { countryCode } 
    }));
    
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1.5 px-3 py-2 bg-slate-800/90 border border-slate-700/60 rounded-xl hover:bg-slate-700/90 hover:border-purple-500/50 transition-all duration-200"
        aria-label="Change country"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentCountry?.flag}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[9999]"
          style={{ maxHeight: '320px' }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-700/50 bg-slate-800/50">
            <p className="text-xs font-medium text-slate-400">Zgjidh Vendin</p>
          </div>

          {/* Countries List - Scrollable */}
          <div className="overflow-y-auto" style={{ maxHeight: '260px' }}>
            {countries.map((country) => {
              const isSelected = selectedCountry === country.code;
              
              return (
                <button
                  key={country.code}
                  onClick={() => handleSelectCountry(country.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-purple-500/20 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{country.flag}</span>
                    <div>
                      <div className="text-sm font-medium">{country.name}</div>
                      <div className="text-[10px] text-slate-500">{country.cities?.length || 0} qytete</div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
