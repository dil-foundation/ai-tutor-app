// UXCam Configuration
export const UXCAM_CONFIG = {
  // Replace with your actual UXCam App Key
  APP_KEY: 'xnayvk2m8m2h8xw-us',
  
  // Enable/disable features
  ENABLE_AUTOMATIC_SCREEN_NAME_TRACKING: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_MULTI_SESSION_RECORDING: true,
  
  // Privacy settings
  ENABLE_OPT_IN_ANALYTICS: true,
  ENABLE_OPT_OUT_OVERALL: false,
  
  // Recording settings
  ENABLE_GESTURE_RECOGNITION: true,
  ENABLE_SMART_OPTIONS: true,
  
  // Custom properties
  DEFAULT_PROPERTIES: {
    app_version: '1.0.0',
    platform: 'react-native',
  }
};

// UXCam Service Class
export class UXCamService {
  private static instance: UXCamService;
  private isInitialized = false;
  private UXCam: any = null;
  private isDevelopment = __DEV__;

  private constructor() {}

  static getInstance(): UXCamService {
    if (!UXCamService.instance) {
      UXCamService.instance = new UXCamService();
    }
    return UXCamService.instance;
  }

  /**
   * Initialize UXCam with configuration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('UXCam already initialized');
      return;
    }

    // In development mode, just log that UXCam would be initialized
    if (this.isDevelopment) {
      console.log('UXCam would be initialized in production with key:', UXCAM_CONFIG.APP_KEY);
      this.isInitialized = true;
      return;
    }

    try {
      // Only import UXCam in production builds
      const UXCamModule = await import('react-native-ux-cam');
      this.UXCam = UXCamModule.default;
      
      if (!this.UXCam) {
        console.warn('UXCam module not available, skipping initialization');
        return;
      }

      // Configure UXCam
      this.UXCam.setAutomaticScreenNameTagging(UXCAM_CONFIG.ENABLE_AUTOMATIC_SCREEN_NAME_TRACKING);
      this.UXCam.setCrashReportingEnabled(UXCAM_CONFIG.ENABLE_CRASH_REPORTING);
      this.UXCam.setMultiSessionRecordings(UXCAM_CONFIG.ENABLE_MULTI_SESSION_RECORDING);
      this.UXCam.setGestureRecognitionEnabled(UXCAM_CONFIG.ENABLE_GESTURE_RECOGNITION);
      this.UXCam.setSmartOptionsEnabled(UXCAM_CONFIG.ENABLE_SMART_OPTIONS);

      // Set default properties
      this.UXCam.setUserProperty('app_version', UXCAM_CONFIG.DEFAULT_PROPERTIES.app_version);
      this.UXCam.setUserProperty('platform', UXCAM_CONFIG.DEFAULT_PROPERTIES.platform);

      // Start UXCam
      await this.UXCam.startWithKey(UXCAM_CONFIG.APP_KEY);
      
      this.isInitialized = true;
      console.log('UXCam initialized successfully');
    } catch (error) {
      console.error('Failed to initialize UXCam:', error);
      console.warn('UXCam initialization failed, continuing without analytics');
    }
  }

  /**
   * Set user identity
   */
  setUserIdentity(userId: string, userProperties?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.log('UXCam: Set user identity:', userId, userProperties);
      return;
    }

