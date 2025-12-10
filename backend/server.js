// Backend API server for BISEDA.AI
// Securely handles OpenAI API calls

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { getUser, saveUser, getAllUsers } from './models/User.js';

// ⚠️ RATE LIMITING - Protect against API abuse
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = {
  free_trial: 15,    // 15 requests per minute
  free: 5,           // 5 requests per minute (encourages upgrade)
  starter: 20,       // 20 requests per minute
  pro: 40,           // 40 requests per minute
  elite: 60          // 60 requests per minute
};

function checkRateLimit(userId, tier) {
  const now = Date.now();
  const key = userId;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS[tier] - 1 };
  }
  
  const data = rateLimitStore.get(key);
  
  // Reset window if expired
  if (now - data.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS[tier] - 1 };
  }
  
  const maxRequests = RATE_LIMIT_MAX_REQUESTS[tier] || RATE_LIMIT_MAX_REQUESTS.free;
  
  if (data.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - data.windowStart)) / 1000)
    };
  }
  
  data.count++;
  return { allowed: true, remaining: maxRequests - data.count };
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Rate limit middleware for routes
const rateLimit = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.ip || 'anonymous';
  const tier = 'free_trial'; // Default tier for simple endpoints
  
  const rateCheck = checkRateLimit(userId, tier);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: rateCheck.retryAfter
    });
  }
  next();
};
import stripeRoutes from './routes/stripe.js';
import businessRoutes from './routes/businesses.js';
import creditRoutes from './routes/credits.js';
import { searchPlaces } from './utils/googlePlaces.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (check both backend/.env and root .env)
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '../.env') }); // Also check root

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://thehiddenclinic_db_user:Biseda2024Atlas@biseda-cluster.litn98m.mongodb.net/biseda?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// MongoDB User Schema
const userAccountSchema = new mongoose.Schema({
  odId: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female', null], default: null },
  birthDate: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  phoneNumber: { type: String },
  country: { type: String, default: 'AL' },
  appleId: { type: String, sparse: true, unique: true },
  googleId: { type: String, sparse: true, unique: true },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  // Subscription fields (persisted to MongoDB)
  subscriptionTier: { type: String, enum: ['free', 'free_trial', 'starter', 'pro', 'elite', 'premium'], default: 'free_trial' },
  subscriptionStatus: { type: String, enum: ['active', 'cancelled', 'expired', 'trial', 'none'], default: 'trial' },
  subscriptionExpiresAt: { type: Date, default: null },
  credits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const UserAccountModel = mongoose.model('UserAccount', userAccountSchema);

// Conversation Schema - Store chat history for admin viewing
const conversationSchema = new mongoose.Schema({
  odId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    hasImages: { type: Boolean, default: false }
  }],
  startedAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now },
  messageCount: { type: Number, default: 0 },
  topic: { type: String, default: 'General' } // Auto-detected topic
});

conversationSchema.index({ odId: 1, lastMessageAt: -1 });
const ConversationModel = mongoose.model('Conversation', conversationSchema);

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://bisedaai.com',
    'http://bisedaai.com',
    'https://www.bisedaai.com',
    'http://www.bisedaai.com',
    'https://julzwest.github.io',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-session-id']
}));
app.use(express.json({ limit: '10mb' }));

// Note: Tier-based rate limiting is implemented above via checkRateLimit() function
// Applied in the chat/openai endpoint for subscription-aware limiting

// Stripe routes
app.use('/api/stripe', stripeRoutes);

// Business routes
app.use('/api/businesses', businessRoutes);

// Credits routes
app.use('/api/credits', creditRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Google Places search endpoint
app.post('/api/places/search', rateLimit, async (req, res) => {
  try {
    const { query, location, category } = req.body;
    
    if (!query || !location) {
      return res.status(400).json({ error: 'Query and location are required' });
    }
    
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!googleApiKey || googleApiKey.trim() === '') {
      console.log('⚠️ Google Places API key not configured, falling back to AI');
      return res.json({ 
        places: [],
        source: 'fallback',
        message: 'Google Places API not configured'
      });
    }
    
    // Build search query based on category
    const categoryQueries = {
      'restaurants': 'restaurants',
      'cafes': 'cafes coffee shops',
      'bars': 'bars nightlife',
      'cinema': 'movie theaters cinemas',
      'music': 'live music venues',
      'activities': 'entertainment activities bowling escape rooms',
      'culture': 'museums art galleries',
      'nature': 'parks nature'
    };
    
    const searchQuery = categoryQueries[category] || query;
    
    console.log(`🔍 Searching Google Places: ${searchQuery} in ${location}`);
    
    const places = await searchPlaces(searchQuery, location, googleApiKey);
    
    res.json({
      places: places,
      source: 'google-places',
      count: places.length
    });
    
  } catch (error) {
    console.error('❌ Places search error:', error);
    res.status(500).json({ 
      error: 'Failed to search places',
      message: error.message,
      source: 'error'
    });
  }
});

// Get user usage stats
app.get('/api/usage', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = getUser(userId);
    
    // Sync subscription tier from MongoDB (source of truth)
    // This ensures admin changes are reflected immediately
    try {
      const mongoUser = await UserAccountModel.findOne({ odId: userId });
      if (mongoUser && mongoUser.subscriptionTier) {
        if (user.subscriptionTier !== mongoUser.subscriptionTier) {
          console.log(`🔄 Syncing tier from MongoDB: ${user.subscriptionTier} -> ${mongoUser.subscriptionTier} for user ${userId}`);
          user.subscriptionTier = mongoUser.subscriptionTier;
          user.subscriptionStatus = mongoUser.subscriptionStatus || 'active';
          user.subscriptionExpiresAt = mongoUser.subscriptionExpiresAt;
          user.credits = mongoUser.credits || user.credits || 0;
          saveUser(user);
        }
      }
    } catch (dbError) {
      console.log('Could not sync with MongoDB:', dbError.message);
      // Continue with in-memory data
    }
    
    res.json(user.getUsageStats());
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

// Get subscription info
app.get('/api/subscription', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = getUser(userId);
    
    // Sync subscription tier from MongoDB (source of truth)
    try {
      const mongoUser = await UserAccountModel.findOne({ odId: userId });
      if (mongoUser && mongoUser.subscriptionTier) {
        if (user.subscriptionTier !== mongoUser.subscriptionTier) {
          console.log(`🔄 Syncing tier from MongoDB: ${user.subscriptionTier} -> ${mongoUser.subscriptionTier}`);
          user.subscriptionTier = mongoUser.subscriptionTier;
          user.subscriptionStatus = mongoUser.subscriptionStatus || 'active';
          user.subscriptionExpiresAt = mongoUser.subscriptionExpiresAt;
          saveUser(user);
        }
      }
    } catch (dbError) {
      console.log('Could not sync with MongoDB:', dbError.message);
    }
    
    res.json({
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      expiresAt: user.subscriptionExpiresAt,
      limits: user.getLimits()
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription info' });
  }
});

// Get user ID from request (check header first, fallback to IP)
function getUserId(req) {
  // Check for authenticated user ID from header (set by frontend when logged in)
  const authenticatedUserId = req.get('x-user-id');
  if (authenticatedUserId && authenticatedUserId.trim()) {
    return authenticatedUserId.trim();
  }
  
  // Fallback: Use IP address + user agent as user ID for non-authenticated users
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || '';
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 32);
}

