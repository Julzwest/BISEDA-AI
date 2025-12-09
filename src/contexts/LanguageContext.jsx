import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getLanguageForCountry } from '@/config/languages';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Try to get saved language from localStorage
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang) return savedLang;
    
    // Otherwise, derive from country
    const savedCountry = localStorage.getItem('userCountry') || 'AL';
    return getLanguageForCountry(savedCountry);
  });

  // Listen for country changes to automatically update language
  useEffect(() => {
    const handleCountryChange = (event) => {
      const { countryCode } = event.detail;
      const newLang = getLanguageForCountry(countryCode);
      setLanguage(newLang);
      localStorage.setItem('userLanguage', newLang);
    };

    window.addEventListener('countryChanged', handleCountryChange);
    return () => window.removeEventListener('countryChanged', handleCountryChange);
  }, []);

  // Get translation function
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) return key; // Return key if translation not found
    }
    
    return value;
  };

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('userLanguage', newLang);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLang } 
    }));
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return fallback if no provider - prevents app crash
    return {
      language: 'en',
      changeLanguage: () => {},
      t: (key) => key
    };
  }
  return context;
}

