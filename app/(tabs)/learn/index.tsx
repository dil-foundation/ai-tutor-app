import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Icons (can be customized further or replaced with actual image assets if needed)
const BackIcon = () => <Ionicons name="arrow-back" size={24} color="#000" />;
const MicIcon = ({ color = "white" }) => <Ionicons name="mic" size={24} color={color} />;
const PlayIcon = () => <Ionicons name="play" size={20} color="#000" />;

type ScreenState = 'initial' | 'listening' | 'processing' | 'playback';

export default function LearnScreen() {
  const router = useRouter();
  const [screenState, setScreenState] = useState<ScreenState>('initial');
  const [urduSentence, setUrduSentence] = useState('');
  const [englishSentence, setEnglishSentence] = useState('');

  const handleSpeakPress = () => {
    setScreenState('listening');
    // TODO: Implement actual speech recognition to start listening
    // Simulate speech recognition for now
    setTimeout(() => {
      setUrduSentence('آپ کیا کر رہے ہیں؟'); // Example captured Urdu
      setScreenState('processing');
    }, 3000); // Simulate 3 seconds of listening
  };

  const handleProcessing = () => {
    // TODO: Implement actual processing/translation
    // Simulate processing for now
    setTimeout(() => {
      setEnglishSentence('What are you doing?'); // Example translated English
      setScreenState('playback');
    }, 2000); // Simulate 2 seconds of processing
  };

  // Automatically move from processing to playback
  React.useEffect(() => {
    if (screenState === 'processing') {
      handleProcessing();
    }
  }, [screenState]);

  const handleReadAloudPress = () => {
    // TODO: Navigate to a screen where user practices speaking the English sentence
    // For now, let's assume it navigates to feedback or a similar practice area
    router.push({ pathname: '/(tabs)/learn/feedback', params: { urduSentence, englishSentence } });
  };
  
  const resetState = () => {
    setScreenState('initial');
    setUrduSentence('');
    setEnglishSentence('');
  }

  const renderContent = () => {
    switch (screenState) {
      case 'initial':
        return (
          <View style={styles.contentArea}>
            <Text style={styles.instructionText}>Speak your Urdu sentence clearly</Text>
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
                 <Text style={styles.urduTranscriptPreview}>{urduSentence || "آپ کیا کر رہے ہیں؟"}</Text>
            </View>
          </View>
        );
      case 'processing':
        return (
          <View style={styles.contentArea}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        );
      case 'playback':
        return (
          <View style={styles.contentAreaPlayback}>
            <View style={styles.sentencePair}>
              <Text style={styles.sentenceLabel}>You said (in Urdu):</Text>
              <Text style={styles.sentenceText}>{urduSentence}</Text>
            </View>
            <View style={styles.sentencePair}>
              <Text style={styles.sentenceLabel}>Try saying (in English):</Text>
              <Text style={styles.sentenceText}>{englishSentence}</Text>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <PlayIcon />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    switch (screenState) {
      case 'initial':
        return (
          <TouchableOpacity onPress={handleSpeakPress} style={styles.actionButton}>
            <MicIcon />
            <Text style={styles.actionButtonText}>Speak</Text>
          </TouchableOpacity>
        );
      case 'listening':
        return (
          <TouchableOpacity style={[styles.actionButton, styles.listeningButton]} onPress={() => { /* Potentially stop listening */ setScreenState('processing'); }}>
            <MicIcon />
            <Text style={styles.actionButtonText}>Listening...</Text>
          </TouchableOpacity>
        );
      case 'processing':
        return null; // Or a disabled button
      case 'playback':
        return (
            <>
                <TouchableOpacity onPress={handleReadAloudPress} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Read This Aloud</Text>
                </TouchableOpacity>
                <Text style={styles.micPrompt}>Tap the mic to practice your English pronunciation.</Text>
            </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => { if (router.canGoBack()) { router.back(); } else { /* Do nothing or navigate to a default tab route */ } }}
        style={styles.backButton}
      >
        <BackIcon />
      </TouchableOpacity>
      <Text style={styles.title}>Real-time Urdu-to-English Tutor</Text>
      
      {renderContent()}
      
      <View style={styles.bottomContainer}>
        {renderActionButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50, // For status bar and back button
    paddingBottom: 20,
    backgroundColor: '#F5F6F7', 
  },
  backButton: {
    position: 'absolute',
    top: 50, 
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600', // Slightly less bold than 'bold'
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
    justifyContent: 'flex-start', // Align content to top for playback
    alignItems: 'flex-start',   // Align text to left
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
    height: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
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
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9E9E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start', // Align to left under sentences
    marginTop: 10,
  },
  playButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  bottomContainer: {
    paddingTop: 10, // Space above button
    alignItems: 'center', // Center button and mic prompt
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30, // More rounded
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%', // Make button wider
    minHeight: 50,
  },
  listeningButton: {
    backgroundColor: '#4A90E2', // Different color for listening state
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  micPrompt: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
}); 