# Deployment Quick Reference Card

## 🚀 One-Command Releases

### iOS Releases
```bash
# TestFlight Beta
git tag v1.0.0 && git push origin v1.0.0

# App Store Production (Manual Workflow)
# GitHub Actions → "iOS App Store Production Release"
```

### Android Releases
```bash
# APK Direct Distribution
git tag android-v1.0.0 && git push origin android-v1.0.0

# Play Store Production (Manual Workflow)
# GitHub Actions → "Android Play Store Production Release"
```

## 📱 NPM Build Scripts

### iOS Scripts
```bash
npm run build:ios:preview          # TestFlight preview
npm run build:ios:production       # Production build
npm run build:ios:app-store        # App Store specific
npm run submit:ios:testflight      # TestFlight submission
npm run submit:ios:app-store       # App Store submission
```

### Android Scripts
```bash
npm run build:android:development  # Development APK
npm run build:android:preview      # Preview APK
npm run build:android:production   # Production AAB
npm run build:android:play-store   # Play Store AAB
npm run submit:android:play-store  # Play Store submission
```

## 🔧 EAS Commands

### Setup
```bash
eas login
eas credentials:configure --platform ios
eas credentials:configure --platform android
```

### Build Commands
```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios --latest

# Android
eas build --platform android --profile production
eas submit --platform android --latest
```

### Monitoring
```bash
eas build:list --platform ios
eas build:list --platform android
eas build:view [BUILD_ID]
```

## 📊 Build Profiles

| Profile | iOS Target | Android Target | Use Case |
|---------|------------|----------------|----------|
| `development` | Simulator | Debug APK | Internal development |
| `preview` | TestFlight | Release APK | Stakeholder review |
| `production` | TestFlight/App Store | AAB/Play Store | Production ready |
| `app-store` | App Store | - | iOS App Store specific |
| `play-store` | - | Play Store | Android Play Store specific |

## 🔄 GitHub Actions Workflows

### iOS Workflows
- **iOS TestFlight Deploy** (`ios-testflight-deploy.yml`)
- **iOS App Store Production Release** (`ios-app-store-release.yml`)

### Android Workflows
- **Android Build and Deploy** (`android-build-deploy.yml`)
- **Android Play Store Production Release** (`android-play-store-release.yml`)

## 🏪 Store URLs

### Development Resources
- **[Expo Dashboard](https://expo.dev/)** - Build monitoring
- **[App Store Connect](https://appstoreconnect.apple.com/)** - iOS app management
- **[Google Play Console](https://play.google.com/console)** - Android app management

### Documentation
- **[Expo Docs](https://docs.expo.dev/)** - Platform documentation
- **[EAS Build](https://docs.expo.dev/build/introduction/)** - Build system
- **[GitHub Actions](https://docs.github.com/en/actions)** - CI/CD automation

## 🔐 Required Secrets

### GitHub Repository Secrets
- `EXPO_TOKEN` - Expo authentication (required for all builds)

### Store Credentials (via EAS)
- iOS: Apple Developer certificates and provisioning profiles
- Android: Android keystore and Google Play service account

## 🆘 Emergency Commands

### Build Issues
```bash
# Clear build cache
eas build --platform ios --clear-cache
eas build --platform android --clear-cache

# Reset credentials
eas credentials:configure --platform ios
eas credentials:configure --platform android
```

### Version Issues
```bash
# Check current version
cat app.json | jq '.expo.version'

# Update version manually
jq '.expo.version = "1.0.1"' app.json > tmp.json && mv tmp.json app.json
```

## 📋 Pre-Release Checklist

### Before Any Release
- [ ] All tests passing
- [ ] Version number updated
- [ ] Release notes prepared
- [ ] Store metadata complete

### iOS Specific
- [ ] Apple Developer account active
- [ ] App Store Connect app configured
- [ ] TestFlight internal testing complete

### Android Specific
- [ ] Google Play Console app configured
- [ ] Internal testing track validated
- [ ] Store listing complete

---

**Need detailed help?** Check the full documentation in this folder:
- [README.md](README.md) - Complete overview
- [iOS Guide](IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md) - iOS detailed setup
- [Android Guide](ANDROID_DEPLOYMENT_GUIDE.md) - Android detailed setup
