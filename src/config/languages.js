// Language configuration and translations

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
  },
  it: {
    code: 'it',
    name: 'Italiano',
    flag: '🇮🇹'
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪'
  },
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷'
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸'
  },
  ro: {
    code: 'ro',
    name: 'Română',
    flag: '🇷🇴'
  },
  bg: {
    code: 'bg',
    name: 'Български',
    flag: '🇧🇬'
  },
  el: {
    code: 'el',
    name: 'Ελληνικά',
    flag: '🇬🇷'
  },
  pt: {
    code: 'pt',
    name: 'Português',
    flag: '🇵🇹'
  },
  nl: {
    code: 'nl',
    name: 'Nederlands',
    flag: '🇳🇱'
  },
  pl: {
    code: 'pl',
    name: 'Polski',
    flag: '🇵🇱'
  },
  tr: {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷'
  }
};

// Map countries to languages
export const countryToLanguage = {
  'AL': 'sq', // Albania
  'XK': 'sq', // Kosovo
  'MK': 'sq', // North Macedonia
  'GB': 'en', // United Kingdom
  'US': 'en', // United States
  'AU': 'en', // Australia
  'CA': 'en', // Canada
  'IE': 'en', // Ireland
  'IT': 'it', // Italy
  'DE': 'de', // Germany
  'AT': 'de', // Austria
  'CH': 'de', // Switzerland (default German, but multilingual)
  'FR': 'fr', // France
  'BE': 'fr', // Belgium (French default)
  'ES': 'es', // Spain
  'MX': 'es', // Mexico
  'AR': 'es', // Argentina
  'RO': 'ro', // Romania
  'MD': 'ro', // Moldova
  'BG': 'bg', // Bulgaria
  'GR': 'el', // Greece
  'CY': 'el', // Cyprus
  'PT': 'pt', // Portugal
  'BR': 'pt', // Brazil
  'NL': 'nl', // Netherlands
  'PL': 'pl', // Poland
  'TR': 'tr', // Turkey
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
    
    // Subscription
    subscription: {
      freeTrial: 'Prova Falas',
      free: 'Falas',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Bëhu Premium',
      messagesLeft: 'mesazhe të mbetura',
      imagesLeft: 'imazhe të mbetura',
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
    },
    
    // Layout Navigation
    nav: {
      home: 'Kryefaqja',
      dating: 'Dating',
      aiCoach: 'AI Coach',
      profile: 'Profili'
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
      freeTrial: '3 days free',
      noCard: 'No card',
      messages: '10 msgs/day',
      forgotPassword: 'Forgot password?',
      terms: 'Terms & Conditions',
      byContinuing: 'By continuing, you accept',
      premium: 'Premium plans from €6.99/month',
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
    
    // Subscription
    subscription: {
      freeTrial: 'Free Trial',
      free: 'Free',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Go Premium',
      messagesLeft: 'messages left',
      imagesLeft: 'images left',
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
    },
    
    // Layout Navigation
    nav: {
      home: 'Home',
      dating: 'Dating',
      aiCoach: 'AI Coach',
      profile: 'Profile'
    }
  },
  
  it: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'AI che ti rende irresistibile',
      tagline2: 'Inizia conversazioni che lasciano il segno',
      tagline3: 'Appuntamenti che iniziano con messaggi perfetti',
      tagline4: 'Diventa irresistibile 💪',
      register: 'Registrati',
      login: 'Accedi',
      firstName: 'Nome',
      lastName: 'Cognome',
      dateOfBirth: 'Data di Nascita (18+)',
      day: 'Giorno',
      month: 'Mese',
      year: 'Anno',
      username: 'Scegli username',
      email: 'Email',
      password: 'Password',
      createAccount: 'Crea account',
      loginButton: 'Accedi',
      startNow: 'Inizia Ora',
      or: 'OPPURE',
      continueWithApple: 'Continua con Apple',
      appleOnlyIOS: 'Apple Sign In è disponibile solo su iOS. Usa email/password qui.',
      freeTrial: '3 giorni gratis',
      noCard: 'Senza carta',
      messages: '10 msg/giorno',
      forgotPassword: 'Password dimenticata?',
      terms: 'Termini e Condizioni',
      byContinuing: 'Continuando, accetti',
      premium: 'Piani premium da €6.99/mese',
      loading: 'Caricamento...',
      errorFirstName: 'Inserisci il tuo nome ✏️',
      errorLastName: 'Inserisci il tuo cognome ✏️',
      errorDateOfBirth: 'Seleziona la data di nascita 📅',
      errorAge: 'Devi avere 18+ anni 🔞',
      errorEmail: 'Inserisci la tua email 📧',
      errorPassword: 'La password deve avere 6+ caratteri 🔐',
      errorConnection: 'Errore di connessione. Riprova! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Ciao',
      readyToImprove: 'Pronto a migliorare il tuo gioco di appuntamenti?',
      learnToTalk: 'Impara a parlare con ragazzi/ragazze, migliora le tue chat su WhatsApp, Instagram, Facebook Messenger, Tinder e altre app di appuntamenti',
      improveGame: 'Migliora il tuo gioco',
      moreDates: 'Più appuntamenti',
      fastResults: 'Risultati rapidi',
      startNow: 'Inizia ora',
      dating: 'Dating',
      datingDesc: 'Trova la tua anima gemella! Swipe, fai match e inizia conversazioni con persone interessanti vicino a te',
      newBadge: 'Nuovo',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Chatta con AI per praticare conversazioni, imparare tecniche e migliorare le tue abilità',
      firstDates: 'Primi Appuntamenti',
      firstDatesDesc: 'Trova idee perfette per il primo appuntamento con suggerimenti locali',
      tips: 'Consigli',
      tipsDesc: 'Impara come parlare con ragazzi/ragazze su WhatsApp, Instagram, Messenger, Tinder',
      events: 'Eventi Locali',
      eventsDesc: 'Trova locali, concerti, club e divertimento nella tua città',
      gifts: 'Idee Regalo',
      giftsDesc: 'Trova il regalo perfetto basato sugli interessi del partner',
      whyBiseda: 'Perché Biseda.ai?',
      benefit1: 'Impara a parlare con ragazzi/ragazze su WhatsApp, Instagram, Facebook Messenger, Tinder e altre app',
      benefit2: 'Ricevi consigli per appuntamenti e come iniziare conversazioni interessanti',
      benefit3: 'Migliora il tuo gioco e diventa più sicuro nelle chat',
      benefit4: 'AI intelligente che comprende emozioni e dialetti albanesi per risposte migliori'
    },
    
    // Navigation
    nav: {
      home: 'Home',
      aiCoach: 'AI Coach',
      dates: 'Appuntamenti',
      events: 'Eventi',
      tips: 'Consigli',
      profile: 'Profilo'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Seleziona Paese',
      cities: 'città',
      changeLanguage: 'Cambia Lingua'
    },
    
    // Subscription
    subscription: {
      freeTrial: 'Prova Gratuita',
      free: 'Gratuito',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Diventa Premium',
      messagesLeft: 'messaggi rimasti',
      imagesLeft: 'immagini rimaste',
      unlimited: 'Illimitato'
    },
    
    // Common
    common: {
      cancel: 'Annulla',
      confirm: 'Conferma',
      save: 'Salva',
      delete: 'Elimina',
      edit: 'Modifica',
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo'
    },
    
    // Layout Navigation
    nav: {
      home: 'Home',
      dating: 'Dating',
      aiCoach: 'AI Coach',
      profile: 'Profilo'
    }
  },
  
  de: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'KI, die dich unwiderstehlich macht',
      tagline2: 'Beginne Gespräche, die Eindruck hinterlassen',
      tagline3: 'Dates, die mit perfekten Nachrichten beginnen',
      tagline4: 'Werde unwiderstehlich 💪',
      register: 'Registrieren',
      login: 'Anmelden',
      firstName: 'Vorname',
      lastName: 'Nachname',
      dateOfBirth: 'Geburtsdatum (18+)',
      day: 'Tag',
      month: 'Monat',
      year: 'Jahr',
      username: 'Benutzername wählen',
      email: 'E-Mail',
      password: 'Passwort',
      createAccount: 'Konto erstellen',
      loginButton: 'Anmelden',
      startNow: 'Jetzt starten',
      or: 'ODER',
      continueWithApple: 'Mit Apple fortfahren',
      appleOnlyIOS: 'Apple Sign In ist nur in der iOS-App verfügbar. Verwende hier E-Mail/Passwort.',
      freeTrial: '3 Tage kostenlos',
      noCard: 'Keine Karte',
      messages: '10 Nachrichten/Tag',
      forgotPassword: 'Passwort vergessen?',
      terms: 'AGB',
      byContinuing: 'Durch Fortfahren akzeptierst du',
      premium: 'Premium-Pläne ab €6.99/Monat',
      loading: 'Wird geladen...',
      errorFirstName: 'Gib deinen Vornamen ein ✏️',
      errorLastName: 'Gib deinen Nachnamen ein ✏️',
      errorDateOfBirth: 'Wähle dein Geburtsdatum 📅',
      errorAge: 'Du musst 18+ Jahre alt sein 🔞',
      errorEmail: 'Gib deine E-Mail ein 📧',
      errorPassword: 'Passwort muss 6+ Zeichen haben 🔐',
      errorConnection: 'Verbindungsfehler. Versuche es erneut! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Hey',
      readyToImprove: 'Bereit, dein Dating-Spiel zu verbessern?',
      learnToTalk: 'Lerne, wie du mit Jungs/Mädchen sprichst, verbessere deine Chats auf WhatsApp, Instagram, Facebook Messenger, Tinder und anderen Dating-Apps',
      improveGame: 'Verbessere dein Spiel',
      moreDates: 'Mehr Dates',
      fastResults: 'Schnelle Ergebnisse',
      startNow: 'Jetzt starten',
      dating: 'Dating',
      datingDesc: 'Finde deinen perfekten Match! Swipe, matche und starte Gespräche mit interessanten Menschen in deiner Nähe',
      newBadge: 'Neu',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Chatte mit KI, um Gespräche zu üben, Techniken zu lernen und deine Fähigkeiten zu verbessern',
      firstDates: 'Erste Dates',
      firstDatesDesc: 'Finde perfekte Ideen für das erste Date mit lokalen Vorschlägen',
      tips: 'Tipps',
      tipsDesc: 'Lerne, wie du auf WhatsApp, Instagram, Messenger, Tinder mit Jungs/Mädchen sprichst',
      events: 'Lokale Events',
      eventsDesc: 'Finde Veranstaltungsorte, Konzerte, Clubs und Unterhaltung in deiner Stadt',
      gifts: 'Geschenkideen',
      giftsDesc: 'Finde das perfekte Geschenk basierend auf den Interessen deines Partners',
      whyBiseda: 'Warum Biseda.ai?',
      benefit1: 'Lerne, wie du mit Jungs/Mädchen auf WhatsApp, Instagram, Facebook Messenger, Tinder und anderen Apps sprichst',
      benefit2: 'Erhalte Dating-Tipps und wie du interessante Gespräche beginnst',
      benefit3: 'Verbessere dein Spiel und werde selbstbewusster in Chats',
      benefit4: 'Intelligente KI, die Emotionen und albanische Dialekte versteht für bessere Antworten'
    },
    
    // Navigation
    nav: {
      home: 'Startseite',
      aiCoach: 'AI Coach',
      dates: 'Dates',
      events: 'Events',
      tips: 'Tipps',
      profile: 'Profil'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Land wählen',
      cities: 'Städte',
      changeLanguage: 'Sprache ändern'
    },
    
    // Subscription
    subscription: {
      freeTrial: 'Kostenlose Testversion',
      free: 'Kostenlos',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Premium werden',
      messagesLeft: 'Nachrichten übrig',
      imagesLeft: 'Bilder übrig',
      unlimited: 'Unbegrenzt'
    },
    
    // Common
    common: {
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      loading: 'Wird geladen...',
      error: 'Fehler',
      success: 'Erfolg'
    },
    
    // Layout Navigation
    nav: {
      home: 'Startseite',
      dating: 'Dating',
      aiCoach: 'AI Coach',
      profile: 'Profil'
    }
  },
  
  fr: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'IA qui te rend irrésistible',
      tagline2: 'Commence des conversations qui laissent une impression',
      tagline3: 'Des rendez-vous qui commencent par des messages parfaits',
      tagline4: 'Deviens irrésistible 💪',
      register: 'S\'inscrire',
      login: 'Se connecter',
      firstName: 'Prénom',
      lastName: 'Nom',
      dateOfBirth: 'Date de Naissance (18+)',
      day: 'Jour',
      month: 'Mois',
      year: 'Année',
      username: 'Choisir un nom d\'utilisateur',
      email: 'Email',
      password: 'Mot de passe',
      createAccount: 'Créer un compte',
      loginButton: 'Se connecter',
      startNow: 'Commencer',
      or: 'OU',
      continueWithApple: 'Continuer avec Apple',
      appleOnlyIOS: 'Apple Sign In est disponible uniquement sur iOS. Utilisez email/mot de passe ici.',
      freeTrial: '3 jours gratuits',
      noCard: 'Sans carte',
      messages: '10 msg/jour',
      forgotPassword: 'Mot de passe oublié?',
      terms: 'Conditions Générales',
      byContinuing: 'En continuant, vous acceptez',
      premium: 'Plans premium à partir de €6.99/mois',
      loading: 'Chargement...',
      errorFirstName: 'Entrez votre prénom ✏️',
      errorLastName: 'Entrez votre nom ✏️',
      errorDateOfBirth: 'Sélectionnez votre date de naissance 📅',
      errorAge: 'Vous devez avoir 18+ ans 🔞',
      errorEmail: 'Entrez votre email 📧',
      errorPassword: 'Le mot de passe doit avoir 6+ caractères 🔐',
      errorConnection: 'Erreur de connexion. Réessayez! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Salut',
      readyToImprove: 'Prêt à améliorer ton jeu de rencontres?',
      learnToTalk: 'Apprends à parler avec des gars/filles, améliore tes chats sur WhatsApp, Instagram, Facebook Messenger, Tinder et autres apps de rencontres',
      improveGame: 'Améliore ton jeu',
      moreDates: 'Plus de rendez-vous',
      fastResults: 'Résultats rapides',
      startNow: 'Commencer',
      dating: 'Dating',
      datingDesc: 'Trouve ton match parfait! Swipe, matche et commence des conversations avec des personnes intéressantes près de toi',
      newBadge: 'Nouveau',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Discute avec l\'IA pour pratiquer les conversations, apprendre des techniques et améliorer tes compétences',
      firstDates: 'Premiers Rendez-vous',
      firstDatesDesc: 'Trouve des idées parfaites pour un premier rendez-vous avec des suggestions locales',
      tips: 'Conseils',
      tipsDesc: 'Apprends à parler avec des gars/filles sur WhatsApp, Instagram, Messenger, Tinder',
      events: 'Événements Locaux',
      eventsDesc: 'Trouve des lieux d\'événements, concerts, clubs et divertissements dans ta ville',
      gifts: 'Idées Cadeaux',
      giftsDesc: 'Trouve le cadeau parfait basé sur les intérêts de ton partenaire',
      whyBiseda: 'Pourquoi Biseda.ai?',
      benefit1: 'Apprends à parler avec des gars/filles sur WhatsApp, Instagram, Facebook Messenger, Tinder et autres apps',
      benefit2: 'Reçois des conseils pour les rencontres et comment commencer des conversations intéressantes',
      benefit3: 'Améliore ton jeu et deviens plus confiant dans les chats',
      benefit4: 'IA intelligente qui comprend les émotions et les dialectes albanais pour de meilleures réponses'
    },
    
    // Navigation
    nav: {
      home: 'Accueil',
      aiCoach: 'AI Coach',
      dates: 'Rendez-vous',
      events: 'Événements',
      tips: 'Conseils',
      profile: 'Profil'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Sélectionner le pays',
      cities: 'villes',
      changeLanguage: 'Changer de langue'
    },
    
    // Subscription
    subscription: {
      freeTrial: 'Essai Gratuit',
      free: 'Gratuit',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Passer Premium',
      messagesLeft: 'messages restants',
      imagesLeft: 'images restantes',
      unlimited: 'Illimité'
    },
    
    // Common
    common: {
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès'
    },
    
    // Layout Navigation
    nav: {
      home: 'Accueil',
      dating: 'Dating',
      aiCoach: 'AI Coach',
      profile: 'Profil'
    }
  },
  
  es: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'IA que te hace irresistible',
      tagline2: 'Inicia conversaciones que dejan huella',
      tagline3: 'Citas que comienzan con mensajes perfectos',
      tagline4: 'Vuélvete irresistible 💪',
      register: 'Registrarse',
      login: 'Iniciar sesión',
      firstName: 'Nombre',
      lastName: 'Apellido',
      dateOfBirth: 'Fecha de Nacimiento (18+)',
      day: 'Día',
      month: 'Mes',
      year: 'Año',
      username: 'Elegir nombre de usuario',
      email: 'Email',
      password: 'Contraseña',
      createAccount: 'Crear cuenta',
      loginButton: 'Iniciar sesión',
      startNow: 'Empezar Ahora',
      or: 'O',
      continueWithApple: 'Continuar con Apple',
      appleOnlyIOS: 'Apple Sign In solo está disponible en iOS. Usa email/contraseña aquí.',
      freeTrial: '3 días gratis',
      noCard: 'Sin tarjeta',
      messages: '10 msg/día',
      forgotPassword: '¿Olvidaste tu contraseña?',
      terms: 'Términos y Condiciones',
      byContinuing: 'Al continuar, aceptas',
      premium: 'Planes premium desde €6.99/mes',
      loading: 'Cargando...',
      errorFirstName: 'Ingresa tu nombre ✏️',
      errorLastName: 'Ingresa tu apellido ✏️',
      errorDateOfBirth: 'Selecciona tu fecha de nacimiento 📅',
      errorAge: 'Debes tener 18+ años 🔞',
      errorEmail: 'Ingresa tu email 📧',
      errorPassword: 'La contraseña debe tener 6+ caracteres 🔐',
      errorConnection: 'Error de conexión. ¡Intenta de nuevo! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Hola',
      readyToImprove: '¿Listo para mejorar tu juego de citas?',
      learnToTalk: 'Aprende a hablar con chicos/chicas, mejora tus chats en WhatsApp, Instagram, Facebook Messenger, Tinder y otras apps de citas',
      improveGame: 'Mejora tu juego',
      moreDates: 'Más citas',
      fastResults: 'Resultados rápidos',
      startNow: 'Empezar ahora',
      dating: 'Dating',
      datingDesc: '¡Encuentra tu pareja perfecta! Desliza, haz match y comienza conversaciones con personas interesantes cerca de ti',
      newBadge: 'Nuevo',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Chatea con IA para practicar conversaciones, aprender técnicas y mejorar tus habilidades',
      firstDates: 'Primeras Citas',
      firstDatesDesc: 'Encuentra ideas perfectas para la primera cita con sugerencias locales',
      tips: 'Consejos',
      tipsDesc: 'Aprende a hablar con chicos/chicas en WhatsApp, Instagram, Messenger, Tinder',
      events: 'Eventos Locales',
      eventsDesc: 'Encuentra lugares de eventos, conciertos, clubes y entretenimiento en tu ciudad',
      gifts: 'Ideas de Regalos',
      giftsDesc: 'Encuentra el regalo perfecto basado en los intereses de tu pareja',
      whyBiseda: '¿Por qué Biseda.ai?',
      benefit1: 'Aprende a hablar con chicos/chicas en WhatsApp, Instagram, Facebook Messenger, Tinder y otras apps',
      benefit2: 'Recibe consejos para citas y cómo iniciar conversaciones interesantes',
      benefit3: 'Mejora tu juego y vuélvete más seguro en los chats',
      benefit4: 'IA inteligente que entiende emociones y dialectos albaneses para mejores respuestas'
    },
    
    // Navigation
    nav: {
      home: 'Inicio',
      aiCoach: 'AI Coach',
      dates: 'Citas',
      events: 'Eventos',
      tips: 'Consejos',
      profile: 'Perfil'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Seleccionar País',
      cities: 'ciudades',
      changeLanguage: 'Cambiar Idioma'
    },
    
    // Subscription
    subscription: {
      freeTrial: 'Prueba Gratuita',
      free: 'Gratis',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Hazte Premium',
      messagesLeft: 'mensajes restantes',
      imagesLeft: 'imágenes restantes',
      unlimited: 'Ilimitado'
    },
    
    // Common
    common: {
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito'
    },
    
    // Layout Navigation
    nav: {
      home: 'Inicio',
      dating: 'Dating',
      aiCoach: 'AI Coach',
      profile: 'Perfil'
    }
  },

  ro: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'AI care te face irezistibil',
      tagline2: 'Începe conversații care lasă o impresie',
      tagline3: 'Întâlniri care încep cu mesaje perfecte',
      tagline4: 'Devino irezistibil 💪',
      register: 'Înregistrare',
      login: 'Autentificare',
      firstName: 'Prenume',
      lastName: 'Nume',
      dateOfBirth: 'Data Nașterii (18+)',
      day: 'Zi',
      month: 'Lună',
      year: 'An',
      username: 'Alege username',
      email: 'Email',
      password: 'Parolă',
      createAccount: 'Creare cont',
      loginButton: 'Autentificare',
      startNow: 'Începe Acum',
      or: 'SAU',
      continueWithApple: 'Continuă cu Apple',
      appleOnlyIOS: 'Apple Sign In este disponibil doar pe iOS. Folosește email/parolă aici.',
      freeTrial: '3 zile gratuite',
      noCard: 'Fără card',
      messages: '10 msg/zi',
      forgotPassword: 'Ai uitat parola?',
      terms: 'Termeni și Condiții',
      byContinuing: 'Continuând, accepți',
      premium: 'Planuri premium de la €6.99/lună',
      loading: 'Se încarcă...',
      errorFirstName: 'Introdu prenumele ✏️',
      errorLastName: 'Introdu numele ✏️',
      errorDateOfBirth: 'Selectează data nașterii 📅',
      errorAge: 'Trebuie să ai 18+ ani 🔞',
      errorEmail: 'Introdu email-ul 📧',
      errorPassword: 'Parola trebuie să aibă 6+ caractere 🔐',
      errorConnection: 'Eroare de conexiune. Încearcă din nou! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Salut',
      readyToImprove: 'Gata să-ți îmbunătățești jocul de întâlniri?',
      learnToTalk: 'Învață să vorbești cu băieți/fete, îmbunătățește conversațiile pe WhatsApp, Instagram, Facebook Messenger, Tinder și alte aplicații de dating',
      improveGame: 'Îmbunătățește-ți jocul',
      moreDates: 'Mai multe întâlniri',
      fastResults: 'Rezultate rapide',
      startNow: 'Începe acum',
      dating: 'Dating',
      datingDesc: 'Găsește perechea perfectă! Swipe, match și începe conversații cu persoane interesante din apropierea ta',
      newBadge: 'Nou',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Discută cu AI pentru a exersa conversații, învăța tehnici și îmbunătăți abilitățile',
      firstDates: 'Întâlniri Inițiale',
      firstDatesDesc: 'Găsește idei perfecte pentru prima întâlnire cu sugestii locale',
      tips: 'Sfaturi',
      tipsDesc: 'Învață cum să vorbești cu băieți/fete pe WhatsApp, Instagram, Messenger, Tinder',
      events: 'Evenimente Locale',
      eventsDesc: 'Găsește locuri de evenimente, concerte, cluburi și divertisment în orașul tău',
      gifts: 'Idei de Cadouri',
      giftsDesc: 'Găsește cadoul perfect bazat pe interesele partenerului',
      whyBiseda: 'De ce Biseda.ai?',
      benefit1: 'Învață cum să vorbești cu băieți/fete pe WhatsApp, Instagram, Facebook Messenger, Tinder și alte aplicații',
      benefit2: 'Primește sfaturi pentru întâlniri și cum să începi conversații interesante',
      benefit3: 'Îmbunătățește-ți jocul și devino mai încrezător în conversații',
      benefit4: 'AI inteligent care înțelege emoțiile și dialectele albaneze pentru răspunsuri mai bune'
    },
    
    // Navigation
    nav: {
      home: 'Acasă',
      aiCoach: 'AI Coach',
      dates: 'Întâlniri',
      events: 'Evenimente',
      tips: 'Sfaturi',
      profile: 'Profil'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Selectează Țara',
      cities: 'orașe',
      changeLanguage: 'Schimbă Limba'
    },
    
    // Subscription
    subscription: {
      freeTrial: 'Perioadă de Probă Gratuită',
      free: 'Gratuit',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Treci la Premium',
      messagesLeft: 'mesaje rămase',
      imagesLeft: 'imagini rămase',
      unlimited: 'Nelimitat'
    },
    
    // Common
    common: {
      cancel: 'Anulare',
      confirm: 'Confirmare',
      save: 'Salvare',
      delete: 'Ștergere',
      edit: 'Editare',
      loading: 'Se încarcă...',
      error: 'Eroare',
      success: 'Succes'
    },
    
    // Layout Navigation
    nav: {
      home: 'Acasă',
      dating: 'Dating',
      aiCoach: 'AI Coach',
      profile: 'Profil'
    }
  },

  bg: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'AI, което те прави неустоим',
      tagline2: 'Започни разговори, които оставят впечатление',
      tagline3: 'Срещи, които започват с перфектни съобщения',
      tagline4: 'Стани неустоим 💪',
      register: 'Регистрация',
      login: 'Вход',
      firstName: 'Име',
      lastName: 'Фамилия',
      dateOfBirth: 'Дата на Раждане (18+)',
      day: 'Ден',
      month: 'Месец',
      year: 'Година',
      username: 'Избери потребителско име',
      email: 'Имейл',
      password: 'Парола',
      createAccount: 'Създай профил',
      loginButton: 'Вход',
      startNow: 'Започни Сега',
      or: 'ИЛИ',
      continueWithApple: 'Продължи с Apple',
      appleOnlyIOS: 'Apple Sign In е достъпен само в iOS приложението. Използвай имейл/парола тук.',
      freeTrial: '3 дни безплатно',
      noCard: 'Без карта',
      messages: '10 съобщения/ден',
      forgotPassword: 'Забравена парола?',
      terms: 'Условия за ползване',
      byContinuing: 'Продължавайки, приемаш',
      premium: 'Премиум планове от €6.99/месец',
      loading: 'Зареждане...',
      errorFirstName: 'Въведи името си ✏️',
      errorLastName: 'Въведи фамилията си ✏️',
      errorDateOfBirth: 'Избери дата на раждане 📅',
      errorAge: 'Трябва да си на 18+ години 🔞',
      errorEmail: 'Въведи имейла си 📧',
      errorPassword: 'Паролата трябва да е 6+ символа 🔐',
      errorConnection: 'Грешка в връзката. Опитай отново! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Здравей',
      readyToImprove: 'Готов ли си да подобриш играта си на запознанства?',
      learnToTalk: 'Научи се как да говориш с момчета/момичета, подобри чатовете си в WhatsApp, Instagram, Facebook Messenger, Tinder и други приложения',
      improveGame: 'Подобри играта си',
      moreDates: 'Повече срещи',
      fastResults: 'Бързи резултати',
      startNow: 'Започни сега',
      dating: 'Запознанства',
      datingDesc: 'Намери перфектната половинка! Swipe, match и започни разговори с интересни хора наблизо',
      newBadge: 'Ново',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Говори с AI за да практикуваш разговори, научиш техники и подобриш уменията си',
      firstDates: 'Първи Срещи',
      firstDatesDesc: 'Намери перфектни идеи за първа среща с местни предложения',
      tips: 'Съвети',
      tipsDesc: 'Научи се как да говориш с момчета/момичета в WhatsApp, Instagram, Messenger, Tinder',
      events: 'Местни Събития',
      eventsDesc: 'Намери места за събития, концерти, клубове и забавления в твоя град',
      gifts: 'Идеи за Подаръци',
      giftsDesc: 'Намери перфектния подарък базиран на интересите на партньора',
      whyBiseda: 'Защо Biseda.ai?',
      benefit1: 'Научи се как да говориш с момчета/момичета в WhatsApp, Instagram, Facebook Messenger, Tinder и други приложения',
      benefit2: 'Получи съвети за запознанства и как да започнеш интересни разговори',
      benefit3: 'Подобри играта си и стани по-уверен в чатовете',
      benefit4: 'Интелигентен AI, който разбира емоции и албански диалекти за по-добри отговори'
    },
    
    // Navigation
    nav: {
      home: 'Начало',
      aiCoach: 'AI Coach',
      dates: 'Срещи',
      events: 'Събития',
      tips: 'Съвети',
      profile: 'Профил'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Избери Държава',
      cities: 'градове',
      changeLanguage: 'Смени Език'
    },
    
    // Subscription
    subscription: {
      freeTrial: 'Безплатен Пробен Период',
      free: 'Безплатно',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Стани Премиум',
      messagesLeft: 'съобщения останали',
      imagesLeft: 'изображения останали',
      unlimited: 'Неограничено'
    },
    
    // Common
    common: {
      cancel: 'Отказ',
      confirm: 'Потвърди',
      save: 'Запази',
      delete: 'Изтрий',
      edit: 'Редактирай',
      loading: 'Зареждане...',
      error: 'Грешка',
      success: 'Успех'
    },
    
    // Layout Navigation
    nav: {
      home: 'Начало',
      dating: 'Запознанства',
      aiCoach: 'AI Coach',
      profile: 'Профил'
    }
  },

  el: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'AI που σε κάνει ακαταμάχητο',
      tagline2: 'Ξεκίνα συνομιλίες που αφήνουν εντύπωση',
      tagline3: 'Ραντεβού που ξεκινούν με τέλεια μηνύματα',
      tagline4: 'Γίνε ακαταμάχητος 💪',
      register: 'Εγγραφή',
      login: 'Σύνδεση',
      firstName: 'Όνομα',
      lastName: 'Επώνυμο',
      dateOfBirth: 'Ημερομηνία Γέννησης (18+)',
      day: 'Ημέρα',
      month: 'Μήνας',
      year: 'Έτος',
      username: 'Επίλεξε username',
      email: 'Email',
      password: 'Κωδικός',
      createAccount: 'Δημιουργία λογαριασμού',
      loginButton: 'Σύνδεση',
      startNow: 'Ξεκίνα Τώρα',
      or: 'Ή',
      continueWithApple: 'Συνέχεια με Apple',
      appleOnlyIOS: 'Η σύνδεση Apple είναι διαθέσιμη μόνο στο iOS. Χρησιμοποίησε email/κωδικό εδώ.',
      freeTrial: '3 μέρες δωρεάν',
      noCard: 'Χωρίς κάρτα',
      messages: '10 μηνύματα/μέρα',
      forgotPassword: 'Ξέχασες τον κωδικό;',
      terms: 'Όροι & Προϋποθέσεις',
      byContinuing: 'Συνεχίζοντας, αποδέχεσαι',
      premium: 'Premium πλάνα από €6.99/μήνα',
      loading: 'Φόρτωση...',
      errorFirstName: 'Εισάγετε το όνομά σας ✏️',
      errorLastName: 'Εισάγετε το επώνυμό σας ✏️',
      errorDateOfBirth: 'Επιλέξτε ημερομηνία γέννησης 📅',
      errorAge: 'Πρέπει να είστε 18+ ετών 🔞',
      errorEmail: 'Εισάγετε το email σας 📧',
      errorPassword: 'Ο κωδικός πρέπει να έχει 6+ χαρακτήρες 🔐',
      errorConnection: 'Σφάλμα σύνδεσης. Δοκιμάστε ξανά! 🔄'
    },
    
    // Home Page
    home: {
      greeting: 'Γεια',
      readyToImprove: 'Έτοιμος να βελτιώσεις το dating game σου;',
      learnToTalk: 'Μάθε πώς να μιλάς με αγόρια/κορίτσια, βελτίωσε τις συνομιλίες σου σε WhatsApp, Instagram, Facebook Messenger, Tinder και άλλες εφαρμογές',
      improveGame: 'Βελτίωσε το game σου',
      moreDates: 'Περισσότερα ραντεβού',
      fastResults: 'Γρήγορα αποτελέσματα',
      startNow: 'Ξεκίνα τώρα',
      dating: 'Γνωριμίες',
      datingDesc: 'Βρες το ταίρι σου! Κάνε swipe, match και ξεκίνα συνομιλίες με ενδιαφέροντα άτομα κοντά σου',
      newBadge: 'Νέο',
      aiCoach: 'AI Coach',
      aiCoachDesc: 'Συνομίλησε με AI για να εξασκηθείς σε συνομιλίες, μάθε τεχνικές και βελτίωσε τις ικανότητές σου',
      firstDates: 'Πρώτα Ραντεβού',
      firstDatesDesc: 'Βρες τέλειες ιδέες για πρώτο ραντεβού με τοπικές προτάσεις',
      tips: 'Συμβουλές',
      tipsDesc: 'Μάθε πώς να μιλάς με αγόρια/κορίτσια σε WhatsApp, Instagram, Messenger, Tinder',
      events: 'Τοπικά Events',
      eventsDesc: 'Βρες χώρους εκδηλώσεων, συναυλίες, clubs και διασκέδαση στην πόλη σου',
      gifts: 'Ιδέες Δώρων',
      giftsDesc: 'Βρες το τέλειο δώρο βασισμένο στα ενδιαφέροντα του συντρόφου σου',
      whyBiseda: 'Γιατί Biseda.ai;',
      benefit1: 'Μάθε πώς να μιλάς με αγόρια/κορίτσια σε WhatsApp, Instagram, Facebook Messenger, Tinder και άλλες εφαρμογές',
      benefit2: 'Λάβε συμβουλές για γνωριμίες και πώς να ξεκινάς ενδιαφέρουσες συνομιλίες',
      benefit3: 'Βελτίωσε το game σου και γίνε πιο σίγουρος στις συνομιλίες',
      benefit4: 'Έξυπνο AI που καταλαβαίνει συναισθήματα για καλύτερες απαντήσεις'
    },
    
    // Navigation
    nav: {
      home: 'Αρχική',
      aiCoach: 'AI Coach',
      dates: 'Ραντεβού',
      events: 'Events',
      tips: 'Συμβουλές',
      profile: 'Προφίλ',
      dating: 'Γνωριμίες'
    },
    
    // Country Switcher
    country: {
      selectCountry: 'Επιλογή Χώρας',
      cities: 'πόλεις',
      changeLanguage: 'Αλλαγή Γλώσσας'
    },
    
    // Subscription
    subscription: {
      freeTrial: 'Δωρεάν Δοκιμή',
      free: 'Δωρεάν',
      starter: 'Starter',
      pro: 'Pro',
      elite: 'Elite',
      upgrade: 'Γίνε Premium',
      messagesLeft: 'μηνύματα που απομένουν',
      imagesLeft: 'εικόνες που απομένουν',
      unlimited: 'Απεριόριστο'
    },
    
    // Common
    common: {
      cancel: 'Ακύρωση',
      confirm: 'Επιβεβαίωση',
      save: 'Αποθήκευση',
      delete: 'Διαγραφή',
      edit: 'Επεξεργασία',
      loading: 'Φόρτωση...',
      error: 'Σφάλμα',
      success: 'Επιτυχία'
    }
  },

  pt: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'IA que te torna irresistível',
      tagline2: 'Comece conversas que deixam impressão',
      tagline3: 'Encontros que começam com mensagens perfeitas',
      tagline4: 'Torne-se irresistível 💪',
      register: 'Registar',
      login: 'Entrar',
      firstName: 'Nome',
      lastName: 'Apelido',
      dateOfBirth: 'Data de Nascimento (18+)',
      day: 'Dia',
      month: 'Mês',
      year: 'Ano',
      username: 'Escolher username',
      email: 'Email',
      password: 'Palavra-passe',
      createAccount: 'Criar conta',
      loginButton: 'Entrar',
      startNow: 'Começar Agora',
      or: 'OU',
      continueWithApple: 'Continuar com Apple',
      appleOnlyIOS: 'Apple Sign In só está disponível no iOS. Use email/password aqui.',
      freeTrial: '3 dias grátis',
      noCard: 'Sem cartão',
      messages: '10 msg/dia',
      forgotPassword: 'Esqueceu a password?',
      terms: 'Termos e Condições',
      byContinuing: 'Ao continuar, aceita',
      premium: 'Planos premium a partir de €6.99/mês',
      loading: 'A carregar...',
      errorFirstName: 'Insira o seu nome ✏️',
      errorLastName: 'Insira o seu apelido ✏️',
      errorDateOfBirth: 'Selecione a data de nascimento 📅',
      errorAge: 'Deve ter 18+ anos 🔞',
      errorEmail: 'Insira o seu email 📧',
      errorPassword: 'A password deve ter 6+ caracteres 🔐',
      errorConnection: 'Erro de conexão. Tente novamente! 🔄'
    },
    home: {
      greeting: 'Olá',
      readyToImprove: 'Pronto para melhorar o seu jogo de encontros?',
      startNow: 'Começar agora',
      dating: 'Encontros',
      aiCoach: 'AI Coach',
      tips: 'Dicas'
    },
    nav: {
      home: 'Início',
      aiCoach: 'AI Coach',
      dates: 'Encontros',
      events: 'Eventos',
      tips: 'Dicas',
      profile: 'Perfil',
      dating: 'Encontros'
    },
    country: {
      selectCountry: 'Selecionar País',
      cities: 'cidades',
      changeLanguage: 'Mudar Idioma'
    },
    common: {
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'A carregar...',
      error: 'Erro',
      success: 'Sucesso'
    }
  },

  nl: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'AI die je onweerstaanbaar maakt',
      tagline2: 'Start gesprekken die indruk maken',
      tagline3: 'Dates die beginnen met perfecte berichten',
      tagline4: 'Word onweerstaanbaar 💪',
      register: 'Registreren',
      login: 'Inloggen',
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      dateOfBirth: 'Geboortedatum (18+)',
      day: 'Dag',
      month: 'Maand',
      year: 'Jaar',
      email: 'E-mail',
      password: 'Wachtwoord',
      createAccount: 'Account aanmaken',
      loginButton: 'Inloggen',
      startNow: 'Nu Starten',
      or: 'OF',
      freeTrial: '3 dagen gratis',
      noCard: 'Geen kaart',
      messages: '10 berichten/dag',
      forgotPassword: 'Wachtwoord vergeten?',
      terms: 'Voorwaarden',
      byContinuing: 'Door verder te gaan, accepteer je',
      loading: 'Laden...',
      errorFirstName: 'Voer je voornaam in ✏️',
      errorLastName: 'Voer je achternaam in ✏️',
      errorDateOfBirth: 'Selecteer geboortedatum 📅',
      errorAge: 'Je moet 18+ jaar zijn 🔞',
      errorEmail: 'Voer je e-mail in 📧',
      errorPassword: 'Wachtwoord moet 6+ tekens hebben 🔐',
      errorConnection: 'Verbindingsfout. Probeer opnieuw! 🔄'
    },
    nav: {
      home: 'Home',
      aiCoach: 'AI Coach',
      dates: 'Dates',
      profile: 'Profiel',
      dating: 'Dating'
    },
    country: {
      selectCountry: 'Land Selecteren',
      changeLanguage: 'Taal Wijzigen'
    },
    common: {
      cancel: 'Annuleren',
      confirm: 'Bevestigen',
      save: 'Opslaan',
      loading: 'Laden...'
    }
  },

  pl: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'AI, które czyni Cię nieodpartym',
      tagline2: 'Rozpocznij rozmowy, które robią wrażenie',
      tagline3: 'Randki zaczynające się od perfekcyjnych wiadomości',
      tagline4: 'Stań się nieodparty 💪',
      register: 'Zarejestruj się',
      login: 'Zaloguj się',
      firstName: 'Imię',
      lastName: 'Nazwisko',
      dateOfBirth: 'Data Urodzenia (18+)',
      day: 'Dzień',
      month: 'Miesiąc',
      year: 'Rok',
      email: 'Email',
      password: 'Hasło',
      createAccount: 'Utwórz konto',
      loginButton: 'Zaloguj się',
      startNow: 'Zacznij Teraz',
      or: 'LUB',
      freeTrial: '3 dni za darmo',
      noCard: 'Bez karty',
      messages: '10 wiadomości/dzień',
      forgotPassword: 'Zapomniałeś hasła?',
      terms: 'Regulamin',
      byContinuing: 'Kontynuując, akceptujesz',
      loading: 'Ładowanie...',
      errorFirstName: 'Wpisz swoje imię ✏️',
      errorLastName: 'Wpisz swoje nazwisko ✏️',
      errorDateOfBirth: 'Wybierz datę urodzenia 📅',
      errorAge: 'Musisz mieć 18+ lat 🔞',
      errorEmail: 'Wpisz swój email 📧',
      errorPassword: 'Hasło musi mieć 6+ znaków 🔐',
      errorConnection: 'Błąd połączenia. Spróbuj ponownie! 🔄'
    },
    nav: {
      home: 'Strona główna',
      aiCoach: 'AI Coach',
      dates: 'Randki',
      profile: 'Profil',
      dating: 'Randki'
    },
    country: {
      selectCountry: 'Wybierz Kraj',
      changeLanguage: 'Zmień Język'
    },
    common: {
      cancel: 'Anuluj',
      confirm: 'Potwierdź',
      save: 'Zapisz',
      loading: 'Ładowanie...'
    }
  },

  tr: {
    // Auth Page
    auth: {
      title: 'Biseda.ai',
      tagline1: 'Seni karşı konulmaz yapan AI',
      tagline2: 'İzlenim bırakan sohbetler başlat',
      tagline3: 'Mükemmel mesajlarla başlayan buluşmalar',
      tagline4: 'Karşı konulmaz ol 💪',
      register: 'Kayıt Ol',
      login: 'Giriş Yap',
      firstName: 'Ad',
      lastName: 'Soyad',
      dateOfBirth: 'Doğum Tarihi (18+)',
      day: 'Gün',
      month: 'Ay',
      year: 'Yıl',
      email: 'E-posta',
      password: 'Şifre',
      createAccount: 'Hesap oluştur',
      loginButton: 'Giriş Yap',
      startNow: 'Şimdi Başla',
      or: 'VEYA',
      freeTrial: '3 gün ücretsiz',
      noCard: 'Kart yok',
      messages: '10 mesaj/gün',
      forgotPassword: 'Şifreni mi unuttun?',
      terms: 'Şartlar ve Koşullar',
      byContinuing: 'Devam ederek kabul ediyorsun',
      loading: 'Yükleniyor...',
      errorFirstName: 'Adınızı girin ✏️',
      errorLastName: 'Soyadınızı girin ✏️',
      errorDateOfBirth: 'Doğum tarihi seçin 📅',
      errorAge: '18+ yaşında olmalısınız 🔞',
      errorEmail: 'E-postanızı girin 📧',
      errorPassword: 'Şifre 6+ karakter olmalı 🔐',
      errorConnection: 'Bağlantı hatası. Tekrar deneyin! 🔄'
    },
    nav: {
      home: 'Ana Sayfa',
      aiCoach: 'AI Coach',
      dates: 'Buluşmalar',
      profile: 'Profil',
      dating: 'Buluşma'
    },
    country: {
      selectCountry: 'Ülke Seç',
      changeLanguage: 'Dil Değiştir'
    },
    common: {
      cancel: 'İptal',
      confirm: 'Onayla',
      save: 'Kaydet',
      loading: 'Yükleniyor...'
    }
  }
};

// Get language for a country code
export function getLanguageForCountry(countryCode) {
  return countryToLanguage[countryCode] || 'sq'; // Default to Albanian
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

