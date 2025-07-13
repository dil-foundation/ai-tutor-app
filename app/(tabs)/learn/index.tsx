import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header Section */}
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
                <Ionicons name="mic" size={32} color="#000000" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Speak to Translate</Text>
            <Text style={styles.headerSubtitle}>Transform your Urdu into English</Text>
            {/* Custom Segmented Toggle for Language Mode */}
            <View style={styles.segmentedToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  mode === 'urdu' ? styles.toggleActive : styles.toggleInactive,
                  { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
                ]}
                onPress={() => setMode('urdu')}
                activeOpacity={0.8}
              >
                <Ionicons name="globe" size={18} color={mode === 'urdu' ? '#fff' : '#58D68D'} style={{ marginRight: 6 }} />
                <Text style={[styles.toggleOptionText, { color: mode === 'urdu' ? '#fff' : '#58D68D' }]}>Urdu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  mode === 'english' ? styles.toggleActive : styles.toggleInactive,
                  { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
                ]}
                onPress={() => setMode('english')}
                activeOpacity={0.8}
              >
                <Ionicons name="language" size={18} color={mode === 'english' ? '#fff' : '#58D68D'} style={{ marginRight: 6 }} />
                <Text style={[styles.toggleOptionText, { color: mode === 'english' ? '#fff' : '#58D68D' }]}>English</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.mainCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
              style={styles.cardGradient}
            >
              {/* Main Text */}
              <View style={styles.textSection}>
                <Text style={styles.mainText}>
                  Press the button and speak in urdu to get started
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Action Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: pulseAnim }
                ],
              },
            ]}
          >
            <TouchableOpacity 
              onPress={handleConversationPress}
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
                    <Ionicons name="chatbubbles" size={24} color="#000000" />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonText}>Start Real-time Conversation</Text>
                    <Text style={styles.buttonSubtext}>Begin your learning journey →</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-forward" size={20} color="#000000" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Additional Info Cards */}
          <Animated.View
            style={[
              styles.infoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.infoCard}>
              <Ionicons name="bulb" size={24} color="#58D68D" />
              <Text style={styles.infoText}>Perfect for daily conversations</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="time" size={24} color="#58D68D" />
              <Text style={styles.infoText}>Learn at your own pace</Text>
            </View>
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
      </ScrollView>
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
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 18,
    marginBottom: 8,
    overflow: 'hidden',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 30,
  },
  toggleActive: {
    backgroundColor: '#58D68D',
  },
  toggleInactive: {
    backgroundColor: 'transparent',
  },
  toggleOptionText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 