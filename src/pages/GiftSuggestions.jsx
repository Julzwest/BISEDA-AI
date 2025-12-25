import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Heart, Sparkles, ShoppingBag, Star, TrendingUp, ExternalLink, MapPin, Store, Globe, Lock, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/SaveButton';
import { base44 } from '@/api/base44Client';
import { countries, getLocalizedCitiesForCountry, getCountryByCode, getCityNameEn, getCurrencySymbol, getLocalizedCountryName } from '@/config/countries';
import UpgradeModal from '@/components/UpgradeModal';

export default function GiftSuggestions() {
  const { t, i18n } = useTranslation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://biseda-ai.onrender.com';
  
  // Check if user has Pro or Elite subscription
  const [hasAccess, setHasAccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // 🎉 EVERYTHING IS FREE NOW!
  const checkAccess = () => {
    return true; // All features are free!
  };
  
  useEffect(() => {
    const access = checkAccess();
    setHasAccess(access);
    if (!access) {
      setShowUpgradeModal(true);
    }
  }, []);
  
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
  const [partnerGender, setPartnerGender] = useState(''); // Gender of gift recipient
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [localShops, setLocalShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [isLoadingMoreShops, setIsLoadingMoreShops] = useState(false);
  const [showLocalShops, setShowLocalShops] = useState(false); // Toggle for local shops
  const [shoppingMode, setShoppingMode] = useState('online'); // 'online' or 'physical'

  // Gender options for gift recipient
  const genderOptions = [
    { id: 'female', label: t('gifts.forHer', 'For Her'), emoji: '👩', color: 'from-pink-500 to-rose-500' },
    { id: 'male', label: t('gifts.forHim', 'For Him'), emoji: '👨', color: 'from-blue-500 to-cyan-500' },
    { id: 'nonbinary', label: t('gifts.forThem', 'For Them'), emoji: '🧑', color: 'from-purple-500 to-violet-500' }
  ];

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

  const generateGiftSuggestions = async (isLoadMore = false) => {
    if (!partnerInterests.trim()) {
      alert(t('gifts.enterInterests'));
      return;
    }

    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setSuggestions([]);
      
      // If city is selected AND user wants local shops, search for them
      if (selectedCity && showLocalShops) {
        searchLocalShops();
      }
    }

    try {
      // Get budget range based on currency
      const budgetRanges = {
        low: currencySymbol === '£' ? '£10-30' : currencySymbol === '$' ? '$15-40' : '€10-30',
        medium: currencySymbol === '£' ? '£30-100' : currencySymbol === '$' ? '$40-120' : '€30-100',
        high: currencySymbol === '£' ? '£100-250' : currencySymbol === '$' ? '$120-350' : '€100-300',
        premium: currencySymbol === '£' ? '£250+' : currencySymbol === '$' ? '$350+' : '€300+'
      };
      const budgetText = budgetRanges[budget] || 'any budget';
      const occasionText = occasions.find(o => o.id === occasion)?.name || 'any occasion';
      const genderText = partnerGender === 'female' ? 'a woman/girlfriend/wife' : 
                         partnerGender === 'male' ? 'a man/boyfriend/husband' : 
                         'a person (gender-neutral)';
      
      // Improved prompt focused on REAL PURCHASABLE PRODUCTS with gender context
      const prompt = `You are a gift recommendation expert. Suggest 6 SPECIFIC, REAL products that can be purchased ONLINE.

RECIPIENT: ${genderText} who likes: "${partnerInterests}"
Occasion: ${occasionText}
Budget: ${budgetText}

IMPORTANT RULES:
1. Suggest REAL products that actually exist and can be bought online
2. Be SPECIFIC - include brand names, model names, or specific product types
3. Match the interests EXACTLY - if they like music, suggest music-related gifts
4. TAILOR gifts to the recipient's gender where appropriate (e.g., jewelry styles, clothing, grooming products)
5. Include a mix of: physical products, experiences, subscriptions, personalized items
6. Prices should be realistic and within the budget range

Return ONLY a JSON array with this EXACT format:
[
{"name":"Specific Product Name","description":"Brief description of why this is perfect for them","price":"${currencySymbol}XX","category":"Category","searchTerm":"exact search term for finding this online"}
]

Example for "music lover" (woman):
[
{"name":"Rose Gold Wireless Headphones","description":"Stylish Bluetooth headphones with premium sound quality","price":"£89","category":"Electronics","searchTerm":"rose gold wireless headphones women"},
{"name":"Spotify Premium 12-Month Subscription","description":"Ad-free music streaming with offline downloads","price":"£120","category":"Subscription","searchTerm":"spotify premium gift card 12 months"}
]

Now generate 6 gift ideas for ${genderText} who likes: "${partnerInterests}"`;

      // Call the AI API
      const response = await base44.integrations.Core.InvokeLLM({ 
        prompt,
        conversationHistory: [],
        systemPrompt: "You are a gift recommendation expert. Return ONLY a valid JSON array with real, purchasable products. No markdown, no explanations. Be specific with product names and include realistic prices."
      });

      console.log('🎁 AI Raw Response:', response);

      // Parse the response
      let aiSuggestions = [];
      
      try {
        let cleanedResponse = String(response).trim();
        
        // Remove markdown
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Extract JSON array
        const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          cleanedResponse = arrayMatch[0];
        }
        
        // Fix common issues
        cleanedResponse = cleanedResponse.replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ');
        cleanedResponse = cleanedResponse.replace(/[""]/g, '"').replace(/['']/g, "'");
        cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1');
        cleanedResponse = cleanedResponse.replace(/\s+/g, ' ');
        
        // Parse
        aiSuggestions = JSON.parse(cleanedResponse);
        
        if (!Array.isArray(aiSuggestions) || aiSuggestions.length === 0) {
          throw new Error('No valid suggestions found');
        }
        
        console.log('✅ Parsed', aiSuggestions.length, 'suggestions');
        
      } catch (parseError) {
        console.error('❌ Parsing failed:', parseError.message);
        aiSuggestions = generateSmartFallback(partnerInterests, occasion, budget);
      }

      // Add IDs and multiple shopping links
      const startId = isLoadMore ? suggestions.length + 1 : 1;
      const suggestionsWithIds = aiSuggestions.slice(0, 6).map((suggestion, index) => {
        const searchTerm = suggestion.searchTerm || suggestion.name || partnerInterests;
        const encodedSearch = encodeURIComponent(searchTerm);
        
        return {
          id: startId + index,
          name: suggestion.name || 'Gift Idea',
          description: suggestion.description || 'Perfect gift for your loved one',
          price: suggestion.price || `${currencySymbol}50-100`,
          category: suggestion.category || 'General',
          rating: String(suggestion.rating || (4.0 + Math.random()).toFixed(1)),
          // Multiple shopping options
          shoppingLinks: {
            amazon: `https://www.amazon.co.uk/s?k=${encodedSearch}`,
            etsy: `https://www.etsy.com/search?q=${encodedSearch}`,
            ebay: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodedSearch}`,
            google: `https://www.google.com/search?tbm=shop&q=${encodedSearch}`
          }
        };
      });

      console.log('🎁 Final suggestions:', suggestionsWithIds);
      
      if (isLoadMore) {
        setSuggestions(prev => [...prev, ...suggestionsWithIds]);
      } else {
        setSuggestions(suggestionsWithIds);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      const fallback = generateSmartFallback(partnerInterests, occasion, budget);
      if (isLoadMore) {
        setSuggestions(prev => [...prev, ...fallback]);
      } else {
        setSuggestions(fallback);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMoreGifts = () => {
    generateGiftSuggestions(true);
  };

  // Smart fallback that actually matches the interests
  const generateSmartFallback = (interests, occasion, budget) => {
    const interestLower = interests.toLowerCase();
    const gender = partnerGender; // Use the selected gender
    const genderSuffix = gender === 'female' ? ' for women' : gender === 'male' ? ' for men' : '';
    
    // Category-specific suggestions based on keywords AND gender
    let suggestions = [];
    
    if (interestLower.includes('music') || interestLower.includes('guitar') || interestLower.includes('piano')) {
      if (gender === 'female') {
        suggestions = [
          { name: 'Rose Gold Wireless Headphones', description: 'Stylish headphones with premium sound quality', price: `${currencySymbol}79`, category: 'Electronics', searchTerm: 'rose gold wireless headphones women' },
          { name: 'Vinyl Record Subscription Box', description: 'Monthly delivery of curated vinyl records', price: `${currencySymbol}25/month`, category: 'Subscription', searchTerm: 'vinyl record subscription' },
          { name: 'Concert Tickets Gift Card', description: 'Let her choose her own live music experience', price: `${currencySymbol}100`, category: 'Experience', searchTerm: 'concert tickets gift card' },
          { name: 'Music Note Jewelry Set', description: 'Elegant necklace and earrings with music notes', price: `${currencySymbol}45`, category: 'Jewelry', searchTerm: 'music note jewelry set women' },
          { name: 'Portable Bluetooth Speaker (Pink)', description: 'Take the music anywhere with style', price: `${currencySymbol}89`, category: 'Electronics', searchTerm: 'portable bluetooth speaker pink' },
          { name: 'Personalized Song Print', description: 'Custom artwork of your special song', price: `${currencySymbol}45`, category: 'Personalized', searchTerm: 'personalized song print' }
        ];
      } else if (gender === 'male') {
        suggestions = [
          { name: 'Premium Over-Ear Headphones', description: 'Studio-quality sound for serious music lovers', price: `${currencySymbol}129`, category: 'Electronics', searchTerm: 'premium over ear headphones men' },
          { name: 'Vinyl Record Subscription Box', description: 'Monthly delivery of curated vinyl records', price: `${currencySymbol}25/month`, category: 'Subscription', searchTerm: 'vinyl record subscription' },
          { name: 'Concert Tickets Gift Card', description: 'Let him choose his own live music experience', price: `${currencySymbol}100`, category: 'Experience', searchTerm: 'concert tickets gift card' },
          { name: 'Guitar Accessories Kit', description: 'Picks, capo, tuner and more for guitarists', price: `${currencySymbol}35`, category: 'Music', searchTerm: 'guitar accessories kit' },
          { name: 'JBL Portable Bluetooth Speaker', description: 'Powerful sound in a rugged design', price: `${currencySymbol}89`, category: 'Electronics', searchTerm: 'JBL portable bluetooth speaker' },
          { name: 'Band T-Shirt Collection', description: 'Official merchandise from favorite bands', price: `${currencySymbol}30`, category: 'Clothing', searchTerm: 'band t-shirt men' }
        ];
      } else {
        suggestions = [
          { name: 'Wireless Bluetooth Headphones', description: 'Premium sound quality for music lovers', price: `${currencySymbol}79`, category: 'Electronics', searchTerm: 'wireless bluetooth headphones' },
          { name: 'Vinyl Record Subscription Box', description: 'Monthly delivery of curated vinyl records', price: `${currencySymbol}25/month`, category: 'Subscription', searchTerm: 'vinyl record subscription' },
          { name: 'Concert Tickets Gift Card', description: 'Let them choose their own live music experience', price: `${currencySymbol}100`, category: 'Experience', searchTerm: 'concert tickets gift card' },
          { name: 'Music Theory Book & Accessories', description: 'Learn music with this comprehensive guide', price: `${currencySymbol}35`, category: 'Books', searchTerm: 'music theory book' },
          { name: 'Portable Bluetooth Speaker', description: 'Take the music anywhere with premium sound', price: `${currencySymbol}89`, category: 'Electronics', searchTerm: 'portable bluetooth speaker JBL' },
          { name: 'Personalized Song Print', description: 'Custom artwork of their favorite song', price: `${currencySymbol}45`, category: 'Personalized', searchTerm: 'personalized song print' }
        ];
      }
    } else if (interestLower.includes('gaming') || interestLower.includes('video game') || interestLower.includes('playstation') || interestLower.includes('xbox')) {
      suggestions = [
        { name: 'Gaming Headset', description: 'Immersive audio for the ultimate gaming experience', price: `${currencySymbol}89`, category: 'Gaming', searchTerm: `gaming headset${genderSuffix}` },
        { name: 'PlayStation/Xbox Gift Card', description: 'Let them choose their next game', price: `${currencySymbol}50`, category: 'Gift Card', searchTerm: 'playstation gift card' },
        { name: 'RGB Gaming Mouse', description: 'Precision gaming mouse with customizable lighting', price: `${currencySymbol}59`, category: 'Gaming', searchTerm: 'rgb gaming mouse' },
        { name: 'Gaming Chair', description: 'Ergonomic comfort for long gaming sessions', price: `${currencySymbol}199`, category: 'Furniture', searchTerm: `gaming chair${genderSuffix}` },
        { name: 'Game Merchandise', description: 'Collectibles from their favorite games', price: `${currencySymbol}35`, category: 'Collectibles', searchTerm: 'gaming merchandise' },
        { name: 'Streaming Setup Kit', description: 'Everything needed to start streaming', price: `${currencySymbol}149`, category: 'Electronics', searchTerm: 'streaming starter kit' }
      ];
    } else if (interestLower.includes('book') || interestLower.includes('reading') || interestLower.includes('literature')) {
      suggestions = [
        { name: 'Kindle Paperwhite', description: 'Read anywhere with this waterproof e-reader', price: `${currencySymbol}129`, category: 'Electronics', searchTerm: 'kindle paperwhite' },
        { name: 'Book Subscription Box', description: 'Monthly curated book deliveries', price: `${currencySymbol}30/month`, category: 'Subscription', searchTerm: `book subscription box${genderSuffix}` },
        { name: 'Personalized Leather Bookmark', description: 'Handcrafted bookmark with their name', price: `${currencySymbol}25`, category: 'Personalized', searchTerm: 'personalized leather bookmark' },
        { name: 'Book Lover Gift Set', description: 'Candle, mug, and reading accessories', price: `${currencySymbol}45`, category: 'Gift Set', searchTerm: `book lover gift set${genderSuffix}` },
        { name: 'First Edition Book', description: 'Collectible first edition of a classic', price: `${currencySymbol}85`, category: 'Collectibles', searchTerm: 'first edition book' },
        { name: 'Audible Gift Membership', description: '3-month audiobook subscription', price: `${currencySymbol}30`, category: 'Subscription', searchTerm: 'audible gift membership' }
      ];
    } else {
      // Generic but gender-aware suggestions
      const forText = gender === 'female' ? 'for her' : gender === 'male' ? 'for him' : '';
      suggestions = [
        { name: `${interests} Gift Set`, description: `Curated collection for ${interests} enthusiasts`, price: `${currencySymbol}55`, category: 'Gift Set', searchTerm: `${interests} gift set ${forText}`.trim() },
        { name: `${interests} Experience`, description: `Memorable experience related to ${interests}`, price: `${currencySymbol}99`, category: 'Experience', searchTerm: `${interests} experience gift ${forText}`.trim() },
        { name: `${interests} Accessories`, description: `Premium accessories for ${interests} lovers`, price: `${currencySymbol}45`, category: 'Accessories', searchTerm: `${interests} accessories ${forText}`.trim() },
        { name: `Personalized ${interests} Gift`, description: `Custom-made gift celebrating their love of ${interests}`, price: `${currencySymbol}65`, category: 'Personalized', searchTerm: `personalized ${interests} gift ${forText}`.trim() },
        { name: `${interests} Subscription`, description: `Monthly subscription for ${interests} enthusiasts`, price: `${currencySymbol}25/month`, category: 'Subscription', searchTerm: `${interests} subscription box ${forText}`.trim() },
        { name: `${interests} Book/Guide`, description: `The ultimate guide to ${interests}`, price: `${currencySymbol}30`, category: 'Books', searchTerm: `${interests} book guide` }
      ];
    }
    
    return suggestions.map((s, i) => ({
      id: i + 1,
      ...s,
      rating: (4.0 + Math.random()).toFixed(1),
      shoppingLinks: {
        amazon: `https://www.amazon.co.uk/s?k=${encodeURIComponent(s.searchTerm)}`,
        etsy: `https://www.etsy.com/search?q=${encodeURIComponent(s.searchTerm)}`,
        ebay: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(s.searchTerm)}`,
        google: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(s.searchTerm)}`
      }
    }));
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


  return (
    <div className="px-4 pt-6 pb-32 bg-gradient-to-b from-slate-950 via-rose-950/10 to-slate-950">
      {/* Header - Fun & Playful */}
      <div className="mb-6 text-center relative">
        {/* Floating decorative elements */}
        <div className="absolute -top-2 left-6 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0s' }}>🎁</div>
        <div className="absolute top-4 right-4 text-2xl animate-bounce opacity-50" style={{ animationDelay: '0.3s' }}>✨</div>
        <div className="absolute top-16 left-4 text-xl animate-bounce opacity-40" style={{ animationDelay: '0.6s' }}>💝</div>
        <div className="absolute top-8 right-8 text-xl animate-pulse opacity-30">💫</div>
        
        <div className="inline-block mb-4">
          <div className="relative">
            {/* Glowing ring effect */}
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-500/50 transform hover:rotate-6 transition-transform">
              <span className="text-5xl">🎁</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-yellow-500/50">
              <span className="text-lg">💖</span>
            </div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-sm">✨</span>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-black mb-2">
          <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
            Find the Perfect
          </span>
          <br />
          <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Gift! 🎯
          </span>
        </h1>
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
          <span>Personalized suggestions</span>
          <span className="text-pink-400">•</span>
          <span>They'll love it!</span>
        </p>
      </div>

      {/* Shopping Mode Selector - Online vs Physical */}
      <div className="mb-6">
        <div className="flex gap-3 p-2 bg-slate-900/70 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <button
            onClick={() => setShoppingMode('online')}
            className={`flex-1 py-4 px-4 rounded-xl font-bold text-sm transition-all transform ${
              shoppingMode === 'online'
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/50 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-[1.01]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">🛒</span>
              <span>Online Stores</span>
              {shoppingMode === 'online' && <span className="animate-pulse">✨</span>}
            </span>
          </button>
          <button
            onClick={() => setShoppingMode('physical')}
            className={`flex-1 py-4 px-4 rounded-xl font-bold text-sm transition-all transform ${
              shoppingMode === 'physical'
                ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/50 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-[1.01]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">🏪</span>
              <span>Local Shops</span>
              {shoppingMode === 'physical' && <span className="animate-pulse">📍</span>}
            </span>
          </button>
        </div>
      </div>

      {/* Partner Interests Input - Fun Design */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-xl">💭</span>
          </div>
          <div>
            <label className="block text-sm font-bold text-white">
              {t('gifts.partnerInterests')}
            </label>
            <p className="text-xs text-slate-400">What do they love? 💕</p>
          </div>
        </div>
        <textarea
          value={partnerInterests}
          onChange={(e) => setPartnerInterests(e.target.value)}
          placeholder={t('gifts.partnerInterestsPlaceholder')}
          className="w-full p-4 bg-slate-800/80 border-2 border-pink-500/30 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 resize-none transition-all"
          rows={3}
          style={{ fontSize: '16px' }}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-slate-500">Quick ideas:</span>
          {['🎵 Music', '📚 Books', '🎮 Gaming', '✈️ Travel', '🍳 Cooking'].map((idea) => (
            <button
              key={idea}
              onClick={() => setPartnerInterests(prev => prev ? `${prev}, ${idea.split(' ')[1]}` : idea.split(' ')[1])}
              className="px-2 py-1 bg-slate-800/50 hover:bg-pink-500/20 border border-slate-700 hover:border-pink-500/50 rounded-lg text-xs text-slate-300 hover:text-pink-300 transition-all"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Selection - Big & Playful */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <label className="block text-sm font-bold text-white">
              {t('gifts.giftFor', 'Gift for')}
            </label>
            <p className="text-xs text-slate-400">Who's the lucky one? ✨</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {genderOptions.map((g) => (
            <button
              key={g.id}
              onClick={() => setPartnerGender(g.id)}
              className={`p-5 rounded-2xl text-center transition-all transform hover:scale-105 active:scale-95 ${
                partnerGender === g.id
                  ? `bg-gradient-to-br ${g.color} text-white shadow-xl shadow-pink-500/30 scale-105`
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border-2 border-slate-700/50 hover:border-pink-500/50'
              }`}
            >
              <div className="text-4xl mb-2">{g.emoji}</div>
              <div className="text-sm font-bold">{g.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Occasion Selection - Fun Cards */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-xl">🎉</span>
          </div>
          <div>
            <label className="block text-sm font-bold text-white">
              {t('gifts.specialOccasion')}
            </label>
            <p className="text-xs text-slate-400">What's the celebration? 🥳</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {occasions.map((occ) => (
            <button
              key={occ.id}
              onClick={() => setOccasion(occ.id)}
              className={`p-4 rounded-2xl text-center transition-all transform hover:scale-105 active:scale-95 ${
                occasion === occ.id
                  ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl shadow-pink-500/30 scale-105'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700/50 hover:border-pink-500/50'
              }`}
            >
              <div className="text-3xl mb-1">{occ.icon}</div>
              <div className="text-xs font-bold">{occ.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Selection - Colorful Chips */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <span className="text-xl">💰</span>
          </div>
          <div>
            <label className="block text-sm font-bold text-white">
              {t('gifts.budget')}
            </label>
            <p className="text-xs text-slate-400">How much do you want to spend? 💸</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {budgets.map((bud, index) => {
            const colors = [
              'from-green-500 to-emerald-500',
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-pink-500',
              'from-amber-500 to-orange-500'
            ];
            return (
              <button
                key={bud.id}
                onClick={() => setBudget(bud.value)}
                className={`p-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 active:scale-95 ${
                  budget === bud.value
                    ? `bg-gradient-to-r ${colors[index]} text-white shadow-lg shadow-purple-500/30 scale-105`
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700/50'
                }`}
              >
                {bud.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Country Display */}
      <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-white text-sm font-bold block">
              {t('gifts.location')}: {currentCountry?.flag} {localizedCountryName}
            </span>
            <span className="text-cyan-300 text-xs">Prices shown in {currencySymbol}</span>
          </div>
          <a href="#/profile" className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-xs text-cyan-300 font-medium transition-all">
            {t('gifts.change')}
          </a>
        </div>
      </div>

      {/* City Selection for Physical Mode */}
      {shoppingMode === 'physical' && (
        <div className="mb-6">
          <div className="p-4 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-bold">{t('gifts.selectCity', 'Select your city')}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">We'll find gift shops near you! 📍</p>
            <div className="flex flex-wrap gap-2">
              {localizedCities.map((city) => (
                <button
                  key={city.nameEn}
                  onClick={() => setSelectedCity(selectedCity === city.displayName ? '' : city.displayName)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                    selectedCity === city.displayName
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                  }`}
                >
                  {city.displayName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button - Big & Fun */}
      <div className="mb-6">
        <Button
          onClick={() => {
            generateGiftSuggestions();
            if (shoppingMode === 'physical' && selectedCity) {
              searchLocalShops();
            }
          }}
          disabled={isLoading || !partnerInterests.trim() || (shoppingMode === 'physical' && !selectedCity)}
          className={`w-full py-5 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:transform-none ${
            shoppingMode === 'online' 
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 shadow-xl shadow-pink-500/30'
              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 shadow-xl shadow-cyan-500/30'
          } text-white`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('gifts.generating')}</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {shoppingMode === 'online' ? (
                <>
                  <span className="text-xl">🛒</span>
                  <span>Find Online Gifts</span>
                  <span className="text-xl">✨</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🏪</span>
                  <span>Find Local Shops</span>
                  <span className="text-xl">📍</span>
                </>
              )}
            </span>
          )}
        </Button>
        {shoppingMode === 'physical' && !selectedCity && (
          <p className="text-center text-amber-400 text-sm mt-2 animate-pulse">
            👆 Select your city above first
          </p>
        )}
      </div>

      {/* Loading Local Shops */}
      {isLoadingShops && selectedCity && shoppingMode === 'physical' && (
        <div className="text-center py-8 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white font-bold">{t('gifts.searchingLocalShops', { city: selectedCity })}</p>
          <p className="text-slate-400 text-sm mt-1">Finding the best gift shops near you... 🔍</p>
        </div>
      )}

      {/* Local Shops Section - SHOWN FOR PHYSICAL MODE */}
      {shoppingMode === 'physical' && selectedCity && localShops.length > 0 && (
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

      {/* Online Gift Suggestions - SHOWN FOR ONLINE MODE */}
      {shoppingMode === 'online' && !isLoading && suggestions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-400" />
              {t('gifts.giftIdeasOnline', 'Online Gift Ideas')}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
          </div>

          <div className="space-y-4">
            {suggestions.map((gift) => (
              <Card
                key={gift.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-pink-500/30 backdrop-blur-sm hover:scale-[1.01] transition-all"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0 shadow-lg">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-base font-bold text-white">{gift.name}</h3>
                        {gift.price && (
                          <span className="text-sm font-bold text-pink-400 shrink-0 ml-2">
                            {gift.price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {gift.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-slate-400">{gift.rating}</span>
                          </div>
                        )}
                        {gift.category && (
                          <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded text-xs">
                            {gift.category}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{gift.description}</p>
                      
                      {/* Multiple Shopping Links */}
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-medium">{t('gifts.shopOn', 'Shop on')}:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {gift.shoppingLinks?.amazon && (
                            <a
                              href={gift.shoppingLinks.amazon}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg text-xs font-semibold text-orange-300 transition-all"
                            >
                              🛒 Amazon
                            </a>
                          )}
                          {gift.shoppingLinks?.etsy && (
                            <a
                              href={gift.shoppingLinks.etsy}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/50 rounded-lg text-xs font-semibold text-orange-200 transition-all"
                            >
                              🎨 Etsy
                            </a>
                          )}
                          {gift.shoppingLinks?.ebay && (
                            <a
                              href={gift.shoppingLinks.ebay}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-xs font-semibold text-blue-300 transition-all"
                            >
                              🏷️ eBay
                            </a>
                          )}
                          {gift.shoppingLinks?.google && (
                            <a
                              href={gift.shoppingLinks.google}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-xs font-semibold text-green-300 transition-all"
                            >
                              🔍 Google
                            </a>
                          )}
                        </div>
                        <SaveButton 
                          item={gift} 
                          type="gift"
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Gifts Button */}
          <div className="mt-4">
            <Button
              onClick={handleLoadMoreGifts}
              disabled={isLoadingMore}
              className="w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('gifts.loadingMore', 'Loading More...')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span>{t('gifts.loadMoreGifts', 'Load More Gift Ideas')} 🎁</span>
                </div>
              )}
            </Button>
            <p className="text-center text-slate-500 text-xs mt-2">
              {suggestions.length} {t('gifts.ideasSoFar', 'gift ideas loaded')}
            </p>
          </div>
        </div>
      )}

      {/* Empty State - Fun & Encouraging */}
      {!isLoading && !isLoadingShops && suggestions.length === 0 && localShops.length === 0 && (
        <Card className="bg-gradient-to-br from-pink-900/20 via-purple-900/20 to-indigo-900/20 border border-purple-500/20">
          <div className="text-center py-12 px-6">
            <div className="relative inline-block mb-4">
              <span className="text-7xl">🎁</span>
              <span className="absolute -top-2 -right-2 text-2xl animate-ping">✨</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Let's find something special!</h3>
            <p className="text-slate-300 mb-4">{t('gifts.emptyState')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1.5 bg-pink-500/20 rounded-full text-sm text-pink-300 animate-pulse">💝 Thoughtful gifts</span>
              <span className="px-3 py-1.5 bg-purple-500/20 rounded-full text-sm text-purple-300 animate-pulse" style={{ animationDelay: '0.2s' }}>🎯 Personalized ideas</span>
              <span className="px-3 py-1.5 bg-rose-500/20 rounded-full text-sm text-rose-300 animate-pulse" style={{ animationDelay: '0.4s' }}>💖 Made with love</span>
            </div>
          </div>
        </Card>
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal 
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Gift Suggestions"
        />
      )}
    </div>
  );
}

