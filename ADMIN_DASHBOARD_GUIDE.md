# 🎯 Admin Dashboard Guide

## ✅ **FULLY DEPLOYED & READY!**

Your admin dashboard is now **LIVE** and ready to use!

---

## 🌐 **How to Access**

### **URL:**
```
https://bisedaai.com/#/admin
```

### **Admin Credentials:**
- **Username:** `EMILIOBABUSH`
- **Password:** `Servetbena56@`

---

## 📊 **Dashboard Features**

### **1️⃣ Overview Stats** (Top Cards)
- **Total Users** - How many users have used the app
- **Active Today** - Users who were active today
- **Total Messages** - All messages sent across all users
- **Monthly Revenue** - Total subscription revenue (€7.99 + €14.99 + €24.99 plans)

### **2️⃣ Financial Overview**
- **Monthly Revenue** - Income from subscriptions
- **Total API Cost** - How much you're spending on OpenAI API
- **Profit** - Revenue minus API costs
- **Credits Balance** - Total credits across all users

### **3️⃣ Subscription Breakdown**
See exactly how many users are on each plan:
- **Free** - 0 revenue
- **Starter** - €7.99/month each
- **Pro** - €14.99/month each
- **Premium** - €24.99/month each

### **4️⃣ Top 10 Users**
Shows your most active users:
- User ID (anonymized)
- Subscription tier
- Total messages sent
- Total API cost for that user

### **5️⃣ All Users List**
Complete list of every user with:
- **User ID** - Unique identifier
- **Subscription Tier** - Free/Starter/Pro/Premium
- **Created Date** - When they first used the app
- **Last Active** - Most recent activity
- **Daily Messages** - Messages sent today
- **Monthly Messages** - Messages sent this month
- **Total Cost** - API costs for this user
- **Credits** - Current credit balance
- **Stripe Customer ID** - If they've paid (shows first 12 characters)
- **Block/Unblock** - Button to block or unblock users

---

## 🔐 **Security Features**

### **Password Protection**
- Dashboard is password-protected
- Token stored in browser localStorage
- Must re-login if localStorage is cleared

### **Change Admin Credentials**
1. Go to **Render Dashboard** → Your Backend Service
2. Go to **Environment** tab
3. Add/Update variables:
   - **Key:** `ADMIN_USERNAME` → **Value:** `your-new-username`
   - **Key:** `ADMIN_PASSWORD` → **Value:** `your-new-password`
4. Click **Save Changes**
5. Backend will auto-redeploy (takes ~2 minutes)

**⚠️ Important:** After changing credentials, you'll need to log out and log back in with the new username and password.

---

## 🚀 **Backend API Endpoints**

Your backend now has these admin endpoints:

### **1. Authentication**
```
POST /api/admin/auth
Body: { "username": "EMILIOBABUSH", "password": "Servetbena56@" }
Response: { "success": true, "token": "...", "username": "EMILIOBABUSH" }
```

### **2. Get Stats**
```
GET /api/admin/stats
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Response: { overview: {...}, subscriptions: {...}, topUsers: [...] }
```

### **3. Get All Users**
```
GET /api/admin/users
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Response: { users: [...], total: 123 }
```

### **4. Block/Unblock User**
```
POST /api/admin/users/:userId/block
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: { "blocked": true }
Response: { "success": true, "isBlocked": true }
```

---

## 📈 **What You Can Do**

### **Monitor Growth**
- Track daily/weekly active users
- See new user registrations
- Identify your power users

### **Track Revenue**
- See exactly how much you're making per month
- Compare revenue to API costs
- Calculate profit margins

### **Manage Users**
- Block users who violate terms
- Unblock users after review
- See which users are paying vs. free

### **Optimize Costs**
- Identify users with high API usage
- See total API costs across all users
- Monitor profit margins

### **Customer Support**
- Look up specific users by ID
- Check their subscription status
- Verify payment via Stripe Customer ID

---

## 🛡️ **User Blocking**

### **Why Block a User?**
- Terms of Service violations
- Abuse of the system
- Spam or malicious behavior

### **How to Block:**
1. Find the user in the "All Users" list
2. Click the **"Block"** button (red, with lock icon)
3. User is immediately blocked

### **What Happens When Blocked?**
- User can still access the app
- BUT all API requests will be denied
- They'll see an error message
- You can unblock them anytime

### **How to Unblock:**
1. Find the blocked user (they'll have a "BLOCKED" badge)
2. Click the **"Unblock"** button (green, with unlock icon)
3. User can use the app again

---

## 📱 **Mobile Access**

The admin dashboard is **fully responsive** and works great on mobile!

Access it from your phone:
1. Open browser on your phone
2. Go to `https://bisedaai.com/#/admin`
3. Enter password
4. View all stats and manage users

---

## 🔄 **Auto-Refresh**

The dashboard **does NOT** auto-refresh. Click the **"Refresh"** button to get latest data.

**Why?**
- Saves on backend API calls
- You control when to fetch new data
- Better performance

---

## 💡 **Pro Tips**

### **1. Check it Daily**
- See how many new users you got
- Track daily active users
- Monitor revenue growth

### **2. Watch Your Costs**
- Keep an eye on "Total API Cost"
- Make sure profit stays positive
- Identify high-usage users

### **3. Engage Top Users**
- Reach out to your top 10 users
- Offer them special perks
- Get feedback to improve the app

### **4. Convert Free Users**
- Most users will be on Free plan initially
- Monitor conversion rate (Free → Paid)
- Optimize your upgrade prompts

### **5. Use Mobile**
- Add `bisedaai.com/#/admin` to your phone's home screen
- Check stats on the go
- Quick user management

---

## ⚙️ **Technical Details**

### **Data Storage**
- User data is stored **in-memory** on Render backend
- Data persists until server restart
- Consider adding a database for permanent storage (MongoDB, PostgreSQL)

### **Data Resets**
- If Render backend restarts, all user data resets
- This is normal for in-memory storage
- Stripe subscriptions will persist (they're on Stripe's servers)

### **Backend Deployment**
- Your backend is on Render
- Admin endpoints are already deployed
- Should work immediately

### **Frontend Deployment**
- Admin dashboard is on GitHub Pages
- Accessible at `bisedaai.com/#/admin`
- Already deployed and live

---

## 🚨 **Troubleshooting**

### **"Connection error" when logging in**
- Check if your backend is running on Render
- Go to Render dashboard and verify service is active
- Check Render logs for errors

### **"Invalid password"**
- Default password is `biseda2024admin`
- If you changed it, use your custom password
- Check Render environment variables for `ADMIN_PASSWORD`

### **No users showing**
- This is normal if no one has used the app yet
- Wait for users to interact with the app
- Backend starts with 0 users

### **Stats not updating**
- Click the "Refresh" button (top right)
- Auto-refresh is disabled by design
- Data is fetched on page load and manual refresh

### **Can't block/unblock users**
- Check browser console for errors
- Verify you're logged in (token in localStorage)
- Try refreshing the page

---

## 📞 **Need Help?**

If you run into issues:
1. Check Render backend logs
2. Check browser console (F12 → Console)
3. Verify backend is running on Render
4. Check that `ADMIN_PASSWORD` is set correctly

---

## 🎉 **You're All Set!**

Your admin dashboard is **LIVE** and ready to use!

**Next Steps:**
1. Visit `https://bisedaai.com/#/admin`
2. Login with `biseda2024admin`
3. Explore your dashboard
4. Change your password on Render (optional but recommended)
5. Bookmark the admin URL
6. Check it daily to monitor growth!

**🔥 Enjoy your new admin superpowers!** 🚀