// Admin user IDs (add your user ID here to bypass limits)
const ADMIN_USER_IDS = [
  // Add admin user IDs here - you can get your user ID from backend logs
  // Example: 'admin-user-id-here'
];

// Check if user is admin
function isAdmin(userId) {
  return ADMIN_USER_IDS.includes(userId) || 
         process.env.ADMIN_MODE === 'true' || // Enable admin mode via env var
         userId === 'admin'; // Simple admin check
}

// Check subscription limits middleware
function checkSubscriptionLimits(req, res, next) {
  const userId = getUserId(req);
  const user = getUser(userId);
  
  // ADMIN BYPASS: Skip all limits for admin users
  if (isAdmin(userId)) {
    console.log(`🔓 Admin user detected: ${userId} - Bypassing all limits`);
    req.user = user;
    req.isAdmin = true;
    return next();
  }
  
  // Check if subscription is active
  if (!user.isSubscriptionActive()) {
    return res.status(403).json({ 
      error: 'Subscription expired',
      code: 'SUBSCRIPTION_EXPIRED',
      upgradeRequired: true
    });
  }
  
  // ⚠️ RATE LIMIT CHECK - Prevent API abuse
  const rateCheck = checkRateLimit(userId, user.subscriptionTier);
  if (!rateCheck.allowed) {
    console.log(`⚠️ Rate limit exceeded for user ${userId} (${user.subscriptionTier})`);
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before trying again.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: rateCheck.retryAfter
    });
  }
  
  // Check message limit BEFORE processing request
  const limits = user.getLimits();
  const used = user.dailyUsage.messages;
  const limit = limits.messagesPerDay;
  const credits = user.credits || 0;
  
  // Check if subscription limit reached
  const subscriptionLimitReached = used >= limit;
  
  // If subscription limit reached, check if user has credits
  if (subscriptionLimitReached && credits === 0) {
    // Log limit check for debugging
    console.log(`🚫 Limit check failed for user ${userId}: ${used}/${limit} messages, ${credits} credits - BLOCKED`);
    
    return res.status(429).json({ 
      error: 'Daily limit reached! Upgrade your plan or buy credits to continue.',
      code: 'DAILY_LIMIT_REACHED',
      code: 'LIMIT_EXCEEDED',
      limit: limit,
      used: used,
      creditsAvailable: credits,
      upgradeRequired: true
    });
  }
  
  // If subscription limit reached but user has credits, we'll use credits after successful API call
  if (subscriptionLimitReached && credits > 0) {
    console.log(`💳 Using credits for user ${userId}: ${used}/${limit} messages, ${credits} credits available`);
  }
  
  // Check image analysis limit
  const hasImages = req.body.fileUrls && req.body.fileUrls.length > 0;
  if (hasImages && !user.canAnalyzeImage()) {
    return res.status(403).json({ 
      error: 'Image analysis not available on your plan',
      code: 'FEATURE_NOT_AVAILABLE',
      upgradeRequired: true
    });
  }
  
  // Attach user to request
  req.user = user;
  next();
}

