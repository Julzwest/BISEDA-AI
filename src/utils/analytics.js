// Simple Analytics Tracking for Biseda.ai
// Tracks feature usage to help prioritize development

const ANALYTICS_KEY = 'biseda_analytics';

// Get current analytics data
export const getAnalytics = () => {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : initAnalytics();
  } catch {
    return initAnalytics();
  }
};

// Initialize analytics structure
const initAnalytics = () => ({
  firstVisit: Date.now(),
  lastVisit: Date.now(),
  totalSessions: 0,
  features: {
    bisedaChat: { views: 0, uses: 0 },
    aiCoach: { views: 0, uses: 0, messages: 0 },
    firstDates: { views: 0, searches: 0 },
    events: { views: 0, searches: 0, venueClicks: 0 },
    tips: { views: 0 },
    gifts: { views: 0 },
    festiveDates: { views: 0 },
    profile: { views: 0 },
    countrySwitcher: { uses: 0 },
    share: { uses: 0 }
  },
  actions: {
    screenshots: 0,
    favorites: 0,
    shares: 0,
    themeChanges: 0
  },
  engagement: {
    totalTimeSpent: 0, // in seconds
    averageSessionTime: 0,
    longestSession: 0
  }
});

// Save analytics data
const saveAnalytics = (data) => {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save analytics:', e);
  }
};

// Track a page view
export const trackPageView = (pageName) => {
  const analytics = getAnalytics();
  const featureMap = {
    'Clipboard': 'bisedaChat',
    'Chat': 'aiCoach',
    'FirstDates': 'firstDates',
    'Events': 'events',
    'Tips': 'tips',
    'Gifts': 'gifts',
    'FestiveDates': 'festiveDates',
    'Profile': 'profile',
    'Home': null // Don't track home specifically
  };
  
  const feature = featureMap[pageName];
  if (feature && analytics.features[feature]) {
    analytics.features[feature].views++;
  }
  
  analytics.lastVisit = Date.now();
  saveAnalytics(analytics);
  
  console.log(`📊 Page view: ${pageName}`);
};

// Track a feature use
export const trackFeatureUse = (featureName, action = 'use') => {
  const analytics = getAnalytics();
  
  if (analytics.features[featureName]) {
    if (action === 'use') {
      analytics.features[featureName].uses = (analytics.features[featureName].uses || 0) + 1;
    } else if (action === 'search') {
      analytics.features[featureName].searches = (analytics.features[featureName].searches || 0) + 1;
    } else if (action === 'message') {
      analytics.features[featureName].messages = (analytics.features[featureName].messages || 0) + 1;
    } else if (action === 'venueClick') {
      analytics.features[featureName].venueClicks = (analytics.features[featureName].venueClicks || 0) + 1;
    }
  }
  
  saveAnalytics(analytics);
  console.log(`📊 Feature use: ${featureName} - ${action}`);
};

// Track an action
export const trackAction = (actionName) => {
  const analytics = getAnalytics();
  
  if (analytics.actions[actionName] !== undefined) {
    analytics.actions[actionName]++;
  }
  
  saveAnalytics(analytics);
  console.log(`📊 Action: ${actionName}`);
};

// Track session start
export const trackSessionStart = () => {
  const analytics = getAnalytics();
  analytics.totalSessions++;
  analytics.lastVisit = Date.now();
  
  // Store session start time
  sessionStorage.setItem('sessionStart', Date.now().toString());
  
  saveAnalytics(analytics);
  console.log(`📊 Session started (Total: ${analytics.totalSessions})`);
};

// Track session end (call on page unload)
export const trackSessionEnd = () => {
  const analytics = getAnalytics();
  const sessionStart = sessionStorage.getItem('sessionStart');
  
  if (sessionStart) {
    const sessionDuration = Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
    analytics.engagement.totalTimeSpent += sessionDuration;
    
    if (analytics.totalSessions > 0) {
      analytics.engagement.averageSessionTime = Math.floor(
        analytics.engagement.totalTimeSpent / analytics.totalSessions
      );
    }
    
    if (sessionDuration > analytics.engagement.longestSession) {
      analytics.engagement.longestSession = sessionDuration;
    }
    
    saveAnalytics(analytics);
    console.log(`📊 Session ended (Duration: ${sessionDuration}s)`);
  }
};

// Get analytics summary for admin dashboard
export const getAnalyticsSummary = () => {
  const analytics = getAnalytics();
  
  // Sort features by usage
  const featureUsage = Object.entries(analytics.features)
    .map(([name, data]) => ({
      name,
      views: data.views || 0,
      uses: data.uses || 0,
      total: (data.views || 0) + (data.uses || 0)
    }))
    .sort((a, b) => b.total - a.total);
  
  return {
    totalSessions: analytics.totalSessions,
    daysSinceFirstVisit: Math.floor((Date.now() - analytics.firstVisit) / (1000 * 60 * 60 * 24)),
    totalTimeSpent: formatTime(analytics.engagement.totalTimeSpent),
    averageSessionTime: formatTime(analytics.engagement.averageSessionTime),
    topFeatures: featureUsage.slice(0, 5),
    actions: analytics.actions
  };
};

// Format seconds to readable time
const formatTime = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

// Clear analytics (for testing)
export const clearAnalytics = () => {
  localStorage.removeItem(ANALYTICS_KEY);
  console.log('📊 Analytics cleared');
};

