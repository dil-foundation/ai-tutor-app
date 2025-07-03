import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
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
  
  // Add sound reference to properly manage audio
  const soundRef = useRef<Audio.Sound | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    let lineTimeouts: number[] = [];
    let hasVisited = false;

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

    const playGreeting = async () => {
      // Prevent multiple audio instances
      if (isPlayingRef.current || hasVisited) {
        return;
      }
      
      try {
        isPlayingRef.current = true;
        hasVisited = true;
        
        // Clean up any existing sound first
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          {
            uri: 'https://docs.google.com/uc?export=download&id=1xmM93cgS7LjYlvt-0Na8uoIqFqqgkLus',
          },
          { shouldPlay: true }
        );
        
        // Store sound reference
        soundRef.current = sound;
        
        // Start revealing lines immediately when audio starts
        revealLines();
        
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded && status.didJustFinish) {
            await AsyncStorage.setItem('hasVisitedLearn', 'true');
            setIsAudioFinished(true);
            
            // Clean up sound after it finishes
            if (soundRef.current) {
              await soundRef.current.unloadAsync();
              soundRef.current = null;
            }
            isPlayingRef.current = false;
            
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
          } else if (!status.isLoaded && 'error' in status) {
            console.error('Audio playback error:', status.error);
            isPlayingRef.current = false;
            // If audio fails, still show lines
            revealLines();
          }
        });
      } catch (error) {
        console.log('Audio error:', error);
        isPlayingRef.current = false;
        // If audio fails, still show lines
        revealLines();
      }
    };

    const initializeGreeting = async () => {
      // Check if user has already visited this screen
      try {
        const hasVisitedLearn = await AsyncStorage.getItem('hasVisitedLearn');
        if (hasVisitedLearn === 'true') {
          // User has already visited, skip to main learn screen
          router.replace('/(tabs)/learn');
          return;
        }
      } catch (error) {
        console.log('Error checking AsyncStorage:', error);
      }

      // Start the greeting if user hasn't visited
      playGreeting();
    };

    // Start everything immediately
    initializeGreeting();

    return () => {
      // Clean up timeouts
      lineTimeouts.forEach(clearTimeout);
      
      // Clean up audio
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.error);
        soundRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)/learn');
  };

  return (
    <View style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#58D68D', '#45B7A8']}
              style={styles.iconGradient}
            >
              <Text style={styles.iconText}>🎯</Text>
            </LinearGradient>
          </View>
          <Text style={styles.welcomeText}>Welcome to Your Learning Journey</Text>
          <Text style={styles.subtitleText}>Let's begin your English speaking adventure</Text>
        </Animated.View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {/* Animated Lines with Modern Cards */}
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
                <LinearGradient
                  colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                  style={styles.lineGradient}
                >
                  <Text style={styles.text}>{line}</Text>
                </LinearGradient>
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
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.01)']}
                style={styles.chatGradient}
              >
                <Text style={styles.chatText}>
                  "Ready to practice? Let's make your English speaking dreams come true! 🚀"
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.chatBubble}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.01)']}
                style={styles.chatGradient}
              >
                <Text style={styles.chatText}>
                  "I'll be your personal AI tutor, guiding you through every step of your learning journey."
                </Text>
              </LinearGradient>
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
            <TouchableOpacity style={styles.buttonWrapper} onPress={handleContinue}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8', '#58D68D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconContainer}>
                    <Text style={styles.buttonIcon}>🎯</Text>
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonText}>Continue to Learning</Text>
                    <Text style={styles.buttonSubtext}>Start your journey →</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowIcon}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      <View style={styles.decorativeCircle4} />
      
      {/* Floating Particles */}
      <View style={styles.particle1} />
      <View style={styles.particle2} />
      <View style={styles.particle3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: -20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  iconText: {
    fontSize: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(88, 214, 141, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  linesContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 15,
  },
  lineWrapperContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  lineWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  lineGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
  },
  text: {
    fontSize: 22,
    color: '#000000',
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
    marginTop: -20,
  },
  chatBubble: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  chatGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  chatText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: -10,
    width: '100%',
    marginBottom: 70,
  },
  buttonWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#000000',
    fontSize: 14,
    opacity: 0.8,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.15,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.7,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.015)',
  },
  decorativeCircle4: {
    position: 'absolute',
    bottom: height * 0.1,
    right: width * 0.2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  },
  particle1: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C757D',
    opacity: 0.3,
  },
  particle2: {
    position: 'absolute',
    top: height * 0.6,
    right: width * 0.15,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ADB5BD',
    opacity: 0.2,
  },
  particle3: {
    position: 'absolute',
    bottom: height * 0.3,
    left: width * 0.2,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CED4DA',
    opacity: 0.25,
  },
});
  