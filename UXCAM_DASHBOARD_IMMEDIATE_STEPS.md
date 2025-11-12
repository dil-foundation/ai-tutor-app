# 🎯 UXCam Dashboard - What to Do RIGHT NOW

## 🔍 What You're Seeing

Your dashboard shows:
```
"Please install the UXCam SDK to navigate"
```

**This is NORMAL for new apps!** The settings will unlock after the first session.

## 📋 Immediate Steps in Your UXCam Dashboard

### Step 1: Find Your App Settings

Look for one of these:
- ⚙️ **Settings** icon (top right or sidebar)
- 🔧 **Configuration** menu
- 📱 **App Settings** link
- Click on your app name **"DIL LMS"** to see options

### Step 2: Look for Platform/General Settings

Navigate to:
```
Settings → General
OR
Settings → App Configuration  
OR
Settings → Platforms
```

### Step 3: Configure Platform Information

You should see a section to configure:

#### Platform/Framework
```
Select: React Native
OR
Select: iOS + Android (both platforms)
```

#### Bundle Identifiers
```
iOS Bundle Identifier:
┌─────────────────────────┐
│ com.dilai.lms          │
└─────────────────────────┘

Android Package Name:
┌─────────────────────────┐
│ com.dilai.lms          │
└─────────────────────────┘
```

### Step 4: Verify API Key

Your API key should already be there:
```
API Key: smos6vxe844g3zn-us
Status: Active ✅
```

If not active, look for an "Activate" or "Enable" button.

## 🎯 If You Can't Find These Settings

### Option A: Look for Initial Setup Wizard

Some new accounts show a setup wizard on the dashboard:
1. Look for **"Get Started"** or **"Complete Setup"** button
2. Click it and follow the wizard
3. Select React Native
4. Enter bundle IDs
5. Complete the wizard

### Option B: Access via Navigation Menu

Check the left sidebar or top navigation:
- Click **"Data capture & recording"** tab (you're already here in screenshot)
- Enable **"Session Data Capture"** toggle (turn it ON)
- Click **"Alerts"** tab
- Click **"Page definition"** tab
- Click **"Data access API"** tab

### Option C: Navigate to Platform Settings

If available, look for:
```
☰ Menu → Apps → DIL LMS → Settings
OR
⚙️ Settings → iOS Configuration
⚙️ Settings → Android Configuration
```

## ⚡ Quick Actions You Can Do Now

### 1. Enable Session Capture
On the "Data capture & recording" tab (visible in your screenshot):
- Toggle **"SESSION DATA CAPTURE"** to **ON** (enabled) ✅

### 2. Check Platform Detection
Look for any section showing:
```
iOS: ⏳ Waiting
Android: ⏳ Waiting
```

### 3. Add Domain (Optional)
You see "Add new URL" section. You can add:
```
https://learn.dil.org
```
This restricts recording to your domain (optional, you can skip this).

## 🚀 After Dashboard Configuration

Once you've configured what you can in the dashboard, proceed with:

### 1. Local Development
```powershell
# Clean and prebuild
npx expo prebuild --clean
```

### 2. Build App
```powershell
# Build preview
eas build --profile preview --platform all
```

### 3. Test on Device
- Install the build
- Open and use the app for 2-3 minutes
- Wait 5-10 minutes

### 4. Return to Dashboard
- Refresh your UXCam dashboard
- The "Please install SDK" message will disappear
- All settings will become visible
- You'll see your first session!

## 📊 What Will Change After First Session

### Before (Current)
```
Dashboard: "Please install the UXCam SDK to navigate"
Tabs visible: 4 tabs (Data capture, Data access API, Alerts, Page definition)
Settings: Limited
Status: Waiting for first session
```

### After (Once Working)
```
Dashboard: Full session list with recordings
Tabs visible: 10+ tabs (Sessions, Users, Screens, Funnels, etc.)
Settings: All settings available
Status: Active ✅
```

## 🎬 Complete Workflow

```
RIGHT NOW (in UXCam Dashboard):
├─ 1. Enable "Session Data Capture" toggle
├─ 2. Find and configure bundle IDs (if possible)
├─ 3. Verify API key is active
└─ 4. Complete any setup wizard if shown

THEN (in your terminal):
├─ 1. npx expo prebuild --clean
├─ 2. eas build --profile preview --platform ios
└─ 3. Wait for build to complete

THEN (on device):
├─ 1. Install the app
├─ 2. Open and use for 2-3 minutes
├─ 3. Navigate through screens
└─ 4. Close app

FINALLY (back in UXCam Dashboard):
├─ 1. Wait 5-10 minutes
├─ 2. Refresh dashboard
└─ 3. ✅ All settings appear!
```

## 💡 Pro Tip: Test Mode

If you can access any advanced settings, look for **"Test Mode"**:
- Settings → Test Mode → Enable
- This shows sessions **immediately** (no waiting!)
- Perfect for testing

## ✅ Summary

### What's Happening
- ✅ Your new account is properly set up
- ✅ API key is valid (`smos6vxe844g3zn-us`)
- ⏳ Dashboard is waiting for first session
- ⏳ Many settings are hidden until first data arrives

### What You Need to Do
1. **In Dashboard**: Enable session capture, configure bundle IDs if possible
2. **In Terminal**: Prebuild and build your app
3. **On Device**: Test the app
4. **Wait**: 5-10 minutes after testing
5. **Result**: Full dashboard unlocked! 🎉

### Why Old Account Shows More
- Old account has received sessions ✅
- Platform is detected ✅
- Dashboard is fully unlocked ✅
- That's what your new account will look like after first session!

---

**TL;DR:**
1. ✅ Enable "Session Data Capture" toggle (ON)
2. ✅ Add bundle IDs if you can find the setting
3. ✅ Then: `npx expo prebuild --clean`
4. ✅ Then: `eas build --profile preview --platform all`
5. ✅ Test app on device
6. ✅ Wait 5-10 min → Dashboard unlocks!

The limited settings are **temporary** - they'll all appear after your first session! 🚀

