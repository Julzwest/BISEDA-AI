/**
 * API Retry Utility
 * Provides robust retry logic for API calls with exponential backoff
 */

// Default retry configuration
const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  onRetry: null // Callback function (attempt, error, delay) => void
};

/**
 * Sleep for a specified duration
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay with jitter
 */
const calculateDelay = (attempt, config) => {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffFactor, attempt),
    config.maxDelay
  );
  // Add jitter (±20% randomization) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
};

/**
 * Check if an error is retryable
 */
const isRetryableError = (error, config) => {
  // Network errors are retryable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Check if status code is in retryable list
  if (error.status && config.retryableStatusCodes.includes(error.status)) {
    return true;
  }
  
  // Timeout errors are retryable
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return true;
  }
  
  return false;
};

/**
 * Retry wrapper for async functions
 * @param {Function} fn - Async function to retry
 * @param {Object} config - Retry configuration
 * @returns {Promise} - Result of the function
 */
export async function withRetry(fn, customConfig = {}) {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  let lastError;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if we've exhausted attempts
      if (attempt >= config.maxRetries) {
        break;
      }
      
      // Don't retry non-retryable errors
      if (!isRetryableError(error, config)) {
        break;
      }
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, config);
      
      // Call retry callback if provided
      if (config.onRetry) {
        config.onRetry(attempt + 1, error, delay);
      }
      
      console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Retry wrapper for fetch requests with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryConfig - Retry configuration
 * @returns {Promise<Response>} - Fetch response
 */
export async function fetchWithRetry(url, options = {}, retryConfig = {}) {
  const timeout = options.timeout || 30000; // 30 second default timeout
  
  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      // Throw for non-OK responses to trigger retry
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }
      
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }, retryConfig);
}

/**
 * Create a rate-limited fetch wrapper
 * @param {number} requestsPerSecond - Maximum requests per second
 * @returns {Function} - Rate-limited fetch function
 */
export function createRateLimitedFetch(requestsPerSecond = 5) {
  const minInterval = 1000 / requestsPerSecond;
  let lastRequest = 0;
  
  return async (url, options = {}) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < minInterval) {
      await sleep(minInterval - timeSinceLastRequest);
    }
    
    lastRequest = Date.now();
    return fetchWithRetry(url, options);
  };
}

/**
 * Circuit breaker pattern for API calls
 * Prevents cascading failures by temporarily blocking calls after repeated failures
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.lastFailure = null;
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      // Check if enough time has passed to try again
      if (Date.now() - this.lastFailure >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN. Request blocked.');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`Circuit breaker OPENED after ${this.failures} failures`);
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailure
    };
  }
}

export default { withRetry, fetchWithRetry, createRateLimitedFetch, CircuitBreaker };

