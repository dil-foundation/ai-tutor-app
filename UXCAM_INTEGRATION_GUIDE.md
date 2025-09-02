# UXCam Integration Guide

## Overview

This document provides a comprehensive guide for the UXCam integration implemented in the DIL Tutor mobile app. The integration follows professional software engineering practices and provides a robust, scalable solution for user experience analytics.

## Architecture

The UXCam integration is built using a layered architecture:

```
┌─────────────────────────────────────┐
│           App Components            │
├─────────────────────────────────────┤
│         UXCam Context               │
├─────────────────────────────────────┤
│         UXCam Hook                  │
├─────────────────────────────────────┤
│         UXCam Service               │
├─────────────────────────────────────┤
│         UXCam SDK                   │
└─────────────────────────────────────┘
```

### Components

1. **UXCamService** (`utils/uxcamService.ts`)
   - Singleton service class
   - Handles all UXCam SDK interactions
   - Provides error handling and logging
   - Manages initialization and configuration

2. **useUXCam Hook** (`hooks/useUXCam.ts`)
   - React hook for easy UXCam access
   - Provides reactive state management
   - Auto-tags screens based on navigation
   - Handles lifecycle management

3. **UXCamContext** (`context/UXCamContext.tsx`)
   - React context provider
   - Global state management
   - Automatic user tracking
   - Integration with authentication

4. **UXCamPrivacyControls** (`components/UXCamPrivacyControls.tsx`)
   - User privacy controls
   - Opt-in/opt-out functionality
   - Privacy information display
   - Modal and inline variants

5. **Environment Configuration** (`config/environment.ts`)
   - Environment variable management
   - Configuration validation
   - Feature flags
   - Debug settings

## Installation

### 1. Install UXCam SDK

```bash
cd dil-tutor-app
npm install react-native-uxcam
```

### 2. Configure Environment Variables

Add your UXCam API key to the environment:

```bash
# .env file
UXCAM_API_KEY="your_uxcam_api_key_here"
EXPO_PUBLIC_SUPABASE_URL="your_supabase_url"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 3. Update app.json

The `app.json` file has been updated to include UXCam configuration:

```json
{
  "expo": {
    "extra": {
      "UXCAM_API_KEY": "",
      "ENABLE_UXCAM": "true",
      "ENABLE_ANALYTICS": "true",
      "DEBUG_MODE": "false"
    }
  }
}
```

## Usage

### Basic Integration

The UXCam integration is automatically initialized in the app layout:

```tsx
// app/_layout.tsx
<UXCamProvider apiKey={Environment.UXCAM_API_KEY}>
  {/* Your app components */}
</UXCamProvider>
```

### Using UXCam in Components

```tsx
import { useUXCamContext } from '../context/UXCamContext';

const MyComponent = () => {
  const { 
    isInitialized, 
    isEnabled, 
    addEvent, 
    setUserProperty,
    tagScreen 
  } = useUXCamContext();

  const handleButtonPress = () => {
    // Track custom event
    addEvent('button_pressed', {
      buttonName: 'submit',
      screen: 'home'
    });
  };

  const updateUserLevel = (level: string) => {
    // Set user property
    setUserProperty('user_level', level);
  };

  return (
    <View>
      <Text>UXCam Status: {isEnabled ? 'Enabled' : 'Disabled'}</Text>
      <Button onPress={handleButtonPress} title="Track Event" />
    </View>
  );
};
```

### Privacy Controls

Add privacy controls to your settings screen:

```tsx
import UXCamPrivacyControls from '../components/UXCamPrivacyControls';

const SettingsScreen = () => {
  return (
    <View>
      <UXCamPrivacyControls 
        showIcon={false}
        showModal={true}
        onPrivacyChange={(enabled) => {
          console.log('Privacy setting changed:', enabled);
        }}
      />
    </View>
  );
};
```

### Screen Tagging

Screens are automatically tagged based on navigation, but you can also manually tag screens:

```tsx
const { tagScreen } = useUXCamContext();

useEffect(() => {
  tagScreen('CustomScreenName');
}, []);
```

## Configuration Options

### UXCam Service Configuration

```tsx
import UXCamService from '../utils/uxcamService';

const config = {
  enableAutomaticScreenNameTagging: true,
  enableCrashHandling: true,
  enableMultiSessionRecordings: true,
  enableNetworkLogging: false,
  enableScreenNameTagging: true,
  enableSessionReplay: true,
  enableUserProperties: true,
  enableVideoRecording: true,
  enableWebViewRecording: false,
  maskAllTextInputs: false,
  maskAllImages: false,
  maskUserInputs: false,
  occludeSensitiveData: true,
  sessionReplay: true,
};

