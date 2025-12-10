import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Heart, Sparkles, ShoppingBag, Star, TrendingUp, ExternalLink, MapPin, Store, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/SaveButton';
import { base44 } from '@/api/base44Client';
import { countries, getLocalizedCitiesForCountry, getCountryByCode, getCityNameEn, getCurrencySymbol, getLocalizedCountryName } from '@/config/countries';

export default function GiftSuggestions() {
  const { t, i18n } = useTranslation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://biseda-ai.onrender.com';
  
  // Get user's country from localStorage
  const userCountry = localStorage.getItem('userCountry') || 'AL';
  const currentCountry = getCountryByCode(userCountry);
  const currencySymbol = getCurrencySymbol(userCountry);
  
  // Get localized cities - depends on i18n.language for reactivity
  const localizedCities = React.useMemo(() => {
    return getLocalizedCitiesForCountry(userCountry);
  }, [userCountry, i18n.language]);
  
  // Get localized country name - depends on i18n.language for reactivity
  const localizedCountryName = React.useMemo(() => {
    return getLocalizedCountryName(userCountry);
  }, [userCountry, i18n.language]);
  
  const [partnerInterests, setPartnerInterests] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [localShops, setLocalShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [isLoadingMoreShops, setIsLoadingMoreShops] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const occasions = [
    { id: 'birthday', name: t('gifts.occasions.birthday'), icon: '🎂' },
    { id: 'anniversary', name: t('gifts.occasions.anniversary'), icon: '💕' },
    { id: 'valentine', name: t('gifts.occasions.valentine'), icon: '💖' },
    { id: 'christmas', name: t('gifts.occasions.christmas'), icon: '🎄' },
    { id: 'newyear', name: t('gifts.occasions.newyear'), icon: '🎉' },
    { id: 'justbecause', name: t('gifts.occasions.justbecause'), icon: '💝' }
  ];

  // Dynamic budgets based on currency
  const getBudgets = () => {
    if (currencySymbol === '£') {
      return [
        { id: 'low', name: '£10-30', value: 'low' },
        { id: 'medium', name: '£30-100', value: 'medium' },
        { id: 'high', name: '£100-250', value: 'high' },
        { id: 'premium', name: '£250+', value: 'premium' }
      ];
    } else if (currencySymbol === '$') {
      return [
        { id: 'low', name: '$15-40', value: 'low' },
        { id: 'medium', name: '$40-120', value: 'medium' },
        { id: 'high', name: '$120-350', value: 'high' },
        { id: 'premium', name: '$350+', value: 'premium' }
      ];
    } else if (currencySymbol === 'CHF') {
      return [
        { id: 'low', name: 'CHF 15-40', value: 'low' },
        { id: 'medium', name: 'CHF 40-120', value: 'medium' },
        { id: 'high', name: 'CHF 120-350', value: 'high' },
        { id: 'premium', name: 'CHF 350+', value: 'premium' }
      ];
    } else if (currencySymbol === 'L') {
      return [
        { id: 'low', name: 'L 1,500-4,000', value: 'low' },
        { id: 'medium', name: 'L 4,000-12,000', value: 'medium' },
        { id: 'high', name: 'L 12,000-35,000', value: 'high' },
        { id: 'premium', name: 'L 35,000+', value: 'premium' }
      ];
    }
    return [
      { id: 'low', name: '€10-30', value: 'low' },
      { id: 'medium', name: '€30-100', value: 'medium' },
      { id: 'high', name: '€100-300', value: 'high' },
      { id: 'premium', name: '€300+', value: 'premium' }
    ];
  };
  
  const budgets = getBudgets();

  const generateGiftSuggestions = async () => {
    if (!partnerInterests.trim()) {
      alert(t('gifts.enterInterests'));
      return;
    }

    setIsLoading(true);
    setSuggestions([]);
    
    // If city is selected, also search for local shops
    if (selectedCity) {
      searchLocalShops();
    }

    try {
      // Create a simpler, more direct prompt for OpenAI
      const budgetText = budget === 'low' ? '€10-30' : budget === 'medium' ? '€30-100' : budget === 'high' ? '€100-300' : budget === 'premium' ? '€300+' : 'çdo buxhet';
      const occasionText = occasions.find(o => o.id === occasion)?.name || 'çdo rast';
      
      const prompt = `Gift ideas for someone who likes: ${partnerInterests}
Occasion: ${occasionText}
Budget: ${budgetText}

Return a simple JSON array with 5 gift ideas. Use this EXACT format:
[
{"name":"Gift 1","description":"Simple description","price":"€10-20","category":"Books","rating":"4.5"},
{"name":"Gift 2","description":"Simple description","price":"€20-30","category":"Tech","rating":"4.6"}
]

RULES:
- Use ONLY simple descriptions (no quotes, no special chars)
- Keep it short
- Return ONLY the JSON array, nothing else`;

      // Call the AI API
      const response = await base44.integrations.Core.InvokeLLM({ 
        prompt,
        conversationHistory: [],
        systemPrompt: "Return ONLY a JSON array. No markdown. No explanations. Use simple English words in descriptions. Avoid quotes and special characters."
      });

      console.log('🎁 AI Raw Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response length:', response?.length);
      setDebugInfo('Parsing AI response...');

      // Parse the response - EXTREME cleaning
      let aiSuggestions = [];
      let usedFallback = false;
      
      try {
        let cleanedResponse = String(response).trim();
        
        // Log original
        console.log('📝 Original response first 300 chars:', cleanedResponse.substring(0, 300));
        
        // Step 1: Remove markdown
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Step 2: Extract JSON array (greedy match)
        const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          cleanedResponse = arrayMatch[0];
          console.log('✂️ Extracted array');
        }
        
        // Step 3: Fix newlines and weird whitespace
        cleanedResponse = cleanedResponse.replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ');
        
        // Step 4: Fix quotes - AGGRESSIVE
        // Replace smart quotes with regular quotes
        cleanedResponse = cleanedResponse.replace(/[""]/g, '"').replace(/['']/g, "'");
        
        // Step 5: Fix common issues with string values
        // Find all string values and clean them
        cleanedResponse = cleanedResponse.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
          // Keep the outer quotes, clean the inside
          let inner = match.substring(1, match.length - 1);
          // Remove any stray quotes that aren't escaped
          inner = inner.replace(/(?<!\\)"/g, '');
          return `"${inner}"`;
        });
        
        // Step 6: Remove trailing commas
        cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1');
        
        // Step 7: Ensure proper spacing
        cleanedResponse = cleanedResponse.replace(/\s+/g, ' ');
        
        console.log('🧹 Cleaned response first 300 chars:', cleanedResponse.substring(0, 300));
        
        // Try to parse
        try {
          aiSuggestions = JSON.parse(cleanedResponse);
          console.log('✅ Parsed successfully!');
        } catch (e) {
          // Last resort: try to manually extract objects
          console.log('⚠️ JSON.parse failed, trying manual extraction...');
          const objPattern = /\{[^{}]*"name"[^{}]*\}/g;
          const matches = cleanedResponse.match(objPattern);
          if (matches && matches.length > 0) {
            aiSuggestions = matches.map(m => {
              try {
                return JSON.parse(m);
              } catch {
                return null;
              }
            }).filter(x => x !== null);
            console.log('✅ Manually extracted', aiSuggestions.length, 'objects');
          } else {
            throw e;
          }
        }
        
        // Validate
        if (!Array.isArray(aiSuggestions) || aiSuggestions.length === 0) {
          throw new Error('No valid suggestions found');
        }
        
        console.log('✅ Final count:', aiSuggestions.length, 'suggestions');
        setDebugInfo(`✅ Using Real AI suggestions! (${aiSuggestions.length} items)`);
        
      } catch (parseError) {
        console.error('❌ All parsing attempts failed:', parseError.message);
        console.error('📄 Full raw response:', response);
        
        // Fallback
        aiSuggestions = generateMockSuggestions(partnerInterests, occasion, budget);
        usedFallback = true;
        setDebugInfo('⚠️ AI parsing failed - using fallback. Check console for details.');
      }

      // Add IDs and affiliate links
      const suggestionsWithIds = aiSuggestions.slice(0, 5).map((suggestion, index) => ({
        id: index + 1,
        name: suggestion.name || suggestion.title || 'Dhuratë',
        description: suggestion.description || 'Përshkrim i dhuratës',
        price: suggestion.price || '€50-100',
        category: suggestion.category || 'General',
        rating: String(suggestion.rating || '4.5'),
        affiliateLink: `https://www.amazon.com/s?k=${encodeURIComponent(suggestion.name || suggestion.title || partnerInterests)}`
      }));

      console.log('🎁 Final suggestions to display:', suggestionsWithIds);
      setSuggestions(suggestionsWithIds);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to mock suggestions on error
      const mockSuggestions = generateMockSuggestions(partnerInterests, occasion, budget);
      setSuggestions(mockSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocalShops = async (isLoadMore = false) => {
    if (!selectedCity) return;
    
    if (isLoadMore) {
      setIsLoadingMoreShops(true);
    } else {
      setIsLoadingShops(true);
      setLocalShops([]);
    }

    try {
      // Get English names for Google Places API
      const cityNameEn = getCityNameEn(userCountry, selectedCity);
      const countryNameEn = currentCountry?.nameEn || 'Albania';
      
      console.log('🏪 Searching for local shops in', cityNameEn, countryNameEn, isLoadMore ? '(loading more)' : '');
      
      // Search for gift-related shops based on interests
      const shopQuery = `gift shops jewelry stores flower shops boutiques bookstores ${partnerInterests || ''}`;

      const response = await fetch(`${backendUrl}/api/places/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: shopQuery,
          location: `${cityNameEn}, ${countryNameEn}`,
          category: 'gifts'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.source === 'google-places' && data.places && data.places.length > 0) {
          console.log('✅ Found', data.places.length, 'local shops');
          
          let formattedShops = data.places.map((shop, index) => ({
            id: isLoadMore ? localShops.length + index + 1 : index + 1,
            name: shop.name,
            description: shop.description,
            location: shop.location,
            rating: shop.rating,
            price: shop.price,
            googleMapsLink: shop.googleMapsLink,
            isOpen: shop.isOpen,
            source: 'google'
          }));
          
          // If loading more, filter out duplicates
          if (isLoadMore) {
            const existingNames = localShops.map(s => s.name.toLowerCase());
            formattedShops = formattedShops.filter(shop => 
              !existingNames.includes(shop.name.toLowerCase())
            );
            console.log('✅ Filtered duplicates, adding', formattedShops.length, 'new shops');
            setLocalShops(prev => [...prev, ...formattedShops]);
          } else {
            setLocalShops(formattedShops);
          }
        } else {
          console.log('⚠️ No local shops found or Google Places not available');
        }
      }
    } catch (error) {
      console.error('❌ Error searching local shops:', error);
    } finally {
      setIsLoadingShops(false);
      setIsLoadingMoreShops(false);
    }
  };

  const handleLoadMoreShops = () => {
    searchLocalShops(true);
  };

  const generateMockSuggestions = (interests, occasion, budget) => {
    const lowBudgetGifts = [
      { name: 'Libër Personalizuar', description: 'Libër me foto dhe kujtime të veçanta', price: '€15-25', category: 'Personal', affiliateLink: 'https://example.com/gift1' },
      { name: 'Kuti Çokollatash Premium', description: 'Çokollata artizanale me shije të ndryshme', price: '€20-30', category: 'Food', affiliateLink: 'https://example.com/gift2' },
      { name: 'Kuti Surprizë me Produkte Kujdesi', description: 'Produkte kujdesi dhe relaksimi', price: '€25-35', category: 'Wellness', affiliateLink: 'https://example.com/gift3' }
    ];

    const mediumBudgetGifts = [
      { name: 'Orë Elegante', description: 'Orë me stil modern dhe elegant', price: '€50-80', category: 'Accessories', affiliateLink: 'https://example.com/gift4' },
      { name: 'Parfum Premium', description: 'Parfum me erë të veçantë dhe elegante', price: '€60-100', category: 'Fragrance', affiliateLink: 'https://example.com/gift5' },
      { name: 'Voucher Spa & Relaksim', description: 'Ditë relaksimi në spa lokale', price: '€70-100', category: 'Experience', affiliateLink: 'https://example.com/gift6' }
    ];

    const highBudgetGifts = [
      { name: 'Bijuteri Elegante', description: 'Bijuteri me diamant ose ari', price: '€150-250', category: 'Jewelry', affiliateLink: 'https://example.com/gift7' },
      { name: 'Voucher Udhëtim Romantik', description: 'Weekend romantik në destinacion të bukur', price: '€200-300', category: 'Experience', affiliateLink: 'https://example.com/gift8' },
      { name: 'Teknologji Premium', description: 'Apple Watch, AirPods Pro, ose tablet', price: '€250-350', category: 'Electronics', affiliateLink: 'https://example.com/gift9' }
    ];

    const premiumGifts = [
      { name: 'Bijuteri Luksoze', description: 'Bijuteri me diamant ose ari 18k', price: '€400+', category: 'Jewelry', affiliateLink: 'https://example.com/gift10' },
      { name: 'Udhëtim Luksoz', description: 'Udhëtim në destinacion luksoz për 2-3 ditë', price: '€500+', category: 'Experience', affiliateLink: 'https://example.com/gift11' },
      { name: 'Produkt Luksoz Personalizuar', description: 'Produkt luksoz i personalizuar me emër/initiale', price: '€300+', category: 'Luxury', affiliateLink: 'https://example.com/gift12' }
    ];

    let giftPool = [];
    if (budget === 'low') giftPool = lowBudgetGifts;
    else if (budget === 'medium') giftPool = mediumBudgetGifts;
    else if (budget === 'high') giftPool = highBudgetGifts;
    else if (budget === 'premium') giftPool = premiumGifts;
    else giftPool = [...lowBudgetGifts, ...mediumBudgetGifts];

    // Select 5 random gifts
    const selected = [];
    const pool = [...giftPool];
    for (let i = 0; i < Math.min(5, pool.length); i++) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected.push({
        id: i + 1,
        ...pool[randomIndex],
        rating: (4.0 + Math.random() * 1.0).toFixed(1)
      });
      pool.splice(randomIndex, 1);
    }

    return selected;
  };

  const handleAffiliateClick = (link, giftName) => {
    // Track affiliate click
    console.log(`Affiliate click: ${giftName} - ${link}`);
    // Open affiliate link in new tab
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="px-6 pt-20 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/50 animate-pulse">
              <Gift className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-slate-900" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-300 via-rose-300 to-red-300 bg-clip-text text-transparent mb-2">
          {t('gifts.title')}
        </h1>
        <p className="text-slate-400 text-sm">{t('gifts.subtitle')}</p>
        {debugInfo && (
          <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p className="text-blue-300 text-xs font-mono">{debugInfo}</p>
          </div>
        )}
      </div>

      {/* Partner Interests Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-2">
          {t('gifts.partnerInterests')}
        </label>
        <textarea
          value={partnerInterests}
          onChange={(e) => setPartnerInterests(e.target.value)}
          placeholder={t('gifts.partnerInterestsPlaceholder')}
          className="w-full p-4 bg-slate-800/80 border-2 border-purple-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none"
          rows={3}
          style={{ fontSize: '16px' }}
        />
      </div>

      {/* Occasion Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-3">
          {t('gifts.specialOccasion')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {occasions.map((occ) => (
            <button
              key={occ.id}
              onClick={() => setOccasion(occ.id)}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                occasion === occ.id
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <div className="text-2xl mb-1">{occ.icon}</div>
              <div className="text-xs">{occ.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-3">
          {t('gifts.budget')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {budgets.map((bud) => (
            <button
              key={bud.id}
              onClick={() => setBudget(bud.value)}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                budget === bud.value
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {bud.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Country Display */}
      <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">
            {t('gifts.location')}: {currentCountry?.flag} {localizedCountryName}
          </span>
          <a href="#/profile" className="ml-auto text-xs text-cyan-400 hover:text-cyan-300 underline">
            {t('gifts.change')}
          </a>
        </div>
      </div>

      {/* City Selection (Optional - for local shops) */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          {t('gifts.cityOptional')}
        </label>
        <div className="flex flex-wrap gap-2">
          {localizedCities.map((city) => (
            <button
              key={city.nameEn}
              onClick={() => setSelectedCity(selectedCity === city.displayName ? '' : city.displayName)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCity === city.displayName
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {city.displayName}
            </button>
          ))}
        </div>
        {selectedCity && (
          <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
            <Store className="w-3 h-3" />
            {t('gifts.willShowLocalShops', { city: selectedCity })}
          </p>
        )}
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <Button
          onClick={generateGiftSuggestions}
          disabled={isLoading || !partnerInterests.trim()}
          className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white font-bold py-3 text-base disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('gifts.generating')}</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>{t('gifts.generateSuggestions')}</span>
            </span>
          )}
        </Button>
      </div>

      {/* Loading Local Shops */}
      {isLoadingShops && selectedCity && (
        <div className="text-center py-6 mb-6">
          <div className="inline-block w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 mt-3 text-sm">{t('gifts.searchingLocalShops', { city: selectedCity })}</p>
        </div>
      )}

      {/* Local Shops Section - SHOWN FIRST */}
      {selectedCity && localShops.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-cyan-400" />
              {t('gifts.localShopsIn', { city: selectedCity })}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          </div>

          <div className="space-y-3">
            {localShops.map((shop, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-2 border-cyan-500/30 backdrop-blur-sm hover:scale-[1.02] transition-all"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-white font-bold">{shop.name}</h3>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-xs font-bold text-white">
                          <MapPin className="w-3 h-3" />
                          Verified
                        </span>
                        {shop.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-slate-300">{shop.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{shop.description}</p>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {shop.price && (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
                            {shop.price}
                          </span>
                        )}
                        {shop.location && (
                          <span className="text-xs text-slate-400">
                            📍 {shop.location}
                          </span>
                        )}
                      </div>
                      {shop.googleMapsLink && (
                        <a
                          href={shop.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-xs font-semibold text-cyan-300 transition-all"
                        >
                          <MapPin className="w-3 h-3" />
                          {t('gifts.viewOnGoogleMaps')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Shops Button */}
          <div className="mt-4">
            <Button
              onClick={handleLoadMoreShops}
              disabled={isLoadingMoreShops}
              className="w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-600/80 via-blue-600/80 to-cyan-600/80 text-white hover:from-cyan-600 hover:via-blue-600 hover:to-cyan-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isLoadingMoreShops ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('gifts.loadingMoreShops')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Store className="w-5 h-5" />
                  <span>{t('gifts.loadMoreShops')}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Loading AI Suggestions State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 mt-4 text-sm">{t('gifts.generatingIdeas')}</p>
        </div>
      )}

      {/* AI Gift Ideas - SHOWN SECOND (After Local Shops) */}
      {!isLoading && suggestions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              {t('gifts.giftIdeasOnline')}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
          </div>

          <div className="space-y-4">
            {suggestions.map((gift) => (
              <Card
                key={gift.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-pink-500/30 backdrop-blur-sm hover:scale-[1.02] transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0 shadow-lg">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{gift.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {gift.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs text-slate-300">{gift.rating}</span>
                              </div>
                            )}
                            {gift.category && (
                              <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded-lg text-xs font-semibold">
                                {gift.category}
                              </span>
                            )}
                          </div>
                        </div>
                        {gift.price && (
                          <span className="text-sm font-bold text-pink-400 shrink-0">
                            {gift.price}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm mb-4 leading-relaxed">{gift.description}</p>
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleAffiliateClick(gift.affiliateLink, gift.name)}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            <span>{t('gifts.viewAndBuy')}</span>
                            <ExternalLink className="w-4 h-4" />
                          </span>
                        </Button>
                        <SaveButton 
                          item={gift} 
                          type="gift"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isLoadingShops && suggestions.length === 0 && localShops.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-3">🎁</div>
          <p className="text-slate-400 text-sm mb-2">{t('gifts.emptyState')}</p>
          <p className="text-slate-500 text-xs">{t('gifts.emptyStateSubtitle')}</p>
        </div>
      )}

      {/* Affiliate Info */}
      {suggestions.length > 0 && (
        <Card className="mt-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-purple-500/30 backdrop-blur-sm">
          <div className="p-4">
            <p className="text-xs text-slate-400 text-center">
              {t('gifts.affiliateNote')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

