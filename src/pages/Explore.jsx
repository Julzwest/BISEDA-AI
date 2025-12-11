import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Coffee, UtensilsCrossed, Film, Music, Dumbbell, Palette, TreePine, Sparkles, Heart, Star, Crown, TrendingUp, Globe, X, Search, Plus, ChevronRight, PartyPopper } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/SaveButton';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { base44 } from '@/api/base44Client';
import { countries, getLocalizedCitiesForCountry, getCountryByCode, getCityNameEn, getLocalizedCountryName } from '@/config/countries';

const backendUrl = getBackendUrl();

export default function Explore() {
  const { t, i18n } = useTranslation();
  
  // TAB STATE - 'venues' or 'events'
  const [activeTab, setActiveTab] = useState('venues');
  
  // Shared: City selection
  const [selectedCity, setSelectedCity] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [showMoreCities, setShowMoreCities] = useState(false);
  
  // Venues tab state (from FirstDates)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Events tab state (from Events)
  const [localEvents, setLocalEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [showAllFestive, setShowAllFestive] = useState(false);
  
  // Get user's country from localStorage
  const userCountry = localStorage.getItem('userCountry') || 'AL';
  const currentCountry = getCountryByCode(userCountry);
  
  // Get localized cities - depends on i18n.language for reactivity
  const localizedCities = React.useMemo(() => {
    return getLocalizedCitiesForCountry(userCountry);
  }, [userCountry, i18n.language]);
  
  // Get localized country name - depends on i18n.language for reactivity
  const localizedCountryName = React.useMemo(() => {
    return getLocalizedCountryName(userCountry);
  }, [userCountry, i18n.language]);
  
  const cities = localizedCities.map(c => c.displayName);

  const timeOfDayOptions = [
    { id: 'morning', label: 'Morning', emoji: '🌅', color: 'from-yellow-400 to-orange-400' },
    { id: 'afternoon', label: 'Afternoon', emoji: '☀️', color: 'from-orange-400 to-amber-500' },
    { id: 'evening', label: 'Evening', emoji: '🌆', color: 'from-purple-500 to-pink-500' },
    { id: 'night', label: 'Night', emoji: '🌙', color: 'from-indigo-600 to-purple-600' },
    { id: 'anytime', label: 'Any Time', emoji: '⏰', color: 'from-slate-600 to-slate-700' }
  ];

  const categories = [
    {
      id: 'restaurants',
      name: t('dates.restaurants'),
      icon: UtensilsCrossed,
      color: 'from-red-500 to-orange-500',
      description: t('dates.restaurantsDesc')
    },
    {
      id: 'cafes',
      name: t('dates.cafes'),
      icon: Coffee,
      color: 'from-amber-500 to-yellow-500',
      description: t('dates.cafesDesc')
    },
    {
      id: 'bars',
      name: t('dates.bars'),
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      description: t('dates.barsDesc')
    },
    {
      id: 'cinema',
      name: t('dates.cinema'),
      icon: Film,
      color: 'from-blue-500 to-indigo-500',
      description: t('dates.cinemaDesc')
    },
    {
      id: 'music',
      name: t('dates.music'),
      icon: Music,
      color: 'from-pink-500 to-rose-500',
      description: t('dates.musicDesc')
    },
    {
      id: 'activities',
      name: t('dates.activities'),
      icon: Dumbbell,
      color: 'from-green-500 to-emerald-500',
      description: t('dates.activitiesDesc')
    },
    {
      id: 'culture',
      name: t('dates.culture'),
      icon: Palette,
      color: 'from-violet-500 to-purple-500',
      description: t('dates.cultureDesc')
    },
    {
      id: 'nature',
      name: t('dates.nature'),
      icon: TreePine,
      color: 'from-green-600 to-teal-500',
      description: t('dates.natureDesc')
    }
  ];

  const businessSuggestions = {
    tiranë: {
      restaurants: [
        { name: 'Mulliri i Vjetër', description: 'Restorant tradicionale me atmosferë shqiptare', rating: '4.5', price: '$$', featured: true, sponsored: true },
        { name: 'Oda', description: 'Restorant modern me kuzhinë mediterane', rating: '4.7', price: '$$$', featured: true },
        { name: 'Padam Boutique Hotel Restaurant', description: 'Restorant elegant me pamje të bukur', rating: '4.6', price: '$$$', featured: true, sponsored: true },
        { name: 'Artigiano', description: 'Pizzeria italiane autentike', rating: '4.4', price: '$$' },
        { name: 'Salt', description: 'Restorant me kuzhinë fusion', rating: '4.5', price: '$$' }
      ],
      cafes: [
        { name: 'Komiteti Kafe-Muzeum', description: 'Kafene unike me atmosferë vintage', rating: '4.6', price: '$', featured: true, sponsored: true },
        { name: 'Mulliri i Vjetër', description: 'Kafene e madhe me ambiente të ndryshme', rating: '4.5', price: '$', featured: true },
        { name: 'Sofra e Ariut', description: 'Kafene me design modern dhe kafe të shkëlqyer', rating: '4.4', price: '$$' },
        { name: 'Bunker 1944', description: 'Kafene tematike me historikë unike', rating: '4.3', price: '$' },
        { name: 'Colonial Café', description: 'Kafene elegante në qendër', rating: '4.5', price: '$$', featured: true }
      ],
      bars: [
        { name: 'Radio Bar', description: 'Rooftop bar me pamje të qytetit', rating: '4.6', price: '$$', featured: true, sponsored: true },
        { name: 'Nouvelle Vague', description: 'Bar me cocktail kreative', rating: '4.5', price: '$$', featured: true },
        { name: 'Colonial Café Rooftop', description: 'Rooftop me atmosferë romantike', rating: '4.7', price: '$$', featured: true },
        { name: 'Bunker Bar', description: 'Bar tematike në bunker', rating: '4.4', price: '$$' },
        { name: 'Sky Club', description: 'Rooftop bar me muzikë live', rating: '4.5', price: '$$$', featured: true }
      ],
      cinema: [
        { name: 'Cineplexx', description: 'Kinema moderne me shumë salla', rating: '4.5', price: '$$' },
        { name: 'Kinema Millennium', description: 'Kinema në qendër të qytetit', rating: '4.3', price: '$$' }
      ],
      music: [
        { name: 'Tirana Jazz Club', description: 'Jazz live dhe atmosferë intime', rating: '4.6', price: '$$' },
        { name: 'Folie Terrace', description: 'Live music dhe dj sets', rating: '4.4', price: '$$' }
      ],
      activities: [
        { name: 'Escape Room Albania', description: 'Escape rooms me tema të ndryshme', rating: '4.7', price: '$$' },
        { name: 'Bowling Center', description: 'Bowling dhe lojëra të tjera', rating: '4.3', price: '$$' },
        { name: 'Paint & Sip Studio', description: 'Pikturë dhe verë për çiftet', rating: '4.5', price: '$$' }
      ],
      culture: [
        { name: 'Muzeu Historik Kombëtar', description: 'Muzeu më i madh në Shqipëri', rating: '4.6', price: '$' },
        { name: 'Bunk\'Art', description: 'Muzeu në bunker me art bashkëkohor', rating: '4.7', price: '$' },
        { name: 'Galeria Kombëtare e Arteve', description: 'Ekspozita arti bashkëkohor', rating: '4.5', price: '$' }
      ],
      nature: [
        { name: 'Parku i Madh', description: 'Shëtitje dhe piknik në natyrë', rating: '4.4', price: 'Gratis' },
        { name: 'Dajti', description: 'Teleferik dhe pamje panoramike', rating: '4.6', price: '$$' },
        { name: 'Lacit', description: 'Liqen artificial për shëtitje', rating: '4.3', price: 'Gratis' }
      ]
    },
    durrës: {
      restaurants: [
        { name: 'Restorant Rozafa', description: 'Restorant me det dhe kuzhinë deti', rating: '4.5', price: '$$' },
        { name: 'Restorant Taverna', description: 'Kuzhinë tradicionale shqiptare', rating: '4.4', price: '$$' }
      ],
      cafes: [
        { name: 'Café de Paris', description: 'Kafene me pamje deti', rating: '4.5', price: '$$' }
      ],
      bars: [
        { name: 'Beach Bar', description: 'Bar në plazh me atmosferë relaksuese', rating: '4.4', price: '$$' }
      ],
      nature: [
        { name: 'Plazhi i Durrësit', description: 'Shëtitje në plazh dhe promenadë', rating: '4.5', price: 'Gratis' }
      ]
    },
    vlorë: {
      restaurants: [
        { name: 'Restorant Tradita', description: 'Kuzhinë tradicionale me det', rating: '4.6', price: '$$' }
      ],
      nature: [
        { name: 'Plazhi i Vlorës', description: 'Plazh i bukur për shëtitje', rating: '4.5', price: 'Gratis' },
        { name: 'Llogara Pass', description: 'Shëtitje në mal me pamje të bukura', rating: '4.7', price: 'Gratis' }
      ]
    }
  };

  const getSuggestions = (city, category) => {
    const cityData = businessSuggestions[city.toLowerCase()];
    if (!cityData || !cityData[category]) {
      return getGenericSuggestions(category);
    }
    const suggestions = cityData[category];
    
    // Sort: Featured/Sponsored first, then by rating
    return suggestions.sort((a, b) => {
      // Sponsored businesses first
      if (a.sponsored && !b.sponsored) return -1;
      if (!a.sponsored && b.sponsored) return 1;
      // Featured businesses next
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Then by rating
      return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
    });
  };

  const getGenericSuggestions = (category) => {
    const generic = {
      restaurants: [
        { name: 'Restorant Tradicional', description: 'Shkoni në një restorant me kuzhinë tradicionale shqiptare', rating: '4.5', price: '$$' },
        { name: 'Restorant Italian', description: 'Pizzeria ose restorant italian për një darkë romantike', rating: '4.4', price: '$$' },
        { name: 'Restorant Me Pamje', description: 'Restorant me pamje të bukur për atmosferë romantike', rating: '4.6', price: '$$$' }
      ],
      cafes: [
        { name: 'Kafene Tradicionale', description: 'Kafene me atmosferë shqiptare për biseda', rating: '4.4', price: '$' },
        { name: 'Kafene Moderne', description: 'Kafene me design modern dhe kafe të shkëlqyer', rating: '4.5', price: '$$' }
      ],
      bars: [
        { name: 'Rooftop Bar', description: 'Rooftop bar me pamje për një mbrëmje romantike', rating: '4.6', price: '$$' },
        { name: 'Cocktail Bar', description: 'Bar me cocktail kreative dhe atmosferë intime', rating: '4.5', price: '$$' }
      ],
      cinema: [
        { name: 'Kinema Lokale', description: 'Shkoni në kinema për një film bashkë', rating: '4.3', price: '$$' }
      ],
      music: [
        { name: 'Live Music Venue', description: 'Vend me muzikë live për një mbrëmje muzikore', rating: '4.5', price: '$$' }
      ],
      activities: [
        { name: 'Escape Room', description: 'Escape room për një sfidë bashkë', rating: '4.7', price: '$$' },
        { name: 'Bowling', description: 'Bowling për lojë dhe argëtim', rating: '4.3', price: '$$' }
      ],
      culture: [
        { name: 'Muzeu Lokal', description: 'Shkoni në muzeu për të mësuar dhe diskutuar', rating: '4.5', price: '$' },
        { name: 'Galeri Arti', description: 'Galeri arti për ekspozita interesante', rating: '4.4', price: '$' }
      ],
      nature: [
        { name: 'Parku Lokal', description: 'Shëtitje në park për biseda dhe relaksim', rating: '4.4', price: 'Gratis' },
        { name: 'Shëtitje në Natyrë', description: 'Shëtitje në natyrë për një takim aktiv', rating: '4.6', price: 'Gratis' }
      ]
    };
    return generic[category] || [];
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  const handleSearch = async () => {
    if (!selectedCity || !selectedCategory) {
      alert(t('dates.selectCityAndCategory'));
      return;
    }
    await generateAISuggestions(selectedCity, selectedCategory, false);
  };

  const handleLoadMore = async () => {
    if (!selectedCity || !selectedCategory) return;
    await generateAISuggestions(selectedCity, selectedCategory, true);
  };

  const generateAISuggestions = async (city, category, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setSuggestions([]);
    }

    try {
      // Step 1: Try Google Places API first for REAL-TIME data
      console.log(`🔍 Searching Google Places for ${category.name} in ${city}...`);
      
      const categoryNames = {
        restaurants: 'restorante romantike',
        cafes: 'kafene të bukura',
        bars: 'bare dhe rooftop bar',
        cinema: 'kinema dhe aktivitete kinematografike',
        music: 'vende me muzikë live',
        activities: 'aktivitete si bowling, escape room',
        culture: 'muzee, galeri arti',
        nature: 'parqe dhe vende në natyrë'
      };
      
      let googlePlaces = [];
      let useGooglePlaces = true;
      
      try {
        // Get English names for Google Places API
        const cityNameEn = getCityNameEn(userCountry, city) || city;
        const countryNameEn = currentCountry?.nameEn || 'Albania';
        const locationQuery = `${cityNameEn}, ${countryNameEn}`;
        
        console.log(`🔍 Searching in: ${locationQuery}`);
      
        const placesResponse = await fetch(`${backendUrl}/api/places/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `${categoryNames[category.id] || category.name} in ${cityNameEn}`,
            location: locationQuery,
            category: category.id,
            strictLocation: true,
            cityName: cityNameEn,
            countryName: countryNameEn
          })
        });
        
        if (placesResponse.ok) {
          const data = await placesResponse.json();
          
          if (data.source === 'google-places' && data.places && data.places.length > 0) {
            console.log(`✅ Got ${data.places.length} results from Google Places`);
            
            // Filter results to only include venues that contain the city name in their address
            const filteredPlaces = data.places.filter(place => {
              const address = (place.location || '').toLowerCase();
              const cityLower = cityNameEn.toLowerCase();
              const selectedCityLower = city.toLowerCase();
              
              // Check if the address contains the city name
              return address.includes(cityLower) || 
                     address.includes(selectedCityLower) ||
                     // Also check for common Albanian city name variations
                     address.includes(cityLower.replace('ë', 'e')) ||
                     address.includes(selectedCityLower.replace('ë', 'e'));
            });
            
            // Use filtered results if available, otherwise use all results
            googlePlaces = filteredPlaces.length > 0 ? filteredPlaces : data.places;
            
            // Filter out already shown businesses if loading more
            if (isLoadMore) {
              const existingNames = suggestions.map(s => s.name.toLowerCase());
              googlePlaces = googlePlaces.filter(p => 
                !existingNames.includes(p.name.toLowerCase())
              );
            }
            
          } else {
            console.log('⚠️ Google Places not available, falling back to AI');
            useGooglePlaces = false;
          }
        } else {
          console.log('⚠️ Google Places API error, falling back to AI');
          useGooglePlaces = false;
        }
      } catch (googleError) {
        console.error('❌ Google Places fetch error:', googleError);
        useGooglePlaces = false;
      }
      
      // If we got Google Places results, use them
      if (useGooglePlaces && googlePlaces.length > 0) {
        const formattedSuggestions = googlePlaces.map((place, index) => ({
          name: place.name,
          description: place.description,
          location: place.location,
          rating: place.rating,
          price: place.price,
          googleMapsLink: place.googleMapsLink,
          isOpen: place.isOpen,
          featured: index === 0 && !isLoadMore,
          sponsored: false,
          source: 'google'
        }));
        
        if (isLoadMore) {
          setSuggestions(prev => [...prev, ...formattedSuggestions]);
        } else {
          setSuggestions(formattedSuggestions);
        }
        
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      
      // Step 2: Fallback to AI if Google Places is not available
      console.log('📝 Using AI fallback...');
      
      // Build list of already shown businesses to avoid duplicates
      const alreadyShown = isLoadMore ? suggestions.map(s => s.name).join(', ') : '';
      const excludeText = alreadyShown ? `\n\nMOS përfshi këto biznese që u treguan më parë: ${alreadyShown}\n\nGjej biznese të REJA dhe të ndryshme!` : '';
      
      const prompt = `Biznese REALE në ${cityNameEn}, ${countryNameEn} për takime të para: ${categoryNames[category.id] || category.name}${excludeText}

Listoni 5-7 vende që ekzistojnë realisht. Ktheni VETËM JSON array:
[{"name":"Emri","description":"Përshkrim","location":"Adresa","rating":"4.5","price":"$$"}]

Mos shtoni tekst tjetër, VETËM JSON.`;

      // Call the AI API
      const systemPromptExtra = isLoadMore ? ' Generate DIFFERENT businesses than before. Do NOT repeat any business names that were already mentioned.' : '';
      const response = await base44.integrations.Core.InvokeLLM({ 
        prompt,
        conversationHistory: [],
        systemPrompt: `Ti njeh ${cityNameEn}, ${countryNameEn} shumë mirë. Return ONLY a JSON array of REAL businesses that exist in ${cityNameEn}. No explanations, no markdown, just the JSON array.${systemPromptExtra}`
      });

      // Parse the response
      let aiSuggestions = [];
      try {
        // Try to find JSON in the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiSuggestions = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, try parsing the whole response
          aiSuggestions = JSON.parse(response);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON, using fallback:', parseError);
        // Fallback to hardcoded suggestions if parsing fails
        const fallback = getSuggestions(city, category.id);
        setSuggestions(fallback);
        setLoading(false);
        return;
      }

      // Format the suggestions
      const formattedSuggestions = aiSuggestions.map((suggestion, index) => ({
        name: suggestion.name || 'Biznes Lokal',
        description: suggestion.description || 'Vend i mirë për takim të parë',
        location: suggestion.location || city,
        rating: suggestion.rating || '4.5',
        price: suggestion.price || '$$',
        googleMapsLink: `https://maps.google.com/?q=${encodeURIComponent(suggestion.name || 'Biznes')},${encodeURIComponent(cityNameEn)},${encodeURIComponent(countryNameEn)}`,
        featured: index === 0 && !isLoadMore, // Mark first as featured only on initial load
        sponsored: false,
        source: 'ai'
      }));

      // Append or replace suggestions based on isLoadMore
      if (isLoadMore) {
        setSuggestions(prev => [...prev, ...formattedSuggestions]);
      } else {
        setSuggestions(formattedSuggestions);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Fallback to hardcoded suggestions on error
      const fallbackSuggestions = getSuggestions(city, category.id);
      if (isLoadMore) {
        setSuggestions(prev => [...prev, ...fallbackSuggestions]);
      } else {
        setSuggestions(fallbackSuggestions);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-32 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block mb-3">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/50 animate-pulse">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-slate-900" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
          Explore Dates & Events
        </h1>
        <p className="text-slate-400 text-sm">Find perfect venues and discover local events</p>
      </div>
      
      {/* TAB NAVIGATION */}
      <div className="mb-6 flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-700/50">
        <button
          onClick={() => setActiveTab('venues')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'venues'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Coffee className="w-4 h-4" />
            Date Venues
          </span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'events'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <PartyPopper className="w-4 h-4" />
            Events
          </span>
        </button>
      </div>
      {/* SHARED: City Selection - Modern Design */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">{t('dates.selectCity')}</h2>
          <span className="text-xs text-slate-500 ml-auto">{currentCountry?.flag} {localizedCountryName}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Show first 12 cities, or all if showMoreCities */}
          {cities.slice(0, showMoreCities ? cities.length : 12).map((city) => (
            <button
              key={city}
              onClick={() => handleCitySelect(city)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                selectedCity === city
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-700/50 hover:border-purple-500/50'
              }`}
            >
              {city}
            </button>
          ))}
          
          {/* Show More Cities button */}
          {cities.length > 12 && !showMoreCities && (
            <button
              onClick={() => setShowMoreCities(true)}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50 flex items-center gap-1.5"
            >
              <ChevronRight className="w-4 h-4" />
              <span>+{cities.length - 12} {t('dates.more')}</span>
            </button>
          )}
          
          {/* Open city modal button */}
          <button
            onClick={() => setShowCityModal(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('dates.otherCity')}</span>
          </button>
        </div>
        
        {/* Selected custom city indicator */}
        {selectedCity && !cities.includes(selectedCity) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-slate-400">{t('dates.selectedCity')}:</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
              {selectedCity}
            </span>
            <button
              onClick={() => setSelectedCity('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* VENUES TAB CONTENT */}
      {activeTab === 'venues' && (
        <>
          {/* Time of Day Filter */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3">⏰ Time of Day</h2>
        <div className="flex flex-wrap gap-2">
          {timeOfDayOptions.map((time) => (
            <button
              key={time.id}
              onClick={() => setSelectedTimeOfDay(time.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                selectedTimeOfDay === time.id
                  ? `bg-gradient-to-r ${time.color} text-white shadow-lg`
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-700/50 hover:border-purple-500/50'
              }`}
            >
              <span className="mr-1.5">{time.emoji}</span>
              {time.label}
            </button>
          ))}
        </div>
      </div>

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  {t('dates.selectCity')}
                </h3>
                <button
                  onClick={() => setShowCityModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search Input */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  placeholder={t('dates.searchCity')}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
              </div>
            </div>
            
            {/* City List */}
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {/* If user typed something, show it as an option to select */}
              {customCityInput.trim() && !cities.some(c => c.toLowerCase() === customCityInput.toLowerCase()) && (
                <button
                  onClick={() => {
                    handleCitySelect(customCityInput.trim());
                    setShowCityModal(false);
                    setCustomCityInput('');
                  }}
                  className="w-full p-3 mb-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-xl text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">"{customCityInput.trim()}"</p>
                      <p className="text-purple-300 text-sm">{t('dates.searchInCity')}</p>
                    </div>
                  </div>
                </button>
              )}
              
              {/* Filter cities based on input */}
              <div className="space-y-2">
                {cities
                  .filter(city => 
                    !customCityInput || 
                    city.toLowerCase().includes(customCityInput.toLowerCase())
                  )
                  .map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        handleCitySelect(city);
                        setShowCityModal(false);
                        setCustomCityInput('');
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedCity === city
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40'
                          : 'bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selectedCity === city
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-slate-700'
                        }`}>
                          <MapPin className={`w-5 h-5 ${selectedCity === city ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${selectedCity === city ? 'text-purple-300' : 'text-white'}`}>{city}</p>
                          <p className="text-slate-500 text-sm">{localizedCountryName}</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
              
              {/* No results message */}
              {customCityInput && !cities.some(c => c.toLowerCase().includes(customCityInput.toLowerCase())) && (
                <p className="text-center text-slate-400 text-sm mt-4">
                  {t('dates.cityNotInList', { city: customCityInput })}
                </p>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
              <Button
                onClick={() => {
                  if (customCityInput.trim()) {
                    handleCitySelect(customCityInput.trim());
                  }
                  setShowCityModal(false);
                  setCustomCityInput('');
                }}
                disabled={!customCityInput.trim() && !selectedCity}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
              >
                {customCityInput.trim() ? t('dates.searchInCityName', { city: customCityInput.trim() }) : t('dates.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {t('dates.selectCategory')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory?.id === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? `bg-gradient-to-br ${category.color} border-transparent shadow-lg scale-105`
                    : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-slate-700/50'}`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {category.name}
                    </h3>
                    <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {category.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Button */}
      <div className="mb-6">
        <Button
          onClick={handleSearch}
          disabled={!selectedCity || !selectedCategory || loading}
          className={`w-full py-6 rounded-2xl font-bold text-lg transition-all ${
            selectedCity && selectedCategory && !loading
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-2xl shadow-pink-500/50 hover:scale-[1.02] active:scale-95'
              : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{t('dates.generating')}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>{t('dates.generateSuggestions')}</span>
            </div>
          )}
        </Button>
        {!selectedCity && !selectedCategory && (
          <p className="text-center text-slate-400 text-sm mt-3">
            👆 {t('dates.selectCityAndCategoryAbove')}
          </p>
        )}
        {selectedCity && !selectedCategory && (
          <p className="text-center text-pink-400 text-sm mt-3 animate-pulse">
            ✨ {t('dates.nowSelectCategory')}
          </p>
        )}
        {!selectedCity && selectedCategory && (
          <p className="text-center text-pink-400 text-sm mt-3 animate-pulse">
            📍 {t('dates.nowSelectCity')}
          </p>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent">
                {t('dates.suggestions')}
              </span>
              <span className="text-2xl">✨</span>
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
          </div>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const isFeatured = suggestion.featured;
              const isSponsored = suggestion.sponsored;
              
              return (
                <Card
                  key={index}
                  className={`group overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                    isSponsored
                      ? 'bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-orange-900/40 border border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                      : isFeatured
                      ? 'bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-rose-900/40 border border-pink-500/40 shadow-lg shadow-pink-500/10'
                      : 'bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/40'
                  }`}
                >
                  <div className="p-4">
                    {/* Top row with badges */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSponsored && (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-xs font-bold text-slate-900">
                            <Crown className="w-3.5 h-3.5" />
                            {t('dates.sponsored')}
                          </span>
                        )}
                        {isFeatured && !isSponsored && (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-xs font-bold text-white">
                            <Star className="w-3.5 h-3.5 fill-white" />
                            Top Pick
                          </span>
                        )}
                        {suggestion.source === 'google' && (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-xs font-semibold text-blue-300">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      {suggestion.rating && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 rounded-full">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold text-white">{suggestion.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Main content */}
                    <div className="flex items-start gap-4">
                      {/* Number badge */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-lg ${
                        isSponsored
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                          : isFeatured
                          ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                          : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                      }`}>
                        {isSponsored ? <Crown className="w-6 h-6" /> : index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg mb-1 truncate">{suggestion.name}</h3>
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{suggestion.description}</p>
                        
                        {/* Meta info */}
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          {suggestion.price && (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              suggestion.price === 'Gratis' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : suggestion.price === '$'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                : suggestion.price === '$$'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                            }`}>
                              {suggestion.price}
                            </span>
                          )}
                          {suggestion.location && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {suggestion.location}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {suggestion.googleMapsLink && (
                            <a
                              href={suggestion.googleMapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-xl text-xs font-bold text-blue-300 transition-all hover:scale-105"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              Google Maps
                            </a>
                          )}
                          <SaveButton 
                            item={suggestion} 
                            type="date"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Load More Button */}
          <div className="mt-6">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-rose-600/80 text-white hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('dates.loadingMore')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>{t('dates.loadMoreResults')}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Business Partnership Info */}
      {suggestions.length > 0 && (
        <div className="mt-6 mb-4">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-purple-500/30 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm mb-1">{t('dates.yourBusinessHere')}</h3>
                  <p className="text-slate-300 text-xs mb-2">
                    {t('dates.businessPartnershipDesc')}
                  </p>
                  <a 
                    href="mailto:partnerships@biseda.ai?subject=Business Partnership" 
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-xs font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t('dates.becomePartner')}
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && selectedCategory && (
        <div className="text-center py-12">
          <div className="text-6xl mb-3 animate-bounce">💕</div>
          <p className="text-slate-400">{t('dates.selectCityForSuggestions')}</p>
        </div>
      )}

      {!selectedCategory && (
        <div className="text-center py-12">
          <div className="text-6xl mb-3 animate-pulse">💭</div>
          <p className="text-slate-400">{t('dates.selectCategoryToStart')}</p>
        </div>
      )}
        </>
      )}
      
      {/* EVENTS TAB CONTENT */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">Events Coming Soon!</h3>
            <p className="text-slate-400 mb-4">
              {selectedCity ? `Discover local events in ${selectedCity}` : 'Select a city to see local events and festivals'}
            </p>
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40 rounded-2xl">
              <p className="text-purple-300 text-sm font-semibold">
                🎪 Concerts • 🎭 Shows • 🎨 Festivals • ⚽ Sports
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

