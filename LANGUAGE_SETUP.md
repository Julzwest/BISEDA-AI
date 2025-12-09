# 🌍 Multi-Language Support - User Guide

## ✅ What's Implemented

Your Biseda.ai app now supports **6 languages** with automatic switching based on the selected country!

---

## 🌐 Supported Languages

| Language | Code | Countries | Flag |
|----------|------|-----------|------|
| **Albanian** (Shqip) | `sq` | Albania, Kosovo, N. Macedonia | 🇦🇱 |
| **English** | `en` | UK, USA | 🇬🇧 |
| **Italian** (Italiano) | `it` | Italy | 🇮🇹 |
| **German** (Deutsch) | `de` | Germany, Austria, Switzerland | 🇩🇪 |
| **French** (Français) | `fr` | France, Belgium | 🇫🇷 |
| **Spanish** (Español) | `es` | Spain | 🇪🇸 |

---

## 🎯 How It Works

### **Automatic Language Switching**
1. User selects a country (e.g., 🇮🇹 Italy)
2. App automatically switches to that country's language (Italian)
3. All UI text updates instantly
4. Language preference is saved to localStorage

### **Manual Language Override**
Users can also manually select a language independent of their country:
1. Click the **Country/Language** button (shows: 🇦🇱 🌐 SQ ⌄)
2. See language options at the top
3. Click any language to switch
4. Country selection is below

---

## 📱 What's Translated

### **Auth Page (Login/Register)**
- ✅ Page title and taglines
- ✅ "Sign Up" / "Log In" buttons
- ✅ Input placeholders (Username, Email, Password)
- ✅ "Create Account" / "Log In" buttons
- ✅ "Continue with Apple" button
- ✅ Error messages
- ✅ "Forgot password?" link
- ✅ Terms & Conditions
- ✅ Benefits section (3 days free, No card, 10 msgs/day)

### **Navigation**
- ✅ Home
- ✅ AI Coach
- ✅ Dates
- ✅ Events
- ✅ Tips
- ✅ Profile

### **Country Switcher**
- ✅ "Select Country" header
- ✅ "Change Language" header
- ✅ "cities" label

### **Subscription Tiers**
- ✅ Free Trial, Free, Starter, Pro, Elite
- ✅ "Go Premium" button
- ✅ "messages left", "images left"
- ✅ "Unlimited"

### **Common UI Elements**
- ✅ Cancel, Confirm, Save, Delete, Edit
- ✅ Loading, Error, Success messages

---

## 🔧 Technical Details

### **Language Context**
- Created `LanguageContext` for global state management
- Provides `useLanguage()` hook for components
- `t()` function for translations: `t('auth.login')`

### **Files Created**
1. **`src/config/languages.js`**
   - All translations for 6 languages
   - Country-to-language mapping
   - Helper functions

2. **`src/contexts/LanguageContext.jsx`**
   - React Context for language state
   - Auto-sync with country changes
   - LocalStorage persistence

### **Updated Components**
- **`src/components/CountrySwitcher.jsx`**
  - Added language picker section
  - Shows current language code (SQ, EN, IT, etc.)
  - Globe icon (🌐) indicator

- **`src/pages/Auth.jsx`**
  - All text using `t()` translations
  - Dynamic taglines
  - Translated buttons and labels

- **`src/main.jsx`**
  - Wrapped app with `LanguageProvider`

---

## 🎨 UI Design

### **Country/Language Button**
```
┌──────────────┐
│ 🇦🇱 🌐 SQ ⌄ │
└──────────────┘
```
- **🇦🇱** = Current country flag
- **🌐** = Language/Globe icon
- **SQ** = Language code
- **⌄** = Dropdown arrow

### **Dropdown Menu**
```
┌─────────────────────────────┐
│ Change Language             │
├─────────────────────────────┤
│ 🇦🇱 Shqip ✓   🇬🇧 English  │
│ 🇮🇹 Italiano  🇩🇪 Deutsch   │
│ 🇫🇷 Français  🇪🇸 Español   │
├─────────────────────────────┤
│ Select Country              │
├─────────────────────────────┤
│ 🇦🇱 Albania        12 cities│
│ 🇽🇰 Kosovo          8 cities│
│ 🇬🇧 United Kingdom 15 cities│
│ ...                          │
└─────────────────────────────┘
```

---

## 📖 Usage Examples

### **For Developers**

#### **Using translations in components:**
```jsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, changeLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('home.aiCoach')}</h1>
      <button onClick={() => changeLanguage('en')}>
        {t('common.save')}
      </button>
      <p>Current language: {language}</p>
    </div>
  );
}
```

#### **Adding new translations:**
Edit `src/config/languages.js`:
```javascript
export const translations = {
  sq: {
    mySection: {
      title: 'Titulli im',
      description: 'Përshkrimi im'
    }
  },
  en: {
    mySection: {
      title: 'My title',
      description: 'My description'
    }
  }
  // ... other languages
};
```

Then use in component:
```jsx
{t('mySection.title')}
```

---

## 🌍 Adding More Languages

To add a new language (e.g., Turkish):

1. **Add to `languages` object:**
```javascript
tr: {
  code: 'tr',
  name: 'Türkçe',
  flag: '🇹🇷'
}
```

2. **Map countries to language:**
```javascript
'TR': 'tr' // Turkey → Turkish
```

3. **Add all translations:**
```javascript
tr: {
  auth: {
    title: 'Biseda.ai',
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    // ... all other keys
  }
  // ... all sections
}
```

---

## 🧪 Testing

1. **Open the app**
2. **Look for the country button** in top-right (🇦🇱 🌐 SQ ⌄)
3. **Click to open dropdown**
4. **Select a language** (e.g., 🇬🇧 English)
5. **Verify all text changes** to English
6. **Select a country** (e.g., 🇮🇹 Italy)
7. **Verify language auto-switches** to Italian
8. **Refresh page** - language persists

---

## 🚀 Deployment

All changes are **LIVE** at:
- **Production:** https://julzwest.github.io/BISEDA-AI
- **Tag:** `v1.5-multilanguage-7-12-25`

---

## 📝 Notes

- Default language is **Albanian (sq)**
- Language is stored in `localStorage` as `userLanguage`
- Country changes automatically update language
- Manual language selection overrides country-based language
- All future UI components should use `t()` for text

---

**Last Updated:** 7/12/2025  
**Version:** 1.5 (Multi-Language Support)

