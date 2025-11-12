# UXCam Build Script for DIL Tutor App (PowerShell)
Write-Host "🚀 Starting UXCam-enabled build process..." -ForegroundColor Green

# Check if .env.preview exists
if (-not (Test-Path ".env.preview")) {
    Write-Host "❌ Error: .env.preview file not found!" -ForegroundColor Red
    Write-Host "Please create .env.preview with your UXCam configuration:" -ForegroundColor Yellow
    Write-Host "UXCAM_API_KEY=smos6vxe844g3zn-us" -ForegroundColor Cyan
    Write-Host "UXCAM_ENABLED=true" -ForegroundColor Cyan
    Write-Host "EXPO_PUBLIC_SUPABASE_URL=your-supabase-url" -ForegroundColor Cyan
    Write-Host "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key" -ForegroundColor Cyan
    exit 1
}

# Push environment variables
Write-Host "📤 Pushing environment variables..." -ForegroundColor Blue
eas env:push preview --path .env.preview

# List environment variables to verify
Write-Host "📋 Current environment variables:" -ForegroundColor Blue
eas env:list preview --format long

# Build the app for both platforms
Write-Host "🔨 Building Android app with UXCam..." -ForegroundColor Blue
eas build -p android --profile preview

Write-Host "🍎 Building iOS app with UXCam..." -ForegroundColor Blue
eas build -p ios --profile preview

Write-Host "✅ Build process completed for both platforms!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next steps:" -ForegroundColor Yellow
Write-Host "1. Install the APK/IPA on your devices" -ForegroundColor White
Write-Host "2. Open the app and perform some actions" -ForegroundColor White
Write-Host "3. Check UXCam dashboard for session data" -ForegroundColor White
Write-Host "4. If no data appears, check the app logs for UXCam initialization" -ForegroundColor White
Write-Host "5. Verify both Android and iOS sessions are being recorded" -ForegroundColor White
