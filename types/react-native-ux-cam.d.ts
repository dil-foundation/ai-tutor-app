declare module 'react-native-ux-cam' {
  interface UXCam {
    startWithKey(appKey: string): Promise<void>;
    setAutomaticScreenNameTagging(enabled: boolean): void;
    setCrashReportingEnabled(enabled: boolean): void;
    setMultiSessionRecordings(enabled: boolean): void;
    setGestureRecognitionEnabled(enabled: boolean): void;
    setSmartOptionsEnabled(enabled: boolean): void;
    setUserIdentity(userId: string): void;
    setUserProperty(key: string, value: any): void;
    logEvent(eventName: string, properties?: Record<string, any>): void;
    occludeSensitiveScreen(occlude: boolean): void;
    addScreenNameToIgnore(screenName: string): void;
    removeScreenNameFromIgnore(screenName: string): void;
    getCurrentSessionURL(): Promise<string | null>;
    isRecording(): Promise<boolean>;
    stopAndUploadRecording(): Promise<void>;
    optIntoSchematicRecordings(): void;
    optOutOfSchematicRecordings(): void;
    isOptedIntoSchematicRecordings(): Promise<boolean>;
    setDebugLogsEnabled(enabled: boolean): void;
  }

  const UXCam: UXCam;
  export default UXCam;
}
