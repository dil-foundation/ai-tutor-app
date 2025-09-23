#!/bin/bash

# DIL-LMS E2E Test Setup Script
# This script sets up the testing environment for BrowserStack App Automate

echo "🚀 Setting up DIL-LMS E2E Testing Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Create necessary directories
echo "📁 Creating test directories..."
mkdir -p screenshots
mkdir -p allure-results
mkdir -p logs
mkdir -p apps

echo "✅ Directories created"

# Install dependencies
echo "📦 Installing test dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << EOF
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
EOF
    echo "✅ .env file created. Please update it with your BrowserStack credentials."
else
    echo "✅ .env file already exists"
fi

# Verify WebdriverIO installation
echo "🔍 Verifying WebdriverIO installation..."
npx wdio --version

if [ $? -eq 0 ]; then
    echo "✅ WebdriverIO installed successfully"
else
    echo "❌ WebdriverIO installation failed"
    exit 1
fi

# Check if Allure is installed
echo "🔍 Verifying Allure installation..."
npx allure --version

if [ $? -eq 0 ]; then
    echo "✅ Allure installed successfully"
else
    echo "⚠️  Allure not found. Installing..."
    npm install -g allure-commandline
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file with your BrowserStack credentials"
echo "2. Upload your app files to BrowserStack and update the app IDs"
echo "3. Run smoke tests: npm run test:smoke"
echo "4. Run regression tests: npm run test:regression"
echo ""
echo "📚 For more information, see the README.md file"
echo ""
