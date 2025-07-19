# Environment Setup for Signup Authentication

## Required Environment Variables

To enable the signup authentication functionality, you need to set up the following environment variables in your `.env` file:

### Supabase Configuration

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Example Format:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How to Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (or create a new one)
3. **Navigate to Settings > API**
4. **Copy the following values**:
   - **Project URL**: Use this as your `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key**: Use this as your `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Database Schema Requirements

Make sure your Supabase `profiles` table has the following columns:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  grade TEXT,
  teacher_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL
);
```

## Security Policies

Ensure you have the appropriate Row Level Security (RLS) policies set up for the `profiles` table. The signup process will store user metadata in the `auth.users` table, and you may want to create a trigger to automatically insert/update the `profiles` table.

## Email Configuration

The signup process sends verification emails. Make sure your Supabase project has email templates configured:

1. **Go to Authentication > Email Templates**
2. **Configure the "Confirm signup" template**
3. **Set up your email provider** (if not using Supabase's default)

## Testing the Setup

1. Create a `.env` file in your project root with the required variables
2. Restart your development server
3. Try the signup flow with a test email
4. Check that the verification email is received
5. Verify that user data is properly stored in Supabase 