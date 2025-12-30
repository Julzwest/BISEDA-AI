/**
 * Device Fingerprinting & Fraud Prevention
 * Prevents users from creating multiple accounts for free trials
 */

// List of known disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org',
  '10minutemail.com', '10minutemail.net', 'mailinator.com', 'maildrop.cc',
  'throwaway.email', 'fakeinbox.com', 'tempail.com', 'dispostable.com',
  'getnada.com', 'yopmail.com', 'sharklasers.com', 'spam4.me',
  'trashmail.com', 'mailnesia.com', 'tempmailaddress.com', 'throwawaymail.com',
  'fakemailgenerator.com', 'emailondeck.com', 'mohmal.com', 'tempinbox.com',
  'burnermail.io', 'mailsac.com', 'inboxkitten.com', 'tempsky.com',
  'mytrashmail.com', 'mt2009.com', 'thankyou2010.com', 'trash2009.com',
  'mt2014.com', 'tempmailo.com', 'tempr.email', 'discard.email',
  'discardmail.com', 'spamgourmet.com', 'mytempemail.com', 'meltmail.com',
  'instantemailaddress.com', 'emailtemporanea.com', 'emailtemporanea.net',
  'mailcatch.com', 'mailforspam.com', 'mintemail.com', 'spamavert.com',
  'spambox.us', 'spamex.com', 'spamfree24.org', 'spamspot.com',
  'tempomail.fr', 'temporaryemail.net', 'temporaryforwarding.com',
  'throwawayemailaddress.com', 'wegwerfmail.de', 'wegwerfmail.net',
  'wegwerfmail.org', 'wh4f.org', 'mailnull.com', 'e4ward.com',
  'spammotel.com', 'kasmail.com', 'spamcowboy.com', 'trashymail.com',
  'mailexpire.com', 'mailzilla.com', 'airmail.cc', 'tempm.com',
  'tmpmail.org', 'tmpmail.net', 'boun.cr', 'getairmail.com'
];

/**
 * Check if an email is from a disposable domain
 */
export function isDisposableEmail(email) {
  if (!email) return false;
  
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  // Check against known disposable domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return true;
  }
  
  // Check for common patterns in disposable emails
  const suspiciousPatterns = [
    /^temp/i, /^trash/i, /^spam/i, /^fake/i, /^throw/i,
    /^disposable/i, /^burner/i, /^mailinator/i, /^guerrilla/i,
    /10min/i, /minute/i, /wegwerf/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(domain)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate a unique device fingerprint
 * This creates a hash based on browser/device characteristics
 */
export function generateDeviceFingerprint() {
  const components = [];
  
  // Screen properties
  components.push(window.screen.width);
  components.push(window.screen.height);
  components.push(window.screen.colorDepth);
  components.push(window.screen.pixelDepth);
  
  // Navigator properties
  components.push(navigator.userAgent);
  components.push(navigator.language);
  components.push(navigator.languages?.join(',') || '');
  components.push(navigator.platform);
  components.push(navigator.hardwareConcurrency || 0);
  components.push(navigator.deviceMemory || 0);
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  components.push(new Date().getTimezoneOffset());
  
  // Canvas fingerprint (basic)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Biseda.ai fingerprint', 2, 2);
    components.push(canvas.toDataURL().slice(-50));
  } catch (e) {
    components.push('canvas-unavailable');
  }
  
  // WebGL renderer (helps identify GPU)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    components.push('webgl-unavailable');
  }
  
  // Create hash from components
  const fingerprint = components.join('|||');
  return hashString(fingerprint);
}

/**
 * Simple hash function for fingerprint
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Get or create device ID
 * Stored in localStorage but also in a hidden way
 */
export function getDeviceId() {
  // Try to get existing device ID
  let deviceId = localStorage.getItem('_did');
  
  // Also check sessionStorage and a cookie-like approach
  if (!deviceId) {
    deviceId = sessionStorage.getItem('_did');
  }
  
  // Generate new if not found
  if (!deviceId) {
    const fingerprint = generateDeviceFingerprint();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    deviceId = `${fingerprint}-${timestamp}-${random}`;
    
    // Store in multiple places for persistence
    localStorage.setItem('_did', deviceId);
    sessionStorage.setItem('_did', deviceId);
  }
  
  return deviceId;
}

/**
 * Check if this device has already used a trial
 * Call this before allowing new account creation
 */
export async function hasDeviceUsedTrial(backendUrl) {
  const deviceId = getDeviceId();
  
  try {
    const response = await fetch(`${backendUrl}/api/check-device-trial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.hasUsedTrial || false;
    }
  } catch (error) {
    console.error('Error checking device trial:', error);
  }
  
  return false;
}

/**
 * Register device as having used trial
 */
export async function registerDeviceTrial(backendUrl) {
  const deviceId = getDeviceId();
  
  try {
    await fetch(`${backendUrl}/api/register-device-trial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    });
  } catch (error) {
    console.error('Error registering device trial:', error);
  }
}

/**
 * Get client IP (for additional tracking)
 */
export async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return null;
  }
}
