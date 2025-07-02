import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

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
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [lineAnimations, setLineAnimations] = useState<Animated.Value[]>([]);

  useEffect(() => {
    let lineTimeouts: number[] = [];

    const playGreeting = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          {
            uri: 'https://docs.google.com/uc?export=download&id=1xmM93cgS7LjYlvt-0Na8uoIqFqqgkLus',
          },
          { shouldPlay: true }
        );
        
        // Start revealing lines immediately when audio starts
        revealLines();
        
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded && status.didJustFinish) {
            await AsyncStorage.setItem('hasVisitedLearn', 'true');
            setIsAudioFinished(true);
            
            // Animate the chat container after animation ends
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
              }),
            ]).start();
          }
        });
      } catch (error) {
        console.log('Audio error:', error);
        // If audio fails, still show lines
        revealLines();
      }
    };

    const revealLines = () => {
      LINES.forEach((line, index) => {
        const timeout = setTimeout(() => {
          setVisibleLines((prev) => [...prev, line]);
          
          // Create and animate the new line immediately
          const newLineAnim = new Animated.Value(0);
          setLineAnimations(prev => [...prev, newLineAnim]);
          
          Animated.timing(newLineAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
          
          if (index === LINES.length - 1) {
            setShowContinue(true);
          }
        }, index * 2000); // 2 seconds per line
        lineTimeouts.push(timeout);
      });
    };

    // Start everything immediately
    playGreeting();

    return () => {
      lineTimeouts.forEach(clearTimeout);
    };
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)/learn');
  };

  return (
    <LinearGradient
      colors={['#0B0E1C', '#1a1f3a', '#0B0E1C']}
      style={styles.container}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to Your Learning Journey</Text>
        <Text style={styles.subtitleText}>Let's begin your English speaking adventure</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {/* Animated Lines with Overlay Animation */}
        <View style={styles.linesContainer}>
          {visibleLines.map((line, index) => (
            <View key={index} style={styles.lineWrapperContainer}>
              <Animated.View
                style={[
                  styles.lineWrapper,
                  {
                    opacity: lineAnimations[index] || 0,
                    transform: [{ 
                      translateY: lineAnimations[index] ? 
                        lineAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        }) : 20
                    }],
                  },
                ]}
              >
                <Text style={styles.text}>{line}</Text>
              </Animated.View>
              
              {/* Spark Animation Overlay on Text */}
              {isAudioFinished && index === visibleLines.length - 1 && (
                <View style={styles.animationOverlay}>
                  <LottieView
                    source={require('../../../assets/animations/sparkle.json')}
                    autoPlay
                    loop={false}
                    style={styles.sparkleAnimation}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Chat-like Container after animation */}
        {isAudioFinished && (
          <Animated.View
            style={[
              styles.chatContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>
                "Ready to practice? Let's make your English speaking dreams come true! 🚀"
              </Text>
            </View>
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>
                "I'll be your personal AI tutor, guiding you through every step of your learning journey."
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Continue Button - Only one at the end */}
        {showContinue && isAudioFinished && (
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Continue to Learning</Text>
                <Text style={styles.buttonSubtext}>Start your journey →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(88, 214, 141, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#B8B8B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  linesContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lineWrapperContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  lineWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.3)',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    fontSize: 22,
    color: '#58D68D',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  animationOverlay: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sparkleAnimation: {
    width: 200,
    height: 200,
  },
  chatContainer: {
    width: '100%',
    marginVertical: 20,
  },
  chatBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0B0E1C',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#0B0E1C',
    fontSize: 14,
    opacity: 0.8,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(88, 214, 141, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.6,
    right: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(88, 214, 141, 0.06)',
  },
});
  