import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Coffee, UtensilsCrossed, Film, Music, Dumbbell, Palette, TreePine, Sparkles, Heart, Star, Crown, TrendingUp, Globe, X, Search, Plus, ChevronRight, PartyPopper, Calendar, Gift, Flag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/SaveButton';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { base44 } from '@/api/base44Client';
import { countries, getLocalizedCitiesForCountry, getCountryByCode, getCityNameEn, getLocalizedCountryName } from '@/config/countries';

const backendUrl = getBackendUrl();

// Festive dates data by country - Key holidays and celebrations
const festiveDatesByCountry = {
  // Albania
  AL: [
    { month: 0, date: 1, name: 'Dita e Vitit të Ri', emoji: '🎆' },
    { month: 1, date: 14, name: 'Dita e Dashurisë', emoji: '💕' },
    { month: 2, date: 8, name: 'Dita Ndërkombëtare e Gruas', emoji: '👩' },
    { month: 2, date: 14, name: 'Dita e Verës', emoji: '🌸' },
    { month: 4, date: 1, name: 'Dita e Punëtorëve', emoji: '✊' },
    { month: 4, date: 12, name: 'Dita e Nënës', emoji: '💐' },
    { month: 5, date: 16, name: 'Dita e Babait', emoji: '👨' },
    { month: 9, date: 31, name: 'Halloween', emoji: '🎃' },
    { month: 10, date: 28, name: 'Dita e Flamurit', emoji: '🇦🇱' },
    { month: 11, date: 24, name: 'Nata e Krishtlindjeve', emoji: '🌟' },
    { month: 11, date: 25, name: 'Krishtlindjet', emoji: '🎄' },
    { month: 11, date: 26, name: 'Boxing Day', emoji: '🎁' },
    { month: 11, date: 31, name: 'Nata e Vitit të Ri', emoji: '🎉' }
  ],
  // United Kingdom
  GB: [
    { month: 0, date: 1, name: 'New Year\'s Day', emoji: '🎆' },
    { month: 1, date: 14, name: 'Valentine\'s Day', emoji: '💕' },
    { month: 2, date: 17, name: 'St Patrick\'s Day', emoji: '☘️' },
    { month: 9, date: 31, name: 'Halloween', emoji: '🎃' },
    { month: 10, date: 5, name: 'Bonfire Night', emoji: '🎆' },
    { month: 11, date: 24, name: 'Christmas Eve', emoji: '🌟' },
    { month: 11, date: 25, name: 'Christmas Day', emoji: '🎄' },
    { month: 11, date: 26, name: 'Boxing Day', emoji: '🎁' },
    { month: 11, date: 31, name: 'New Year\'s Eve', emoji: '🎉' }
  ],
  // United States
  US: [
    { month: 0, date: 1, name: 'New Year\'s Day', emoji: '🎆' },
    { month: 1, date: 14, name: 'Valentine\'s Day', emoji: '💕' },
    { month: 2, date: 17, name: 'St. Patrick\'s Day', emoji: '☘️' },
    { month: 4, date: 12, name: 'Mother\'s Day', emoji: '💐' },
    { month: 5, date: 16, name: 'Father\'s Day', emoji: '👨' },
    { month: 6, date: 4, name: 'Independence Day', emoji: '🇺🇸' },
    { month: 9, date: 31, name: 'Halloween', emoji: '🎃' },
    { month: 10, date: 28, name: 'Thanksgiving', emoji: '🦃' },
    { month: 11, date: 24, name: 'Christmas Eve', emoji: '🌟' },
    { month: 11, date: 25, name: 'Christmas Day', emoji: '🎄' },
    { month: 11, date: 31, name: 'New Year\'s Eve', emoji: '🎉' }
  ]
};

