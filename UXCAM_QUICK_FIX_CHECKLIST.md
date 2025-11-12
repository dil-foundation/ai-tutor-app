# UXCam Quick Fix Checklist

## ✅ What I Just Fixed for You

- [x] Added UXCam plugin configuration to `app.json`
- [x] Added missing `EXPO_UXCAM_API_KEY` to preview build profile in `eas.json`
- [x] Configured plugin with your API key: `smos6vxe844g3zn-us`

## 🌐 UXCam Dashboard Setup (DO THIS NOW!)

### 1. Login to UXCam
- Go to: https://app.uxcam.com/
- Login with your credentials

### 2. Verify Your API Key
- Go to: **Settings** > **App Configuration** > **API Keys**
- Check that `smos6vxe844g3zn-us` is **Active** ✅
- If it's disabled, enable it

### 3. Configure Bundle IDs (CRITICAL!)
- Go to: **Settings** > **App Configuration**
- Add/verify these Bundle IDs:
  ```
  iOS: com.dilai.lms
  Android: com.dilai.lms
  ```
- These MUST match your app's bundle IDs

### 4. Enable iOS Schematic Recordings (REQUIRED for iOS!)
- Go to: **Settings** > **iOS Configuration**
- Enable: **iOS Schematic Recordings** ✅
- Enable: **Advanced Gesture Recognition** ✅

### 5. Enable Session Recording
- Go to: **Settings** > **Privacy**
- Ensure these are enabled:
  - ✅ Session Recording
  - ✅ Screen Recording
  - ✅ Gesture Recognition
  - ✅ User Analytics

### 6. Optional: Enable Test Mode (for immediate feedback)
- Go to: **Settings** > **Test Mode**
- Enable it temporarily to see sessions immediately

## 💻 What You Need to Do Now

### Step 1: Prebuild (REQUIRED!)
```bash
npx expo prebuild --clean
```
This is **REQUIRED** because we added a new plugin.

### Step 2: Build the App
```bash
# For iOS
eas build --profile preview --platform ios

# For Android
eas build --profile preview --platform android

# Or both
eas build --profile preview --platform all
```

⚠️ **DO NOT use Expo Go** - UXCam only works in development/production builds!

### Step 3: Install & Test
1. Download the build from EAS
2. Install on your device
3. Use the app for 2-3 minutes
4. Wait 5-10 minutes
5. Check UXCam dashboard

## 🔍 How to Verify It's Working

### In App Console
Look for this:
```
✅ GOOD:
🎥 [UXCam] Real UXCam SDK loaded successfully
🎥 [UXCam] Initialized with startWithConfiguration

❌ BAD (not working):
🎥 [UXCam] Using mock implementation
🎥 [UXCam Mock] Started with API key
```

### In UXCam Dashboard
After 5-10 minutes, check:
- **Dashboard** > **Sessions** - Should see your session(s)
- **Dashboard** > **Overview** - Should see user count increase

## ❓ Still Not Working?

### Check These:
1. ✅ Is API key active in UXCam dashboard?
2. ✅ Do Bundle IDs match (app.json vs UXCam dashboard)?
3. ✅ Did you run `npx expo prebuild --clean`?
4. ✅ Are you using a development/preview/production build (NOT Expo Go)?
5. ✅ Is iOS Schematic Recording enabled in dashboard?
6. ✅ Has device internet connection?
7. ✅ Did you wait 5-10 minutes for session to appear?

### Quick Debug
```bash
# Clean everything
npm run clean-build
rm -rf node_modules
npm install

# Prebuild
npx expo prebuild --clean

# Build again
eas build --profile preview --platform [ios|android]
```

## 📞 Need More Help?

- Full guide: See `UXCAM_SETUP_GUIDE.md`
- UXCam Support: support@uxcam.com
- UXCam Docs: https://help.uxcam.com/

---

**Current Status:**
- ✅ Configuration files fixed
- ⏳ Waiting for: Dashboard setup + Rebuild app
- 🎯 Next: Follow steps above to complete setup

