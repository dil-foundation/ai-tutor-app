# 🍎 TestFlight Setup Guide for DIL Tutor App

## 🔧 Required Configuration

The iOS TestFlight workflow requires proper configuration in the `eas.json` file. Here's what you need to set up:

## 📋 Step 1: Get Apple Developer Information

### 1. Apple ID
- Your Apple Developer account email
- Example: `developer@yourcompany.com`

### 2. App Store Connect App ID (ascAppId)
- Go to [App Store Connect](https://appstoreconnect.apple.com)
- Select your app: **DIL Tutor**
- Go to **App Information**
- Copy the **App Store Connect App ID** (10-digit number)
- Example: `1234567890`

### 3. Apple Team ID
- Go to [Apple Developer Portal](https://developer.apple.com)
- Go to **Account** → **Membership**
- Copy your **Team ID** (10-character string)
- Example: `ABCD123456`

## 📝 Step 2: Update eas.json

Replace the placeholder values in `eas.json` with your actual information:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-actual-apple-id@example.com",
        "ascAppId": "your-actual-asc-app-id",
        "appleTeamId": "your-actual-team-id"
      }
    },
    "preview": {
      "ios": {
        "appleId": "your-actual-apple-id@example.com",
        "ascAppId": "your-actual-asc-app-id",
        "appleTeamId": "your-actual-team-id"
      }
    }
  }
}
```

## 🔐 Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:

### Required Secrets
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `EXPO_TOKEN` | Expo authentication token | `exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `UXCAM_API_KEY` | UXCam analytics API key | `xnayvk2m8m2h8xw-us` |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `EXPO_PUBLIC_API_URL` | Backend API URL | `https://api.dil.lms-staging.com` |

### Optional Secrets (for enhanced security)
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `APPLE_ID` | Apple Developer account email | `developer@yourcompany.com` |
| `APPLE_ID_PASSWORD` | Apple ID password (if using 2FA, use app-specific password) | `your-app-specific-password` |
| `APPLE_TEAM_ID` | Apple Developer Team ID | `ABCD123456` |

## 🚀 Step 4: Test the Workflow

### Manual Execution
1. Go to GitHub Actions tab
2. Click **iOS TestFlight Deploy**
3. Click **Run workflow**
4. Select release channel: `production` or `preview`
5. Click **Run workflow**

### Automatic Execution
The workflow will automatically run when:
- Code is pushed to `main` or `develop` branches
- Pull requests are created targeting `main`

## 🔍 Troubleshooting

### Common Issues

#### 1. "Set ascAppId in the submit profile"
**Error:** `Set ascAppId in the submit profile (eas.json) or re-run this command in interactive mode.`

**Solution:**
- Verify `ascAppId` is correctly set in `eas.json`
- Ensure the App Store Connect App ID is correct
- Check that the app exists in App Store Connect

#### 2. "Authentication failed"
**Error:** `Authentication failed for Apple ID`

**Solution:**
- Verify Apple ID credentials
- Use app-specific password if 2FA is enabled
- Check Apple Developer account status

#### 3. "Team ID not found"
**Error:** `Team ID not found`

**Solution:**
- Verify Apple Team ID is correct
- Ensure you have proper permissions
- Check Apple Developer account membership

#### 4. "Build failed"
**Error:** `EAS build failed`

**Solution:**
- Check EAS build logs
- Verify environment variables
- Ensure Expo project is properly configured

### Debug Steps

1. **Check EAS Configuration**
   ```bash
   # Verify EAS configuration
   eas config
   ```

2. **Test Local Submission**
   ```bash
   # Test submission locally
   eas submit -p ios --latest --profile production
   ```

3. **Check Apple Developer Account**
   - Verify app exists in App Store Connect
   - Check app status and metadata
   - Ensure proper permissions

## 📱 TestFlight Distribution

### After Successful Submission

1. **Check App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to your app
   - Check **TestFlight** tab
   - Wait for processing (10-30 minutes)

2. **Configure Test Groups**
   - Create internal test group
   - Add external test groups
   - Set up test notifications

3. **Distribute to Testers**
   - Add testers to groups
   - Send invitation emails
   - Monitor feedback

## 🔄 Workflow Features

### What the Workflow Does

1. **Environment Setup**
   - Checks for required secrets
   - Sets up Node.js and EAS CLI
   - Configures environment variables

2. **Build Process**
   - Builds iOS app with EAS
   - Includes UXCam integration
   - Generates IPA file

3. **TestFlight Submission**
   - Automatically submits to TestFlight
   - Uses configured Apple Developer credentials
   - Handles submission errors

4. **Notifications**
   - Reports build status
   - Provides success/failure messages
   - Logs detailed information

## 📊 Expected Results

### Successful Workflow
- ✅ Build completes successfully
- ✅ IPA file generated
- ✅ Submitted to TestFlight
- ✅ Available in App Store Connect

### Build Times
- **iOS Build:** ~12-18 minutes
- **TestFlight Submission:** ~2-5 minutes
- **Total Time:** ~15-25 minutes

## 🛡️ Security Best Practices

### Credential Management
- Store all sensitive data in GitHub secrets
- Use app-specific passwords for Apple ID
- Rotate credentials regularly

### Access Control
- Limit repository access
- Use branch protection rules
- Require pull request reviews

## 📞 Support

### Getting Help
1. **Check GitHub Actions logs** for detailed error messages
2. **Review this documentation** for common solutions
3. **Verify Apple Developer account** configuration
4. **Test local builds** with EAS CLI

### Contact Information
- **GitHub Issues:** Create an issue in the repository
- **Expo Support:** [Expo Documentation](https://docs.expo.dev)
- **Apple Developer Support:** [Apple Developer Support](https://developer.apple.com/support)

## ✅ Success Checklist

Before running the workflow, ensure:

- [ ] Apple Developer account is active
- [ ] App exists in App Store Connect
- [ ] `eas.json` has correct Apple credentials
- [ ] All GitHub secrets are configured
- [ ] EAS project is properly set up
- [ ] UXCam integration is working
- [ ] Supabase connection is active

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Maintainer:** DIL Tutor Development Team
