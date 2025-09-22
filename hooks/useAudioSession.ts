import { useEffect } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Platform } from 'react-native';

type AudioMode = 'play' | 'record';

export const useAudioSession = (mode: AudioMode) => {
  useEffect(() => {
    const configureAudioSession = async () => {
      console.log(`[useAudioSession] Configuring audio session for '${mode}' mode.`);
      try {
        if (Platform.OS === 'ios') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: mode === 'record',
            playsInSilentModeIOS: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: false,
          });
        } else { // Android
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: false,
          });
        }
        console.log(`[useAudioSession] Audio session configured successfully for '${mode}'.`);
      } catch (error) {
        console.error('[useAudioSession] Failed to set audio mode:', error);
      }
    };

    configureAudioSession();

    // Cleanup function to reset the audio mode when the component unmounts
    return () => {
      const resetAudioSession = async () => {
        console.log('[useAudioSession] Resetting audio session.');
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: false,
          });
        } catch (error) {
          console.error('[useAudioSession] Failed to reset audio mode:', error);
        }
      };
      resetAudioSession();
    };
  }, [mode]);
};
