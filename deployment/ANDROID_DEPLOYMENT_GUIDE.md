# Android Deployment Guide - APK & Google Play Store

This guide will help you set up automated Android builds and Google Play Store deployment for the DIL Tutor App using GitHub Actions and Expo Application Services (EAS).

## Prerequisites

### 1. Google Play Console Account
- **Google Play Console Developer Account** ($25 one-time registration fee)
- **App created in Google Play Console** with package name `com.dil.lms`
- **Google Play Console API access** enabled

### 2. Expo Account Setup
- **Expo account** (free tier is sufficient for basic builds)
- **EAS CLI** installed globally: `npm install -g @expo/eas-cli`
- **Project linked to Expo account** (already configured with project ID: `9a1d7eb1-4a6c-4662-9691-bf042019099d`)

### 3. Development Environment
- **Node.js** 18+ and npm
- **Java Development Kit (JDK)** 17+
- **Android Studio** (optional, for local testing)

## Step 1: Google Play Console Setup

### 1.1 Create App in Google Play Console
1. Log in to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in the app details:
   - **App name**: DIL Tutor App (or your preferred name)
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or your preference)
   - **Package name**: `com.dil.lms` (already configured in app.json)

### 1.2 Configure App Information
1. **App content**:
   - Complete the content rating questionnaire
   - Set target audience and content
   - Add privacy policy URL

2. **Store listing**:
   - App description and short description
   - App icon and feature graphic
   - Screenshots for different device types
   - Categorization

### 1.3 Set Up API Access
1. Go to **Setup** → **API access**
2. **Create or link Google Cloud project**
3. **Create service account**:
   - Go to Google Cloud Console
   - Create service account with Play Console permissions
   - Download JSON key file
4. **Grant permissions** in Play Console

## Step 2: EAS Configuration

### 2.1 Update EAS Configuration
The `eas.json` file has been updated with Android-specific configurations. You need to update the following placeholders:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "path/to/api-key.json",
        "track": "internal"
      }
    },
    "play-store": {
      "android": {
        "serviceAccountKeyPath": "path/to/api-key.json",
        "track": "production",
        "releaseStatus": "draft"
      }
    }
  }
}
```

**To configure**:
- **serviceAccountKeyPath**: Path to your Google Play Console service account JSON key
- **track**: Release track (internal, alpha, beta, production)

### 2.2 Configure Android Credentials
Run these commands locally to set up Android credentials:

```bash
# Login to Expo
eas login

# Configure Android credentials
eas credentials:configure --platform android

# Follow the prompts to:
# 1. Generate or upload Android Keystore
# 2. Set up Google Play Console service account key
```

## Step 3: GitHub Repository Setup

### 3.1 Repository Secrets
Add the following secrets to your GitHub repository (**Settings** → **Secrets and variables** → **Actions**):

#### Required Secrets:
1. **EXPO_TOKEN**: 
   ```bash
   # Generate token locally
   eas whoami
   # If not logged in: eas login
   # Generate token at: https://expo.dev/accounts/[username]/settings/access-tokens
   ```

#### Optional Secrets (for enhanced security):
2. **GOOGLE_PLAY_SERVICE_ACCOUNT_KEY**: Base64 encoded service account JSON
3. **ANDROID_KEYSTORE_PASSWORD**: Keystore password (if using custom keystore)

## Step 4: Deployment Workflows

### 4.1 Android Build and Deploy Workflow
The main Android deployment workflow (`android-build-deploy.yml`) triggers on:
- **Push to main/master**: Creates preview APK
- **Git tags (android-v*)**: Creates production APK
- **Git tags (android-release-*)**: Creates AAB and submits to Play Store
- **Manual dispatch**: Allows choosing build profile, type, and Play Store deployment

### 4.2 Google Play Store Release Workflow
The dedicated Play Store release workflow (`android-play-store-release.yml`) provides:
- **Manual trigger only**: Controlled production releases
- **Version management**: Automatic version bumping
- **Release track selection**: Internal, Alpha, Beta, or Production
- **Rollout control**: Staged rollout percentage for production
- **Complete automation**: Build → Submit → GitHub Release

### 4.3 Build Profiles
- **development**: Internal testing, debug APK
- **preview**: Internal distribution, release APK
- **production**: Production builds, AAB for Play Store
- **play-store**: Dedicated Play Store builds (extends production)

### 4.4 Build Types
- **APK**: Direct installation, sideloading, internal distribution
- **AAB (Android App Bundle)**: Google Play Store optimized format

## Step 5: Deployment Options

### 5.1 Manual Deployment Options

#### APK Build for Direct Distribution:
1. Go to **Actions** tab in GitHub
2. Select **Android Build and Deploy** workflow
3. Click **Run workflow**
4. Choose:
   - Release channel: preview or production
   - Build type: apk
   - Deploy to Play Store: false

#### Google Play Store Release:
1. Go to **Actions** tab in GitHub
2. Select **Android Play Store Production Release** workflow
3. Click **Run workflow**
4. Enter:
   - Version number (e.g., 1.0.0)
   - Release notes
   - Release track (internal/alpha/beta/production)
   - Rollout percentage (for production)

### 5.2 Automatic Triggers

#### APK Releases:
```bash
# Create APK release
git tag android-v1.0.0
git push origin android-v1.0.0
```

#### Play Store Releases:
```bash
# Create Play Store release
git tag android-release-1.0.0
git push origin android-release-1.0.0
```

## Step 6: First Deployment

### 6.1 Test Local Build (Optional)
```bash
# Install dependencies
npm install

