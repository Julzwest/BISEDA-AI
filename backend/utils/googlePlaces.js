// Google Places API helper for real-time business searches

/**
 * Search for places using Google Places API (Text Search)
 * @param {string} query - Search query (e.g., "restaurants in Tirana")
 * @param {string} location - City/location for the search (e.g., "Tirana, Albania")
 * @param {string} apiKey - Google Places API key
 * @returns {Promise<Array>} - Array of place results
 */
export async function searchPlaces(query, location, apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Google Places API key not configured');
  }

  try {
    // Use Text Search (New) API - simpler and more accurate
    const searchQuery = `${query} in ${location}`;
    const url = `https://places.googleapis.com/v1/places:searchText`;
    
    console.log(`🔍 Searching Google Places: "${searchQuery}"`);
    
    // Get coordinates for the location
    const coords = getLocationCoordinates(location);
    
    const requestBody = {
      textQuery: searchQuery,
      languageCode: 'en', // Use English for international compatibility
      maxResultCount: 15
    };
    
    // Only add location bias if we have coordinates
    if (coords) {
      requestBody.locationBias = {
        circle: {
          center: coords,
          radius: 15000.0 // 15km radius
        }
      };
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.googleMapsUri,places.userRatingCount,places.currentOpeningHours,places.primaryType,places.photos'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Google Places API error:', response.status, errorData);
      
      if (response.status === 403 || response.status === 401) {
        throw new Error('Google Places API key is invalid or not authorized');
      }
      
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
      console.log('⚠️ No places found');
      return [];
    }

    console.log(`✅ Found ${data.places.length} places from Google`);
    
    // Format results to match our app structure
    const formattedPlaces = data.places.map((place) => ({
      name: place.displayName?.text || 'Unknown Place',
      description: place.primaryType ? formatPlaceType(place.primaryType) : 'Venue',
      location: place.formattedAddress || location,
      rating: place.rating ? place.rating.toFixed(1) : null,
      price: formatPriceLevel(place.priceLevel),
      googleMapsLink: place.googleMapsUri || '#',
      isOpen: place.currentOpeningHours?.openNow,
      reviewCount: place.userRatingCount || 0,
      type: place.primaryType,
      photoRef: place.photos?.[0]?.name || null
    }));

    return formattedPlaces;
    
  } catch (error) {
    console.error('❌ Google Places search error:', error.message);
    throw error;
  }
}

/**
 * Get approximate coordinates for cities worldwide
 * Returns null if city not found (API will search without location bias)
 */
