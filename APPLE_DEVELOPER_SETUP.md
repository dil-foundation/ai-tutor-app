# Apple Developer Setup for TestFlight Submission

## 🔧 Required Apple Developer Configuration

To fix the TestFlight submission error, you need to configure your Apple Developer account details in the `eas.json` file.

## 📋 Required Information

### 1. App Store Connect App ID
- **What it is:** The unique identifier for your app in App Store Connect
- **How to find:** 
  1. Go to [App Store Connect](https://appstoreconnect.apple.com)
  2. Select your app
  3. Go to **App Information**
  4. Copy the **Apple ID** (this is your `ascAppId`)

### 2. Apple ID
- **What it is:** Your Apple Developer account email
- **Example:** `your-email@example.com`

### 3. Team ID
- **What it is:** Your Apple Developer Team ID
- **How to find:**
  1. Go to [Apple Developer Portal](https://developer.apple.com)
  2. Go to **Account** → **Membership**
  3. Copy the **Team ID**

## 🔧 Configuration Steps

### Step 1: Update eas.json

Replace the placeholder values in `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "1234567890",
        "appleId": "your-email@example.com",
        "ascTeamId": "ABCD123456"
      }
    },
    "preview": {
      "ios": {
        "ascAppId": "1234567890",
        "appleId": "your-email@example.com", 
        "ascTeamId": "ABCD123456"
      }
    }
  }
}
```

### Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `EXPO_TOKEN` | Expo authentication token | `exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `UXCAM_API_KEY` | UXCam analytics API key | `smos6vxe844g3zn-us` |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `EXPO_PUBLIC_API_URL` | Backend API URL | `https://api.dil.lms-staging.com` |

### Step 3: Verify App Store Connect Setup

1. **Create App in App Store Connect:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click **My Apps** → **+** → **New App**
   - Fill in app details:
     - **Name:** DIL Tutor
     - **Bundle ID:** `com.dil.lms`
     - **SKU:** `dil-tutor-ios`
     - **User Access:** Full Access

2. **Configure TestFlight:**
   - Go to your app in App Store Connect
   - Click **TestFlight** tab
   - Add internal testers
   - Configure external testing groups

## 🚀 Testing the Workflow

### Step 1: Run Manual Workflow
1. Go to GitHub Actions tab
2. Click **iOS TestFlight Deploy**
3. Click **Run workflow**
4. Select **preview** channel
5. Click **Run workflow**

### Step 2: Monitor Build Process
- Watch the build progress
- Check for any errors
- Verify TestFlight submission

### Step 3: Check TestFlight
1. Go to App Store Connect
2. Check **TestFlight** tab
3. Verify build appears
4. Test on device

## 🔍 Troubleshooting

### Common Issues

#### 1. "ascAppId not found"
**Solution:** 
- Verify App Store Connect app exists
- Check `ascAppId` in `eas.json`
- Ensure app is in correct state

#### 2. "Apple ID authentication failed"
**Solution:**
- Verify Apple ID is correct
- Check Team ID matches
- Ensure account has proper permissions

#### 3. "Team ID not found"
**Solution:**
- Verify Team ID in Apple Developer Portal
- Check account membership status
- Ensure proper team access

#### 4. "Build not found for submission"
**Solution:**
- Wait for build to complete
- Check build status in EAS
- Verify build profile matches

### Debug Commands

#### Check EAS Configuration
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Check project configuration
eas project:info

# List builds
eas build:list --platform=ios

# Check submit configuration
eas submit:list --platform=ios
```

#### Test Local Submission
```bash
# Test submission locally
eas submit --platform=ios --latest --profile=preview --non-interactive
```

## 📱 Expected Results

### Successful Workflow
- ✅ Build completes successfully
- ✅ IPA file generated
- ✅ TestFlight submission completed
- ✅ GitHub Release created
- ✅ Build appears in App Store Connect

### TestFlight Status
- **Processing:** 10-30 minutes
- **Ready for Testing:** Available to testers
- **External Testing:** Requires Apple review

## 🔒 Security Notes

### Sensitive Information
- **Never commit** Apple ID or Team ID to public repositories
- **Use GitHub secrets** for all sensitive data
- **Rotate credentials** regularly

### Access Control
- **Limit repository access** to trusted team members
- **Use branch protection** rules
- **Require pull request reviews**

## 📞 Support

### Getting Help
1. **Check GitHub Actions logs** for detailed error messages
2. **Verify Apple Developer account** status
3. **Check App Store Connect** app configuration
4. **Test local builds** with EAS CLI

### Contact Information
- **Apple Developer Support:** [Apple Developer Documentation](https://developer.apple.com/support/)
- **Expo Support:** [Expo Documentation](https://docs.expo.dev)
- **EAS Support:** [EAS Documentation](https://docs.expo.dev/build/introduction/)

## ✅ Checklist

Before running the workflow:

- [ ] App created in App Store Connect
- [ ] `ascAppId` configured in `eas.json`
- [ ] Apple ID and Team ID set
- [ ] GitHub secrets configured
- [ ] TestFlight access enabled
- [ ] Build profiles configured
- [ ] Environment variables set

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Maintainer:** DIL Tutor Development Team
