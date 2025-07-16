import { useState, useRef, useCallback } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import CHATGPT_TIMING_CONFIG, { getSilenceDuration, logTimingInfo } from '../utils/chatgptTimingConfig';

interface AudioRecorderState {
  isRecording: boolean;
  isListening: boolean;
  isVoiceDetected: boolean;
  recordingDuration: number;
  audioUri: string | null;
  error: string | null;
}

interface UseAudioRecorderOptions {
  maxDuration?: number;
  onAutoStop?: (audioUri: string | null) => void;
}

interface UseAudioRecorderReturn {
  state: AudioRecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  resetRecording: () => void;
  requestPermissions: () => Promise<boolean>;
}

export const useAudioRecorder = (maxDuration: number = 5000, onAutoStop?: (audioUri: string | null) => void): UseAudioRecorderReturn => {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isListening: false,
    isVoiceDetected: false,
    recordingDuration: 0,
    audioUri: null,
    error: null,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const isAutoStoppingRef = useRef(false);
  const isRecordingRef = useRef(false);
  
  // Voice Activity Detection settings - from ChatGPT timing config
  const VAD_THRESHOLD = CHATGPT_TIMING_CONFIG.VAD_THRESHOLD;
  
  // Use ChatGPT-optimized timing constants
  const SILENCE_DURATION = CHATGPT_TIMING_CONFIG.POST_SPEECH_SILENCE_DURATION;
  const MIN_SPEECH_DURATION = CHATGPT_TIMING_CONFIG.MIN_SPEECH_DURATION;

  const resetRecording = useCallback(() => {
    setState({
      isRecording: false,
      isListening: false,
      isVoiceDetected: false,
      recordingDuration: 0,
      audioUri: null,
      error: null,
    });
    
    // Clear timers
    if (durationTimerRef.current) {
      clearTimeout(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    startTimeRef.current = null;
    speechStartTimeRef.current = null;
    isAutoStoppingRef.current = false;
    isRecordingRef.current = false;
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const permission = await Audio.getPermissionsAsync();
      if (!permission.granted) {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Microphone access is needed to record audio.'
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      // Request permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setState(prev => ({ ...prev, error: 'Permission denied' }));
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });

      // Stop any existing recording
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      // Reset state
      resetRecording();
      startTimeRef.current = Date.now();
      speechStartTimeRef.current = null;
      isAutoStoppingRef.current = false;
      isRecordingRef.current = true;

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        },
        (status) => {
          if (status.metering != null && status.isRecording) {
            const currentTime = Date.now();
            
            // Voice Activity Detection
            if (status.metering > VAD_THRESHOLD) {
              // Voice detected
              if (speechStartTimeRef.current === null) {
                speechStartTimeRef.current = currentTime;
              }

              if (!state.isVoiceDetected) {
                setState(prev => ({ 
                  ...prev, 
                  isVoiceDetected: true,
                  isListening: false,
                }));
              }

              // Reset silence timer with ChatGPT-optimized timing
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
              }
              
              // Use helper function to get appropriate silence duration
              const silenceTimeout = getSilenceDuration(!!speechStartTimeRef.current);
              const timingType = speechStartTimeRef.current ? 'post-speech' : 'initial';
              
              logTimingInfo('AudioRecorder', silenceTimeout, timingType);
              
              silenceTimerRef.current = setTimeout(() => {
                console.log(`🎯 Voice activity silence timer fired after ${silenceTimeout}ms!`, {
                  isRecordingRef: isRecordingRef.current,
                  isAutoStoppingRef: isAutoStoppingRef.current
                });
                if (isRecordingRef.current && !isAutoStoppingRef.current) {
                  console.log('🔄 Auto-stopping recording due to silence...');
                  isAutoStoppingRef.current = true;
                  stopRecording().then(audioUri => {
                    console.log('🔄 Voice activity silence stopRecording completed, calling onAutoStop...');
                    onAutoStop?.(audioUri);
                  });
                } else {
                  console.log('⚠️ Voice activity silence timer fired but conditions not met for auto-stop');
                }
              }, silenceTimeout);
            } else {
              // No voice detected
              if (state.isVoiceDetected) {
                setState(prev => ({ 
                  ...prev, 
                  isVoiceDetected: false,
                  isListening: true,
                }));
              }
            }
          }
        },
        200 // Update interval
      );

      recordingRef.current = recording;

      // Set recording state
      setState(prev => ({
        ...prev,
        isRecording: true,
        isListening: true,
        error: null,
      }));

      // Start duration timer for max duration
      durationTimerRef.current = setTimeout(() => {
        console.log('⏰ Max duration timer fired!', {
          isRecordingRef: isRecordingRef.current,
          isAutoStoppingRef: isAutoStoppingRef.current,
          maxDuration: maxDuration
        });
        if (isRecordingRef.current && !isAutoStoppingRef.current) {
          console.log('🔄 Auto-stopping recording due to max duration...');
          isAutoStoppingRef.current = true;
          stopRecording().then(audioUri => {
            console.log('🔄 Max duration stopRecording completed, calling onAutoStop...');
            onAutoStop?.(audioUri);
          });
        } else {
          console.log('⚠️ Max duration timer fired but conditions not met for auto-stop');
        }
      }, maxDuration);

      // Start initial silence timer with ChatGPT timing
      const initialSilenceDuration = CHATGPT_TIMING_CONFIG.INITIAL_SILENCE_DURATION;
      logTimingInfo('AudioRecorder', initialSilenceDuration, 'initial');
      
      silenceTimerRef.current = setTimeout(() => {
        console.log(`🎯 Initial silence timer fired after ${initialSilenceDuration}ms!`, {
          isRecordingRef: isRecordingRef.current,
          isAutoStoppingRef: isAutoStoppingRef.current,
          silenceDuration: initialSilenceDuration
        });
        if (isRecordingRef.current && !isAutoStoppingRef.current) {
          console.log('🔄 Auto-stopping recording due to initial silence...');
          isAutoStoppingRef.current = true;
          stopRecording().then(audioUri => {
            console.log('🔄 Initial silence stopRecording completed, calling onAutoStop...');
            onAutoStop?.(audioUri);
          });
        } else {
          console.log('⚠️ Initial silence timer fired but conditions not met for auto-stop');
        }
      }, CHATGPT_TIMING_CONFIG.INITIAL_SILENCE_DURATION);

    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start recording',
        isRecording: false,
        isListening: false,
      }));
      isRecordingRef.current = false;
    }
  }, [state.isVoiceDetected, maxDuration, VAD_THRESHOLD, SILENCE_DURATION, requestPermissions, resetRecording, onAutoStop]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!recordingRef.current) {
      return null;
    }

    try {
      // Clear timers
      if (durationTimerRef.current) {
        clearTimeout(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Calculate duration
      const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const speechDuration = speechStartTimeRef.current ? Date.now() - speechStartTimeRef.current : 0;

      // Check if we have valid speech
      const hasValidSpeech = speechStartTimeRef.current && speechDuration >= MIN_SPEECH_DURATION;

      setState(prev => ({
        ...prev,
        isRecording: false,
        isListening: false,
        isVoiceDetected: false,
        recordingDuration: duration,
        audioUri: hasValidSpeech ? uri : null,
        error: hasValidSpeech ? null : 'No speech detected',
      }));

      isRecordingRef.current = false;

      return hasValidSpeech ? uri : null;

    } catch (error) {
      console.error('Error stopping recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to stop recording',
        isRecording: false,
        isListening: false,
        isVoiceDetected: false,
      }));
      isRecordingRef.current = false;
      return null;
    }
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermissions,
  };
}; 