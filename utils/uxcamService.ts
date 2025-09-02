import { Platform } from 'react-native';
import Constants from 'expo-constants';

// UXCam SDK will be imported after installation
// import UXCam from 'react-native-uxcam';

interface UXCamConfig {
  enableAutomaticScreenNameTagging?: boolean;
  enableCrashHandling?: boolean;
  enableMultiSessionRecordings?: boolean;
  enableNetworkLogging?: boolean;
  enableScreenNameTagging?: boolean;
  enableSessionReplay?: boolean;
  enableUserProperties?: boolean;
  enableVideoRecording?: boolean;
  enableWebViewRecording?: boolean;
  maskAllTextInputs?: boolean;
  maskAllImages?: boolean;
  maskRectsOnNextFrame?: boolean;
  maskUserInputs?: boolean;
  occludeRectsOnNextFrame?: boolean;
  occludeSensitiveData?: boolean;
  occludeUserInputs?: boolean;
  sessionReplay?: boolean;
  userProperties?: Record<string, any>;
}

interface UserProperties {
  userId?: string;
  userRole?: string;
  userLevel?: string;
  userLanguage?: string;
  userDevice?: string;
  userOS?: string;
  appVersion?: string;
}

class UXCamService {
  private static instance: UXCamService;
  private isInitialized: boolean = false;
  private isEnabled: boolean = false;
  private currentUser: any = null;

  private constructor() {}

  public static getInstance(): UXCamService {
    if (!UXCamService.instance) {
      UXCamService.instance = new UXCamService();
    }
    return UXCamService.instance;
  }

  /**
   * Initialize UXCam with the provided API key
   * @param apiKey - UXCam API key from environment variables
   * @param config - Optional configuration object
   */
  public async initialize(apiKey: string, config?: UXCamConfig): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log('UXCam already initialized');
        return true;
      }

      if (!apiKey) {
        console.error('UXCam API key is required');
        return false;
      }

      // Import UXCam dynamically to avoid issues during development
      const UXCam = require('react-native-uxcam');
      
      // Default configuration
      const defaultConfig: UXCamConfig = {
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
        ...config,
      };

      // Initialize UXCam
      await UXCam.startWithKey(apiKey, defaultConfig);
      
      this.isInitialized = true;
      this.isEnabled = true;
      
      console.log('UXCam initialized successfully');
      
      // Set default user properties
      this.setDefaultUserProperties();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize UXCam:', error);
      return false;
    }
  }

  /**
   * Set default user properties based on device and app information
   */
  private setDefaultUserProperties(): void {
    try {
      const UXCam = require('react-native-uxcam');
      
      const defaultProperties: UserProperties = {
        userDevice: Platform.OS,
        userOS: Platform.OS === 'ios' ? 'iOS' : 'Android',
        appVersion: Constants.expoConfig?.version || '1.0.0',
      };

      Object.entries(defaultProperties).forEach(([key, value]) => {
        if (value) {
          UXCam.setUserProperty(key, value);
        }
      });
    } catch (error) {
      console.error('Failed to set default user properties:', error);
    }
  }

  /**
   * Set user identity and properties
   * @param user - User object containing user information
   */
  public setUser(user: any): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      
      this.currentUser = user;

      if (user?.id) {
        UXCam.setUserIdentity(user.id);
      }

      if (user?.email) {
        UXCam.setUserEmail(user.email);
      }

      // Set user properties
      const userProperties: UserProperties = {
        userId: user?.id,
        userRole: user?.role || user?.user_metadata?.role,
        userLevel: user?.user_metadata?.level,
        userLanguage: user?.user_metadata?.language || 'en',
      };

      Object.entries(userProperties).forEach(([key, value]) => {
        if (value) {
          UXCam.setUserProperty(key, value);
        }
      });

      console.log('UXCam user set successfully');
    } catch (error) {
      console.error('Failed to set UXCam user:', error);
    }
  }

  /**
   * Tag a screen for analytics
   * @param screenName - Name of the screen to tag
   */
  public tagScreenName(screenName: string): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      UXCam.tagScreenName(screenName);
      console.log(`UXCam screen tagged: ${screenName}`);
    } catch (error) {
      console.error('Failed to tag screen name:', error);
    }
  }

  /**
   * Add a custom event
   * @param eventName - Name of the event
   * @param properties - Optional properties for the event
   */
  public addEvent(eventName: string, properties?: Record<string, any>): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      UXCam.addScreenNameToIgnore(eventName);
      
      if (properties) {
        Object.entries(properties).forEach(([key, value]) => {
          UXCam.setUserProperty(key, value);
        });
      }

      console.log(`UXCam event added: ${eventName}`);
    } catch (error) {
      console.error('Failed to add UXCam event:', error);
    }
  }

  /**
   * Set user property
   * @param key - Property key
   * @param value - Property value
   */
  public setUserProperty(key: string, value: any): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      UXCam.setUserProperty(key, value);
      console.log(`UXCam user property set: ${key} = ${value}`);
    } catch (error) {
      console.error('Failed to set UXCam user property:', error);
    }
  }

  /**
   * Start a new session
   */
  public startNewSession(): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      UXCam.startNewSession();
      console.log('UXCam new session started');
    } catch (error) {
      console.error('Failed to start UXCam new session:', error);
    }
  }

  /**
   * Stop recording
   */
  public stopRecording(): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      UXCam.stopRecordingAndUploadData();
      this.isEnabled = false;
      console.log('UXCam recording stopped');
    } catch (error) {
      console.error('Failed to stop UXCam recording:', error);
    }
  }

  /**
   * Resume recording
   */
  public resumeRecording(): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      UXCam.resumeScreenRecording();
      this.isEnabled = true;
      console.log('UXCam recording resumed');
    } catch (error) {
      console.error('Failed to resume UXCam recording:', error);
    }
  }

  /**
   * Check if UXCam is enabled
   */
  public isRecordingEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Check if UXCam is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current user
   */
  public getCurrentUser(): any {
    return this.currentUser;
  }

  /**
   * Opt out of UXCam tracking
   */
  public optOut(): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      UXCam.optOutOverall();
      this.isEnabled = false;
      console.log('UXCam opt out completed');
    } catch (error) {
      console.error('Failed to opt out of UXCam:', error);
    }
  }

  /**
   * Opt in to UXCam tracking
   */
  public optIn(): void {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return;
      }

      const UXCam = require('react-native-uxcam');
      UXCam.optInOverall();
      this.isEnabled = true;
      console.log('UXCam opt in completed');
    } catch (error) {
      console.error('Failed to opt in to UXCam:', error);
    }
  }

  /**
   * Get session URL
   */
  public async getSessionUrl(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return null;
      }

      const UXCam = require('react-native-uxcam');
      const url = await UXCam.getSessionUrl();
      return url;
    } catch (error) {
      console.error('Failed to get UXCam session URL:', error);
      return null;
    }
  }

  /**
   * Check if user has opted out
   */
  public async isOptedOut(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn('UXCam not initialized. Call initialize() first.');
        return false;
      }

      const UXCam = require('react-native-uxcam');
      const isOptedOut = await UXCam.isOptedOutOverall();
      return isOptedOut;
    } catch (error) {
      console.error('Failed to check UXCam opt out status:', error);
      return false;
    }
  }
}

export default UXCamService;
export type { UXCamConfig, UserProperties };
