# 🌐 Domain Requirements for App Store

## ❌ You DON'T Need a Custom Domain!

You can use **FREE** alternatives for everything:

---

## ✅ What You Need (And Free Options)

### 1. **Privacy Policy URL** (REQUIRED)
**Free Options:**
- ✅ **GitHub Pages** (FREE)
  - Create a repo: `biseda-privacy-policy`
  - Enable GitHub Pages
  - URL: `https://yourusername.github.io/biseda-privacy-policy/privacy.html`
  
- ✅ **Netlify** (FREE)
  - Drag & drop HTML file
  - URL: `https://your-app-name.netlify.app/privacy`
  
- ✅ **Vercel** (FREE)
  - Deploy static HTML
  - URL: `https://your-app-name.vercel.app/privacy`

**Example:** `https://biseda-ai.github.io/privacy-policy`

---

### 2. **Terms of Service URL** (REQUIRED)
**Same free options as above:**
- GitHub Pages
- Netlify
- Vercel

**Example:** `https://biseda-ai.github.io/terms-of-service`

---

### 3. **Backend API URL** (REQUIRED)
**Free Hosting Options:**

- ✅ **Railway** (FREE tier available)
  - URL: `https://your-app.railway.app`
  - Free tier: 500 hours/month
  
- ✅ **Render** (FREE tier available)
  - URL: `https://your-app.onrender.com`
  - Free tier: Spins down after inactivity
  
- ✅ **Heroku** (Paid now, but alternatives exist)
  - URL: `https://your-app.herokuapp.com`
  
- ✅ **Fly.io** (FREE tier)
  - URL: `https://your-app.fly.dev`
  
- ✅ **Vercel** (FREE for serverless)
  - URL: `https://your-app.vercel.app`

**Example:** `https://biseda-api.railway.app`

---

### 4. **Stripe Webhooks** (REQUIRED)
**Uses your backend URL:**
- Webhook URL: `https://your-backend-url.com/api/stripe/webhook`
- Example: `https://biseda-api.railway.app/api/stripe/webhook`

---

## 🎯 Quick Setup Guide

### Option 1: GitHub Pages (Easiest for Legal Pages)

1. **Create GitHub repo:**
   ```bash
   mkdir biseda-legal
   cd biseda-legal
   git init
   ```

2. **Create `privacy.html`:**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>Privacy Policy - Biseda.ai</title>
   </head>
   <body>
     <h1>Privacy Policy</h1>
     <!-- Your privacy policy content -->
   </body>
   </html>
   ```

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add privacy policy"
   git remote add origin https://github.com/yourusername/biseda-legal.git
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Select branch: `main`
   - Your URL: `https://yourusername.github.io/biseda-legal/privacy.html`

---

### Option 2: Railway (Easiest for Backend)

1. **Sign up:** https://railway.app
2. **Connect GitHub repo** (or deploy directly)
3. **Add environment variables:**
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - etc.
4. **Deploy**
5. **Get URL:** `https://your-app.railway.app`

---

## 💰 Cost Comparison

| Service | Custom Domain | Free Subdomain |
|---------|--------------|----------------|
| **Legal Pages** | $10-15/year | FREE (GitHub Pages) |
| **Backend API** | $10-15/year | FREE (Railway/Render) |
| **Total** | $20-30/year | **$0/year** |

---

## ✅ Recommended Setup (100% FREE)

1. **Legal Pages:** GitHub Pages
   - Privacy: `https://biseda-ai.github.io/privacy`
   - Terms: `https://biseda-ai.github.io/terms`

2. **Backend API:** Railway or Render
   - API: `https://biseda-api.railway.app`
   - Webhooks: `https://biseda-api.railway.app/api/stripe/webhook`

3. **Frontend:** (Optional - for web version)
   - Netlify or Vercel
   - URL: `https://biseda-app.netlify.app`

---

## 🎨 When You SHOULD Get a Domain

**Get a custom domain if:**
- ✅ You want professional branding (`biseda.ai`)
- ✅ You plan to build a website
- ✅ You want email addresses (`support@biseda.ai`)
- ✅ You have budget ($10-15/year)

**You DON'T need it if:**
- ❌ Just submitting to App Store
- ❌ Want to keep costs low
- ❌ Free subdomains work fine

---

## 📋 App Store Requirements

**What App Stores Need:**
- ✅ Privacy Policy URL (any public URL works)
- ✅ Terms of Service URL (any public URL works)
- ✅ Backend API accessible (any public URL works)

**They DON'T care about:**
- ❌ Custom domain vs subdomain
- ❌ Where it's hosted
- ❌ Professional domain name

---

## 🚀 Quick Start (No Domain Needed)

### Step 1: Host Legal Pages (5 minutes)
```bash
# Create privacy policy HTML
# Upload to GitHub Pages or Netlify
# Get URL: https://yourusername.github.io/privacy
```

### Step 2: Deploy Backend (10 minutes)
```bash
# Sign up for Railway
# Connect your backend repo
# Add environment variables
# Deploy
# Get URL: https://your-app.railway.app
```

### Step 3: Update App
```javascript
// In your app
VITE_BACKEND_URL=https://your-app.railway.app
```

### Step 4: Submit to App Store
- Privacy Policy: `https://yourusername.github.io/privacy`
- Backend: `https://your-app.railway.app`

**Done! No domain needed!** ✅

---

## 💡 Pro Tip

You can **always add a custom domain later**:
- Buy domain: `biseda.ai` ($10-15/year)
- Point it to your free hosting
- Update URLs in App Store
- No need to redeploy anything

**Start FREE, upgrade later if needed!**

