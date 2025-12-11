// User model for subscription and usage tracking
// Using in-memory storage for MVP (can be migrated to database later)

// ⚠️ CRITICAL SCREENSHOT LIMITS - DO NOT MODIFY WITHOUT APPROVAL ⚠️
// Free/Guest: 1 LIFETIME screenshot upload
// Paid Plans (Starter/Pro/Elite): 3 screenshots per MONTH
// These limits protect revenue - changing them will cause financial loss!

const SCREENSHOT_LIMITS = {
  FREE_LIFETIME_LIMIT: 1,      // Free users get 1 screenshot TOTAL forever
  PAID_MONTHLY_LIMIT: 3,       // Paid users get 3 screenshots per month
};

class User {
  constructor(userId) {
    this.userId = userId;
    this.subscriptionTier = 'free_trial'; // 'free_trial', 'free', 'starter', 'pro', 'elite'
    this.subscriptionStatus = 'active'; // 'active', 'cancelled', 'expired', 'trial'
    this.subscriptionExpiresAt = null;
    this.stripeCustomerId = null;
    this.stripeSubscriptionId = null;
    this.createdAt = new Date();
    this.lastActiveAt = new Date();
    
    // Free trial tracking
    this.trialStartedAt = new Date();
    this.trialDaysAllowed = 3; // 3-day free trial
    this.trialUsed = true; // Mark trial as used on account creation
    
    // Security tracking
    this.securityStrikes = 0; // Track security violations
    this.isBlocked = false; // Block status
    
    // Device fingerprint for abuse prevention
    this.deviceFingerprint = null;
    this.registrationIP = null;
    
    // Usage tracking (daily reset)
    this.dailyUsage = {
      date: new Date().toDateString(),
      messages: 0,
      imageAnalyses: 0
    };
    
    // ⚠️ CRITICAL: Screenshot limits - DO NOT MODIFY ⚠️
    // FREE USERS: Lifetime limit of 1 screenshot TOTAL
    // PAID USERS: Monthly limit of 3 screenshots (resets each month)
    this.screenshotAnalyses = {
      lifetimeUsed: 0,           // Total screenshots used ever (for free users)
      monthlyUsed: 0,            // Screenshots used this month (for paid users)
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear()
    };
    
    // Monthly usage (for analytics)
    this.monthlyUsage = {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      totalMessages: 0,
      totalImageAnalyses: 0,
      totalCost: 0,
      totalTokens: 0,
      totalOpenAICalls: 0
    };
    
    // Cost tracking
    this.costTracking = {
      totalSpent: 0,
      lastResetDate: new Date().toDateString(),
      dailyCost: 0
    };
    
    // Credits system
    this.credits = 0;
    this.creditHistory = [];
  }
  
  // Check if free trial is still valid (3 days)
  isTrialValid() {
    if (this.subscriptionTier !== 'free_trial') return false;
    const trialEndDate = new Date(this.trialStartedAt);
    trialEndDate.setDate(trialEndDate.getDate() + this.trialDaysAllowed);
    return new Date() < trialEndDate;
  }
  
  // Get trial days remaining
  getTrialDaysRemaining() {
    if (this.subscriptionTier !== 'free_trial') return 0;
    const trialEndDate = new Date(this.trialStartedAt);
    trialEndDate.setDate(trialEndDate.getDate() + this.trialDaysAllowed);
    const remaining = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
  }
  
  // Expire trial and convert to limited free
  expireTrial() {
    if (this.subscriptionTier === 'free_trial') {
      this.subscriptionTier = 'free';
      this.subscriptionStatus = 'expired';
    }
  }
  
  // Calculate cost from token usage (OpenAI pricing: gpt-4o-mini)
  // Input: $0.15 per 1M tokens, Output: $0.60 per 1M tokens
  calculateCost(promptTokens, completionTokens) {
    const inputCost = (promptTokens / 1_000_000) * 0.15;
    const outputCost = (completionTokens / 1_000_000) * 0.60;
    return inputCost + outputCost;
  }
  
