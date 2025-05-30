import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Icons (can be customized further or replaced with actual image assets if needed)
const BackIcon = () => <Ionicons name="arrow-back" size={24} color="#000" />;
const MicIcon = ({ color = "white" }) => <Ionicons name="mic" size={24} color={color} />;
const PlayIcon = () => <Ionicons name="play" size={20} color="#000" />;

type ScreenState = 'initial' | 'listening' | 'processing' | 'playback' | 'error';

export default function LearnScreen() {
  const router = useRouter();
  const [screenState, setScreenState] = useState<ScreenState>('initial');
  const [englishSentence, setEnglishSentence] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [englishAudioBlob, setEnglishAudioBlob] = useState<Blob | null>(null);
  const [originalAudioUri, setOriginalAudioUri] = useState<string | null>(null);

  // State for practice recording flow
  const [practiceActivityState, setPracticeActivityState] = useState<'idle' | 'recording_practice' | 'processing_practice'>('idle');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const practiceRecordingRef = useRef<Audio.Recording | null>(null);

  // --- Google Cloud Credentials (IMPORTANT SECURITY WARNING) ---
  // Directly embedding these in the client is a SEVERE security risk,
  // especially the private_key. In a production app, these calls
  // should be made from a secure backend server.
  // const googleCloudApiKey = 'YOUR_ACTUAL_API_KEY'; // No longer needed
  // const accessToken = "YOUR_SECURELY_OBTAINED_ACCESS_TOKEN"; // Placeholder - obtain securely // No longer needed
  // --- End of Security Warning ---

  useEffect(() => {
    // Clean up recording if component unmounts
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch((e: any) => console.error("Cleanup recording failed:", e));
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((e: any) => console.error("Cleanup sound failed:", e));
      }
      if (practiceRecordingRef.current) {
        practiceRecordingRef.current.stopAndUnloadAsync().catch((e: any) => console.error("Cleanup practice recording failed:", e));
      }
    };
  }, []);

  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.error('Failed to request audio permissions', err);
      return false;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      setErrorMessage('Audio permission is required to speak.');
      setScreenState('error');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      setEnglishSentence('');
      const { recording } = await Audio.Recording.createAsync(
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setScreenState('listening');
      console.log('Recording started');
    } catch (err: any) {
      console.error('Failed to start recording', err);
      setErrorMessage(err.message || 'Could not start recording.');
      setScreenState('error');
    }
  };

  const stopRecordingAndProcess = async () => {
    if (!recordingRef.current) {
      return;
    }
    console.log('Stopping recording..');
    setScreenState('processing');
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      console.log('Recording stopped and stored at', uri);
      if (uri) {
        setOriginalAudioUri(uri);
        await uploadAndTranslateAudio(uri);
      } else {
        throw new Error('Recording URI is null after stopping.');
      }
    } catch (error: any) {
      console.error('Error stopping recording or processing:', error);
      setErrorMessage(error.message || 'Failed to process audio. Please try again.');
      setScreenState('error');
    }
  };
  
  const uploadAndTranslateAudio = async (audioUri: string) => {
    console.log('Uploading audio for translation:', audioUri);
    setScreenState('processing');
    try {
      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(audioUri);
        if (!fileInfo.exists) {
          throw new Error("Recording file doesn't exist at: " + audioUri);
        }
      }

      const formData = new FormData();
      let fileName;

      if (Platform.OS === 'web') {
        fileName = `recording-${Date.now()}.webm`;
        console.log(`Web platform detected. Fetching blob from: ${audioUri}`);
        const audioBlob = await fetch(audioUri).then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch blob: ${res.status} ${res.statusText}`);
          }
          return res.blob();
        });
        console.log(`Blob fetched. Size: ${audioBlob.size}, Type: ${audioBlob.type}`);
        formData.append('file', audioBlob, fileName);
      } else {
        fileName = `recording-${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`;
        const mimeType = `audio/${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`;
        formData.append('file', {
          uri: audioUri,
          name: fileName,
          type: mimeType,
        } as any);
      }

      const response = await fetch('http://localhost:8000/api/translate/speak/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Translation API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      console.log('Translated audio received, type:', audioBlob.type);
      setEnglishAudioBlob(audioBlob);
      
      await transcribeEnglishAudioWithLocalAPI(audioBlob);

    } catch (error: any) {
      console.error('Error in uploadAndTranslateAudio:', error);
      setErrorMessage(error.message || 'Failed to translate audio.');
      setScreenState('error');
    }
  };

  const transcribeEnglishAudioWithLocalAPI = async (audioBlob: Blob) => {
    console.log('Transcribing English audio with local API...');
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, `english-audio-${Date.now()}.wav`); 

      const response = await fetch('http://localhost:8000/api/translate/transcribe-audio-direct', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Local Transcription API error response:', errorText);
        throw new Error(`Local Transcription API error: ${response.status} - ${errorText}`);
      }

      const transcriptionData = await response.json();
      console.log('Local Transcription API Response:', transcriptionData);

      if (transcriptionData && typeof transcriptionData.transcribed_text === 'string') {
        setEnglishSentence(transcriptionData.transcribed_text);
      } else {
        setEnglishSentence('Could not understand audio (local API), or no speech detected.');
      }
      setScreenState('playback');

    } catch (error: any) {
      console.error('Error in transcribeEnglishAudioWithLocalAPI:', error);
      setErrorMessage(error.message || 'Failed to transcribe with local API.');
      setScreenState('error');
    }
  };

  const playAudio = async (uri: string | null) => {
    if (soundRef.current) {
      console.log('Stopping and unloading previous sound...');
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.warn('Error stopping/unloading previous sound:', e);
      }
      soundRef.current = null;
    }

    if (uri) {
      try {
        console.log('Playing audio from URI:', uri);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );
        soundRef.current = sound;

        soundRef.current.setOnPlaybackStatusUpdate(async (status) => {
          if (!status.isLoaded) {
            if (status.error) {
              console.error(`Playback Error: ${status.error}`);
              setErrorMessage('Error playing audio: ' + status.error);
              try {
                await soundRef.current?.unloadAsync();
              } catch (e) { /* ignore */ }
              soundRef.current = null;
            }
          } else {
            if (status.didJustFinish) {
              console.log('Playback finished.');
              try {
                await soundRef.current?.unloadAsync();
              } catch (e) { /* ignore */ }
              soundRef.current = null;
            }
          }
        });
      } catch (error: any) {
        console.error('Failed to play audio:', error);
        setErrorMessage(error.message || 'Could not play the audio.');
        if (soundRef.current) {
            try {
                await soundRef.current.unloadAsync();
            } catch (e) { /* ignore */ }
            soundRef.current = null;
        }
      }
    }
  };

  const handleSpeakPress = async () => {
    setErrorMessage(''); // Clear previous errors at the beginning

    if (screenState === 'initial' || screenState === 'playback' || screenState === 'error') {
      // If we are starting a new session from playback or error, reset relevant states.
      if (screenState === 'playback' || screenState === 'error') {
        setEnglishSentence('');
        setEnglishAudioBlob(null);
        setOriginalAudioUri(null);
        // soundRef (for playback) is managed by playAudio or useEffect cleanup
        // Reset practice state as well when starting a new main cycle
        if (practiceRecordingRef.current) {
          console.log("handleSpeakPress: Unloading existing practiceRecordingRef due to new main cycle.");
          try {
            await practiceRecordingRef.current.stopAndUnloadAsync();
          } catch (e) { /* ignore */ }
          practiceRecordingRef.current = null;
        }
        setPracticeActivityState('idle');
      }

      // Explicitly ensure any previous recording is stopped and unloaded
      if (recordingRef.current) {
        console.log("handleSpeakPress: Unloading existing recordingRef before new recording.");
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (e) {
          console.warn("handleSpeakPress: Error unloading previous recordingRef", e);
        }
        recordingRef.current = null;
      }

      await startRecording(); // This will set screenState to 'listening'
    } else if (screenState === 'listening') {
      await stopRecordingAndProcess(); // This will set screenState to 'processing' -> 'playback'/'error'
    }
    // Unconditional state resets that were here previously have been removed or moved.
  };

  const handleReadAloudPress = () => {
    if (!englishSentence) {
        setErrorMessage("No English sentence to read.");
        setScreenState('error');
        return;
    }
    router.push({ pathname: '/(tabs)/learn/feedback', params: { urduSentence: '', englishSentence } });
  };
  
  const resetState = () => {
    if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch((e: any) => console.error("Error unloading previous rec:", e));
        recordingRef.current = null;
    }
    setScreenState('initial');
    setEnglishSentence('');
    setEnglishAudioBlob(null);
    setOriginalAudioUri(null);
    setErrorMessage('');
    // Reset practice state when the main state is reset
    if (practiceRecordingRef.current) {
        practiceRecordingRef.current.stopAndUnloadAsync().catch((e: any) => console.error("resetState: Error unloading practice rec:", e));
        practiceRecordingRef.current = null;
    }
    setPracticeActivityState('idle');
  }

  // --- Functions for Practice Recording Flow ---
  const startPracticeAudioRecording = async () => {
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      setErrorMessage('Audio permission is required to practice.');
      // Potentially set screenState to 'error' or handle differently for practice
      return;
    }

    // Ensure any previous practice recording is stopped and unloaded
    if (practiceRecordingRef.current) {
      console.log("startPracticeAudioRecording: Unloading existing practiceRecordingRef.");
      try {
        await practiceRecordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        console.warn("startPracticeAudioRecording: Error unloading previous practiceRecordingRef", e);
      }
      practiceRecordingRef.current = null;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting practice recording..');
      const { recording } = await Audio.Recording.createAsync(
         Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      practiceRecordingRef.current = recording;
      setPracticeActivityState('recording_practice');
      console.log('Practice recording started');
    } catch (err: any) {
      console.error('Failed to start practice recording', err);
      setErrorMessage(err.message || 'Could not start practice recording.');
      setPracticeActivityState('idle'); // Reset on error
    }
  };

  const stopPracticeAudioRecordingAndNavigate = async () => {
    if (!practiceRecordingRef.current) {
      return;
    }
    console.log('Stopping practice recording..');
    setPracticeActivityState('processing_practice');
    try {
      await practiceRecordingRef.current.stopAndUnloadAsync();
      const practicedAudioUri = practiceRecordingRef.current.getURI();
      practiceRecordingRef.current = null;
      console.log('Practice recording stopped and stored at', practicedAudioUri);

      if (practicedAudioUri && englishSentence) {
        router.push({
          pathname: '/(tabs)/learn/feedback',
          params: { practicedAudioUri, targetEnglishText: englishSentence },
        });
      } else {
        throw new Error('Practice recording URI is null or target English sentence is missing.');
      }
      setPracticeActivityState('idle'); // Reset after successful navigation trigger
    } catch (error: any) {
      console.error('Error stopping practice recording or navigating:', error);
      setErrorMessage(error.message || 'Failed to process practice audio.');
      setPracticeActivityState('idle'); // Reset on error
    }
  };

 const handlePracticeButtonPress = async () => {
    setErrorMessage(''); // Clear previous errors
    if (practiceActivityState === 'idle') {
      await startPracticeAudioRecording();
    } else if (practiceActivityState === 'recording_practice') {
      await stopPracticeAudioRecordingAndNavigate();
    }
  };
  // --- End of Functions for Practice Recording Flow ---

  const renderContent = () => {
    switch (screenState) {
      case 'initial':
        return (
          <View style={styles.contentArea}>
            <Text style={styles.instructionText}>Tap "Speak" and say your Urdu sentence</Text>
            <View style={styles.inputBoxPlaceholder} />
          </View>
        );
      case 'listening':
        return (
          <View style={styles.contentArea}>
            <View style={styles.listeningContainer}>
              <MicIcon color="#000" />
              <Text style={styles.listeningTextLarge}>Listening...</Text>
            </View>
            <View style={styles.inputBoxPlaceholder}>
                 <Text style={styles.urduTranscriptPreview}>{/* Live transcript could go here */}</Text>
            </View>
          </View>
        );
      case 'processing':
        return (
          <View style={styles.contentArea}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>Translating & Transcribing...</Text>
          </View>
        );
      case 'playback':
        return (
          <View style={styles.contentAreaPlayback}>
            {originalAudioUri && (
              <View style={styles.sentencePair}>
                <Text style={styles.sentenceLabel}>Your Original Recording (Urdu):</Text>
                <TouchableOpacity style={styles.playButton} onPress={() => playAudio(originalAudioUri)}>
                  <PlayIcon />
                  <Text style={styles.playButtonText}>Play Original Recording</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.sentencePair}>
              <Text style={styles.sentenceLabel}>Try saying (English):</Text>
              <Text style={styles.sentenceText}>{englishSentence}</Text>
            </View>
            {englishAudioBlob && (
                <TouchableOpacity style={styles.playButton} onPress={() => playAudio(URL.createObjectURL(englishAudioBlob))}>
                    <PlayIcon />
                    <Text style={styles.playButtonText}>Play Translated Sound (English)</Text>
                </TouchableOpacity>
            )}
          </View>
        );
      case 'error':
        return (
            <View style={styles.contentArea}>
                <Ionicons name="alert-circle-outline" size={48} color="red" />
                <Text style={styles.errorText}>{errorMessage || "An unknown error occurred."}</Text>
                <TouchableOpacity onPress={resetState} style={styles.tryAgainButton}>
                    <Text style={styles.tryAgainButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    // Disable main action button if practice is in progress
    if (practiceActivityState === 'recording_practice' || practiceActivityState === 'processing_practice') {
      return (
        <View style={[styles.actionButton, styles.disabledButton]}>
            <MicIcon />
            <Text style={styles.actionButtonText}>Practice in Progress...</Text>
        </View>
      );
    }

    switch (screenState) {
      case 'initial':
      case 'playback':
      case 'error':
        return (
          <TouchableOpacity onPress={handleSpeakPress} style={styles.actionButton}>
            <MicIcon />
            <Text style={styles.actionButtonText}>Speak</Text>
          </TouchableOpacity>
        );
      case 'listening':
        return (
          <TouchableOpacity style={[styles.actionButton, styles.listeningButton]} onPress={handleSpeakPress}>
            <MicIcon />
            <Text style={styles.actionButtonText}>Stop & Process</Text>
          </TouchableOpacity>
        );
      case 'processing':
         return (
            <View style={[styles.actionButton, styles.disabledButton]}>
                <ActivityIndicator color="white" style={{marginRight: 10}} />
                <Text style={styles.actionButtonText}>Processing...</Text>
            </View>
        );
      case 'playback':
        break;
      default:
        return null;
    }
  };
  
  const renderPlaybackActions = () => {
    if (screenState === 'playback') {
      if (englishSentence) {
        return (
          <TouchableOpacity 
              style={[
                  styles.secondaryActionButton,
                  practiceActivityState === 'recording_practice' ? styles.listeningButton : {},
                  practiceActivityState === 'processing_practice' ? styles.disabledButton : {}
              ]} 
              onPress={handlePracticeButtonPress}
              disabled={practiceActivityState === 'processing_practice'}
          >
              <MicIcon color={"white"} />
              <Text style={styles.secondaryActionButtonText}>
                  {practiceActivityState === 'idle' && "Practice Speaking"}
                  {practiceActivityState === 'recording_practice' && "Stop Recording Practice"}
                  {practiceActivityState === 'processing_practice' && "Processing Practice..."}
              </Text>
          </TouchableOpacity>
        );
      }
    }
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => { if (router.canGoBack()) { router.back(); } else { resetState(); /* Or navigate to a default tab route */ } }}
        style={styles.backButton}
      >
        <BackIcon />
      </TouchableOpacity>
      <Text style={styles.title}>Real-time Urdu-to-English Tutor</Text>
      
      {renderContent()}
      
      <View style={styles.bottomContainer}>
        {screenState !== 'playback' && renderActionButton()}
        {renderPlaybackActions()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#F5F6F7', 
  },
  backButton: {
    position: 'absolute',
    top: 50, 
    left: 20,
    zIndex: 1,
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentAreaPlayback: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 20,
  },
  instructionText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputBoxPlaceholder: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  listeningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  listeningTextLarge: {
    fontSize: 20,
    color: '#333',
    marginLeft: 10,
  },
   urduTranscriptPreview: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  processingText: {
    fontSize: 18,
    color: '#007AFF',
    marginTop: 15,
    textAlign: 'center',
  },
  sentencePair: {
    marginBottom: 25,
    width: '100%',
  },
  sentenceLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  sentenceText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9E9E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  playButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  bottomContainer: {
    paddingTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    minHeight: 55,
    marginBottom: 10,
  },
  listeningButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  secondaryActionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    minHeight: 55,
    marginTop: 0,
  },
  secondaryActionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 0,
  },
  micPrompt: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
      fontSize: 16,
      color: 'red',
      textAlign: 'center',
      marginBottom: 20,
      marginTop: 10,
  },
  tryAgainButton: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 25,
  },
  tryAgainButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
  }
}); 