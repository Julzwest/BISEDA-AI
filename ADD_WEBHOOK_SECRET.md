# ✅ Add Webhook Secret to Render

## 🎯 Quick Steps

### Step 1: Go to Render Dashboard
1. **Go to:** https://dashboard.render.com
2. **Click on your service:** BISEDA.AI

### Step 2: Go to Environment Tab
1. **Click:** "Environment" tab (in the service page)
2. **Or:** Settings → Environment Variables

### Step 3: Add Variable
1. **Click:** "Add Environment Variable" button
2. **Key:** `STRIPE_WEBHOOK_SECRET`
3. **Value:** `whsec_jWyXJSDOMLXXDSWEi6tVjK2yExVsKT4f`
4. **Click:** "Save" or "Add"

### Step 4: Redeploy (if needed)
- Render will automatically redeploy when you add the variable
- Or click "Manual Deploy" → "Deploy latest commit"

---

## ✅ After Adding

Your production webhook is now fully configured!

**Test it:**
- Make a test payment
- Check Render logs to see webhook events
- Verify subscription activates automatically

---

**Go add it to Render now!**

