#!/usr/bin/env node

/**
 * Simple UXCam Integration Test
 * This script tests the UXCam configuration without requiring Android SDK
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 UXCam Integration Test');
console.log('========================\n');

// Test 1: Check if UXCam package is installed
function testPackageInstallation() {
  console.log('1. Testing Package Installation...');
  
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hasUXCam = packageJson.dependencies && packageJson.dependencies['react-native-ux-cam'];
  
  if (hasUXCam) {
    console.log('✅ react-native-ux-cam is installed');
    console.log(`   Version: ${hasUXCam}`);
    return true;
  } else {
    console.log('❌ react-native-ux-cam is not installed');
    return false;
  }
}

// Test 2: Check configuration file
function testConfiguration() {
  console.log('\n2. Testing Configuration...');
  
  const configPath = path.join(__dirname, 'config', 'uxcam.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Check for App Key
  const hasAppKey = configContent.includes('xnayvk2m8m2h8xw-us');
  if (hasAppKey) {
    console.log('✅ UXCam App Key is configured');
  } else {
    console.log('❌ UXCam App Key is missing');
    return false;
  }
  
  // Check for service class
  const hasService = configContent.includes('UXCamService');
  if (hasService) {
    console.log('✅ UXCamService class is defined');
  } else {
    console.log('❌ UXCamService class is missing');
    return false;
  }
  
  // Check for error handling
  const hasErrorHandling = configContent.includes('if (!this.UXCam) return');
  if (hasErrorHandling) {
    console.log('✅ Error handling is implemented');
  } else {
    console.log('❌ Error handling is missing');
    return false;
  }
  
  return hasAppKey && hasService && hasErrorHandling;
}

// Test 3: Check app.json configuration
function testAppJson() {
  console.log('\n3. Testing App Configuration...');
  
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  const plugins = appJson.expo.plugins || [];
  const hasUXCamPlugin = plugins.some(plugin => 
    Array.isArray(plugin) && plugin[0] === 'react-native-ux-cam'
  );
  
  if (hasUXCamPlugin) {
    console.log('✅ UXCam plugin is configured in app.json');
    return true;
  } else {
    console.log('❌ UXCam plugin is missing from app.json');
    return false;
  }
}

// Test 4: Check hook integration
function testHookIntegration() {
  console.log('\n4. Testing Hook Integration...');
  
  const hookPath = path.join(__dirname, 'hooks', 'useUXCam.ts');
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  
  const hasHook = hookContent.includes('useUXCam');
  const hasAuthContext = hookContent.includes('useAuth');
  const hasErrorHandling = hookContent.includes('Continue without UXCam');
  
  if (hasHook && hasAuthContext && hasErrorHandling) {
    console.log('✅ useUXCam hook is properly integrated');
    return true;
  } else {
    console.log('❌ useUXCam hook integration is incomplete');
    return false;
  }
}

// Test 5: Check layout integration
function testLayoutIntegration() {
  console.log('\n5. Testing Layout Integration...');
  
  const layoutPath = path.join(__dirname, 'app', '_layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  const hasImport = layoutContent.includes('useUXCam');
  const hasHookCall = layoutContent.includes('useUXCam()');
  
  if (hasImport && hasHookCall) {
    console.log('✅ UXCam is integrated in app layout');
    return true;
  } else {
    console.log('❌ UXCam is not integrated in app layout');
    return false;
  }
}

// Run all tests
function runTests() {
  const tests = [
    testPackageInstallation(),
    testConfiguration(),
    testAppJson(),
    testHookIntegration(),
    testLayoutIntegration()
  ];
  
  const passedTests = tests.filter(Boolean).length;
  const totalTests = tests.length;
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! UXCam integration is properly configured.');
    console.log('\n📝 Next Steps:');
    console.log('1. Set up Android SDK for full testing');
    console.log('2. Run: npx expo run:android');
    console.log('3. Check UXCam dashboard for session recordings');
  } else {
    console.log('⚠️  Some tests failed. Please address the issues above.');
  }
  
  console.log('\n🔧 Troubleshooting Tips:');
  console.log('- Make sure Android SDK is properly installed');
  console.log('- Set ANDROID_HOME environment variable');
  console.log('- Run: npx expo start for development testing');
  console.log('- Check console logs for UXCam initialization messages');
}

// Run the tests
runTests();
