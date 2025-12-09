# 🎯 Final Stripe Setup Steps

## ✅ What's Already Done

- ✅ Stripe Secret Key (LIVE): Configured
- ✅ Price IDs: All 3 plans configured
- ✅ Frontend Price IDs: Configured in `.env`
- ✅ Backend routes: Implemented and ready
- ✅ Webhook handlers: Code ready

---

## 🔧 What's Left to Complete

### 1. Add Webhook Secret (CRITICAL)

**Why:** Webhooks automatically activate subscriptions when users pay.

#### Option A: Set Up Webhook in Stripe Dashboard (For Production)

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks
   - Make sure you're in **LIVE MODE** (toggle top right)

2. **Click "Add endpoint"**

3. **Enter endpoint URL:**
   - **For production:** `https://your-backend-url.com/api/stripe/webhook`
   - (You'll set this up after deploying backend)
   - **For now:** We'll use Stripe CLI for testing

4. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

5. **Copy the webhook secret** (starts with `whsec_...`)

6. **Add to `backend/.env`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

#### Option B: Test Locally with Stripe CLI (Recommended First)

```bash
# 1. Install Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login to Stripe
stripe login

# 3. Forward webhooks to local backend
stripe listen --forward-to localhost:3001/api/stripe/webhook

# 4. Copy the webhook secret it shows (starts with whsec_)
# 5. Add to backend/.env:
#    STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### 2. Add FRONTEND_URL to Backend

Add to `backend/.env`:
```bash
# For local development
FRONTEND_URL=http://localhost:5173

# For production (after deployment)
# FRONTEND_URL=https://bisedaai.com
```

---

## 📋 Complete Setup Checklist

### Backend (`backend/.env`):
- [x] `STRIPE_SECRET_KEY` ✅
- [x] `STRIPE_STARTER_PRICE_ID` ✅
- [x] `STRIPE_PRO_PRICE_ID` ✅
- [x] `STRIPE_PREMIUM_PRICE_ID` ✅
- [ ] `STRIPE_WEBHOOK_SECRET` ⚠️ NEEDS TO BE ADDED
- [ ] `FRONTEND_URL` ⚠️ NEEDS TO BE ADDED

### Frontend (`.env`):
- [x] `VITE_STRIPE_STARTER_PRICE_ID` ✅
- [x] `VITE_STRIPE_PRO_PRICE_ID` ✅
- [x] `VITE_STRIPE_PREMIUM_PRICE_ID` ✅
- [ ] `VITE_BACKEND_URL` (optional, defaults to localhost)

---

## 🧪 Test Payment Flow

Once webhook secret is added:

1. **Start backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Test checkout:**
   - Open app
   - Click "Upgrade" or hit limit
   - Select a plan
   - Use test card: `4242 4242 4242 4242`
   - Expiry: 12/25, CVC: 123
   - Complete checkout

4. **Verify:**
   - Should redirect to success page
   - Check backend logs - should see subscription activated
   - Check Stripe Dashboard → Customers - should see subscription

---

## 🚀 Next Steps After Setup

1. ✅ **Test locally** with Stripe CLI webhooks
2. ✅ **Deploy backend** to production (Railway/Render)
3. ✅ **Set up production webhook** in Stripe Dashboard
4. ✅ **Update webhook URL** to production URL
5. ✅ **Test production** payment flow

---

## ⚠️ Important Notes

- **You're using LIVE keys** (`sk_live_...`) - this means real payments!
- **For testing:** Consider using test mode first
- **Webhooks are critical** - without them, subscriptions won't activate automatically
- **After deployment:** Update webhook URL to production backend URL

---

**Ready to add the webhook secret? Let me know and I'll help you!** 🚀

