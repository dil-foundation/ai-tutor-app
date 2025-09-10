declare module 'react-native-ux-cam' {
  const UXCam: {
    startWithKey: (apiKey: string) => Promise<void>;
    startNewSession: () => Promise<void>;
    stopSessionAndUploadData: () => Promise<void>;
    setUserIdentity: (userId: string) => void;
    setUserProperty: (key: string, value: string) => void;
    logEvent: (eventName: string, properties?: Record<string, any>) => void;
    addScreenNameToIgnore: (screenName: string) => void;
    removeScreenNameToIgnore: (screenName: string) => void;
    getSessionUrl: () => Promise<string>;
    isRecording: () => Promise<boolean>;
    pauseScreenRecording: () => Promise<void>;
    resumeScreenRecording: () => Promise<void>;
    optOutOverall: () => Promise<void>;
    optIntoSchematicRecordings: () => Promise<void>;
    setAutomaticScreenNameTagging: (enabled: boolean) => void;
    setRecordingQuality: (quality: string) => void;
    setFrameRate: (frameRate: number) => void;
    setMinimumSessionDuration: (duration: number) => void;
    setMaximumSessionDuration: (duration: number) => void;
  };
  export default UXCam;
}
