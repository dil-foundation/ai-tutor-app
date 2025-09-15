import { UXCAM_API_KEY } from '@env';

// UXCam Configuration
export const UXCamConfig = {
  // Load API key from environment variables
  API_KEY: UXCAM_API_KEY || 'xnayvk2m8m2h8xw-us',
  
  // Environment configuration
  ENVIRONMENTS: {
    development: {
      API_KEY: UXCAM_API_KEY || 'xnayvk2m8m2h8xw-us',
      enableAutomaticScreenNameTagging: true,
      enableCrashHandling: false,
      enableMultiSessionRecordings: true,
      enableNetworkLogging: true,
    },
    staging: {
      API_KEY: UXCAM_API_KEY || 'xnayvk2m8m2h8xw-us',
      enableAutomaticScreenNameTagging: true,
      enableCrashHandling: true,
      enableMultiSessionRecordings: true,
      enableNetworkLogging: false,
    },
    production: {
      API_KEY: UXCAM_API_KEY || 'xnayvk2m8m2h8xw-us',
      enableAutomaticScreenNameTagging: true,
      enableCrashHandling: true,
      enableMultiSessionRecordings: true,
      enableNetworkLogging: false,
    },
  },
  
  // Privacy settings
  PRIVACY: {
    // Screens to exclude from recording
    EXCLUDED_SCREENS: [
      'Login',
      'SignUp',
      'PasswordReset',
      'Profile',
      'Settings',
      'Payment',
      'Billing',
    ],
    
    // Sensitive data patterns to mask
    SENSITIVE_PATTERNS: [
      /password/i,
      /token/i,
      /api_key/i,
      /secret/i,
      /credit_card/i,
      /ssn/i,
    ],
    
    // User properties to exclude
    EXCLUDED_PROPERTIES: [
      'password',
      'token',
      'apiKey',
      'secret',
      'creditCard',
      'ssn',
      'phoneNumber',
      'email',
    ],
  },
  
  // Recording settings
  RECORDING: {
    // Minimum session duration (in seconds)
    MIN_SESSION_DURATION: 5,
    
    // Maximum session duration (in seconds) - 0 for unlimited
    MAX_SESSION_DURATION: 0,
    
    // Recording quality
    QUALITY: 'medium', // 'low', 'medium', 'high'
    
    // Frame rate
    FRAME_RATE: 10,
  },
  
  // Analytics settings
  ANALYTICS: {
    // Enable automatic event tracking
    ENABLE_AUTOMATIC_EVENTS: true,
    
    // Custom events to track
    CUSTOM_EVENTS: [
      'lesson_started',
      'lesson_completed',
      'exercise_started',
      'exercise_completed',
      'quiz_started',
      'quiz_completed',
      'payment_initiated',
      'payment_completed',
      'error_occurred',
      'screen_navigation',
      'app_state_change',
      'user_login',
      'user_logout',
      'button_click',
      'form_submit',
    ],
  },
};

// Get current environment
export const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  // You can customize this based on your build configuration
  if (__DEV__) {
    return 'development';
  }
  
  // For production builds, you might want to check build configuration
  // or environment variables
  return 'production';
};

// Get configuration for current environment
export const getUXCamConfig = () => {
  const environment = getCurrentEnvironment();
  const config = {
    ...UXCamConfig,
    ...UXCamConfig.ENVIRONMENTS[environment],
  };
  
  // Validate API key
  if (!config.API_KEY || config.API_KEY === 'xnayvk2m8m2h8xw-us') {
    console.warn('UXCam API key not properly configured. Using default key.');
  }
  
  return config;
};
