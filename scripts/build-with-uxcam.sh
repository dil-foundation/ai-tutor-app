#!/bin/bash

# UXCam Build Script for DIL Tutor App
echo "🚀 Starting UXCam-enabled build process..."

# Check if .env.preview exists
if [ ! -f ".env.preview" ]; then
    echo "❌ Error: .env.preview file not found!"
    echo "Please create .env.preview with your UXCam configuration:"
    echo "UXCAM_API_KEY=xnayvk2m8m2h8xw-us"
    echo "UXCAM_ENABLED=true"
    exit 1
fi

# Push environment variables
echo "📤 Pushing environment variables..."
eas env:push preview --path .env.preview

# List environment variables to verify
echo "📋 Current environment variables:"
eas env:list preview --format long

# Build the app for both platforms
echo "🔨 Building Android app with UXCam..."
eas build -p android --profile preview

echo "🍎 Building iOS app with UXCam..."
eas build -p ios --profile preview

echo "✅ Build process completed for both platforms!"
echo ""
echo "📱 Next steps:"
echo "1. Install the APK/IPA on your devices"
echo "2. Open the app and perform some actions"
echo "3. Check UXCam dashboard for session data"
echo "4. If no data appears, check the app logs for UXCam initialization"
echo "5. Verify both Android and iOS sessions are being recorded"
