// Stripe payment routes
import express from 'express';
import Stripe from 'stripe';
import { getUser, saveUser } from '../models/User.js';

const router = express.Router();

// Lazy initialization of Stripe - get it when needed
function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY is missing from environment variables!');
    console.error('   Please add STRIPE_SECRET_KEY to backend/.env');
    return null;
  }
  return new Stripe(stripeSecretKey);
}

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      console.error('❌ Stripe not initialized - STRIPE_SECRET_KEY missing');
      return res.status(500).json({ error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to backend/.env' });
    }

    const { priceId, userId } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Get user
    const user = getUser(userId || req.ip);
    
    // Get frontend URL with fallback
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (!frontendUrl) {
      console.error('❌ FRONTEND_URL is not set');
      return res.status(500).json({ error: 'Frontend URL is not configured. Please add FRONTEND_URL to environment variables.' });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/subscription/cancel`,
      customer_email: req.body.email || undefined,
      metadata: {
        userId: user.userId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleSubscriptionCancelled(deletedSubscription);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Handle checkout completed
async function handleCheckoutCompleted(session) {
  try {
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('No userId in session metadata');
      return;
    }

    const user = getUser(userId);
    
    // Get subscription details
    const subscriptionId = session.subscription;
    if (subscriptionId) {
      const stripe = getStripe();
      if (!stripe) return;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      
      // Determine tier based on price ID
      let tier = 'free';
      if (process.env.STRIPE_STARTER_PRICE_ID === priceId) {
        tier = 'starter';
      } else if (process.env.STRIPE_PRO_PRICE_ID === priceId) {
        tier = 'pro';
      } else if (process.env.STRIPE_PREMIUM_PRICE_ID === priceId) {
        tier = 'premium';
      }
      
      const expiresAt = new Date(subscription.current_period_end * 1000);
      user.upgradeTo(tier, subscription.customer, subscriptionId, expiresAt);
      saveUser(user);
      
      console.log(`✅ User ${userId} upgraded to ${tier}`);
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

// Handle subscription update
async function handleSubscriptionUpdate(subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const user = getUser(userId);
    const priceId = subscription.items.data[0].price.id;
    
    let tier = 'free';
    if (process.env.STRIPE_STARTER_PRICE_ID === priceId) {
      tier = 'starter';
    } else if (process.env.STRIPE_PRO_PRICE_ID === priceId) {
      tier = 'pro';
    } else if (process.env.STRIPE_PREMIUM_PRICE_ID === priceId) {
      tier = 'premium';
    }
    
    const expiresAt = new Date(subscription.current_period_end * 1000);
    user.upgradeTo(tier, subscription.customer, subscription.id, expiresAt);
    saveUser(user);
    
    console.log(`✅ User ${userId} subscription updated to ${tier}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const user = getUser(userId);
    user.cancelSubscription();
    saveUser(user);
    
    console.log(`⚠️ User ${userId} subscription cancelled`);
  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
}

// Handle credit purchase (one-time payment)
async function handleCreditPurchase(paymentIntent) {
  try {
    const sessionId = paymentIntent.metadata?.session_id;
    if (!sessionId) {
      return;
    }
    
    // Retrieve the checkout session to get metadata
    const stripe = getStripe();
    if (!stripe) return;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || '0');
    
    if (!userId || !credits) {
      console.error('Missing userId or credits in session metadata');
      return;
    }
    
    const user = getUser(userId);
    user.addCredits(credits, 'purchase');
    saveUser(user);
    
    console.log(`✅ User ${userId} purchased ${credits} credits`);
  } catch (error) {
    console.error('Error handling credit purchase:', error);
  }
}

export default router;