# Test preview APK build locally
eas build --platform android --profile preview --local

# Test production AAB build locally
eas build --platform android --profile production --local
```

### 6.2 APK Release for Testing
1. **Create an APK release tag**:
   ```bash
   git tag android-v1.0.0
   git push origin android-v1.0.0
   ```

2. **Monitor the build**:
   - Go to GitHub Actions to monitor progress
   - Check Expo dashboard for build status
   - Download APK from GitHub release or build URL

### 6.3 Google Play Store Production Release
1. **Use the Play Store Release workflow**:
   - Go to GitHub Actions
   - Select "Android Play Store Production Release"
   - Click "Run workflow"
   - Enter version (e.g., 1.0.0), release notes, and track
   - Click "Run workflow"

2. **The workflow will automatically**:
   - Update app version in configuration files
   - Create a release tag (`android-release-1.0.0`)
   - Build the Android AAB
   - Submit to Google Play Console
   - Create a GitHub release

3. **Complete the release in Google Play Console**:
   - Visit [Google Play Console](https://play.google.com/console)
   - Navigate to your app → Release → [Track]
   - Review the new release
   - Complete metadata and publish

## Step 7: Release Tracks and Testing

### 7.1 Release Tracks
1. **Internal Testing**: For your team and internal testers
2. **Alpha Testing**: Closed testing with selected users
3. **Beta Testing**: Open or closed testing with larger audience
4. **Production**: Live release to all users

### 7.2 Staged Rollout
- **Production releases** can be rolled out gradually
- Start with 5-20% of users
- Monitor crash reports and user feedback
- Increase rollout percentage as confidence grows

### 7.3 Testing Strategy
1. **Internal testing**: Use development/preview APKs
2. **Alpha/Beta testing**: Use Play Store internal/alpha tracks
3. **Production release**: Use staged rollout approach

## Step 8: Monitoring and Maintenance

### 8.1 Build Monitoring
- **GitHub Actions**: Monitor workflow execution
- **Expo Dashboard**: Track build status and logs
- **Google Play Console**: Monitor release status and user feedback

### 8.2 Version Management
- **Automatic versioning**: Enabled in production builds
- **Manual versioning**: Update `version` in `app.json` if needed
- **Version codes**: Automatically incremented by EAS
- **Play Store releases**: Automatically managed by the release workflow

### 8.3 Key Management
- **Android Keystore**: Valid indefinitely (keep secure backups)
- **Google Play Console API keys**: No expiration (rotate periodically)
- **Service account permissions**: Review and update as needed

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
eas build:list --platform android
eas build:view [BUILD_ID]

# Clear cache and retry
eas build --platform android --profile production --clear-cache
```

#### 2. Keystore Issues
```bash
# Reset Android credentials
eas credentials:configure --platform android

# Check current credentials
eas credentials:list --platform android
```

#### 3. Play Store Submission Issues
- Ensure app is properly configured in Play Console
- Check that package name matches exactly (`com.dil.lms`)
- Verify all required metadata is completed
- Ensure service account has proper permissions

#### 4. GitHub Actions Issues
- Check EXPO_TOKEN is valid and has correct permissions
- Ensure repository has access to secrets
- Verify EAS CLI version compatibility

### Getting Help
- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer/
- **GitHub Actions Docs**: https://docs.github.com/en/actions

## Security Best Practices

1. **Use service account keys** instead of personal Google accounts
2. **Rotate EXPO_TOKEN** regularly
3. **Secure keystore files** with strong passwords
4. **Limit repository access** to necessary team members
5. **Use branch protection** rules
6. **Monitor build logs** for sensitive information leaks
7. **Keep dependencies updated** regularly

## Quick Reference Commands

```bash
# EAS Commands
eas login
eas build --platform android --profile production
eas submit --platform android --latest
eas build:list --platform android
eas credentials:configure --platform android

# NPM Scripts
npm run build:android:development    # Development APK
npm run build:android:preview        # Preview APK
npm run build:android:production     # Production AAB
npm run build:android:play-store     # Play Store AAB
npm run submit:android:play-store    # Submit to Play Store

# Git Commands for Releases
git tag android-v1.0.0               # APK release
git push origin android-v1.0.0
git tag android-release-1.0.0        # Play Store release
git push origin android-release-1.0.0

# Local Testing
npm install
npm run android
npm run start:prod
```

## Release Strategies

### APK Distribution Strategy
1. **Development APKs**: For internal team testing
2. **Preview APKs**: For stakeholder review and QA
3. **Production APKs**: For direct distribution or enterprise deployment

### Google Play Store Strategy
1. **Use the dedicated Play Store workflow** for production releases
2. **Semantic versioning**: Major.Minor.Patch (e.g., 1.0.0)
3. **Release tracks**: Progress from internal → alpha → beta → production
4. **Staged rollouts**: Use gradual rollout for production releases
5. **Release notes**: Always provide meaningful release notes

## Next Steps

After successful deployment:
1. **Set up crash reporting** (e.g., Sentry, Bugsnag)
2. **Configure analytics** (already has UXCam integration)
3. **Set up automated testing** in CI/CD pipeline
4. **Plan release schedule** and versioning strategy
5. **Set up staging environment** for testing
6. **Monitor user feedback** and app performance

---

This deployment setup provides a robust, automated pipeline for Android app distribution through both direct APK distribution and Google Play Store, ensuring consistent builds and streamlined releases.
