// Mock UXCam Service for Development
// This service works in Expo managed workflow and development
import { Platform } from 'react-native';
import { UXCamConfig, getUXCamConfig } from '../config/uxcam';

// Create a mock UXCam object for development
const createMockUXCam = () => ({
  startWithKey: async (apiKey: string) => {
    console.log('🎥 [UXCam Mock] Started with API key:', apiKey.substring(0, 10) + '...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  },
  startWithConfiguration: async (config: any) => {
    console.log('🎥 [UXCam Mock] Started with configuration:', config.userAppKey.substring(0, 10) + '...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  },
  startNewSession: async () => {
    console.log('🎥 [UXCam Mock] New session started');
    await new Promise(resolve => setTimeout(resolve, 50));
  },
  stopSessionAndUploadData: async () => {
    console.log('🎥 [UXCam Mock] Session stopped and data uploaded');
    await new Promise(resolve => setTimeout(resolve, 50));
  },
  setUserIdentity: (userId: string) => {
    console.log('🎥 [UXCam Mock] User identity set:', userId);
  },
  setUserProperty: (key: string, value: string) => {
    console.log('🎥 [UXCam Mock] User property set:', key, '=', value);
  },
  logEvent: (eventName: string, properties?: Record<string, any>) => {
    console.log('🎥 [UXCam Mock] Event logged:', eventName, properties);
  },
  addScreenNameToIgnore: (screenName: string) => {
    console.log('🎥 [UXCam Mock] Screen ignored:', screenName);
  },
  removeScreenNameToIgnore: (screenName: string) => {
    console.log('🎥 [UXCam Mock] Screen unignored:', screenName);
  },
  getSessionUrl: async (): Promise<string> => {
    const mockUrl = `https://app.uxcam.com/sessions/mock-session-${Date.now()}`;
    console.log('🎥 [UXCam Mock] Session URL:', mockUrl);
    return mockUrl;
  },
  isRecording: async (): Promise<boolean> => {
    console.log('🎥 [UXCam Mock] Is recording: true');
    return true;
  },
  pauseScreenRecording: async () => {
    console.log('🎥 [UXCam Mock] Recording paused');
    await new Promise(resolve => setTimeout(resolve, 50));
  },
  resumeScreenRecording: async () => {
    console.log('🎥 [UXCam Mock] Recording resumed');
    await new Promise(resolve => setTimeout(resolve, 50));
  },
  optOutOverall: async () => {
    console.log('🎥 [UXCam Mock] Opted out');
    await new Promise(resolve => setTimeout(resolve, 50));
  },
  optIntoSchematicRecordings: async () => {
    console.log('🎥 [UXCam Mock] Opted into schematic recordings');
    await new Promise(resolve => setTimeout(resolve, 50));
  },
  setAutomaticScreenNameTagging: (enabled: boolean) => {
    console.log('🎥 [UXCam Mock] Automatic screen tagging:', enabled);
  },
  setRecordingQuality: (quality: string) => {
    console.log('🎥 [UXCam Mock] Recording quality set:', quality);
  },
  setFrameRate: (frameRate: number) => {
    console.log('🎥 [UXCam Mock] Frame rate set:', frameRate);
  },
  setMinimumSessionDuration: (duration: number) => {
    console.log('🎥 [UXCam Mock] Min session duration:', duration);
  },
  setMaximumSessionDuration: (duration: number) => {
    console.log('🎥 [UXCam Mock] Max session duration:', duration);
  },
});

// Use mock for development, real RNUxcam for production builds
let RNUxcam: any;
let isRealUXCam = false;

// Check if we're in a production build or development build
// Use EXPO_DEV_CLIENT to detect custom development client
const isDevelopmentClient = !!process.env.EXPO_DEV_CLIENT;
const isProductionBuild = !__DEV__;

try {
  // Try to import real RNUxcam only in dev client or production build
  if (isDevelopmentClient || isProductionBuild) {
    const realUXCam = require('react-native-ux-cam').default;
    if (realUXCam && (typeof realUXCam.startWithKey === 'function' || typeof realUXCam.startWithConfiguration === 'function')) {
      RNUxcam = realUXCam;
      isRealUXCam = true;
      console.log('🎥 [UXCam] Real UXCam SDK loaded successfully');
      console.log('🎥 [UXCam] Build type:', isProductionBuild ? 'Production' : (isDevelopmentClient ? 'Dev Client' : 'Expo Go'));
    } else {
      throw new Error('UXCam SDK methods not found');
    }
  } else {
    throw new Error('Not in a dev client or production build, using mock');
  }
} catch (error) {
  // Fall back to mock implementation for Expo Go
  RNUxcam = createMockUXCam();
  isRealUXCam = false;
  console.log('🎥 [UXCam] Using mock implementation for Expo Go');
  if (error instanceof Error) {
    console.log('🎥 [UXCam] Reason:', error.message);
  }
}

export interface UXCamUserProperties {
  userId?: string;
  userRole?: 'student' | 'teacher' | 'admin';
  userLevel?: string;
  userLanguage?: string;
  subscriptionType?: string;
  [key: string]: any;
}

export interface UXCamEventData {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class UXCamService {
  private static instance: UXCamService;
  private isInitialized: boolean = false;
  private currentSessionId: string | null = null;
  private userProperties: UXCamUserProperties = {};

  private constructor() {}

  public static getInstance(): UXCamService {
    if (!UXCamService.instance) {
      UXCamService.instance = new UXCamService();
    }
    return UXCamService.instance;
  }

  /**
   * Initialize UXCam with configuration
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('UXCam already initialized');
      return;
    }

    // Ensure RNUxcam is available
    if (!RNUxcam) {
      console.error('UXCam is not available');
      this.isInitialized = true; // Mark as initialized to prevent retry loops
      return;
    }

    try {
      const config = getUXCamConfig();
      
      // Try different initialization methods based on SDK version
      if (isRealUXCam) {
        // Add this line to enable iOS screen recordings
        if (Platform.OS === 'ios') {
          RNUxcam.optIntoSchematicRecordings();
        }

        if (typeof RNUxcam.startWithConfiguration === 'function') {
          // New SDK version with configuration object
          const configuration = {
            userAppKey: config.API_KEY,
            enableAutomaticScreenNameTagging: false,
            enableAdvancedGestureRecognition: true,
            enableImprovedScreenCapture: true,
          };
          await RNUxcam.startWithConfiguration(configuration);
          console.log('🎥 [UXCam] Initialized with startWithConfiguration');
        } else {
          throw new Error('No valid UXCam initialization method found. startWithConfiguration is missing.');
        }
      } else {
        // Mock implementation
        await RNUxcam.startWithKey(config.API_KEY);
        console.log('🎥 [UXCam] Mock implementation initialized');
      }
      
      // Configure privacy settings
      this.configurePrivacySettings();
      
      // Configure recording settings
      this.configureRecordingSettings();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('🎥 [UXCam] Initialization completed successfully');
    } catch (error) {
      console.error('🎥 [UXCam] Failed to initialize:', error);
      console.log('🎥 [UXCam] Continuing with mock implementation...');
      // Don't throw error in development, just log it
      this.isInitialized = true; // Mark as initialized to prevent retry loops
    }
  }

  /**
   * Configure privacy settings
   */
  private configurePrivacySettings(): void {
    if (!RNUxcam) return;
    
    try {
      // Exclude sensitive screens
      UXCamConfig.PRIVACY.EXCLUDED_SCREENS.forEach(screenName => {
        RNUxcam.addScreenNameToIgnore(screenName);
      });

      // Set up sensitive data masking
      RNUxcam.setAutomaticScreenNameTagging(true);
      
      // Configure privacy options
      RNUxcam.setUserProperty('privacy_enabled', 'true');
    } catch (error) {
      console.error('Failed to configure privacy settings:', error);
    }
  }

  /**
   * Configure recording settings
   */
  private configureRecordingSettings(): void {
    if (!RNUxcam) return;
    
    try {
      const { RECORDING } = UXCamConfig;
      
      // Set recording quality
      RNUxcam.setRecordingQuality(RECORDING.QUALITY);
      
      // Set frame rate
      RNUxcam.setFrameRate(RECORDING.FRAME_RATE);
      
      // Configure session settings
      if (RECORDING.MIN_SESSION_DURATION > 0) {
        RNUxcam.setMinimumSessionDuration(RECORDING.MIN_SESSION_DURATION);
      }
      
      if (RECORDING.MAX_SESSION_DURATION > 0) {
        RNUxcam.setMaximumSessionDuration(RECORDING.MAX_SESSION_DURATION);
      }
    } catch (error) {
      console.error('Failed to configure recording settings:', error);
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!RNUxcam) return;
    
    try {
      // Error handling
      RNUxcam.setAutomaticScreenNameTagging(true);
    } catch (error) {
      console.error('Failed to setup event listeners:', error);
    }
  }

  /**
   * Start a new session
   */
  public async startSession(userProperties?: UXCamUserProperties): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!RNUxcam) {
      console.error('UXCam is not available for session start');
      return;
    }

    try {
      // Set user properties if provided
      if (userProperties) {
        await this.setUserProperties(userProperties);
      }

      // Start recording
      await RNUxcam.startNewSession();
      
      this.currentSessionId = await RNUxcam.getSessionUrl();
      console.log('UXCam session started:', this.currentSessionId);
    } catch (error) {
      console.error('Failed to start UXCam session:', error);
      // Don't throw error in development
    }
  }

  /**
   * Stop the current session
   */
  public async stopSession(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await RNUxcam.stopSessionAndUploadData();
      this.currentSessionId = null;
      console.log('UXCam session stopped');
    } catch (error) {
      console.error('Failed to stop UXCam session:', error);
    }
  }

  /**
   * Set user properties
   */
  public async setUserProperties(properties: UXCamUserProperties): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    if (!RNUxcam) {
      console.error('UXCam is not available for setting user properties');
      return;
    }

    try {
      // Filter out sensitive properties
      const filteredProperties = this.filterSensitiveProperties(properties);
      
      // Set each property
      Object.entries(filteredProperties).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          RNUxcam.setUserProperty(key, String(value));
        }
      });

      this.userProperties = { ...this.userProperties, ...filteredProperties };
      console.log('UXCam user properties set:', filteredProperties);
    } catch (error) {
      console.error('Failed to set UXCam user properties:', error);
    }
  }

  /**
   * Filter out sensitive properties
   */
  private filterSensitiveProperties(properties: UXCamUserProperties): UXCamUserProperties {
    const filtered: UXCamUserProperties = {};
    
    Object.entries(properties).forEach(([key, value]) => {
      if (!UXCamConfig.PRIVACY.EXCLUDED_PROPERTIES.includes(key)) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  }

  /**
   * Track custom event
   */
  public async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    if (!RNUxcam) {
      console.error('UXCam is not available for tracking events');
      return;
    }

    try {
      // Validate event name
      if (!UXCamConfig.ANALYTICS.CUSTOM_EVENTS.includes(eventName)) {
        console.warn(`UXCam event "${eventName}" not in allowed list`);
      }

      // Filter sensitive properties
      const filteredProperties = properties ? this.filterSensitiveProperties(properties) : undefined;
      
      // Track the event
      RNUxcam.logEvent(eventName, filteredProperties);
      
      console.log('UXCam event tracked:', eventName, filteredProperties);
    } catch (error) {
      console.error('Failed to track UXCam event:', error);
    }
  }

  /**
   * Set user identity
   */
  public async setUserIdentity(userId: string, userProperties?: UXCamUserProperties): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    if (!RNUxcam) {
      console.error('UXCam is not available for setting user identity');
      return;
    }

    try {
      RNUxcam.setUserIdentity(userId);
      
      if (userProperties) {
        await this.setUserProperties(userProperties);
      }
      
      console.log('UXCam user identity set:', userId);
    } catch (error) {
      console.error('Failed to set UXCam user identity:', error);
    }
  }

  /**
   * Add screen name to ignore list
   */
  public addScreenToIgnore(screenName: string): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      RNUxcam.addScreenNameToIgnore(screenName);
      console.log('UXCam screen added to ignore list:', screenName);
    } catch (error) {
      console.error('Failed to add screen to ignore list:', error);
    }
  }

  /**
   * Remove screen name from ignore list
   */
  public removeScreenFromIgnore(screenName: string): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      RNUxcam.removeScreenNameToIgnore(screenName);
      console.log('UXCam screen removed from ignore list:', screenName);
    } catch (error) {
      console.error('Failed to remove screen from ignore list:', error);
    }
  }

  /**
   * Get current session URL
   */
  public async getSessionUrl(): Promise<string | null> {
    if (!this.isInitialized) {
      return null;
    }

    try {
      return await RNUxcam.getSessionUrl();
    } catch (error) {
      console.error('Failed to get UXCam session URL:', error);
      return null;
    }
  }

  /**
   * Check if UXCam is recording
   */
  public async isRecording(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      return await RNUxcam.isRecording();
    } catch (error) {
      console.error('Failed to check UXCam recording status:', error);
      return false;
    }
  }

  /**
   * Pause recording
   */
  public async pauseRecording(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await RNUxcam.pauseScreenRecording();
      console.log('UXCam recording paused');
    } catch (error) {
      console.error('Failed to pause UXCam recording:', error);
    }
  }

  /**
   * Resume recording
   */
  public async resumeRecording(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await RNUxcam.resumeScreenRecording();
      console.log('UXCam recording resumed');
    } catch (error) {
      console.error('Failed to resume UXCam recording:', error);
    }
  }

  /**
   * Opt out of recording
   */
  public async optOut(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await RNUxcam.optOutOverall();
      console.log('UXCam opted out');
    } catch (error) {
      console.error('Failed to opt out of UXCam:', error);
    }
  }

  /**
   * Opt into recording
   */
  public async optIn(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    if (!RNUxcam) {
      console.error('UXCam is not available for opting in');
      return;
    }

    try {
      await RNUxcam.optIntoSchematicRecordings();
      console.log('UXCam opted in');
    } catch (error) {
      console.error('Failed to opt into UXCam:', error);
    }
  }

  /**
   * Get current user properties
   */
  public getUserProperties(): UXCamUserProperties {
    return { ...this.userProperties };
  }

  /**
   * Get current session ID
   */
  public getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Check if UXCam is initialized
   */
  public isUXCamInitialized(): boolean {
    return this.isInitialized;
  }
}

export default UXCamService;