await UXCamService.getInstance().initialize(apiKey, config);
```

### Privacy Settings

The integration includes comprehensive privacy controls:

- **Opt-in/Opt-out**: Users can enable/disable tracking
- **Data Masking**: Sensitive data is automatically masked
- **Session Control**: Users can start/stop recording
- **Transparency**: Clear privacy information provided

## API Reference

### UXCamService Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `initialize(apiKey, config?)` | Initialize UXCam | `apiKey: string`, `config?: UXCamConfig` |
| `setUser(user)` | Set user identity | `user: any` |
| `tagScreenName(screenName)` | Tag a screen | `screenName: string` |
| `addEvent(eventName, properties?)` | Add custom event | `eventName: string`, `properties?: object` |
| `setUserProperty(key, value)` | Set user property | `key: string`, `value: any` |
| `startNewSession()` | Start new session | None |
| `stopRecording()` | Stop recording | None |
| `resumeRecording()` | Resume recording | None |
| `optIn()` | Opt in to tracking | None |
| `optOut()` | Opt out of tracking | None |
| `getSessionUrl()` | Get session URL | None |
| `isOptedOut()` | Check opt-out status | None |

### useUXCam Hook

The hook provides the same methods as the service with reactive state:

```tsx
const {
  // Core functionality
  initialize,
  setUser,
  tagScreen,
  addEvent,
  setUserProperty,
  
  // Session management
  startNewSession,
  stopRecording,
  resumeRecording,
  
  // Privacy controls
  optIn,
  optOut,
  isOptedOut,
  
  // Status
  isInitialized,
  isEnabled,
  getSessionUrl,
  getCurrentUser,
} = useUXCam();
```

## Best Practices

### 1. Error Handling

The service includes comprehensive error handling:

```tsx
try {
  await uxcamService.initialize(apiKey);
} catch (error) {
  console.error('UXCam initialization failed:', error);
  // Handle gracefully - app continues without analytics
}
```

### 2. Privacy First

- Always respect user privacy preferences
- Provide clear information about data collection
- Allow users to opt-out at any time
- Mask sensitive information automatically

### 3. Performance

- Lazy load UXCam SDK
- Use async operations for non-critical functions
- Implement proper cleanup on component unmount

### 4. Testing

```tsx
// Test UXCam integration
const TestComponent = () => {
  const { isInitialized, addEvent } = useUXCamContext();
  
  useEffect(() => {
    if (isInitialized) {
      addEvent('test_event', { test: true });
    }
  }, [isInitialized]);
  
  return null;
};
```

## Troubleshooting

### Common Issues

1. **UXCam not initializing**
   - Check API key configuration
   - Verify network connectivity
   - Check console for error messages

2. **Events not being tracked**
   - Ensure UXCam is initialized
   - Check if user has opted out
   - Verify event names and properties

3. **Privacy controls not working**
   - Check UXCam service initialization
   - Verify context provider setup
   - Test opt-in/opt-out functions

### Debug Mode

Enable debug mode for detailed logging:

```tsx
// In app.json
{
  "expo": {
    "extra": {
      "DEBUG_MODE": "true"
    }
  }
}
```

## Security Considerations

1. **API Key Protection**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Data Privacy**
   - Mask sensitive user input
   - Respect GDPR/CCPA requirements
   - Provide clear privacy policy

3. **Network Security**
   - Use HTTPS for all communications
   - Validate data before sending
   - Implement rate limiting

## Performance Impact

The UXCam integration is designed to minimize performance impact:

- **Lazy Loading**: SDK loaded only when needed
- **Async Operations**: Non-blocking initialization
- **Memory Management**: Proper cleanup and garbage collection
- **Network Optimization**: Efficient data transmission

## Monitoring and Analytics

Track UXCam performance and usage:

```tsx
// Monitor initialization success rate
const initSuccess = await uxcamService.initialize(apiKey);
console.log('UXCam init success:', initSuccess);

// Track user engagement
const sessionUrl = await uxcamService.getSessionUrl();
console.log('Session URL:', sessionUrl);
```

## Future Enhancements

1. **Advanced Analytics**
   - Custom funnel tracking
   - A/B testing integration
   - Heatmap generation

2. **Privacy Features**
   - Granular privacy controls
   - Data retention policies
   - User consent management

3. **Performance Optimization**
   - Offline data collection
   - Batch processing
   - Compression algorithms

## Support

For issues or questions about the UXCam integration:

1. Check the console for error messages
2. Verify configuration settings
3. Test with debug mode enabled
4. Review UXCam documentation
5. Contact the development team

## License

This UXCam integration is part of the DIL Tutor app and follows the same licensing terms.
