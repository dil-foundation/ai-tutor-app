#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning project for fresh build...');

// Clean npm cache
try {
  console.log('📦 Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ npm cache clean failed:', error.message);
}

// Clean expo cache
try {
  console.log('📱 Cleaning Expo cache...');
  execSync('npx expo install --fix', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ Expo install fix failed:', error.message);
}

// Remove node_modules and reinstall
try {
  console.log('🗑️ Removing node_modules...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('⚠️ Failed to remove node_modules:', error.message);
}

// Remove package-lock.json
try {
  console.log('🗑️ Removing package-lock.json...');
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }
} catch (error) {
  console.log('⚠️ Failed to remove package-lock.json:', error.message);
}

// Reinstall dependencies
try {
  console.log('📦 Reinstalling dependencies...');
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.log('❌ Failed to reinstall dependencies:', error.message);
  process.exit(1);
}

// Clean EAS build cache
try {
  console.log('🏗️ Cleaning EAS build cache...');
  execSync('npx eas build:clean', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ EAS build clean failed:', error.message);
}

console.log('✅ Cleanup completed! You can now run: eas build -p android --profile preview');
