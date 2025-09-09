# iOS TestFlight Deployment Guide

This guide will help you set up automated iOS builds and TestFlight deployment for the DIL Tutor App using GitHub Actions and Expo Application Services (EAS).

## Prerequisites

### 1. Apple Developer Account
- **Apple Developer Program membership** ($99/year)
- **App Store Connect access** with admin or developer role
- **Apple ID** with two-factor authentication enabled

### 2. Expo Account Setup
- **Expo account** (free tier is sufficient for basic builds)
- **EAS CLI** installed globally: `npm install -g @expo/eas-cli`
- **Project linked to Expo account** (already configured with project ID: `9a1d7eb1-4a6c-4662-9691-bf042019099d`)

### 3. Development Environment
- **macOS machine** (for local testing, optional)
- **Xcode** (latest version recommended)
- **Node.js** 18+ and npm

## Step 1: App Store Connect Setup

### 1.1 Create App in App Store Connect
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **My Apps** → **+** → **New App**
3. Fill in the app details:
   - **Platform**: iOS
   - **Name**: DIL Tutor App (or your preferred name)
   - **Primary Language**: English
   - **Bundle ID**: `com.dil.lms` (already configured in app.json)
   - **SKU**: A unique identifier (e.g., `dil-tutor-app-2024`)

### 1.2 Configure App Information
1. **App Information**:
   - Category: Education
   - Content Rights: Check if applicable
   - Age Rating: Complete the questionnaire

2. **Pricing and Availability**:
   - Set to Free (or your preferred pricing)
   - Select availability countries

### 1.3 TestFlight Setup
1. Go to **TestFlight** tab in your app
2. **Internal Testing**: Add internal testers (your team members)
3. **External Testing**: Set up external testing groups if needed
4. **Test Information**: Add test notes and feedback email

## Step 2: EAS Configuration

### 2.1 Update EAS Configuration
The `eas.json` file has been updated with iOS-specific configurations. You need to update the following placeholders:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

**To find these values**:
- **appleId**: Your Apple ID email
- **ascAppId**: Found in App Store Connect → App Information → General Information → Apple ID
- **appleTeamId**: Found in Apple Developer Portal → Membership → Team ID

### 2.2 Configure Credentials
Run these commands locally to set up iOS credentials:

```bash
# Login to Expo
eas login

# Configure iOS credentials
eas credentials:configure --platform ios

# Follow the prompts to:
# 1. Generate or upload Distribution Certificate
# 2. Generate or upload Provisioning Profile
# 3. Set up App Store Connect API Key (recommended)
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
   # Generate token: eas build:configure
   ```
   Or create a token at: https://expo.dev/accounts/[username]/settings/access-tokens

#### Optional Secrets (for enhanced security):
2. **APPLE_ID**: Your Apple ID email
3. **APPLE_TEAM_ID**: Your Apple Developer Team ID
4. **ASC_APP_ID**: Your App Store Connect App ID

### 3.2 Branch Protection (Recommended)
1. Go to **Settings** → **Branches**
2. Add protection rule for `main` branch:
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators

## Step 4: Deployment Workflows

### 4.1 TestFlight Deployment Workflow
The main iOS deployment workflow (`ios-testflight-deploy.yml`) triggers on:
- **Push to main/master**: Creates preview build
- **Git tags (v*)**: Creates production build and submits to TestFlight
- **Git tags (release-*)**: Creates production build and submits to App Store
- **Manual dispatch**: Allows choosing build profile and App Store deployment

### 4.2 App Store Release Workflow
The dedicated App Store release workflow (`ios-app-store-release.yml`) provides:
- **Manual trigger only**: Controlled production releases
- **Version management**: Automatic version bumping
- **Release notes**: Custom release notes for App Store
- **Complete automation**: Build → Submit → GitHub Release

### 4.3 Build Profiles
- **development**: Internal testing, simulator builds
- **preview**: Internal distribution, device builds, TestFlight
- **production**: App Store submission, TestFlight
- **app-store**: Dedicated App Store builds (extends production)

### 4.4 Manual Deployment Options

#### TestFlight Deployment:
1. Go to **Actions** tab in GitHub
2. Select **iOS TestFlight Deploy** workflow
3. Click **Run workflow**
4. Choose build profile and deployment target

#### App Store Release:
1. Go to **Actions** tab in GitHub
2. Select **iOS App Store Production Release** workflow
3. Click **Run workflow**
4. Enter version number and release notes
5. The workflow will handle everything automatically

## Step 5: First Deployment

### 5.1 Test Local Build (Optional)
```bash
# Install dependencies
npm install

# Test preview build locally
eas build --platform ios --profile preview --local

# Test production build locally
eas build --platform ios --profile production --local
```

### 5.2 TestFlight Release
1. **Create a release tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Monitor the build**:
   - Go to GitHub Actions to monitor progress
   - Check Expo dashboard for build status
   - Review App Store Connect for TestFlight submission

