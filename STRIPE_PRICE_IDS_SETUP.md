# 🔑 STRIPE PRICE IDs SETUP

## ✅ You've Created 3 Subscription Products - Now Configure Price IDs

### Step 1: Get Your Price IDs from Stripe

1. **Go to Stripe Dashboard** → **Products**
2. **Click on each product** you created:
   - Starter Plan (€7.99/month)
   - Pro Plan (€14.99/month)
   - Premium Plan (€24.99/month)
3. **Copy the Price ID** (starts with `price_...`)
   - It looks like: `price_1ABC123xyz...`

---

### Step 2: Add to Backend `.env` File

**File:** `backend/.env`

Add these lines (replace with your actual Price IDs):

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs - Subscriptions
STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID_HERE
STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID_HERE
STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_PRICE_ID_HERE

# Stripe Price IDs - Credits (One-time) - Add these later
STRIPE_CREDIT_STARTER_PRICE_ID=price_YOUR_CREDIT_STARTER_PRICE_ID_HERE
STRIPE_CREDIT_POPULAR_PRICE_ID=price_YOUR_CREDIT_POPULAR_PRICE_ID_HERE
STRIPE_CREDIT_PRO_PRICE_ID=price_YOUR_CREDIT_PRO_PRICE_ID_HERE
```

---

### Step 3: Add to Frontend `.env` File

**File:** `.env` (in root directory)

Create or update this file:

```env
VITE_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID_HERE
VITE_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID_HERE
VITE_STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_PRICE_ID_HERE
```

---

### Step 4: Restart Servers

After adding Price IDs:

1. **Restart Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Restart Frontend:**
   ```bash
   npm run dev
   ```

---

## 🎯 Quick Checklist

- [ ] Got Price ID for Starter Plan (€7.99)
- [ ] Got Price ID for Pro Plan (€14.99)
- [ ] Got Price ID for Premium Plan (€24.99)
- [ ] Added all 3 to `backend/.env`
- [ ] Added all 3 to `.env` (root)
- [ ] Restarted backend server
- [ ] Restarted frontend server

---

## 💡 Example

If your Price IDs are:
- Starter: `price_1ABC123xyz`
- Pro: `price_1DEF456abc`
- Premium: `price_1GHI789def`

Then in `backend/.env`:
```env
STRIPE_STARTER_PRICE_ID=price_1ABC123xyz
STRIPE_PRO_PRICE_ID=price_1DEF456abc
STRIPE_PREMIUM_PRICE_ID=price_1GHI789def
```

And in `.env` (root):
```env
VITE_STRIPE_STARTER_PRICE_ID=price_1ABC123xyz
VITE_STRIPE_PRO_PRICE_ID=price_1DEF456abc
VITE_STRIPE_PREMIUM_PRICE_ID=price_1GHI789def
```

---

## ✅ Once Done

Your app will be able to:
- ✅ Show correct prices (€7.99, €14.99, €24.99)
- ✅ Redirect users to Stripe checkout
- ✅ Process subscription payments
- ✅ Upgrade users automatically

**You're almost ready to accept payments!** 🚀

