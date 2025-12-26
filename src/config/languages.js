// Language configuration - Albanian and English only
// All other languages removed for simplicity

export const languages = {
  sq: {
    code: 'sq',
    name: 'Shqip',
    flag: '🇦🇱'
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧'
  }
};

// Map countries to languages - default to English for non-Albanian countries
export const countryToLanguage = {
  'AL': 'sq', // Albania
  'XK': 'sq', // Kosovo
  'MK': 'sq', // North Macedonia (Albanian speakers)
  // All other countries default to English
};

export const translations = {
  sq: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'AI që të bën irresistible',
      tagline2: 'Fillo biseda që lënë përshtypje',
      tagline3: 'Takime që fillojnë me mesazhe perfekte',
      tagline4: 'Bëhu irresistible 💪',
      register: 'Regjistrohu',
      login: 'Kyçu',
      firstName: 'Emri',
      lastName: 'Mbiemri',
      dateOfBirth: 'Date of Birth (18+)',
      day: 'Dita',
      month: 'Muaji',
      year: 'Viti',
      username: 'Zgjidh username',
      email: 'Email',
      password: 'Fjalëkalimi',
      createAccount: 'Krijo llogari',
      loginButton: 'Kyçu',
      startNow: 'Fillo Tani',
      or: 'OSE',
      continueWithApple: 'Vazhdo me Apple',
      appleOnlyIOS: 'Apple Sign In disponohet vetëm në iOS app. Përdor email/password këtu.',
      freeTrial: '3 ditë falas',
      noCard: 'Pa kartë',
      messages: '10 msg/ditë',
      forgotPassword: 'Harrove fjalëkalimin?',
      terms: 'Termat & Kushtet',
      byContinuing: 'Duke vazhduar, pranon',
      premium: 'Planet premium nga €6.99/muaj',
      loading: 'Duke hyrë...',
      errorFirstName: 'Shkruaj emrin tënd ✏️',
      errorLastName: 'Shkruaj mbiemrin tënd ✏️',
      errorDateOfBirth: 'Zgjedh datën e lindjes 📅',
      errorAge: 'Duhet të jesh 18+ vjeç 🔞',
      errorEmail: 'Shkruaj email-in tënd 📧',
      errorPassword: 'Fjalëkalimi duhet 6+ karaktere 🔐',
      errorConnection: 'Gabim lidhje. Provo përsëri! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Ç\'kemi',
      readyToImprove: 'Gati për të përmirësuar lojën tënde në dating?',
      learnToTalk: 'Mëso si të flasësh me djem/vajza, përmirëso chat-et në WhatsApp, Instagram, Facebook Messenger, Tinder dhe aplikacione të tjera dating',
      improveGame: 'Përmirëso lojën',
      moreDates: 'Më shumë takime',
      fastResults: 'Rezultate të shpejta',
      startNow: 'Fillo tani',
      dating: 'Dating',
      datingDesc: 'Gjej partnerin perfekt! Swipe, match dhe fillo biseda me persona interesante pranë teje',
      newBadge: 'New',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Bisedo me AI për të praktikuar biseda, mësuar teknikat e picking up, dhe përmirësuar aftësitë e tua',
      firstDates: 'Takime të Para',
      firstDatesDesc: 'Gjej ide perfekte për takimin e parë me sugjerime lokale biznesh në qytetet shqiptare',
      tips: 'Këshilla & Tips',
      tipsDesc: 'Mëso si të flasësh me djem/vajza në WhatsApp, Instagram, Messenger, Tinder dhe të përmirësosh lojën tënde',
      events: 'Evente Lokale',
      eventsDesc: 'Gjej vende eventesh, koncerte, klube dhe argëtim në qytetin tënd',
      gifts: 'Sugjerime Dhuratash',
      giftsDesc: 'Gjej dhuratën perfekte bazuar në interesat e partnerit me lidhje për blerje',
      whyBiseda: 'Pse Biseda.ai?',
      benefit1: 'Mëso si të flasësh me djem/vajza në WhatsApp, Instagram, Facebook Messenger, Tinder dhe aplikacione të tjera',
      benefit2: 'Merr këshilla për dating dhe si të fillosh biseda interesante',
      benefit3: 'Përmirëso lojën tënde dhe bëhu më i sigurt në chat-et',
      benefit4: 'AI inteligjent që kupton emocionet dhe dialektet shqipe për përgjigje më të mira'
    },
    
    // Navigation
    nav: {
      home: 'Home',
      aiCoach: 'AI Coach',
      dates: 'Takime',
      events: 'Evente',
      tips: 'Këshilla',
      profile: 'Profili'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Zgjidh Vendin',
      cities: 'qytete',
      changeLanguage: 'Ndrysho Gjuhën'
    },
    
    // Subscription - NOW FREE!
    subscription: {
      freeTrial: 'Falas',
      free: 'Falas',
      starter: 'Falas',
      pro: 'Falas',
      elite: 'Falas',
      upgrade: 'Gjithçka Falas!',
      messagesLeft: 'pa limit',
      imagesLeft: 'pa limit',
      unlimited: 'Pa kufi'
    },
    
    // Common
    common: {
      cancel: 'Anulo',
      confirm: 'Konfirmo',
      save: 'Ruaj',
      delete: 'Fshij',
      edit: 'Ndrysho',
      loading: 'Duke u ngarkuar...',
      error: 'Gabim',
      success: 'Sukses'
    }
  },
  
  en: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'AI that makes you irresistible',
      tagline2: 'Start conversations that leave an impression',
      tagline3: 'Dates that start with perfect messages',
      tagline4: 'Become irresistible 💪',
      register: 'Sign Up',
      login: 'Sign In',
      firstName: 'First Name',
      lastName: 'Last Name',
      dateOfBirth: 'Date of Birth (18+)',
      day: 'Day',
      month: 'Month',
      year: 'Year',
      username: 'Choose username',
      email: 'Email',
      password: 'Password',
      createAccount: 'Create account',
      loginButton: 'Sign In',
      startNow: 'Start Now',
      or: 'OR',
      continueWithApple: 'Continue with Apple',
      appleOnlyIOS: 'Apple Sign In is only available on iOS app. Use email/password here.',
      freeTrial: 'Free',
      noCard: 'No card',
      messages: 'Unlimited',
      forgotPassword: 'Forgot password?',
      terms: 'Terms & Conditions',
      byContinuing: 'By continuing, you accept',
      premium: 'Everything is FREE!',
      loading: 'Loading...',
      errorFirstName: 'Enter your first name ✏️',
      errorLastName: 'Enter your last name ✏️',
      errorDateOfBirth: 'Select your date of birth 📅',
      errorAge: 'You must be 18+ years old 🔞',
      errorEmail: 'Enter your email 📧',
      errorPassword: 'Password must be 6+ characters 🔐',
      errorConnection: 'Connection error. Try again! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Hey',
      readyToImprove: 'Ready to improve your dating game?',
      learnToTalk: 'Learn how to talk to guys/girls, improve your chats on WhatsApp, Instagram, Facebook Messenger, Tinder and other dating apps',
      improveGame: 'Improve your game',
      moreDates: 'More dates',
      fastResults: 'Fast results',
      startNow: 'Start now',
      dating: 'Dating',
      datingDesc: 'Find your perfect match! Swipe, match and start conversations with interesting people near you',
      newBadge: 'New',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Chat with AI to practice conversations, learn pickup techniques, and improve your skills',
      firstDates: 'First Dates',
      firstDatesDesc: 'Find perfect first date ideas with local business suggestions in Albanian cities',
      tips: 'Tips & Advice',
      tipsDesc: 'Learn how to talk to guys/girls on WhatsApp, Instagram, Messenger, Tinder and level up your game',
      events: 'Local Events',
      eventsDesc: 'Find event venues, concerts, clubs and entertainment in your city',
      gifts: 'Gift Ideas',
      giftsDesc: 'Find the perfect gift based on your partner\'s interests with shopping links',
      whyBiseda: 'Why Biseda.ai?',
      benefit1: 'Learn how to talk to guys/girls on WhatsApp, Instagram, Facebook Messenger, Tinder and other apps',
      benefit2: 'Get dating advice and how to start interesting conversations',
      benefit3: 'Improve your game and become more confident in chats',
      benefit4: 'Smart AI that understands emotions and Albanian dialects for better responses'
    },
    
    // Navigation
    nav: {
      home: 'Home',
      aiCoach: 'AI Coach',
      dates: 'Dates',
      events: 'Events',
      tips: 'Tips',
      profile: 'Profile'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Select Country',
      cities: 'cities',
      changeLanguage: 'Change Language'
    },
    
    // Subscription - NOW FREE!
    subscription: {
      freeTrial: 'Free',
      free: 'Free',
      starter: 'Free',
      pro: 'Free',
      elite: 'Free',
      upgrade: 'Everything is FREE!',
      messagesLeft: 'unlimited',
      imagesLeft: 'unlimited',
      unlimited: 'Unlimited'
    },
    
    // Common
    common: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    }
  }
};

// Get language for a country code - default to English
export function getLanguageForCountry(countryCode) {
  return countryToLanguage[countryCode] || 'en'; // Default to English
}

// Get translation
export function getTranslation(lang, key) {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (!value) return key; // Return key if translation not found
  }
  
  return value;
}
