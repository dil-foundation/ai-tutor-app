import { useCallback, useRef, useState } from 'react';

// Import Audio with error handling for Turbo module issues
let Audio: any = null;
let InterruptionModeIOS: any = null;
let isAudioAvailable = false;

try {
  const expoAv = require('expo-av');
  if (expoAv && expoAv.Audio) {
    Audio = expoAv.Audio;
    InterruptionModeIOS = expoAv.InterruptionModeIOS;
    isAudioAvailable = true;
    console.log('✅ [Audio] expo-av loaded successfully');
  } else {
    throw new Error('expo-av module structure invalid');
  }
} catch (error) {
  console.error('❌ [Audio] Failed to load expo-av:', error);
  console.warn('⚠️ [Audio] Audio functionality will be disabled');
  isAudioAvailable = false;
}

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

export const useAudioPlayerFixed = (): UseAudioPlayerReturn => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoaded: false,
    duration: 0,
    position: 0,
    error: null,
  });

  const soundRef = useRef<any>(null);

  const loadAudio = useCallback(async (uri: string): Promise<void> => {
    console.log('🔄 useAudioPlayerFixed: Loading audio from URI:', uri);
    
    if (!Audio) {
      console.error('❌ useAudioPlayerFixed: Audio module not available');
      setState(prev => ({
        ...prev,
        error: 'Audio module not available',
        isLoaded: false,
      }));
      return;
    }

    try {
      // Unload any existing sound
      if (soundRef.current) {
        console.log('🔄 useAudioPlayerFixed: Unloading existing sound...');
        try {
          await soundRef.current.unloadAsync();
        } catch (e) {
          console.log('⚠️ useAudioPlayerFixed: Error unloading existing sound:', e);
        }
        soundRef.current = null;
      }

      // Set audio mode for playback
      console.log('🔄 useAudioPlayerFixed: Setting audio mode for playback...');
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS?.DoNotMix || 1,
        });
        console.log('✅ useAudioPlayerFixed: Audio mode set successfully');
      } catch (e) {
        console.log('⚠️ useAudioPlayerFixed: Error setting audio mode:', e);
      }

      // Load the audio file
      console.log('🔄 useAudioPlayerFixed: Creating sound from URI...');
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (status: any) => {
          if (status.isLoaded) {
            console.log('📊 useAudioPlayerFixed: Status update:', {
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
            console.error('❌ useAudioPlayerFixed: Status error:', status.error);
          }
        }
      );

      soundRef.current = sound;
      console.log('✅ useAudioPlayerFixed: Sound created successfully');

      setState(prev => ({
        ...prev,
        isLoaded: true,
        error: null,
      }));
      console.log('✅ useAudioPlayerFixed: State updated - audio loaded');

    } catch (error) {
      console.error('❌ useAudioPlayerFixed: Error loading audio:', error);
      console.error('❌ useAudioPlayerFixed: Error details:', {
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
    console.log('🔄 useAudioPlayerFixed: Starting audio playback...');
    try {
      if (!soundRef.current) {
        console.error('❌ useAudioPlayerFixed: No audio loaded');
        throw new Error('No audio loaded');
      }

      console.log('🔄 useAudioPlayerFixed: Playing audio...');
      await soundRef.current.playAsync();
      console.log('✅ useAudioPlayerFixed: Audio playback started');
      setState(prev => ({ ...prev, isPlaying: true, error: null }));

    } catch (error) {
      console.error('❌ useAudioPlayerFixed: Error playing audio:', error);
      console.error('❌ useAudioPlayerFixed: Playback error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      setState(prev => ({ ...prev, error: 'Failed to play audio' }));
    }
  }, []);

  const pauseAudio = useCallback(async (): Promise<void> => {
    console.log('🔄 useAudioPlayerFixed: Pausing audio...');
    try {
      if (!soundRef.current) {
        console.log('⚠️ useAudioPlayerFixed: No sound to pause');
        return;
      }

      await soundRef.current.pauseAsync();
      console.log('✅ useAudioPlayerFixed: Audio paused');
      setState(prev => ({ ...prev, isPlaying: false }));

    } catch (error) {
      console.error('❌ useAudioPlayerFixed: Error pausing audio:', error);
    }
  }, []);

  const stopAudio = useCallback(async (): Promise<void> => {
    console.log('🔄 useAudioPlayerFixed: Stopping audio...');
    try {
      if (!soundRef.current) {
        console.log('⚠️ useAudioPlayerFixed: No sound to stop');
        return;
      }

      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      console.log('✅ useAudioPlayerFixed: Audio stopped');
      setState(prev => ({ ...prev, isPlaying: false, position: 0 }));

    } catch (error) {
      console.error('❌ useAudioPlayerFixed: Error stopping audio:', error);
    }
  }, []);

  const unloadAudio = useCallback(async (): Promise<void> => {
    console.log('🔄 useAudioPlayerFixed: Unloading audio...');
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        console.log('✅ useAudioPlayerFixed: Audio unloaded');
      }

      setState({
        isPlaying: false,
        isLoaded: false,
        duration: 0,
        position: 0,
        error: null,
      });
      console.log('✅ useAudioPlayerFixed: State reset');

    } catch (error) {
      console.error('❌ useAudioPlayerFixed: Error unloading audio:', error);
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