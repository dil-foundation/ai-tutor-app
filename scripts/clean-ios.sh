#!/bin/bash

# Clean iOS build script
echo "🧹 Cleaning iOS build artifacts..."

# Clean Expo cache
npx expo install --fix

# Clean node modules
rm -rf node_modules
rm -rf package-lock.json
npm install --legacy-peer-deps

# Clean iOS build cache
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# Clean Metro cache
npx expo start --clear

echo "✅ iOS build cleanup complete!"
