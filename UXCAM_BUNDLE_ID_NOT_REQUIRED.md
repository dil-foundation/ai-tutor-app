# ✅ Bundle IDs - You DON'T Need to Configure Them!

## 🎯 Good News!

**You don't need to manually configure bundle IDs in the UXCam dashboard!** 

UXCam **automatically detects** bundle IDs from your app when it receives the first session. This is why you can't see the option - it's not needed upfront!

## ✅ Your App Already Has Bundle IDs Configured

I verified your `app.json` - you already have the correct bundle IDs:

```json
{
  "ios": {
    "bundleIdentifier": "com.dilai.lms"  ✅
  },
  "android": {
    "package": "com.dilai.lms"  ✅
  }
}
```

These will be **automatically sent** to UXCam when your app connects!

## 🔍 Where Bundle IDs Appear (After First Session)

Once UXCam receives your first session, you'll be able to see/verify bundle IDs here:

### Option 1: App Settings (After First Session)
```
Settings → App Configuration → Bundle Identifiers
```

### Option 2: Platform Settings (After First Session)
```
Settings → iOS Configuration → Bundle Identifier
Settings → Android Configuration → Package Name
```

### Option 3: Session Details (After First Session)
```
Dashboard → Sessions → [Click any session] → App Info
```

## 🚀 What You Should Do Instead

Since bundle IDs are auto-detected, focus on these steps:

### Step 1: Enable Session Capture (You Can Do This Now)

In your UXCam dashboard, on the "Data capture & recording" tab:

1. ✅ Toggle **"SESSION DATA CAPTURE"** to **Enabled** (ON)
2. ✅ That's it! No bundle ID configuration needed

### Step 2: Build Your App

```powershell
# 1. Prebuild (required after plugin changes)
npx expo prebuild --clean

# 2. Build preview
eas build --profile preview --platform all
```

### Step 3: Test on Device

1. Install the build
2. Open and use the app for 2-3 minutes
3. Navigate through different screens
4. Close the app

### Step 4: Wait and Verify

1. Wait 5-10 minutes
2. Refresh UXCam dashboard
3. You'll see:
   - ✅ First session appears
   - ✅ Bundle IDs automatically detected
   - ✅ All settings become visible
   - ✅ "Install SDK" message disappears

## 📊 How Bundle ID Detection Works

```
Your App (with bundle IDs in app.json)
    ↓
Build with EAS
    ↓
Install on device
    ↓
App sends first session to UXCam
    ↓
UXCam automatically reads bundle IDs from session data
    ↓
Bundle IDs appear in dashboard automatically
```

**No manual configuration needed!** 🎉

## ✅ Verification Checklist

### Before First Session (Current State)
- [x] Bundle IDs in app.json: ✅ `com.dilai.lms` (both iOS & Android)
- [x] UXCam plugin configured: ✅ Added to app.json
- [x] API key configured: ✅ `smos6vxe844g3zn-us`
- [ ] Session capture enabled: ⏳ Do this in dashboard
- [ ] First session sent: ⏳ Waiting for build & test

### After First Session (What Will Happen)
- [ ] Bundle IDs visible in dashboard: ⏳ Auto-detected
- [ ] Platform detected: ⏳ Auto-detected (iOS/Android)
- [ ] All settings visible: ⏳ Dashboard unlocks
- [ ] Sessions appearing: ⏳ Data flowing

## 🎯 What to Do RIGHT NOW

### In UXCam Dashboard:
1. ✅ Enable "SESSION DATA CAPTURE" toggle (if not already enabled)
2. ✅ That's all you need to do in the dashboard!

### On Your Computer:
```powershell
# 1. Prebuild
npx expo prebuild --clean

# 2. Build
eas build --profile preview --platform all

# 3. Install and test
# 4. Wait 5-10 minutes
# 5. Check dashboard - bundle IDs will be there automatically!
```

## 💡 Why You Can't See Bundle ID Settings

UXCam hides bundle ID configuration because:
1. **It's not needed** - Auto-detected from your app
2. **Prevents errors** - Can't mismatch bundle IDs
3. **Simpler setup** - One less thing to configure
4. **Auto-verification** - UXCam confirms they match your app

## 🔍 How to Verify Bundle IDs After First Session

Once your first session appears, you can verify bundle IDs were detected:

### Method 1: Check Session Details
1. Go to **Dashboard** → **Sessions**
2. Click on your first session
3. Look for **"App Info"** or **"Device Info"** section
4. You'll see:
   ```
   iOS Bundle ID: com.dilai.lms ✅
   Android Package: com.dilai.lms ✅
   ```

### Method 2: Check App Settings
1. Go to **Settings** → **App Configuration**
2. Look for **"Bundle Identifiers"** section
3. You'll see:
   ```
   iOS: com.dilai.lms ✅
   Android: com.dilai.lms ✅
   Status: Detected
   ```

### Method 3: Check Platform Settings
1. Go to **Settings** → **iOS Configuration**
2. Bundle ID will be listed
3. Go to **Settings** → **Android Configuration**
4. Package name will be listed

## ⚠️ Important Notes

### Bundle IDs Must Match
Your bundle IDs in `app.json` are:
- iOS: `com.dilai.lms`
- Android: `com.dilai.lms`

These **must match** what UXCam detects. Since they're in your app.json, they will match automatically!

### If Bundle IDs Don't Match (Rare)
If somehow UXCam detects different bundle IDs:
1. Check your `app.json` - verify bundle IDs
2. Rebuild the app
3. Send another session
4. UXCam will update with correct bundle IDs

### Multiple Apps with Same Bundle ID
If you have multiple UXCam apps using the same bundle ID:
- UXCam will detect which app based on API key
- Each app has its own API key
- Your key: `smos6vxe844g3zn-us` is unique to this app

## 🎬 Summary

### ❌ What You DON'T Need to Do
- ❌ Manually configure bundle IDs in dashboard
- ❌ Find hidden bundle ID settings
- ❌ Worry about bundle ID configuration

### ✅ What You DO Need to Do
- ✅ Enable "SESSION DATA CAPTURE" in dashboard
- ✅ Run `npx expo prebuild --clean`
- ✅ Build with `eas build --profile preview`
- ✅ Test on device
- ✅ Wait for first session
- ✅ Bundle IDs will appear automatically!

## 🚀 Next Steps

1. **Dashboard**: Enable session capture toggle ✅
2. **Terminal**: `npx expo prebuild --clean`
3. **Terminal**: `eas build --profile preview --platform all`
4. **Device**: Install, test, use app
5. **Dashboard**: Wait 5-10 min, refresh, see bundle IDs!

---

**TL;DR:**
- ✅ Bundle IDs are **auto-detected** - no manual config needed!
- ✅ Your app.json already has correct bundle IDs
- ✅ Just enable session capture and build/test
- ✅ Bundle IDs will appear automatically after first session!

You're all set! Just proceed with building and testing. 🎉

