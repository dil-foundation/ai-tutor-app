#!/usr/bin/env node

/**
 * UXCam Integration Testing Script
 * This script helps verify UXCam integration and provides debugging information
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 UXCam Integration Testing Script');
console.log('=====================================\n');

// Check if UXCam package is installed
function checkPackageInstallation() {
  console.log('1. Checking UXCam package installation...');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hasUXCam = packageJson.dependencies && packageJson.dependencies['react-native-uxcam'];
  
  if (hasUXCam) {
    console.log('✅ react-native-uxcam is installed');
    console.log(`   Version: ${hasUXCam}`);
  } else {
    console.log('❌ react-native-uxcam is not installed');
    console.log('   Run: npm install react-native-uxcam');
  }
  
  return hasUXCam;
}

// Check configuration files
function checkConfiguration() {
  console.log('\n2. Checking UXCam configuration...');
  
  const configPath = path.join(__dirname, '..', 'config', 'uxcam.ts');
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ UXCam config file not found at config/uxcam.ts');
    return false;
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8');
  const hasAppKey = configContent.includes('YOUR_UXCAM_APP_KEY_HERE');
  
  if (hasAppKey) {
    console.log('⚠️  UXCam App Key needs to be configured');
    console.log('   Update config/uxcam.ts with your actual App Key');
  } else {
    console.log('✅ UXCam App Key appears to be configured');
  }
  
  const hasService = configContent.includes('UXCamService');
  if (hasService) {
    console.log('✅ UXCamService class found');
  } else {
    console.log('❌ UXCamService class not found');
  }
  
  return !hasAppKey && hasService;
}

// Check hook integration
function checkHookIntegration() {
  console.log('\n3. Checking UXCam hook integration...');
  
  const hookPath = path.join(__dirname, '..', 'hooks', 'useUXCam.ts');
  
  if (!fs.existsSync(hookPath)) {
    console.log('❌ useUXCam hook not found');
    return false;
  }
  
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  const hasHook = hookContent.includes('useUXCam');
  const hasAuthContext = hookContent.includes('useAuth');
  
  if (hasHook && hasAuthContext) {
    console.log('✅ useUXCam hook found and properly integrated');
  } else {
    console.log('❌ useUXCam hook integration incomplete');
  }
  
  return hasHook && hasAuthContext;
}

// Check layout integration
function checkLayoutIntegration() {
  console.log('\n4. Checking layout integration...');
  
  const layoutPath = path.join(__dirname, '..', 'app', '_layout.tsx');
  
  if (!fs.existsSync(layoutPath)) {
    console.log('❌ _layout.tsx not found');
    return false;
  }
  
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const hasUXCamImport = layoutContent.includes('useUXCam');
  const hasUXCamHook = layoutContent.includes('useUXCam()');
  
  if (hasUXCamImport && hasUXCamHook) {
    console.log('✅ UXCam integrated in app layout');
  } else {
    console.log('❌ UXCam not integrated in app layout');
  }
  
  return hasUXCamImport && hasUXCamHook;
}

// Check Android permissions
function checkAndroidPermissions() {
  console.log('\n5. Checking Android permissions...');
  
  const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  
  if (!fs.existsSync(manifestPath)) {
    console.log('❌ AndroidManifest.xml not found');
    return false;
  }
  
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const hasNetworkState = manifestContent.includes('ACCESS_NETWORK_STATE');
  const hasWifiState = manifestContent.includes('ACCESS_WIFI_STATE');
  
  if (hasNetworkState && hasWifiState) {
    console.log('✅ Required Android permissions found');
  } else {
    console.log('❌ Missing required Android permissions');
    if (!hasNetworkState) console.log('   Missing: ACCESS_NETWORK_STATE');
    if (!hasWifiState) console.log('   Missing: ACCESS_WIFI_STATE');
  }
  
  return hasNetworkState && hasWifiState;
}

// Check wrapper components
function checkWrapperComponents() {
  console.log('\n6. Checking UXCam wrapper components...');
  
  const wrapperPath = path.join(__dirname, '..', 'components', 'UXCamWrapper.tsx');
  const examplePath = path.join(__dirname, '..', 'components', 'UXCamExample.tsx');
  
  const hasWrapper = fs.existsSync(wrapperPath);
  const hasExample = fs.existsSync(examplePath);
  
  if (hasWrapper) {
    console.log('✅ UXCamWrapper component found');
  } else {
    console.log('❌ UXCamWrapper component not found');
  }
  
  if (hasExample) {
    console.log('✅ UXCamExample component found');
  } else {
    console.log('❌ UXCamExample component not found');
  }
  
  return hasWrapper && hasExample;
}

// Generate test checklist
function generateTestChecklist() {
  console.log('\n7. Testing Checklist:');
  console.log('======================');
  console.log('');
  console.log('After running the app, verify:');
  console.log('');
  console.log('✅ App starts without errors');
  console.log('✅ Console shows "UXCam initialized successfully"');
  console.log('✅ No TypeScript compilation errors');
  console.log('✅ Navigation between screens works');
  console.log('✅ Console shows screen view events');
  console.log('✅ UXCam dashboard shows session recordings');
  console.log('✅ Sensitive screens are properly masked');
  console.log('✅ Custom events are tracked');
  console.log('✅ App performance is not impacted');
  console.log('');
}

// Main execution
function main() {
  const checks = [
    checkPackageInstallation(),
    checkConfiguration(),
    checkHookIntegration(),
    checkLayoutIntegration(),
    checkAndroidPermissions(),
    checkWrapperComponents()
  ];
  
  const passedChecks = checks.filter(Boolean).length;
  const totalChecks = checks.length;
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Passed: ${passedChecks}/${totalChecks} checks`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 All checks passed! UXCam integration is ready for testing.');
  } else {
    console.log('⚠️  Some checks failed. Please address the issues above.');
  }
  
  generateTestChecklist();
  
  console.log('\n📝 Next Steps:');
  console.log('==============');
  console.log('1. Update UXCam App Key in config/uxcam.ts');
  console.log('2. Run: npx expo run:android');
  console.log('3. Test the app and verify UXCam integration');
  console.log('4. Check UXCam dashboard for session recordings');
  console.log('5. Review the comprehensive guide: UXCAM_SETUP_GUIDE.md');
}

// Run the script
main();