// OpenAI API proxy endpoint
app.post('/api/chat', rateLimit, checkSubscriptionLimits, async (req, res) => {
  try {
    const { prompt, conversationHistory = [], systemPrompt = null, fileUrls = [] } = req.body;
    const user = req.user;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Detect crisis/self-harm indicators
    const detectCrisis = (message) => {
      if (!message || typeof message !== 'string') return false;
      const lowerMessage = message.toLowerCase();
      const crisisIndicators = [
        'dua të vdes', 'do të vras veten', 'do të përfundoj', 'do të vras', 'vetëvrasje',
        'nuk dua të jetoj', 'nuk kam arsye për të jetuar', 'nuk ka kuptim të jetoj',
        'do të përfundoj gjithçka', 'do të bëj diçka', 'kam planuar të',
        'nuk ka shpresë', 'nuk ka kuptim', 'çdo gjë është e humbur', 'nuk ka rrugëdalje',
        'nuk kam më shpresë', 'çdo gjë është e keqe', 'nuk kam energji', 'nuk dua të dal',
        'nuk mund ta bëj më', 'nuk mund ta duroj më', 'jam i dëshpëruar', 'jam e dëshpëruar'
      ];
      return crisisIndicators.some(indicator => lowerMessage.includes(indicator));
    };
    
    const isCrisis = detectCrisis(prompt);
    if (isCrisis) {
      console.log('⚠️ CRISIS DETECTED - User message contains self-harm indicators');
    }
    
    // Check adult content access
    const isAdultCategory = systemPrompt && (
      systemPrompt.includes('partner seksual virtual') || 
      systemPrompt.includes('pa ASNJË FILTER') ||
      systemPrompt.includes('SEX GOD')
    );
    
    if (isAdultCategory && user.subscriptionTier === 'free') {
      return res.status(403).json({ 
        error: 'Adult content requires a subscription',
        code: 'ADULT_CONTENT_BLOCKED',
        upgradeRequired: true
      });
    }
    
    // OpenAI API Integration - Clean Installation
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey || openaiApiKey.trim() === '') {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in backend/.env file'
      });
    }
    
    let aiResponse;
    let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    
    try {
      console.log('🚀 Calling OpenAI API...');
      
      // Prepare messages array for OpenAI
      const messages = [];
      
      // Add system prompt if provided
      if (systemPrompt) {
        // If crisis detected, ensure system prompt emphasizes crisis response
        let finalSystemPrompt = String(systemPrompt).trim();
        if (isCrisis) {
          finalSystemPrompt += '\n\nKRITIKE: Përdoruesi ka treguar shenja të krizës. Duhet të jesh mbështetës, empatik, dhe të sugjerosh ndihmë profesionale. Trego që bota është e bukur dhe që ata janë të rëndësishëm.';
        }
        messages.push({
          role: 'system',
          content: finalSystemPrompt
        });
      }
      
      // Add conversation history (last 10 messages for context)
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        if (msg.role && msg.content) {
          const role = msg.role === 'user' ? 'user' : 'assistant';
          messages.push({
            role: role,
            content: String(msg.content).trim()
          });
        }
      });
      
      // Add current user message with images if provided
      if (fileUrls && fileUrls.length > 0) {
        // ⚠️ CRITICAL: Check screenshot analysis limit ⚠️
        // FREE/GUEST: 1 lifetime, PAID: tier-based monthly limits
        if (!user.canAnalyzeScreenshot()) {
          const isPaidUser = ['starter', 'pro', 'elite', 'basic', 'premium'].includes(user.subscriptionTier);
          const userLimit = user.getScreenshotLimit();
          const errorMsg = isPaidUser 
            ? `You've used your ${userLimit} screenshot analyses this month! Wait for next month or upgrade your plan 📸`
            : 'You\'ve used your free screenshot analysis! Upgrade for more analyses 📸';
          
          return res.status(403).json({
            error: errorMsg,
            code: 'SCREENSHOT_LIMIT_REACHED',
            upgradeRequired: !isPaidUser,
            screenshotAnalyses: {
              used: user.getScreenshotUsed(),
              limit: user.getScreenshotLimit(),
              remaining: user.getRemainingScreenshotAnalyses(),
              isPaidUser: isPaidUser
            }
          });
        }
        
        // Record screenshot analysis usage
        user.recordScreenshotAnalysis();
        saveUser(user);
        console.log(`📸 Screenshot analysis: Used=${user.getScreenshotUsed()}/${user.getScreenshotLimit()}, Lifetime=${user.screenshotAnalyses.lifetimeUsed}`);
        
        const imageContents = fileUrls.map((url) => ({
          type: 'image_url',
          image_url: { url: url }
        }));
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: String(prompt).trim() },
            ...imageContents
          ]
        });
        console.log(`📸 Including ${fileUrls.length} image(s) with message`);
      } else {
        messages.push({
          role: 'user',
          content: String(prompt).trim()
        });
      }
      
      console.log(`📝 Sending ${messages.length} messages to OpenAI`);
      
      // Determine model and parameters
      const isAdultCategory = systemPrompt && (
        systemPrompt.includes('partner seksual virtual') || 
        systemPrompt.includes('pa ASNJË FILTER') ||
        systemPrompt.includes('SEX GOD')
      );
      
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const maxTokens = isAdultCategory ? 2500 : 1500;
      const temperature = isAdultCategory ? 1.6 : 1.2;
      const frequencyPenalty = isAdultCategory ? 0.8 : 0.6;
      const presencePenalty = isAdultCategory ? 0.7 : 0.5;
      
      // Call OpenAI API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: maxTokens,
          temperature: temperature,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          stream: false
        })
      });
      
      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => ({}));
        
        if (openaiResponse.status === 401) {
          console.error('❌ OpenAI API key invalid');
          return res.status(401).json({ 
            error: 'OpenAI API key is invalid',
            message: 'Please check your OPENAI_API_KEY in backend/.env'
          });
        } else if (openaiResponse.status === 429) {
          console.warn('⚠️ OpenAI rate limit exceeded');
          return res.status(429).json({ 
            error: 'Rate limit exceeded',
            message: 'OpenAI API rate limit reached. Please try again later.'
          });
        } else {
          console.error('❌ OpenAI API error:', errorData);
          return res.status(openaiResponse.status).json({ 
            error: 'OpenAI API error',
            message: errorData.error?.message || 'Unknown error'
          });
        }
      }
      
      const data = await openaiResponse.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        aiResponse = data.choices[0].message.content;
        usage = {
          prompt_tokens: data.usage?.prompt_tokens || 0,
          completion_tokens: data.usage?.completion_tokens || 0,
          total_tokens: data.usage?.total_tokens || 0
        };
        
        // Track cost per user
        const cost = user.recordOpenAIUsage(usage.prompt_tokens, usage.completion_tokens);
        
        console.log('✅ OpenAI response received');
        console.log(`📊 Tokens: ${usage.total_tokens} (prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens})`);
        console.log(`💰 Cost: $${cost.toFixed(6)} | User total: $${user.getCostStats().totalSpent.toFixed(4)}`);
      } else {
        throw new Error('Invalid response format from OpenAI');
      }
      
    } catch (error) {
      console.error('❌ OpenAI API error:', error.message);
      return res.status(500).json({ 
        error: 'Failed to get AI response',
        message: error.message 
      });
    }
    
    // Record usage AFTER successful API call
    const limits = user.getLimits();
    const subscriptionLimitReached = user.dailyUsage.messages >= limits.messagesPerDay;
    
    // If subscription limit reached, use credits instead
    if (subscriptionLimitReached && user.credits > 0) {
      const creditsUsed = user.recordCreditUsage(1);
      if (creditsUsed) {
        console.log(`💳 Used 1 credit for user ${user.userId}. Remaining credits: ${user.credits}`);
      } else {
        // This shouldn't happen as we checked before, but handle it anyway
        console.error(`⚠️ Failed to use credit for user ${user.userId}`);
        return res.status(429).json({ 
          error: 'Daily limit reached! Upgrade your plan or buy credits to continue.',
      code: 'DAILY_LIMIT_REACHED',
          code: 'LIMIT_EXCEEDED',
          upgradeRequired: true
        });
      }
    } else {
      // Normal subscription limit usage
      user.recordMessage();
    }
    
    if (fileUrls && fileUrls.length > 0) {
      user.recordImageAnalysis();
    }
    
    saveUser(user);
    
    // Save conversation to database for admin viewing
    try {
      const sessionId = req.headers['x-session-id'] || `session_${Date.now()}`;
      const odId = req.headers['x-user-id'] || user.userId;
      
      // Find or create conversation
      let conversation = await ConversationModel.findOne({ 
        odId, 
        sessionId 
      });
      
      if (!conversation) {
        // Create new conversation
        conversation = new ConversationModel({
          odId,
          sessionId,
          messages: [],
          startedAt: new Date()
        });
      }
      
      // Add user message
      conversation.messages.push({
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        hasImages: fileUrls && fileUrls.length > 0
      });
      
      // Add AI response
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });
      
      conversation.lastMessageAt = new Date();
      conversation.messageCount = conversation.messages.length;
      
      // Auto-detect topic from first message
      if (conversation.messages.length <= 2) {
        const firstMsg = prompt.toLowerCase();
        if (firstMsg.includes('takime') || firstMsg.includes('date')) conversation.topic = 'Dating';
        else if (firstMsg.includes('mesazh') || firstMsg.includes('chat')) conversation.topic = 'Messaging';
        else if (firstMsg.includes('dhuratë') || firstMsg.includes('gift')) conversation.topic = 'Gifts';
        else if (firstMsg.includes('këshillë') || firstMsg.includes('tip')) conversation.topic = 'Tips';
        else conversation.topic = 'General';
      }
      
      await conversation.save();
    } catch (convError) {
      console.error('Failed to save conversation:', convError.message);
      // Don't fail the request if conversation saving fails
    }
    
    const costStats = user.getCostStats();
    console.log(`📊 User ${user.userId}: ${user.dailyUsage.messages}/${user.getLimits().messagesPerDay} messages used`);
    console.log(`💰 Cost: $${costStats.totalSpent.toFixed(4)} total | $${costStats.dailyCost.toFixed(4)} today`);
    
    res.json({ 
      response: aiResponse,
      usage: usage,
      userUsage: user.getUsageStats(),
      source: 'openai',
      cost: {
        thisRequest: user.calculateCost(usage.prompt_tokens || 0, usage.completion_tokens || 0),
        userTotal: costStats.totalSpent,
        dailyCost: costStats.dailyCost
      }
    });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Audio transcription endpoint (using OpenAI Whisper)
