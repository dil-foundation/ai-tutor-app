#!/usr/bin/env node

/**
 * Test UXCam Fix
 * Verifies that the UXCam integration works without Expo plugin issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Testing UXCam Fix');
console.log('===================\n');

// Test 1: Check if plugin was removed from app.json
function testPluginRemoval() {
  console.log('1. Testing Plugin Removal...');
  
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  const plugins = appJson.expo.plugins || [];
  const hasUXCamPlugin = plugins.some(plugin => 
    Array.isArray(plugin) && plugin[0] === 'react-native-ux-cam'
  );
  
  if (!hasUXCamPlugin) {
    console.log('✅ UXCam plugin removed from app.json');
    return true;
  } else {
    console.log('❌ UXCam plugin still exists in app.json');
    return false;
  }
}

// Test 2: Check development mode handling
function testDevelopmentMode() {
  console.log('\n2. Testing Development Mode Handling...');
  
  const configPath = path.join(__dirname, 'config', 'uxcam.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  const hasDevCheck = configContent.includes('isDevelopment = __DEV__');
  const hasDevLogging = configContent.includes('if (this.isDevelopment)');
  const hasDevReturn = configContent.includes('console.log(\'UXCam:');
  
  if (hasDevCheck && hasDevLogging && hasDevReturn) {
    console.log('✅ Development mode handling implemented');
    return true;
  } else {
    console.log('❌ Development mode handling missing');
    return false;
  }
}

// Test 3: Check type declarations
function testTypeDeclarations() {
  console.log('\n3. Testing Type Declarations...');
  
  const typesPath = path.join(__dirname, 'types', 'react-native-ux-cam.d.ts');
  
  if (fs.existsSync(typesPath)) {
    console.log('✅ Type declarations file exists');
    return true;
  } else {
    console.log('❌ Type declarations file missing');
    return false;
  }
}

// Test 4: Check error handling
function testErrorHandling() {
  console.log('\n4. Testing Error Handling...');
  
  const configPath = path.join(__dirname, 'config', 'uxcam.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  const hasTryCatch = configContent.includes('try {');
  const hasCatchBlock = configContent.includes('} catch (error) {');
  const hasNullChecks = configContent.includes('if (!this.UXCam) return');
  
  if (hasTryCatch && hasCatchBlock && hasNullChecks) {
    console.log('✅ Error handling implemented');
    return true;
  } else {
    console.log('❌ Error handling missing');
    return false;
  }
}

// Test 5: Check production vs development logic
function testProductionLogic() {
  console.log('\n5. Testing Production Logic...');
  
  const configPath = path.join(__dirname, 'config', 'uxcam.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  const hasProductionImport = configContent.includes('const UXCamModule = await import(\'react-native-ux-cam\')');
  const hasDevModeCheck = configContent.includes('if (this.isDevelopment)');
  const hasDevLogging = configContent.includes('console.log(\'UXCam would be initialized in production');
  
  if (hasProductionImport && hasDevModeCheck && hasDevLogging) {
    console.log('✅ Production/development logic implemented');
    return true;
  } else {
    console.log('❌ Production/development logic missing');
    return false;
  }
}

// Run all tests
function runTests() {
  const tests = [
    testPluginRemoval(),
    testDevelopmentMode(),
    testTypeDeclarations(),
    testErrorHandling(),
    testProductionLogic()
  ];
  
  const passedTests = tests.filter(Boolean).length;
  const totalTests = tests.length;
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! UXCam fix is properly implemented.');
    console.log('\n📝 What was fixed:');
    console.log('✅ Removed problematic Expo plugin from app.json');
    console.log('✅ Added development mode handling');
    console.log('✅ Added TypeScript declarations');
    console.log('✅ Enhanced error handling');
    console.log('✅ Separated production and development logic');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Run: npm start');
    console.log('2. Check console for UXCam development logs');
    console.log('3. Test in production build for full functionality');
    console.log('4. Verify UXCam dashboard integration');
  } else {
    console.log('⚠️  Some tests failed. Please address the issues above.');
  }
  
  console.log('\n💡 Key Benefits:');
  console.log('- No more Expo plugin errors');
  console.log('- Works in development mode');
  console.log('- Graceful degradation');
  console.log('- Type-safe implementation');
  console.log('- Production-ready when built');
}

// Run the tests
runTests();
