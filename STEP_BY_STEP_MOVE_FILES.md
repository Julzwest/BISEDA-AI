# 📋 Step-by-Step: Move Files to Root

## Goal: Move `index.html` and `404.html` to Root of `gh-pages` Branch

---

## Step 1: Check Where Files Currently Are

### Check index.html Location:

1. **Open:** https://github.com/Julzwest/BISEDA.AI/blob/gh-pages/index.html
2. **Look at the top** - you'll see a breadcrumb path like:
   - `BISEDA.AI / index.html` = ✅ In root (correct!)
   - `BISEDA.AI / public / index.html` = ❌ In subfolder (wrong!)

**Write down where it is!**

### Check 404.html Location:

1. **Open:** https://github.com/Julzwest/BISEDA.AI/blob/gh-pages/404.html
2. **Look at the top** - check the breadcrumb path
3. **Write down where it is!**

---

## Step 2: Copy Content from index.html

1. **Go to:** https://github.com/Julzwest/BISEDA.AI/blob/gh-pages/index.html
2. **Click:** "Raw" button (top right, next to "Blame")
3. **Select all text** (Cmd+A on Mac, Ctrl+A on Windows)
4. **Copy** (Cmd+C on Mac, Ctrl+C on Windows)
5. **Keep this copied** - you'll need it in Step 3

---

## Step 3: Create index.html in Root

1. **Go to:** https://github.com/Julzwest/BISEDA.AI/tree/gh-pages
   - Make sure you see the branch dropdown showing `gh-pages`
   - You should see folders like `assets/`, `backend/`, etc.

2. **Click:** "Add file" button (top right)
3. **Click:** "Create new file"

4. **File name:** Type `index.html` (exactly like this)

5. **Paste content:**
   - Click in the large text area
   - Paste the content you copied (Cmd+V or Ctrl+V)

6. **Scroll down** to "Commit changes" section

7. **Commit message:** Type `Move index.html to root`

8. **Select:** "Commit directly to the `gh-pages` branch" (should be selected)

9. **Click:** Green "Commit new file" button

---

## Step 4: Copy Content from 404.html

1. **Go to:** https://github.com/Julzwest/BISEDA.AI/blob/gh-pages/404.html
2. **Click:** "Raw" button
3. **Select all text** (Cmd+A)
4. **Copy** (Cmd+C)
5. **Keep this copied** - you'll need it in Step 5

---

## Step 5: Create 404.html in Root

1. **Go to:** https://github.com/Julzwest/BISEDA.AI/tree/gh-pages
   - Make sure you're on `gh-pages` branch

2. **Click:** "Add file" button
3. **Click:** "Create new file"

4. **File name:** Type `404.html` (exactly like this)

5. **Paste content:**
   - Click in the large text area
   - Paste the content you copied

6. **Scroll down** to "Commit changes" section

7. **Commit message:** Type `Move 404.html to root`

8. **Select:** "Commit directly to the `gh-pages` branch"

9. **Click:** Green "Commit new file" button

---

## Step 6: Verify Files Are in Root

1. **Go to:** https://github.com/Julzwest/BISEDA.AI/tree/gh-pages
2. **Look at the file listing**
3. **You should see:**
   - ✅ `index.html` (in the root, not in a subfolder)
   - ✅ `404.html` (in the root, not in a subfolder)
   - ✅ `.nojekyll`
   - ✅ `assets/` folder

---

## Step 7: Wait and Test

1. **Wait 1-2 minutes** for GitHub Pages to rebuild
2. **Check Actions:** https://github.com/Julzwest/BISEDA.AI/actions
   - Should show green checkmark ✅
3. **Test:** `https://julzwest.github.io/BISEDA.AI/`
   - Should show your React app!

---

## ✅ Checklist

- [ ] Checked where index.html currently is
- [ ] Checked where 404.html currently is
- [ ] Copied index.html content
- [ ] Created index.html in root
- [ ] Copied 404.html content
- [ ] Created 404.html in root
- [ ] Verified files are in root listing
- [ ] Waited 1-2 minutes
- [ ] Tested the site

---

**Follow these steps one by one!** 🚀

