/**
 * Profile Memory System
 * 
 * Stores and retrieves user preferences for personalized advice.
 * Uses localStorage with prefixed keys for isolation.
 */

const STORAGE_PREFIX = 'copilot_profile_';

/**
 * Returns the default profile structure
 */
export function defaultProfile() {
  return {
    communicationStyle: 'Playful', // "Direct" | "Playful" | "Calm" | "Romantic"
    datingGoal: 'Unsure',          // "Casual" | "Serious" | "Unsure"
    boundaries: '',                 // Free text for personal boundaries
    lastUpdated: null
  };
}

/**
 * Retrieves the current profile from localStorage
 * Returns default profile if none exists
 */
export function getProfile() {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}data`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return {
        ...defaultProfile(),
        ...parsed
      };
    }
  } catch (error) {
    console.error('Error reading profile from localStorage:', error);
  }
  return defaultProfile();
}

/**
 * Saves the profile to localStorage
 * @param {Object} profile - The profile object to save
 * @returns {boolean} - Whether the save was successful
 */
export function saveProfile(profile) {
  try {
    const toSave = {
      ...profile,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`${STORAGE_PREFIX}data`, JSON.stringify(toSave));
    return true;
  } catch (error) {
    console.error('Error saving profile to localStorage:', error);
    return false;
  }
}

/**
 * Clears the stored profile
 */
export function clearProfile() {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}data`);
    return true;
  } catch (error) {
    console.error('Error clearing profile:', error);
    return false;
  }
}

/**
 * Gets a human-readable summary of the profile
 */
export function getProfileSummary() {
  const profile = getProfile();
  return {
    style: profile.communicationStyle,
    goal: profile.datingGoal,
    hasBoundaries: !!profile.boundaries?.trim()
  };
}
