# Why UXCam Wasn't Working with Your New Key

## 🔍 Root Cause Analysis

### The Problem
UXCam **appeared** to be integrated (you had the code) but was **NOT actually working** because critical configuration was missing.

## 📊 What Was Missing

### 1. ❌ Missing Plugin in `app.json`

**Before (BROKEN):**
```json
{
  "plugins": [
    "expo-router",
    "expo-splash-screen",
    "expo-secure-store",
    "expo-web-browser"
  ]
}
```

**After (FIXED):**
```json
{
  "plugins": [
    "expo-router",
    [
      "react-native-ux-cam",    // ← THIS WAS MISSING!
      {
        "appKey": "smos6vxe844g3zn-us"
      }
    ],
    "expo-splash-screen",
    "expo-secure-store",
    "expo-web-browser"
  ]
}
```

**Why this matters:**
- Without this plugin config, the native UXCam module doesn't get linked properly
- Your app was falling back to the "mock" implementation
- The mock just logs to console but doesn't send data to UXCam

### 2. ❌ Missing API Key in Preview Build

**Before (BROKEN):**
```json
{
  "preview": {
    "env": {
      "UXCAM_ENABLED": "true",
      // ← Missing: EXPO_UXCAM_API_KEY
      "EXPO_PUBLIC_SUPABASE_URL": "...",
      ...
    }
  }
}
```

**After (FIXED):**
```json
{
  "preview": {
    "env": {
      "UXCAM_ENABLED": "true",
      "EXPO_UXCAM_API_KEY": "smos6vxe844g3zn-us",  // ← ADDED!
      "EXPO_PUBLIC_SUPABASE_URL": "...",
      ...
    }
  }
}
```

**Why this matters:**
- The UXCamService was trying to read `process.env.EXPO_UXCAM_API_KEY`
- It fell back to the hardcoded value, BUT...
- Without the plugin config, it still didn't work!

## 🔄 How It Was Working vs Not Working

### OLD KEY (Was Working)
```
Old Setup:
✅ Plugin was configured in app.json
✅ Native module was linked
✅ Real UXCam SDK loaded
✅ Sessions sent to dashboard
```

### NEW KEY (Not Working)
```
New Setup:
❌ Plugin was NOT in app.json
❌ Native module NOT linked
❌ Mock UXCam loaded instead
❌ Sessions NOT sent (just console logs)
```

**What likely happened:**
- When you switched to the new key, you updated the key value
- BUT you probably removed or lost the plugin configuration
- Without the plugin, the native UXCam SDK never loaded
- The code fell back to the mock implementation

## 🌐 Additional UXCam Dashboard Setup Required

Even with proper code configuration, UXCam won't work if not set up correctly in their dashboard:

### Critical Dashboard Settings

1. **API Key Status**
   - Key must be **Active** (not disabled)
   - Old key might have been auto-configured
   - New key needs manual activation

2. **Bundle ID Mismatch**
   - UXCam dashboard must have: `com.dilai.lms`
   - Your app.json has: `com.dilai.lms`
   - If these don't match → Sessions won't appear!

3. **iOS Schematic Recording**
   - Must be **enabled** in dashboard for iOS
   - Without this → iOS won't record screens
   - This is a dashboard setting, not code

4. **Session Recording Settings**
   - Must be **enabled** in Privacy settings
   - Screen Recording must be **enabled**
   - User Analytics must be **enabled**

## 🎯 The Complete Fix

### Code Changes (DONE ✅)
- [x] Added UXCam plugin to app.json
- [x] Added EXPO_UXCAM_API_KEY to preview build
- [x] Configured plugin with API key

### Dashboard Changes (YOU NEED TO DO)
- [ ] Login to https://app.uxcam.com/
- [ ] Verify API key `smos6vxe844g3zn-us` is Active
- [ ] Verify Bundle IDs match: `com.dilai.lms`
- [ ] Enable iOS Schematic Recordings
- [ ] Enable Session Recording in Privacy settings
- [ ] Optionally: Enable Test Mode for immediate feedback

### Build Changes (YOU NEED TO DO)
- [ ] Run: `npx expo prebuild --clean`
- [ ] Run: `eas build --profile preview --platform all`
- [ ] Install app on device and test
- [ ] Wait 5-10 minutes and check dashboard

## 🧪 How to Test If It's Actually Working

### Test 1: Check Console Logs

**Working (Real SDK):**
```
🎥 [UXCam] Real UXCam SDK loaded successfully
🎥 [UXCam] Build type: Production
🎥 [UXCam] Initialized with startWithConfiguration
```

**Not Working (Mock):**
```
🎥 [UXCam] Using mock implementation for Expo Go
🎥 [UXCam Mock] Started with API key: 7g5tf7r8b...
```

### Test 2: Check UXCam Dashboard

After using the app for 2-3 minutes, wait 5-10 minutes, then:
1. Go to https://app.uxcam.com/
2. Navigate to **Dashboard** > **Sessions**
3. You should see your session(s) with recordings

**If sessions appear** → ✅ It's working!
**If no sessions** → ❌ Still not working, check dashboard settings

## 📱 Platform-Specific Notes

### iOS
- Requires: iOS Schematic Recordings enabled in dashboard
- Requires: Camera permission (already in app.json)
- First time: User will be prompted for permission

### Android
- Requires: Screen Recording enabled in dashboard
- Requires: Permissions in app.json (already configured)
- Usually works out of the box once plugin is configured

## 🎬 Timeline to Fix

```
1. ✅ DONE (2 min) - Fix code configuration
   ↓
2. ⏳ TODO (5 min) - Setup UXCam dashboard
   ↓
3. ⏳ TODO (3 min) - Run prebuild
   ↓
4. ⏳ TODO (10-20 min) - EAS build
   ↓
5. ⏳ TODO (2 min) - Install on device
   ↓
6. ⏳ TODO (3 min) - Use app and trigger events
   ↓
7. ⏳ TODO (10 min) - Wait for processing
   ↓
8. ✅ VERIFY - Check dashboard for sessions
```

**Total time: ~35-45 minutes** (mostly waiting for builds)

## 💡 Pro Tips

### Tip 1: Use Test Mode
Enable Test Mode in UXCam dashboard to see sessions immediately without waiting 5-10 minutes.

### Tip 2: Check Bundle IDs First
Most "not working" issues are due to Bundle ID mismatches. Double-check this first!

### Tip 3: Enable Debug Logging
In UXCamService.ts, there are already console logs. Watch the console when app starts to verify SDK loaded.

### Tip 4: Don't Use Expo Go
UXCam **CANNOT** work in Expo Go. Always use development/preview/production builds.

## 🎯 Summary

**The issue wasn't your new key** - it was missing configuration!

| Component | Status Before | Status Now | Action Needed |
|-----------|--------------|------------|---------------|
| Plugin Config | ❌ Missing | ✅ Fixed | None |
| API Key in Build | ❌ Missing | ✅ Fixed | None |
| UXCam Dashboard | ❓ Unknown | ⏳ Pending | **Setup Required** |
| Native Build | ❌ Old | ⏳ Pending | **Rebuild Required** |

**Next Steps:**
1. Setup UXCam dashboard (see UXCAM_QUICK_FIX_CHECKLIST.md)
2. Run `npx expo prebuild --clean`
3. Build with `eas build --profile preview`
4. Test and verify!

