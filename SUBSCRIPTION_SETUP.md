# Subscription System Setup Guide

## ✅ What's Been Implemented

### Backend
- ✅ User model with subscription tracking
- ✅ Usage tracking (daily/monthly)
- ✅ Subscription limits middleware
- ✅ Stripe integration
- ✅ Webhook handlers for subscription events

### Frontend
- ✅ Usage display component
- ✅ Upgrade modal
- ✅ Error handling for limits
- ✅ Upgrade prompts

---

## 🔧 Setup Instructions

### 1. Stripe Account Setup

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up for account
   - Get your API keys from Dashboard → Developers → API keys

2. **Create Products & Prices**
   - Go to Products → Add Product
   - Create "Basic Plan" - $4.99/month (recurring)
   - Create "Premium Plan" - $9.99/month (recurring)
   - Copy the Price IDs (starts with `price_...`)

3. **Set Up Webhook**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-backend-url.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy webhook signing secret (starts with `whsec_...`)

### 2. Backend Configuration

1. **Update `.env` file:**
```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
STRIPE_BASIC_PRICE_ID=price_your_basic_price_id_here
STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id_here
```

2. **Update Frontend `.env`:**
```bash
VITE_STRIPE_BASIC_PRICE_ID=price_your_basic_price_id_here
VITE_STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id_here
```

### 3. Test the System

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Start Frontend:**
```bash
npm run dev
```

3. **Test Flow:**
   - Send 10 messages (free limit)
   - Try 11th message → Should show upgrade prompt
   - Click upgrade → Should redirect to Stripe checkout
   - Complete test payment
   - Webhook should update subscription

---

## 📊 Subscription Tiers

### Free Tier
- **Messages:** 10 per day
- **Adult Content:** ❌ Blocked
- **Image Analysis:** ❌ Not available
- **Cost to you:** ~$0.09/month per user

### Basic Plan ($4.99/month)
- **Messages:** 100 per day
- **Adult Content:** ✅ Included
- **Image Analysis:** ❌ Not available
- **Cost to you:** ~$0.95/month per user
- **Profit:** $4.04/month (81% margin)

### Premium Plan ($9.99/month)
- **Messages:** 500 per day (capped)
- **Adult Content:** ✅ Included
- **Image Analysis:** ✅ Included (50 per day)
- **Cost to you:** ~$4.73/month per user
- **Profit:** $5.26/month (53% margin)

---

## 🔍 Usage Tracking

### Daily Limits
- Reset at midnight (user's timezone)
- Tracked per user
- Enforced in backend middleware

### Monthly Analytics
- Total messages sent
- Total image analyses
- Total cost incurred
- Stored per user

---

## 🚨 Error Codes

The system returns specific error codes:

- `LIMIT_EXCEEDED` - Daily message limit reached
- `SUBSCRIPTION_EXPIRED` - Subscription has expired
- `ADULT_CONTENT_BLOCKED` - Adult content requires subscription
- `FEATURE_NOT_AVAILABLE` - Feature not available on current plan

Frontend automatically shows upgrade modal for these errors.

---

## 📝 Next Steps

1. **Set up Stripe account** and get API keys
2. **Create products** in Stripe Dashboard
3. **Configure webhook** endpoint
4. **Update `.env` files** with Stripe keys
5. **Test payment flow** end-to-end
6. **Deploy backend** with webhook URL
7. **Test in production** with real payments

---

## 💡 Production Considerations

1. **Database Migration:** Currently using in-memory storage. Migrate to database (PostgreSQL/MongoDB) for production.

2. **User Authentication:** Currently using IP-based user IDs. Implement proper authentication (JWT tokens).

3. **Webhook Security:** Ensure webhook endpoint is secure and verifies Stripe signatures.

4. **Error Handling:** Add retry logic for failed webhook processing.

5. **Analytics:** Set up analytics dashboard to track:
   - Subscription conversions
   - Revenue
   - User usage patterns
   - Churn rate

---

## 🎯 Revenue Projections

With 1000 users (20% conversion):
- 200 Basic subscribers: $998/month
- 100 Premium subscribers: $999/month
- **Total Revenue:** $1,997/month
- **Total Costs:** ~$880/month
- **Net Profit:** $1,117/month

---

**You're ready to start making money!** 🎉

