# 🌐 Setting Up bisedaai.com Domain

## ✅ Using bisedaai.com - Great Choice!

If you have or want to get `bisedaai.com`, here's how to set it up:

---

## 🎯 What You Can Use It For

### Option 1: Main Website (Recommended)
- **Main site:** `https://bisedaai.com`
- **Privacy Policy:** `https://bisedaai.com/privacy`
- **Terms:** `https://bisedaai.com/terms`
- **App Store links:** Use these URLs

### Option 2: Subdomains
- **API:** `https://api.bisedaai.com` (backend)
- **Legal:** `https://bisedaai.com/privacy` (legal pages)
- **Web App:** `https://app.bisedaai.com` (optional web version)

---

## 📋 Setup Steps

### Step 1: Buy Domain (If Not Already Owned)

**Where to Buy:**
- **Namecheap:** ~$10-15/year (recommended)
- **Google Domains:** ~$12/year
- **GoDaddy:** ~$12-15/year
- **Cloudflare:** ~$8-10/year (cheapest)

**Check Availability:**
- Visit: https://www.namecheap.com/domains/
- Search: `bisedaai.com`
- If available, purchase it

---

### Step 2: Host Legal Pages on bisedaai.com

**Option A: GitHub Pages with Custom Domain**

1. **Create GitHub repo:** `biseda-legal` or `bisedaai-website`
2. **Enable GitHub Pages:**
   - Settings → Pages
   - Custom domain: `bisedaai.com`
   - Add CNAME file with: `bisedaai.com`
3. **Update DNS:**
   - Add A record: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Or CNAME: `yourusername.github.io`
4. **Create pages:**
   - `/privacy.html` → `https://bisedaai.com/privacy`
   - `/terms.html` → `https://bisedaai.com/terms`

**Option B: Netlify (Easiest)**

1. **Sign up:** https://netlify.com
2. **Create site:**
   - Drag & drop HTML files
   - Or connect GitHub repo
3. **Add custom domain:**
   - Site settings → Domain management
   - Add: `bisedaai.com`
4. **Update DNS:**
   - Add CNAME: `your-site.netlify.app`
   - Or A records (Netlify will show you)

**Option C: Vercel**

1. **Sign up:** https://vercel.com
2. **Deploy:**
   - Connect GitHub repo
   - Or drag & drop
3. **Add domain:**
   - Project settings → Domains
   - Add: `bisedaai.com`
4. **Update DNS:**
   - Follow Vercel's instructions

---

### Step 3: Host Backend API

**Option A: Railway with Custom Domain**

1. **Deploy backend to Railway:**
   - Get URL: `https://biseda-api.railway.app`
2. **Add custom domain:**
   - Project → Settings → Domains
   - Add: `api.bisedaai.com`
3. **Update DNS:**
   - Add CNAME: `api` → `biseda-api.railway.app`
4. **Update app:**
   - Change `VITE_BACKEND_URL` to `https://api.bisedaai.com`

**Option B: Render with Custom Domain**

1. **Deploy backend to Render:**
   - Get URL: `https://biseda-api.onrender.com`
2. **Add custom domain:**
   - Service → Settings → Custom Domains
   - Add: `api.bisedaai.com`
3. **Update DNS:**
   - Add CNAME: `api` → `biseda-api.onrender.com`

**Option C: Fly.io with Custom Domain**

1. **Deploy backend to Fly.io:**
   - Get URL: `https://biseda-api.fly.dev`
2. **Add custom domain:**
   - `flyctl domains add api.bisedaai.com`
3. **Update DNS:**
   - Follow Fly.io instructions

---

### Step 4: Update Stripe Webhooks

**Update webhook URL:**
- Old: `https://biseda-api.railway.app/api/stripe/webhook`
- New: `https://api.bisedaai.com/api/stripe/webhook`

**In Stripe Dashboard:**
1. Go to Webhooks
2. Edit endpoint
3. Update URL to: `https://api.bisedaai.com/api/stripe/webhook`
4. Save

---

### Step 5: Update App Configuration

**Update environment variables:**

```bash
# .env (production)
VITE_BACKEND_URL=https://api.bisedaai.com
FRONTEND_URL=https://bisedaai.com
```

**Update backend .env:**
```bash
FRONTEND_URL=https://bisedaai.com
```

---

## 🎨 Recommended Setup

### Structure:
```
bisedaai.com                    → Main website (legal pages)
├── /privacy                    → Privacy Policy
├── /terms                      → Terms of Service
└── /                           → Landing page (optional)

api.bisedaai.com                → Backend API
└── /api/stripe/webhook         → Stripe webhooks
```

---

## 📝 DNS Configuration Example

**If using Namecheap:**

```
Type    Name    Value                    TTL
A       @       185.199.108.153           Automatic
A       @       185.199.109.153           Automatic
A       @       185.199.110.153           Automatic
A       @       185.199.111.153           Automatic
CNAME   api     biseda-api.railway.app   Automatic
```

**If using Cloudflare:**

```
Type    Name    Content                  Proxy
A       @       192.0.2.1                Proxied
CNAME   api     biseda-api.railway.app   Proxied
```

---

## ✅ Benefits of Using bisedaai.com

1. **Professional:** Looks more credible than subdomains
2. **Branding:** Consistent with app name
3. **SEO:** Better for search engines
4. **Email:** Can set up `support@bisedaai.com` later
5. **Future-proof:** Easy to expand (blog, docs, etc.)

---

## 💰 Cost Breakdown

| Item | Cost |
|------|------|
| Domain (bisedaai.com) | $10-15/year |
| Legal Pages Hosting | FREE (GitHub/Netlify) |
| Backend Hosting | FREE (Railway/Render) |
| **Total** | **$10-15/year** |

---

## 🚀 Quick Start Checklist

- [ ] Buy/verify `bisedaai.com` domain
- [ ] Set up DNS (point to hosting)
- [ ] Host legal pages on `bisedaai.com`
- [ ] Deploy backend to Railway/Render
- [ ] Add `api.bisedaai.com` subdomain
- [ ] Update Stripe webhooks
- [ ] Update app environment variables
- [ ] Test all URLs work
- [ ] Submit to App Store with new URLs

---

## 📞 Need Help?

**Domain Setup:**
- Namecheap: https://www.namecheap.com/support/
- Cloudflare: https://developers.cloudflare.com/dns/

**Hosting Setup:**
- GitHub Pages: https://pages.github.com/
- Netlify: https://docs.netlify.com/
- Railway: https://docs.railway.app/

---

## 💡 Pro Tip

**Start Simple:**
1. Use `bisedaai.com` for legal pages only
2. Keep backend on free subdomain (`railway.app`)
3. Add `api.bisedaai.com` later when ready

**Or Go Full Setup:**
1. `bisedaai.com` → Legal pages + landing page
2. `api.bisedaai.com` → Backend API
3. Professional setup from day one!

**Your choice!** Both work perfectly for App Store submission.

