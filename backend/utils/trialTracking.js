// Trial tracking for abuse prevention
// Tracks emails, device fingerprints, and IPs to prevent trial abuse

// In-memory storage (replace with database in production)
const trialRecords = new Map();

/**
 * Record a new trial registration
 * @param {string} email - User's email
 * @param {string} deviceFingerprint - Device fingerprint
 * @param {string} ipAddress - Registration IP address
 */
export function recordTrialRegistration(email, deviceFingerprint, ipAddress) {
  const record = {
    email: email.toLowerCase(),
    deviceFingerprint,
    ipAddress,
    registeredAt: new Date(),
  };
  
  // Store by email (primary key)
  trialRecords.set(email.toLowerCase(), record);
  
  // Also index by fingerprint for quick lookups
  trialRecords.set(`fp_${deviceFingerprint}`, record);
  
  console.log(`📝 Trial registered: ${email} | Device: ${deviceFingerprint?.slice(0, 8)}... | IP: ${ipAddress}`);
}

/**
 * Check if a trial can be started (not already used)
 * @param {string} email - User's email
 * @param {string} deviceFingerprint - Device fingerprint
 * @param {string} ipAddress - Registration IP address
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canStartTrial(email, deviceFingerprint, ipAddress) {
  const normalizedEmail = email.toLowerCase();
  
  // Check 1: Email already used for trial?
  if (trialRecords.has(normalizedEmail)) {
    console.log(`🚫 Trial blocked: Email already used - ${normalizedEmail}`);
    return { 
      allowed: false, 
      reason: 'EMAIL_ALREADY_USED',
      message: 'Ky email është përdorur tashmë për provë falas. Ju lutem përdorni një email tjetër ose blini një abonim.'
    };
  }
  
  // Check 2: Device fingerprint already used?
  if (deviceFingerprint && trialRecords.has(`fp_${deviceFingerprint}`)) {
    const existingRecord = trialRecords.get(`fp_${deviceFingerprint}`);
    console.log(`🚫 Trial blocked: Device already used - ${deviceFingerprint.slice(0, 8)}... (registered as ${existingRecord.email})`);
    return { 
      allowed: false, 
      reason: 'DEVICE_ALREADY_USED',
      message: 'Kjo pajisje është përdorur tashmë për provë falas. Ju lutem blini një abonim për të vazhduar.'
    };
  }
  
  // Check 3: Too many trials from same IP (max 3 per IP)
  if (ipAddress) {
    let ipTrialCount = 0;
    for (const [key, record] of trialRecords) {
      if (!key.startsWith('fp_') && record.ipAddress === ipAddress) {
        ipTrialCount++;
      }
    }
    if (ipTrialCount >= 3) {
      console.log(`🚫 Trial blocked: Too many trials from IP - ${ipAddress} (${ipTrialCount} trials)`);
      return { 
        allowed: false, 
        reason: 'TOO_MANY_TRIALS_FROM_IP',
        message: 'Shumë llogari janë krijuar nga kjo adresë IP. Ju lutem blini një abonim.'
      };
    }
  }
  
  // All checks passed
  return { allowed: true };
}

/**
 * Check if an email has already used a trial
 * @param {string} email - User's email
 * @returns {boolean}
 */
export function hasUsedTrial(email) {
  return trialRecords.has(email.toLowerCase());
}

/**
 * Check if a device fingerprint has already used a trial
 * @param {string} deviceFingerprint - Device fingerprint
 * @returns {boolean}
 */
export function hasDeviceUsedTrial(deviceFingerprint) {
  return deviceFingerprint && trialRecords.has(`fp_${deviceFingerprint}`);
}

/**
 * Get trial statistics
 * @returns {{ totalTrials: number, uniqueEmails: number, uniqueDevices: number }}
 */
export function getTrialStats() {
  let uniqueEmails = 0;
  let uniqueDevices = 0;
  
  for (const [key] of trialRecords) {
    if (key.startsWith('fp_')) {
      uniqueDevices++;
    } else {
      uniqueEmails++;
    }
  }
  
  return {
    totalTrials: uniqueEmails,
    uniqueEmails,
    uniqueDevices
  };
}

/**
 * Clear all trial records (for testing only)
 */
export function clearTrialRecords() {
  trialRecords.clear();
  console.log('🗑️ Trial records cleared');
}

export { trialRecords };

