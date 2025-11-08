# GitHub Actions Workflows Setup Guide

## 🚀 Overview

This guide explains how to set up and use the professional GitHub Actions workflows for the DIL Tutor mobile app. The workflows provide automated building, testing, and deployment for both Android APK and iOS TestFlight.

## 📁 Workflow Files

### 1. Android APK Build and Deploy
**File:** `.github/workflows/android-build-deploy.yml`

### 2. iOS TestFlight Build and Deploy
**File:** `.github/workflows/ios-testflight-deploy.yml`

## 🔧 Required GitHub Secrets

Before using the workflows, you must configure the following secrets in your GitHub repository:

### Go to: Repository Settings → Secrets and Variables → Actions

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `EXPO_TOKEN` | Expo authentication token | `exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `UXCAM_API_KEY` | UXCam API key for analytics | `7g5tf7r8bew9hs2-us` |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `EXPO_PUBLIC_API_URL` | Backend API URL | `https://api.dil.lms-staging.com` |

## 🎯 Workflow Triggers

### Automatic Triggers
- **Push to main/develop branches** - Triggers both workflows
- **Pull requests to main** - Triggers both workflows for testing
- **File changes** - Only triggers when relevant files are modified

### Manual Triggers
- **Workflow Dispatch** - Manual trigger with customizable options
- **Build Profile Selection** - Choose between `preview` or `production`
- **Skip Tests Option** - Bypass quality checks for faster builds
- **Auto-submit to TestFlight** - iOS only, automatically submit to TestFlight

## 📱 Android Workflow Features

### Quality Checks
- ✅ ESLint code linting
- ✅ TypeScript type checking
- ✅ Security vulnerability audit
- ✅ Dependency validation

### Build Process
- ✅ Node.js 20 setup with npm caching
- ✅ Expo CLI and EAS CLI installation
- ✅ Environment variable configuration
- ✅ UXCam integration
- ✅ APK/AAB generation
- ✅ GitHub Releases creation

### Outputs
- **APK File** - Downloadable from GitHub Releases
- **Build Artifacts** - Stored for 30 days
- **Release Notes** - Automatic generation with technical details

## 🍎 iOS Workflow Features

### Quality Checks
- ✅ ESLint code linting
- ✅ TypeScript type checking
- ✅ Security vulnerability audit
- ✅ Dependency validation

### Build Process
- ✅ macOS runner for iOS builds
- ✅ Node.js 20 setup with npm caching
- ✅ Expo CLI and EAS CLI installation
- ✅ Environment variable configuration
- ✅ UXCam integration
- ✅ IPA generation
- ✅ TestFlight submission (optional)

### Outputs
- **IPA File** - Downloadable from GitHub Releases
- **TestFlight Submission** - Automatic submission to Apple
- **Build Artifacts** - Stored for 30 days
- **Release Notes** - Automatic generation with technical details

## 🚀 Usage Instructions

### 1. Manual Workflow Execution

#### Android Build
```bash
# Go to GitHub Actions tab
# Click "Android APK Build and Deploy"
# Click "Run workflow"
# Select options:
#   - Build profile: preview/production
#   - Skip tests: true/false
# Click "Run workflow"
```

#### iOS TestFlight Build
```bash
# Go to GitHub Actions tab
# Click "iOS TestFlight Build and Deploy"
# Click "Run workflow"
# Select options:
#   - Build profile: preview/production
#   - Skip tests: true/false
#   - Auto submit: true/false
# Click "Run workflow"
```

### 2. Automatic Execution

The workflows automatically run when:
- Code is pushed to `main` or `develop` branches
- Pull requests are created targeting `main`
- Relevant files are modified

### 3. Monitoring Builds

#### Check Build Status
1. Go to GitHub Actions tab
2. Click on the workflow run
3. Monitor each job's progress
4. Check logs for any errors

#### Download Artifacts
1. Go to the completed workflow run
2. Scroll to "Artifacts" section
3. Download the APK/IPA file
4. Install on your device for testing

## 🔍 Troubleshooting

### Common Issues

