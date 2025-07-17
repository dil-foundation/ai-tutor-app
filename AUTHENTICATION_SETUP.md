# Authentication Setup Guide

This guide will help you set up Supabase authentication for the DIL Tutor app.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Node.js and npm/yarn installed
3. Expo CLI installed

## Installation

1. Install the required dependencies:
```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### How to get your Supabase credentials:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Paste them in your `.env` file

## Supabase Configuration

### 1. Enable Email Authentication

1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Enable "Email" provider
4. Configure email templates if needed

### 2. Set up Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the "Confirm signup" and "Reset password" templates
3. Update the site URL to match your app's domain

### 3. Configure Redirect URLs

1. Go to Authentication > URL Configuration
2. Add your app's redirect URLs:
   - For development: `exp://localhost:8081`
   - For production: `your-app-scheme://`

## Features Implemented

### ✅ Login Screen
- Email and password authentication
- Form validation
- Error handling with alerts
- Loading states
- Password visibility toggle
- "Forgot Password" functionality
- Navigation to signup

### ✅ Signup Screen
- User registration with email/password
- Form validation (name, email, password confirmation)
- Password strength requirements
- Email verification flow
- Navigation to login

### ✅ Authentication Context
- Global auth state management
- Automatic session persistence
- Auth state change listeners
- Sign out functionality

### ✅ Protected Routes
- Automatic redirection based on auth state
- Loading screens during auth checks
- Route protection for authenticated users

### ✅ Profile Integration
- Sign out button in profile screen
- User information display
- Confirmation dialogs for sign out

## Usage

### Login Flow
1. User opens app
2. If not authenticated, redirected to login screen
3. User enters email and password
4. On successful login, redirected to main app (learn tab)
5. On failure, error message displayed

### Signup Flow
1. User clicks "Sign Up" on login screen
2. User fills out registration form
3. On successful signup, email verification sent
4. User redirected to login screen
5. User can then login with new credentials

### Sign Out Flow
1. User goes to Profile tab
2. Clicks "Sign Out" button
3. Confirmation dialog appears
4. On confirmation, user signed out
5. User redirected to login screen

## Error Handling

The app handles various authentication errors:
- Invalid email/password
- Network errors
- Email verification required
- Password reset functionality
- Form validation errors

## Security Features

- Password visibility toggle
- Form validation
- Secure token storage
- Automatic session management
- Protected routes

## Customization

### Styling
The authentication screens use the app's design system:
- Primary colors: `#58D68D` to `#45B7A8`
- Consistent with existing UI components
- Smooth animations and transitions

### Text Customization
Update the text in the login and signup screens to match your branding:
- Welcome messages
- Form labels
- Button text
- Error messages

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env` file is in the root directory
   - Restart the development server
   - Check that variable names start with `EXPO_PUBLIC_`

2. **Authentication not working**
   - Verify Supabase URL and anon key
   - Check Supabase project settings
   - Ensure email provider is enabled

3. **Navigation issues**
   - Check that auth context is properly wrapped
   - Verify route configurations
   - Ensure proper imports

### Debug Mode

Enable debug logging by adding this to your Supabase client:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'dil-tutor-app'
    }
  }
});
```

## Next Steps

1. Test the authentication flow
2. Customize the UI to match your brand
3. Add additional authentication providers (Google, Apple, etc.)
4. Implement user profile management
5. Add password reset functionality
6. Set up email verification handling 