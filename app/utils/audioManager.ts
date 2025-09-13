import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class AudioManager {
  private static instance: AudioManager;
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;
  private currentAudioId: string | null = null;
  private isInitialized = false;

  private constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      // Request audio permissions on iOS
      if (Platform.OS === 'ios') {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Audio permission not granted on iOS');
        }
      }
      
      // Set audio mode for better iOS compatibility
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      this.isInitialized = true;
      console.log('AudioManager initialized successfully');
    } catch (error) {
      console.error('AudioManager initialization failed:', error);
      this.isInitialized = true; // Mark as initialized to prevent retry loops
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async playAudio(audioId: string, uri: string, options?: any): Promise<boolean> {
    // Wait for initialization if not ready
    if (!this.isInitialized) {
      console.log('AudioManager not initialized yet, waiting...');
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!this.isInitialized) {
        console.error('AudioManager initialization timeout');
        return false;
      }
    }

    // Validate inputs
    if (!audioId || !uri) {
      console.error('Invalid audio parameters:', { audioId, uri });
      return false;
    }

    // If the same audio is already playing, don't start it again
    if (this.isPlaying && this.currentAudioId === audioId) {
      console.log(`Audio ${audioId} is already playing, skipping...`);
      return false;
    }

    // If a different audio is playing, stop it first
    if (this.isPlaying && this.currentAudioId !== audioId) {
      await this.stopCurrentAudio();
    }

    try {
      console.log(`Starting audio: ${audioId}`);
      
      // Clean up any existing sound
      if (this.currentSound) {
        const existingSound = this.currentSound;
        this.currentSound = null; // Clear reference first to prevent race conditions
        try {
          await existingSound.unloadAsync();
        } catch (unloadError) {
          console.warn('Error unloading existing sound:', unloadError);
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, ...options }
      );

      this.currentSound = sound;
      this.isPlaying = true;
      this.currentAudioId = audioId;

      // Set up status update handler with error protection
      sound.setOnPlaybackStatusUpdate((status) => {
        try {
          if (status.isLoaded && status.didJustFinish) {
            console.log(`Audio ${audioId} finished`);
            this.isPlaying = false;
            this.currentAudioId = null;
            this.currentSound = null;
          } else if (!status.isLoaded && 'error' in status) {
            console.error(`Audio ${audioId} error:`, status.error);
            this.isPlaying = false;
            this.currentAudioId = null;
            this.currentSound = null;
          }
        } catch (statusError) {
          console.error('Error in playback status handler:', statusError);
        }
      });

      await sound.playAsync();
      return true;
    } catch (error) {
      console.error(`Error playing audio ${audioId}:`, error);
      this.isPlaying = false;
      this.currentAudioId = null;
      this.currentSound = null;
      return false;
    }
  }

  async stopCurrentAudio(): Promise<void> {
    if (this.currentSound && this.isPlaying) {
      try {
        const currentSound = this.currentSound;
        this.currentSound = null; // Clear reference first to prevent race conditions
        
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch (error) {
        console.error('Error stopping current audio:', error);
      }
    }
    this.currentSound = null;
    this.isPlaying = false;
    this.currentAudioId = null;
  }

  isAudioPlaying(audioId?: string): boolean {
    if (audioId) {
      return this.isPlaying && this.currentAudioId === audioId;
    }
    return this.isPlaying;
  }

  getCurrentAudioId(): string | null {
    return this.currentAudioId;
  }
}

export default AudioManager.getInstance(); 