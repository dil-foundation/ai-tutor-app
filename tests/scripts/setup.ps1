# DIL-LMS E2E Test Setup Script (PowerShell)
# This script sets up the testing environment for BrowserStack App Automate

Write-Host "🚀 Setting up DIL-LMS E2E Testing Environment..." -ForegroundColor Blue

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v16 or higher." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($nodeVersionNumber -lt 16) {
    Write-Host "❌ Node.js version 16 or higher is required. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "📁 Creating test directories..." -ForegroundColor Blue
$directories = @("screenshots", "allure-results", "logs", "apps")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Directory already exists: $dir" -ForegroundColor Green
    }
}

# Install dependencies
Write-Host "📦 Installing test dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    $envContent = @"
# BrowserStack Configuration
BROWSERSTACK_USERNAME=your_username_here
BROWSERSTACK_ACCESS_KEY=your_access_key_here
BROWSERSTACK_BUILD_NAME=DIL-Tutor-Build-1.0.0

# BrowserStack App IDs (upload your apps to BrowserStack and get these IDs)
BROWSERSTACK_ANDROID_APP_ID=bs://your_android_app_id_here
BROWSERSTACK_IOS_APP_ID=bs://your_ios_app_id_here

# Local App Paths (for local testing)
ANDROID_APP_PATH=./apps/your_android_app.apk
IOS_APP_PATH=./apps/your_ios_app.ipa

# Test Configuration
TEST_ENVIRONMENT=staging
TEST_TIMEOUT=60000
TEST_RETRIES=2

# Test Data
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_FIRST_NAME=Test
TEST_USER_LAST_NAME=User
TEST_USER_GRADE=Grade 10

# API Configuration
API_BASE_URL=https://api.dil.lms-staging.com
SUPABASE_URL=https://yfaiauooxwvekdimfeuu.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Screenshot and Video Configuration
SCREENSHOT_ON_FAILURE=true
VIDEO_RECORDING=true
ALLURE_RESULTS_DIR=./allure-results

# Debug Configuration
DEBUG_MODE=false
VERBOSE_LOGGING=false
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created. Please update it with your BrowserStack credentials." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Verify WebdriverIO installation
Write-Host "🔍 Verifying WebdriverIO installation..." -ForegroundColor Blue
try {
    npx wdio --version | Out-Null
    Write-Host "✅ WebdriverIO installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ WebdriverIO installation failed" -ForegroundColor Red
    exit 1
}

# Check if Allure is installed
Write-Host "🔍 Verifying Allure installation..." -ForegroundColor Blue
try {
    npx allure --version | Out-Null
    Write-Host "✅ Allure installed successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Allure not found. Installing..." -ForegroundColor Yellow
    npm install -g allure-commandline
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Allure installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Allure" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Blue
Write-Host "1. Update the .env file with your BrowserStack credentials" -ForegroundColor White
Write-Host "2. Upload your app files to BrowserStack and update the app IDs" -ForegroundColor White
Write-Host "3. Run smoke tests: npm run test:smoke" -ForegroundColor White
Write-Host "4. Run regression tests: npm run test:regression" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more information, see the README.md file" -ForegroundColor Blue
Write-Host ""
