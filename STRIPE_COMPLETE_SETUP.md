# 💳 Complete Stripe Setup Checklist

## ✅ What's Already Done

- ✅ Stripe Secret Key configured
- ✅ Price IDs configured (Starter, Pro, Premium)
- ✅ Checkout sessions working
- ✅ Webhook handlers implemented (code ready)
- ✅ Success/Cancel pages created

---

## ⚠️ What Still Needs Configuration

### 1. **Stripe Webhooks (CRITICAL for Production)**

**Why:** Webhooks automatically update user subscriptions when payments succeed.

**Setup:**

#### Step 1: Go to Stripe Dashboard
1. **Go to:** https://dashboard.stripe.com/webhooks
2. **Make sure you're in LIVE MODE** (toggle top right)

#### Step 2: Add Webhook Endpoint
1. **Click:** "Add endpoint"
2. **Endpoint URL:** 
   - For production: `https://api.bisedaai.com/api/stripe/webhook`
   - (Or your Railway/Render backend URL + `/api/stripe/webhook`)
3. **Description:** "Biseda.ai webhooks"

#### Step 3: Select Events
**Select these events:**
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `payment_intent.succeeded` (for credit purchases)

#### Step 4: Add Webhook Secret
1. **After creating endpoint**, Stripe will show "Signing secret"
2. **Copy it** (starts with `whsec_...`)
3. **Add to backend `.env`:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```
4. **Restart backend**

---

### 2. **Update Success/Cancel URLs**

**In your backend** (`backend/routes/stripe.js`):

**Current URLs:**
```javascript
success_url: `${process.env.FRONTEND_URL}/subscription/success`
cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`
```

**Make sure `FRONTEND_URL` is set:**
- Production: `https://bisedaai.com`
- Or your app's URL

---

### 3. **Test Webhooks Locally (Optional)**

**If you want to test before production:**

1. **Install Stripe CLI:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login:**
   ```bash
   stripe login
   ```

3. **Forward webhooks:**
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

4. **Copy webhook secret** it gives you
5. **Add to `.env`** for testing

---

### 4. **Verify Stripe Configuration**

**Check these in Stripe Dashboard:**

- ✅ **Products:** Starter, Pro, Premium plans exist
- ✅ **Prices:** Price IDs match your `.env` file
- ✅ **Webhooks:** Endpoint configured (for production)
- ✅ **API Keys:** Using LIVE keys (not test)

---

## 📋 Stripe Production Checklist

- [ ] Webhook endpoint added in Stripe Dashboard (LIVE mode)
- [ ] Webhook secret copied to backend `.env`
- [ ] Webhook secret added: `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Backend restarted with new webhook secret
- [ ] Test webhook receives events (check Stripe Dashboard → Webhooks → Recent events)
- [ ] Success/Cancel URLs point to correct domain
- [ ] `FRONTEND_URL` set in production backend

---

## 🚨 Important Notes

### Webhooks Are Critical!

**Without webhooks:**
- ❌ Users pay but subscriptions don't activate automatically
- ❌ You'd have to manually update subscriptions
- ❌ Cancellations won't be processed automatically

**With webhooks:**
- ✅ Subscriptions activate automatically when paid
- ✅ Cancellations processed automatically
- ✅ Everything works seamlessly

---

## 🎯 Quick Setup Steps

1. **Go to Stripe Dashboard** → Webhooks
2. **Add endpoint:** `https://api.bisedaai.com/api/stripe/webhook`
3. **Select events** (listed above)
4. **Copy webhook secret**
5. **Add to backend `.env`**
6. **Restart backend**
7. **Test:** Make a test payment, check webhook receives event

---

## 📞 Need Help?

**Stripe Support:**
- https://support.stripe.com
- Dashboard: https://dashboard.stripe.com

**Your webhook endpoint will be:**
- `https://api.bisedaai.com/api/stripe/webhook` (after backend deployed)

---

**Set up webhooks after you deploy your backend to production!** 🚀

