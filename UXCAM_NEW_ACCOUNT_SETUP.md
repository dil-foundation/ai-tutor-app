# UXCam New Account Setup - Why Settings Are Missing

## 🔍 The Issue

You're seeing "**Please install the UXCam SDK to navigate**" and limited settings in your new UXCam account because **the dashboard hasn't received its first session yet**.

### Why This Happens

UXCam intentionally **hides most settings** until:
1. ✅ The app is fully configured (platforms selected)
2. ✅ Bundle IDs are set
3. ✅ First session is received
4. ✅ Platform is detected

This is **normal behavior** for new apps!

## 📋 Checklist: Configure Your New UXCam App

### Step 1: Complete Initial Setup Wizard

1. **In UXCam Dashboard** (https://app.uxcam.com/)
2. Go to your **"DIL LMS"** app
3. Look for setup wizard or "Get Started" flow
4. If you see a setup wizard, complete these steps:

#### Platform Selection
```
☐ Select: React Native
☐ Platform: iOS + Android (both)
☐ Click "Continue" or "Next"
```

#### Bundle Identifier Configuration
```
iOS Bundle ID: com.dilai.lms
Android Package: com.dilai.lms
```

#### API Key Configuration
```
API Key: smos6vxe844g3zn-us
(This should already be generated)
```

### Step 2: Verify Platform Configuration

1. Go to **App Settings** or **Configuration**
2. Look for **"Platforms"** section
3. Ensure both are enabled:
   - ☑️ **iOS** 
   - ☑️ **Android**

### Step 3: Check Bundle ID Settings

In the app configuration, verify:

```
iOS
---
Bundle Identifier: com.dilai.lms
Status: ⏳ Waiting for first session

Android
-------
Package Name: com.dilai.lms
Status: ⏳ Waiting for first session
```

### Step 4: Enable All Required Features

Even with limited settings visible, try to access:

1. **Data capture & recording** tab
   - Enable: Session Data Capture ✅
   - Uncheck: Exclude short sessions (or keep checked if you prefer)

2. **If you can access Privacy/Recording settings**:
   - Enable: Screen Recording ✅
   - Enable: Gesture Recognition ✅
   - Enable: User Analytics ✅

## 🚀 After Configuration - Build & Test

Now that we've fixed your code configuration, you need to:

### Step 1: Prebuild
```powershell
npx expo prebuild --clean
```

### Step 2: Build Preview
```powershell
# Both platforms
eas build --profile preview --platform all

# Or individually
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### Step 3: Install & Test
1. Download build from EAS
2. Install on physical device
3. Open app and login
4. Navigate through 3-4 screens
5. Use the app for 2-3 minutes
6. Close app

### Step 4: Wait & Check
1. Wait **5-10 minutes** (or 1-2 minutes if Test Mode enabled)
2. Go back to UXCam dashboard
3. Refresh the page
4. You should see:
   - ✅ "Install SDK" message disappears
   - ✅ First session appears
   - ✅ All settings tabs become visible
   - ✅ Dashboard fully functional

## 🎯 What Settings Will Appear After First Session

Once UXCam receives the first session, you'll see:

### New Tabs/Sections
- **Sessions** - View all recorded sessions
- **Screen Analytics** - Screen flow diagrams
- **Heatmaps** - Touch heatmaps
- **User Flows** - User journey analysis
- **Events** - Custom event tracking
- **Users** - User list and properties
- **Funnels** - Conversion funnels
- **Crashes** - Crash reports (if enabled)

### Additional Settings
- **Privacy Settings** - Screen masking, data filtering
- **iOS Configuration** - iOS-specific settings
- **Android Configuration** - Android-specific settings
- **Recording Settings** - Quality, frame rate, etc.
- **Alerts** - Configure alerts and notifications
- **Integrations** - Connect other tools
- **Team Management** - Add team members
- **Data Access API** - API configuration

## 🔄 Comparison: Old vs New Account

### Old Account (Working)
```
Status: ✅ Active with sessions
Settings Visible: 100% (all tabs)
Reason: Has received sessions, platform detected
```

### New Account (Current)
```
Status: ⏳ Waiting for first session
Settings Visible: ~30% (basic setup only)
Reason: No sessions received yet
Message: "Please install the UXCam SDK to navigate"
```

### New Account (After First Session)
```
Status: ✅ Active
Settings Visible: 100% (all tabs)
Reason: First session received, platform confirmed
Message: None - Full dashboard access
```

## 🎬 Expected Timeline

```
NOW (Step 1): Configure platform & bundle IDs
⏱️ 5 minutes
  ↓
Step 2: Run npx expo prebuild --clean
⏱️ 2-3 minutes
  ↓
Step 3: Build with EAS
⏱️ 15-20 minutes (iOS), 10-15 minutes (Android)
  ↓
Step 4: Install and test app
⏱️ 5 minutes
  ↓
Step 5: Use app (trigger events)
⏱️ 2-3 minutes
  ↓
Step 6: Wait for processing
⏱️ 5-10 minutes
  ↓
Step 7: Refresh UXCam dashboard
⏱️ Instant
  ↓
RESULT: ✅ All settings visible, "Install SDK" message gone
```

**Total time: ~45-60 minutes** (mostly build waiting time)

## 🆘 Troubleshooting

### Issue 1: Setup Wizard Not Appearing

If you don't see a setup wizard:
1. Click on app settings/configuration icon
2. Look for "Platform" or "Configuration" section
3. Manually add bundle IDs
4. Save changes

### Issue 2: Can't Find Bundle ID Settings

The bundle ID settings might be under:
- **Settings** > **App Configuration**
- **Settings** > **General**
- **Settings** > **iOS Configuration** (for iOS bundle)
- **Settings** > **Android Configuration** (for Android package)

### Issue 3: Settings Still Not Appearing

If after the first session settings don't appear:
1. **Hard refresh** the dashboard (Ctrl+F5 or Cmd+Shift+R)
2. **Logout and login** again
3. Check if session was actually recorded (Dashboard > Sessions)
4. Wait a bit longer (sometimes takes up to 15 minutes)
5. Contact UXCam support if still not working

## 💡 Pro Tips

### Tip 1: Enable Test Mode First
In your new account, if you can access it:
- Go to Settings > Test Mode
- Enable it temporarily
- This will show sessions **immediately** (no 5-10 min wait)

### Tip 2: Check Console Logs When Testing
When you install and run the app, watch for:
```
✅ Good:
🎥 [UXCam] Real UXCam SDK loaded successfully
🎥 [UXCam] Initialized with startWithConfiguration
🎥 [UXCam] Session started: <url>

❌ Bad:
🎥 [UXCam Mock] Started with API key
```

### Tip 3: Test on One Platform First
To speed up testing:
1. Build iOS first (or Android, whichever is faster for you)
2. Test and verify it works
3. Then build the other platform

### Tip 4: Check Your Plan
Make sure your new account has:
- Sufficient session quota
- Recording features enabled
- Not on a restricted trial

## ✅ Summary

### The Issue
- New UXCam account shows limited settings
- Message: "Please install the UXCam SDK to navigate"
- Fewer tabs than old account

### The Reason
- **This is normal!** UXCam hides settings until first session
- Dashboard unlocks after receiving initial data
- Platform needs to be detected/configured

### The Fix
1. ✅ Configure platforms in dashboard (iOS + Android)
2. ✅ Add bundle IDs: `com.dilai.lms`
3. ✅ Complete any setup wizard
4. ✅ Build app with our fixed configuration
5. ✅ Test on device
6. ✅ Wait for first session
7. ✅ Refresh dashboard → All settings appear!

### Next Steps
1. **Right now**: Complete platform setup in UXCam dashboard
2. **Then**: Run `npx expo prebuild --clean`
3. **Then**: Build with `eas build --profile preview`
4. **Then**: Test and wait for sessions
5. **Result**: Full dashboard with all settings!

---

**Current Status:**
- ✅ Code configuration: **FIXED**
- ⏳ UXCam dashboard: **Needs platform configuration**
- ⏳ First session: **Waiting for build & test**
- 🎯 Next: **Configure platforms → Build → Test → Success!**

