#!/usr/bin/env node

/**
 * Appium Connection Check Script
 * This script helps diagnose Appium connection issues
 */

const { execSync, spawn } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Appium setup...\n');

// Check if Appium is installed
console.log('1. Checking Appium installation...');
try {
  const appiumVersion = execSync('appium --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Appium version: ${appiumVersion}`);
} catch (error) {
  console.log('❌ Appium is not installed or not in PATH');
  console.log('📋 Install Appium: npm install -g appium');
  console.log('📋 Install drivers: appium driver install uiautomator2');
  process.exit(1);
}

// Check if required drivers are installed
console.log('\n2. Checking Appium drivers...');
try {
  const drivers = execSync('appium driver list', { encoding: 'utf8' });
  if (drivers.includes('uiautomator2')) {
    console.log('✅ UiAutomator2 driver is installed');
  } else {
    console.log('❌ UiAutomator2 driver is not installed');
    console.log('📋 Install driver: appium driver install uiautomator2');
  }
  
  if (drivers.includes('xcuitest')) {
    console.log('✅ XCUITest driver is installed');
  } else {
    console.log('❌ XCUITest driver is not installed');
    console.log('📋 Install driver: appium driver install xcuitest');
  }
} catch (error) {
  console.log('❌ Failed to check drivers:', error.message);
}

// Check if port 4723 is available
console.log('\n3. Checking port 4723 availability...');
const server = net.createServer();
server.listen(4723, () => {
  console.log('✅ Port 4723 is available');
  server.close();
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('❌ Port 4723 is already in use');
    console.log('📋 Kill existing Appium processes or use a different port');
  } else {
    console.log('❌ Port 4723 error:', err.message);
  }
});

// Check if Android SDK is available
console.log('\n4. Checking Android SDK...');
const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (androidHome) {
  console.log(`✅ ANDROID_HOME: ${androidHome}`);
  
  // Check if adb is available
  try {
    const adbVersion = execSync('adb version', { encoding: 'utf8' }).trim();
    console.log(`✅ ADB: ${adbVersion.split('\n')[0]}`);
  } catch (error) {
    console.log('❌ ADB is not available in PATH');
  }
} else {
  console.log('❌ ANDROID_HOME is not set');
  console.log('📋 Set ANDROID_HOME environment variable to your Android SDK path');
}

// Check if app files exist
console.log('\n5. Checking app files...');
const appFiles = [
  'apps/application-88a4b9a2-4e27-4c5a-bb69-a22275d44b90-new android build.apk',
  'apps/application-3c9d64c2-1c28-4e00-8df4-aed8597e1b8c.ipa'
];

appFiles.forEach(appFile => {
  const appPath = path.join(process.cwd(), appFile);
  if (fs.existsSync(appPath)) {
    const stats = fs.statSync(appPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Found: ${appFile} (${sizeInMB} MB)`);
  } else {
    console.log(`❌ Missing: ${appFile}`);
  }
});

// Test Appium server startup
console.log('\n6. Testing Appium server startup...');
console.log('🚀 Starting Appium server for 10 seconds...');

const appiumProcess = spawn('appium', [
  '--address', 'localhost',
  '--port', '4723',
  '--log', './logs/appium-test.log'
], {
  stdio: 'pipe',
  cwd: process.cwd()
});

let serverStarted = false;
let output = '';

appiumProcess.stdout.on('data', (data) => {
  output += data.toString();
  if (data.toString().includes('Appium REST http interface listener started')) {
    serverStarted = true;
    console.log('✅ Appium server started successfully');
  }
});

appiumProcess.stderr.on('data', (data) => {
  output += data.toString();
});

// Kill the process after 10 seconds
setTimeout(() => {
  appiumProcess.kill();
  if (serverStarted) {
    console.log('✅ Appium server test completed successfully');
  } else {
    console.log('❌ Appium server failed to start');
    console.log('📋 Check the logs for more details');
    if (output) {
      console.log('\n📋 Appium output:');
      console.log(output);
    }
  }
  
  console.log('\n📋 Troubleshooting tips:');
  console.log('• Make sure no other Appium processes are running');
  console.log('• Check if port 4723 is available');
  console.log('• Verify Appium drivers are installed');
  console.log('• Check Android SDK setup');
  console.log('• Review Appium logs in ./logs/appium.log');
  
}, 10000);
