# UXCam Complete Setup Guide

## 🔍 Problem Identified

Your UXCam integration was **missing critical configuration**, which is why it stopped working with the new API key. The code was there, but the native module linking and environment variables were not properly configured.

## ✅ What Was Fixed

1. ✅ **Added UXCam plugin to `app.json`** - Required for native module linking
2. ✅ **Added `EXPO_UXCAM_API_KEY` to preview build profile** - Missing environment variable
3. ✅ **Configured proper plugin setup with your API key**

## 🌐 UXCam Dashboard Setup (Required Steps)

### Step 1: Verify Your API Key on UXCam Website

1. **Login to UXCam Dashboard**
   - Go to: https://app.uxcam.com/
   - Login with your credentials

2. **Navigate to Settings**
   - Click on your app name in the top left
   - Go to **Settings** > **App Configuration**

3. **Verify/Get Your API Key**
   - Your current key: `7g5tf7r8bew9hs2-us`
   - If this is a new key, make sure the app is properly set up in the dashboard
   - Check that the key is **Active** (not disabled)

### Step 2: Configure App Settings on UXCam

#### A. General Settings
```
App Name: DIL Tutor App (or your app name)
Platform: iOS & Android (both)
Region: US (based on your key suffix '-us')
```

#### B. Privacy & Data Settings
1. Go to **Settings** > **Privacy**
2. Configure:
   - ✅ **Enable Session Recording**
   - ✅ **Screen Recording** (for both iOS and Android)
   - ✅ **Gesture Recognition**
   - ✅ **Rage Clicks Detection**
   - ✅ **User Analytics**

3. **Sensitive Screen Protection**
   - Add these screen names to the blocklist:
     ```
     Login
     SignUp
     PasswordReset
     Profile
     Settings
     Payment
     Billing
     ```

#### C. iOS-Specific Settings
1. Go to **Settings** > **iOS Configuration**
2. Enable:
   - ✅ **iOS Schematic Recordings** (This is crucial for iOS!)
   - ✅ **Advanced Gesture Recognition**
   - ✅ **Improved Screen Capture**

#### D. Android-Specific Settings
1. Go to **Settings** > **Android Configuration**
2. Enable:
   - ✅ **Android Screen Recording**
   - ✅ **Gesture Recognition**
   - ✅ **Network Logging**

### Step 3: Bundle Identifier Verification

**CRITICAL**: Your Bundle IDs must match!

1. **In UXCam Dashboard**:
   - Go to **Settings** > **App Configuration**
   - Add/Verify Bundle Identifiers:
     ```
     iOS Bundle ID: com.dilai.lms
     Android Package Name: com.dilai.lms
     ```

2. **These MUST match your `app.json`**:
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.dilai.lms"
     },
     "android": {
       "package": "com.dilai.lms"
     }
   }
   ```

### Step 4: Enable Required Features

In your UXCam Dashboard, ensure these are enabled:

1. **Session Replay** ✅
2. **Screen Analytics** ✅
3. **User Flows** ✅
4. **Heatmaps** ✅
5. **Event Tracking** ✅
6. **Crash Reports** ✅ (optional but recommended)

### Step 5: Test Connection

1. **Enable Test Mode** (temporarily)
   - In UXCam Dashboard > Settings > Test Mode
   - This shows sessions immediately without processing delays

2. **Check API Key Status**
   - Go to Settings > API Keys
   - Verify your key shows as "Active"
   - Check rate limits and quotas

## 🏗️ Local Development Setup

### Step 1: Clean Your Build

```bash
# Clean previous builds
npm run clean-build

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start -c
```

### Step 2: Prebuild (Required after plugin changes)

Since we added the UXCam plugin, you MUST run prebuild:

```bash
# This generates native iOS and Android code
npx expo prebuild --clean
```

⚠️ **Important**: Every time you modify plugins in `app.json`, you need to run prebuild again.

### Step 3: Test in Development Build

You cannot test UXCam in Expo Go! You need a development build:

```bash
# Build development version with UXCam
eas build --profile development --platform ios
eas build --profile development --platform android
```

## 📱 Building for Testing

### For Preview/Internal Testing

```bash
# Build both platforms
eas build --profile preview --platform all

# Or individually
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### For Production

```bash
# Production build
eas build --profile production --platform all
```

## 🔧 Troubleshooting

### Issue 1: UXCam Not Initializing

**Symptoms**: Console shows "UXCam Mock" instead of "Real UXCam SDK"

