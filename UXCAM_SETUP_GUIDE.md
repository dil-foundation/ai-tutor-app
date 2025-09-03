# UXCam Analytics Integration Guide

## Overview
This guide provides step-by-step instructions for implementing UXCam Analytics in your React Native mobile app for comprehensive user experience tracking and analytics.

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Integration](#integration)
4. [Testing](#testing)
5. [Dashboard Setup](#dashboard-setup)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Installation

### Step 1: Install UXCam Package
```bash
cd dil-tutor-app
npm install react-native-ux-cam
```

### Step 2: Link Native Dependencies
```bash
npx expo install react-native-ux-cam
```

### Step 3: Rebuild the App
```bash
npx expo run:android
```

## Configuration

### Step 1: Get UXCam App Key
1. Sign up at [UXCam Dashboard](https://app.uxcam.com/)
2. Create a new project for your app
3. Copy the App Key from the project settings

### Step 2: Update Configuration
Edit `config/uxcam.ts` and replace `YOUR_UXCAM_APP_KEY_HERE` with your actual App Key:

```typescript
export const UXCAM_CONFIG = {
  APP_KEY: 'your-actual-uxcam-app-key-here',
  // ... other settings
};
```

### Step 3: Android Permissions
The Android manifest has been updated with required permissions:
- `ACCESS_NETWORK_STATE`
- `ACCESS_WIFI_STATE`

## Integration

### Step 1: Automatic Integration
UXCam is automatically initialized in `app/_layout.tsx` using the `useUXCam` hook.

### Step 2: Screen Tracking
Use the `UXCamWrapper` component to automatically track screen views:

```typescript
import { UXCamWrapper } from '../components/UXCamWrapper';

export default function MyScreen() {
  return (
    <UXCamWrapper 
      screenName="MyScreen"
      additionalProperties={{
        screen_type: 'feature_screen',
        user_segment: 'premium',
      }}
    >
      {/* Your screen content */}
    </UXCamWrapper>
  );
}
```

### Step 3: Event Tracking
Use the `useUXCam` hook to track custom events:

```typescript
import { useUXCam } from '../hooks/useUXCam';

export default function MyComponent() {
  const { trackEvent, trackUserInteraction } = useUXCam();

  const handleButtonPress = () => {
    trackUserInteraction('button_press', {
      button_name: 'start_lesson',
      screen: 'LearnScreen',
    });
  };

  const handleLessonComplete = () => {
    trackEvent('lesson_completed', {
      lesson_id: 'lesson_123',
      duration: 300,
      score: 85,
    });
  };

  return (
    // Your component JSX
  );
}
```

### Step 4: Privacy Controls
Mark sensitive screens to exclude from recording:

```typescript
import { useUXCam } from '../hooks/useUXCam';

export default function LoginScreen() {
  const { markSensitive, unmarkSensitive } = useUXCam();

  useEffect(() => {
    markSensitive(); // Hide sensitive content
    return () => unmarkSensitive(); // Unhide when leaving
  }, []);

  return (
    // Login form
  );
}
```

## Testing

### Step 1: Local Testing
1. Run the app in development mode:
```bash
npx expo start
```

2. Open the app and perform various actions:
   - Navigate between screens
   - Interact with buttons
   - Complete learning activities
   - Trigger audio recordings

3. Check console logs for UXCam events:
```
UXCam initialized successfully
UXCam event tracked: screen_view { screen_name: 'LearnScreen' }
UXCam event tracked: user_interaction { interaction_type: 'button_press' }
```

### Step 2: Session Recording Test
1. Perform a complete user journey
2. Check UXCam dashboard for session recordings
3. Verify screen names and events are captured

### Step 3: Privacy Testing
1. Test sensitive screen masking
2. Verify personal data is not recorded
3. Check opt-in/opt-out functionality

## Dashboard Setup

### Step 1: Access UXCam Dashboard
1. Go to [UXCam Dashboard](https://app.uxcam.com/)
2. Log in to your account
3. Select your project

### Step 2: View Session Recordings
1. Navigate to "Recordings" tab
2. Find your test sessions
3. Play recordings to verify:
   - Screen navigation
   - User interactions
   - Event tracking
   - Privacy masking

### Step 3: Analyze Events
1. Go to "Events" tab
2. View custom events:
   - `screen_view`
   - `user_interaction`
   - `learning_progress`
   - `audio_interaction`
   - `app_error`

### Step 4: Create Funnels
1. Navigate to "Funnels" tab
2. Create conversion funnels:
   - User registration flow
   - Lesson completion flow
   - Feature adoption flow

### Step 5: Set Up Heatmaps
1. Go to "Heatmaps" tab
2. Create heatmaps for key screens:
   - Learn screen
   - Progress screen
   - Profile screen

## Best Practices

### 1. Privacy Compliance
- Always mask sensitive screens (login, payment, personal data)
- Implement opt-in/opt-out mechanisms
- Follow GDPR and privacy regulations

### 2. Event Naming
- Use consistent naming conventions
- Include relevant properties
- Avoid personal information in event names

### 3. Performance
- Don't track too many events
- Use batch processing when possible
- Monitor app performance impact

### 4. User Experience
- Inform users about analytics collection
- Provide clear privacy controls
- Respect user preferences

## Testing Checklist

### Pre-Launch Testing
- [ ] UXCam initializes without errors
- [ ] Screen views are tracked correctly
- [ ] Custom events are logged
- [ ] Sensitive screens are masked
- [ ] Session recordings appear in dashboard
- [ ] No personal data is exposed
- [ ] App performance is not impacted

### User Journey Testing
- [ ] Complete registration flow
- [ ] Navigate through all main screens
- [ ] Complete a learning lesson
- [ ] Use audio features
- [ ] Check progress tracking
- [ ] Test error scenarios

### Privacy Testing
- [ ] Login screen is masked
- [ ] Personal data is not recorded
- [ ] Opt-out functionality works
- [ ] Sensitive information is protected

## Troubleshooting

### Common Issues

#### 1. UXCam Not Initializing
```bash
# Check if package is installed
npm list react-native-ux-cam

# Reinstall if needed
npm install react-native-ux-cam
```

#### 2. No Session Recordings
- Verify App Key is correct
- Check network connectivity
- Ensure app has internet permission
- Check console for error messages

#### 3. Events Not Appearing
- Verify event names are correct
- Check console logs for errors
- Ensure UXCam is initialized before tracking

#### 4. Performance Issues
- Reduce frequency of event tracking
- Use batch processing
- Monitor memory usage

### Debug Mode
Enable debug logging in `config/uxcam.ts`:

```typescript
// Add to UXCamService.initialize()
UXCam.setDebugLogsEnabled(true);
```

### Support
- UXCam Documentation: https://help.uxcam.com/
- React Native SDK: https://help.uxcam.com/hc/en-us/articles/360032162871-React-Native-SDK
- Community Forum: https://community.uxcam.com/

## Next Steps

1. **Customize Events**: Add more specific events for your app's features
2. **Create Dashboards**: Set up custom dashboards for key metrics
3. **A/B Testing**: Use UXCam data to inform A/B testing decisions
4. **User Research**: Use session recordings for user research
5. **Optimization**: Use insights to optimize user experience

## Security Considerations

1. **Data Encryption**: All data is encrypted in transit
2. **Access Control**: Limit dashboard access to authorized personnel
3. **Data Retention**: Configure appropriate data retention policies
4. **Compliance**: Ensure compliance with relevant privacy laws

## Performance Monitoring

Monitor these metrics after implementation:
- App startup time
- Memory usage
- Network requests
- Battery consumption
- Crash rates

## Conclusion

UXCam integration provides valuable insights into user behavior and helps optimize the learning experience. Follow this guide to ensure proper implementation and testing before production deployment.
