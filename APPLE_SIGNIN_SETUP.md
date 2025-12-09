# 🍎 Sign in with Apple - Setup Instructions

## ✅ What's Already Done

1. ✅ Installed `@capacitor-community/apple-sign-in` plugin
2. ✅ Added "Sign in with Apple" button to login page
3. ✅ Implemented backend authentication endpoint `/api/auth/apple`
4. ✅ Fixed subscription sync between web and iOS app
5. ✅ Synced Capacitor to iOS project

## 📋 What You Need to Do in Xcode

### Step 1: Open Xcode Project
```bash
cd /Users/xhuljongashi/BISEDA.AI
open ios/App/App.xcworkspace
```

### Step 2: Enable Sign in with Apple Capability

1. In Xcode, select the **App** target
2. Go to **Signing & Capabilities** tab
3. Click the **+ Capability** button (top left)
4. Search for and add **Sign in with Apple**
5. Verify the capability appears in the list

### Step 3: Configure in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your App ID: `ai.biseda.app`
4. Click **Edit**
5. Find **Sign in with Apple** in the capabilities list
6. **Enable** it and click **Save**

### Step 4: Update Provisioning Profile

1. In Apple Developer Portal, go to **Profiles**
2. Find your **App Store** provisioning profile
3. Click **Edit**
4. **Regenerate** the profile (this includes the new Sign in with Apple capability)
5. **Download** the new profile
6. **Double-click** to install it in Xcode

### Step 5: Build & Archive

1. In Xcode, go to **Product** → **Clean Build Folder** (Shift+Cmd+K)
2. Go to **Product** → **Archive**
3. Upload to App Store Connect

## 🔄 How Subscription Sync Works Now

### Before (Broken):
- User pays on web → Subscription saved to `userId = "abc123"` (based on IP)
- User opens iOS app → Gets different `userId = "xyz789"` (different network)
- App doesn't recognize subscription ❌

### After (Fixed):
- User registers/logs in → Gets `odId` from MongoDB
- All subsequent requests use this **stable odId** as userId
- Subscription is tied to email/account, not IP address
- When user logs in on any platform, subscription syncs automatically ✅

## 📱 Testing Sign in with Apple

1. Build and install the app on a real iOS device (not simulator)
2. Tap "Vazhdo me Apple" button
3. Complete Apple Sign In flow
4. User account will be created/linked automatically
5. Subscription status will sync from web

## 🌐 Web Experience

On web browsers, the "Sign in with Apple" button will show an error:
> "Apple Sign In disponohet vetëm në iOS app. Përdor email/password këtu."

This is expected - Apple Sign In only works on iOS devices.

## ⚠️ Important Notes

- **Real Device Required**: Sign in with Apple doesn't work on simulators
- **Subscription Sync**: Users must log in with the same email they used on web
- **First-Time Setup**: After enabling the capability, you need to regenerate provisioning profiles
- **Testing**: Test the full flow: Web payment → iOS login → Check subscription tier

## 🆘 Troubleshooting

### "No account for team" error
- Make sure you selected the correct Development Team in Xcode
- Verify Sign in with Apple is enabled in Apple Developer Portal

### Subscription not syncing
- Check that user is logged in with the same email on both platforms
- Verify backend is running and accessible
- Check browser console for subscription sync logs

### Button not appearing
- Refresh the app (pull to refresh or restart)
- Check that the new build is deployed

---

**Last Updated**: 7/12/2025
**Version**: 1.4 (Apple Sign In + Subscription Sync)

