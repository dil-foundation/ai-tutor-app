# Authentication URL Implementation

## Overview

This document explains how the authentication URLs have been updated to use the new configuration system provided by your teammate. The implementation separates API endpoints from frontend URLs to ensure proper authentication flows.

## New URLs

Your teammate provided the following URLs:
- **Development**: `https://dil-dev.lms-staging.com/`
- **Production**: `https://dil-prod.lms-staging.com/`

## Implementation Details

### 1. Configuration Structure (`config/api.ts`)

The configuration now properly separates API and frontend URLs:

```typescript
let BASE_API_URL: string;
let FRONTEND_URL: string;

if (__DEV__) {
  // Development
  BASE_API_URL = 'http://192.168.1.3:8000';  // Your local backend
  FRONTEND_URL = 'https://dil-dev.lms-staging.com';
} else {
  // Production
  BASE_API_URL = 'https://api-prod.dil.lms-staging.com';  // Production backend
  FRONTEND_URL = 'https://dil-prod.lms-staging.com';
}

export { FRONTEND_URL };
export default BASE_API_URL;
```

### 2. Authentication Context (`context/AuthContext.tsx`)

The signup email redirect now uses the dynamic frontend URL:

```typescript
import { FRONTEND_URL } from '../config/api';

const signUp = async (signUpData: SignUpData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: `${FRONTEND_URL}/dashboard`,  // Dynamic URL
        data: {
          role: 'student',
          first_name: signUpData.firstName,
          last_name: signUpData.lastName,
          grade: signUpData.grade
        }
      }
    });
    // ... rest of the function
  }
};
```

### 3. Login Screen (`app/auth/login.tsx`)

The forgot password functionality now uses the dynamic frontend URL:

```typescript
import { FRONTEND_URL } from '../../config/api';

const handleForgotPassword = async () => {
  const forgotPasswordUrl = `${FRONTEND_URL}/forgot-password?role=student`;
  
  try {
    const supported = await Linking.canOpenURL(forgotPasswordUrl);
    if (supported) {
      await Linking.openURL(forgotPasswordUrl);
    } else {
      Alert.alert('Error', 'Cannot open forgot password page. Please try again.');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to open forgot password page. Please try again.');
  }
};
```

## Authentication Flow URLs

### Sign Up Flow
1. **Email Verification Redirect**: `${FRONTEND_URL}/dashboard`
   - Development: `https://dil-dev.lms-staging.com/dashboard`
   - Production: `https://dil-prod.lms-staging.com/dashboard`

### Forgot Password Flow
1. **Password Reset Page**: `${FRONTEND_URL}/forgot-password?role=student`
   - Development: `https://dil-dev.lms-staging.com/forgot-password?role=student`
   - Production: `https://dil-prod.lms-staging.com/forgot-password?role=student`

## Benefits of This Implementation

1. **Environment-Aware**: Automatically uses the correct URLs based on development/production mode
2. **Centralized Configuration**: All URLs are managed in one place (`config/api.ts`)
3. **Easy Updates**: Change URLs in one file to update all authentication flows
4. **Type Safety**: TypeScript ensures proper URL usage
5. **Separation of Concerns**: API endpoints and frontend URLs are clearly separated

## How It Works

1. **Development Mode** (`__DEV__ = true`):
   - Frontend URLs point to `https://dil-dev.lms-staging.com`
   - API URLs point to your local backend `http://192.168.1.3:8000`

2. **Production Mode** (`__DEV__ = false`):
   - Frontend URLs point to `https://dil-prod.lms-staging.com`
   - API URLs point to `https://api-prod.dil.lms-staging.com`

## Testing

To test the implementation:

1. **Development Mode**:
   - Sign up with a test email
   - Check that verification email redirects to `https://dil-dev.lms-staging.com/dashboard`
   - Test forgot password redirects to `https://dil-dev.lms-staging.com/forgot-password?role=student`

2. **Production Mode**:
   - Build the app for production
   - Verify URLs point to `https://dil-prod.lms-staging.com`

## Maintenance

When you need to update URLs in the future:

1. **Frontend URLs**: Update the `FRONTEND_URL` variables in `config/api.ts`
2. **API URLs**: Update the `BASE_API_URL` variables in `config/api.ts`
3. **Authentication URLs**: Will automatically update since they use `FRONTEND_URL`

## Files Modified

- `dil-tutor-app/config/api.ts` - Added FRONTEND_URL configuration
- `dil-tutor-app/context/AuthContext.tsx` - Updated signup redirect URL
- `dil-tutor-app/app/auth/login.tsx` - Updated forgot password URL
- `dil-tutor-app/AUTHENTICATION_URL_IMPLEMENTATION.md` - This documentation

## Summary

The authentication URLs have been successfully implemented using a centralized configuration system. This ensures that:

- ✅ Sign up verification emails redirect to the correct frontend URL
- ✅ Forgot password functionality opens the correct frontend page
- ✅ URLs automatically adapt to development/production environments
- ✅ Configuration is centralized and easy to maintain
- ✅ All authentication flows use the new URLs provided by your teammate
