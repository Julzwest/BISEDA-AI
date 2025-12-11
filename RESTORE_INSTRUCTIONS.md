# 🆘 EMERGENCY RESTORE INSTRUCTIONS

## If Pages Go Missing Again

### Quick Restore (Copy-Paste This Command)
```bash
cd "/Users/xhuljongashi/Desktop/BISEDA COPY BACKUP "
git checkout COMPLETE-STABLE-2025-12-11
```

### Or Restore from Backup Branch
```bash
git checkout backup/complete-2025-12-11
```

### Or Merge Backup into Current Version
```bash
git checkout main
git merge backup/complete-2025-12-11 --no-ff
```

---

## Verify All Pages Exist

Run this to check:
```bash
ls src/pages/*.jsx
```

Should show:
- ✅ DateRehearsal.jsx
- ✅ MoodCheck.jsx  
- ✅ ProfileOptimizer.jsx
- ✅ DatePlanner.jsx
- ✅ Chat.jsx
- ✅ FirstDates.jsx
- ✅ GiftSuggestions.jsx
- ✅ Tips.jsx
- ✅ Events.jsx
- ✅ Home.jsx
- ✅ UserProfile.jsx
- ✅ Admin.jsx
- And more...

---

## If Intimacy Coach Missing from Chat

Check this file exists and contains 'intimacy':
```bash
grep -n "intimacy" src/pages/Chat.jsx
```

Should show multiple matches including the category definition.

---

## Full List of Critical Files

See: **COMPLETE_FEATURE_LIST.md**

---

## Backup Locations

1. **Git Tag:** `COMPLETE-STABLE-2025-12-11`
2. **Git Branch:** `backup/complete-2025-12-11`
3. **GitHub Remote:** (after you push)
4. **Documentation:** `COMPLETE_FEATURE_LIST.md`

---

## Contact

If you need help restoring, refer to:
- COMPLETE_FEATURE_LIST.md
- This file (RESTORE_INSTRUCTIONS.md)
- Git tag: COMPLETE-STABLE-2025-12-11
