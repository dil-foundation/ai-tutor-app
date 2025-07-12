import { useState, useRef, useCallback } from 'react';
import { Audio, InterruptionModeIOS } from 'expo-av';
import { Platform } from 'react-native';

// Fix for Turbo module issues
const AudioModule = Audio as any;

interface AudioPlayerState {
  isPlaying: boolean;
  isLoaded: boolean;
  duration: number;
  position: number;
  error: string | null;
}

interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  loadAudio: (uri: string) => Promise<void>;
  playAudio: () => Promise<void>;
  pauseAudio: () => Promise<void>;
  stopAudio: () => Promise<void>;
  unloadAudio: () => Promise<void>;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoaded: false,
    duration: 0,
    position: 0,
    error: null,
  });

  const soundRef = useRef<Audio.Sound | null>(null);

  const loadAudio = useCallback(async (uri: string): Promise<void> => {
    console.log('🔄 useAudioPlayer: Loading audio from URI:', uri);
    try {
      // Unload any existing sound
      if (soundRef.current) {
        console.log('🔄 useAudioPlayer: Unloading existing sound...');
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Set audio mode for playback
      console.log('🔄 useAudioPlayer: Setting audio mode for playback...');
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });
      console.log('✅ useAudioPlayer: Audio mode set successfully');

      // Load the audio file
      console.log('🔄 useAudioPlayer: Creating sound from URI...');
      const { sound } = await AudioModule.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (status: any) => {
          if (status.isLoaded) {
            console.log('📊 useAudioPlayer: Status update:', {
              isLoaded: status.isLoaded,
              isPlaying: status.isPlaying,
              durationMillis: status.durationMillis,
              positionMillis: status.positionMillis,
              didJustFinish: status.didJustFinish,
            });
            
            setState(prev => ({
              ...prev,
              isLoaded: true,
              duration: status.durationMillis || 0,
              position: status.positionMillis || 0,
              isPlaying: status.isPlaying || false,
            }));
          } else if ('error' in status) {
            console.error('❌ useAudioPlayer: Status error:', status.error);
          }
        }
      );

      soundRef.current = sound;
      console.log('✅ useAudioPlayer: Sound created successfully');

      setState(prev => ({
        ...prev,
        isLoaded: true,
        error: null,
      }));
      console.log('✅ useAudioPlayer: State updated - audio loaded');

    } catch (error) {
      console.error('❌ useAudioPlayer: Error loading audio:', error);
      console.error('❌ useAudioPlayer: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      setState(prev => ({
        ...prev,
        error: 'Failed to load audio',
        isLoaded: false,
      }));
    }
  }, []);

  const playAudio = useCallback(async (): Promise<void> => {
    console.log('🔄 useAudioPlayer: Starting audio playback...');
    try {
      if (!soundRef.current) {
        console.error('❌ useAudioPlayer: No audio loaded');
        throw new Error('No audio loaded');
      }

      console.log('🔄 useAudioPlayer: Playing audio...');
      await soundRef.current.playAsync();
      console.log('✅ useAudioPlayer: Audio playback started');
      setState(prev => ({ ...prev, isPlaying: true, error: null }));

    } catch (error) {
      console.error('❌ useAudioPlayer: Error playing audio:', error);
      console.error('❌ useAudioPlayer: Playback error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      setState(prev => ({ ...prev, error: 'Failed to play audio' }));
    }
  }, []);

  const pauseAudio = useCallback(async (): Promise<void> => {
    console.log('🔄 useAudioPlayer: Pausing audio...');
    try {
      if (!soundRef.current) {
        console.log('⚠️ useAudioPlayer: No sound to pause');
        return;
      }

      await soundRef.current.pauseAsync();
      console.log('✅ useAudioPlayer: Audio paused');
      setState(prev => ({ ...prev, isPlaying: false }));

    } catch (error) {
      console.error('❌ useAudioPlayer: Error pausing audio:', error);
    }
  }, []);

  const stopAudio = useCallback(async (): Promise<void> => {
    console.log('🔄 useAudioPlayer: Stopping audio...');
    try {
      if (!soundRef.current) {
        console.log('⚠️ useAudioPlayer: No sound to stop');
        return;
      }

      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      console.log('✅ useAudioPlayer: Audio stopped');
      setState(prev => ({ ...prev, isPlaying: false, position: 0 }));

    } catch (error) {
      console.error('❌ useAudioPlayer: Error stopping audio:', error);
    }
  }, []);

  const unloadAudio = useCallback(async (): Promise<void> => {
    console.log('🔄 useAudioPlayer: Unloading audio...');
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        console.log('✅ useAudioPlayer: Audio unloaded');
      }

      setState({
        isPlaying: false,
        isLoaded: false,
        duration: 0,
        position: 0,
        error: null,
      });
      console.log('✅ useAudioPlayer: State reset');

    } catch (error) {
      console.error('❌ useAudioPlayer: Error unloading audio:', error);
    }
  }, []);

  return {
    state,
    loadAudio,
    playAudio,
    pauseAudio,
    stopAudio,
    unloadAudio,
  };
}; 