app.post('/api/transcribe', rateLimit, async (req, res) => {
  try {
    const { audio, format = 'webm' } = req.body;
    const user = req.user;

    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey.trim() === '') {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Create FormData for OpenAI Whisper API
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: `audio.${format}`,
      contentType: `audio/${format}`
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'sq'); // Albanian

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ OpenAI Whisper API error:', response.status, errorData);
      return res.status(response.status).json({ 
        error: 'Transcription failed',
        details: errorData 
      });
    }

    const data = await response.json();
    const transcribedText = data.text || '';

    // Record usage
    user.recordMessage();
    saveUser(user);

    console.log(`🎤 Transcription: "${transcribedText}"`);

    res.json({ 
      text: transcribedText,
      userUsage: user.getUsageStats()
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ==========================================
// USER AUTHENTICATION ENDPOINTS
// ==========================================

// In-memory cache for quick lookups (backed by MongoDB)
const userAccountsCache = new Map();

// Helper: Get all users from MongoDB
async function getAllUsersFromDB() {
  try {
    return await UserAccountModel.find({}).lean();
  } catch (error) {
    console.error('Error fetching users from DB:', error.message);
    return [];
  }
}

// Helper: Find user by email or username
async function findUserByEmailOrUsername(email, username) {
  try {
    return await UserAccountModel.findOne({
      $or: [
        { email: email },
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    }).lean();
  } catch (error) {
    console.error('Error finding user:', error.message);
    return null;
  }
}

// User registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, gender, birthDate, username, email, phoneNumber, password, appleId, country } = req.body;
    
    console.log('📝 Registration attempt:', { firstName, lastName, gender, birthDate, username, email, hasPassword: !!password });
    
    // Validate required fields (if not using Apple Sign In)
    if (!appleId && (!email || !password)) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // If firstName/lastName provided, use them. Otherwise require username.
    if (!appleId && !firstName && !lastName && !username) {
      return res.status(400).json({ 
        error: 'First name and last name, or username required' 
      });
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Create username from firstName/lastName if not provided
    let normalizedUsername = username ? username.toLowerCase().trim() : null;
    if (!normalizedUsername && firstName) {
      // Generate username from first and last name
      normalizedUsername = `${firstName.toLowerCase().trim()}${lastName ? lastName.toLowerCase().trim() : ''}${Math.floor(Math.random() * 1000)}`;
    }
    
    // Check if email already exists
    const existingEmail = await UserAccountModel.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ 
        error: 'This email is already registered. Login or use another email.',
        code: 'EMAIL_EXISTS' 
      });
    }
    
    // Create new user account with unique ID
    const odId = appleId || `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newUser = new UserAccountModel({
      odId,
      username: normalizedUsername,
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
      gender: gender || null,
      birthDate: birthDate || null,
      email: normalizedEmail,
      phoneNumber: phoneNumber || null,
      password: password || null, // In production, hash this!
      appleId: appleId || null,
      country: country || 'AL',
      isVerified: false // Email verification required
    });
    
    // Save to MongoDB
    await newUser.save();
    
    // Also create user subscription profile
    const user = getUser(odId);
    saveUser(user);
    
    const displayName = firstName ? `${firstName} ${lastName || ''}`.trim() : username;
    console.log(`✅ New user registered: ${displayName} (${email})`);
    
    res.json({
      success: true,
      user: {
        odId,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        gender: newUser.gender,
        birthDate: newUser.birthDate,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        createdAt: newUser.createdAt,
        country: newUser.country
      },
      message: 'Registration successful'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message 
    });
  }
});

// User login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, appleId, identifier } = req.body;
    const loginIdentifier = (identifier || email || '').trim();
    
    // Find user in MongoDB
    let userAccount;
    if (appleId) {
      userAccount = await UserAccountModel.findOne({ appleId: appleId });
    } else {
      if (!loginIdentifier || !password) {
        return res.status(400).json({ 
          error: 'Email/username and password are required' 
        });
      }
      
      // Check if input is email or username
      const isEmail = loginIdentifier.includes('@');
      
      if (isEmail) {
        userAccount = await UserAccountModel.findOne({ email: loginIdentifier });
      } else {
        // Search by username (case insensitive)
        userAccount = await UserAccountModel.findOne({
          username: { $regex: new RegExp(`^${loginIdentifier}$`, 'i') }
        });
      }
      
      // Verify password
      if (!userAccount || userAccount.password !== password) {
        return res.status(401).json({ 
          error: 'Invalid email/username or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
    }
    
    if (!userAccount) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Update last login in MongoDB
    await UserAccountModel.updateOne(
      { _id: userAccount._id },
      { lastLogin: new Date() }
    );
    
    // Sync subscription info from MongoDB to in-memory profile
    const usageProfile = getUser(userAccount.odId);
    
    // If MongoDB has subscription data, sync it to in-memory (MongoDB is source of truth)
    if (userAccount.subscriptionTier) {
      usageProfile.subscriptionTier = userAccount.subscriptionTier;
      usageProfile.subscriptionStatus = userAccount.subscriptionStatus || 'active';
      usageProfile.subscriptionExpiresAt = userAccount.subscriptionExpiresAt;
      usageProfile.credits = userAccount.credits || usageProfile.credits || 0;
      
      // Ensure paid users have proper screenshot limits
      const isPaidTier = ['starter', 'pro', 'elite', 'premium'].includes(userAccount.subscriptionTier);
      if (isPaidTier && usageProfile.screenshotAnalyses) {
        // Check if monthly reset is needed
        const now = new Date();
        if (usageProfile.screenshotAnalyses.currentMonth !== now.getMonth() ||
            usageProfile.screenshotAnalyses.currentYear !== now.getFullYear()) {
          usageProfile.screenshotAnalyses.monthlyUsed = 0;
          usageProfile.screenshotAnalyses.currentMonth = now.getMonth();
          usageProfile.screenshotAnalyses.currentYear = now.getFullYear();
        }
      }
      
      saveUser(usageProfile);
    }
    
    const subscriptionTier = usageProfile.subscriptionTier || 'free_trial';
    const subscriptionStatus = usageProfile.subscriptionStatus || 'trial';
    
    console.log(`✅ User logged in: ${userAccount.username} (${subscriptionTier}) - Credits: ${usageProfile.credits}`);
    
    // Get screenshot limits for response
    const screenshotLimits = {
      used: usageProfile.getScreenshotUsed(),
      limit: usageProfile.getScreenshotLimit(),
      remaining: usageProfile.getRemainingScreenshotAnalyses(),
      isPaidUser: ['starter', 'pro', 'elite', 'premium'].includes(subscriptionTier)
    };
    
    res.json({
      success: true,
      user: {
        odId: userAccount.odId,
        username: userAccount.username,
        firstName: userAccount.firstName,
        lastName: userAccount.lastName,
        gender: userAccount.gender,
        email: userAccount.email,
        phoneNumber: userAccount.phoneNumber,
        createdAt: userAccount.createdAt,
        country: userAccount.country,
        subscriptionTier: subscriptionTier,
        subscriptionStatus: subscriptionStatus,
        credits: usageProfile.credits || 0,
        screenshotLimits: screenshotLimits
      },
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
});

// Password reset codes storage (in-memory for MVP)
const passwordResetCodes = new Map();

// Email transporter setup
// Supports Gmail, 123-reg, or any SMTP server
// For 123-reg: Set EMAIL_HOST=smtp.123-reg.co.uk, EMAIL_PORT=587
// For Gmail: Set EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=587
const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
  
  if (!emailUser || !emailPass) {
    console.log('⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    return null;
  }
  
  console.log(`📧 Email configured: ${emailUser} via ${emailHost}:${emailPort}`);
  
  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certs (some hosts need this)
    }
  });
};

// Send password reset email
const sendResetEmail = async (toEmail, resetCode) => {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    console.log(`📧 EMAIL NOT CONFIGURED - Reset code for ${toEmail}: ${resetCode}`);
    return false;
  }
  
  const mailOptions = {
    from: `"Biseda.ai" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Kodi për Rivendosjen e Fjalëkalimit - Biseda.ai',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin: 0;">Biseda.ai</h1>
          <p style="color: #64748B; margin-top: 5px;">AI Coach për Dating dhe Biseda</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); border-radius: 16px; padding: 30px; text-align: center;">
          <h2 style="color: #FFFFFF; margin-top: 0;">Rivendos Fjalëkalimin</h2>
          <p style="color: #CBD5E1;">Kodi juaj i rivendosjes është:</p>
          
          <div style="background: #0F172A; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #A78BFA; letter-spacing: 8px;">${resetCode}</span>
          </div>
          
          <p style="color: #94A3B8; font-size: 14px;">
            Ky kod skadon pas <strong>15 minutash</strong>.
          </p>
          <p style="color: #94A3B8; font-size: 14px;">
            Nëse nuk e keni kërkuar këtë kod, injoroni këtë email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748B; font-size: 12px;">
          <p>© 2024 Biseda.ai - Të gjitha të drejtat e rezervuara</p>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
};

