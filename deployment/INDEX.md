# Deployment Documentation Index

Quick navigation to all deployment resources for the DIL Tutor App.

## 📖 Documentation Files

### 🏠 Main Entry Point
- **[README.md](README.md)** - Complete deployment documentation overview and getting started guide

### 📱 Platform-Specific Guides
- **[iOS TestFlight Deployment Guide](IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md)** - Complete iOS deployment setup
- **[Android Deployment Guide](ANDROID_DEPLOYMENT_GUIDE.md)** - Complete Android deployment setup

### 📊 Summary Documents
- **[Complete Deployment Summary](COMPLETE_DEPLOYMENT_SUMMARY.md)** - Cross-platform deployment overview
- **[Deployment Summary](DEPLOYMENT_SUMMARY.md)** - iOS-focused deployment summary

## 🔧 GitHub Actions Workflows

Located in `../.github/workflows/`:

### iOS Workflows
- **`ios-testflight-deploy.yml`** - iOS TestFlight builds and deployment
- **`ios-app-store-release.yml`** - iOS App Store production releases

### Android Workflows
- **`android-build-deploy.yml`** - Android APK/AAB builds and deployment
- **`android-play-store-release.yml`** - Android Play Store production releases

## 🚀 Quick Access Commands

### Development Setup
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure credentials
eas credentials:configure --platform ios
eas credentials:configure --platform android
```

### Release Commands
```bash
# iOS TestFlight
git tag v1.0.0 && git push origin v1.0.0

# Android APK
git tag android-v1.0.0 && git push origin android-v1.0.0

# iOS App Store (use GitHub Actions)
# Go to Actions → "iOS App Store Production Release"

# Android Play Store (use GitHub Actions)
# Go to Actions → "Android Play Store Production Release"
```

## 📋 Documentation Reading Order

### For New Users
1. **[README.md](README.md)** - Start here for complete overview
2. **[Complete Deployment Summary](COMPLETE_DEPLOYMENT_SUMMARY.md)** - Understand both platforms
3. Choose platform-specific guide based on your needs

### For iOS Deployment
1. **[Complete Deployment Summary](COMPLETE_DEPLOYMENT_SUMMARY.md)** - Cross-platform context
2. **[iOS TestFlight Deployment Guide](IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md)** - Detailed iOS setup
3. **[Deployment Summary](DEPLOYMENT_SUMMARY.md)** - Quick reference

### For Android Deployment
1. **[Complete Deployment Summary](COMPLETE_DEPLOYMENT_SUMMARY.md)** - Cross-platform context
2. **[Android Deployment Guide](ANDROID_DEPLOYMENT_GUIDE.md)** - Detailed Android setup

### For Cross-Platform Teams
1. **[README.md](README.md)** - Overview and structure
2. **[Complete Deployment Summary](COMPLETE_DEPLOYMENT_SUMMARY.md)** - Full cross-platform guide
3. Platform-specific guides as needed for detailed setup

## 🎯 Quick Links by Use Case

### Setting Up First Deployment
- [Prerequisites Checklist](README.md#-prerequisites-checklist)
- [iOS Setup](IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md#step-1-app-store-connect-setup)
- [Android Setup](ANDROID_DEPLOYMENT_GUIDE.md#step-1-google-play-console-setup)

### Troubleshooting Build Issues
- [iOS Troubleshooting](IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md#troubleshooting)
- [Android Troubleshooting](ANDROID_DEPLOYMENT_GUIDE.md#troubleshooting)

### Understanding Release Strategies
- [iOS Release Management](IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md#step-6-review-and-release-process)
- [Android Release Tracks](ANDROID_DEPLOYMENT_GUIDE.md#step-7-release-tracks-and-testing)
- [Cross-Platform Strategies](COMPLETE_DEPLOYMENT_SUMMARY.md#-release-management)

### Quick Command Reference
- [iOS Commands](IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md#quick-reference-commands)
- [Android Commands](ANDROID_DEPLOYMENT_GUIDE.md#quick-reference-commands)
- [NPM Scripts](COMPLETE_DEPLOYMENT_SUMMARY.md#-comprehensive-npm-scripts)

---

**Need help?** Start with the [README.md](README.md) for a comprehensive overview, then dive into the specific guides based on your platform needs.
