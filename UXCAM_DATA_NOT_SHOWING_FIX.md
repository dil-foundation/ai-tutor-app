# UXCam Data Not Showing - Solution

## Problem
UXCam dashboard shows "install SDK to navigate" and no session data is being received.

## Root Cause
**UXCam only works with native builds, not Expo Go.**

When you run the app with Expo Go (`npx expo start`), the app uses a **mock UXCam implementation** that only logs to console. No actual data is sent to UXCam servers.

This is by design because Expo Go is a pre-built app that can't include custom native modules like UXCam.

## Solution

### Option 1: Use Preview/Production Builds (Recommended)

Build a native version of your app with EAS Build:

```bash
# For Android (works on Windows)
eas build --profile preview --platform android

# For iOS (requires Mac or cloud build)
eas build --profile preview --platform ios
```

After the build completes:
1. Install the APK on your Android device or download from the EAS build link
2. Open and use the app for a few minutes
3. Wait 1-2 minutes for data to upload
4. Refresh your UXCam dashboard - you should now see session data!

### Option 2: Local Development Build

If you have Android Studio set up with an emulator:

```bash
npx expo run:android
```

Or for iOS (Mac only):

```bash
npx expo run:ios
```

## Build Configuration

Your `eas.json` now has UXCam enabled for all build profiles:

- **Development**: `UXCAM_ENABLED: "true"` - For testing with dev builds
- **Preview**: `UXCAM_ENABLED: "true"` - For internal testing
- **Production**: `UXCAM_ENABLED: "true"` - For production releases

## How It Works

1. **In Expo Go**: App uses mock UXCam (logs to console only)
   ```typescript
   // services/UXCamService.ts checks:
   const isDevelopmentClient = !!process.env.EXPO_DEV_CLIENT;
   const isProductionBuild = !__DEV__;
   
   // If neither is true, uses mock
   ```

2. **In Native Builds**: App uses real UXCam SDK
   ```typescript
   // Real SDK is imported and initialized
   const realUXCam = require('react-native-ux-cam').default;
   ```

## Verification

Check your console logs when the app starts:

- **Mock**: `🎥 [UXCam] Using mock implementation for Expo Go`
- **Real SDK**: `🎥 [UXCam] Real UXCam SDK loaded successfully`

## Latest Build

Your most recent preview build: https://expo.dev/accounts/dil-tutor/projects/dil-mobile-app/builds/9d39c14d-aafe-4a3e-a5a5-5afafaa17f76

## Next Steps

1. ✅ Install the preview build from the link above
2. ✅ Use the app for 2-3 minutes
3. ✅ Wait 1-2 minutes for data to sync
4. ✅ Refresh UXCam dashboard
5. ✅ You should now see session recordings!

## Important Notes

- **First session may take longer**: Initial data sync can take up to 5 minutes
- **Short sessions**: Sessions shorter than 5 seconds are excluded (configured in `config/uxcam.ts`)
- **Private screens**: Login, signup, and profile screens are excluded from recording for privacy
- **Network required**: Device needs internet connection to upload session data

## UXCam API Key

Your API key: `smos6vxe844g3zn-us`

This key is set in:
- `config/uxcam.ts`
- `eas.json` (all build profiles)
- Environment variables on EAS

## Troubleshooting

### Still no data after 5 minutes?

1. Check device has internet connection
2. Check console logs for UXCam errors
3. Verify the API key is correct in UXCam dashboard settings
4. Make sure you're using the native build, not Expo Go
5. Try force-closing and reopening the app

### "Install SDK to navigate" still showing?

This message appears when UXCam hasn't received any sessions yet. Make sure:
- You're using a native build (APK/IPA), not Expo Go
- The app has been opened and used for at least 5 seconds
- Device has internet connection
- At least 1-2 minutes have passed since using the app

## Why Not Use Expo Go?

Expo Go is amazing for development, but it can't include native modules like UXCam because:
- Expo Go is a pre-built app distributed through app stores
- It can't dynamically link native modules at runtime
- Adding UXCam would require rebuilding Expo Go itself

This is why we use EAS Build to create custom development clients or preview builds for testing native features.

