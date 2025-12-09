# 🚀 GitHub Pages Setup - Upload Your Legal Pages

## ✅ You're on GitHub! Perfect!

Now let's upload your legal pages using GitHub Pages (FREE hosting).

---

## 📋 Step-by-Step Guide

### Step 1: Create New Repository

1. **Click the green "New" button** (top left, next to "Top repositories")
   - OR click the "+" icon (top right) → "New repository"

2. **Fill in repository details:**
   - **Repository name:** `bisedaai-legal` (or `bisedaai-website`)
   - **Description:** (optional) "Legal pages for Biseda.ai"
   - **Visibility:** 
     - ✅ **Public** (required for free GitHub Pages)
   - **DO NOT** check "Add a README file" (we'll upload files manually)
   - **DO NOT** add .gitignore or license

3. **Click:** "Create repository" (green button)

---

### Step 2: Upload Your HTML Files

**After creating the repo, you'll see an empty repository page.**

**Option A: Upload via Web Interface (Easiest)**

1. **Click:** "uploading an existing file" (link on empty repo page)
   - OR click "Add file" → "Upload files"

2. **Drag and drop your 3 files:**
   - `index.html`
   - `privacy.html`
   - `terms.html`
   
   **Files are located at:**
   - `/Users/xhuljongashi/BISEDA.AI/legal-pages/index.html`
   - `/Users/xhuljongashi/BISEDA.AI/legal-pages/privacy.html`
   - `/Users/xhuljongashi/BISEDA.AI/legal-pages/terms.html`

3. **Scroll down, add commit message:**
   - "Initial commit - legal pages"

4. **Click:** "Commit changes" (green button)

**Option B: Upload via GitHub Desktop (If you have it)**

1. Clone the repository
2. Copy files to repository folder
3. Commit and push

---

### Step 3: Enable GitHub Pages

1. **Go to repository Settings:**
   - Click "Settings" tab (top of repository page)

2. **Scroll down to "Pages" section:**
   - Left sidebar → "Pages" (under "Code and automation")

3. **Configure Pages:**
   - **Source:** Select "Deploy from a branch"
   - **Branch:** Select "main" (or "master")
   - **Folder:** Select "/ (root)"
   - **Click:** "Save"

4. **Wait 1-2 minutes** for GitHub to build your site

5. **Get your URL:**
   - GitHub will show: `https://YOURUSERNAME.github.io/bisedaai-legal`
   - Example: `https://EmilioGashi56.github.io/bisedaai-legal`

---

### Step 4: Test Your Site

**Visit your GitHub Pages URL:**
- `https://YOURUSERNAME.github.io/bisedaai-legal`
- Should show your homepage ✅
- `https://YOURUSERNAME.github.io/bisedaai-legal/privacy.html` → Privacy Policy ✅
- `https://YOURUSERNAME.github.io/bisedaai-legal/terms.html` → Terms ✅

---

### Step 5: Point Your Domain to GitHub Pages

**Now go back to 123reg:**

1. **Go to:** 123reg → DNS Hosting (the page you were on earlier)

2. **Click:** "Add DNS Hosting" (green button)

3. **Add these DNS records:**

   **For main domain (bisedaai.com):**
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

4. **Back in GitHub:**
   - Go to repository Settings → Pages
   - Under "Custom domain", enter: `bisedaai.com`
   - Check "Enforce HTTPS"
   - Save

5. **Wait 10-30 minutes** for DNS to propagate

6. **Test:** `https://bisedaai.com` should work!

---

## ✅ Final URLs for App Store

**After DNS propagates:**
- Privacy Policy: `https://bisedaai.com/privacy.html`
- Terms: `https://bisedaai.com/terms.html`
- Support URL: `https://bisedaai.com`

**Use these in App Store Connect!**

---

## 🎯 Quick Checklist

- [ ] Create repository: `bisedaai-legal`
- [ ] Upload 3 HTML files
- [ ] Enable GitHub Pages
- [ ] Get GitHub Pages URL
- [ ] Add DNS records in 123reg
- [ ] Add custom domain in GitHub
- [ ] Wait for DNS propagation
- [ ] Test URLs work
- [ ] Submit to App Store!

---

## 💡 Pro Tips

- **GitHub Pages is FREE** and perfect for static sites
- **SSL certificate** is automatic (HTTPS)
- **Easy to update** - just edit files and commit
- **No hosting costs** - completely free!

---

## 🚨 Troubleshooting

**If GitHub Pages doesn't work:**
- Make sure repository is **Public**
- Check files are in **root** folder (not subfolder)
- Wait 2-3 minutes after enabling Pages

**If DNS doesn't work:**
- Wait 30 minutes - 2 hours for propagation
- Check DNS records are correct
- Verify custom domain is set in GitHub Pages settings

---

**You're almost there!** 🚀

