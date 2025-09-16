#!/bin/bash

# Cross-Platform UXCam Build Script for DIL Tutor App
echo "🚀 Starting cross-platform UXCam-enabled build process..."

# Check if .env.preview exists
if [ ! -f ".env.preview" ]; then
    echo "❌ Error: .env.preview file not found!"
    echo "Please create .env.preview with your UXCam configuration:"
    echo "UXCAM_API_KEY=xnayvk2m8m2h8xw-us"
    echo "UXCAM_ENABLED=true"
    echo "EXPO_PUBLIC_SUPABASE_URL=your-supabase-url"
    echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key"
    exit 1
fi

# Function to build for a specific platform
build_platform() {
    local platform=$1
    local profile=${2:-"preview"}
    
    echo "🔨 Building $platform app with UXCam..."
    if eas build -p "$platform" --profile "$profile"; then
        echo "✅ $platform build completed successfully!"
        return 0
    else
        echo "❌ $platform build failed!"
        return 1
    fi
}

# Push environment variables
echo "📤 Pushing environment variables..."
eas env:push preview --path .env.preview

# List environment variables to verify
echo "📋 Current environment variables:"
eas env:list preview --format long

# Build for both platforms
android_success=false
ios_success=false

if build_platform "android"; then
    android_success=true
fi

if build_platform "ios"; then
    ios_success=true
fi

# Summary
echo ""
echo "📊 Build Summary:"
if [ "$android_success" = true ]; then
    echo "Android: ✅ Success"
else
    echo "Android: ❌ Failed"
fi

if [ "$ios_success" = true ]; then
    echo "iOS: ✅ Success"
else
    echo "iOS: ❌ Failed"
fi

if [ "$android_success" = true ] && [ "$ios_success" = true ]; then
    echo ""
    echo "🎉 All builds completed successfully!"
    echo ""
    echo "📱 Next steps:"
    echo "1. Install the APK/IPA on your devices"
    echo "2. Open the app and perform some actions"
    echo "3. Check UXCam dashboard for session data"
    echo "4. Verify both Android and iOS sessions are being recorded"
    echo "5. Test UXCam functionality on both platforms"
else
    echo ""
    echo "⚠️ Some builds failed. Please check the logs above."
    echo "You can retry individual builds with:"
    echo "  eas build -p android --profile preview"
    echo "  eas build -p ios --profile preview"
fi
