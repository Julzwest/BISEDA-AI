// Activity Tracker - Tracks user activity for weekly stats
// Stores activity per day of the week

const ACTIVITY_KEY = 'weeklyActivityData';
const LAST_RESET_KEY = 'activityLastReset';

// Get the start of the current week (Monday)
function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.getTime();
}

// Get current day index (0 = Monday, 6 = Sunday)
function getDayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
}

// Initialize or reset activity data
function initializeActivity() {
  const weekStart = getWeekStart();
  const lastReset = localStorage.getItem(LAST_RESET_KEY);
  
  // Reset if it's a new week
  if (!lastReset || parseInt(lastReset) < weekStart) {
    const emptyWeek = [0, 0, 0, 0, 0, 0, 0];
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(emptyWeek));
    localStorage.setItem(LAST_RESET_KEY, weekStart.toString());
    return emptyWeek;
  }
  
  // Return existing data
  try {
    const data = localStorage.getItem(ACTIVITY_KEY);
    return data ? JSON.parse(data) : [0, 0, 0, 0, 0, 0, 0];
  } catch {
    return [0, 0, 0, 0, 0, 0, 0];
  }
}

// Track an activity (increment today's count)
export function trackActivity(amount = 1) {
  const activity = initializeActivity();
  const dayIndex = getDayIndex();
  activity[dayIndex] += amount;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  
  // Also track total for this week
  const weeklyTotal = parseInt(localStorage.getItem('weeklyMessages') || '0') + amount;
  localStorage.setItem('weeklyMessages', weeklyTotal.toString());
  
  return activity;
}

// Get weekly activity data
export function getWeeklyActivity() {
  return initializeActivity();
}

// Get this week's total
export function getWeeklyTotal() {
  const activity = initializeActivity();
  return activity.reduce((sum, count) => sum + count, 0);
}

// Track specific action types
export function trackMessage() {
  const total = parseInt(localStorage.getItem('totalMessages') || '0') + 1;
  localStorage.setItem('totalMessages', total.toString());
  return trackActivity(1);
}

export function trackDatePlanned() {
  const total = parseInt(localStorage.getItem('datesPlanned') || '0') + 1;
  localStorage.setItem('datesPlanned', total.toString());
  trackActivity(1);
}

export function trackRehearsal() {
  const total = parseInt(localStorage.getItem('rehearsalSessions') || '0') + 1;
  localStorage.setItem('rehearsalSessions', total.toString());
  trackActivity(1);
}

export function trackTipViewed() {
  const total = parseInt(localStorage.getItem('tipsViewed') || '0') + 1;
  localStorage.setItem('tipsViewed', total.toString());
}

export function trackPhotoFeedback() {
  const total = parseInt(localStorage.getItem('photosFeedback') || '0') + 1;
  localStorage.setItem('photosFeedback', total.toString());
  trackActivity(1);
}

export function trackConversationStarter() {
  const total = parseInt(localStorage.getItem('conversationStartersUsed') || '0') + 1;
  localStorage.setItem('conversationStartersUsed', total.toString());
  trackActivity(1);
}

// Update streak tracking
export function updateStreak() {
  const lastActiveDate = localStorage.getItem('lastActiveDate');
  const today = new Date().toDateString();
  
  if (lastActiveDate !== today) {
    const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    
    // Check if last active was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActiveDate === yesterday.toDateString()) {
      // Continue streak
      localStorage.setItem('currentStreak', (currentStreak + 1).toString());
    } else if (!lastActiveDate) {
      // First day
      localStorage.setItem('currentStreak', '1');
    } else {
      // Streak broken, reset
      localStorage.setItem('currentStreak', '1');
    }
    
    localStorage.setItem('lastActiveDate', today);
  }
}

// Get all stats for profile
export function getAllStats() {
  // Make sure week data is fresh
  initializeActivity();
  updateStreak();
  
  return {
    totalMessages: parseInt(localStorage.getItem('totalMessages') || '0'),
    messagesThisWeek: getWeeklyTotal(),
    datesPlanned: parseInt(localStorage.getItem('datesPlanned') || '0'),
    rehearsalsSessions: parseInt(localStorage.getItem('rehearsalSessions') || '0'),
    tipsViewed: parseInt(localStorage.getItem('tipsViewed') || '0'),
    photosFeedback: parseInt(localStorage.getItem('photosFeedback') || '0'),
    conversationStartersUsed: parseInt(localStorage.getItem('conversationStartersUsed') || '0'),
    currentStreak: parseInt(localStorage.getItem('currentStreak') || '0'),
    level: calculateLevel(parseInt(localStorage.getItem('totalMessages') || '0'))
  };
}

// Calculate user level based on total messages
function calculateLevel(totalMessages) {
  if (totalMessages >= 500) return 10;
  if (totalMessages >= 300) return 8;
  if (totalMessages >= 200) return 6;
  if (totalMessages >= 100) return 4;
  if (totalMessages >= 50) return 3;
  if (totalMessages >= 20) return 2;
  return 1;
}

// Get weekly day labels based on language
export function getWeekDayLabels(language = 'en') {
  if (language === 'sq') {
    return ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'];
  }
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

