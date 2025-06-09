import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import BASE_API_URL from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Icons (can be customized further or replaced with actual image assets if needed)
const BackIcon = () => <Ionicons name="arrow-back" size={24} color="#D2D5E1" />;
const MicIcon = ({ color = "#111629" }) => <Ionicons name="mic" size={24} color={color} />;
const PlayIcon = () => <Ionicons name="play" size={20} color="#111629" />;

type ScreenState = 'initial' | 'listening' | 'processing' | 'playback' | 'error';

// +++ Utility function to convert Blob to Base64 +++
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      // The result includes the data URI prefix (e.g., "data:audio/wav;base64,"), so we split it off.
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(blob);
  });
};
// +++ End of utility function +++

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

      // Use BASE_API_URL
      const response = await fetch(`${BASE_API_URL}/api/translate/speak/audio`, {
        method: 'POST',
        body: formData,
      });

      // +++ Enhanced logging for the response +++
      const responseContentType = response.headers.get('Content-Type');
      const responseContentLength = response.headers.get('Content-Length');
      console.log(
        `Response from /speak/audio - Status: ${response.status}, StatusText: ${response.statusText}, Content-Type: ${responseContentType}, Content-Length: ${responseContentLength}`
      );
      // +++ End of enhanced logging +++

      if (!response.ok) {
        const errorText = await response.text();
        // Add more detailed error logging for server non-OK responses
        console.error('uploadAndTranslateAudio - Server error response text from /speak/audio:', errorText);
        throw new Error(`Translation API error from /speak/audio: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      // Log blob type and size
      console.log('Translated audio received from /speak/audio - Blob Type:', audioBlob.type, 'Blob Size:', audioBlob.size);
      setEnglishAudioBlob(audioBlob);
      
      // Check if the blob seems empty before proceeding
      if (audioBlob.size === 0) {
        console.warn('The translated audio blob from /speak/audio is empty (size 0). This might cause issues downstream.');
      }
      
      console.log('>>> PREPARING to call transcribeEnglishAudioWithLocalAPI');
      await transcribeEnglishAudioWithLocalAPI(audioBlob);
      console.log('>>> FINISHED calling transcribeEnglishAudioWithLocalAPI');

    } catch (error: any) {
      console.error('Error in uploadAndTranslateAudio:', error);
      setErrorMessage(error.message || 'Failed to translate audio.');
      setScreenState('error');
    }
  };

  const transcribeEnglishAudioWithLocalAPI = async (audioBlob: Blob) => {
    console.log('>>> ENTERED transcribeEnglishAudioWithLocalAPI');
    console.log('Transcribing English audio with local API... Blob type:', audioBlob.type, 'Blob size:', audioBlob.size);
    try {
      console.log('Converting audio blob to Base64...');
      const audioBase64 = await blobToBase64(audioBlob);
      console.log('Audio blob converted to Base64. Length:', audioBase64.length);

      const payload = {
        audio_base64: audioBase64,
        filename: `english-audio-${Date.now()}.wav`, // You can adjust the filename/extension as needed
        content_type: audioBlob.type || 'audio/wav' // Send original content type
      };

      const response = await fetch(`${BASE_API_URL}/api/translate/transcribe-audio-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
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

  const playAudio = async (audioSource: string | Blob | null) => {
    console.log('Attempting to play audio from source:', audioSource);
  
    if (!audioSource) {
      console.error('Audio source is null or undefined.');
      setErrorMessage('No audio to play.');
      setScreenState('error');
      return;
    }
  
    try {
      // Unload any previous sound
      if (soundRef.current) {
        console.log('Unloading previous sound');
        await soundRef.current.unloadAsync();
      }
  
      console.log('Setting audio mode for playback...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true, // Important for playback
      });
  
      let audioUri: string | null = null;
  
      // --- Handling Blob Source ---
      if (audioSource instanceof Blob) {
        console.log('Audio source is a Blob. Converting to URI...');
  
        const fileReader = new FileReader();
        fileReader.readAsDataURL(audioSource); // Read blob as a data URL
        
        // Using a promise to handle asynchronous reading
        await new Promise<void>((resolve, reject) => {
          fileReader.onload = () => {
            const base64Data = fileReader.result as string;
            // Define a temporary file path in the app's cache directory
            const tempFilePath = FileSystem.documentDirectory + `playback-${Date.now()}.wav`;
  
            // Write the base64 data (without the prefix) to the temporary file
            FileSystem.writeAsStringAsync(tempFilePath, base64Data.split(',')[1], {
              encoding: FileSystem.EncodingType.Base64,
            })
            .then(() => {
              console.log('Blob converted and saved to temporary file:', tempFilePath);
              audioUri = tempFilePath;
              resolve();
            })
            .catch(e => {
              console.error('Failed to write blob data to file:', e);
              reject(e);
            });
          };
          fileReader.onerror = (error) => {
            console.error('FileReader error:', error);
            reject(error);
          };
        });
  
        if (!audioUri) {
          throw new Error('Failed to create a playable URI from the audio blob.');
        }
      }
      // --- Handling String (URI) Source ---
      else if (typeof audioSource === 'string') {
        console.log('Audio source is a string URI:', audioSource);
        audioUri = audioSource;
      } else {
        throw new Error('Unsupported audio source type.');
      }
  
      // --- Creating and Playing Sound ---
      console.log('Creating sound object with URI:', audioUri);
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true } // Play immediately
      );
      soundRef.current = sound;
  
      console.log('Playback started.');
  
      // Optional: Add a callback for when playback finishes
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('Playback finished.');
          await sound.unloadAsync(); // Unload sound to free up resources
          soundRef.current = null;
          console.log('Sound unloaded.');
        }
      });
  
    } catch (error: any) {
      console.error('Error during audio playback:', error);
      setErrorMessage(error.message || 'Could not play audio.');
      // Do not set screenState to 'error' here to allow other actions
    }
  };

  const handleSpeakPress = async () => {
    // This function now toggles between starting and stopping the recording.
    if (screenState === 'listening') {
      await stopRecordingAndProcess();
    } else {
      await startRecording();
    }
  };


  const handleReadAloudPress = () => {
    if (englishAudioBlob) {
      console.log('Read Aloud pressed. Playing translated English audio.');
      playAudio(englishAudioBlob);
    } else {
      console.warn('Read Aloud pressed, but no English audio blob is available.');
      setErrorMessage("No translated audio available to play.");
    }
  };

  const resetState = () => {
    setScreenState('initial');
    setEnglishSentence('');
    setErrorMessage('');
    setEnglishAudioBlob(null);
    setOriginalAudioUri(null);
    setPracticeActivityState('idle');
  };


  const startPracticeAudioRecording = async () => {
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      setErrorMessage('Audio permission is required for practice.');
      // Don't change the main screen state, just show a temporary error or log it.
      console.error('Audio permission denied for practice.');
      return;
    }
  
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
  
      console.log('Starting practice recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      practiceRecordingRef.current = recording;
      setPracticeActivityState('recording_practice');
      console.log('Practice recording started.');
  
    } catch (err: any) {
      console.error('Failed to start practice recording', err);
      // Handle error without changing main screen state
      setErrorMessage(err.message || 'Could not start practice recording.');
    }
  };

  const stopPracticeAudioRecordingAndNavigate = async () => {
    if (!practiceRecordingRef.current) return;
  
    console.log('Stopping practice recording...');
    setPracticeActivityState('processing_practice');
  
    try {
      const practiceAudioUri = practiceRecordingRef.current.getURI();
      await practiceRecordingRef.current.stopAndUnloadAsync();
      practiceRecordingRef.current = null;
  
      if (practiceAudioUri) {
        console.log('Practice recording stopped, URI:', practiceAudioUri);
  
        const directory = `${FileSystem.documentDirectory}practice_audio/`;
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        
        const fileName = `practice-${Date.now()}.m4a`;
        const newPracticeFileUri = `${directory}${fileName}`;

        console.log(`Moving practice audio from ${practiceAudioUri} to ${newPracticeFileUri}`);
        await FileSystem.moveAsync({
            from: practiceAudioUri,
            to: newPracticeFileUri,
        });
        console.log('Practice audio moved successfully.');

        // Navigate to the feedback screen with all necessary data
        console.log('Navigating to feedback screen...');
        router.push({
          pathname: '/(tabs)/learn/feedback',
          params: {
            practicedAudioUri: newPracticeFileUri,
            targetEnglishText: englishSentence,
          },
        });
  
        // Reset state after successful navigation setup
        setPracticeActivityState('idle');
  
      } else {
        throw new Error('Practice recording URI is null after stopping.');
      }
    } catch (error: any) {
      console.error('Error stopping practice recording or navigating:', error);
      setErrorMessage(error.message || 'Failed to process practice audio.');
      setPracticeActivityState('idle'); // Reset on error
    }
  };


 const handlePracticeButtonPress = async () => {
    if (practiceActivityState === 'idle') {
      await startPracticeAudioRecording();
    } else if (practiceActivityState === 'recording_practice') {
      await stopPracticeAudioRecordingAndNavigate();
    }
    // If 'processing_practice', do nothing to prevent multiple clicks
  };

  const renderContent = () => {
    switch (screenState) {
      case 'initial':
        return (
          <View style={styles.textContainer}>
            <Text style={styles.initialText}>Press the button and speak in Urdu to get started.</Text>
          </View>
        );
      case 'listening':
        return (
          <View style={styles.listeningView}>
            <Text style={styles.listeningText}>Listening...</Text>
            {/* You can add a visualizer here */}
          </View>
        );
      case 'processing':
        return (
          <View style={styles.processingView}>
            <ActivityIndicator size="large" color="#93E893" />
            <Text style={styles.processingText}>Translating...</Text>
          </View>
        );
      case 'playback':
        return (
          <View style={styles.textContainer}>
            <Text style={styles.englishSentenceText}>{englishSentence}</Text>
          </View>
        );
      case 'error':
        return (
          <View style={styles.errorView}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity onPress={resetState} style={styles.playbackButton}>
              <Text>Try Again</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    if (screenState === 'playback' || screenState === 'error') return null;

    if (practiceActivityState === 'recording_practice') {
      return (
        <TouchableOpacity onPress={handlePracticeButtonPress} style={styles.stopButton}>
          <Text style={{ color: 'white' }}>Stop Practice</Text>
        </TouchableOpacity>
      );
    }
    
    const isListening = screenState === 'listening';
    
    return (
      <TouchableOpacity
        onPress={isListening ? stopRecordingAndProcess : startRecording}
        style={isListening ? styles.stopButton : styles.actionButton}
      >
        <MicIcon color={isListening ? "white" : "#111629"} />
      </TouchableOpacity>
    );
  };
  
  const renderPlaybackActions = () => {
    if (screenState !== 'playback') {
      return null;
    }
    return (
      <View style={styles.playbackActionsContainer}>
        <TouchableOpacity onPress={resetState} style={styles.tryAgainButton}>
           <Ionicons name="refresh" size={20} color="#111629" />
           <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomActionsContainer}>
            <TouchableOpacity onPress={handleReadAloudPress} style={styles.playbackButton}>
              <Ionicons name="volume-high-outline" size={20} color="#111629" />
              <Text style={styles.playbackButtonText}>Read Aloud</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handlePracticeButtonPress} style={styles.practiceButton}>
              {practiceActivityState === 'recording_practice' ? (
                <>
                  <Ionicons name="stop" size={20} color="#D2D5E1" style={{marginRight: 8}} />
                  <Text style={styles.practiceButtonText}>Stop</Text>
                </>
              ) : practiceActivityState === 'processing_practice' ? (
                <ActivityIndicator color="#D2D5E1" />
              ) : (
                <>
                  <Ionicons name="mic" size={20} color="#D2D5E1" style={{marginRight: 8}} />
                  <Text style={styles.practiceButtonText}>Practice</Text>
                </>
              )}
            </TouchableOpacity>
        </View>
      </View>
    );
  };


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#111629', dark: '#111629' }}
      headerImage={
        <ThemedView style={styles.headerImageContainer}>
          <Text style={styles.headerText}>Speak to Translate</Text>
        </ThemedView>
      }>
      <ThemedView style={styles.contentContainer}>
        {renderContent()}
        {renderActionButton()}
        {renderPlaybackActions()}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111629',
  },
  headerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 24,
    color: '#93E893',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
    minHeight: 300,
    backgroundColor: '#111629',
    flex: 1,
    justifyContent: 'space-between',
  },
  textContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 40,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    alignSelf: 'center',
  },
  initialText: {
    fontSize: 18,
    color: '#D2D5E1',
    textAlign: 'center',
  },
  englishSentenceText: {
    fontSize: 22,
    color: '#93E893',
    textAlign: 'center',
  },
  processingView: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  processingText: {
    fontSize: 16,
    color: '#D2D5E1',
    marginTop: 10,
  },
  listeningView: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  listeningText: {
    fontSize: 18,
    color: '#93E893',
    marginBottom: 10,
  },
  errorView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#93E893',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  playbackActionsContainer: {
    width: '100%',
  },
  tryAgainButton: {
    backgroundColor: '#93E893',
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  tryAgainButtonText: {
    color: '#111629',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playbackButton: {
    backgroundColor: '#93E893',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 5,
  },
   playbackButtonText: {
    color: '#111629',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  practiceButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#93E893',
    flex: 1,
    marginLeft: 5,
  },
  practiceButtonText: {
    color: '#D2D5E1',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 