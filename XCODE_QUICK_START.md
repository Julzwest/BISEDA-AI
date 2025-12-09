# 🍎 Xcode Quick Start Guide

## Step-by-Step Instructions:

### 1. **Select a Simulator Device** (Top Toolbar)
   - Look at the top toolbar, next to the Play/Stop buttons
   - You'll see "App" and "main" 
   - Click on the device dropdown (it might say "Any iOS Device" or show a device name)
   - Select: **iPhone 15 Pro** or **iPhone 15** (or any iPhone simulator)

### 2. **Click the Play Button** (▶️)
   - In the top-left toolbar, click the **Play button** (triangle pointing right)
   - Or press **Cmd + R** on your keyboard
   - Xcode will start building the app

### 3. **Wait for Build**
   - First build may take 2-5 minutes
   - You'll see progress in the top status bar
   - The iOS Simulator will automatically open

### 4. **App Will Launch**
   - Once build completes, the simulator will launch
   - Your Biseda.ai app will appear in the simulator

---

## If You See Errors:

### "No Signing Certificate"
1. Click on **"App"** in the left sidebar (project navigator)
2. Select the **"App"** target (under TARGETS)
3. Go to **"Signing & Capabilities"** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** (or add your Apple ID)

### Build Errors
- Click **Product → Clean Build Folder** (Shift + Cmd + K)
- Then click Play again

---

## Quick Visual Guide:

```
Xcode Window:
┌─────────────────────────────────────┐
│ [▶️] [⏹] App | main  [Device ▼]    │ ← Click device dropdown
│                                      │
│ Left Sidebar    │  Main Editor      │
│                 │                    │
│ [Project Files] │  [No Editor]      │
│                 │                    │
└─────────────────────────────────────┘
```

**Click the Play button (▶️) after selecting a simulator!**

