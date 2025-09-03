# UXCam Quick Reference

## 🚀 Quick Start

### 1. Install Package
```bash
npm install react-native-ux-cam
npx expo install react-native-ux-cam
```

### 2. Configure App Key
```typescript
// config/uxcam.ts
export const UXCAM_CONFIG = {
  APP_KEY: 'your-uxcam-app-key-here',
  // ... other settings
};
```

### 3. Initialize in App
```typescript
// app/_layout.tsx
import { useUXCam } from '../hooks/useUXCam';

function RootLayoutNav() {
  useUXCam(); // Already integrated
  // ... rest of component
}
```

## 📱 Screen Tracking

### Automatic Screen Tracking
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

### Manual Screen Tracking
```typescript
import { useUXCam } from '../hooks/useUXCam';

export default function MyScreen() {
  const { trackScreenView } = useUXCam();

  useEffect(() => {
    trackScreenView('MyScreen', {
      screen_type: 'feature_screen',
      user_segment: 'premium',
    });
  }, []);

  return (
    // Your screen content
  );
}
```

## 🎯 Event Tracking

### User Interactions
```typescript
const { trackUserInteraction } = useUXCam();

const handleButtonPress = () => {
  trackUserInteraction('button_press', {
    button_name: 'start_lesson',
    screen: 'LearnScreen',
    button_type: 'primary',
  });
};
```

### Learning Progress
```typescript
const { trackLearningProgress } = useUXCam();

const handleLessonComplete = () => {
  trackLearningProgress('lesson_completed', 85, {
    lesson_id: 'lesson_123',
    lesson_type: 'conversation',
    difficulty: 'intermediate',
    duration: 300,
  });
};
```

### Audio Interactions
```typescript
const { trackAudioInteraction } = useUXCam();

const handleRecordingStart = () => {
  trackAudioInteraction('recording_started', {
    recording_duration: 30,
    audio_quality: 'high',
    microphone_permission: 'granted',
  });
};
```

### Custom Events
```typescript
const { trackEvent } = useUXCam();

const handleFeatureDiscovery = () => {
  trackEvent('feature_discovery', {
    feature_name: 'conversation_mode',
    user_level: 'beginner',
    time_spent: 120,
    discovery_method: 'exploration',
  });
};
```

### Error Tracking
```typescript
const { trackError } = useUXCam();

const handleError = (error: Error) => {
  trackError('network_error', error.message, {
    error_code: 'NETWORK_001',
    retry_count: 3,
    user_action: 'retry',
  });
};
```

## 🔒 Privacy Controls

### Mark Sensitive Content
```typescript
const { markSensitive, unmarkSensitive } = useUXCam();

export default function LoginScreen() {
  useEffect(() => {
    markSensitive(); // Hide sensitive content
    return () => unmarkSensitive(); // Unhide when leaving
  }, []);

  return (
    // Login form
  );
}
```

### Opt In/Out Analytics
```typescript
const { optIntoAnalytics, optOutOfAnalytics, checkOptInStatus } = useUXCam();

const handleOptIn = () => {
  optIntoAnalytics();
};

const handleOptOut = () => {
  optOutOfAnalytics();
};

const checkStatus = async () => {
  const isOptedIn = await checkOptInStatus();
  console.log('User opted in:', isOptedIn);
};
```

## 🛠️ Utility Functions

### Get Session URL
```typescript
const { getSessionURL } = useUXCam();

const getCurrentSession = async () => {
  const sessionURL = await getSessionURL();
  console.log('Current session:', sessionURL);
};
```

### Check Recording Status
```typescript
const { isRecording } = useUXCam();

const checkRecording = async () => {
  const recording = await isRecording();
  console.log('Is recording:', recording);
};
```

## 🎨 Higher Order Component

### Wrap Existing Components
```typescript
import { withUXCam } from '../components/UXCamWrapper';

const MyComponent = () => {
  return (
    <View>
      <Text>My Component</Text>
    </View>
  );
};

export default withUXCam(MyComponent, 'MyComponent', {
  trackScreenView: true,
  markAsSensitive: false,
  additionalProperties: {
    component_type: 'feature',
  },
});
```

## 📊 Dashboard Events

### Common Event Names
- `screen_view` - Screen navigation
- `user_interaction` - Button clicks, taps
- `learning_progress` - Lesson completion
- `audio_interaction` - Recording actions
- `app_error` - Error occurrences
- `feature_discovery` - Feature usage
- `conversion` - Goal completion

### Event Properties
```typescript
// Standard properties to include
{
  screen: 'ScreenName',
  user_id: 'user123',
  user_role: 'student',
  timestamp: new Date().toISOString(),
  app_version: '1.0.0',
  platform: 'android',
}
```

## 🔧 Configuration Options

### UXCam Settings
```typescript
export const UXCAM_CONFIG = {
  APP_KEY: 'your-key',
  ENABLE_AUTOMATIC_SCREEN_NAME_TRACKING: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_MULTI_SESSION_RECORDING: true,
  ENABLE_OPT_IN_ANALYTICS: true,
  ENABLE_GESTURE_RECOGNITION: true,
  ENABLE_SMART_OPTIONS: true,
};
```

### Ignore Screens
```typescript
// In useUXCam hook
uxcamService.addScreenNameToIgnore('Login');
uxcamService.addScreenNameToIgnore('SignUp');
uxcamService.addScreenNameToIgnore('PasswordReset');
```

## 🧪 Testing

### Run Test Script
```bash
node scripts/test-uxcam.js
```

### Manual Testing
1. Start app: `npx expo run:android`
2. Check console for "UXCam initialized successfully"
3. Navigate between screens
4. Verify events in console
5. Check UXCam dashboard for recordings

### Debug Mode
```typescript
// Add to UXCamService.initialize()
UXCam.setDebugLogsEnabled(true);
```

## 📱 Platform-Specific

### Android Permissions
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
```

### iOS Permissions
```xml
<!-- ios/YourApp/Info.plist -->
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone for voice recording features.</string>
```

## 🚨 Troubleshooting

### Common Issues
1. **Not Initializing**: Check App Key and network
2. **No Recordings**: Verify permissions and internet
3. **Events Missing**: Check event names and timing
4. **Performance Issues**: Reduce event frequency

### Debug Commands
```bash
# Check package installation
npm list react-native-ux-cam

# Reinstall if needed
npm install react-native-ux-cam

# Clear cache
npx expo start --clear
```

## 📚 Resources

- [UXCam Documentation](https://help.uxcam.com/)
- [React Native SDK](https://help.uxcam.com/hc/en-us/articles/360032162871-React-Native-SDK)
- [Dashboard](https://app.uxcam.com/)
- [Community Forum](https://community.uxcam.com/)

---

**Remember**: Always respect user privacy and follow GDPR compliance guidelines!
