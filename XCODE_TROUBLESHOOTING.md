# 🔧 Xcode Troubleshooting - Device Selector Not Showing

## Problem: Device dropdown not visible in Xcode

### Solution 1: Open the Workspace File (Not Project File)

**Important:** You need to open the **`.xcworkspace`** file, NOT the `.xcodeproj` file!

1. **Close Xcode** if it's open
2. **Navigate to:** `ios/App.xcworkspace` (or `ios/App/App.xcworkspace`)
3. **Double-click** the `.xcworkspace` file
4. Xcode will open with the correct project structure

### Solution 2: Check Project Navigator

1. In Xcode, look at the **left sidebar**
2. Click the **blue folder icon** (first icon) - this is the Project Navigator
3. You should see your project files listed
4. Click on **"App"** (the blue project icon at the top)
5. In the main area, you should see project settings

### Solution 3: Select the Scheme

1. Look at the top toolbar
2. Next to the Play button, you should see **"App"** and **"main"**
3. Click on **"main"** - this opens the scheme selector
4. Select **"App"** scheme
5. Then click the device dropdown next to it

### Solution 4: Manual Device Selection

1. Go to **Product → Destination** in the menu bar
2. Select **iPhone 15 Pro** or any iOS Simulator
3. Then click Play

### Solution 5: If Still Not Working

1. **Close Xcode completely**
2. Run this command in terminal:
   ```bash
   cd /Users/xhuljongashi/BISEDA.AI
   npm run cap:sync
   npm run cap:open:ios
   ```
3. This will reopen Xcode with the correct setup

---

## Quick Visual Guide:

**What you should see:**
```
Top Toolbar:
[▶️] [⏹] App | main | [iPhone 15 Pro ▼]  ← Device dropdown here
```

**If you don't see the device dropdown:**
- Make sure you opened `.xcworkspace` file
- Make sure a scheme is selected
- Try Product → Destination menu

---

## Alternative: Use Menu Bar

1. Click **Product** in the menu bar (top of screen)
2. Go to **Destination**
3. Select **iPhone 15 Pro Simulator**
4. Then click **Product → Run** (or press Cmd+R)

