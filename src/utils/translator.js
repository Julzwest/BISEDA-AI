/**
 * FREE Translation Service - No OpenAI charges!
 * Uses LibreTranslate (self-hosted/free) or MyMemory (free API)
 */

const LIBRETRANSLATE_API = 'https://libretranslate.com/translate';
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

// Language code mapping (ISO 639-1)
const LANGUAGE_CODES = {
  'sq': 'sq', // Albanian
  'en': 'en', // English
  'de': 'de', // German
  'fr': 'fr', // French
  'es': 'es', // Spanish
  'it': 'it', // Italian
  'pt': 'pt', // Portuguese
  'ru': 'ru', // Russian
  'tr': 'tr', // Turkish
  'ar': 'ar', // Arabic
  'zh': 'zh', // Chinese
  'ja': 'ja', // Japanese
  'ko': 'ko', // Korean
};

/**
 * Translate text using LibreTranslate (free, open-source)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'en', 'sq')
 * @param {string} sourceLang - Source language code (optional, auto-detect if not provided)
 * @returns {Promise<string>} Translated text
 */
export async function translateWithLibre(text, targetLang, sourceLang = 'auto') {
  try {
    const response = await fetch(LIBRETRANSLATE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('LibreTranslate error:', error);
    // Fallback to MyMemory
    return translateWithMyMemory(text, targetLang, sourceLang);
  }
}

/**
 * Translate text using MyMemory Translate API (free, no API key required)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional)
 * @returns {Promise<string>} Translated text
 */
export async function translateWithMyMemory(text, targetLang, sourceLang = 'auto') {
  try {
    const langPair = sourceLang === 'auto' ? `auto|${targetLang}` : `${sourceLang}|${targetLang}`;
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText || text;
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.error('MyMemory translate error:', error);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Main translation function with fallback
 * Tries LibreTranslate first, falls back to MyMemory
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional, auto-detect)
 * @returns {Promise<string>} Translated text
 */
export async function translate(text, targetLang, sourceLang = 'auto') {
  if (!text || text.trim() === '') {
    return text;
  }

  // If target language is same as source, no need to translate
  if (sourceLang !== 'auto' && sourceLang === targetLang) {
    return text;
  }

  // Normalize language codes
  const normalizedTarget = LANGUAGE_CODES[targetLang] || targetLang;
  const normalizedSource = sourceLang === 'auto' ? 'auto' : (LANGUAGE_CODES[sourceLang] || sourceLang);

  try {
    // Try LibreTranslate first (better quality, self-hosted option)
    return await translateWithLibre(text, normalizedTarget, normalizedSource);
  } catch (error) {
    console.warn('LibreTranslate failed, trying MyMemory...');
    // Fallback to MyMemory
    return await translateWithMyMemory(text, normalizedTarget, normalizedSource);
  }
}

/**
 * Detect language of text
 * @param {string} text - Text to detect language
 * @returns {Promise<string>} Detected language code
 */
export async function detectLanguage(text) {
  try {
    // Use LibreTranslate's detect endpoint
    const response = await fetch('https://libretranslate.com/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: text })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0].language; // Returns highest confidence language
      }
    }
  } catch (error) {
    console.error('Language detection error:', error);
  }
  
  // Fallback: assume English
  return 'en';
}

/**
 * Translate messages in a chat
 * Each message is translated to the receiver's preferred language
 * @param {Array} messages - Array of message objects
 * @param {string} targetLang - Target language for the current user
 * @returns {Promise<Array>} Messages with translated text
 */
export async function translateMessages(messages, targetLang) {
  const translatedMessages = await Promise.all(
    messages.map(async (message) => {
      // Skip if message is already in target language
      if (message.lang === targetLang) {
        return message;
      }

      try {
        const translatedText = await translate(
          message.message || message.text,
          targetLang,
          message.lang || 'auto'
        );

        return {
          ...message,
          originalMessage: message.message || message.text,
          message: translatedText,
          translatedTo: targetLang,
          isTranslated: true
        };
      } catch (error) {
        console.error('Message translation error:', error);
        return message; // Return original message if translation fails
      }
    })
  );

  return translatedMessages;
}

/**
 * Get supported languages
 * @returns {Array<{code: string, name: string}>}
 */
export function getSupportedLanguages() {
  return [
    { code: 'sq', name: 'Albanian / Shqip' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'German / Deutsch' },
    { code: 'fr', name: 'French / Français' },
    { code: 'es', name: 'Spanish / Español' },
    { code: 'it', name: 'Italian / Italiano' },
    { code: 'pt', name: 'Portuguese / Português' },
    { code: 'ru', name: 'Russian / Русский' },
    { code: 'tr', name: 'Turkish / Türkçe' },
    { code: 'ar', name: 'Arabic / العربية' },
    { code: 'zh', name: 'Chinese / 中文' },
    { code: 'ja', name: 'Japanese / 日本語' },
    { code: 'ko', name: 'Korean / 한국어' },
  ];
}

export default {
  translate,
  translateWithLibre,
  translateWithMyMemory,
  detectLanguage,
  translateMessages,
  getSupportedLanguages
};

