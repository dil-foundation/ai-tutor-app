import ParallaxScrollView from '../../components/ParallaxScrollView';
import { ThemedView } from '../../components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
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
  ScrollView,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';
import { useLanguageMode } from '../../context/LanguageModeContext';

const { width, height } = Dimensions.get('window');

export default function LearnScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pulseAnim] = useState(new Animated.Value(1));
  const { mode, setMode } = useLanguageMode();
  const [selectedToggle, setSelectedToggle] = useState('eng-eng'); // Default to Eng-Eng only

  useEffect(() => {
    // Animate elements on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, []);

  const handleConversationPress = () => {
    // Add a small scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push({ 
      pathname: '/(tabs)/learn/conversation', 
      params: { autoStart: 'true' } 
    });
  };

  const handleEnglishOnlyPress = () => {
    // Add a small scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push({ 
      pathname: '/(tabs)/learn/english-only', 
      params: { autoStart: 'true' } 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centeredContainer}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#58D68D', '#45B7A8']}
              style={styles.iconGradient}
            >
              <Ionicons name="mic" size={32} color="#000000" />
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle}>English Tutoring</Text>
          <Text style={styles.headerSubtitle}>Perfect your English speaking skills</Text>
          
          {/* Language Mode Toggle - Temporarily Hidden */}
          {/* <View style={styles.toggleButtonWrapper}>
            <View style={styles.segmentedToggleContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.toggleOption, styles.toggleActive]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name="school"
                    size={18}
                    color={'#000000'}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.toggleOptionText, { color: '#000000' }]}>English Only</Text>
                </View>
              </LinearGradient>
            </View>
          </View> */}

        </Animated.View>
        
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: pulseAnim }
              ],
              alignSelf: 'center',
              width: '100%',
              marginTop: 20,
            },
          ]}
        >
          {/* English-Only Button */}
          <TouchableOpacity 
            onPress={handleEnglishOnlyPress}
            style={styles.buttonWrapper}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#58D68D', '#45B7A8', '#58D68D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="school" size={24} color="#000000" />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonText}>Start English Tutoring</Text>
                  <Text style={styles.buttonSubtext}>Perfect your English speaking skills</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={20} color="#000000" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
    paddingTop: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    paddingTop: 25,
    marginBottom: 28,
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(88, 214, 141, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
  toggleButtonWrapper: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: -10,
  },
  toggleBox: {
    width: '100%',
    marginTop: 18,
    marginBottom: 8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  toggleGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  switchContainer: {
    marginLeft: 12,
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  mainCard: {
    width: '100%',
    marginBottom: 40,
  },
  cardGradient: {
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
    position: 'relative',
    overflow: 'hidden',
  },

  textSection: {
    alignItems: 'center',
    zIndex: 2,
  },
  mainText: {
    fontSize: 22,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '600',
  },

  buttonContainer: {
    width: '100%',
    marginBottom: 40,
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
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
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
  // Redesigned Toggle Box Styles
  segmentedToggleContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 30, // Remove rounded corners
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 18,
    marginBottom: 8,
    overflow: 'hidden',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 0, // Remove rounded corners
    borderRightWidth: 1, // Add straight line divider
    borderRightColor: '#E0E0E0',
  },
  toggleActive: {
    backgroundColor: '#58D68D',
  },
  toggleInactive: {
    backgroundColor: 'transparent',
    borderWidth: 0, // Remove border for inactive state
  },
  toggleOptionText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, backgroundColor: '#fff' },
}); 