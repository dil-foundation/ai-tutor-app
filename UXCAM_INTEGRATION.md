# UXCam Integration Documentation

## Overview

This document provides comprehensive documentation for the UXCam integration implemented in the DIL Tutor mobile app. The integration is designed to provide session recording and user behavior analytics while maintaining user privacy and data security.

## Architecture

The UXCam integration follows a professional, scalable architecture with the following components:

### 1. Configuration (`config/uxcam.ts`)
- Environment-based configuration
- Privacy settings
- Recording settings
- Analytics configuration

### 2. Service Layer (`services/UXCamService.ts`)
- Singleton service class
- Session management
- User property management
- Event tracking
- Privacy controls

### 3. React Hook (`hooks/useUXCam.ts`)
- React hook for UXCam functionality
- Error handling
- State management

### 4. Context Provider (`context/UXCamContext.tsx`)
- Global state management
- Provider component
- Context hooks

### 5. Session Manager (`components/UXCamSessionManager.tsx`)
- Automatic session management
- Authentication integration
- Navigation tracking

### 6. Event Utilities (`utils/uxcamEvents.ts`)
- Predefined event tracking functions
- Common app event patterns

## Setup Instructions

### 1. Install Dependencies

```bash
npm install react-native-uxcam
```

### 2. Configure API Key

Update the API key in `config/uxcam.ts`:

```typescript
export const UXCamConfig = {
  API_KEY: 'YOUR_ACTUAL_UXCAM_API_KEY_HERE',
  // ... rest of configuration
};
```

### 3. Environment Configuration

The configuration supports three environments:

- **Development**: Enhanced logging, no crash handling
- **Staging**: Balanced settings for testing
- **Production**: Optimized for production use

### 4. Platform Permissions

The integration automatically configures necessary permissions:

#### iOS (`app.json`)
```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "This app uses the camera for UXCam session recording to improve user experience.",
      "NSPhotoLibraryUsageDescription": "This app may access photo library for UXCam session recording."
    }
  }
}
```

#### Android (`app.json`)
```json
{
  "android": {
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_EXTERNAL_STORAGE"
    ]
  }
}
```

## Usage

### Basic Usage

The UXCam integration is automatically initialized when the app starts. The `UXCamProvider` wraps the entire app and manages global state.

### Using the Hook

```typescript
import { useUXCamContext } from '../context/UXCamContext';

const MyComponent = () => {
  const {
    trackEvent,
    setUserProperties,
    isRecording,
    error
  } = useUXCamContext();

  const handleButtonClick = async () => {
    await trackEvent('button_click', {
      buttonName: 'start_lesson',
      screenName: 'home'
    });
  };

  return (
    <View>
      {error && <Text>Error: {error}</Text>}
      <Text>Recording: {isRecording ? 'Yes' : 'No'}</Text>
      <Button onPress={handleButtonClick} title="Start Lesson" />
    </View>
  );
};
```

### Using Event Utilities

```typescript
import { useUXCamEvents } from '../utils/uxcamEvents';

const LessonComponent = () => {
  const {
    trackLessonStarted,
    trackLessonCompleted,
    trackExerciseStarted
  } = useUXCamEvents();

  const startLesson = async () => {
    await trackLessonStarted('lesson_123', 'grammar', {
      difficulty: 'intermediate',
      language: 'en'
    });
  };

  const completeLesson = async (score: number) => {
    await trackLessonCompleted('lesson_123', 'grammar', score, {
      timeSpent: 300 // seconds
    });
  };

  return (
    <View>
      <Button onPress={startLesson} title="Start Lesson" />
      <Button onPress={() => completeLesson(85)} title="Complete Lesson" />
    </View>
  );
};
```

## Privacy Features

### 1. Sensitive Screen Exclusion

Automatically excludes sensitive screens from recording:

```typescript
const sensitiveScreens = [
  'auth/login',
  'auth/signup',
  'auth/password-reset',
  'profile',
  'settings',
  'payment',
  'billing',
];
```

### 2. Sensitive Data Filtering

Automatically filters out sensitive user properties:

```typescript
const excludedProperties = [
  'password',
  'token',
  'apiKey',
  'secret',
  'creditCard',
  'ssn',
  'phoneNumber',
  'email',
];
```

### 3. Privacy Controls

Users can control recording settings:

```typescript
const { optIn, optOut, setPrivacyMode } = useUXCamContext();

// Opt out of recording
await optOut();

// Opt into recording
await optIn();

// Toggle privacy mode
setPrivacyMode(true);
```