**Solutions**:
1. Make sure you're NOT using Expo Go (use development build or production build)
2. Run `npx expo prebuild --clean` after plugin changes
3. Verify API key in `app.json` matches your UXCam dashboard
4. Check build logs for initialization errors

### Issue 2: No Sessions Appearing in Dashboard

**Checklist**:
- ✅ Bundle ID matches in both app.json and UXCam dashboard
- ✅ API key is active in UXCam dashboard
- ✅ App is built with preview/production profile (not development with UXCAM_ENABLED=false)
- ✅ Device has internet connection
- ✅ Sessions can take 5-10 minutes to appear (unless Test Mode is enabled)

### Issue 3: Build Failures

**Common causes**:
```bash
# Fix: Clean and rebuild
npx expo prebuild --clean
npm install
eas build --profile preview --platform [ios|android]
```

### Issue 4: iOS Not Recording Screens

**Fix**: Ensure in your UXCam dashboard:
1. iOS Schematic Recordings is **ENABLED**
2. Your app has camera permissions in Info.plist (already configured)
3. User has granted permissions when prompted

## 📊 Verifying Setup

### In Your App (Console Logs)

Look for these success messages:

```
✅ Good:
🎥 [UXCam] Real UXCam SDK loaded successfully
🎥 [UXCam] Build type: Production
🎥 [UXCam] Initialized with startWithConfiguration
🎥 [UXCam] Session started: https://app.uxcam.com/sessions/...

❌ Bad (means not properly configured):
🎥 [UXCam] Using mock implementation for Expo Go
🎥 [UXCam Mock] Started with API key...
```

### In UXCam Dashboard

Within 5-10 minutes of using the app, you should see:

1. **Dashboard** > **Overview**
   - Session count increasing
   - Active users appearing

2. **Dashboard** > **Sessions**
   - Individual session recordings
   - Screen flow visualizations
   - User interactions captured

3. **Dashboard** > **Screen Analytics**
   - Screen names appearing
   - Screen flow diagrams

## 🎯 Testing Your Integration

### Test Checklist

```bash
# 1. Build the app
eas build --profile preview --platform ios

# 2. Install on device
# Download from EAS build page and install

# 3. Use the app for 2-3 minutes
# - Navigate through different screens
# - Perform various actions
# - Trigger events

# 4. Check UXCam Dashboard (after 5-10 minutes)
# Go to: https://app.uxcam.com/
# Sessions should appear
```

### Quick Test Script

After installing the app, do these actions:

1. ✅ Open app
2. ✅ Login (session should start)
3. ✅ Navigate to 2-3 different screens
4. ✅ Tap buttons, interact with UI
5. ✅ Wait 5-10 minutes
6. ✅ Check UXCam dashboard for the session

## 🔐 Security Notes

Your API key is visible in your configuration files. Consider:

1. **For Open Source Projects**: Use environment variables
   ```bash
   # Create .env file
   EXPO_UXCAM_API_KEY=7g5tf7r8bew9hs2-us
   ```

2. **Add to .gitignore**:
   ```
   .env
   .env.*
   ```

3. **Use EAS Secrets** (more secure):
   ```bash
   # Store secret in EAS
   eas secret:create --name EXPO_UXCAM_API_KEY --value 7g5tf7r8bew9hs2-us --scope project
   
   # Then remove from eas.json and use the secret
   ```

## 📞 Support Resources

1. **UXCam Documentation**: https://help.uxcam.com/
2. **React Native Integration**: https://help.uxcam.com/hc/en-us/articles/360019746972
3. **API Key Issues**: https://help.uxcam.com/hc/en-us/articles/360001497331
4. **UXCam Support**: support@uxcam.com

## ✨ Next Steps

1. ✅ **Verify API key is active in UXCam dashboard**
2. ✅ **Enable iOS Schematic Recordings in dashboard**
3. ✅ **Verify Bundle IDs match**
4. ✅ **Run `npx expo prebuild --clean`**
5. ✅ **Build with `eas build --profile preview`**
6. ✅ **Test on real device**
7. ✅ **Check dashboard after 5-10 minutes**

---

## Summary

The main issues were:

1. ❌ **Missing plugin configuration** in `app.json` → ✅ **Fixed**
2. ❌ **Missing API key** in preview build → ✅ **Fixed**
3. ❓ **Possible UXCam dashboard configuration** → 📋 **Follow guide above**

After fixing the configuration and following the dashboard setup, your UXCam integration should work perfectly with the new API key!