  // Record OpenAI usage and cost
  recordOpenAIUsage(promptTokens, completionTokens) {
    const cost = this.calculateCost(promptTokens, completionTokens);
    
    // Update monthly usage
    this.monthlyUsage.totalTokens += (promptTokens + completionTokens);
    this.monthlyUsage.totalCost += cost;
    this.monthlyUsage.totalOpenAICalls += 1;
    
    // Update cost tracking
    const today = new Date().toDateString();
    if (this.costTracking.lastResetDate !== today) {
      this.costTracking.dailyCost = 0;
      this.costTracking.lastResetDate = today;
    }
    this.costTracking.dailyCost += cost;
    this.costTracking.totalSpent += cost;
    
    return cost;
  }
  
  // Get cost statistics
  getCostStats() {
    return {
      totalSpent: this.costTracking.totalSpent,
      dailyCost: this.costTracking.dailyCost,
      monthlyCost: this.monthlyUsage.totalCost,
      averageCostPerMessage: this.monthlyUsage.totalMessages > 0 
        ? this.monthlyUsage.totalCost / this.monthlyUsage.totalMessages 
        : 0,
      totalTokens: this.monthlyUsage.totalTokens,
      totalOpenAICalls: this.monthlyUsage.totalOpenAICalls
    };
  }

  // Check if user can send message
  canSendMessage() {
    // ADMIN BYPASS: Always allow admin users
    if (process.env.ADMIN_MODE === 'true') {
      return true;
    }
    
    // Reset daily usage if new day
    const today = new Date().toDateString();
    if (this.dailyUsage.date !== today) {
      this.dailyUsage = {
        date: today,
        messages: 0,
        imageAnalyses: 0
      };
    }

    const limits = this.getLimits();
    
    // Check subscription limit first
    if (this.dailyUsage.messages < limits.messagesPerDay) {
      return true;
    }
    
    // If subscription limit reached, check credits
    if (this.credits > 0) {
      return true;
    }
    
    // BLOCKED: No subscription limit left AND no credits
    return false;
  }
  
  // Record credit usage (called when using credits)
  recordCreditUsage(amount = 1) {
    if (this.credits >= amount) {
      this.credits -= amount;
      this.creditHistory.push({
        date: new Date(),
        type: 'used',
        amount: amount,
        reason: 'message'
      });
      return true;
    }
    return false;
  }
  
  // Use credits for a message
  useCredits(amount = 1) {
    if (this.credits >= amount) {
      this.credits -= amount;
      this.creditHistory.push({
        date: new Date(),
        type: 'used',
        amount: amount,
        reason: 'message'
      });
      return true;
    }
    return false;
  }
  
  // Add credits
  addCredits(amount, source = 'purchase') {
    this.credits += amount;
    this.creditHistory.push({
      date: new Date(),
      type: 'added',
      amount: amount,
      source: source
    });
  }
  
  // Get credit balance
  getCredits() {
    return {
      balance: this.credits,
      history: this.creditHistory.slice(-10) // Last 10 transactions
    };
  }

  // Check if user can analyze image (general image analysis)
  canAnalyzeImage() {
    const limits = this.getLimits();
    return this.subscriptionTier !== 'free' && this.dailyUsage.imageAnalyses < limits.imageAnalysesPerDay;
  }
  
  // ⚠️ CRITICAL: Check if user can analyze screenshot ⚠️
  // FREE/GUEST: 1 screenshot LIFETIME - NEVER resets
  // PAID (Starter/Pro/Elite): 3 screenshots per MONTH - resets monthly
  canAnalyzeScreenshot() {
    const isPaidUser = ['starter', 'pro', 'elite', 'basic', 'premium'].includes(this.subscriptionTier);
    
    if (isPaidUser) {
      // PAID USERS: Check monthly limit (3 per month)
      this._resetMonthlyScreenshotsIfNeeded();
      return this.screenshotAnalyses.monthlyUsed < SCREENSHOT_LIMITS.PAID_MONTHLY_LIMIT;
    } else {
      // FREE/GUEST/TRIAL USERS: Check lifetime limit (1 total forever)
      return this.screenshotAnalyses.lifetimeUsed < SCREENSHOT_LIMITS.FREE_LIFETIME_LIMIT;
    }
  }
  
