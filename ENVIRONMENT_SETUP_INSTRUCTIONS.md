# Environment Setup Instructions for iOS Build

## 🚨 Critical: Create .env File

The iOS app is crashing because the `.env` file is missing. Follow these steps:

### 1. Create .env File
Create a `.env` file in the root directory (`dil-tutor-app/.env`) with the following content:

```bash
# Environment Variables for DIL Tutor App
UXCAM_API_KEY=your_actual_uxcam_api_key_here
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Get Your Actual Values

#### UXCam API Key:
1. Go to [UXCam Dashboard](https://dashboard.uxcam.com/)
2. Sign in to your account
3. Go to Settings > API Keys
4. Copy your API key
5. Replace `your_actual_uxcam_api_key_here` with your actual key

#### Supabase Configuration:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy:
   - **Project URL** → Use as `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → Use as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 3. Example .env File
```bash
UXCAM_API_KEY=xnayvk2m8m2h8xw-us
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjQ5NjQwMCwiZXhwIjoxOTYyMDcyNDAwfQ.example_signature_here
```

### 4. Verify Setup
After creating the `.env` file:
1. Restart your development server
2. Clear cache: `expo start --clear`
3. Test the app

## 🔧 Additional Fixes Applied

The following fixes have been applied to prevent crashes:

1. **Error Boundary**: Added error boundary to catch and handle crashes gracefully
2. **UXCam Error Handling**: Improved UXCam service to handle missing API keys
3. **Supabase Error Handling**: Better error handling for missing environment variables
4. **Font Loading**: Improved font loading error handling
5. **Import Fixes**: Fixed all `@/` alias imports to relative paths

## 🚀 Next Steps

1. Create the `.env` file with your actual values
2. Test the app locally
3. Build for iOS TestFlight
4. Monitor crash reports in TestFlight

## 📱 Testing Checklist

- [ ] App launches without crashing
- [ ] Authentication works
- [ ] UXCam analytics work (check console logs)
- [ ] Supabase connection works
- [ ] All screens load properly
- [ ] Audio recording works
- [ ] Navigation works smoothly