// Request password reset - sends code to email
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required', code: 'EMAIL_REQUIRED' });
    }
    
    // Find user by email in MongoDB
    const userAccount = await UserAccountModel.findOne({ email: email });
    
    if (!userAccount) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true, 
        message: 'If email exists, you will receive a reset code.' 
      });
    }
    
    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    // Store the reset code
    passwordResetCodes.set(email, {
      code: resetCode,
      expiresAt,
      odId: userAccount.odId
    });
    
    // Try to send email
    const emailSent = await sendResetEmail(email, resetCode);
    
    // Log the code for debugging
    console.log(`🔐 Password reset code for ${email}: ${resetCode}`);
    
    res.json({ 
      success: true, 
      message: emailSent 
        ? 'Reset code sent to your email.' 
        : 'Reset code sent to your email.',
      // Show code in dev mode if email not configured
      _devCode: (!emailSent || process.env.NODE_ENV !== 'production') ? resetCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error. Please try again.', code: 'SERVER_ERROR' });
  }
});

// Verify reset code
app.post('/api/auth/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required', code: 'FIELDS_REQUIRED' });
    }
    
    const resetData = passwordResetCodes.get(email);
    
    if (!resetData) {
      return res.status(400).json({ error: 'Code not found or expired', code: 'CODE_EXPIRED' });
    }
    
    if (Date.now() > resetData.expiresAt) {
      passwordResetCodes.delete(email);
      return res.status(400).json({ error: 'Code expired. Request a new code.', code: 'CODE_EXPIRED' });
    }
    
    if (resetData.code !== code) {
      return res.status(400).json({ error: 'Invalid code', code: 'INVALID_CODE' });
    }
    
    res.json({ success: true, message: 'Code verified successfully' });
    
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
});

// Reset password with code
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'All fields are required', code: 'FIELDS_REQUIRED' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters', code: 'PASSWORD_TOO_SHORT' });
    }
    
    const resetData = passwordResetCodes.get(email);
    
    if (!resetData) {
      return res.status(400).json({ error: 'Code not found or expired', code: 'CODE_EXPIRED' });
    }
    
    if (Date.now() > resetData.expiresAt) {
      passwordResetCodes.delete(email);
      return res.status(400).json({ error: 'Code expired. Request a new code.', code: 'CODE_EXPIRED' });
    }
    
    if (resetData.code !== code) {
      return res.status(400).json({ error: 'Invalid code', code: 'INVALID_CODE' });
    }
    
    // Find and update user password in MongoDB
    const userAccount = await UserAccountModel.findOne({ email: email });
    
    if (!userAccount) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    
    // Update password in MongoDB (in production, hash this!)
    await UserAccountModel.updateOne(
      { email: email },
      { password: newPassword }
    );
    
    // Remove used reset code
    passwordResetCodes.delete(email);
    
    console.log(`✅ Password reset successful for ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully! You can now login.' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
});

// Apple Sign In endpoint
app.post('/api/auth/apple', async (req, res) => {
  try {
    const { identityToken, email, givenName, familyName } = req.body;
    
    if (!identityToken) {
      return res.status(400).json({ error: 'Identity token is required' });
    }
    
    // For now, we'll trust the token from Apple
    // In production, you should verify the token with Apple's servers
    
    // Generate a unique Apple user ID from the token (simplified)
    const appleUserId = `apple_${Buffer.from(identityToken.substring(0, 50)).toString('base64').substring(0, 20)}`;
    
    // Check if user already exists with this Apple ID
    let userAccount = Array.from(userAccounts.values()).find(u => u.appleId === appleUserId);
    
    if (userAccount) {
      // Existing user - update last login
      userAccount.lastLogin = new Date().toISOString();
      console.log(`✅ Apple user logged in: ${userAccount.userId}`);
    } else {
      // New user - create account
      const userId = generateUserId();
      const username = givenName ? `${givenName}${familyName || ''}`.replace(/\s/g, '') : `AppleUser_${Date.now()}`;
      const userEmail = email || `${appleUserId}@privaterelay.appleid.com`;
      
      userAccount = {
        userId,
        username,
        email: userEmail,
        appleId: appleUserId,
        phoneNumber: null,
        passwordHash: null, // No password for Apple users
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionTier: 'free_trial', // 3-day free trial
        savedItems: { dates: [], gifts: [], tips: [] }
      };
      
      userAccounts.set(userId, userAccount);
      initializeUserData(userId);
      console.log(`✅ New Apple user created: ${userId}`);
    }
    
    res.json({
      message: 'Apple Sign In successful',
      user: {
        userId: userAccount.userId,
        username: userAccount.username,
        email: userAccount.email,
        isAppleUser: true
      }
    });
    
  } catch (error) {
    console.error('Apple Sign In error:', error);
    res.status(500).json({ 
      error: 'Apple Sign In failed',
      message: error.message 
    });
  }
});

// Google Sign In endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken, email, givenName, familyName, imageUrl } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Generate a unique Google user ID
    const googleUserId = `google_${Buffer.from(email).toString('base64').substring(0, 20)}`;
    
    // Check if user already exists with this Google ID or email
    let userAccount = Array.from(userAccounts.values()).find(u => u.googleId === googleUserId || u.email === email);
    
    if (userAccount) {
      // Existing user - update last login
      userAccount.lastLogin = new Date().toISOString();
      if (!userAccount.googleId) {
        userAccount.googleId = googleUserId;
      }
      console.log(`✅ Google user logged in: ${userAccount.userId}`);
    } else {
      // New user - create account
      const userId = generateUserId();
      const username = givenName ? `${givenName}${familyName || ''}`.replace(/\s/g, '') : `GoogleUser_${Date.now()}`;
      
      userAccount = {
        userId,
        username,
        email: email,
        googleId: googleUserId,
        imageUrl: imageUrl || null,
        phoneNumber: null,
        passwordHash: null, // No password for Google users
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionTier: 'free_trial', // 3-day free trial
        savedItems: { dates: [], gifts: [], tips: [] }
      };
      
      userAccounts.set(userId, userAccount);
      initializeUserData(userId);
      console.log(`✅ New Google user created: ${userId}`);
    }
    
    res.json({
      message: 'Google Sign In successful',
      user: {
        userId: userAccount.userId,
        username: userAccount.username,
        email: userAccount.email,
        isGoogleUser: true
      }
    });
    
  } catch (error) {
    console.error('Google Sign In error:', error);
    res.status(500).json({ 
      error: 'Google Sign In failed',
      message: error.message 
    });
  }
});

// Facebook Sign In endpoint
app.post('/api/auth/facebook', async (req, res) => {
  try {
    const { accessToken, userId: fbUserId, email, name, firstName, lastName } = req.body;
    
    if (!accessToken && !fbUserId) {
      return res.status(400).json({ error: 'Access token or user ID is required' });
    }
    
    // Generate a unique Facebook user ID
    const facebookUserId = `facebook_${fbUserId || Buffer.from(email || 'unknown').toString('base64').substring(0, 20)}`;
    
    // Check if user already exists with this Facebook ID or email
    let userAccount = Array.from(userAccounts.values()).find(u => u.facebookId === facebookUserId || (email && u.email === email));
    
    if (userAccount) {
      // Existing user - update last login
      userAccount.lastLogin = new Date().toISOString();
      if (!userAccount.facebookId) {
        userAccount.facebookId = facebookUserId;
      }
      console.log(`✅ Facebook user logged in: ${userAccount.userId}`);
    } else {
      // New user - create account
      const newUserId = generateUserId();
      const username = firstName ? `${firstName}${lastName || ''}`.replace(/\s/g, '') : (name ? name.replace(/\s/g, '') : `FacebookUser_${Date.now()}`);
      const userEmail = email || `${facebookUserId}@facebook.com`;
      
      userAccount = {
        userId: newUserId,
        username,
        email: userEmail,
        facebookId: facebookUserId,
        phoneNumber: null,
        passwordHash: null, // No password for Facebook users
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionTier: 'free_trial', // 3-day free trial
        savedItems: { dates: [], gifts: [], tips: [] }
      };
      
      userAccounts.set(newUserId, userAccount);
      initializeUserData(newUserId);
      console.log(`✅ New Facebook user created: ${newUserId}`);
    }
    
    res.json({
      message: 'Facebook Sign In successful',
      user: {
        userId: userAccount.userId,
        username: userAccount.username,
        email: userAccount.email,
        isFacebookUser: true
      }
    });
    
  } catch (error) {
    console.error('Facebook Sign In error:', error);
    res.status(500).json({ 
      error: 'Facebook Sign In failed',
      message: error.message 
    });
  }
});

// Get current user info
app.get('/api/auth/me', (req, res) => {
  try {
    const userId = getUserId(req);
    const userAccount = userAccounts.get(userId);
    
    if (!userAccount) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json({
      user: {
        userId: userAccount.userId,
        username: userAccount.username,
        email: userAccount.email,
        phoneNumber: userAccount.phoneNumber,
        createdAt: userAccount.createdAt,
        lastLogin: userAccount.lastLogin
      }
    });
    
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ 
      error: 'Failed to get user info',
      message: error.message 
    });
  }
});

// ==========================================
// USER SAVED ITEMS ENDPOINTS
// ==========================================

// In-memory storage for saved items (per user)
const userSavedItems = new Map();

// Get user's saved items
app.get('/api/user/saved', (req, res) => {
  try {
    const userId = getUserId(req);
    const savedItems = userSavedItems.get(userId) || {
      dates: [],
      gifts: [],
      tips: []
    };
    
    res.json({
      success: true,
      savedItems,
      totalSaved: savedItems.dates.length + savedItems.gifts.length + savedItems.tips.length
    });
  } catch (error) {
    console.error('Get saved items error:', error);
    res.status(500).json({ error: 'Failed to get saved items' });
  }
});

// Save an item
app.post('/api/user/saved', (req, res) => {
  try {
    const userId = getUserId(req);
    const { type, item } = req.body; // type: 'date', 'gift', or 'tip'
    
    if (!type || !item) {
      return res.status(400).json({ error: 'Type and item are required' });
    }
    
    // Get or create saved items for user
    let savedItems = userSavedItems.get(userId) || {
      dates: [],
      gifts: [],
      tips: []
    };
    
    // Add item with timestamp and unique ID
    const savedItem = {
      ...item,
      savedAt: new Date().toISOString(),
      savedId: `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    };
    
    // Add to appropriate category
    if (type === 'date') {
      savedItems.dates.unshift(savedItem); // Add to beginning
    } else if (type === 'gift') {
      savedItems.gifts.unshift(savedItem);
    } else if (type === 'tip') {
      savedItems.tips.unshift(savedItem);
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    userSavedItems.set(userId, savedItems);
    
    console.log(`✅ User ${userId} saved ${type}:`, item.name || item.title);
    
    res.json({
      success: true,
      savedItem,
      totalSaved: savedItems.dates.length + savedItems.gifts.length + savedItems.tips.length
    });
  } catch (error) {
    console.error('Save item error:', error);
    res.status(500).json({ error: 'Failed to save item' });
  }
});

