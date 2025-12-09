# 📱 Simulator Setup Guide - BISEDA.AI

## ✅ Current Status

- ✅ App built successfully
- ✅ Capacitor configured
- ✅ iOS platform: Ready
- ⏳ Android platform: Requires Android Studio

---

## 🍎 iOS SIMULATOR (Xcode)

### Prerequisites:
- ✅ Xcode installed
- ✅ iOS platform added

### Steps:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Sync Capacitor:**
   ```bash
   npm run cap:sync
   ```

3. **Open in Xcode:**
   ```bash
   npm run cap:open:ios
   ```

4. **In Xcode:**
   - Wait for project to load
   - Select a simulator from the device dropdown (top bar)
     - Recommended: **iPhone 15 Pro** or **iPhone 15**
   - Click the **Play button** (▶️) or press `Cmd + R`
   - Wait for app to build and launch

5. **First Time Setup:**
   - Xcode may ask to sign the app
   - Go to **Signing & Capabilities** tab
   - Select your **Team** (or add Apple ID)
   - Change **Bundle Identifier** if needed: `ai.biseda.app`

### Troubleshooting iOS:
- **"No signing certificate"**: Add your Apple ID in Xcode Preferences → Accounts
- **Build errors**: Clean build folder (Cmd + Shift + K) and rebuild
- **Simulator not launching**: Check Xcode → Window → Devices and Simulators

---

## 🤖 ANDROID EMULATOR (Android Studio)

### Prerequisites:
- ⚠️ Android Studio must be installed
- ⚠️ Android SDK must be configured
- ⚠️ An Android Virtual Device (AVD) must be created

### Steps:

1. **Install Android Studio** (if not installed):
   - Download from: https://developer.android.com/studio
   - Install Android SDK and tools
   - Create an Android Virtual Device (AVD)

2. **Add Android platform:**
   ```bash
   npm run cap:add:android
   npm run cap:sync
   ```

3. **Open in Android Studio:**
   ```bash
   npm run cap:open:android
   ```

4. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Select an emulator from the device dropdown
     - Recommended: **Pixel 7** or **Pixel 6** (API 33+)
   - Click the **Run button** (▶️) or press `Shift + F10`
   - Wait for app to build and launch

5. **First Time Setup:**
   - Android Studio may need to download SDK components
   - Wait for Gradle build to complete (first time takes longer)

### Troubleshooting Android:
- **"SDK not found"**: Install Android SDK via Android Studio → SDK Manager
- **"Gradle sync failed"**: Check internet connection, Gradle may need to download dependencies
- **Emulator not starting**: Create a new AVD in Android Studio → AVD Manager

---

## 🔄 QUICK COMMANDS

### Build and Sync:
```bash
npm run cap:build  # Builds web app + syncs Capacitor
```

### Open Simulators:
```bash
npm run cap:open:ios      # Opens iOS in Xcode
npm run cap:open:android  # Opens Android in Android Studio
```

### Sync Only (after code changes):
```bash
npm run cap:sync
```

---

## 📝 IMPORTANT NOTES

### Backend API:
- The app connects to `http://localhost:3001` for the backend
- **iOS Simulator**: Can access `localhost` directly ✅
- **Android Emulator**: Uses `10.0.2.2` instead of `localhost`
  - Update `VITE_BACKEND_URL` in `.env` to `http://10.0.2.2:3001` for Android

### Hot Reload:
- Web changes: Rebuild (`npm run build`) then sync (`npm run cap:sync`)
- Native changes: Rebuild in Xcode/Android Studio

### Testing:
- Test on both simulators to ensure compatibility
- Check clipboard functionality works on both platforms
- Verify API calls work correctly

---

## 🚀 NEXT STEPS AFTER SIMULATOR SETUP

1. ✅ Test app functionality on simulators
2. ✅ Create app icons (1024x1024)
3. ✅ Create splash screens
4. ✅ Test on real devices
5. ✅ Prepare for App Store submission

---

**Ready to test!** 🎉

