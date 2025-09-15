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
  setUserIdentity: async (userId: string) => {
    console.log('🎥 [UXCam Mock] User identity set:', userId);
    await new Promise(resolve => setTimeout(resolve, 50));
  },
  setUserProperty: async (key: string, value: string) => {
    console.log('🎥 [UXCam Mock] User property set:', key, '=', value);
    await new Promise(resolve => setTimeout(resolve, 50));
  },
  logEvent: async (eventName: string, properties?: Record<string, any>) => {
    console.log('🎥 [UXCam Mock] Event logged:', eventName, properties);
    await new Promise(resolve => setTimeout(resolve, 50));
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
    console.log('🎥 [UXCam Mock] Opted in');
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

// Safe UXCam module loading with comprehensive error handling
let RNUxcam: any = null;
let isRealUXCam = false;
let uxcamLoadError: string | null = null;

// Check if we're in a production build or development build
const isDevelopmentClient = !!process.env.EXPO_DEV_CLIENT;
const isProductionBuild = !__DEV__;

// Initialize with mock first to ensure we always have a working implementation
RNUxcam = createMockUXCam();
isRealUXCam = false;

// Only attempt to load real UXCam in production or dev client builds
if (isDevelopmentClient || isProductionBuild) {
  try {
    console.log('🎥 [UXCam] Attempting to load native UXCam module...');
    
    // Multiple loading strategies
    let uxCamModule: any = null;
    
    // Strategy 1: Direct require
    try {
      uxCamModule = require('react-native-ux-cam');
    } catch (e1) {
      console.log('🎥 [UXCam] Strategy 1 failed:', e1);
      
      // Strategy 2: Try with different import path
      try {
        uxCamModule = require('react-native-ux-cam/lib/index');
      } catch (e2) {
        console.log('🎥 [UXCam] Strategy 2 failed:', e2);
        
        // Strategy 3: Try NativeModules
        try {
          const { NativeModules } = require('react-native');
          uxCamModule = NativeModules.RNUxcam;
        } catch (e3) {
          console.log('🎥 [UXCam] Strategy 3 failed:', e3);
          throw new Error('All loading strategies failed');
        }
      }
    }
    
    if (!uxCamModule) {
      throw new Error('UXCam module is null or undefined');
    }
    
    // Extract the actual UXCam object
    const realUXCam = uxCamModule.default || uxCamModule.RNUxcam || uxCamModule;
    
    if (!realUXCam || typeof realUXCam !== 'object') {
      throw new Error('UXCam module structure is invalid');
    }
    
    // Verify essential methods exist
    const hasStartWithKey = typeof realUXCam.startWithKey === 'function';
    const hasStartWithConfiguration = typeof realUXCam.startWithConfiguration === 'function';
    
    if (!hasStartWithKey && !hasStartWithConfiguration) {
      throw new Error('No valid UXCam initialization methods found');
    }
    
    // Success! Use the real UXCam
    RNUxcam = realUXCam;
    isRealUXCam = true;
    
    console.log('✅ [UXCam] Native UXCam SDK loaded successfully');
    console.log('🎥 [UXCam] Available methods:', Object.keys(realUXCam).filter(key => typeof realUXCam[key] === 'function'));
    console.log('🎥 [UXCam] Has startWithKey:', hasStartWithKey);
    console.log('🎥 [UXCam] Has startWithConfiguration:', hasStartWithConfiguration);
    
  } catch (error) {
    uxcamLoadError = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ [UXCam] Failed to load native module:', uxcamLoadError);
    console.log('🎥 [UXCam] Falling back to mock implementation');
    
    // Keep the mock implementation we initialized earlier
    RNUxcam = createMockUXCam();
    isRealUXCam = false;
  }
} else {
  console.log('🎥 [UXCam] Running in Expo Go, using mock implementation');
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
   * Initialize UXCam with comprehensive error handling
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🎥 [UXCam] Already initialized');
      return;
    }

    console.log('🎥 [UXCam] Starting initialization...');

    // Ensure RNUxcam is available (should always be true due to our loading strategy)
    if (!RNUxcam) {
      console.error('🎥 [UXCam] RNUxcam is not available, this should not happen');
      RNUxcam = createMockUXCam();
      isRealUXCam = false;
    }

    try {
      const config = getUXCamConfig();
      console.log('🎥 [UXCam] Using API key:', config.API_KEY ? config.API_KEY.substring(0, 8) + '...' : 'undefined');
      
      // Initialize based on available methods
      let initializationSuccess = false;
      
      if (isRealUXCam) {
        console.log('🎥 [UXCam] Attempting real UXCam initialization...');
        
        // Strategy 1: Try startWithConfiguration (newer SDK)
        if (typeof RNUxcam.startWithConfiguration === 'function') {
          try {
            const configuration = {
              userAppKey: config.API_KEY,
              enableAutomaticScreenNameTagging: false,
              enableAdvancedGestureRecognition: true,
              enableImprovedScreenCapture: true,
            };
            
            await RNUxcam.startWithConfiguration(configuration);
            console.log('✅ [UXCam] Initialized with startWithConfiguration');
            initializationSuccess = true;
            
            // Enable iOS screen recordings if available
            if (Platform.OS === 'ios' && typeof RNUxcam.optIntoSchematicRecordings === 'function') {
              try {
                await RNUxcam.optIntoSchematicRecordings();
                console.log('✅ [UXCam] iOS schematic recordings enabled');
              } catch (iosError) {
                console.warn('⚠️ [UXCam] Failed to enable iOS recordings:', iosError);
              }
            }
            
          } catch (configError) {
            console.warn('⚠️ [UXCam] startWithConfiguration failed:', configError);
          }
        }
        
        // Strategy 2: Try startWithKey (older SDK) if configuration failed
        if (!initializationSuccess && typeof RNUxcam.startWithKey === 'function') {
          try {
            await RNUxcam.startWithKey(config.API_KEY);
            console.log('✅ [UXCam] Initialized with startWithKey');
            initializationSuccess = true;
          } catch (keyError) {
            console.warn('⚠️ [UXCam] startWithKey failed:', keyError);
          }
        }
        
        // If real UXCam failed, fall back to mock
        if (!initializationSuccess) {
          console.warn('⚠️ [UXCam] Real UXCam initialization failed, switching to mock');
          RNUxcam = createMockUXCam();
          isRealUXCam = false;
        }
      }
      
      // Initialize mock implementation if needed
      if (!isRealUXCam) {
        try {
          await RNUxcam.startWithKey(config.API_KEY);
          console.log('✅ [UXCam] Mock implementation initialized');
          initializationSuccess = true;
        } catch (mockError) {
          console.error('❌ [UXCam] Even mock initialization failed:', mockError);
          // This should never happen, but just in case
          initializationSuccess = true; // Continue anyway
        }
      }
      
      // Configure additional settings only if we have a working UXCam instance
      if (initializationSuccess) {
        try {
          this.configurePrivacySettings();
          this.configureRecordingSettings();
          this.setupEventListeners();
          console.log('✅ [UXCam] Additional configuration completed');
        } catch (configError) {
          console.warn('⚠️ [UXCam] Additional configuration failed:', configError);
          // Don't fail initialization for configuration errors
        }
      }
      
      this.isInitialized = true;
      console.log('🎉 [UXCam] Initialization completed successfully');
      console.log('🎥 [UXCam] Using:', isRealUXCam ? 'Real UXCam SDK' : 'Mock Implementation');
      
    } catch (error) {
      console.error('❌ [UXCam] Critical initialization error:', error);
      
      // Last resort: ensure we have a working mock
      try {
        RNUxcam = createMockUXCam();
        isRealUXCam = false;
        this.isInitialized = true;
        console.log('🔄 [UXCam] Recovered with mock implementation');
      } catch (recoveryError) {
        console.error('💥 [UXCam] Recovery failed:', recoveryError);
        // Mark as initialized anyway to prevent infinite loops
        this.isInitialized = true;
      }
    }
  }

  /**
   * Configure privacy settings with safe method calls
   */
  private configurePrivacySettings(): void {
    if (!RNUxcam) return;
    
    try {
      // Exclude sensitive screens
      UXCamConfig.PRIVACY.EXCLUDED_SCREENS.forEach(screenName => {
        this.safeCall(() => RNUxcam.addScreenNameToIgnore(screenName), 'addScreenNameToIgnore');
      });

      // Set up sensitive data masking
      this.safeCall(() => RNUxcam.setAutomaticScreenNameTagging(true), 'setAutomaticScreenNameTagging');
      
      // Configure privacy options
      this.safeCall(() => RNUxcam.setUserProperty('privacy_enabled', 'true'), 'setUserProperty');
      
      console.log('✅ [UXCam] Privacy settings configured');
    } catch (error) {
      console.warn('⚠️ [UXCam] Failed to configure privacy settings:', error);
    }
  }

  /**
   * Safe method call wrapper
   */
  private safeCall(fn: () => any, methodName: string): any {
    try {
      return fn();
    } catch (error) {
      console.warn(`⚠️ [UXCam] ${methodName} failed:`, error);
      return null;
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