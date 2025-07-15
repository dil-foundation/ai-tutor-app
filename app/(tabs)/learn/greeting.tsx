import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { getAuthData } from '../../utils/authStorage';
import audioManager from '../../utils/audioManager';

const { width, height } = Dimensions.get('window');

const LINES = [
  {
    urdu: 'سیکھنے کے پلیٹ فارم میں خوش آمدید، آئیے انگریزی سیکھتے ہیں؟',
    english: 'Welcome to the learning platform, shall we learn English?'
  }
];

const GREETING_AUDIO_ID = 'greeting_audio';

export default function GreetingScreen() {
  const router = useRouter();
  const [isAudioFinished, setIsAudioFinished] = useState(false);
  const [visibleLines, setVisibleLines] = useState<Array<{urdu: string, english: string}>>([]);
  const [showContinue, setShowContinue] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStartedGreeting, setHasStartedGreeting] = useState(false);
  
  // Add sound reference to properly manage audio
  const soundRef = useRef<Audio.Sound | null>(null);
  const isPlayingRef = useRef(false);
  const hasVisitedRef = useRef(false);

  // Handle screen focus to prevent duplicate audio
  useFocusEffect(
    useCallback(() => {
      // If audio is already playing when screen comes into focus, don't start it again
      if (audioManager.isAudioPlaying(GREETING_AUDIO_ID)) {
        console.log('Greeting audio already playing on focus, skipping...');
        setHasStartedGreeting(true);
      }
      
      return () => {
        // Cleanup when screen loses focus
        console.log('Greeting screen losing focus');
      };
    }, [])
  );

  useEffect(() => {
    let lineTimeouts: number[] = [];
    let isComponentMounted = true;

    const revealLines = () => {
      LINES.forEach((line, index) => {
        const timeout = setTimeout(() => {
          if (!isComponentMounted) return;
          
          setVisibleLines((prev) => [...prev, line]);
          
          if (index === LINES.length - 1) {
            setShowContinue(true);
          }
        }, index * 2000); // 2 seconds per line
        lineTimeouts.push(timeout);
      });
    };

    const playGreeting = async () => {
      // Use audio manager to prevent multiple instances
      if (audioManager.isAudioPlaying(GREETING_AUDIO_ID) || hasStartedGreeting) {
        console.log('Greeting audio already playing or started, skipping...');
        return;
      }
      
      try {
        console.log('Starting greeting audio...');
        setHasStartedGreeting(true);
        
        // Use the audio manager to play the audio
        const success = await audioManager.playAudio(
          GREETING_AUDIO_ID,
          'https://dil-lms.s3.us-east-1.amazonaws.com/greeting_message_multilingual.mp3'
        );
        
        if (success) {
          // Start revealing lines immediately when audio starts
          revealLines();
          
          // Set up a timer to check when audio finishes (since audio manager handles the audio)
          const checkAudioStatus = setInterval(() => {
            if (!audioManager.isAudioPlaying(GREETING_AUDIO_ID)) {
              clearInterval(checkAudioStatus);
              if (isComponentMounted) {
                console.log('Audio finished, updating UI...');
                AsyncStorage.setItem('hasVisitedLearn', 'true');
                setIsAudioFinished(true);
              }
            }
          }, 500); // Check every 500ms
          
          // Clean up interval if component unmounts
          return () => clearInterval(checkAudioStatus);
        } else {
          console.log('Failed to start greeting audio, showing lines anyway...');
          revealLines();
        }
      } catch (error) {
        console.log('Audio error:', error);
        // If audio fails, still show lines
        revealLines();
      }
    };

    const initializeGreeting = async () => {
      try {
        // First check if user is authenticated
        const { token } = await getAuthData();
        if (!token) {
          // User is not authenticated, redirect to login
          router.replace('/(auth)/login');
          return;
        }
        
        // User is authenticated
        setIsAuthenticated(true);
        
        // Check if user has already visited this screen
        const hasVisitedLearn = await AsyncStorage.getItem('hasVisitedLearn');
        if (hasVisitedLearn === 'true') {
          // User has already visited, skip to main learn screen
          router.replace('/(tabs)/learn');
          return;
        }

        // User is authenticated and hasn't visited, start the greeting
        // Add a small delay to ensure component is fully mounted
        setTimeout(() => {
          if (isComponentMounted) {
            playGreeting();
          }
        }, 100);
      } catch (error) {
        console.log('Error checking AsyncStorage:', error);
        // If there's an error checking authentication, redirect to login
        router.replace('/(auth)/login');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    // Start everything immediately
    initializeGreeting();

    return () => {
      isComponentMounted = false;
      
      // Clean up timeouts
      lineTimeouts.forEach(clearTimeout);
      
      // Stop the greeting audio if component unmounts
      if (audioManager.isAudioPlaying(GREETING_AUDIO_ID)) {
        audioManager.stopCurrentAudio();
      }
    };
  }, []);

  const handleContinue = () => {
    // Stop any playing audio before navigating
    if (audioManager.isAudioPlaying(GREETING_AUDIO_ID)) {
      audioManager.stopCurrentAudio();
    }
    router.replace('/(tabs)/learn');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render anything if not authenticated (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centeredContainer}>
        {/* Welcome Header */}
        <View style={styles.headerContent}>
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
        </View>

        {/* Main Content Area */}
        <View style={styles.linesCardOuter}>
          <LinearGradient
            colors={["#e0f7ef", "#f8fffc"]}
            style={styles.linesCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {visibleLines.map((line, index) => (
              <View key={index} style={styles.linesCardInner}>
                <Text style={styles.urduText}>{line.urdu}</Text>
                <Text style={styles.englishText}>{line.english}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Continue Button */}
        {showContinue && isAudioFinished && (
          <TouchableOpacity style={styles.buttonWrapper} onPress={handleContinue} activeOpacity={0.85}>
            <LinearGradient
              colors={["#58D68D", "#45B7A8", "#58D68D"]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: 20,
    paddingTop: 0,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
    paddingTop: 25,
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  linesCardOuter: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    zIndex: 2,
  },
  linesCardGradient: {
    width: '100%',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(88, 214, 141, 0.13)',
  },
  linesCardInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  urduText: {
    fontSize: 22,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontFamily: 'System',
    marginTop: 0,
  },
  englishText: {
    fontSize: 18,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0.3,
    fontFamily: 'System',
  },
  fixedButtonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    zIndex: 2,
  },
  buttonWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    width: '100%',
    minWidth: 0,
    maxWidth: 420,
    alignSelf: 'center',
  },
  buttonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 22,
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
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonSubtext: {
    color: '#000000',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
});
  