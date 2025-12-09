# 🎯 Complete Stripe Setup Guide

## ✅ What's Already Working
- ✅ Stripe checkout sessions
- ✅ Backend payment processing
- ✅ Upgrade modal with 3 plans
- ✅ Webhook handlers (code ready)

## 📋 What You Need to Do

### 1. **Set Up Stripe Webhooks** (For Production)

Webhooks automatically update user subscriptions when payments succeed.

#### Step 1: Get Your Webhook Secret
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **For local testing:** Use `stripe CLI` (see below)
   - **For production:** `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded` (for credits)
5. Copy the **"Signing secret"** (starts with `whsec_...`)

#### Step 2: Add to Backend `.env`
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

#### Step 3: Test Locally (Optional)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Copy the webhook secret it gives you and add to .env
```

### 2. **Create Success/Cancel Pages**

I'll create these pages for you now - they're missing but needed for after checkout.

### 3. **Test Payment Flow**

1. Click "Upgrade" in the app
2. Select a plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future expiry date
5. Any 3-digit CVC
6. Complete checkout
7. Should redirect to success page

---

## 🚀 Quick Start Commands

```bash
# 1. Add webhook secret to .env
echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE" >> backend/.env

# 2. Restart backend
cd backend && npm run dev

# 3. Test checkout flow
# (Open app, click Upgrade, select plan)
```

---

## 📝 Next Steps After Setup

1. ✅ Webhooks configured → Subscriptions update automatically
2. ✅ Success pages → Users see confirmation
3. ✅ Test payments → Use test cards from Stripe
4. ✅ Go live → Switch to live mode in Stripe dashboard

---

**Need help?** Check Stripe docs: https://stripe.com/docs/webhooks