### 5.3 App Store Production Release
1. **Use the App Store Release workflow**:
   - Go to GitHub Actions
   - Select "iOS App Store Production Release"
   - Click "Run workflow"
   - Enter version (e.g., 1.0.0) and release notes
   - Click "Run workflow"

2. **The workflow will automatically**:
   - Update app version in configuration files
   - Create a release tag (`release-1.0.0`)
   - Build the iOS app
   - Submit to App Store Connect
   - Create a GitHub release

3. **Complete the release in App Store Connect**:
   - Visit [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to your app → App Store tab
   - Select the new build
   - Complete metadata and submit for review

## Step 6: Review and Release Process

### 6.1 TestFlight Review
1. **Internal Testing**: Build appears immediately for internal testers
2. **External Testing**: Requires Apple review (1-3 days)
3. **Ready for distribution**: Available to external testers

### 6.2 App Store Review Process
1. **Submission**: Build submitted to App Store Connect
2. **Waiting for Review**: Apple review queue (1-7 days typically)
3. **In Review**: Apple is reviewing your app
4. **Pending Developer Release**: Approved, waiting for your release
5. **Ready for Sale**: Live on the App Store

### 6.3 Release Management
- **TestFlight releases**: Use `v*` tags (e.g., `v1.0.0`)
- **App Store releases**: Use `release-*` tags (e.g., `release-1.0.0`) or the dedicated workflow
- **Hotfixes**: Use patch versions (e.g., `v1.0.1`, `release-1.0.1`)

## Step 7: Monitoring and Maintenance

### 7.1 Build Monitoring
- **GitHub Actions**: Monitor workflow execution
- **Expo Dashboard**: Track build status and logs
- **App Store Connect**: Monitor TestFlight and App Store status

### 7.2 Version Management
- **Automatic versioning**: Enabled in production builds
- **Manual versioning**: Update `version` in `app.json` if needed
- **Build numbers**: Automatically incremented by EAS
- **App Store releases**: Automatically managed by the release workflow

### 7.3 Certificate Management
- **Distribution certificates**: Valid for 1 year
- **Provisioning profiles**: Valid for 1 year
- **App Store Connect API keys**: No expiration (recommended)

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
eas build:list --platform ios
eas build:view [BUILD_ID]

# Clear cache and retry
eas build --platform ios --profile production --clear-cache
```

#### 2. Credential Issues
```bash
# Reset credentials
eas credentials:configure --platform ios

# Check current credentials
eas credentials:list --platform ios
```

#### 3. TestFlight Submission Issues
- Ensure App Store Connect app is in "Prepare for Submission" state
- Check that bundle identifier matches exactly
- Verify all required app information is completed

#### 4. GitHub Actions Issues
- Check EXPO_TOKEN is valid and has correct permissions
- Ensure repository has access to secrets
- Verify EAS CLI version compatibility

### Getting Help
- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Apple Developer Support**: https://developer.apple.com/support/

## Security Best Practices

1. **Use App Store Connect API Keys** instead of Apple ID/password
2. **Rotate EXPO_TOKEN** regularly
3. **Limit repository access** to necessary team members
4. **Use branch protection** rules
5. **Monitor build logs** for sensitive information leaks
6. **Keep dependencies updated** regularly

## Next Steps

After successful deployment:
1. **Set up crash reporting** (e.g., Sentry, Bugsnag)
2. **Configure analytics** (already has UXCam integration)
3. **Set up automated testing** in CI/CD pipeline
4. **Plan release schedule** and versioning strategy
5. **Set up staging environment** for testing

---

## Quick Reference Commands

```bash
# EAS Commands
eas login
eas build --platform ios --profile production
eas submit --platform ios --latest
eas build:list --platform ios
eas credentials:configure --platform ios

# NPM Scripts
npm run build:ios:preview          # Preview build
npm run build:ios:production       # Production build
npm run build:ios:app-store        # App Store build
npm run submit:ios:testflight      # Submit to TestFlight
npm run submit:ios:app-store       # Submit to App Store

# Git Commands for Releases
git tag v1.0.0                     # TestFlight release
git push origin v1.0.0
git tag release-1.0.0              # App Store release
git push origin release-1.0.0

# Local Testing
npm install
npm run ios
npm run start:prod
```

## Release Strategies

### TestFlight Testing Strategy
1. **Development builds**: For internal team testing
2. **Preview builds**: For stakeholder review
3. **Production builds**: For external beta testing
4. **Release tags**: When ready for App Store

### App Store Release Strategy
1. **Use the dedicated App Store workflow** for production releases
2. **Semantic versioning**: Major.Minor.Patch (e.g., 1.0.0)
3. **Release notes**: Always provide meaningful release notes
4. **Staged rollout**: Consider phased releases for major updates

This deployment setup provides a robust, automated pipeline for iOS app distribution through TestFlight, ensuring consistent builds and streamlined releases.
