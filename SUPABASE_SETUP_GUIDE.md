# Supabase Setup Guide

## The Problem
Your app is showing "network request failed" during login because it's trying to connect to placeholder Supabase credentials.

## Solution Steps

### 1. Get Your Supabase Credentials

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (or create a new one if you don't have one)
3. **Navigate to Settings > API**
4. **Copy these two values**:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Update Your .env File

Edit the `.env` file in your project root and replace the placeholder values:

```bash
# Replace these with your actual values
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 3. For Production Builds (EAS)

You have two options:

#### Option A: Use EAS Secrets (Recommended)
```bash
# Set secrets for EAS builds
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project-id.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here"
```

#### Option B: Update eas.json
Add the environment variables directly to your `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "NODE_ENV": "production",
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project-id.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key-here"
      }
    }
  }
}
```

### 4. Test the Setup

1. **Restart your development server**:
   ```bash
   npx expo start --clear
   ```

2. **Test the login flow** - the "network request failed" error should be resolved

### 5. Database Schema Requirements

Make sure your Supabase project has the required database schema. Run this SQL in your Supabase SQL Editor:

```sql
-- Create the profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  grade TEXT,
  teacher_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 6. Verify Everything Works

1. **Check the console** - you should see no Supabase error messages
2. **Try logging in** - the network request should succeed
3. **Check your Supabase dashboard** - you should see user data being created

## Troubleshooting

- **Still getting "network request failed"**: Double-check your credentials in the .env file
- **App crashes on startup**: Make sure the .env file exists and has the correct format
- **Login works but no user data**: Check your database schema and RLS policies

## Security Note

Never commit your `.env` file to version control. It should be in your `.gitignore` file.
