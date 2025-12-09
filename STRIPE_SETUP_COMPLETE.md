# 💳 Complete Stripe Setup - Step by Step

## ✅ What's Already Configured

- ✅ Stripe Secret Key (LIVE mode): `sk_live_...`
- ✅ Price IDs configured:
  - Starter: `price_1SYZLeC8OkxaxQZmxathHpry`
  - Pro: `price_1SYZQFC8OkxaxQZmBCD3spKB`
  - Premium: `price_1SYZQoC8OkxaxQZmgygP6ypc`
- ✅ Backend Stripe routes implemented
- ✅ Webhook handlers ready

---

## 🔧 What Needs to Be Done

### 1. Add Frontend Environment Variables

Create/update `.env` file in project root:

```bash
# Frontend .env file (root directory)
VITE_BACKEND_URL=http://localhost:3001
VITE_STRIPE_STARTER_PRICE_ID=price_1SYZLeC8OkxaxQZmxathHpry
VITE_STRIPE_PRO_PRICE_ID=price_1SYZQFC8OkxaxQZmBCD3spKB
VITE_STRIPE_PREMIUM_PRICE_ID=price_1SYZQoC8OkxaxQZmgygP6ypc
```

### 2. Set Up Stripe Webhooks (CRITICAL)

**Why:** Webhooks automatically activate subscriptions when users pay.

#### Step 1: Go to Stripe Dashboard
1. Go to: https://dashboard.stripe.com/webhooks
2. Make sure you're in **LIVE MODE** (toggle top right)

#### Step 2: Add Webhook Endpoint
1. Click **"Add endpoint"**
2. **Endpoint URL:** 
   - For local testing: Use Stripe CLI (see below)
   - For production: `https://your-backend-url.com/api/stripe/webhook`
3. **Description:** "Biseda.ai Subscription Webhooks"

#### Step 3: Select Events
Select these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

#### Step 4: Copy Webhook Secret
1. After creating endpoint, Stripe shows **"Signing secret"**
2. Copy it (starts with `whsec_...`)
3. Add to `backend/.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

### 3. Test Locally (Optional)

**Install Stripe CLI:**
```bash
brew install stripe/stripe-cli/stripe
```

**Login:**
```bash
stripe login
```

**Forward webhooks to local backend:**
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

**Copy the webhook secret** it gives you and add to `backend/.env`

---

## 📋 Complete Checklist

### Backend Setup:
- [x] Stripe Secret Key configured
- [x] Price IDs configured
- [ ] Webhook Secret added to `backend/.env`
- [ ] `FRONTEND_URL` set in `backend/.env` (for production)

### Frontend Setup:
- [ ] `.env` file created with Price IDs
- [ ] `VITE_BACKEND_URL` configured
- [ ] Price IDs match backend

### Stripe Dashboard:
- [ ] Webhook endpoint created
- [ ] Webhook events selected
- [ ] Webhook secret copied

### Testing:
- [ ] Test checkout flow works
- [ ] Test webhook receives events
- [ ] Test subscription activates after payment

---

## 🚀 Quick Setup Commands

```bash
# 1. Create frontend .env file
cat > .env << 'EOF'
VITE_BACKEND_URL=http://localhost:3001
VITE_STRIPE_STARTER_PRICE_ID=price_1SYZLeC8OkxaxQZmxathHpry
VITE_STRIPE_PRO_PRICE_ID=price_1SYZQFC8OkxaxQZmBCD3spKB
VITE_STRIPE_PREMIUM_PRICE_ID=price_1SYZQoC8OkxaxQZmgygP6ypc
EOF

# 2. Add webhook secret to backend/.env
# (You'll get this from Stripe Dashboard or Stripe CLI)

# 3. Restart backend
cd backend && npm run dev

# 4. Restart frontend
npm run dev
```

---

## 🧪 Test Payment Flow

1. **Open your app**
2. **Click "Upgrade"** or hit limit
3. **Select a plan** (Starter, Pro, or Premium)
4. **Use Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
5. **Complete checkout**
6. **Should redirect to success page**
7. **Check backend logs** - should see subscription activated

---

## ⚠️ Important Notes

### For Production:
- **Backend URL:** Must be production URL (not localhost)
- **Webhook URL:** Must be production backend URL + `/api/stripe/webhook`
- **FRONTEND_URL:** Must be your app's production URL
- **Use LIVE keys:** You're already using `sk_live_...` ✅

### Security:
- Never commit `.env` files to Git
- Keep webhook secret secure
- Use environment variables in production hosting

---

## ✅ You're Almost Done!

**Next steps:**
1. Add frontend `.env` file with Price IDs
2. Set up webhook in Stripe Dashboard
3. Add webhook secret to backend `.env`
4. Test payment flow
5. Deploy backend to production
6. Update webhook URL to production URL

**Once webhooks are set up, Stripe will automatically:**
- ✅ Activate subscriptions when users pay
- ✅ Cancel subscriptions when users cancel
- ✅ Update subscriptions when they change plans
- ✅ Handle all payment events automatically

---

**Ready to finish? Let me know and I'll help you complete each step!** 🚀

