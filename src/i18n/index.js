import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations - Albanian and English only
import sq from './locales/sq.json';
import en from './locales/en.json';

// Only Albanian and English languages
export const languages = [
  { code: 'sq', name: 'Shqip', flag: '🇦🇱', nativeName: 'Shqip' },
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
];

const resources = {
  sq: { translation: sq },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Default to English
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'appLanguage',
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