#### 1. Missing Secrets
**Error:** `EXPO_TOKEN not found`
**Solution:** Add all required secrets in Repository Settings → Secrets

#### 2. Build Failures
**Error:** `EAS build failed`
**Solution:** 
- Check EAS build logs
- Verify environment variables
- Ensure Expo project is properly configured

#### 3. TestFlight Submission Issues
**Error:** `TestFlight submission failed`
**Solution:**
- Verify Apple Developer account access
- Check bundle identifier configuration
- Ensure proper certificates are set up

#### 4. UXCam Integration Issues
**Error:** `UXCam SDK not found`
**Solution:**
- Verify UXCam API key is correct
- Check environment variables are set
- Ensure UXCam plugin is configured in app.json

### Debug Steps

1. **Check Workflow Logs**
   - Go to Actions tab
   - Click on failed workflow
   - Review each step's logs

2. **Verify Environment Variables**
   ```bash
   # Check EAS environment variables
   eas env:list preview --format long
   ```

3. **Test Local Build**
   ```bash
   # Test Android build locally
   eas build -p android --profile preview --local
   
   # Test iOS build locally
   eas build -p ios --profile preview --local
   ```

4. **Check Dependencies**
   ```bash
   # Verify package.json dependencies
   npm audit
   npm outdated
   ```

## 📊 Workflow Status Badges

Add these badges to your README.md:

```markdown
![Android Build](https://github.com/your-username/your-repo/workflows/Android%20APK%20Build%20and%20Deploy/badge.svg)
![iOS Build](https://github.com/your-username/your-repo/workflows/iOS%20TestFlight%20Build%20and%20Deploy/badge.svg)
```

## 🔄 Workflow Customization

### Adding New Build Profiles

1. **Update eas.json**
   ```json
   {
     "build": {
       "staging": {
         "distribution": "internal",
         "android": { "buildType": "apk" },
         "ios": { "env": { "UXCAM_ENABLED": "true" } },
         "env": { "UXCAM_ENABLED": "true" }
       }
     }
   }
   ```

2. **Update Workflow Files**
   - Add new profile option to workflow_dispatch inputs
   - Update build-config step logic

### Adding New Quality Checks

1. **Add new step to quality-check job**
   ```yaml
   - name: Run custom tests
     working-directory: ./dil-tutor-app
     run: npm run test:custom
   ```

2. **Update package.json scripts**
   ```json
   {
     "scripts": {
       "test:custom": "your-test-command"
     }
   }
   ```

## 📈 Performance Optimization

### Caching Strategy
- ✅ Node.js dependencies cached
- ✅ npm cache enabled
- ✅ Build artifacts stored for 30 days

### Parallel Execution
- ✅ Quality checks run in parallel
- ✅ Build jobs run after quality checks
- ✅ Notification jobs run independently

### Resource Management
- ✅ Ubuntu runners for lightweight tasks
- ✅ macOS runners only for iOS builds
- ✅ Efficient dependency installation

## 🛡️ Security Considerations

### Secrets Management
- ✅ All sensitive data stored as GitHub secrets
- ✅ No hardcoded credentials in workflows
- ✅ Environment variables properly scoped

### Build Security
- ✅ Security vulnerability scanning
- ✅ Dependency audit checks
- ✅ Secure artifact storage

## 📞 Support

### Getting Help
1. **Check GitHub Actions logs** for detailed error messages
2. **Review this documentation** for common solutions
3. **Check EAS build logs** for build-specific issues
4. **Verify all secrets** are properly configured

### Contact Information
- **GitHub Issues:** Create an issue in the repository
- **Expo Support:** Check Expo documentation
- **UXCam Support:** Contact UXCam support team

## 🎉 Success Indicators

### Android Workflow Success
- ✅ All quality checks pass
- ✅ APK/AAB file generated
- ✅ GitHub Release created
- ✅ Artifacts uploaded

### iOS Workflow Success
- ✅ All quality checks pass
- ✅ IPA file generated
- ✅ TestFlight submission completed
- ✅ GitHub Release created
- ✅ Artifacts uploaded

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Maintainer:** DIL Tutor Development Team
