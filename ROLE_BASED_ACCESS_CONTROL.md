# Role-Based Access Control Implementation

## Overview

This document explains how role-based access control (RBAC) has been implemented in the DIL Tutor mobile app to ensure that **only students can access the mobile application**. Teachers and administrators are restricted from using the mobile app and are directed to use the web dashboard instead.

## **What Was Implemented**

### 1. **Enhanced Authentication Context** (`context/AuthContext.tsx`)

- **Added Role Checking**: The `AuthContext` now includes role checking functionality
- **User Role State**: Added `userRole` and `isStudent` state variables
- **Role Validation**: Implemented `checkUserRole()` function that fetches user role from the `profiles` table
- **Fallback Mechanism**: Falls back to user metadata if database query fails

#### Key Features:
```typescript
interface AuthContextType {
  userRole: string | null;
  isStudent: boolean;
  checkUserRole: () => Promise<string | null>;
}
```

### 2. **Login Screen Protection** (`app/auth/login.tsx`)

- **Role Validation on Login**: After successful authentication, the login screen checks the user's role
- **Access Restriction**: Non-student users (teachers/admins) are immediately signed out with an informative message
- **User Experience**: Clear explanation that only students can access the mobile app

#### Implementation:
```typescript
if (role && role !== 'student') {
  Alert.alert(
    'Access Restricted',
    `Only students can access this mobile app. Your account has the role: ${role}.\n\nPlease use the web dashboard instead.`,
    [
      {
        text: 'OK',
        onPress: async () => {
          await signOut();
          setEmail('');
          setPassword('');
        }
      }
    ]
  );
}
```

### 3. **Role-Based Access Control Component** (`components/RoleBasedAccess.tsx`)

- **Universal Protection**: A reusable component that wraps the entire app
- **Real-time Role Checking**: Continuously monitors user role changes
- **Access Denied Screen**: Beautiful, informative screen for non-student users
- **Web Dashboard Redirect**: Provides options to go to web dashboard or sign out

#### Features:
- **Loading State**: Shows loading animation while checking authentication
- **Access Denied UI**: Professional-looking access restricted screen
- **Role Information**: Displays the user's current role
- **Action Buttons**: Options to go to web dashboard or sign out

### 4. **App-Level Protection** (`app/_layout.tsx`)

- **Root Level Protection**: The main app layout is wrapped with `RoleBasedAccess`
- **Global Enforcement**: Ensures role checking happens at the highest level
- **Seamless Integration**: Works with existing navigation and authentication flow

### 5. **Tab-Level Protection** (`app/(tabs)/_layout.tsx`)

- **Tab Navigation Protection**: The main tabs are also protected by role-based access
- **Double Security**: Provides additional layer of protection for the main app sections

## **How It Works**

### **Authentication Flow:**

1. **User Attempts Login**: User enters credentials and submits
2. **Authentication**: Supabase authenticates the user
3. **Role Check**: System fetches user role from `profiles` table
4. **Role Validation**: 
   - ✅ **Student**: Access granted, normal app flow
   - ❌ **Teacher/Admin**: Access denied, user signed out with explanation

### **Access Control Flow:**

1. **App Launch**: `RoleBasedAccess` component checks user authentication
2. **Role Verification**: If user exists, role is verified
3. **Access Decision**:
   - **No User**: Allow access (handled by auth flow)
   - **Student**: Allow access to app
   - **Teacher/Admin**: Show access denied screen

### **Database Integration:**

The system checks user roles from the `profiles` table:
```sql
SELECT role FROM profiles WHERE id = :user_id
```

**Fallback**: If database query fails, falls back to user metadata from Supabase auth.

## **User Experience**

### **For Students:**
- ✅ **Normal Access**: Full access to all mobile app features
- ✅ **Seamless Experience**: No interruption to normal app usage

### **For Teachers:**
- ❌ **Access Restricted**: Cannot use mobile app
- ℹ️ **Clear Message**: "Teachers cannot access the mobile app. Please use the web dashboard."
- 🔗 **Web Dashboard Option**: Option to go to web dashboard
- 🚪 **Sign Out Option**: Easy way to sign out and return to login

### **For Administrators:**
- ❌ **Access Restricted**: Cannot use mobile app
- ℹ️ **Clear Message**: "Administrators cannot access the mobile app. Please use the web dashboard."
- 🔗 **Web Dashboard Option**: Option to go to web dashboard
- 🚪 **Sign Out Option**: Easy way to sign out and return to login

## **Security Features**

### **Multi-Layer Protection:**
1. **Login Level**: Immediate rejection of non-student users
2. **App Level**: Global role checking in main layout
3. **Tab Level**: Additional protection for main app sections

### **Real-time Monitoring:**
- Continuously monitors user role changes
- Automatically enforces restrictions if role changes
- Prevents bypassing through direct navigation

### **Graceful Handling:**
- Non-student users are automatically signed out
- Clear, informative error messages
- Professional access denied UI
- Easy navigation to web dashboard

## **Configuration**

### **Environment Variables:**
The system uses the existing configuration from `config/api.ts`:
- **Development**: `https://dil-dev.lms-staging.com`
- **Production**: `https://dil-prod.lms-staging.com`

### **Web Dashboard Links:**
Currently, the web dashboard links are placeholder functions. You can update these in the `RoleBasedAccess` component to point to your actual web dashboard URLs.

## **Testing**

### **Test Scenarios:**

1. **Student Login**: Should work normally
2. **Teacher Login**: Should show access restricted message and sign out
3. **Admin Login**: Should show access restricted message and sign out
4. **Role Change**: If user role changes after login, should enforce new restrictions

### **Test Accounts:**
- Use accounts with different roles to verify access control
- Test both development and production environments
- Verify that non-student users cannot bypass restrictions

## **Maintenance**

### **Adding New Roles:**
To add support for new roles, update the `RoleBasedAccess` component:
```typescript
} else if (userRole === 'new_role') {
  Alert.alert(
    'Access Restricted',
    'New role users cannot access the mobile app...',
    // ... rest of implementation
  );
}
```

### **Updating Web Dashboard URLs:**
Update the web dashboard links in the `RoleBasedAccess` component:
```typescript
onPress: () => {
  // Replace with actual web dashboard URL
  Linking.openURL('https://your-web-dashboard.com');
}
```

## **Benefits**

1. **Security**: Ensures only authorized users (students) can access the mobile app
2. **User Experience**: Clear messaging and professional UI for restricted users
3. **Maintainability**: Centralized role checking logic
4. **Scalability**: Easy to add new roles or modify restrictions
5. **Professional**: Maintains brand image with proper access denied screens

## **Conclusion**

The role-based access control system has been successfully implemented to ensure that only students can access the DIL Tutor mobile app. Teachers and administrators are properly restricted and guided to use the web dashboard instead. The implementation is secure, user-friendly, and maintainable.
