# 🔧 Stripe Webhook Setup - Quick Guide

## ✅ Stripe CLI Installed & Logged In

Great! You're ready to set up webhooks.

---

## 🚀 Quick Setup Steps

### Step 1: Start Webhook Listener

**Open a NEW terminal window** and run:

```bash
cd /Users/xhuljongashi/BISEDA.AI
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

**You'll see output like:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

### Step 2: Copy the Webhook Secret

Copy the webhook secret (starts with `whsec_...`)

### Step 3: Add to Backend .env

Add this line to `backend/.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

**Keep the Stripe listener running** in that terminal window while testing!

---

## 🧪 Test Payment Flow

1. **Make sure backend is running** (`npm run dev` in backend folder)
2. **Make sure Stripe listener is running** (in separate terminal)
3. **Start frontend:** `npm run dev`
4. **Open app** → Click "Upgrade"
5. **Select a plan**
6. **Use test card:** `4242 4242 4242 4242`
7. **Complete checkout**
8. **Check backend logs** - should see subscription activated!

---

## 📋 What You'll See

**In Stripe listener terminal:**
- Events being forwarded: `checkout.session.completed`, etc.

**In backend logs:**
- `✅ User upgraded to starter/pro/premium`

**In app:**
- Redirects to success page
- Subscription should be active

---

## ⚠️ Important Notes

- **Keep Stripe listener running** while testing locally
- **For production:** You'll set up webhook in Stripe Dashboard instead
- **Webhook secret is different** for local vs production

---

**Ready? Run the stripe listen command in a new terminal!** 🚀