## Event Tracking

### Predefined Events

The integration includes predefined events for common app interactions:

#### Learning Events
- `lesson_started`
- `lesson_completed`
- `exercise_started`
- `exercise_completed`
- `quiz_started`
- `quiz_completed`

#### Audio/Speech Events
- `audio_recording_started`
- `audio_recording_completed`
- `speech_recognition_started`
- `speech_recognition_completed`

#### Progress Events
- `level_up`
- `streak_updated`
- `progress_milestone`

#### User Interaction Events
- `button_click`
- `screen_view`
- `feature_used`

#### Error Events
- `error_occurred`
- `api_error`

#### Performance Events
- `performance_metric`
- `load_time`

#### Subscription/Payment Events
- `subscription_started`
- `subscription_cancelled`
- `payment_initiated`
- `payment_completed`

### Custom Events

Track custom events with properties:

```typescript
const { trackEvent } = useUXCamContext();

await trackEvent('custom_event', {
  property1: 'value1',
  property2: 'value2',
  timestamp: Date.now()
});
```

## Session Management

### Automatic Session Management

The `UXCamSessionManager` automatically:

1. Starts sessions when users authenticate
2. Stops sessions when users log out
3. Tracks navigation between screens
4. Manages user identity and properties

### Manual Session Control

```typescript
const {
  startSession,
  stopSession,
  pauseRecording,
  resumeRecording
} = useUXCamContext();

// Start a new session
await startSession({
  userId: 'user123',
  userRole: 'student'
});

// Pause recording
await pauseRecording();

// Resume recording
await resumeRecording();

// Stop session
await stopSession();
```

## Error Handling

The integration includes comprehensive error handling:

```typescript
const { error, clearError } = useUXCamContext();

if (error) {
  console.error('UXCam Error:', error);
  // Handle error appropriately
  clearError();
}
```

## Performance Considerations

### 1. Lazy Initialization
UXCam is only initialized when needed and when the user has opted in.

### 2. Efficient Event Tracking
Events are tracked asynchronously to avoid blocking the UI.

### 3. Memory Management
The service uses singleton pattern to prevent memory leaks.

### 4. Network Optimization
Events are batched and sent efficiently to minimize network usage.

## Testing

### Development Testing

```typescript
// Test event tracking
const { trackEvent } = useUXCamContext();
await trackEvent('test_event', { test: true });

// Test session management
const { startSession, stopSession } = useUXCamContext();
await startSession({ testUser: true });
await stopSession();
```

### Production Testing

1. Verify API key configuration
2. Test privacy controls
3. Validate event tracking
4. Check session management
5. Test error handling

## Troubleshooting

### Common Issues

1. **UXCam not initializing**
   - Check API key configuration
   - Verify network connectivity
   - Check console for errors

2. **Events not being tracked**
   - Ensure UXCam is initialized
   - Check if user has opted in
   - Verify event names are valid

3. **Privacy concerns**
   - Verify sensitive screens are excluded
   - Check data filtering is working
   - Test opt-out functionality

### Debug Mode

Enable debug logging in development:

```typescript
// In config/uxcam.ts
development: {
  enableNetworkLogging: true,
  // ... other settings
}
```

## Security Considerations

1. **API Key Protection**
   - Store API keys securely
   - Use environment variables in production
   - Never commit API keys to version control

2. **Data Privacy**
   - Implement proper data filtering
   - Respect user privacy preferences
   - Comply with GDPR and other regulations

3. **Network Security**
   - Use HTTPS for all communications
   - Implement proper error handling
   - Validate all data before sending

## Compliance

### GDPR Compliance

The integration includes features for GDPR compliance:

1. **User Consent**: Users can opt in/out of recording
2. **Data Minimization**: Only necessary data is collected
3. **Right to Erasure**: Users can request data deletion
4. **Transparency**: Clear privacy policies and data usage

### Data Retention

Configure data retention policies in UXCam dashboard:

1. Set appropriate retention periods
2. Implement data deletion policies
3. Monitor data usage and storage

## Best Practices

1. **Always respect user privacy**
2. **Test thoroughly in development**
3. **Monitor performance impact**
4. **Keep documentation updated**
5. **Regular security audits**
6. **Compliance monitoring**

## Support

For technical support:

1. Check UXCam documentation
2. Review console logs for errors
3. Test with minimal configuration
4. Contact UXCam support if needed

## Changelog

### Version 1.0.0
- Initial UXCam integration
- Basic session management
- Event tracking utilities
- Privacy controls
- Comprehensive documentation
