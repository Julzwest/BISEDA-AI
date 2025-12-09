// User model for subscription and usage tracking
// Using in-memory storage for MVP (can be migrated to database later)

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
    
    // Screenshot analysis (lifetime limit for free users)
    this.screenshotAnalyses = {
      totalUsed: 0,
      freeLimit: 2 // 2 free analyses, then upgrade required
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

  // Check if user can analyze image
  canAnalyzeImage() {
    const limits = this.getLimits();
    return this.subscriptionTier !== 'free' && this.dailyUsage.imageAnalyses < limits.imageAnalysesPerDay;
  }
  
  // Check if user can analyze screenshot (2 free for free users)
  canAnalyzeScreenshot() {
    // Paid users have unlimited screenshot analyses
    if (this.subscriptionTier !== 'free') {
      return true;
    }
    // Free users get 2 lifetime analyses
    return this.screenshotAnalyses.totalUsed < this.screenshotAnalyses.freeLimit;
  }
  
  // Record screenshot analysis usage
  recordScreenshotAnalysis() {
    this.screenshotAnalyses.totalUsed++;
    this.lastActiveAt = new Date();
  }
  
  // Get remaining free screenshot analyses
  getRemainingScreenshotAnalyses() {
    if (this.subscriptionTier !== 'free') {
      return -1; // Unlimited
    }
    return Math.max(0, this.screenshotAnalyses.freeLimit - this.screenshotAnalyses.totalUsed);
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
          adultContent: false,
          isTrial: true,
          trialDaysRemaining: this.getTrialDaysRemaining()
        };
      case 'free':
        // After trial expires: very limited (encourages upgrade)
        return {
          messagesPerDay: 3, // Very limited to encourage upgrade
          imageAnalysesPerDay: 0,
          adultContent: false,
          isTrial: false
        };
      case 'starter':
        // €6.99/month - Entry tier
        return {
          messagesPerDay: 75,
          imageAnalysesPerDay: 0,
          adultContent: true,
          isTrial: false
        };
      case 'pro':
        // €12.99/month - Most Popular
        return {
          messagesPerDay: 200,
          imageAnalysesPerDay: 30,
          adultContent: true,
          isTrial: false
        };
      case 'elite':
        // €19.99/month - Premium tier
        return {
          messagesPerDay: 500,
          imageAnalysesPerDay: 100,
          adultContent: true,
          isTrial: false
        };
      // Legacy tiers (for existing users)
      case 'basic':
        return {
          messagesPerDay: 75, // Map to starter limits
          imageAnalysesPerDay: 0,
          adultContent: true,
          isTrial: false
        };
      case 'premium':
        return {
          messagesPerDay: 500, // Map to elite limits
          imageAnalysesPerDay: 100,
          adultContent: true,
          isTrial: false
        };
      default:
        return {
          messagesPerDay: 3,
          imageAnalysesPerDay: 0,
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

  // Get usage stats
  getUsageStats() {
    const limits = this.getLimits();
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
      screenshotAnalyses: {
        used: this.screenshotAnalyses.totalUsed,
        freeLimit: this.screenshotAnalyses.freeLimit,
        remaining: this.getRemainingScreenshotAnalyses(),
        canAnalyze: this.canAnalyzeScreenshot()
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
      monthlyUsage: this.monthlyUsage
    };
  }
}

// In-memory user store (replace with database in production)
const users = new Map();

// Get or create user
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

export { User, getUser, saveUser, getAllUsers };

