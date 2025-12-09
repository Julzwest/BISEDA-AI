# 🎯 Stripe Integration - Next Steps

## ✅ What You've Done
- ✅ Created 3 products in Stripe:
  - Premium plan: €24.99/month
  - Pro plan: €14.99/month
  - Starter Plan: €7.99/month

---

## 📋 Step 1: Get Price IDs

1. **In Stripe Dashboard**, click on each product
2. **Click on the price** (€24.99, €14.99, €7.99)
3. **Copy the Price ID** (starts with `price_...`)

You need:
- `price_...` for Starter Plan (€7.99)
- `price_...` for Pro Plan (€14.99)
- `price_...` for Premium Plan (€24.99)

**Where to find:**
- Go to Product → Click product → Click price → Copy "Price ID"

---

## 📋 Step 2: Add Price IDs to Backend

1. **Open:** `backend/.env`
2. **Add these lines:**

```env
STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_ID_HERE
STRIPE_PRO_PRICE_ID=price_YOUR_PRO_ID_HERE
STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_ID_HERE
```

**Example:**
```env
STRIPE_STARTER_PRICE_ID=price_1ABC123xyz
STRIPE_PRO_PRICE_ID=price_1DEF456abc
STRIPE_PREMIUM_PRICE_ID=price_1GHI789def
```

---

## 📋 Step 3: Add Price IDs to Frontend

1. **Create or open:** `.env` (in project root)
2. **Add these lines:**

```env
VITE_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_ID_HERE
VITE_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_ID_HERE
VITE_STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_ID_HERE
```

**Note:** Use the SAME Price IDs as backend

---

## 📋 Step 4: Get Stripe API Keys

1. **In Stripe Dashboard**, go to **Developers → API keys**
2. **Copy:**
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)

3. **Add to `backend/.env`:**

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

---

## 📋 Step 5: Set Up Webhook (For Production)

**For Local Testing (Optional):**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

**Copy the webhook signing secret** (starts with `whsec_...`)

**Add to `backend/.env`:**
```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**For Production:**
1. Deploy backend to hosting (Heroku, Railway, Render, etc.)
2. In Stripe Dashboard → Developers → Webhooks
3. Add endpoint: `https://your-backend.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
5. Copy webhook signing secret to `.env`

---

## 📋 Step 6: Restart Servers

After adding all environment variables:

```bash
# Stop backend
# (Ctrl+C in backend terminal)

# Restart backend
cd backend
npm run dev

# Restart frontend (if needed)
npm run dev
```

---

## 📋 Step 7: Test Payment Flow

1. **Open app:** `http://localhost:5173`
2. **Click "Upgrade"** button
3. **Select a plan** (Starter, Pro, or Premium)
4. **Should redirect to Stripe checkout**
5. **Use test card:** `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
6. **Complete payment**
7. **Should redirect back** to success page
8. **Check backend logs** for webhook events

---

## ✅ Checklist

- [ ] Got Price IDs from Stripe (3 prices)
- [ ] Added Price IDs to `backend/.env`
- [ ] Added Price IDs to `.env` (root)
- [ ] Added Stripe Secret Key to `backend/.env`
- [ ] Set up webhook (local or production)
- [ ] Added Webhook Secret to `backend/.env`
- [ ] Restarted backend server
- [ ] Tested payment flow

---

## 🐛 Troubleshooting

### Payment not working?
- Check backend logs for errors
- Verify Price IDs are correct
- Check Stripe Dashboard → Logs for errors

### Webhook not working?
- Make sure webhook endpoint is accessible
- Check webhook secret is correct
- Verify events are selected in Stripe Dashboard

### Still issues?
- Check `STRIPE_IMPLEMENTATION_STATUS.md` for details
- Verify all environment variables are set
- Check backend console for error messages

---

## 🎯 After Stripe Setup

Once Stripe is working:
1. ✅ Users can upgrade to paid plans
2. ✅ Subscriptions will auto-renew
3. ✅ Webhooks will update user tiers automatically
4. ✅ You can start making money! 💰

---

**Next:** Get your Price IDs and add them to the `.env` files!

