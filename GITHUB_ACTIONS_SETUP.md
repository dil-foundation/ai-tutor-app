# GitHub Actions Setup for Supabase Integration

## Overview
Your GitHub Actions workflows have been updated to include Supabase environment variables. You need to add these as secrets in your GitHub repository.

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. EXPO_PUBLIC_SUPABASE_URL
- **Value**: Your Supabase project URL
- **Format**: `https://your-project-id.supabase.co`
- **Example**: `https://abcdefghijklmnop.supabase.co`

### 2. EXPO_PUBLIC_SUPABASE_ANON_KEY
- **Value**: Your Supabase anon public key
- **Format**: JWT token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.example_key_here`

## How to Add GitHub Secrets

### Step 1: Go to Your Repository Settings
1. Navigate to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click on **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets
1. Click **New repository secret**
2. Add each secret:

#### For EXPO_PUBLIC_SUPABASE_URL:
- **Name**: `EXPO_PUBLIC_SUPABASE_URL`
- **Secret**: `https://your-actual-project-id.supabase.co`

#### For EXPO_PUBLIC_SUPABASE_ANON_KEY:
- **Name**: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Secret**: `your-actual-anon-key-here`

### Step 3: Verify Secrets
After adding both secrets, you should see them listed in your repository secrets.

## How to Get Your Supabase Credentials

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Sign in to your account
3. Select your project (or create a new one)

### Step 2: Get API Credentials
1. Click on **Settings** in the left sidebar
2. Click on **API**
3. Copy the following values:
   - **Project URL** → Use for `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Updated Workflows

The following workflows have been updated to use Supabase credentials:

### ✅ iOS TestFlight Deploy
- **File**: `.github/workflows/ios-testflight-deploy.yml`
- **Updated**: Build step now includes Supabase environment variables

### ✅ iOS App Store Release
- **File**: `.github/workflows/ios-app-store-release.yml`
- **Updated**: Build step now includes Supabase environment variables

### ✅ Android Build and Deploy
- **File**: `.github/workflows/android-build-deploy.yml`
- **Updated**: Build step now includes Supabase environment variables

## Testing the Setup

### 1. Test Local Development
```bash
# Make sure your .env file has the correct credentials
npx expo start --clear
```

### 2. Test GitHub Actions
1. Go to your repository's **Actions** tab
2. Run the **iOS TestFlight Deploy** workflow manually
3. Check the build logs for any Supabase-related errors

### 3. Verify in TestFlight
1. Install the app from TestFlight
2. Try logging in
3. The "network request failed" error should be resolved

## Troubleshooting

### ❌ Build Still Fails with "Missing Supabase environment variables"
- **Cause**: GitHub secrets not properly set
- **Solution**: Double-check that both secrets are added correctly

### ❌ "Network request failed" in TestFlight
- **Cause**: Wrong Supabase credentials
- **Solution**: Verify your Supabase project URL and anon key are correct

### ❌ App crashes on startup
- **Cause**: Invalid Supabase configuration
- **Solution**: Check that your Supabase project is active and accessible

## Security Notes

- ✅ **Never commit** your `.env` file to version control
- ✅ **Use GitHub Secrets** for sensitive data in CI/CD
- ✅ **Rotate keys** regularly for security
- ✅ **Use different projects** for development and production

## Next Steps

1. **Add the GitHub secrets** as described above
2. **Test the workflow** by running it manually
3. **Deploy to TestFlight** and verify login works
4. **Monitor the build logs** for any issues

Your app should now work properly in TestFlight with full Supabase integration! 🚀
