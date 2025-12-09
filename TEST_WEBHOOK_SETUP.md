# 🧪 Test Webhook Setup - Complete Guide

## ✅ What's Already Configured

- ✅ Stripe webhook endpoint: Active
- ✅ Webhook secret in Render: Configured
- ✅ Frontend pointing to production backend

---

## 🎯 Testing Methods

### Method 1: Test in Production (Recommended)

Since you're using **LIVE MODE**, you can test with real payments:

#### Step 1: Make a Test Payment

1. **Open your app** (production or local with production backend)
2. **Click "Upgrade"** or hit a usage limit
3. **Select a plan** (Starter, Pro, or Premium)
4. **Complete checkout** with a real card (or use Stripe's test mode first)

#### Step 2: Check Render Logs

1. **Go to:** https://dashboard.render.com
2. **Click on your service:** BISEDA.AI
3. **Click:** "Logs" tab
4. **Look for:**
   - `✅ User upgraded to starter/pro/premium`
   - `checkout.session.completed` event
   - `customer.subscription.created` event

#### Step 3: Check Stripe Dashboard

1. **Go to:** https://dashboard.stripe.com
2. **Make sure:** You're in **LIVE MODE** (toggle top right)
3. **Go to:** Customers → Find your test customer
4. **Check:** Subscription should be active
5. **Go to:** Developers → Webhooks → Click on your webhook
6. **Check:** "Activity" tab - should show recent events

---

### Method 2: Test in Test Mode (Safer)

If you want to test without real charges:

#### Step 1: Switch Stripe to Test Mode

1. **Go to:** https://dashboard.stripe.com
2. **Toggle:** Switch to **TEST MODE** (top right)
3. **Note:** You'll need to create a test webhook endpoint

#### Step 2: Create Test Webhook

1. **Go to:** Developers → Webhooks
2. **Click:** "Add endpoint"
3. **URL:** `https://biseda-ai.onrender.com/api/stripe/webhook`
4. **Select events:** Same as production
5. **Copy test webhook secret** (different from live one)

#### Step 3: Add Test Secret to Render (Temporarily)

1. **Go to Render:** Environment tab
2. **Update:** `STRIPE_WEBHOOK_SECRET` with test secret
3. **Redeploy**

#### Step 4: Test with Test Card

1. **Use test card:** `4242 4242 4242 4242`
2. **Expiry:** Any future date (e.g., 12/25)
3. **CVC:** Any 3 digits (e.g., 123)
4. **Complete checkout**

---

## 🔍 What to Look For

### ✅ Success Indicators

**In Render Logs:**
```
✅ User upgraded to starter
checkout.session.completed event received
customer.subscription.created event received
```

**In Stripe Dashboard:**
- Webhook shows "200 OK" responses
- Customer has active subscription
- Events appear in webhook activity log

**In Your App:**
- User redirected to success page
- Subscription tier shows as active
- Usage limits updated

### ❌ Failure Indicators

**In Render Logs:**
```
Webhook signature verification failed
Error handling checkout completed
```

**In Stripe Dashboard:**
- Webhook shows "400" or "500" errors
- Events show as failed

**If you see errors:**
1. Check webhook secret matches in Render
2. Verify webhook URL is correct
3. Check backend logs for specific errors

---

## 🚀 Quick Test Steps

### Option A: Quick Production Test

1. **Open app** → Click "Upgrade"
2. **Select plan** → Complete checkout
3. **Check Render logs** → Look for success messages
4. **Check Stripe** → Verify subscription created

### Option B: Detailed Test

1. **Open Stripe Dashboard** → Webhooks → Your webhook
2. **Open Render Dashboard** → Logs tab
3. **Make payment** in your app
4. **Watch both dashboards** simultaneously
5. **Verify events** appear in both places

---

## 📊 Monitoring Webhook Events

### In Stripe Dashboard

1. **Go to:** Developers → Webhooks
2. **Click:** Your webhook endpoint
3. **Click:** "Activity" tab
4. **See:** All webhook events sent
5. **Click:** Any event to see details

### In Render Logs

1. **Go to:** Render Dashboard → Your Service → Logs
2. **Filter:** Search for "webhook" or "subscription"
3. **See:** Real-time webhook processing

---

## ✅ Test Checklist

- [ ] Made a test payment
- [ ] Checked Render logs for webhook events
- [ ] Verified subscription created in Stripe
- [ ] Confirmed user subscription activated in app
- [ ] Checked webhook activity in Stripe Dashboard

---

## 🎯 Expected Flow

1. **User completes checkout** → Stripe processes payment
2. **Stripe sends webhook** → `checkout.session.completed`
3. **Backend receives webhook** → Verifies signature
4. **Backend activates subscription** → Updates user tier
5. **User gets access** → Subscription active immediately

---

**Ready to test? Start with Method 1 (Production Test) and check the logs!** 🚀

