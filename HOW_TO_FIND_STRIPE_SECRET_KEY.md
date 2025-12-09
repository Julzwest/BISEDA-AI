# 🔑 How to Find Your Stripe Secret Key

## 📍 Step-by-Step Guide

### Step 1: Log into Stripe Dashboard
1. Go to: **https://dashboard.stripe.com**
2. Log in with your Stripe account

---

### Step 2: Navigate to API Keys
1. **Look at the left sidebar** (navigation menu)
2. **Scroll down** to find **"Developers"** section
3. **Click on "Developers"**
4. **Click on "API keys"** (under Developers)

**OR**

1. **Click the menu icon** (☰) in top-left if sidebar is collapsed
2. **Find "Developers"** → **"API keys"**

---

### Step 3: Find Your Secret Key

You'll see two keys:

1. **Publishable key** (starts with `pk_test_...`)
   - This is visible by default
   - You DON'T need this one right now

2. **Secret key** (starts with `sk_test_...`)
   - This is hidden for security
   - **This is what you need!**

---

### Step 4: Reveal and Copy Secret Key

1. **Find the "Secret key"** section
2. **Click the "Reveal" button** (or eye icon 👁️)
3. **Copy the entire key** (it's long, starts with `sk_test_...`)
   - Example: `sk_test_51ABC123xyz789...`

**⚠️ Important:**
- Keep this key SECRET (never share it publicly)
- It starts with `sk_test_` (for test mode)
- Or `sk_live_` (for production/live mode)

---

## 📸 Visual Guide

**Stripe Dashboard Layout:**
```
┌─────────────────────────────────┐
│ Stripe Dashboard                │
├─────────────────────────────────┤
│ [☰] Biseda    [Search] [⚙️]    │
├─────────────────────────────────┤
│ Sidebar:                         │
│   • Home                         │
│   • Payments                     │
│   • Product catalogue            │
│   • Customers                    │
│   • ...                          │
│   • Developers  ← Click here     │
│     • API keys  ← Then here     │
│     • Webhooks                   │
│     • ...                        │
└─────────────────────────────────┘
```

**API Keys Page:**
```
┌─────────────────────────────────┐
│ API keys                        │
├─────────────────────────────────┤
│                                 │
│ Publishable key                 │
│ pk_test_51ABC123...            │
│ [Copy]                          │
│                                 │
│ Secret key                      │
│ sk_test_51ABC123...            │
│ [Reveal] ← Click this button    │
│                                 │
└─────────────────────────────────┘
```

---

## 🎯 Quick Path

**Fastest way:**
1. **Stripe Dashboard** → **Developers** (left sidebar)
2. **API keys** (under Developers)
3. **Secret key** → Click **"Reveal"**
4. **Copy** the key

---

## ✅ After You Get It

1. **Open:** `backend/.env`
2. **Add this line:**
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR_COPIED_KEY_HERE
   ```
3. **Save the file**
4. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

---

## 🔒 Security Note

- ✅ **Secret key** = Private (backend only, never expose)
- ✅ **Publishable key** = Public (can use in frontend, but you don't need it now)

**Never commit your Secret Key to Git!**

---

## 🆘 Can't Find It?

**Alternative ways:**
1. **Direct URL:** https://dashboard.stripe.com/apikeys
2. **Search bar:** Type "API keys" in Stripe Dashboard search
3. **Settings:** Sometimes under Account → Settings → API keys

---

**Once you copy the Secret Key, add it to `backend/.env` and restart the backend!** 🚀

