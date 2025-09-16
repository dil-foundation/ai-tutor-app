# Cross-Platform UXCam Build Script for DIL Tutor App (PowerShell)
Write-Host "🚀 Starting cross-platform UXCam-enabled build process..." -ForegroundColor Green

# Check if .env.preview exists
if (-not (Test-Path ".env.preview")) {
    Write-Host "❌ Error: .env.preview file not found!" -ForegroundColor Red
    Write-Host "Please create .env.preview with your UXCam configuration:" -ForegroundColor Yellow
    Write-Host "UXCAM_API_KEY=xnayvk2m8m2h8xw-us" -ForegroundColor Cyan
    Write-Host "UXCAM_ENABLED=true" -ForegroundColor Cyan
    Write-Host "EXPO_PUBLIC_SUPABASE_URL=your-supabase-url" -ForegroundColor Cyan
    Write-Host "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key" -ForegroundColor Cyan
    exit 1
}

# Function to build for a specific platform
function Build-Platform {
    param(
        [string]$Platform,
        [string]$Profile = "preview"
    )
    
    Write-Host "🔨 Building $Platform app with UXCam..." -ForegroundColor Blue
    $result = eas build -p $Platform --profile $Profile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $Platform build completed successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Platform build failed!" -ForegroundColor Red
        return $false
    }
}

# Push environment variables
Write-Host "📤 Pushing environment variables..." -ForegroundColor Blue
eas env:push preview --path .env.preview

# List environment variables to verify
Write-Host "📋 Current environment variables:" -ForegroundColor Blue
eas env:list preview --format long

# Build for both platforms
$androidSuccess = Build-Platform "android"
$iosSuccess = Build-Platform "ios"

# Summary
Write-Host ""
Write-Host "📊 Build Summary:" -ForegroundColor Yellow
Write-Host "Android: $(if ($androidSuccess) { '✅ Success' } else { '❌ Failed' })" -ForegroundColor $(if ($androidSuccess) { 'Green' } else { 'Red' })
Write-Host "iOS: $(if ($iosSuccess) { '✅ Success' } else { '❌ Failed' })" -ForegroundColor $(if ($iosSuccess) { 'Green' } else { 'Red' })

if ($androidSuccess -and $iosSuccess) {
    Write-Host ""
    Write-Host "🎉 All builds completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Install the APK/IPA on your devices" -ForegroundColor White
    Write-Host "2. Open the app and perform some actions" -ForegroundColor White
    Write-Host "3. Check UXCam dashboard for session data" -ForegroundColor White
    Write-Host "4. Verify both Android and iOS sessions are being recorded" -ForegroundColor White
    Write-Host "5. Test UXCam functionality on both platforms" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️ Some builds failed. Please check the logs above." -ForegroundColor Yellow
    Write-Host "You can retry individual builds with:" -ForegroundColor White
    Write-Host "  eas build -p android --profile preview" -ForegroundColor Cyan
    Write-Host "  eas build -p ios --profile preview" -ForegroundColor Cyan
}
