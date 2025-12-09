# 🔧 Troubleshooting: Can Only See index.html

## Problem: Only index.html is visible, privacy.html and terms.html don't work

This usually means the files aren't uploaded correctly or the links are wrong.

---

## ✅ Solution 1: Check File Names (Most Common Issue)

**Make sure file names are EXACTLY:**
- `index.html` ✅
- `privacy.html` ✅ (not `Privacy.html` or `privacy.HTML`)
- `terms.html` ✅ (not `Terms.html` or `terms.HTML`)

**File names are case-sensitive!** They must be lowercase.

---

## ✅ Solution 2: Verify Files Are Uploaded

**In 123reg File Manager:**

1. **Go to:** `public_html` or `www` folder
2. **Check:** You should see all 3 files:
   - `index.html`
   - `privacy.html`
   - `terms.html`
3. **If files are missing:** Upload them again

---

## ✅ Solution 3: Check File Locations

**All 3 files must be in the SAME folder:**

```
public_html/
  ├── index.html      ✅
  ├── privacy.html    ✅
  └── terms.html      ✅
```

**NOT like this:**
```
public_html/
  ├── index.html      ✅
  └── legal-pages/
      ├── privacy.html    ❌ WRONG LOCATION
      └── terms.html       ❌ WRONG LOCATION
```

---

## ✅ Solution 4: Test Direct URLs

**Try accessing directly:**

1. **Privacy Policy:**
   - Go to: `https://bisedaai.com/privacy.html`
   - If it works → Links are wrong
   - If it doesn't work → File not uploaded

2. **Terms:**
   - Go to: `https://bisedaai.com/terms.html`
   - If it works → Links are wrong
   - If it doesn't work → File not uploaded

---

## ✅ Solution 5: Fix Links in index.html

If the files work when accessed directly but not from links, update `index.html`:

**Current links (should work):**
```html
<a href="/privacy.html">Privacy Policy</a>
<a href="/terms.html">Terms of Service</a>
```

**If that doesn't work, try:**
```html
<a href="privacy.html">Privacy Policy</a>
<a href="terms.html">Terms of Service</a>
```

**Or full URLs:**
```html
<a href="https://bisedaai.com/privacy.html">Privacy Policy</a>
<a href="https://bisedaai.com/terms.html">Terms of Service</a>
```

---

## 🔍 Quick Diagnostic Steps

### Step 1: Check Files Exist
1. Log in to 123reg File Manager
2. Go to `public_html` or `www`
3. **Do you see all 3 files?**
   - ✅ Yes → Go to Step 2
   - ❌ No → Upload missing files

### Step 2: Check File Names
1. **Are file names exactly:**
   - `index.html` (lowercase)
   - `privacy.html` (lowercase)
   - `terms.html` (lowercase)
   - ✅ Yes → Go to Step 3
   - ❌ No → Rename files

### Step 3: Test Direct Access
1. **Try:** `https://bisedaai.com/privacy.html`
   - ✅ Works → Links in index.html are wrong
   - ❌ Doesn't work → File not uploaded correctly

### Step 4: Check File Sizes
1. **In File Manager, check file sizes:**
   - `index.html` should be ~4-5 KB
   - `privacy.html` should be ~12 KB
   - `terms.html` should be ~14 KB
   - ✅ Correct sizes → Files are uploaded
   - ❌ Wrong sizes → Re-upload files

---

## 🚨 Common Issues & Fixes

### Issue 1: "404 Not Found" for privacy.html
**Fix:**
- Check file name is exactly `privacy.html` (lowercase)
- Check file is in `public_html` folder (not a subfolder)
- Re-upload the file

### Issue 2: Links don't work from index.html
**Fix:**
- Update links to use full URLs: `https://bisedaai.com/privacy.html`
- Or use relative paths: `privacy.html` (no leading slash)

### Issue 3: Files uploaded but not showing
**Fix:**
- Wait 5-10 minutes (DNS/caching)
- Clear browser cache
- Try incognito/private window

### Issue 4: Only seeing directory listing
**Fix:**
- Make sure `index.html` exists
- Check file permissions (should be readable)
- Contact 123reg support if issue persists

---

## 📋 Re-Upload Checklist

If you need to re-upload:

1. **Delete old files** (if they exist)
2. **Download fresh copies** from your computer:
   - `/Users/xhuljongashi/BISEDA.AI/legal-pages/index.html`
   - `/Users/xhuljongashi/BISEDA.AI/legal-pages/privacy.html`
   - `/Users/xhuljongashi/BISEDA.AI/legal-pages/terms.html`
3. **Upload to:** `public_html` or `www` folder
4. **Verify:** All 3 files are in the same folder
5. **Test:** Wait 5 minutes, then test URLs

---

## 🎯 Quick Fix: Update index.html Links

If files work directly but links don't, I can update the index.html file with different link formats. Let me know which format works for you!

---

## 📞 Still Not Working?

**Contact 123reg Support:**
- They can check server configuration
- Verify file permissions
- Help with upload issues

**Or try:**
- Upload via FTP instead of File Manager
- Check if there are any file size limits
- Verify your hosting package includes web hosting

---

## ✅ Expected Result

After fixing, you should be able to:
- ✅ Visit `https://bisedaai.com` → See homepage
- ✅ Click "Privacy Policy" → See privacy.html
- ✅ Click "Terms of Service" → See terms.html
- ✅ Visit `https://bisedaai.com/privacy.html` directly → Works
- ✅ Visit `https://bisedaai.com/terms.html` directly → Works

Let me know what happens when you try the direct URLs!

