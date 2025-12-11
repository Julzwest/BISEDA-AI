import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import sq from './locales/sq.json';
import en from './locales/en.json';
import it from './locales/it.json';
import el from './locales/el.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import nl from './locales/nl.json';

export const languages = [
  { code: 'sq', name: 'Shqip', flag: '🇦🇱', nativeName: 'Shqip' },
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷', nativeName: 'Ελληνικά' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', nativeName: 'Nederlands' },
];

const resources = {
  sq: { translation: sq },
  en: { translation: en },
  it: { translation: it },
  el: { translation: el },
  fr: { translation: fr },
  de: { translation: de },
  nl: { translation: nl },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'sq', // Default to Albanian
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

