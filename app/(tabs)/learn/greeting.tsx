import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';


const LINES = [
  'خوش آمدید!',
  'آئیں، بولنے کی مشق شروع کرتے ہیں۔',
  'آپ جو کہیں گے، ہم اسے انگریزی میں سنیں گے۔',
];

export default function GreetingScreen() {
  const router = useRouter();
  const [isAudioFinished, setIsAudioFinished] = useState(false);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    let lineTimeouts: number[] = [];

    const playGreeting = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          {
            uri: 'https://docs.google.com/uc?export=download&id=1xmM93cgS7LjYlvt-0Na8uoIqFqqgkLus', // ✅ Replace with actual direct audio URL
        },
        { shouldPlay: true }
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.isLoaded && status.didJustFinish) {
            await AsyncStorage.setItem('hasVisitedLearn', 'true');
            setIsAudioFinished(true); // ✅ Set audio finished flag
      }
      });

    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const revealLines = () => {
    LINES.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        if (index === LINES.length - 1) {
          setShowContinue(true);
        }
      }, index * 5000); // 2s delay per line
      lineTimeouts.push(timeout);
    });
  };

  playGreeting();
  revealLines();

  return () => {
    lineTimeouts.forEach(clearTimeout);
  };
}, []);

const handleContinue = () => {
  router.replace('/(tabs)/learn');
};

return (
  <View style={styles.container}>
    {visibleLines.map((line, index) => (
      <Text key={index} style={styles.text}>
        {line}
      </Text>
    ))}

    {/* 🎇 Spark Animation after audio ends */}
    {isAudioFinished && (
      <LottieView
        source={require('../../../assets/animations/sparkle.json')}
        autoPlay
        loop={false}
        style={{ width: 300, height: 300, marginTop: 20 }}
      />
    )}

    {showContinue && isAudioFinished && (
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    )}
  </View>
);
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0B0E1C',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    text: {
      fontSize: 20,
      color: '#58D68D',
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 32,
      fontWeight: 'bold',
    },
    button: {
      marginTop: 40,
      backgroundColor: '#58D68D',
      paddingHorizontal: 40,
      paddingVertical: 12,
      borderRadius: 30,
    },
    buttonText: {
      color: '#0B0E1C',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
  