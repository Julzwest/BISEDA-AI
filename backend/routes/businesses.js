// Business partnership routes
import express from 'express';
import Stripe from 'stripe';
import {
  getAllBusinesses,
  getBusiness,
  getBusinessesByCityAndCategory,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  saveBusiness
} from '../models/Business.js';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Get all businesses (with filters)
router.get('/', (req, res) => {
  try {
    const { city, category } = req.query;
    
    let businesses;
    if (city && category) {
      businesses = getBusinessesByCityAndCategory(city, category);
    } else {
      businesses = getAllBusinesses();
    }
    
    // Sort: Sponsored first, then Featured, then by rating
    businesses.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return -1;
      return parseFloat(b.rating) - parseFloat(a.rating);
    });
    
    res.json(businesses.map(b => b.toJSON()));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get business by ID
router.get('/:id', (req, res) => {
  try {
    const business = getBusiness(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business.toJSON());
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Create business (admin only - add auth middleware later)
router.post('/', (req, res) => {
  try {
    const business = createBusiness(req.body);
    res.status(201).json(business.toJSON());
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

// Update business
router.put('/:id', (req, res) => {
  try {
    const business = updateBusiness(req.params.id, req.body);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business.toJSON());
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Delete business
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteBusiness(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

// Create partnership checkout session
router.post('/:id/partnership/checkout', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    
    const business = getBusiness(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const { tier } = req.body; // 'featured' or 'sponsored'
    if (!tier || !['featured', 'sponsored'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid partnership tier' });
    }
    
    const price = tier === 'sponsored' ? business.getSponsoredPrice() : business.getFeaturedPrice();
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${tier === 'sponsored' ? 'Sponsored' : 'Featured'} Listing - ${business.name}`,
              description: `Monthly ${tier} partnership for ${business.name}`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/business/partnership/success?session_id={CHECKOUT_SESSION_ID}&business_id=${business.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/business/partnership/cancel`,
      metadata: {
        businessId: business.id,
        tier: tier,
      },
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating partnership checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set partnership (for webhook)
router.post('/:id/partnership', (req, res) => {
  try {
    const business = getBusiness(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const { tier, expiresAt, stripeCustomerId, stripeSubscriptionId } = req.body;
    business.setPartnership(tier, expiresAt, stripeCustomerId, stripeSubscriptionId);
    saveBusiness(business);
    
    res.json(business.toJSON());
  } catch (error) {
    console.error('Error setting partnership:', error);
    res.status(500).json({ error: 'Failed to set partnership' });
  }
});

export default router;

