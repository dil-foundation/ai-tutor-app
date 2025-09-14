import BASE_API_URL from '../config/api';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

interface UseContinuousListeningOptions {
  onTranscriptionUpdate?: (text: string) => void;
  onTranslationComplete?: (englishText: string, audioBlob: Blob) => void;
  onError?: (error: string) => void;
  autoProcess?: boolean; // Whether to automatically process audio chunks
  chunkDuration?: number; // Duration of each audio chunk in milliseconds
}

interface UseContinuousListeningReturn {
  isListening: boolean;
  isProcessing: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  reset: () => void;
  currentTranscription: string;
  error: string | null;
}

// Utility function to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(blob);
  });
};

export default function useContinuousListening({
  onTranscriptionUpdate,
  onTranslationComplete,
  onError,
  autoProcess = true,
  chunkDuration = 3000, // 3 seconds per chunk
}: UseContinuousListeningOptions = {}): UseContinuousListeningReturn {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioChunksRef = useRef<string[]>([]);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const requestAudioPermissions = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.error('Failed to request audio permissions', err);
      return false;
    }
  }, []);

  const processAudioChunk = useCallback(async (audioUri: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Upload and translate audio
      const formData = new FormData();
      let fileName;

      if (Platform.OS === 'web') {
        fileName = `chunk-${Date.now()}.webm`;
        const audioBlob = await fetch(audioUri).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch blob: ${res.status}`);
          return res.blob();
        });
        formData.append('file', audioBlob, fileName);
      } else {
        fileName = `chunk-${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`;
        const mimeType = `audio/${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`;
        formData.append('file', {
          uri: audioUri,
          name: fileName,
          type: mimeType,
        } as any);
      }

      const response = await fetch(`${BASE_API_URL}/api/translate/speak/audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Translation API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      
      // Transcribe the translated audio
      const audioBase64 = await blobToBase64(audioBlob);
      const transcriptionPayload = {
        audio_base64: audioBase64,
        filename: `english-chunk-${Date.now()}.wav`,
        content_type: audioBlob.type || 'audio/wav'
      };

      const transcriptionResponse = await fetch(`${BASE_API_URL}/api/translate/transcribe-audio-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(transcriptionPayload),
      });

      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text();
        throw new Error(`Transcription API error: ${transcriptionResponse.status} - ${errorText}`);
      }

      const transcriptionData = await transcriptionResponse.json();
      
      if (transcriptionData && typeof transcriptionData.transcribed_text === 'string') {
        const newText = transcriptionData.transcribed_text;
        setCurrentTranscription(prev => prev + (prev ? ' ' : '') + newText);
        onTranscriptionUpdate?.(newText);
        onTranslationComplete?.(newText, audioBlob);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process audio chunk';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Error processing audio chunk:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscriptionUpdate, onTranslationComplete, onError]);

  const startListening = useCallback(async () => {
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      const errorMsg = 'Audio permission is required to speak.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('Starting continuous recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsListening(true);
      setError(null);
      audioChunksRef.current = [];

      // Start processing chunks if autoProcess is enabled
      if (autoProcess) {
        const processAndContinue = async () => {
          if (!recordingRef.current || !isListeningRef.current) return;

          try {
            // Stop current recording to get the URI
            await recordingRef.current.stopAndUnloadAsync();

            // Get URI and create a new recording instance to continue listening
            const uri = recordingRef.current.getURI();
            
            // Re-create recording to continue listening seamlessly
            const { recording: newRecording } = await Audio.Recording.createAsync(
              Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = newRecording;

            if (uri) {
              await processAudioChunk(uri);
            }
          } catch (err) {
            console.error('Error during chunk processing and continuation:', err);
          }

          // Schedule next chunk processing only if still listening
          if (isListeningRef.current) {
            processingTimeoutRef.current = setTimeout(processAndContinue, chunkDuration);
          }
        };

        processingTimeoutRef.current = setTimeout(processAndContinue, chunkDuration);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Could not start recording.';
      setError(errorMsg);
      onError?.(errorMsg);
      console.error('Failed to start recording', err);
    }
  }, [requestAudioPermissions, autoProcess, chunkDuration, processAudioChunk, onError]);

  const stopListening = useCallback(async () => {
    if (!recordingRef.current) return;
    
    // Set isListening to false immediately to stop processing loop
    setIsListening(false);
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    try {
      console.log('Stopping continuous recording...');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Process the final audio chunk
      if (uri) {
        await processAudioChunk(uri);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to stop recording.';
      setError(errorMsg);
      onError?.(errorMsg);
      console.error('Error stopping recording:', error);
    }
  }, [processAudioChunk, onError]);

  const reset = useCallback(() => {
    setCurrentTranscription('');
    setError(null);
    setIsProcessing(false);
    audioChunksRef.current = [];
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    reset,
    currentTranscription,
    error,
  };
} 