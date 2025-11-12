# GitHub Secrets Configuration Guide

## 🔐 Required Secrets Setup

This guide explains how to configure all required GitHub secrets for the DIL Tutor mobile app workflows.

## 📋 Secrets Checklist

- [ ] `EXPO_TOKEN` - Expo authentication token
- [ ] `UXCAM_API_KEY` - UXCam analytics API key
- [ ] `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `EXPO_PUBLIC_API_URL` - Backend API URL

## 🚀 Step-by-Step Setup

### 1. Access GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables**
4. Click **Actions**
5. Click **New repository secret**

### 2. Configure Each Secret

#### EXPO_TOKEN
**Purpose:** Authenticates with Expo services for building

**How to get:**
1. Go to [Expo Dashboard](https://expo.dev)
2. Click your profile → **Access Tokens**
3. Click **Create Token**
4. Name: `GitHub Actions`
5. Copy the token

**GitHub Secret:**
- Name: `EXPO_TOKEN`
- Value: `exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### UXCAM_API_KEY
**Purpose:** Enables UXCam analytics integration

**How to get:**
1. Go to [UXCam Dashboard](https://dashboard.uxcam.com)
2. Navigate to **Settings** → **API Keys**
3. Copy your API key

**GitHub Secret:**
- Name: `UXCAM_API_KEY`
- Value: `smos6vxe844g3zn-us`

#### EXPO_PUBLIC_SUPABASE_URL
**Purpose:** Supabase project URL for database access

**How to get:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL**

**GitHub Secret:**
- Name: `EXPO_PUBLIC_SUPABASE_URL`
- Value: `https://your-project-id.supabase.co`

#### EXPO_PUBLIC_SUPABASE_ANON_KEY
**Purpose:** Supabase anonymous key for client access

**How to get:**
1. In Supabase Dashboard → **Settings** → **API**
2. Copy the **anon public** key

**GitHub Secret:**
- Name: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTYzNTUyMDB9.your-signature`

#### EXPO_PUBLIC_API_URL
**Purpose:** Backend API URL for app communication

**How to get:**
1. Check your backend deployment URL
2. Use staging/production URL as needed

**GitHub Secret:**
- Name: `EXPO_PUBLIC_API_URL`
- Value: `https://api.dil.lms-staging.com`

## 🔍 Verification Steps

### 1. Check All Secrets Are Set

```bash
# Go to GitHub repository
# Settings → Secrets and variables → Actions
# Verify all 5 secrets are listed:
# ✅ EXPO_TOKEN
# ✅ UXCAM_API_KEY
# ✅ EXPO_PUBLIC_SUPABASE_URL
# ✅ EXPO_PUBLIC_SUPABASE_ANON_KEY
# ✅ EXPO_PUBLIC_API_URL
```

### 2. Test Workflow Execution

1. Go to **Actions** tab
2. Click **Android APK Build and Deploy**
3. Click **Run workflow**
4. Select **preview** profile
5. Click **Run workflow**
6. Monitor the build process

### 3. Verify Environment Variables

The workflow will automatically:
- ✅ Push environment variables to EAS
- ✅ Verify variables are set correctly
- ✅ Use them during the build process

## 🛠️ Troubleshooting

### Common Issues

#### 1. Invalid EXPO_TOKEN
**Error:** `Authentication failed`
**Solution:**
- Verify token is correct
- Check token hasn't expired
- Ensure token has proper permissions

#### 2. Missing UXCAM_API_KEY
**Error:** `UXCam SDK not found`
**Solution:**
- Verify API key is correct
- Check UXCam dashboard for active key
- Ensure key has proper permissions

#### 3. Invalid Supabase Credentials
**Error:** `Supabase connection failed`
**Solution:**
- Verify URL format: `https://project-id.supabase.co`
- Check anonymous key is correct
- Ensure project is active

#### 4. API URL Issues
**Error:** `API connection failed`
**Solution:**
- Verify API URL is accessible
- Check if URL requires authentication
- Ensure API is running

### Debug Commands

#### Test Expo Authentication
```bash
# Install EAS CLI
npm install -g eas-cli

# Login with token
eas login --non-interactive
# Enter your EXPO_TOKEN when prompted
```

#### Test Supabase Connection
```bash
# Test Supabase URL
curl -I https://your-project-id.supabase.co

# Test API endpoint
curl -I https://api.dil.lms-staging.com/health
```

#### Test UXCam Integration
```bash
# Check UXCam API key
curl -H "Authorization: Bearer smos6vxe844g3zn-us" \
     https://api.uxcam.com/v1/apps
```

## 🔒 Security Best Practices

### 1. Secret Management
- ✅ Never commit secrets to code
- ✅ Use GitHub secrets for sensitive data
- ✅ Rotate secrets regularly
- ✅ Use least privilege principle

### 2. Access Control
- ✅ Limit repository access
- ✅ Use branch protection rules
- ✅ Require pull request reviews
- ✅ Enable security alerts

### 3. Monitoring
- ✅ Monitor workflow executions
- ✅ Check for failed builds
- ✅ Review access logs
- ✅ Set up notifications

## 📊 Secret Status Dashboard

Create a simple dashboard to monitor secret status:

```markdown
## 🔐 Secrets Status

| Secret | Status | Last Updated | Expires |
|--------|--------|--------------|---------|
| EXPO_TOKEN | ✅ Active | 2024-01-15 | 2024-04-15 |
| UXCAM_API_KEY | ✅ Active | 2024-01-15 | Never |
| EXPO_PUBLIC_SUPABASE_URL | ✅ Active | 2024-01-15 | Never |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | ✅ Active | 2024-01-15 | Never |
| EXPO_PUBLIC_API_URL | ✅ Active | 2024-01-15 | Never |
```

## 🔄 Secret Rotation Schedule

### Recommended Rotation
- **EXPO_TOKEN:** Every 90 days
- **UXCAM_API_KEY:** Every 180 days
- **Supabase Keys:** Every 180 days
- **API URLs:** As needed

### Rotation Process
1. Generate new secret
2. Update GitHub secret
3. Test workflow execution
4. Verify build success
5. Remove old secret

## 📞 Support

### Getting Help
1. **Check GitHub Actions logs** for detailed error messages
2. **Review this documentation** for common solutions
3. **Verify all secrets** are properly configured
4. **Test individual components** separately

### Contact Information
- **GitHub Issues:** Create an issue in the repository
- **Expo Support:** [Expo Documentation](https://docs.expo.dev)
- **UXCam Support:** [UXCam Support](https://help.uxcam.com)
- **Supabase Support:** [Supabase Documentation](https://supabase.com/docs)

## ✅ Success Checklist

Before running workflows, ensure:

- [ ] All 5 secrets are configured
- [ ] Secrets have correct values
- [ ] Expo project is properly set up
- [ ] UXCam account is active
- [ ] Supabase project is running
- [ ] API endpoints are accessible
- [ ] GitHub Actions are enabled
- [ ] Repository has proper permissions

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Maintainer:** DIL Tutor Development Team
