# 🌐 Using Your 123reg Domain (bisedaai.com)

## ✅ You Have the Domain - Let's Connect It!

You can use your 123reg domain in two ways:

---

## 🎯 Option 1: Point to External Hosting (Recommended - FREE)

**Best for:** Legal pages + Backend API

### Setup:

1. **Keep domain at 123reg** (you already have it)
2. **Host content elsewhere** (GitHub Pages, Netlify, Railway - all FREE)
3. **Point DNS** from 123reg to external hosting

**Cost:** $0/month (just domain renewal ~$10-15/year)

---

## 🎯 Option 2: Use 123reg Hosting (If Available)

**Best for:** Simple setup, everything in one place

### If 123reg Offers Hosting:

1. **Check your 123reg account:**
   - Look for "Hosting" or "Web Hosting"
   - See if you have hosting included

2. **Upload files:**
   - Use 123reg's file manager or FTP
   - Upload HTML files for legal pages

3. **DNS is automatic** (already configured)

**Cost:** Usually included or ~$5-10/month

---

## 📋 Recommended Setup (Option 1 - FREE)

### Step 1: Host Legal Pages on GitHub Pages

1. **Create GitHub repo:**
   ```bash
   mkdir bisedaai-legal
   cd bisedaai-legal
   
   # Create privacy.html
   # Create terms.html
   # Create CNAME file with: bisedaai.com
   
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOURUSERNAME/bisedaai-legal.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Repo → Settings → Pages
   - Source: `main` branch
   - Custom domain: `bisedaai.com`
   - Save

3. **Get GitHub Pages IPs:**
   - GitHub will show you: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

---

### Step 2: Configure DNS in 123reg

1. **Log in to 123reg:**
   - Go to: https://www.123reg.co.uk/
   - My Account → Domains → Manage

2. **Access DNS Settings:**
   - Click on `bisedaai.com`
   - Look for "DNS" or "DNS Management" or "Nameservers"
   - Click "Manage DNS" or "Edit DNS"

3. **Add A Records for Main Domain:**
   ```
   Type: A
   Name: @ (or leave blank/root)
   Value: 185.199.108.153
   TTL: 3600
   
   Type: A
   Name: @
   Value: 185.199.109.153
   TTL: 3600
   
   Type: A
   Name: @
   Value: 185.199.110.153
   TTL: 3600
   
   Type: A
   Name: @
   Value: 185.199.111.153
   TTL: 3600
   ```

4. **Add CNAME for www (optional):**
   ```
   Type: CNAME
   Name: www
   Value: YOURUSERNAME.github.io
   TTL: 3600
   ```

5. **Save DNS records**

---

### Step 3: Deploy Backend to Railway

1. **Sign up:** https://railway.app
2. **Deploy backend:**
   - New Project → Deploy from GitHub
   - Select your backend repo
   - Add environment variables
3. **Get Railway URL:**
   - Example: `https://biseda-api.railway.app`
4. **Add custom domain in Railway:**
   - Project → Settings → Domains
   - Add: `api.bisedaai.com`
   - Railway will show DNS instructions

---

### Step 4: Add API Subdomain in 123reg

1. **Go back to 123reg DNS:**
   - Same DNS management page

2. **Add CNAME for API:**
   ```
   Type: CNAME
   Name: api
   Value: your-app.railway.app (or your-app.onrender.com)
   TTL: 3600
   ```

3. **Save**

---

## 🔧 123reg DNS Configuration (Complete)

**Your Complete DNS Setup:**

```
Type    Name    Value                    TTL
A       @       185.199.108.153          3600
A       @       185.199.109.153          3600
A       @       185.199.110.153          3600
A       @       185.199.111.153          3600
CNAME   www     YOURUSERNAME.github.io   3600
CNAME   api     your-app.railway.app      3600
```

---

## 📝 Step-by-Step: Adding DNS Records in 123reg

### Method 1: Via 123reg Control Panel

1. **Log in:** https://www.123reg.co.uk/
2. **Navigate:** My Account → Domains → [bisedaai.com] → Manage
3. **Find:** "DNS" or "DNS Management" or "Advanced DNS"
4. **Click:** "Manage DNS" or "Edit DNS Records"
5. **Add Record:**
   - Click "Add Record" or "+"
   - Select type: A or CNAME
   - Fill in:
     - **Host/Name:** `@` (for root) or `api` (for subdomain)
     - **Points to/Value:** IP address or domain
     - **TTL:** 3600 (or default)
   - Save
6. **Repeat** for all records

### Method 2: Via 123reg DNS Manager

If 123reg has a separate DNS manager:
1. Go to DNS Manager
2. Select `bisedaai.com`
3. Add records as shown above

---

## ⏱️ DNS Propagation

- **Time:** 5 minutes to 2 hours (usually)
- **Check:** https://dnschecker.org
- **Test:** Try accessing `https://bisedaai.com` after 30 minutes

---

## ✅ Testing Your Setup

After DNS propagates:

1. **Test main domain:**
   ```bash
   curl https://bisedaai.com
   # Should show your privacy/terms page
   ```

2. **Test API subdomain:**
   ```bash
   curl https://api.bisedaai.com/api/usage
   # Should return API response
   ```

3. **Test legal pages:**
   - Visit: `https://bisedaai.com/privacy`
   - Visit: `https://bisedaai.com/terms`

---

## 🚨 Troubleshooting

### Domain not loading?
- **Wait:** DNS can take up to 2 hours
- **Check:** DNS records are correct
- **Verify:** Hosting is set up (GitHub Pages enabled)

### API subdomain not working?
- **Check:** CNAME record is correct
- **Verify:** Railway/Render domain is configured
- **Wait:** DNS propagation

### SSL certificate errors?
- **GitHub Pages:** Auto-generates SSL (may take 10-30 minutes)
- **Railway/Render:** Auto-generates SSL
- **Wait:** After DNS propagates, SSL will be issued

---

## 📞 123reg Support

If you need help with DNS:
- **Support:** https://www.123reg.co.uk/support/
- **Live Chat:** Available in dashboard
- **Phone:** Check your account

---

## 🎯 Your Final URLs

Once set up:
- **Main site:** `https://bisedaai.com`
- **Privacy Policy:** `https://bisedaai.com/privacy`
- **Terms of Service:** `https://bisedaai.com/terms`
- **Backend API:** `https://api.bisedaai.com`
- **Stripe Webhook:** `https://api.bisedaai.com/api/stripe/webhook`

**For App Store:**
- Privacy Policy URL: `https://bisedaai.com/privacy`
- Terms URL: `https://bisedaai.com/terms`

---

## 💡 Quick Start Checklist

- [ ] Domain purchased ✅ (bisedaai.com on 123reg)
- [ ] Create GitHub repo for legal pages
- [ ] Upload privacy.html and terms.html
- [ ] Enable GitHub Pages
- [ ] Add A records in 123reg DNS
- [ ] Deploy backend to Railway/Render
- [ ] Add api.bisedaai.com subdomain
- [ ] Add CNAME record in 123reg DNS
- [ ] Wait for DNS propagation (30 min - 2 hours)
- [ ] Test all URLs work
- [ ] Update app with new API URL
- [ ] Update Stripe webhooks
- [ ] Submit to App Store!

---

## 🚀 You're Ready!

Your domain is ready to use. Just:
1. Point DNS to your hosting
2. Deploy your content
3. Wait for DNS to propagate
4. Done! ✅

Need help with any step? Let me know!