function getLocationCoordinates(location) {
  // Parse location string (e.g., "London, United Kingdom" or "Tirana, Albania")
  const cityName = location.split(',')[0].trim().toLowerCase();
  
  const coordinates = {
    // Albania
    'tiranë': { latitude: 41.3275, longitude: 19.8187 },
    'tirana': { latitude: 41.3275, longitude: 19.8187 },
    'durrës': { latitude: 41.3239, longitude: 19.4565 },
    'durres': { latitude: 41.3239, longitude: 19.4565 },
    'vlorë': { latitude: 40.4686, longitude: 19.4914 },
    'vlore': { latitude: 40.4686, longitude: 19.4914 },
    'shkodër': { latitude: 42.0682, longitude: 19.5126 },
    'shkoder': { latitude: 42.0682, longitude: 19.5126 },
    'korçë': { latitude: 40.6186, longitude: 20.7809 },
    'korce': { latitude: 40.6186, longitude: 20.7809 },
    'elbasan': { latitude: 41.1125, longitude: 20.0822 },
    'fier': { latitude: 40.7239, longitude: 19.5606 },
    'gjirokastër': { latitude: 40.0758, longitude: 20.1389 },
    'gjirokaster': { latitude: 40.0758, longitude: 20.1389 },
    'berat': { latitude: 40.7058, longitude: 19.9522 },
    'lushnjë': { latitude: 40.9419, longitude: 19.7050 },
    'lushnje': { latitude: 40.9419, longitude: 19.7050 },
    'pogradec': { latitude: 40.9022, longitude: 20.6525 },
    'sarandë': { latitude: 39.8753, longitude: 20.0094 },
    'sarande': { latitude: 39.8753, longitude: 20.0094 },
    
    // Kosovo
    'prishtinë': { latitude: 42.6629, longitude: 21.1655 },
    'prishtina': { latitude: 42.6629, longitude: 21.1655 },
    'pristina': { latitude: 42.6629, longitude: 21.1655 },
    'prizren': { latitude: 42.2139, longitude: 20.7397 },
    'pejë': { latitude: 42.6593, longitude: 20.2887 },
    'peje': { latitude: 42.6593, longitude: 20.2887 },
    'gjakovë': { latitude: 42.3803, longitude: 20.4308 },
    'gjakove': { latitude: 42.3803, longitude: 20.4308 },
    'ferizaj': { latitude: 42.3706, longitude: 21.1553 },
    'mitrovicë': { latitude: 42.8914, longitude: 20.8660 },
    'mitrovice': { latitude: 42.8914, longitude: 20.8660 },
    'gjilan': { latitude: 42.4635, longitude: 21.4694 },
    'podujevë': { latitude: 42.9108, longitude: 21.1903 },
    'podujeve': { latitude: 42.9108, longitude: 21.1903 },
    
    // United Kingdom
    'london': { latitude: 51.5074, longitude: -0.1278 },
    'londër': { latitude: 51.5074, longitude: -0.1278 },
    'manchester': { latitude: 53.4808, longitude: -2.2426 },
    'mançester': { latitude: 53.4808, longitude: -2.2426 },
    'birmingham': { latitude: 52.4862, longitude: -1.8904 },
    'leeds': { latitude: 53.8008, longitude: -1.5491 },
    'liverpool': { latitude: 53.4084, longitude: -2.9916 },
    'bristol': { latitude: 51.4545, longitude: -2.5879 },
    'sheffield': { latitude: 53.3811, longitude: -1.4701 },
    'edinburgh': { latitude: 55.9533, longitude: -3.1883 },
    'glasgow': { latitude: 55.8642, longitude: -4.2518 },
    'nottingham': { latitude: 52.9548, longitude: -1.1581 },
    
    // Germany
    'berlin': { latitude: 52.5200, longitude: 13.4050 },
    'munich': { latitude: 48.1351, longitude: 11.5820 },
    'mynih': { latitude: 48.1351, longitude: 11.5820 },
    'frankfurt': { latitude: 50.1109, longitude: 8.6821 },
    'hamburg': { latitude: 53.5511, longitude: 9.9937 },
    'cologne': { latitude: 50.9375, longitude: 6.9603 },
    'këln': { latitude: 50.9375, longitude: 6.9603 },
    'düsseldorf': { latitude: 51.2277, longitude: 6.7735 },
    'stuttgart': { latitude: 48.7758, longitude: 9.1829 },
    'dortmund': { latitude: 51.5136, longitude: 7.4653 },
    'essen': { latitude: 51.4556, longitude: 7.0116 },
    'leipzig': { latitude: 51.3397, longitude: 12.3731 },
    
    // USA
    'new york': { latitude: 40.7128, longitude: -74.0060 },
    'nju jork': { latitude: 40.7128, longitude: -74.0060 },
    'los angeles': { latitude: 34.0522, longitude: -118.2437 },
    'los anxhelos': { latitude: 34.0522, longitude: -118.2437 },
    'chicago': { latitude: 41.8781, longitude: -87.6298 },
    'çikago': { latitude: 41.8781, longitude: -87.6298 },
    'houston': { latitude: 29.7604, longitude: -95.3698 },
    'miami': { latitude: 25.7617, longitude: -80.1918 },
    'san francisco': { latitude: 37.7749, longitude: -122.4194 },
    'boston': { latitude: 42.3601, longitude: -71.0589 },
    'seattle': { latitude: 47.6062, longitude: -122.3321 },
    'dallas': { latitude: 32.7767, longitude: -96.7970 },
    'atlanta': { latitude: 33.7490, longitude: -84.3880 },
    
    // Italy
    'rome': { latitude: 41.9028, longitude: 12.4964 },
    'romë': { latitude: 41.9028, longitude: 12.4964 },
    'milan': { latitude: 45.4642, longitude: 9.1900 },
    'milano': { latitude: 45.4642, longitude: 9.1900 },
    'naples': { latitude: 40.8518, longitude: 14.2681 },
    'napoli': { latitude: 40.8518, longitude: 14.2681 },
    'turin': { latitude: 45.0703, longitude: 7.6869 },
    'torino': { latitude: 45.0703, longitude: 7.6869 },
    'florence': { latitude: 43.7696, longitude: 11.2558 },
    'firenze': { latitude: 43.7696, longitude: 11.2558 },
    'venice': { latitude: 45.4408, longitude: 12.3155 },
    'venezia': { latitude: 45.4408, longitude: 12.3155 },
    'bologna': { latitude: 44.4949, longitude: 11.3426 },
    'genoa': { latitude: 44.4056, longitude: 8.9463 },
    'genova': { latitude: 44.4056, longitude: 8.9463 },
    'palermo': { latitude: 38.1157, longitude: 13.3615 },
    'bari': { latitude: 41.1171, longitude: 16.8719 },
    
    // France
    'paris': { latitude: 48.8566, longitude: 2.3522 },
    'marseille': { latitude: 43.2965, longitude: 5.3698 },
    'marsejë': { latitude: 43.2965, longitude: 5.3698 },
    'lyon': { latitude: 45.7640, longitude: 4.8357 },
    'toulouse': { latitude: 43.6047, longitude: 1.4442 },
    'tuluz': { latitude: 43.6047, longitude: 1.4442 },
    'nice': { latitude: 43.7102, longitude: 7.2620 },
    'nicë': { latitude: 43.7102, longitude: 7.2620 },
    'nantes': { latitude: 47.2184, longitude: -1.5536 },
    'strasbourg': { latitude: 48.5734, longitude: 7.7521 },
    'strasburg': { latitude: 48.5734, longitude: 7.7521 },
    'bordeaux': { latitude: 44.8378, longitude: -0.5792 },
    'bordo': { latitude: 44.8378, longitude: -0.5792 },
    'lille': { latitude: 50.6292, longitude: 3.0573 },
    'montpellier': { latitude: 43.6108, longitude: 3.8767 },
    
    // Spain
    'madrid': { latitude: 40.4168, longitude: -3.7038 },
    'barcelona': { latitude: 41.3851, longitude: 2.1734 },
    'barcelonë': { latitude: 41.3851, longitude: 2.1734 },
    'valencia': { latitude: 39.4699, longitude: -0.3763 },
    'valensja': { latitude: 39.4699, longitude: -0.3763 },
    'seville': { latitude: 37.3891, longitude: -5.9845 },
    'sevilje': { latitude: 37.3891, longitude: -5.9845 },
    'malaga': { latitude: 36.7213, longitude: -4.4214 },
    'malagë': { latitude: 36.7213, longitude: -4.4214 },
    'bilbao': { latitude: 43.2630, longitude: -2.9350 },
    'alicante': { latitude: 38.3452, longitude: -0.4810 },
    'zaragoza': { latitude: 41.6488, longitude: -0.8891 },
    'murcia': { latitude: 37.9922, longitude: -1.1307 },
    'palma': { latitude: 39.5696, longitude: 2.6502 },
    
    // Greece
    'athens': { latitude: 37.9838, longitude: 23.7275 },
    'athinë': { latitude: 37.9838, longitude: 23.7275 },
    'thessaloniki': { latitude: 40.6401, longitude: 22.9444 },
    'selanik': { latitude: 40.6401, longitude: 22.9444 },
    'patras': { latitude: 38.2466, longitude: 21.7346 },
    'heraklion': { latitude: 35.3387, longitude: 25.1442 },
    'iraklio': { latitude: 35.3387, longitude: 25.1442 },
    'larissa': { latitude: 39.6390, longitude: 22.4191 },
    'larisë': { latitude: 39.6390, longitude: 22.4191 },
    'volos': { latitude: 39.3666, longitude: 22.9420 },
    'ioannina': { latitude: 39.6650, longitude: 20.8537 },
    'janinë': { latitude: 39.6650, longitude: 20.8537 },
    'rhodes': { latitude: 36.4341, longitude: 28.2176 },
    'rodos': { latitude: 36.4341, longitude: 28.2176 },
    'chania': { latitude: 35.5138, longitude: 24.0180 },
    'hanja': { latitude: 35.5138, longitude: 24.0180 },
    'corfu': { latitude: 39.6243, longitude: 19.9217 },
    'korfuz': { latitude: 39.6243, longitude: 19.9217 },
    
    // Switzerland
    'zurich': { latitude: 47.3769, longitude: 8.5417 },
    'cyrih': { latitude: 47.3769, longitude: 8.5417 },
    'geneva': { latitude: 46.2044, longitude: 6.1432 },
    'gjenevë': { latitude: 46.2044, longitude: 6.1432 },
    'basel': { latitude: 47.5596, longitude: 7.5886 },
    'bazel': { latitude: 47.5596, longitude: 7.5886 },
    'bern': { latitude: 46.9480, longitude: 7.4474 },
    'bernë': { latitude: 46.9480, longitude: 7.4474 },
    'lausanne': { latitude: 46.5197, longitude: 6.6323 },
    'lozanë': { latitude: 46.5197, longitude: 6.6323 },
    'lucerne': { latitude: 47.0502, longitude: 8.3093 },
    'lucernë': { latitude: 47.0502, longitude: 8.3093 },
    'lugano': { latitude: 46.0037, longitude: 8.9511 },
    'winterthur': { latitude: 47.5001, longitude: 8.7240 },
    
    // Austria
    'vienna': { latitude: 48.2082, longitude: 16.3738 },
    'vjenë': { latitude: 48.2082, longitude: 16.3738 },
    'salzburg': { latitude: 47.8095, longitude: 13.0550 },
    'innsbruck': { latitude: 47.2692, longitude: 11.4041 },
    'graz': { latitude: 47.0707, longitude: 15.4395 },
    'linz': { latitude: 48.3069, longitude: 14.2858 },
    
    // Belgium
    'brussels': { latitude: 50.8503, longitude: 4.3517 },
    'bruksel': { latitude: 50.8503, longitude: 4.3517 },
    'antwerp': { latitude: 51.2194, longitude: 4.4025 },
    'antverp': { latitude: 51.2194, longitude: 4.4025 },
    'ghent': { latitude: 51.0543, longitude: 3.7174 },
    'gent': { latitude: 51.0543, longitude: 3.7174 },
    'bruges': { latitude: 51.2093, longitude: 3.2247 },
    'bryzh': { latitude: 51.2093, longitude: 3.2247 },
    'liege': { latitude: 50.6326, longitude: 5.5797 },
    
    // Netherlands
    'amsterdam': { latitude: 52.3676, longitude: 4.9041 },
    'rotterdam': { latitude: 51.9244, longitude: 4.4777 },
    'the hague': { latitude: 52.0705, longitude: 4.3007 },
    'hagë': { latitude: 52.0705, longitude: 4.3007 },
    'utrecht': { latitude: 52.0907, longitude: 5.1214 },
    'eindhoven': { latitude: 51.4416, longitude: 5.4697 },
    
    // Sweden
    'stockholm': { latitude: 59.3293, longitude: 18.0686 },
    'stokholm': { latitude: 59.3293, longitude: 18.0686 },
    'gothenburg': { latitude: 57.7089, longitude: 11.9746 },
    'göteborg': { latitude: 57.7089, longitude: 11.9746 },
    'malmö': { latitude: 55.6050, longitude: 13.0038 },
    'malmo': { latitude: 55.6050, longitude: 13.0038 },
    'uppsala': { latitude: 59.8586, longitude: 17.6389 }
  };
  
  return coordinates[cityName] || null;
}

