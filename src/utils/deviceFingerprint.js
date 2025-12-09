// Device fingerprinting for guest mode abuse prevention
// Creates a unique device identifier that persists across sessions

// Generate a hash from a string
const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Collect browser/device properties for fingerprinting
const collectFingerprint = () => {
  const properties = [];
  
  // Screen properties
  properties.push(`screen:${screen.width}x${screen.height}x${screen.colorDepth}`);
  properties.push(`avail:${screen.availWidth}x${screen.availHeight}`);
  
  // Timezone
  properties.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  properties.push(`tzOffset:${new Date().getTimezoneOffset()}`);
  
  // Language
  properties.push(`lang:${navigator.language}`);
  properties.push(`langs:${navigator.languages?.join(',') || ''}`);
  
  // Platform
  properties.push(`platform:${navigator.platform}`);
  properties.push(`vendor:${navigator.vendor}`);
  
  // Hardware concurrency (CPU cores)
  properties.push(`cores:${navigator.hardwareConcurrency || 0}`);
  
  // Device memory (if available)
  properties.push(`mem:${navigator.deviceMemory || 0}`);
  
  // Touch support
  properties.push(`touch:${navigator.maxTouchPoints || 0}`);
  
  // Canvas fingerprint (simplified)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Biseda.ai', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Biseda.ai', 4, 17);
    properties.push(`canvas:${canvas.toDataURL().slice(-50)}`);
  } catch (e) {
    properties.push('canvas:none');
  }
  
  // WebGL renderer (if available)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        properties.push(`gpu:${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`);
      }
    }
  } catch (e) {
    properties.push('gpu:none');
  }
  
  return properties.join('|');
};

// Generate device fingerprint
export const getDeviceFingerprint = async () => {
  // Check if we already have a stored fingerprint
  let storedFingerprint = null;
  
  // Try multiple storage locations
  try {
    storedFingerprint = localStorage.getItem('_dfp');
  } catch (e) {}
  
  if (!storedFingerprint) {
    try {
      storedFingerprint = sessionStorage.getItem('_dfp');
    } catch (e) {}
  }
  
  // Try IndexedDB
  if (!storedFingerprint) {
    try {
      storedFingerprint = await getFromIndexedDB('_dfp');
    } catch (e) {}
  }
  
  if (storedFingerprint) {
    return storedFingerprint;
  }
  
  // Generate new fingerprint
  const rawFingerprint = collectFingerprint();
  const fingerprint = await hashString(rawFingerprint);
  
  // Store in multiple places for persistence
  try {
    localStorage.setItem('_dfp', fingerprint);
  } catch (e) {}
  
  try {
    sessionStorage.setItem('_dfp', fingerprint);
  } catch (e) {}
  
  try {
    await saveToIndexedDB('_dfp', fingerprint);
  } catch (e) {}
  
  return fingerprint;
};

// IndexedDB helpers for more persistent storage
const DB_NAME = 'BisedaAI';
const STORE_NAME = 'fingerprint';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

const saveToIndexedDB = async (key, value) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, value });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.log('IndexedDB not available');
  }
};

const getFromIndexedDB = async (key) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return null;
  }
};

// Guest usage tracking
const GUEST_USAGE_KEY = '_guestUsage';
const MAX_GUEST_MESSAGES = 5; // Limit for free guest messages - keeps cost low while showing value

export const getGuestUsage = async () => {
  const fingerprint = await getDeviceFingerprint();
  
  // Try to get usage from multiple sources
  let usage = null;
  
  try {
    const stored = localStorage.getItem(`${GUEST_USAGE_KEY}_${fingerprint}`);
    if (stored) usage = JSON.parse(stored);
  } catch (e) {}
  
  if (!usage) {
    try {
      const stored = await getFromIndexedDB(`${GUEST_USAGE_KEY}_${fingerprint}`);
      if (stored) usage = JSON.parse(stored);
    } catch (e) {}
  }
  
  return usage || {
    fingerprint,
    messageCount: 0,
    firstUsed: Date.now(),
    lastUsed: Date.now(),
    limitReached: false
  };
};

export const incrementGuestUsage = async () => {
  const fingerprint = await getDeviceFingerprint();
  const usage = await getGuestUsage();
  
  usage.messageCount++;
  usage.lastUsed = Date.now();
  
  if (usage.messageCount >= MAX_GUEST_MESSAGES) {
    usage.limitReached = true;
  }
  
  const usageStr = JSON.stringify(usage);
  
  // Save to multiple locations
  try {
    localStorage.setItem(`${GUEST_USAGE_KEY}_${fingerprint}`, usageStr);
  } catch (e) {}
  
  try {
    await saveToIndexedDB(`${GUEST_USAGE_KEY}_${fingerprint}`, usageStr);
  } catch (e) {}
  
  return usage;
};

export const isGuestLimitReached = async () => {
  const usage = await getGuestUsage();
  return usage.limitReached || usage.messageCount >= MAX_GUEST_MESSAGES;
};

export const getGuestMessagesRemaining = async () => {
  const usage = await getGuestUsage();
  return Math.max(0, MAX_GUEST_MESSAGES - usage.messageCount);
};

export const MAX_FREE_MESSAGES = MAX_GUEST_MESSAGES;

