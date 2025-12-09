# 🌐 Add Custom Domain to GitHub Pages

## ✅ GitHub Pages is Enabled!

Your site is now live at: **https://julzwest.github.io/bisedaai-legal**

---

## 📋 Step 1: Test Your Site First

**Before adding custom domain, test these URLs:**

- **Homepage:** https://julzwest.github.io/bisedaai-legal
- **Privacy:** https://julzwest.github.io/bisedaai-legal/privacy.html
- **Terms:** https://julzwest.github.io/bisedaai-legal/terms.html

**All should work!** ✅

---

## 📋 Step 2: Add Custom Domain

### On GitHub Pages Settings Page:

1. **Scroll down** to "Custom domain" section

2. **In the text field**, type:
   ```
   bisedaai.com
   ```

3. **Click:** "Save" button

4. **GitHub will show:**
   - DNS instructions
   - IP addresses to use
   - Status: "DNS check in progress"

5. **Wait a moment** - GitHub will verify DNS

---

## 📋 Step 3: Configure DNS in 123reg

### After adding domain in GitHub, you'll need to add DNS records:

**Go to 123reg:**

1. **Go to:** DNS Hosting (the page you were on earlier)
2. **Click:** "Add DNS Hosting" (if you haven't already)
3. **Add these A records:**

   ```
   Type: A
   Name: @ (or leave blank)
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

4. **Save** DNS records

5. **Wait 10-30 minutes** for DNS to propagate

---

## ✅ Step 4: Enable HTTPS

**Back on GitHub Pages settings:**

1. **Check:** "Enforce HTTPS" checkbox
2. **Wait** for SSL certificate to be issued (may take a few minutes)

---

## 🎯 Final URLs for App Store

**After DNS propagates (usually 30 minutes - 2 hours):**

- **Privacy Policy:** `https://bisedaai.com/privacy.html`
- **Terms of Service:** `https://bisedaai.com/terms.html`
- **Support URL:** `https://bisedaai.com`

**Use these in App Store Connect!**

---

## ⏱️ Timeline

- **GitHub Pages:** ✅ Enabled (working now!)
- **Custom Domain:** Add in GitHub (2 minutes)
- **DNS Records:** Add in 123reg (5 minutes)
- **DNS Propagation:** 30 minutes - 2 hours
- **HTTPS:** Automatic after DNS propagates

---

## 🚨 Troubleshooting

**If custom domain doesn't work:**

1. **Check DNS records** are correct in 123reg
2. **Wait longer** - DNS can take up to 48 hours (usually 30 min - 2 hours)
3. **Verify** custom domain is saved in GitHub
4. **Check** GitHub Pages shows "DNS check passed"

**If site doesn't load:**

- **Test GitHub URL first:** https://julzwest.github.io/bisedaai-legal
- **If that works:** DNS hasn't propagated yet, just wait
- **If that doesn't work:** Check GitHub Pages is enabled

---

## ✅ Checklist

- [x] GitHub Pages enabled ✅
- [ ] Test GitHub Pages URL works
- [ ] Add custom domain in GitHub
- [ ] Add DNS records in 123reg
- [ ] Wait for DNS propagation
- [ ] Enable HTTPS
- [ ] Test bisedaai.com URLs work
- [ ] Submit to App Store!

---

**Next: Add `bisedaai.com` in the Custom domain field and click Save!** 🚀