/**
 * Format Google's price level to our format
 */
function formatPriceLevel(priceLevel) {
  if (!priceLevel) return '$$';
  
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE':
      return 'Gratis';
    case 'PRICE_LEVEL_INEXPENSIVE':
      return '$';
    case 'PRICE_LEVEL_MODERATE':
      return '$$';
    case 'PRICE_LEVEL_EXPENSIVE':
      return '$$$';
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return '$$$$';
    default:
      return '$$';
  }
}

/**
 * Format place type to Albanian description
 */
function formatPlaceType(type) {
  const typeDescriptions = {
    'restaurant': 'Restorant me atmosferë të mirë',
    'cafe': 'Kafene për biseda të rehatshme',
    'bar': 'Bar me atmosferë të këndshme',
    'night_club': 'Klub nate për argëtim',
    'movie_theater': 'Kinema për shikimin e filmave',
    'park': 'Park për shëtitje romantike',
    'museum': 'Muzeu për kulturë dhe histori',
    'art_gallery': 'Galeri arti për ekspozita',
    'bowling_alley': 'Bowling për argëtim',
    'amusement_center': 'Qendër argëtimi',
    'italian_restaurant': 'Restorant italian',
    'pizza_restaurant': 'Pizzeri',
    'seafood_restaurant': 'Restorant me peshk',
    'fine_dining_restaurant': 'Restorant elegant',
    'concert_hall': 'Sallë koncertesh',
    'performing_arts_theater': 'Teatër',
    'live_music_venue': 'Vend me muzikë live',
    'karaoke': 'Karaoke',
    'comedy_club': 'Klub komedi',
    'sports_club': 'Klub sportiv',
    'gym': 'Palestër',
    'spa': 'Spa & Wellness',
    'shopping_mall': 'Qendër tregtare',
    'tourist_attraction': 'Atraksion turistik'
  };
  
  return typeDescriptions[type] || 'Vend për evente dhe argëtim';
}
