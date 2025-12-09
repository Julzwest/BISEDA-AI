# 🚀 Quick Start: Submit to App Store

## ✅ Apple Developer Account: DONE!

Now let's get your app submitted!

---

## 📋 Step-by-Step (Do This Now)

### Step 1: Build Your App (5 minutes)

```bash
# Navigate to project
cd /Users/xhuljongashi/BISEDA.AI

# Build web app
npm run build

# Sync Capacitor
npm run cap:sync

# Open in Xcode
npm run cap:open:ios
```

**What happens:**
- Xcode will open
- Your iOS project will load
- You'll see your app in Xcode

---

### Step 2: Configure in Xcode (2 minutes)

1. **Select Your Project** (left sidebar - "App")
2. **Go to:** "Signing & Capabilities" tab
3. **Under "Team":**
   - Click dropdown
   - Select your Apple Developer account
   - Xcode will automatically create certificates ✅
4. **Bundle Identifier:**
   - Should be: `ai.biseda.app`
   - If not, change it to match

**That's it!** Xcode handles the rest automatically.

---

### Step 3: Test Build (Optional but Recommended)

1. **Connect iPhone** (or use simulator)
2. **Select device** from top bar
3. **Click:** Play button (▶️) or press `Cmd + R`
4. **Wait:** App builds and runs
5. **Test:** Make sure everything works!

---

### Step 4: Create App in App Store Connect (5 minutes)

1. **Go to:** https://appstoreconnect.apple.com/
2. **Log in** with your Apple ID
3. **Click:** "+" → "New App"
4. **Fill in:**
   - Platform: **iOS**
   - Name: **Biseda.ai**
   - Primary Language: **English**
   - Bundle ID: **ai.biseda.app** (select from dropdown)
   - SKU: **biseda-ai-001**
5. **Click:** Create

**Done!** Your app is created in App Store Connect.

---

### Step 5: Archive & Upload (10 minutes)

**In Xcode:**

1. **Select:** "Any iOS Device" (not simulator) from top bar
2. **Menu:** Product → Archive
3. **Wait:** Build completes (may take 5-10 minutes)
4. **Organizer opens** automatically
5. **Click:** "Distribute App"
6. **Select:** "App Store Connect"
7. **Click:** Next → Next → Upload
8. **Wait:** Upload completes

**You'll get email** when Apple finishes processing (10-30 minutes).

---

### Step 6: Fill App Store Listing (15 minutes)

**In App Store Connect:**

1. **Go to:** Your App → App Store tab
2. **Fill in:**
   - App description (I'll provide template)
   - Screenshots (take from simulator)
   - App icon (1024x1024)
   - Privacy Policy URL: `https://bisedaai.com/privacy.html`
   - Support URL: `https://bisedaai.com`
3. **Set Age Rating:** 17+ (Mature)
4. **Click:** "Submit for Review"

---

## ⚠️ Before You Submit - Checklist

Make sure these are done:

- [ ] **Backend deployed** (not localhost!)
  - Deploy to Railway/Render
  - Update `VITE_BACKEND_URL` in app
  - Test API works

- [ ] **Legal pages uploaded**
  - Upload `privacy.html` to 123reg
  - Upload `terms.html` to 123reg
  - Test URLs work

- [ ] **App tested**
  - Build runs successfully
  - All features work
  - Stripe checkout works

- [ ] **Assets ready**
  - Screenshots (take from simulator)
  - App icon (1024x1024)

---

## 🎯 Let's Start Now!

**Run these commands:**

```bash
cd /Users/xhuljongashi/BISEDA.AI
npm run build
npm run cap:sync
npm run cap:open:ios
```

**Then follow Step 2 above!**

---

## 📞 Need Help?

If you get stuck:
- **Xcode errors:** Check signing & capabilities
- **Build fails:** Make sure backend URL is correct
- **Upload fails:** Check internet connection

**You've got this!** 🚀

