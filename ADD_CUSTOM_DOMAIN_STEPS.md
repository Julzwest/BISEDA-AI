# 🌐 Add Custom Domain to GitHub Pages

## ✅ Step 1: Go to GitHub Pages Settings

**URL:** https://github.com/Julzwest/bisedaai-legal/settings/pages

**OR:**
1. Go to: https://github.com/Julzwest/bisedaai-legal
2. Click "Settings" tab (top)
3. Left sidebar → "Pages" (under "Code and automation")

---

## ✅ Step 2: Add Custom Domain

**On the Pages settings page:**

1. **Scroll down** to "Custom domain" section

2. **In the text field**, type:
   ```
   bisedaai.com
   ```
   (No `www`, no `https://`, just `bisedaai.com`)

3. **Click:** "Save" button

4. **GitHub will show:**
   - "DNS check in progress"
   - DNS instructions with IP addresses
   - Status updates

---

## ✅ Step 3: Note DNS Information

**After saving, GitHub will show you need to add:**

**4 A records** with these IP addresses:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**Write these down** - you'll need them for 123reg!

---

## ✅ Step 4: Enable HTTPS (After DNS)

**Once DNS is configured:**

1. **Come back to GitHub Pages settings**
2. **Check:** "Enforce HTTPS" checkbox
3. **Wait** a few minutes for SSL certificate

---

## 🎯 What Happens Next

**After adding domain:**
- GitHub will check DNS (will fail until you add DNS records)
- Status: "DNS check in progress" or "DNS check failed" (normal!)
- Once DNS records are added in 123reg, status will change to "DNS check passed"
- Then your site will be live at `https://bisedaai.com`

---

## 📋 After This Step

**Next:** Configure DNS in 123reg (I'll guide you through this!)

---

**Go add `bisedaai.com` in GitHub now!** 🚀

