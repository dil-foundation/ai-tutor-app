#!/usr/bin/env node

/**
 * Setup script for DIL Tutor App E2E Tests
 * This script helps set up the testing environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up DIL Tutor App E2E Tests...\n');

// Check if we're in the tests directory
const currentDir = process.cwd();
const isInTestsDir = currentDir.endsWith('tests') || currentDir.includes('tests');

if (!isInTestsDir) {
  console.error('❌ Please run this script from the tests directory');
  process.exit(1);
}

// Create necessary directories
const directories = [
  'screenshots',
  'logs',
  'videos',
  'allure-results',
  'apps'
];

console.log('📁 Creating necessary directories...');
directories.forEach(dir => {
  const dirPath = path.join(currentDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory already exists: ${dir}`);
  }
});

// Create .env file if it doesn't exist
const envPath = path.join(currentDir, '.env');
const envExamplePath = path.join(currentDir, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from env.example');
    console.log('⚠️  Please update the .env file with your actual credentials');
  } else {
    console.log('❌ env.example file not found');
  }
} else {
  console.log('📄 .env file already exists');
}

// Check Node.js version
console.log('\n🔍 Checking Node.js version...');
const nodeVersion = process.version;
const requiredVersion = '18.0.0';
const currentVersion = nodeVersion.replace('v', '');

if (compareVersions(currentVersion, requiredVersion) < 0) {
  console.log(`❌ Node.js version ${nodeVersion} is not supported`);
  console.log(`📋 Please upgrade to Node.js ${requiredVersion} or higher`);
  process.exit(1);
} else {
  console.log(`✅ Node.js version ${nodeVersion} is supported`);
}

// Check if dependencies are installed
console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(currentDir, 'package.json');
const nodeModulesPath = path.join(currentDir, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('📥 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: currentDir });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies are already installed');
}

// Check for required environment variables
console.log('\n🔧 Checking environment configuration...');
const requiredEnvVars = [
  'BROWSERSTACK_USERNAME',
  'BROWSERSTACK_ACCESS_KEY',
  'BROWSERSTACK_ANDROID_APP_ID',
  'BROWSERSTACK_IOS_APP_ID'
];

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingVars = [];

  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log('⚠️  Missing or incomplete environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n📋 Please update your .env file with the correct values');
  } else {
    console.log('✅ Environment variables are configured');
  }
} else {
  console.log('❌ .env file not found. Please create it from env.example');
}

// Check for app files
console.log('\n📱 Checking app files...');
const appFiles = [
  'apps/dil-tutor-app-android.apk',
  'apps/dil-tutor-app-ios.app'
];

appFiles.forEach(appFile => {
  const appPath = path.join(currentDir, appFile);
  if (fs.existsSync(appPath)) {
    console.log(`✅ Found: ${appFile}`);
  } else {
    console.log(`⚠️  Missing: ${appFile}`);
  }
});

// Display setup instructions
console.log('\n📋 Setup Instructions:');
console.log('1. Update your .env file with BrowserStack credentials');
console.log('2. Upload your app files to BrowserStack and get the app IDs');
console.log('3. Update BROWSERSTACK_ANDROID_APP_ID and BROWSERSTACK_IOS_APP_ID in .env');
console.log('4. Run tests using: npm run test:smoke');

console.log('\n🔗 Useful Commands:');
console.log('• npm run test:smoke - Run smoke tests');
console.log('• npm run test:regression - Run regression tests');
console.log('• npm run test:parallel - Run tests in parallel');
console.log('• npm run test:android-browserstack - Run Android tests on BrowserStack');
console.log('• npm run test:ios-browserstack - Run iOS tests on BrowserStack');
console.log('• npm run test:debug - Run tests in debug mode');

console.log('\n📚 Documentation:');
console.log('• BrowserStack App Automate: https://www.browserstack.com/app-automate');
console.log('• WebdriverIO: https://webdriver.io/');
console.log('• Appium: https://appium.io/');

console.log('\n✅ Setup completed! Happy testing! 🎉');

// Helper function to compare versions
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}
