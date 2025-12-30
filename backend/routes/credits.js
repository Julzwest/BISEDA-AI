// Credits system routes
import express from 'express';
import Stripe from 'stripe';
import { getUser, saveUser } from '../models/User.js';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Credit packages
const CREDIT_PACKAGES = {
  starter: {
    name: 'Starter Pack',
    price: 2.99,
    credits: 100,
    priceId: process.env.STRIPE_CREDIT_STARTER_PRICE_ID
  },
  popular: {
    name: 'Popular Pack',
    price: 9.99,
    credits: 400, // 350 + 50 bonus
    priceId: process.env.STRIPE_CREDIT_POPULAR_PRICE_ID
  },
  pro: {
    name: 'Pro Pack',
    price: 19.99,
    credits: 900, // 700 + 200 bonus
    priceId: process.env.STRIPE_CREDIT_PRO_PRICE_ID
  }
};

// Get credit balance
router.get('/balance', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.ip;
    const user = getUser(userId);
    const creditInfo = user.getCredits();
    
    res.json({
      balance: creditInfo.balance,
      history: creditInfo.history,
      packages: CREDIT_PACKAGES
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    res.status(500).json({ error: 'Failed to fetch credit balance' });
  }
});

// Get available packages
router.get('/packages', (req, res) => {
  try {
    res.json(CREDIT_PACKAGES);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Create checkout session for credits
router.post('/purchase', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    
    const { packageId } = req.body;
    const userId = req.headers['x-user-id'] || req.ip;
    
    if (!packageId || !CREDIT_PACKAGES[packageId]) {
      return res.status(400).json({ error: 'Invalid package ID' });
    }
    
    const packageData = CREDIT_PACKAGES[packageId];
    const user = getUser(userId);
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packageData.name,
              description: `${packageData.credits} credits`,
            },
            unit_amount: Math.round(packageData.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/credits/cancel`,
      metadata: {
        userId: user.userId,
        packageId: packageId,
        credits: packageData.credits.toString(),
      },
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating credit purchase checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Use credits (called when user sends message and subscription limit reached)
router.post('/use', (req, res) => {
  try {
    const { amount = 1 } = req.body;
    const userId = req.headers['x-user-id'] || req.ip;
    const user = getUser(userId);
    
    if (user.useCredits(amount)) {
      saveUser(user);
      res.json({
        success: true,
        remainingCredits: user.credits,
        message: `Used ${amount} credit(s)`
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Insufficient credits',
        remainingCredits: user.credits
      });
    }
  } catch (error) {
    console.error('Error using credits:', error);
    res.status(500).json({ error: 'Failed to use credits' });
  }
});

// Add credits (for webhook after successful payment)
router.post('/add', (req, res) => {
  try {
    const { userId, credits, source = 'purchase' } = req.body;
    
    if (!userId || !credits) {
      return res.status(400).json({ error: 'userId and credits required' });
    }
    
    const user = getUser(userId);
    user.addCredits(parseInt(credits), source);
    saveUser(user);
    
    res.json({
      success: true,
      balance: user.credits,
      message: `Added ${credits} credits`
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ error: 'Failed to add credits' });
  }
});

// Sync credits from client (server-side validation backup)
router.post('/sync', (req, res) => {
  try {
    const { userId, credits, tier, creditsUsedToday, lastResetDate } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    // Get or create user
    const user = getUser(userId);
    
    // Store the sync data for validation
    if (!user.syncData) {
      user.syncData = {};
    }
    
    user.syncData = {
      lastSync: new Date().toISOString(),
      clientCredits: credits,
      tier: tier,
      creditsUsedToday: creditsUsedToday,
      lastResetDate: lastResetDate
    };
    
    // Detect anomalies - credits should only decrease or stay same between syncs
    if (user.syncData.previousCredits !== undefined) {
      const creditsDiff = credits - user.syncData.previousCredits;
      if (creditsDiff > 0 && tier === user.syncData.previousTier) {
        // Credits increased without tier change - possible tampering
        console.warn(`⚠️ Possible credit tampering detected for user ${userId}. Previous: ${user.syncData.previousCredits}, Current: ${credits}`);
        user.syncData.anomalyDetected = true;
        user.syncData.anomalyCount = (user.syncData.anomalyCount || 0) + 1;
      }
    }
    
    user.syncData.previousCredits = credits;
    user.syncData.previousTier = tier;
    
    saveUser(user);
    
    res.json({
      success: true,
      message: 'Sync received',
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing credits:', error);
    res.status(500).json({ error: 'Failed to sync credits' });
  }
});

// Get server-side credit status (for validation)
router.get('/validate', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    const user = getUser(userId);
    
    res.json({
      success: true,
      syncData: user.syncData || {},
      hasAnomalies: user.syncData?.anomalyDetected || false,
      anomalyCount: user.syncData?.anomalyCount || 0
    });
  } catch (error) {
    console.error('Error validating credits:', error);
    res.status(500).json({ error: 'Failed to validate credits' });
  }
});

export default router;