  // Reset monthly screenshot count if new month (for paid users only)
  _resetMonthlyScreenshotsIfNeeded() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (this.screenshotAnalyses.currentMonth !== currentMonth || 
        this.screenshotAnalyses.currentYear !== currentYear) {
      this.screenshotAnalyses.monthlyUsed = 0;
      this.screenshotAnalyses.currentMonth = currentMonth;
      this.screenshotAnalyses.currentYear = currentYear;
      console.log(`📅 Monthly screenshot reset for user ${this.userId}`);
    }
  }
  
  // ⚠️ CRITICAL: Record screenshot analysis usage ⚠️
  recordScreenshotAnalysis() {
    const isPaidUser = ['starter', 'pro', 'elite', 'basic', 'premium'].includes(this.subscriptionTier);
    
    // ALWAYS increment lifetime counter (for tracking/analytics)
    this.screenshotAnalyses.lifetimeUsed++;
    
    if (isPaidUser) {
      // Paid users: also increment monthly counter
      this._resetMonthlyScreenshotsIfNeeded();
      this.screenshotAnalyses.monthlyUsed++;
    }
    
    this.lastActiveAt = new Date();
    console.log(`📸 Screenshot recorded: Lifetime=${this.screenshotAnalyses.lifetimeUsed}, Monthly=${this.screenshotAnalyses.monthlyUsed}`);
  }
  
  // ⚠️ Get remaining screenshot analyses ⚠️
  getRemainingScreenshotAnalyses() {
    const isPaidUser = ['starter', 'pro', 'elite', 'basic', 'premium'].includes(this.subscriptionTier);
    
    if (isPaidUser) {
      this._resetMonthlyScreenshotsIfNeeded();
      return Math.max(0, SCREENSHOT_LIMITS.PAID_MONTHLY_LIMIT - this.screenshotAnalyses.monthlyUsed);
    } else {
      return Math.max(0, SCREENSHOT_LIMITS.FREE_LIFETIME_LIMIT - this.screenshotAnalyses.lifetimeUsed);
    }
  }
  
  // Get screenshot limit for current plan
  getScreenshotLimit() {
    const isPaidUser = ['starter', 'pro', 'elite', 'basic', 'premium'].includes(this.subscriptionTier);
    return isPaidUser ? SCREENSHOT_LIMITS.PAID_MONTHLY_LIMIT : SCREENSHOT_LIMITS.FREE_LIFETIME_LIMIT;
  }
  
  // Get screenshot usage for current plan
  getScreenshotUsed() {
    const isPaidUser = ['starter', 'pro', 'elite', 'basic', 'premium'].includes(this.subscriptionTier);
    if (isPaidUser) {
      this._resetMonthlyScreenshotsIfNeeded();
      return this.screenshotAnalyses.monthlyUsed;
    }
    return this.screenshotAnalyses.lifetimeUsed;
  }

  // Get subscription limits (NEW PRICING - €6.99/€12.99/€19.99)
  getLimits() {
    // Check if trial has expired
    if (this.subscriptionTier === 'free_trial' && !this.isTrialValid()) {
      this.expireTrial();
    }
    
    switch (this.subscriptionTier) {
      case 'free_trial':
        // 3-day free trial: 10 messages/day, no adult content
        return {
          messagesPerDay: 10,
          imageAnalysesPerDay: 0,
          screenshotsPerMonth: SCREENSHOT_LIMITS.FREE_LIFETIME_LIMIT,
          adultContent: false,
          isTrial: true,
          trialDaysRemaining: this.getTrialDaysRemaining()
        };
      case 'free':
        // After trial expires: very limited (encourages upgrade)
        return {
          messagesPerDay: 3, // Very limited to encourage upgrade
          imageAnalysesPerDay: 0,
          screenshotsPerMonth: SCREENSHOT_LIMITS.FREE_LIFETIME_LIMIT,
          adultContent: false,
          isTrial: false
        };
      case 'starter':
        // €6.99/month - Entry tier
        return {
          messagesPerDay: 75,
          imageAnalysesPerDay: 0,
          screenshotsPerMonth: SCREENSHOT_LIMITS.PAID_MONTHLY_LIMIT,
          adultContent: true,
          isTrial: false
        };
      case 'pro':
        // €12.99/month - Most Popular
        return {
          messagesPerDay: 200,
          imageAnalysesPerDay: 30,
          screenshotsPerMonth: SCREENSHOT_LIMITS.PAID_MONTHLY_LIMIT,
          adultContent: true,
          isTrial: false
        };
      case 'elite':
        // €19.99/month - Premium tier
        return {
          messagesPerDay: 500,
          imageAnalysesPerDay: 100,
          screenshotsPerMonth: SCREENSHOT_LIMITS.PAID_MONTHLY_LIMIT,
          adultContent: true,
          isTrial: false
        };
      // Legacy tiers (for existing users)
      case 'basic':
        return {
          messagesPerDay: 75, // Map to starter limits
          imageAnalysesPerDay: 0,
          screenshotsPerMonth: SCREENSHOT_LIMITS.PAID_MONTHLY_LIMIT,
          adultContent: true,
          isTrial: false
        };
      case 'premium':
        return {
          messagesPerDay: 500, // Map to elite limits
          imageAnalysesPerDay: 100,
          screenshotsPerMonth: SCREENSHOT_LIMITS.PAID_MONTHLY_LIMIT,
          adultContent: true,
          isTrial: false
        };
      default:
        return {
          messagesPerDay: 3,
          imageAnalysesPerDay: 0,
          screenshotsPerMonth: SCREENSHOT_LIMITS.FREE_LIFETIME_LIMIT,
          adultContent: false,
          isTrial: false
        };
    }
  }

  // Record message usage
  recordMessage() {
    const today = new Date().toDateString();
    if (this.dailyUsage.date !== today) {
      this.dailyUsage = {
        date: today,
        messages: 0,
        imageAnalyses: 0
      };
    }
    
    this.dailyUsage.messages++;
    this.monthlyUsage.totalMessages++;
    this.lastActiveAt = new Date();
  }

  // Record image analysis usage
  recordImageAnalysis() {
    const today = new Date().toDateString();
    if (this.dailyUsage.date !== today) {
      this.dailyUsage = {
        date: today,
        messages: 0,
        imageAnalyses: 0
      };
    }
    
    this.dailyUsage.imageAnalyses++;
    this.monthlyUsage.totalImageAnalyses++;
    this.lastActiveAt = new Date();
  }

  // Record cost
  recordCost(amount) {
    this.monthlyUsage.totalCost += amount;
  }

  // Upgrade subscription
  upgradeTo(tier, stripeCustomerId = null, stripeSubscriptionId = null, expiresAt = null) {
    this.subscriptionTier = tier;
    this.subscriptionStatus = 'active';
    this.stripeCustomerId = stripeCustomerId;
    this.stripeSubscriptionId = stripeSubscriptionId;
    this.subscriptionExpiresAt = expiresAt;
    
    // Reset monthly screenshot counter on upgrade
    this.screenshotAnalyses.monthlyUsed = 0;
    this.screenshotAnalyses.currentMonth = new Date().getMonth();
    this.screenshotAnalyses.currentYear = new Date().getFullYear();
  }

  // Cancel subscription
  cancelSubscription() {
    this.subscriptionStatus = 'cancelled';
    // Keep access until expiration date
  }

  // Check if subscription is active
  isSubscriptionActive() {
    if (this.subscriptionTier === 'free') return true;
    if (this.subscriptionStatus !== 'active') return false;
    if (this.subscriptionExpiresAt && new Date() > this.subscriptionExpiresAt) {
      this.subscriptionStatus = 'expired';
      this.subscriptionTier = 'free';
      return false;
    }
    return true;
  }

  // Get usage stats (includes accurate screenshot tracking)
  getUsageStats() {
    const limits = this.getLimits();
    const isPaidUser = ['starter', 'pro', 'elite', 'basic', 'premium'].includes(this.subscriptionTier);
    
    // Ensure monthly reset is checked
    if (isPaidUser) {
      this._resetMonthlyScreenshotsIfNeeded();
    }
    
    return {
      tier: this.subscriptionTier,
      status: this.subscriptionStatus,
      credits: this.credits,
      dailyUsage: {
        messages: this.dailyUsage.messages,
        messagesLimit: limits.messagesPerDay,
        imageAnalyses: this.dailyUsage.imageAnalyses,
        imageAnalysesLimit: limits.imageAnalysesPerDay,
        remainingMessages: Math.max(0, limits.messagesPerDay - this.dailyUsage.messages)
      },
      // ⚠️ CRITICAL: Accurate screenshot tracking ⚠️
      screenshotAnalyses: {
        used: this.getScreenshotUsed(),
        limit: this.getScreenshotLimit(),
        remaining: this.getRemainingScreenshotAnalyses(),
        canAnalyze: this.canAnalyzeScreenshot(),
        isPaidUser: isPaidUser,
        resetsMonthly: isPaidUser,
        lifetimeUsed: this.screenshotAnalyses.lifetimeUsed
      },
      monthlyUsage: {
        totalMessages: this.monthlyUsage.totalMessages,
        totalImageAnalyses: this.monthlyUsage.totalImageAnalyses,
        totalCost: this.monthlyUsage.totalCost
      },
      expiresAt: this.subscriptionExpiresAt,
      canSendMessage: this.canSendMessage()
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      userId: this.userId,
      subscriptionTier: this.subscriptionTier,
      subscriptionStatus: this.subscriptionStatus,
      subscriptionExpiresAt: this.subscriptionExpiresAt,
      createdAt: this.createdAt,
      lastActiveAt: this.lastActiveAt,
      dailyUsage: this.dailyUsage,
      monthlyUsage: this.monthlyUsage,
      screenshotAnalyses: this.screenshotAnalyses
    };
  }
}

