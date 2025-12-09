# 🗺️ Google Places API Setup Guide

## ✅ Google Places API is NOW Integrated!

Your Takime page will now show **REAL businesses** from Google with:
- ✅ Real addresses and locations
- ✅ Real ratings from Google reviews  
- ✅ Current operating hours
- ✅ Direct Google Maps links
- ✅ Verified business information

---

## 📋 How to Get Your Google Places API Key

### Step 1: Create a Google Cloud Account

1. Go to https://console.cloud.google.com
2. Sign in with your Google account
3. Click **"Create Project"** (if you don't have one)
4. Name it: "Biseda AI" or similar

### Step 2: Enable the Places API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Places API (New)"**
3. Click on it and click **"Enable"**

### Step 3: Create an API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Copy the API key that appears

### Step 4: Secure Your API Key (IMPORTANT!)

1. Click **"Edit API key"** (pencil icon)
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check **"Places API (New)"**
3. Under **"Application restrictions"**:
   - Select **"HTTP referrers (websites)"**
   - Add: `https://biseda-ai.onrender.com/*`
   - Add: `https://bisedaai.com/*`
   - Add: `http://localhost:*` (for testing)
4. Click **"Save"**

### Step 5: Add to Render

1. Go to https://dashboard.render.com
2. Find your `biseda-ai` service
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   ```
   Key: GOOGLE_PLACES_API_KEY
   Value: [paste your API key here]
   ```
6. Click **"Save Changes"**
7. Wait 2-3 minutes for Render to restart

---

## 💰 Pricing

Google Places API is **very affordable**:

- **FREE:** $200/month credit (about 11,500 searches!)
- **After free tier:** $0.017 per search (1.7 cents)
- **Example:** 1000 searches = $17

For your app, this is **FREE for the first few months** while you grow!

---

## 🧪 How to Test

1. Wait 2-3 minutes after adding the API key to Render
2. Go to `bisedaai.com/#/dates`
3. Select a city (e.g., Tiranë)
4. Select a category (e.g., Restorante)
5. Click **"Gjenero Sugjerime"**

**Look for:**
- ✅ **"Verified"** badge on results (means it's from Google!)
- ✅ Real business names you recognize
- ✅ Actual addresses in the city
- ✅ **"Shiko në Google Maps"** button that opens real location

---

## 🎯 How It Works

**Before (AI only):**
```
User searches → OpenAI generates from memory → Shows suggestions (may be outdated)
```

**After (Google Places + AI fallback):**
```
User searches → Google Places API (real-time) → Real verified businesses
       ↓
If Google not configured → Falls back to AI
```

---

## 🔍 What You'll See

**With Google Places:**
- Real business names (e.g., "Mulliri i Vjetër", "Oda Restaurant")
- Real addresses (e.g., "Rruga Dëshmorët e 4 Shkurtit, Tiranë")
- Real ratings from Google (e.g., 4.6 ⭐)
- Blue **"Verified"** badge
- Clickable Google Maps links

**Without Google Places (AI fallback):**
- AI-generated suggestions
- Generic descriptions
- No "Verified" badge
- Still works, but not real-time

---

## ❓ Troubleshooting

**Not seeing "Verified" badges?**
- Check that you added the API key to Render
- Wait 2-3 minutes for Render to restart
- Check Render logs for any errors

**Getting errors?**
- Make sure you **enabled "Places API (New)"** in Google Cloud
- Check that your API key restrictions allow `https://biseda-ai.onrender.com/*`

**Still using AI fallback?**
- Open browser console (F12)
- Look for "Google Places" messages
- The app will automatically fall back to AI if Google isn't configured

---

## 📊 Monitor Usage

1. Go to https://console.cloud.google.com
2. Click on **"APIs & Services"** → **"Dashboard"**
3. See how many searches you've used
4. You get **$200 FREE every month!**

---

**Your app is ready! Just add the Google Places API key to Render and you'll have real-time business search! 🎉**

