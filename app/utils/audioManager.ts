import { Audio } from 'expo-av';

class AudioManager {
  private static instance: AudioManager;
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;
  private currentAudioId: string | null = null;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async playAudio(audioId: string, uri: string, options?: any): Promise<boolean> {
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
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, ...options }
      );

      this.currentSound = sound;
      this.isPlaying = true;
      this.currentAudioId = audioId;

      // Set up status update handler
      sound.setOnPlaybackStatusUpdate((status) => {
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
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
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