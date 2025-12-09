// Favorites/Bookmarks Storage for Biseda.ai
// Save venues, date ideas, tips, etc.

const FAVORITES_KEY = 'biseda_favorites';

// Category types
export const FAVORITE_TYPES = {
  VENUE: 'venue',
  DATE_IDEA: 'date_idea',
  TIP: 'tip',
  GIFT: 'gift',
  EVENT: 'event'
};

// Get all favorites
export const getFavorites = () => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : {
      venues: [],
      dateIdeas: [],
      tips: [],
      gifts: [],
      events: []
    };
  } catch {
    return {
      venues: [],
      dateIdeas: [],
      tips: [],
      gifts: [],
      events: []
    };
  }
};

// Save favorites
const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: favorites }));
  } catch (e) {
    console.warn('Failed to save favorites:', e);
  }
};

// Add a venue to favorites
export const addVenueFavorite = (venue) => {
  const favorites = getFavorites();
  
  // Check if already exists
  if (favorites.venues.some(v => v.id === venue.id || v.name === venue.name)) {
    return false;
  }
  
  favorites.venues.unshift({
    ...venue,
    savedAt: Date.now()
  });
  
  saveFavorites(favorites);
  return true;
};

// Remove a venue from favorites
export const removeVenueFavorite = (venueId) => {
  const favorites = getFavorites();
  favorites.venues = favorites.venues.filter(v => v.id !== venueId && v.name !== venueId);
  saveFavorites(favorites);
  return true;
};

// Check if venue is favorited
export const isVenueFavorited = (venueId, venueName) => {
  const favorites = getFavorites();
  return favorites.venues.some(v => v.id === venueId || v.name === venueName);
};

// Toggle venue favorite
export const toggleVenueFavorite = (venue) => {
  if (isVenueFavorited(venue.id, venue.name)) {
    removeVenueFavorite(venue.id || venue.name);
    return false;
  } else {
    addVenueFavorite(venue);
    return true;
  }
};

// Add a date idea to favorites
export const addDateIdeaFavorite = (idea) => {
  const favorites = getFavorites();
  
  const ideaId = idea.id || `idea_${Date.now()}`;
  if (favorites.dateIdeas.some(i => i.id === ideaId || i.title === idea.title)) {
    return false;
  }
  
  favorites.dateIdeas.unshift({
    ...idea,
    id: ideaId,
    savedAt: Date.now()
  });
  
  saveFavorites(favorites);
  return true;
};

// Remove a date idea from favorites
export const removeDateIdeaFavorite = (ideaId) => {
  const favorites = getFavorites();
  favorites.dateIdeas = favorites.dateIdeas.filter(i => i.id !== ideaId);
  saveFavorites(favorites);
  return true;
};

// Check if date idea is favorited
export const isDateIdeaFavorited = (ideaId, title) => {
  const favorites = getFavorites();
  return favorites.dateIdeas.some(i => i.id === ideaId || i.title === title);
};

// Add a tip to favorites
export const addTipFavorite = (tip) => {
  const favorites = getFavorites();
  
  const tipId = tip.id || `tip_${Date.now()}`;
  if (favorites.tips.some(t => t.id === tipId || t.content === tip.content)) {
    return false;
  }
  
  favorites.tips.unshift({
    ...tip,
    id: tipId,
    savedAt: Date.now()
  });
  
  saveFavorites(favorites);
  return true;
};

// Remove a tip from favorites
export const removeTipFavorite = (tipId) => {
  const favorites = getFavorites();
  favorites.tips = favorites.tips.filter(t => t.id !== tipId);
  saveFavorites(favorites);
  return true;
};

// Add a gift idea to favorites
export const addGiftFavorite = (gift) => {
  const favorites = getFavorites();
  
  const giftId = gift.id || `gift_${Date.now()}`;
  if (favorites.gifts.some(g => g.id === giftId || g.name === gift.name)) {
    return false;
  }
  
  favorites.gifts.unshift({
    ...gift,
    id: giftId,
    savedAt: Date.now()
  });
  
  saveFavorites(favorites);
  return true;
};

// Remove a gift from favorites
export const removeGiftFavorite = (giftId) => {
  const favorites = getFavorites();
  favorites.gifts = favorites.gifts.filter(g => g.id !== giftId);
  saveFavorites(favorites);
  return true;
};

// Get all favorites count
export const getFavoritesCount = () => {
  const favorites = getFavorites();
  return {
    total: favorites.venues.length + favorites.dateIdeas.length + 
           favorites.tips.length + favorites.gifts.length + favorites.events.length,
    venues: favorites.venues.length,
    dateIdeas: favorites.dateIdeas.length,
    tips: favorites.tips.length,
    gifts: favorites.gifts.length,
    events: favorites.events.length
  };
};

// Get favorites by type
export const getFavoritesByType = (type) => {
  const favorites = getFavorites();
  
  switch (type) {
    case FAVORITE_TYPES.VENUE:
      return favorites.venues;
    case FAVORITE_TYPES.DATE_IDEA:
      return favorites.dateIdeas;
    case FAVORITE_TYPES.TIP:
      return favorites.tips;
    case FAVORITE_TYPES.GIFT:
      return favorites.gifts;
    case FAVORITE_TYPES.EVENT:
      return favorites.events;
    default:
      return [];
  }
};

// Clear all favorites
export const clearAllFavorites = () => {
  localStorage.removeItem(FAVORITES_KEY);
  window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: getFavorites() }));
  return true;
};

// Clear favorites by type
export const clearFavoritesByType = (type) => {
  const favorites = getFavorites();
  
  switch (type) {
    case FAVORITE_TYPES.VENUE:
      favorites.venues = [];
      break;
    case FAVORITE_TYPES.DATE_IDEA:
      favorites.dateIdeas = [];
      break;
    case FAVORITE_TYPES.TIP:
      favorites.tips = [];
      break;
    case FAVORITE_TYPES.GIFT:
      favorites.gifts = [];
      break;
    case FAVORITE_TYPES.EVENT:
      favorites.events = [];
      break;
  }
  
  saveFavorites(favorites);
  return true;
};