// Remove a saved item
app.delete('/api/user/saved/:savedId', (req, res) => {
  try {
    const userId = getUserId(req);
    const { savedId } = req.params;
    
    let savedItems = userSavedItems.get(userId);
    if (!savedItems) {
      return res.status(404).json({ error: 'No saved items found' });
    }
    
    // Find and remove item
    let removed = false;
    ['dates', 'gifts', 'tips'].forEach(category => {
      const index = savedItems[category].findIndex(item => item.savedId === savedId);
      if (index !== -1) {
        savedItems[category].splice(index, 1);
        removed = true;
      }
    });
    
    if (!removed) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    userSavedItems.set(userId, savedItems);
    
    res.json({
      success: true,
      message: 'Item removed',
      totalSaved: savedItems.dates.length + savedItems.gifts.length + savedItems.tips.length
    });
  } catch (error) {
    console.error('Remove saved item error:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'EMILIOBABUSH';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Servetbena56@';
const ADMIN_TOKEN = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

function checkAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden - Invalid admin credentials' });
  }
  
  next();
}

// Admin auth check endpoint
app.post('/api/admin/auth', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      token: ADMIN_TOKEN,
      message: 'Authentication successful',
      username: ADMIN_USERNAME
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid username or password' 
    });
  }
});

// Get all users and admin stats
app.get('/api/admin/stats', checkAdminAuth, (req, res) => {
  try {
    const allUsers = Array.from(getAllUsers().values());
    
    // Calculate overall stats
    const totalUsers = allUsers.length;
    const activeToday = allUsers.filter(u => {
      const today = new Date().toDateString();
      return u.lastActiveAt && new Date(u.lastActiveAt).toDateString() === today;
    }).length;
    
    const activeThisWeek = allUsers.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return u.lastActiveAt && new Date(u.lastActiveAt) >= weekAgo;
    }).length;
    
    // Subscription breakdown
    const subscriptionStats = {
      free_trial: allUsers.filter(u => u.subscriptionTier === 'free_trial').length,
      free: allUsers.filter(u => u.subscriptionTier === 'free').length,
      starter: allUsers.filter(u => u.subscriptionTier === 'starter').length,
      pro: allUsers.filter(u => u.subscriptionTier === 'pro').length,
      elite: allUsers.filter(u => u.subscriptionTier === 'elite').length,
      premium: allUsers.filter(u => u.subscriptionTier === 'premium').length // Legacy support
    };
    
    // Revenue calculation (rough estimate)
    const monthlyRevenue = 
      (subscriptionStats.starter * 7.99) + 
      (subscriptionStats.pro * 14.99) + 
      (subscriptionStats.premium * 24.99);
    
    // Total messages and costs
    let totalMessages = 0;
    let totalCost = 0;
    let totalCreditsBalance = 0;
    
    allUsers.forEach(u => {
      totalMessages += u.monthlyUsage.totalMessages || 0;
      totalCost += u.costTracking.totalSpent || 0;
      totalCreditsBalance += u.credits || 0;
    });
    
    // Top users by usage
    const topUsers = allUsers
      .sort((a, b) => (b.monthlyUsage.totalMessages || 0) - (a.monthlyUsage.totalMessages || 0))
      .slice(0, 10)
      .map(u => ({
        userId: u.userId,
        tier: u.subscriptionTier,
        messages: u.monthlyUsage.totalMessages || 0,
        cost: u.costTracking.totalSpent || 0
      }));
    
    res.json({
      overview: {
        totalUsers,
        activeToday,
        activeThisWeek,
        totalMessages,
        totalCost: totalCost.toFixed(4),
        monthlyRevenue: monthlyRevenue.toFixed(2),
        profit: (monthlyRevenue - totalCost).toFixed(2),
        totalCreditsBalance
      },
      subscriptions: subscriptionStats,
      topUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get all users list - Now fetches from MongoDB (persistent) + in-memory (usage data)
app.get('/api/admin/users', checkAdminAuth, async (req, res) => {
  try {
    // Fetch all registered users from MongoDB (persistent storage)
    const mongoUsers = await UserAccountModel.find({}).sort({ createdAt: -1 }).lean();
    
    // Get in-memory usage data
    const inMemoryUsers = getAllUsers();
    
    const usersList = mongoUsers.map(mongoUser => {
      const usageData = inMemoryUsers.get(mongoUser.odId);
      return {
        odId: mongoUser.odId,
        userId: mongoUser.odId,
        username: mongoUser.username,
        email: mongoUser.email,
        subscriptionTier: usageData?.subscriptionTier || mongoUser.subscriptionTier || 'free_trial',
        subscriptionStatus: usageData?.subscriptionStatus || 'active',
        subscriptionExpiresAt: usageData?.subscriptionExpiresAt,
        createdAt: mongoUser.createdAt,
        lastActiveAt: usageData?.lastActiveAt || mongoUser.lastLogin,
        dailyUsage: usageData?.dailyUsage || { messages: 0 },
        monthlyUsage: usageData?.monthlyUsage || { totalMessages: 0 },
        costTracking: usageData?.costTracking || { totalSpent: 0 },
        credits: usageData?.credits || mongoUser.credits || 0,
        isBlocked: usageData?.isBlocked || false,
        securityStrikes: usageData?.securityStrikes || 0,
        stripeCustomerId: usageData?.stripeCustomerId || mongoUser.stripeCustomerId
      };
    });
    
    // Sort by last active (most recent first)
    usersList.sort((a, b) => new Date(b.lastActiveAt || 0) - new Date(a.lastActiveAt || 0));
    
    res.json({
      users: usersList,
      total: usersList.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

// Block/Unblock user
app.post('/api/admin/users/:userId/block', checkAdminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const { blocked } = req.body;
    
    const user = getAllUsers().get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isBlocked = blocked;
    saveUser(user);
    
    res.json({
      success: true,
      userId,
      isBlocked: user.isBlocked,
      message: blocked ? 'User blocked' : 'User unblocked'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get registered users (from MongoDB UserAccount)
app.get('/api/admin/registered-users', checkAdminAuth, async (req, res) => {
  try {
    const registeredUsers = await UserAccountModel.find({}).sort({ createdAt: -1 }).lean();
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000); // 5 minutes
    const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000); // 15 minutes
    
    // Merge with usage data from in-memory users map
    const enrichedUsers = registeredUsers.map(regUser => {
      const usageData = getAllUsers().get(regUser.odId);
      const lastActiveAt = usageData?.lastActiveAt || regUser.lastLogin;
      const lastActiveDate = lastActiveAt ? new Date(lastActiveAt) : null;
      
      // Calculate online status
      let onlineStatus = 'offline';
      if (lastActiveDate) {
        if (lastActiveDate >= fiveMinutesAgo) {
          onlineStatus = 'online'; // Active in last 5 minutes
        } else if (lastActiveDate >= fifteenMinutesAgo) {
          onlineStatus = 'away'; // Active in last 15 minutes
        }
      }
      
      return {
        ...regUser,
        subscriptionTier: usageData?.subscriptionTier || 'free_trial',
        subscriptionStatus: usageData?.subscriptionStatus || 'active',
        dailyUsage: usageData?.dailyUsage || { messages: 0 },
        monthlyUsage: usageData?.monthlyUsage || { totalMessages: 0 },
        costTracking: usageData?.costTracking || { totalSpent: 0 },
        credits: usageData?.credits || 0,
        lastActiveAt: lastActiveAt,
        onlineStatus: onlineStatus,
        lastSeenText: lastActiveDate ? getLastSeenText(lastActiveDate, now) : 'Kurrë'
      };
    });
    
    res.json({
      users: enrichedUsers,
      total: enrichedUsers.length,
      onlineCount: enrichedUsers.filter(u => u.onlineStatus === 'online').length,
      awayCount: enrichedUsers.filter(u => u.onlineStatus === 'away').length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin registered users error:', error);
    res.status(500).json({ error: 'Failed to fetch registered users' });
  }
});

// Helper function to get "last seen" text
function getLastSeenText(lastActiveDate, now) {
  const diffMs = now - lastActiveDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Tani online';
  if (diffMinutes < 5) return 'Online';
  if (diffMinutes < 60) return `${diffMinutes} min më parë`;
  if (diffHours < 24) return `${diffHours} orë më parë`;
  if (diffDays === 1) return 'Dje';
  if (diffDays < 7) return `${diffDays} ditë më parë`;
  return lastActiveDate.toLocaleDateString('sq-AL');
}

// Get user conversations (admin only)
app.get('/api/admin/users/:odId/conversations', checkAdminAuth, async (req, res) => {
  try {
    const { odId } = req.params;
    
    const conversations = await ConversationModel.find({ odId })
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean();
    
    res.json({
      conversations,
      total: conversations.length,
      odId
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get single conversation details (admin only)
app.get('/api/admin/conversations/:conversationId', checkAdminAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await ConversationModel.findById(conversationId).lean();
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get all recent conversations (admin only)
app.get('/api/admin/conversations', checkAdminAuth, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    
    const conversations = await ConversationModel.find({})
      .sort({ lastMessageAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    const total = await ConversationModel.countDocuments();
    
    // Get user info for each conversation
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await UserAccountModel.findOne({ odId: conv.odId }).lean();
        return {
          ...conv,
          userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown',
          userEmail: user?.email || 'Unknown'
        };
      })
    );
    
    res.json({
      conversations: enrichedConversations,
      total,
      hasMore: skip + conversations.length < total
    });
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:odId', checkAdminAuth, async (req, res) => {
  try {
    const { odId } = req.params;
    
    // Delete from MongoDB
    await UserAccountModel.findOneAndDelete({ odId });
    
    // Delete from in-memory store
    getAllUsers().delete(odId);
    
    console.log(`🗑️ User deleted: ${odId}`);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      odId
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Gift credits to user (admin only)
app.post('/api/admin/users/:odId/gift-credits', checkAdminAuth, async (req, res) => {
  try {
    const { odId } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid credit amount' });
    }
    
    // Get user and add credits
    const user = getUser(odId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.credits = (user.credits || 0) + amount;
    user.creditHistory = user.creditHistory || [];
    user.creditHistory.push({
      date: new Date(),
      type: 'gift',
      amount: amount,
      source: 'admin_gift'
    });
    
    saveUser(user);
    
    // Also update MongoDB
    await UserAccountModel.updateOne(
      { odId: odId },
      { credits: user.credits }
    );
    
    console.log(`🎁 Gifted ${amount} credits to user: ${odId} [Saved to MongoDB]`);
    
    res.json({
      success: true,
      message: `${amount} credits gifted successfully`,
      odId,
      newBalance: user.credits
    });
  } catch (error) {
    console.error('Gift credits error:', error);
    res.status(500).json({ error: 'Failed to gift credits' });
  }
});

// Update user subscription tier (admin only)
app.post('/api/admin/users/:odId/update-tier', checkAdminAuth, async (req, res) => {
  try {
    const { odId } = req.params;
    const { tier } = req.body;
    
    const validTiers = ['free', 'free_trial', 'starter', 'pro', 'elite', 'premium'];
    if (!tier || !validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be one of: ' + validTiers.join(', ') });
    }
    
    // Find user in MongoDB first
    const mongoUser = await UserAccountModel.findOne({ odId: odId });
    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    
    // Get in-memory user and update tier
    const user = getUser(odId);
    const oldTier = mongoUser.subscriptionTier || user.subscriptionTier;
    user.subscriptionTier = tier;
    user.subscriptionStatus = tier === 'free' ? 'none' : 'active';
    
    // Set expiration for paid tiers
    if (tier !== 'free' && tier !== 'free_trial') {
      user.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    }
    
    // Auto-assign credits based on tier
    const tierCredits = {
      free: 0,
      free_trial: 0,
      starter: 25,    // €6.99 plan gets 25 bonus credits
      pro: 50,        // €12.99 plan gets 50 bonus credits
      elite: 100,     // €19.99 plan gets 100 bonus credits
      premium: 100    // Legacy tier same as elite
    };
    
    const creditsToAdd = tierCredits[tier] || 0;
    if (creditsToAdd > 0) {
      user.credits = (user.credits || 0) + creditsToAdd;
      user.creditHistory = user.creditHistory || [];
      user.creditHistory.push({
        date: new Date(),
        type: 'added',
        amount: creditsToAdd,
        source: `tier_upgrade_${tier}`
      });
    }
    
    // Reset daily usage for fresh start
    user.dailyUsage = {
      date: new Date().toDateString(),
      messages: 0,
      imageAnalyses: 0
    };
    
    // Reset screenshot usage for paid users (they get fresh monthly limit)
    const isPaidTier = ['starter', 'pro', 'elite', 'premium'].includes(tier);
    if (isPaidTier) {
      user.screenshotAnalyses = {
        lifetimeUsed: user.screenshotAnalyses?.lifetimeUsed || 0,  // Keep lifetime record
        monthlyUsed: 0,  // Reset monthly to 0 for paid users
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
      };
    }
    
    saveUser(user);
    
    // ALSO update MongoDB (source of truth for tier data)
    await UserAccountModel.updateOne(
      { odId: odId },
      { 
        subscriptionTier: tier,
        subscriptionStatus: tier === 'free' ? 'none' : 'active',
        subscriptionExpiresAt: tier !== 'free' && tier !== 'free_trial' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
          : null,
        credits: user.credits
      }
    );
    
    console.log(`🔄 Updated user ${odId} tier: ${oldTier} -> ${tier} (+${creditsToAdd} credits) [Saved to MongoDB]`);
    
    res.json({
      success: true,
      message: `Subscription tier updated to ${tier}`,
      odId,
      oldTier,
      newTier: tier,
      creditsAdded: creditsToAdd,
      newCreditsBalance: user.credits
    });
  } catch (error) {
    console.error('Update tier error:', error);
    res.status(500).json({ error: 'Failed to update subscription tier' });
  }
});

// Create test user (admin only)
app.post('/api/admin/create-test-user', checkAdminAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, tier } = req.body;
    const timestamp = Date.now();
    const testUserId = `user-${timestamp}-${Math.random().toString(36).substring(7)}`;
    const testUsername = email ? email.split('@')[0] : `testuser_${timestamp}`;
    
    // Check if email already exists
    if (email) {
      const existingUser = await UserAccountModel.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(409).json({ error: 'This email is already registered' });
      }
    }
    
    // Create account in MongoDB with subscription data
    const subscriptionTier = tier || 'pro';
    const testAccount = new UserAccountModel({
      odId: testUserId,
      username: testUsername,
      firstName: firstName || 'Test',
      lastName: lastName || 'User',
      gender: gender || null,
      email: email ? email.toLowerCase().trim() : `${testUsername}@biseda.ai`,
      password: password || 'testpassword123',
      country: 'AL',
      isVerified: true,
      subscriptionTier: subscriptionTier,
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      credits: 100,
      createdAt: new Date(),
      lastLogin: new Date()
    });
    
    await testAccount.save();
    
    // Create usage profile using getUser (which creates a proper User instance)
    const user = getUser(testUserId);
    user.subscriptionTier = subscriptionTier;
    user.subscriptionStatus = 'active';
    user.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    user.dailyUsage = { messages: 0, date: new Date().toDateString(), imageAnalyses: 0 };
    user.monthlyUsage = { 
      month: new Date().getMonth(), 
      year: new Date().getFullYear(),
      totalMessages: 0, 
      totalImageAnalyses: 0,
      totalCost: 0,
      totalTokens: 0,
      totalOpenAICalls: 0
    };
    // Set screenshot limits based on tier (fresh monthly quota for paid users)
    user.screenshotAnalyses = {
      lifetimeUsed: 0,
      monthlyUsed: 0,
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear()
    };
    user.costTracking = { totalSpent: 0, lastResetDate: new Date().toDateString(), dailyCost: 0 };
    user.credits = 100;
    user.lastActiveAt = new Date();
    saveUser(user);
    
    console.log(`✅ New user created by admin: ${testAccount.email} (${subscriptionTier})`);
    
    res.json({
      success: true,
      message: `${subscriptionTier.toUpperCase()} user created successfully`,
      user: {
        odId: testUserId,
        email: testAccount.email,
        password: password || 'testpassword123',
        name: `${testAccount.firstName} ${testAccount.lastName}`,
        gender: testAccount.gender,
        username: testUsername,
        tier: subscriptionTier
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (openaiApiKey && openaiApiKey.trim() !== '') {
    console.log(`🤖 OpenAI: ✅ Active - Using ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
    console.log(`💰 Pricing: $0.15/1M input tokens, $0.60/1M output tokens`);
    console.log(`💡 Cost per message: ~$0.0003-0.0004 (0.03-0.04 cents)`);
    console.log(`📊 Cost tracking enabled per user`);
    console.log(`✅ OpenAI integration active - All requests use OpenAI API`);
  } else {
    console.log(`🤖 OpenAI: ❌ Not configured`);
    console.log(`💡 Tip: Add OPENAI_API_KEY to .env to enable OpenAI`);
    console.log(`⚠️  WARNING: App requires OpenAI API key to function`);
  }
  
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

