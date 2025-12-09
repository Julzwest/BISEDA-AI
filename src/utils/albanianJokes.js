// Albanian Jokes (Barzoleta) Database
// Comprehensive collection of Albanian jokes for AI personality

export const albanianJokes = {
  // Classic Albanian jokes
  classic: [
    "Ç'kemi? - Mirë, por nuk jam i sigurt!",
    "Si po shkon? - Po shkon, po shkon, por nuk di ku!",
    "Ku je? - Këtu! - Ku këtu? - Këtu këtu!",
    "Kur vjen? - Kur të vijë!",
    "Si është? - Si është, është!",
    "Ç'do? - Ç'do, do!",
    "Si po bën? - Po bën, po bën, por nuk di çfarë!",
    "Ku shkon? - Po shkon, po shkon, por nuk di ku!",
    "Kur shkon? - Kur të shkojë!",
    "Si është? - Si është, është, por nuk di si!",
  ],

  // Regional jokes (Jugort/Verior)
  regional: [
    "Jugorti dhe Veriorti hynë në bar. Jugorti thotë: 'Ç'kemi plak!' Veriorti thotë: 'Mirë, faleminderit!'",
    "Pse jugortët janë më të qeshur? Sepse kanë më shumë diell!",
    "Pse veriorët janë më seriozë? Sepse kanë më shumë mal!",
    "Jugorti: 'Hajde të shkojmë në plazh!' Veriorti: 'Mirë, por le të bëjmë planin fillimisht!'",
    "Tirana vs Durrës: Tiranasi thotë 'Ç'kemi!' Durrsaku thotë 'Mirëmëngjes!'",
  ],

  // Dating/romantic jokes
  dating: [
    "Si të flasësh me vajza? Thjesht flit si me njerëz normalë, por më cool!",
    "Pse Tinder në Shqipëri është si lotaria? Sepse nuk e di kur do të fitosh!",
    "Mesazhi më i mirë për vajza: 'Ç'kemi! Si po shkon?' - Jo, kjo është e mërzitshme!",
    "Pse Instagram është më i rëndësishëm se Tinder në Shqipëri? Sepse Instagram është Instagram!",
    "Si të marrësh numër në Tinder? Thjesht mos jesh i mërzitshëm!",
  ],

  // Street smart jokes
  street: [
    "Real talk: Nëse nuk funksionon, provo përsëri!",
    "No cap: Mesazhi yt është fire!",
    "Deadass: Kjo do të funksionojë!",
    "Fr: Ti je cool, plak!",
    "Vibe check: Ajo është në mood për të biseduar!",
  ],

  // Cultural jokes
  cultural: [
    "Pse shqiptarët preferojnë Instagram? Sepse Instagram është Instagram!",
    "Si të bisedosh me shqiptarë? Thjesht flit shqip dhe jesh cool!",
    "Pse Tinder në Shqipëri është i vështirë? Sepse të gjithë duan të jenë cool!",
    "Si të bëhesh cool në Shqipëri? Thjesht jesh cool!",
    "Pse shqiptarët janë cool? Sepse janë shqiptarë!",
  ],

  // Modern jokes (memes, trends)
  modern: [
    "Si në atë meme të TikTok që po shkon tani...",
    "E di që në Instagram, story replies janë më efektive!",
    "Real talk: Kjo është fire! 🔥",
    "No cap: Ti je cool, plak!",
    "Deadass: Kjo do të funksionojë!",
  ],

  // Flirty/naughty jokes (sophisticated)
  flirty: [
    "Si të bësh vajzën të qeshë? Thjesht jesh funny dhe cool!",
    "Pse humor është i rëndësishëm? Sepse bën njerëzit të qeshin!",
    "Si të bëhesh më tërheqës? Thjesht jesh cool dhe funny!",
    "Pse banter është i rëndësishëm? Sepse bën bisedën më argëtuese!",
    "Si të krijosh tension? Thjesht jesh naughty por elegante!",
  ],

  // City-specific jokes
  cities: [
    "Tirana: 'Ç'kemi!' - Cool dhe i shpejtë!",
    "Durrës: 'Mirëmëngjes!' - Cool dhe i qetë!",
    "Vlorë: 'Si po shkon?' - Cool dhe i relaksuar!",
    "Shkodër: 'Tungjatjeta!' - Cool dhe i respektueshëm!",
    "Korçë: 'Mirëdita!' - Cool dhe i sofistikuar!",
  ],

  // App-specific jokes
  apps: [
    "Tinder në Shqipëri: 'Ç'kemi!' - Jo, kjo është e mërzitshme!",
    "Instagram në Shqipëri: Story reply është më efektive!",
    "WhatsApp në Shqipëri: Biseda është më e natyrshme!",
    "Badoo në Shqipëri: Më tradicional, por cool!",
  ],

  // Self-deprecating humor
  selfDeprecating: [
    "E di që duket si këshillë e vjetër, por vërtet funksionon!",
    "Më vjen keq, më duket që keq e shpreha më parë. Le ta them më mirë...",
    "Haha, e di që duket si këshillë e vjetër, por trust me, funksionon!",
    "Plak, e di që duket si këshillë e vjetër, por real talk, funksionon!",
  ],

  // Celebratory jokes
  celebratory: [
    "Fire! 🔥 Shko me këtë, plak!",
    "Perfekt! Kjo është fire!",
    "E shkëlqyer! Ti je cool!",
    "Deadass, kjo është fire!",
    "No cap, ti je cool, plak!",
  ],

  // Empathetic jokes
  empathetic: [
    "Plak, e kuptoj që është e vështirë, por mos u merzit - kjo nuk do të thotë gjithçka!",
    "Vajzë, e di që ndihesh, por trust me, do të funksionojë!",
    "E kuptoj që është e vështirë, por real talk, do të funksionojë!",
    "Mos u merzit, plak - kjo është pjesë e lojës!",
  ],
};

// Get random joke by category
export function getRandomJoke(category = null) {
  if (category && albanianJokes[category]) {
    const jokes = albanianJokes[category];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // Get random joke from all categories
  const allCategories = Object.keys(albanianJokes);
  const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
  const jokes = albanianJokes[randomCategory];
  return jokes[Math.floor(Math.random() * jokes.length)];
}

// Get joke by context
export function getJokeByContext(context) {
  if (context.includes('dating') || context.includes('vajza') || context.includes('djalë')) {
    return getRandomJoke('dating');
  }
  if (context.includes('jugor') || context.includes('verior') || context.includes('tiranë') || context.includes('durrës')) {
    return getRandomJoke('regional');
  }
  if (context.includes('tinder') || context.includes('instagram') || context.includes('whatsapp')) {
    return getRandomJoke('apps');
  }
  if (context.includes('fire') || context.includes('cool') || context.includes('perfekt')) {
    return getRandomJoke('celebratory');
  }
  if (context.includes('vështirë') || context.includes('merzit') || context.includes('dëshpëruar')) {
    return getRandomJoke('empathetic');
  }
  
  return getRandomJoke();
}

export default albanianJokes;

