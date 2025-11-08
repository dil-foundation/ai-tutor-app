# UXCam EAS Build Integration Guide

## Problem: UXCam Dashboard Shows "Please install UXCam SDK to navigate"

This issue occurs because the UXCam SDK is not properly integrated into your EAS build. Here's how to fix it:

## Solution Steps

### Step 1: Create .env.preview File

Create a `.env.preview` file in your project root with the following content:

```bash
# UXCam Configuration
UXCAM_API_KEY=7g5tf7r8bew9hs2-us
UXCAM_ENABLED=true

# Supabase Configuration (replace with your actual values)
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
EXPO_PUBLIC_API_URL=https://api.dil.lms-staging.com

# Build Configuration
EXPO_PUBLIC_USE_MANAGED_WORKFLOW=false
```

### Step 2: Updated Configuration Files

#### A. app.json (Already Updated)
The UXCam plugin has been added to your `app.json`:
```json
[
  "react-native-ux-cam",
  {
    "appKey": "7g5tf7r8bew9hs2-us"
  }
]
```

#### B. eas.json (Already Updated)
The preview profile now includes UXCam environment variables:
```json
"preview": {
  "distribution": "internal",
  "android": {
    "gradleCommand": ":app:assembleRelease",
    "buildType": "apk",
    "env": {
      "EXPO_USE_KOTLIN_SYNTHETIC": "false"
    }
  },
  "env": {
    "UXCAM_ENABLED": "true"
  }
}
```

### Step 3: Build Commands

#### Option A: Build Both Platforms (Recommended)

Run these commands in order:

```powershell
# 1. Push environment variables
eas env:push preview --path .env.preview

# 2. Verify environment variables
eas env:list preview --format long

# 3. Build both platforms
eas build -p android --profile preview
eas build -p ios --profile preview
```

#### Option B: Build Individual Platforms

For Android only:
```powershell
eas build -p android --profile preview
```

For iOS only:
```powershell
eas build -p ios --profile preview
```

### Step 4: Use the Build Scripts

#### Cross-Platform Build (Recommended)
```powershell
# PowerShell
.\scripts\build-cross-platform.ps1

# Bash
.\scripts\build-cross-platform.sh
```

#### Legacy Single Platform Scripts
```powershell
# PowerShell (Android + iOS)
.\scripts\build-with-uxcam.ps1

# Bash (Android + iOS)
.\scripts\build-with-uxcam.sh
```

## Verification Steps

### 1. Check Build Logs
After the build completes, check the build logs for both platforms:
```
🎥 [UXCam] Real UXCam SDK loaded successfully
🎥 [UXCam] Build type: Production
🎥 [UXCam] UXCam enabled: true
🎥 [UXCam] Initialized with startWithConfiguration
```

### 2. Install and Test
1. Download and install the APK/IPA on your devices
2. Open the app and perform some actions (navigate between screens, etc.)
3. Test on both Android and iOS devices
4. Wait 5-10 minutes for data to appear in UXCam dashboard

### 3. Check UXCam Dashboard
- Go to your UXCam dashboard
- Look for new sessions under "Sessions" tab
- Verify sessions from both Android and iOS devices
- The tooltip should disappear once sessions are detected
- Check that iOS-specific features (screen recording) are working

## Troubleshooting

### If UXCam Still Doesn't Work:

#### 1. Check Environment Variables
```powershell
eas env:list preview --format long
```
Ensure `UXCAM_ENABLED=true` is present.

#### 2. Verify Plugin Configuration
Check that the UXCam plugin is properly configured in `app.json`.

#### 3. Check App Logs
Install the app and check the logs for UXCam initialization messages.

#### 4. Manual SDK Test
Add this to your app to test SDK loading:
```typescript
// Add to any screen component
useEffect(() => {
  try {
    const UXCam = require('react-native-uxcam').default;
    console.log('UXCam SDK available:', !!UXCam);
    console.log('UXCam methods:', Object.keys(UXCam));
  } catch (error) {
    console.log('UXCam SDK not available:', error.message);
  }
}, []);
```

### Common Issues:

#### Issue: "UXCam SDK not available"
**Solution**: The build didn't include the native module. Ensure you're using EAS build, not Expo Go.

#### Issue: "No sessions appearing"
**Solution**: 
1. Wait 5-10 minutes for data to sync
2. Perform more user actions in the app
3. Check if the app has internet permission

#### Issue: "Environment variables not found"
**Solution**: Ensure `.env.preview` file exists and contains the correct variables.

## Expected Results

After successful integration:

1. **Build Logs**: Should show UXCam SDK loaded successfully for both platforms
2. **App Behavior**: No UXCam-related errors in app logs on both Android and iOS
3. **Dashboard**: Sessions should appear in UXCam dashboard within 10 minutes from both platforms
4. **Tooltip**: The "Please install UXCam SDK" tooltip should disappear
5. **Cross-Platform**: Both Android and iOS devices should record sessions
6. **iOS Features**: iOS-specific screen recording should be enabled

## Next Steps After Success

1. **Monitor Sessions**: Check UXCam dashboard for user sessions
2. **Configure Privacy**: Set up screen exclusions and data masking
3. **Analytics**: Use UXCam insights to improve user experience
4. **Production**: Deploy to production with the same configuration

## Files Modified

1. `app.json` - Added UXCam plugin configuration
2. `eas.json` - Added UXCam environment variables
3. `services/UXCamService.ts` - Enhanced SDK detection for production builds
4. `scripts/build-with-uxcam.ps1` - Automated build script
5. `UXCAM_EAS_BUILD_GUIDE.md` - This documentation

## Support

If you continue to have issues:
1. Check the build logs for any errors
2. Verify all environment variables are set correctly
3. Ensure you're using EAS build, not Expo Go
4. Contact UXCam support if the dashboard still shows the tooltip after successful integration
