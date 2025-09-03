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

# Build the app
echo "🔨 Building Android app with UXCam..."
eas build -p android --profile preview

echo "✅ Build process completed!"
echo ""
echo "📱 Next steps:"
echo "1. Install the APK on your device"
echo "2. Open the app and perform some actions"
echo "3. Check UXCam dashboard for session data"
echo "4. If no data appears, check the app logs for UXCam initialization"
