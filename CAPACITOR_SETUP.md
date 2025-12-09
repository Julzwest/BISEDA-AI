# Capacitor Setup Guide

## Initial Setup

1. **Build the app:**
```bash
npm run build
```

2. **Add iOS platform:**
```bash
npm run cap:add:ios
```

3. **Add Android platform:**
```bash
npm run cap:add:android
```

4. **Sync changes:**
```bash
npm run cap:sync
```

## Development Workflow

1. **Make changes to your React app**
2. **Build:**
```bash
npm run build
```

3. **Sync to native projects:**
```bash
npm run cap:sync
```

4. **Open in Xcode (iOS):**
```bash
npm run cap:open:ios
```

5. **Open in Android Studio (Android):**
```bash
npm run cap:open:android
```

## App Configuration

- **App ID**: `ai.biseda.app`
- **App Name**: `Biseda.ai`
- **Web Directory**: `dist` (Vite build output)

## Next Steps

1. Configure app icons in native projects
2. Configure splash screens
3. Set up signing certificates (iOS/Android)
4. Test on real devices
5. Build for production

## iOS Requirements

- macOS with Xcode installed
- Apple Developer account ($99/year)
- iOS device or simulator for testing

## Android Requirements

- Android Studio installed
- Android SDK configured
- Android device or emulator for testing
- Google Play Developer account ($25 one-time)

