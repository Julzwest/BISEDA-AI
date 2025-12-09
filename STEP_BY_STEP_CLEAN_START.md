# 🚀 STEP-BY-STEP: Clean Start

## Let's Do This!

---

## STEP 1: Delete Everything from gh-pages Branch

### Go to gh-pages Branch:

1. **Go to:** https://github.com/Julzwest/BISEDA-AI/tree/gh-pages
2. **Make sure you're on `gh-pages` branch** (check dropdown at top)

### Delete Each File/Folder:

**For EACH file and folder you see:**

1. **Click on the file/folder name**
2. **Click:** "Delete" button (trash icon, top right)
3. **Scroll down**
4. **Commit message:** `Clean gh-pages branch`
5. **Select:** "Commit directly to the `gh-pages` branch"
6. **Click:** "Delete" button (red button at bottom)

**Repeat for ALL files and folders until branch is empty.**

**Files/folders to delete:**
- `index.html`
- `404.html`
- `.nojekyll`
- `assets/` folder
- `android/` folder
- `backend/` folder
- `entities/` folder
- `functions/` folder
- `ios/` folder
- `legal-pages/` folder
- `public/` folder
- `scripts/` folder
- `src/` folder
- `.env`
- `.gitignore`
- `.gitmodules`
- Any `.md` files
- **EVERYTHING**

**Goal:** Empty `gh-pages` branch (no files at all)

---

## STEP 2: Verify Branch is Empty

1. **Go to:** https://github.com/Julzwest/BISEDA-AI/tree/gh-pages
2. **Should see:** "This branch is empty" or "No files in this branch"
3. **If you see files:** Delete them

---

## STEP 3: Upload ONLY These Files

**From your Mac:** `/Users/xhuljongashi/BISEDA.AI/`

1. **Go to:** https://github.com/Julzwest/BISEDA-AI/tree/gh-pages
2. **Click:** "Add file" → "Upload files"
3. **Upload ONLY these:**
   - `index.html`
   - `404.html`
   - `.nojekyll` (empty file)
   - `assets/` folder (entire folder)
4. **Scroll down**
5. **Commit message:** `Fresh deployment - clean start`
6. **Select:** "Commit directly to the `gh-pages` branch"
7. **Click:** "Commit changes"

---

## STEP 4: Configure GitHub Pages

1. **Go to:** https://github.com/Julzwest/BISEDA-AI/settings/pages
2. **Verify:**
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. **If not set:** Set it and click "Save"

---

## STEP 5: Configure Custom Domain

1. **Still on Pages settings**
2. **Custom domain field:** Enter `bisedaai.com`
3. **Click:** "Save"
4. **Wait for DNS check** (should show green checkmark)

---

## STEP 6: Wait and Test

1. **Wait 3-5 minutes**
2. **Check Actions:** https://github.com/Julzwest/BISEDA-AI/actions
   - Should show GREEN checkmark ✅
3. **Test:**
   - `https://julzwest.github.io/BISEDA-AI/`
   - `https://bisedaai.com/`

---

## ✅ Checklist

- [ ] Deleted ALL files from gh-pages branch
- [ ] Verified branch is empty
- [ ] Uploaded ONLY: index.html, 404.html, .nojekyll, assets/
- [ ] Configured GitHub Pages (gh-pages branch, root folder)
- [ ] Configured custom domain (bisedaai.com)
- [ ] Waited 3-5 minutes
- [ ] Tested both URLs

---

**START WITH STEP 1 - Delete everything from gh-pages branch!**

