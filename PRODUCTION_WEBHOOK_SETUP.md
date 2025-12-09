# 🔗 Set Up Production Stripe Webhooks

## ✅ Backend is Live!

Your backend is running at: **https://biseda-ai.onrender.com**

---

## 🎯 Set Up Production Webhook

### Step 1: Go to Stripe Dashboard

1. **Go to:** https://dashboard.stripe.com/webhooks
2. **Make sure:** You're in **LIVE MODE** (toggle in top right)

### Step 2: Add Endpoint

1. **Click:** "Add endpoint" button
2. **Endpoint URL:** Enter:
   ```
   https://biseda-ai.onrender.com/api/stripe/webhook
   ```
3. **Description:** `BISEDA.AI Production Webhook`

### Step 3: Select Events

**Select these events:**
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### Step 4: Copy Webhook Secret

1. **After creating the endpoint**, Stripe will show a **Signing secret**
2. **Copy it** (starts with `whsec_`)

### Step 5: Add to Render Environment Variables

1. **Go back to Render:** https://dashboard.render.com
2. **Click on your service:** BISEDA.AI
3. **Go to:** Environment tab
4. **Click:** "Add Environment Variable"
5. **Key:** `STRIPE_WEBHOOK_SECRET`
6. **Value:** Paste the webhook secret you copied
7. **Save**

### Step 6: Redeploy (if needed)

- Render will automatically redeploy when you add the variable
- Or click "Manual Deploy" → "Deploy latest commit"

---

## ✅ After Setup

Your production webhooks are now configured!

**Test it:**
- Make a test payment
- Check Render logs to see webhook events
- Verify subscription activates automatically

---

**Go set up the webhook now!**