const defaultFestiveDates = festiveDatesByCountry.GB;

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
  
  // Expanded festive date state - for showing venue suggestions
  const [expandedFestiveId, setExpandedFestiveId] = useState(null);
  const [festiveSuggestions, setFestiveSuggestions] = useState([]);
  const [loadingFestive, setLoadingFestive] = useState(false);
  
  // Get user's country from localStorage
  const [userCountry, setUserCountry] = useState(localStorage.getItem('userCountry') || 'AL');
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
  
  // Get upcoming festive dates
  const getUpcomingFestiveDates = () => {
    const festiveDates = festiveDatesByCountry[userCountry] || defaultFestiveDates;
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const upcomingDates = festiveDates.map(festive => {
      let festiveDate = new Date(currentYear, festive.month, festive.date);
      
      if (festiveDate < today) {
        festiveDate = new Date(currentYear + 1, festive.month, festive.date);
      }
      
      const diffTime = festiveDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...festive,
        daysUntil: diffDays,
        fullDate: festiveDate
      };
    });
    
    return upcomingDates.sort((a, b) => a.daysUntil - b.daysUntil);
  };
  
  const upcomingFestiveDates = getUpcomingFestiveDates();

  // Handle festive date click - fetch AI-powered suggestions specific to the occasion
  const handleFestiveDateClick = async (festive, index) => {
    const festiveId = `${festive.name}-${index}`;
    
    // If already expanded, collapse it
    if (expandedFestiveId === festiveId) {
      setExpandedFestiveId(null);
      setFestiveSuggestions([]);
      return;
    }
    
    setExpandedFestiveId(festiveId);
    setLoadingFestive(true);
    setFestiveSuggestions([]);
    
    // Get occasion-specific configuration with UNIQUE venue types - LIVE DATA ONLY
    const getOccasionConfig = (name) => {
      const lowerName = name.toLowerCase();
      
      if (lowerName.includes('valentine') || lowerName.includes('dashuri')) {
        return {
          // Search for romantic venues - NOT generic restaurants
          searchQueries: ['romantic fine dining', 'wine bar', 'couples spa massage'],
          category: 'spa', // Different category!
          ideas: ['💕 Romantic Candlelit Dinner', '🌹 Flower Delivery', '💆 Couples Spa', '🍫 Chocolate Tasting', '🥂 Wine Bar', '🎻 Live Jazz']
        };
      }
      if (lowerName.includes('christmas') || lowerName.includes('krishtlindj')) {
        return {
          searchQueries: ['christmas market', 'ice skating rink', 'christmas lights'],
          category: 'tourist_attraction',
          ideas: ['🎄 Christmas Market Visit', '☕ Hot Chocolate Cafe', '⛸️ Ice Skating Rink', '🎁 Gift Shopping', '🍖 Festive Dinner', '🎭 Christmas Show']
        };
      }
      if (lowerName.includes('new year') && lowerName.includes('eve')) {
        return {
          searchQueries: ['rooftop bar', 'nightclub', 'cocktail bar'],
          category: 'night_club',
          ideas: ['🎆 Rooftop Fireworks Party', '🍾 Champagne Bar', '🪩 NYE Club Night', '🎇 Fireworks Viewpoint', '🥂 Countdown Dinner', '🎤 Live DJ Event']
        };
      }
      if ((lowerName.includes('new year') && lowerName.includes('day')) || (lowerName.includes('vit') && !lowerName.includes('eve'))) {
        return {
          searchQueries: ['brunch restaurant', 'day spa', 'wellness center'],
          category: 'spa',
          ideas: ['🍳 New Year Brunch', '💆 Recovery Spa Day', '☕ Cozy Cafe', '🚶 New Year Walk', '🎬 Movie Marathon', '🍜 Comfort Food']
        };
      }
      if (lowerName.includes('halloween')) {
        return {
          searchQueries: ['escape room', 'laser tag', 'trampoline park'],
          category: 'amusement_center',
          ideas: ['🎃 Halloween Costume Party', '👻 Haunted House', '🍸 Themed Cocktail Bar', '🎭 Horror Movie Night', '🧟 Zombie Walk', '🔮 Escape Room']
        };
      }
      if (lowerName.includes('mother') || lowerName.includes('nën') || lowerName.includes('grua')) {
        return {
          searchQueries: ['afternoon tea', 'beauty spa', 'florist'],
          category: 'spa',
          ideas: ['🌸 Elegant Brunch', '💐 Flower Arranging Class', '💆‍♀️ Mother-Daughter Spa', '🍰 Afternoon Tea', '🎨 Art Class Together', '📸 Photoshoot']
        };
      }
      if (lowerName.includes('father') || lowerName.includes('baba')) {
        return {
          searchQueries: ['steakhouse', 'brewery', 'golf course'],
          category: 'bar',
          ideas: ['🥩 Premium Steakhouse', '⛳ Golf Day', '🍺 Craft Brewery Tour', '🏎️ Go-Karting', '🎳 Bowling Night', '🏈 Sports Bar']
        };
      }
      if (lowerName.includes('patrick')) {
        return {
          searchQueries: ['irish pub', 'beer garden', 'pub with live music'],
          category: 'bar',
          ideas: ['☘️ Authentic Irish Pub', '🍺 Green Beer Festival', '🎵 Irish Live Music', '🥳 St Patrick Parade', '🍀 Pub Crawl', '💚 Themed Party']
        };
      }
      if (lowerName.includes('thanksgiving') || lowerName.includes('falënderim')) {
        return {
          searchQueries: ['american restaurant', 'steakhouse', 'family restaurant'],
          category: 'restaurant',
          ideas: ['🦃 Thanksgiving Feast', '🥧 Pumpkin Pie Cafe', '🍂 Autumn Walk', '🏈 Watch Football', '🍷 Wine Tasting', '👨‍👩‍👧‍👦 Family Dinner']
        };
      }
      if (lowerName.includes('independence') || lowerName.includes('flamur') || lowerName.includes('july')) {
        return {
          searchQueries: ['rooftop bar', 'bbq restaurant', 'beer garden'],
          category: 'bar',
          ideas: ['🎆 Fireworks Viewing', '🍔 BBQ Cookout', '🎵 Outdoor Concert', '🏊 Pool Party', '🍺 Rooftop Drinks', '🎉 Street Festival']
        };
      }
      if (lowerName.includes('bonfire') || lowerName.includes('guy fawkes')) {
        return {
          searchQueries: ['pub with beer garden', 'outdoor bar', 'gastro pub'],
          category: 'bar',
          ideas: ['🔥 Bonfire Event', '🎆 Fireworks Display', '🍵 Mulled Wine', '🌭 Outdoor Food Stalls', '✨ Sparklers Night', '🎪 Funfair']
        };
      }
      // Default for other celebrations
      return {
        searchQueries: ['cocktail bar', 'lounge bar', 'rooftop bar'],
        category: 'bar',
        ideas: ['🍽️ Special Celebration Dinner', '🍸 Cocktail Lounge', '🎵 Live Entertainment', '🎭 Show or Performance', '🎉 Event Venue', '✨ Rooftop Experience']
      };
    };
    
    const config = getOccasionConfig(festive.name);
    
    try {
      // Use the selected city or default to first city
      const searchCity = selectedCity || cities[0] || 'Tiranë';
      const cityNameEn = getCityNameEn(userCountry, searchCity) || searchCity;
      const countryNameEn = currentCountry?.nameEn || 'Albania';
      
      console.log(`🔍 Searching LIVE data for ${festive.name} in ${cityNameEn}...`);
      console.log(`📝 Queries: ${config.searchQueries.join(', ')}`);
      
      // Fetch LIVE data from Google Places API for each search query
      let allPlaces = [];
      
      for (const searchQuery of config.searchQueries) {
        try {
          const placesResponse = await fetch(`${backendUrl}/api/places/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `${searchQuery} in ${cityNameEn}`,
              location: `${cityNameEn}, ${countryNameEn}`,
              category: config.category,
              strictLocation: true,
              cityName: cityNameEn,
              countryName: countryNameEn
            })
          });
          
          if (placesResponse.ok) {
            const data = await placesResponse.json();
            if (data.places && data.places.length > 0) {
              console.log(`✅ Got ${data.places.length} LIVE results for "${searchQuery}"`);
              allPlaces.push(...data.places);
            }
          }
        } catch (e) {
          console.log(`Search for "${searchQuery}" failed:`, e);
        }
      }
      
      // Remove duplicates based on name
      const uniquePlaces = allPlaces.reduce((acc, place) => {
        if (!acc.find(p => p.name.toLowerCase() === place.name.toLowerCase())) {
          acc.push(place);
        }
        return acc;
      }, []);
      
      console.log(`📍 Total unique LIVE venues for ${festive.name}: ${uniquePlaces.length}`);
      
      // Set the results - ONLY live data, no fallbacks
      setFestiveSuggestions({
        occasionName: festive.name,
        ideas: config.ideas,
        places: uniquePlaces.slice(0, 6).map(place => ({
          name: place.name,
          description: place.description || `Great for ${festive.name}`,
          location: place.location,
          rating: place.rating,
          price: place.price,
          googleMapsLink: place.googleMapsLink,
          isOpen: place.isOpen,
          isLive: true // Mark as live data
        }))
      });
      
    } catch (error) {
      console.error('Error fetching live data:', error);
      // Show error state instead of fallback
      setFestiveSuggestions({
        occasionName: festive.name,
        ideas: config.ideas,
        places: [],
        error: 'Unable to fetch live venue data. Please try again.'
      });
    } finally {
      setLoadingFestive(false);
    }
  };
  
  // Listen for country changes
  useEffect(() => {
    const handleCountryChange = (event) => {
      const newCountry = event.detail?.countryCode || localStorage.getItem('userCountry') || 'AL';
      setUserCountry(newCountry);
      setSelectedCity(''); // Reset city when country changes
    };

    window.addEventListener('countryChanged', handleCountryChange);
    
    const storedCountry = localStorage.getItem('userCountry') || 'AL';
    if (storedCountry !== userCountry) {
      setUserCountry(storedCountry);
    }

    return () => {
      window.removeEventListener('countryChanged', handleCountryChange);
    };
  }, []);

  const timeOfDayOptions = [
    { id: 'morning', label: t('explore.timeOfDay.morning', 'Morning'), emoji: '🌅', color: 'from-yellow-400 to-orange-400' },
    { id: 'afternoon', label: t('explore.timeOfDay.afternoon', 'Afternoon'), emoji: '☀️', color: 'from-orange-400 to-amber-500' },
    { id: 'evening', label: t('explore.timeOfDay.evening', 'Evening'), emoji: '🌆', color: 'from-purple-500 to-pink-500' },
    { id: 'night', label: t('explore.timeOfDay.night', 'Night'), emoji: '🌙', color: 'from-indigo-600 to-purple-600' },
    { id: 'anytime', label: t('explore.timeOfDay.anytime', 'Any Time'), emoji: '⏰', color: 'from-slate-600 to-slate-700' }
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
      {/* Header - Fun & Playful */}
      <div className="mb-6 text-center relative">
        {/* Floating decorative elements */}
        <div className="absolute -top-4 left-4 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0s' }}>💕</div>
        <div className="absolute -top-2 right-8 text-2xl animate-bounce opacity-50" style={{ animationDelay: '0.3s' }}>✨</div>
        <div className="absolute top-12 left-8 text-xl animate-bounce opacity-40" style={{ animationDelay: '0.6s' }}>🌟</div>
        
        <div className="inline-block mb-4">
          <div className="relative">
            {/* Glowing ring effect */}
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 transform hover:rotate-6 transition-transform">
              <span className="text-5xl">💖</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-yellow-500/50">
              <span className="text-lg">🔥</span>
            </div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-sm">💫</span>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-black mb-2">
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {t('explore.findDateSpot', 'Find Your Perfect Date Spot! 💕')}
          </span>
        </h1>
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
          <span>{t('explore.discoverVenues', 'Discover amazing venues • Plan unforgettable dates')}</span>
        </p>
      </div>
      
      {/* TAB NAVIGATION - Fun Pills */}
      <div className="mb-6 relative">
        <div className="flex gap-3 p-2 bg-slate-900/70 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('venues')}
            className={`flex-1 py-4 px-4 rounded-xl font-bold text-sm transition-all transform ${
              activeTab === 'venues'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white shadow-lg shadow-pink-500/50 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-[1.01]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">🍽️</span>
              <span>{t('explore.dateSpots', 'Date Spots')}</span>
              {activeTab === 'venues' && <span className="animate-pulse">✨</span>}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-4 px-4 rounded-xl font-bold text-sm transition-all transform ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-purple-500/50 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-[1.01]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">🎉</span>
              <span>{t('explore.events', 'Events')}</span>
              {activeTab === 'events' && <span className="animate-pulse">🎊</span>}
            </span>
          </button>
        </div>
      </div>
      {/* SHARED: City Selection - Fun & Engaging */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-xl">📍</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{t('explore.selectCity', 'Select City')}</h2>
            <p className="text-xs text-slate-400">{t('explore.wheresMagic', "Where's the magic happening?")} ✨</p>
          </div>
          <span className="px-3 py-1.5 bg-slate-800/70 rounded-full text-sm text-slate-300 border border-slate-700/50">
            {currentCountry?.flag} {localizedCountryName}
          </span>
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
          {/* Time of Day Filter - Visual & Fun */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-xl">⏰</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('explore.whensDate', "When's the date?")}</h2>
                <p className="text-xs text-slate-400">{t('explore.setMood', 'Set the mood')} 🌙</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {timeOfDayOptions.map((time) => (
                <button
                  key={time.id}
                  onClick={() => setSelectedTimeOfDay(time.id)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 ${
                    selectedTimeOfDay === time.id
                      ? `bg-gradient-to-r ${time.color} text-white shadow-xl shadow-purple-500/30 scale-105`
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-700/50 hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-xl mr-2">{time.emoji}</span>
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

      {/* Category Selection - Big & Playful */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('dates.selectCategory')}</h2>
            <p className="text-xs text-slate-400">What kind of vibe are you after? 💫</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory?.id === category.id;
            const categoryEmojis = ['🍽️', '☕', '🍸', '🎬', '🎵', '🏃', '🎨', '🌳'];
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`group p-5 rounded-3xl border-2 transition-all text-left transform hover:scale-[1.03] active:scale-95 ${
                  isSelected
                    ? `bg-gradient-to-br ${category.color} border-transparent shadow-2xl shadow-purple-500/40 scale-[1.02]`
                    : 'bg-slate-800/60 border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                    isSelected 
                      ? 'bg-white/20 scale-110' 
                      : 'bg-slate-700/50 group-hover:bg-slate-600/50 group-hover:scale-105'
                  }`}>
                    <span className="text-3xl">{categoryEmojis[index]}</span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {category.name}
                  </h3>
                  <p className={`text-xs line-clamp-2 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {category.description}
                  </p>
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

      {/* Empty State - Fun & Encouraging */}
      {suggestions.length === 0 && selectedCategory && (
        <Card className="bg-gradient-to-br from-pink-900/20 via-purple-900/20 to-indigo-900/20 border border-purple-500/20">
          <div className="text-center py-12 px-6">
            <div className="text-7xl mb-4 animate-bounce">💕</div>
            <h3 className="text-xl font-bold text-white mb-2">Almost there!</h3>
            <p className="text-slate-300 mb-4">{t('dates.selectCityForSuggestions')}</p>
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1.5 bg-purple-500/20 rounded-full text-sm text-purple-300">👆 Pick a city above</span>
            </div>
          </div>
        </Card>
      )}

      {!selectedCategory && (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30">
          <div className="text-center py-12 px-6">
            <div className="relative inline-block mb-4">
              <span className="text-7xl">💭</span>
              <span className="absolute -top-2 -right-2 text-2xl animate-ping">✨</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Let's find your perfect spot!</h3>
            <p className="text-slate-300 mb-4">{t('dates.selectCategoryToStart')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1.5 bg-pink-500/20 rounded-full text-sm text-pink-300 animate-pulse">🍽️ Dinner?</span>
              <span className="px-3 py-1.5 bg-amber-500/20 rounded-full text-sm text-amber-300 animate-pulse" style={{ animationDelay: '0.2s' }}>☕ Coffee?</span>
              <span className="px-3 py-1.5 bg-purple-500/20 rounded-full text-sm text-purple-300 animate-pulse" style={{ animationDelay: '0.4s' }}>🍸 Drinks?</span>
            </div>
          </div>
        </Card>
      )}
        </>
      )}
      
      {/* EVENTS TAB CONTENT - Fun & Celebratory */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Header for events */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-3">
              <span className="text-2xl animate-bounce">🎊</span>
              <span className="text-purple-300 font-bold">{t('explore.specialOccasions', 'Special Occasions')}</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</span>
            </div>
            <p className="text-slate-400 text-sm">{t('explore.makeMemorableDates', 'Plan something special for these dates!')}</p>
          </div>

          {/* Upcoming Festive Dates */}
          <div className="mb-6">
            {/* Next Festive Date - Hero Card - CLICKABLE */}
            {upcomingFestiveDates[0] && (
              <div className="mb-5">
                <Card 
                  className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                  onClick={() => handleFestiveDateClick(upcomingFestiveDates[0], 0)}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 opacity-90" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                  
                  {/* Floating emojis */}
                  <div className="absolute top-4 right-4 text-3xl opacity-40 animate-bounce">✨</div>
                  <div className="absolute bottom-4 right-12 text-2xl opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}>💫</div>
                  
                  <div className="relative p-6">
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-xl">
                        <span className="text-6xl">{upcomingFestiveDates[0].emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-black ${
                            upcomingFestiveDates[0].daysUntil === 0 
                              ? 'bg-yellow-400 text-yellow-900 animate-pulse' 
                              : upcomingFestiveDates[0].daysUntil === 1 
                              ? 'bg-orange-400 text-orange-900'
                              : 'bg-white/20 text-white'
                          }`}>
                            {upcomingFestiveDates[0].daysUntil === 0 ? '🔥 TODAY!' : upcomingFestiveDates[0].daysUntil === 1 ? '⚡ TOMORROW!' : `📅 IN ${upcomingFestiveDates[0].daysUntil} DAYS`}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-1">{upcomingFestiveDates[0].name}</h3>
                        <p className="text-white/80 font-medium">
                          {upcomingFestiveDates[0].fullDate.toLocaleDateString(i18n.language, { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Date idea prompt */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                        <span>💡</span>
                        <span>{t('explore.tapForDateIdeas', 'Tap to get date ideas for this occasion!')}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedFestiveId === `${upcomingFestiveDates[0].name}-0` ? 'rotate-90' : ''}`} />
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* Expanded Content for Hero Card */}
                {expandedFestiveId === `${upcomingFestiveDates[0].name}-0` && (
                  <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {loadingFestive ? (
                      <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-center">
                        <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-300">Finding {upcomingFestiveDates[0].name} experiences...</p>
                      </div>
                    ) : festiveSuggestions.ideas && (
                      <>
                        {/* Occasion-specific header with LIVE indicator */}
                        <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                          <div className="flex items-center justify-center gap-2">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/30 rounded-full text-xs text-green-300">
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              LIVE DATA
                            </span>
                            <p className="text-white text-sm font-medium">
                              {t('explore.bestFor', 'Best for')} <span className="font-bold">{festiveSuggestions.occasionName || upcomingFestiveDates[0].name}</span>
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Ideas */}
                        <div className="p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-2xl border border-purple-500/30">
                          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span>💡</span> {t('explore.dateIdeasThisDay', 'Date Ideas for This Day')}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {festiveSuggestions.ideas.map((idea, idx) => (
                              <span key={idx} className="px-3 py-2 bg-white/10 rounded-xl text-sm text-white/90 hover:bg-white/20 transition-colors cursor-pointer">
                                {idea}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Venue Suggestions */}
                        {festiveSuggestions.places && festiveSuggestions.places.length > 0 && (
                          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-400" />
                              Best Spots for {festiveSuggestions.occasionName || 'This Occasion'} {selectedCity && `in ${selectedCity}`}
                            </h4>
                            <div className="space-y-3">
                              {festiveSuggestions.places.map((place, idx) => (
                                <div key={idx} className="p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-colors">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-white font-semibold">{place.name}</h5>
                                        {place.isLive && (
                                          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded text-xs flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            LIVE
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-slate-400 text-sm line-clamp-2">{place.description}</p>
                                      {place.location && (
                                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {place.location}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      {place.rating && (
                                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                          <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                          {place.rating}
                                        </span>
                                      )}
                                      {place.googleMapsLink && (
                                        <a
                                          href={place.googleMapsLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                                        >
                                          <MapPin className="w-3 h-3" />
                                          View
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* No venues or error message */}
                        {(!festiveSuggestions.places || festiveSuggestions.places.length === 0) && (
                          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-center">
                            {festiveSuggestions.error ? (
                              <p className="text-red-400 text-sm">{festiveSuggestions.error}</p>
                            ) : (
                              <p className="text-slate-400 text-sm">
                                {selectedCity 
                                  ? `No live venues found for ${festiveSuggestions.occasionName} in ${selectedCity}. Try a different city.` 
                                  : `Select a city above to discover live venues`}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* More Upcoming Dates - Fun Cards - CLICKABLE */}
            <div className="grid gap-3">
              {upcomingFestiveDates.slice(1, showAllFestive ? upcomingFestiveDates.length : 6).map((festive, index) => {
                const actualIndex = index + 1; // Since we're slicing from 1
                const festiveId = `${festive.name}-${actualIndex}`;
                const isExpanded = expandedFestiveId === festiveId;
                const colors = [
                  'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
                  'from-green-500/20 to-emerald-500/20 border-green-500/30',
                  'from-orange-500/20 to-amber-500/20 border-orange-500/30',
                  'from-pink-500/20 to-rose-500/20 border-pink-500/30',
                  'from-violet-500/20 to-purple-500/20 border-violet-500/30',
                ];
                return (
                  <div key={index}>
                    <Card 
                      className={`bg-gradient-to-r ${colors[index % colors.length]} border backdrop-blur-sm transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer active:scale-[0.99] ${isExpanded ? 'ring-2 ring-purple-500/50' : ''}`}
                      onClick={() => handleFestiveDateClick(festive, actualIndex)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900/40 flex items-center justify-center">
                            <span className="text-3xl">{festive.emoji}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">{festive.name}</h4>
                            <p className="text-slate-300 text-sm">
                              {festive.fullDate.toLocaleDateString(i18n.language, { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-2 rounded-xl font-bold text-sm ${
                              festive.daysUntil <= 7 
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                                : festive.daysUntil <= 30
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-800/50 text-slate-300'
                            }`}>
                              {festive.daysUntil === 0 ? '🔥 Today' : festive.daysUntil === 1 ? 'Tomorrow' : `${festive.daysUntil} days`}
                            </div>
                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-2 space-y-3 animate-in slide-in-from-top-2 duration-300">
                        {loadingFestive ? (
                          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-center">
                            <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-slate-400 text-sm">Finding {festive.name} experiences...</p>
                          </div>
                        ) : festiveSuggestions.ideas && (
                          <>
                            {/* Occasion-specific header with LIVE indicator */}
                            <div className="p-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                              <div className="flex items-center justify-center gap-2">
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 rounded text-xs text-green-300">
                                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                  LIVE
                                </span>
                                <p className="text-white text-xs">
                                  <span className="font-bold">{festiveSuggestions.occasionName || festive.name}</span>
                                </p>
                              </div>
                            </div>
                            
                            {/* Quick Ideas */}
                            <div className="p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/20">
                              <h5 className="text-white font-semibold text-sm mb-2">💡 Perfect Activities</h5>
                              <div className="flex flex-wrap gap-2">
                                {festiveSuggestions.ideas.map((idea, idx) => (
                                  <span key={idx} className="px-2.5 py-1.5 bg-white/10 rounded-lg text-xs text-white/90">
                                    {idea}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {/* Top 3 Venues */}
                            {festiveSuggestions.places && festiveSuggestions.places.length > 0 && (
                              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <h5 className="text-white font-semibold text-sm mb-2 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                                  {t('explore.bestFor', 'Best for')} {festiveSuggestions.occasionName || festive.name}
                                </h5>
                                <div className="space-y-2">
                                  {festiveSuggestions.places.slice(0, 3).map((place, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-700/40 rounded-lg">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                          <p className="text-white text-sm font-medium truncate">{place.name}</p>
                                          {place.isLive && <span className="text-green-400 text-xs">●</span>}
                                        </div>
                                        <p className="text-slate-400 text-xs line-clamp-1">{place.description}</p>
                                        {place.rating && (
                                          <span className="text-yellow-400 text-xs flex items-center gap-0.5">
                                            <Star className="w-3 h-3 fill-yellow-400" />
                                            {place.rating}
                                          </span>
                                        )}
                                      </div>
                                      {place.googleMapsLink && (
                                        <a
                                          href={place.googleMapsLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30"
                                        >
                                          View
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Show More Button */}
            {upcomingFestiveDates.length > 6 && (
              <Button
                onClick={() => setShowAllFestive(!showAllFestive)}
                className="w-full mt-4 py-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-bold border border-slate-600 rounded-2xl transition-all hover:scale-[1.01]"
              >
                <span className="flex items-center justify-center gap-2">
                  {showAllFestive ? `🔼 ${t('common.less', 'Show Less')}` : `🎉 ${t('explore.viewAllCelebrations', 'View All {{count}} Celebrations', { count: upcomingFestiveDates.length })}`}
                </span>
              </Button>
            )}
          </div>
          
          {/* Date Ideas for Events Section */}
          <Card className="bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/30 border border-purple-500/30">
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 shadow-lg shadow-orange-500/30">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('explore.dateIdeasSpecial', 'Date Ideas for Special Occasions')}</h3>
              <p className="text-slate-300 text-sm mb-4">
                {t('explore.makeMemorableDates', 'Make these celebrations memorable with perfect date planning!')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => {
                    // Find Valentine's Day and click it
                    const valentines = upcomingFestiveDates.find(f => f.name.toLowerCase().includes('valentine') || f.name.toLowerCase().includes('dashuri'));
                    if (valentines) {
                      const idx = upcomingFestiveDates.indexOf(valentines);
                      handleFestiveDateClick(valentines, idx);
                    }
                  }}
                  className="px-3 py-2 bg-pink-500/20 rounded-full text-sm font-medium text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 transition-colors cursor-pointer"
                >
                  💕 {t('explore.valentinesDinner', "Valentine's Dinner")}
                </button>
                <button 
                  onClick={() => {
                    const christmas = upcomingFestiveDates.find(f => f.name.toLowerCase().includes('christmas') || f.name.toLowerCase().includes('krishtlindj'));
                    if (christmas) {
                      const idx = upcomingFestiveDates.indexOf(christmas);
                      handleFestiveDateClick(christmas, idx);
                    }
                  }}
                  className="px-3 py-2 bg-amber-500/20 rounded-full text-sm font-medium text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  🎄 {t('explore.christmasMarket', 'Christmas Market')}
                </button>
                <button 
                  onClick={() => {
                    const newYear = upcomingFestiveDates.find(f => f.name.toLowerCase().includes('new year') || f.name.toLowerCase().includes('vit'));
                    if (newYear) {
                      const idx = upcomingFestiveDates.indexOf(newYear);
                      handleFestiveDateClick(newYear, idx);
                    }
                  }}
                  className="px-3 py-2 bg-purple-500/20 rounded-full text-sm font-medium text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors cursor-pointer"
                >
                  🎆 {t('explore.newYearsParty', "New Year's Party")}
                </button>
              </div>
            </div>
          </Card>
          
          {/* Local Events Coming Soon */}
          <Card className="bg-slate-900/50 border border-slate-700/50 overflow-hidden">
            <div className="p-6 text-center relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              <div className="relative">
                <div className="text-6xl mb-4 animate-pulse">🎭</div>
                <h3 className="text-xl font-bold text-white mb-2">{t('explore.localEventsSoon', 'Local Events Coming Soon!')}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {t('explore.workingOnEvents', "We're working on bringing you live concerts, festivals, and events near you.")}
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-slate-400 text-sm">
                  <span className="px-3 py-1.5 bg-slate-800/50 rounded-full">🎵 {t('explore.concerts', 'Concerts')}</span>
                  <span className="px-3 py-1.5 bg-slate-800/50 rounded-full">🎪 {t('explore.festivals', 'Festivals')}</span>
                  <span className="px-3 py-1.5 bg-slate-800/50 rounded-full">⚽ {t('explore.sports', 'Sports')}</span>
                  <span className="px-3 py-1.5 bg-slate-800/50 rounded-full">🎨 {t('explore.artShows', 'Art Shows')}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