    try {
      if (!this.UXCam) return;
      
      this.UXCam.setUserIdentity(userId);
      
      if (userProperties) {
        Object.entries(userProperties).forEach(([key, value]) => {
          this.UXCam.setUserProperty(key, value);
        });
      }
      
      console.log('UXCam user identity set:', userId);
    } catch (error) {
      console.error('Failed to set UXCam user identity:', error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperty(key: string, value: any): void {
    if (this.isDevelopment) {
      console.log('UXCam: Set property:', key, value);
      return;
    }

    try {
      if (!this.UXCam) return;
      
      this.UXCam.setUserProperty(key, value);
      console.log('UXCam property set:', key, value);
    } catch (error) {
      console.error('Failed to set UXCam property:', error);
    }
  }

  /**
   * Track custom events
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.log('UXCam: Track event:', eventName, properties);
      return;
    }

    try {
      if (!this.UXCam) return;
      
      if (properties) {
        this.UXCam.logEvent(eventName, properties);
      } else {
        this.UXCam.logEvent(eventName);
      }
      console.log('UXCam event tracked:', eventName, properties);
    } catch (error) {
      console.error('Failed to track UXCam event:', error);
    }
  }

  /**
   * Mark screen as sensitive (exclude from recording)
   */
  markScreenAsSensitive(): void {
    if (this.isDevelopment) {
      console.log('UXCam: Mark screen as sensitive');
      return;
    }

    try {
      if (!this.UXCam) return;
      
      this.UXCam.occludeSensitiveScreen(true);
      console.log('Screen marked as sensitive');
    } catch (error) {
      console.error('Failed to mark screen as sensitive:', error);
    }
  }

  /**
   * Unmark screen as sensitive
   */
  unmarkScreenAsSensitive(): void {
    if (this.isDevelopment) {
      console.log('UXCam: Unmark screen as sensitive');
      return;
    }

    try {
      if (!this.UXCam) return;
      
      this.UXCam.occludeSensitiveScreen(false);
      console.log('Screen unmarked as sensitive');
    } catch (error) {
      console.error('Failed to unmark screen as sensitive:', error);
    }
  }

  /**
   * Add screen name to ignore list
   */
  addScreenNameToIgnore(screenName: string): void {
    if (this.isDevelopment) {
      console.log('UXCam: Add screen to ignore:', screenName);
      return;
    }

    try {
      if (!this.UXCam) return;
      
      this.UXCam.addScreenNameToIgnore(screenName);
      console.log('Screen added to ignore list:', screenName);
    } catch (error) {
      console.error('Failed to add screen to ignore list:', error);
    }
  }

  /**
   * Remove screen name from ignore list
   */
  removeScreenNameFromIgnore(screenName: string): void {
    if (this.isDevelopment) {
      console.log('UXCam: Remove screen from ignore:', screenName);
      return;
    }

    try {
      if (!this.UXCam) return;
      
      this.UXCam.removeScreenNameFromIgnore(screenName);
      console.log('Screen removed from ignore list:', screenName);
    } catch (error) {
      console.error('Failed to remove screen from ignore list:', error);
    }
  }

  /**
   * Get current session URL
   */
  async getCurrentSessionURL(): Promise<string | null> {
    if (this.isDevelopment) {
      console.log('UXCam: Get session URL (development mode)');
      return 'https://app.uxcam.com/session/dev-mode';
    }

    try {
      if (!this.UXCam) return null;
      
      return await this.UXCam.getCurrentSessionURL();
    } catch (error) {
      console.error('Failed to get current session URL:', error);
      return null;
    }
  }

  /**
   * Check if UXCam is recording
   */
  async isRecording(): Promise<boolean> {
    if (this.isDevelopment) {
      console.log('UXCam: Check recording status (development mode)');
      return false;
    }

    try {
      if (!this.UXCam) return false;
      
      return await this.UXCam.isRecording();
    } catch (error) {
      console.error('Failed to check recording status:', error);
      return false;
    }
  }

  /**
   * Stop recording and upload
   */
  async stopAndUploadRecording(): Promise<void> {
    if (this.isDevelopment) {
      console.log('UXCam: Stop and upload recording (development mode)');
      return;
    }

    try {
      if (!this.UXCam) return;
      
      await this.UXCam.stopAndUploadRecording();
      console.log('Recording stopped and uploaded');
    } catch (error) {
      console.error('Failed to stop and upload recording:', error);
    }
  }

  /**
   * Opt user into analytics
   */
  optIntoSchematicRecordings(): void {
    if (this.isDevelopment) {
      console.log('UXCam: Opt into analytics (development mode)');
      return;
    }

    try {
      if (!this.UXCam) return;
      
      this.UXCam.optIntoSchematicRecordings();
      console.log('User opted into analytics');
    } catch (error) {
      console.error('Failed to opt into analytics:', error);
    }
  }

  /**
   * Opt user out of analytics
   */
  optOutOfSchematicRecordings(): void {
    if (this.isDevelopment) {
      console.log('UXCam: Opt out of analytics (development mode)');
      return;
    }

    try {
      if (!this.UXCam) return;
      
      this.UXCam.optOutOfSchematicRecordings();
      console.log('User opted out of analytics');
    } catch (error) {
      console.error('Failed to opt out of analytics:', error);
    }
  }

  /**
   * Check if user has opted into analytics
   */
  async isOptedIntoSchematicRecordings(): Promise<boolean> {
    if (this.isDevelopment) {
      console.log('UXCam: Check opt-in status (development mode)');
      return true;
    }

    try {
      if (!this.UXCam) return false;
      
      return await this.UXCam.isOptedIntoSchematicRecordings();
    } catch (error) {
      console.error('Failed to check opt-in status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const uxcamService = UXCamService.getInstance();
