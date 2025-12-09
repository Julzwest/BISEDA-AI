# ✅ Next Steps Checklist - App Store Submission

## 🎉 What's Done

- ✅ Apple Developer Account (£79/year)
- ✅ Domain purchased (bisedaai.com)
- ✅ Stripe payments LIVE
- ✅ Legal pages created
- ✅ Files uploaded to GitHub
- ✅ GitHub Pages enabled
- ⏳ Fix home links (in progress)

---

## 📋 What's Next (In Order)

### 1. ✅ Finish Fixing Home Links (5 minutes)

**Do this now:**
- [ ] Fix `privacy.html` home link (if not done)
  - Change `href="/"` to `href="index.html"`
  - Commit changes
- [ ] Wait 1-2 minutes for GitHub Pages to rebuild
- [ ] Test: Click "Back to Home" - should work ✅

---

### 2. 🌐 Add Custom Domain to GitHub (5 minutes)

**On GitHub Pages settings:**
- [ ] Go to: https://github.com/Julzwest/bisedaai-legal/settings/pages
- [ ] Scroll to "Custom domain" section
- [ ] Type: `bisedaai.com`
- [ ] Click "Save"
- [ ] GitHub will show DNS instructions

---

### 3. 🔧 Configure DNS in 123reg (10 minutes)

**After adding domain in GitHub:**
- [ ] Go to: 123reg → DNS Hosting
- [ ] Add 4 A records:
  ```
  Type: A, Name: @, Value: 185.199.108.153
  Type: A, Name: @, Value: 185.199.109.153
  Type: A, Name: @, Value: 185.199.110.153
  Type: A, Name: @, Value: 185.199.111.153
  ```
- [ ] Save all records
- [ ] Wait 30 minutes - 2 hours for DNS propagation

---

### 4. 🚀 Deploy Backend to Production (30 minutes)

**CRITICAL:** Your backend is on `localhost:3001` - this won't work for App Store!

**Options:**

**Option A: Railway (Recommended - FREE)**
- [ ] Sign up: https://railway.app
- [ ] Create new project
- [ ] Connect GitHub repo (or upload backend folder)
- [ ] Add environment variables:
  - `OPENAI_API_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `FRONTEND_URL=https://bisedaai.com`
  - All other vars from `.env`
- [ ] Deploy
- [ ] Get URL: `https://your-app.railway.app`
- [ ] Add `api.bisedaai.com` subdomain
- [ ] Update DNS in 123reg (CNAME: `api` → `your-app.railway.app`)

**Option B: Render (FREE)**
- [ ] Sign up: https://render.com
- [ ] Create Web Service
- [ ] Connect GitHub repo
- [ ] Add environment variables
- [ ] Deploy
- [ ] Add custom domain

**Option C: Fly.io (FREE)**
- [ ] Sign up: https://fly.io
- [ ] Deploy backend
- [ ] Add custom domain

---

### 5. 📱 Update App with Production Backend URL

**After backend is deployed:**
- [ ] Update `VITE_BACKEND_URL` in your app
- [ ] Change from `http://localhost:3001` to `https://api.bisedaai.com`
- [ ] Rebuild app: `npm run build`
- [ ] Test API calls work

---

### 6. 🎨 Prepare App Assets

**Screenshots (Required):**
- [ ] Take screenshots from simulator/device:
  - Home screen
  - Biseda Chat feature
  - AI Coach feature
  - First Dates feature
  - Tips page
- [ ] Sizes needed:
  - iPhone 6.7" (1290 x 2796)
  - iPhone 6.5" (1242 x 2688)
  - iPhone 5.5" (1242 x 2208)

**App Icon (Required):**
- [ ] Create 1024x1024 icon from your Biseda logo
- [ ] Use: https://www.appicon.co/ or similar tool
- [ ] Export all sizes

---

### 7. 📱 Build App in Xcode (30 minutes)

**Commands:**
```bash
cd /Users/xhuljongashi/BISEDA.AI
npm run build
npm run cap:sync
npm run cap:open:ios
```

**In Xcode:**
- [ ] Select your development team
- [ ] Configure signing
- [ ] Select "Any iOS Device"
- [ ] Product → Archive
- [ ] Distribute → App Store Connect
- [ ] Upload

---

### 8. 📝 Create App in App Store Connect (15 minutes)

**Go to:** https://appstoreconnect.apple.com/

- [ ] Click "+" → "New App"
- [ ] Fill in:
  - Platform: iOS
  - Name: Biseda.ai
  - Bundle ID: ai.biseda.app
  - SKU: biseda-ai-001
- [ ] Click "Create"

---

### 9. 📋 Fill App Store Listing (20 minutes)

**In App Store Connect:**
- [ ] App description (I'll provide template)
- [ ] Upload screenshots
- [ ] Upload app icon (1024x1024)
- [ ] Privacy Policy URL: `https://bisedaai.com/privacy.html`
- [ ] Support URL: `https://bisedaai.com`
- [ ] Age rating: 17+ (Mature)
- [ ] Keywords: dating, chat, AI, Albanian, etc.

---

### 10. ✅ Submit for Review

- [ ] Fill in all required fields
- [ ] Upload build
- [ ] Add review notes (if needed)
- [ ] Click "Submit for Review"
- [ ] Wait 1-7 days for review

---

## 🎯 Priority Order

**Do these FIRST (Critical):**
1. ✅ Fix home links (almost done)
2. 🌐 Add custom domain to GitHub
3. 🔧 Configure DNS in 123reg
4. 🚀 Deploy backend to production
5. 📱 Update app with production backend URL

**Then:**
6. 🎨 Prepare screenshots & icon
7. 📱 Build app in Xcode
8. 📝 Create App Store listing
9. ✅ Submit for review

---

## ⏱️ Estimated Timeline

- **DNS Setup:** 1-2 hours (including wait time)
- **Backend Deployment:** 30 minutes
- **App Assets:** 1-2 hours
- **Build & Upload:** 30 minutes
- **App Store Listing:** 30 minutes
- **Review Time:** 1-7 days

**Total:** ~1-2 days of work + 1-7 days review

---

## 🚨 Critical: Backend Must Be Deployed!

**Your backend is currently on `localhost:3001` - this WON'T work for App Store!**

**You MUST deploy to production before submitting:**
- Railway, Render, or Fly.io (all FREE)
- Update app to use production URL
- Test everything works

---

## 📞 Need Help?

**I can help you with:**
- ✅ DNS configuration
- ✅ Backend deployment
- ✅ App Store listing content
- ✅ Building in Xcode

**Just ask!** 🚀

