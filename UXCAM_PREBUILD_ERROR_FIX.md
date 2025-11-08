# Fix: "require is not defined" Error During Prebuild

## 🔍 The Problem

When running `npx expo prebuild --clean`, you're getting:
```
ReferenceError: require is not defined
at file:///C:/MyProjects/ai-tutor-app/node_modules/react-native-ux-cam/src/index.js:1:1
```

This is a **CommonJS/ESM compatibility issue** with the `react-native-ux-cam` package during Expo's prebuild process.

## ✅ Solution Options

### Option 1: Skip Prebuild (Recommended for EAS Builds)

**You don't actually need to run prebuild manually!** EAS Build handles this automatically.

Instead of:
```powershell
npx expo prebuild --clean  # ❌ This fails
eas build --profile preview --platform all
```

Just do:
```powershell
# Skip prebuild - EAS will handle it
eas build --profile preview --platform all
```

EAS Build will:
- ✅ Run prebuild automatically
- ✅ Handle the plugin configuration
- ✅ Build your app correctly

**This is the recommended approach!**

### Option 2: Use Development Build Instead

If you need to test locally, use Expo's development build:

```powershell
# This handles prebuild automatically
npx expo run:android
# or
npx expo run:ios
```

### Option 3: Manual Native Configuration (Advanced)

If you absolutely need to run prebuild manually, you can configure UXCam manually in native code:

#### For Android:
After prebuild completes, edit `android/app/src/main/java/.../MainApplication.java`:

```java
import com.uxcam.UXCam;

public class MainApplication extends Application {
  @Override
  public void onCreate() {
    super.onCreate();
    UXCam.startWithKey("7g5tf7r8bew9hs2-us");
  }
}
```

#### For iOS:
After prebuild completes, edit `ios/[YourApp]/AppDelegate.m`:

```objc
#import <UXCam/UXCam.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  [UXCam startWithKey:@"7g5tf7r8bew9hs2-us"];
  return YES;
}
```

But this is **not recommended** - Option 1 is much easier!

## 🎯 Recommended Workflow

### For Building with EAS (Production/Preview)

```powershell
# 1. Just build directly - no prebuild needed!
eas build --profile preview --platform all

# EAS will:
# - Run prebuild automatically
# - Handle plugin configuration
# - Build your app
```

### For Local Development

```powershell
# Use development build (handles prebuild)
npx expo run:android
# or
npx expo run:ios
```

### If You Must Prebuild Locally

```powershell
# Try with --no-install flag
npx expo prebuild --clean --no-install

# Or try without --clean
npx expo prebuild
```

## 🔧 Why This Happens

The `react-native-ux-cam` package uses CommonJS (`require`) syntax, but Expo's prebuild runs in an ES Module context. This causes the compatibility error.

**The good news:** EAS Build handles this automatically, so you don't need to worry about it!

## ✅ Quick Fix

**Just skip the manual prebuild step:**

```powershell
# ❌ Don't do this:
npx expo prebuild --clean

# ✅ Do this instead:
eas build --profile preview --platform all
```

EAS Build will handle everything automatically! 🎉

## 📋 Complete Build Workflow

### Step 1: Clean (Optional)
```powershell
npm run clean-build
```

### Step 2: Build with EAS (No Prebuild Needed!)
```powershell
eas build --profile preview --platform all
```

### Step 3: Wait for Build
- EAS will automatically:
  - Run prebuild
  - Configure plugins
  - Build your app
  - Handle all the native code

### Step 4: Download and Test
- Download from EAS dashboard
- Install on device
- Test UXCam integration

## 🎯 Summary

**The Error:** `require is not defined` during prebuild

**The Cause:** CommonJS/ESM compatibility issue with react-native-ux-cam plugin

**The Solution:** **Skip manual prebuild!** Just use `eas build` - it handles everything automatically.

**You don't need to run `npx expo prebuild --clean` manually!** EAS Build does this for you! 🚀