// In-memory user store (replace with database in production)
const users = new Map();

// Get or create user (async version with MongoDB sync)
async function getUserAsync(userId, mongoUser = null) {
  if (!users.has(userId)) {
    const user = new User(userId);
    
    // Sync tier from MongoDB if available
    if (mongoUser) {
      if (mongoUser.subscriptionTier) {
        user.subscriptionTier = mongoUser.subscriptionTier;
      }
      if (mongoUser.subscriptionStatus) {
        user.subscriptionStatus = mongoUser.subscriptionStatus;
      }
      if (mongoUser.subscriptionExpiresAt) {
        user.subscriptionExpiresAt = new Date(mongoUser.subscriptionExpiresAt);
      }
      if (mongoUser.stripeCustomerId) {
        user.stripeCustomerId = mongoUser.stripeCustomerId;
      }
      if (mongoUser.stripeSubscriptionId) {
        user.stripeSubscriptionId = mongoUser.stripeSubscriptionId;
      }
    }
    
    users.set(userId, user);
  }
  return users.get(userId);
}

// Get or create user (sync version - maintains compatibility)
function getUser(userId) {
  if (!users.has(userId)) {
    users.set(userId, new User(userId));
  }
  return users.get(userId);
}

// Save user (for persistence - implement database save here)
function saveUser(user) {
  users.set(user.userId, user);
  // TODO: Save to database
}

// Export users map for admin access
function getAllUsers() {
  return users;
}

export { User, getUser, getUserAsync, saveUser, getAllUsers, SCREENSHOT_LIMITS };
