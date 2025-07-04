import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated,
} from 'react-native';

import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchAudioFromText } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

const playAudioFromText = async (text: string, onPlaybackFinish: () => void) => {
  try {
    const fileUri = await fetchAudioFromText(text);
    if (fileUri) {
      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          onPlaybackFinish();
          sound.unloadAsync();
        }
      });
      await sound.playAsync();
    } else {
      onPlaybackFinish();
    }
  } catch (error) {
    console.error("Audio playback failed", error);
    onPlaybackFinish();
  }
};

const alphabetData = [
  { letter: "A", word: "Apple", urdu: "سیب", pron: "ae-pl" },
  { letter: "B", word: "Book", urdu: "کتاب", pron: "buk" },
  { letter: "C", word: "Cat", urdu: "بلی", pron: "ket" },
  { letter: "D", word: "Door", urdu: "دروازہ", pron: "dor" },
  { letter: "E", word: "Elephant", urdu: "ہاتھی", pron: "e-le-fent" },
  { letter: "F", word: "Friend", urdu: "دوست", pron: "frend" },
  { letter: "G", word: "Guide", urdu: "رہنما", pron: "gaa-id" },
  { letter: "H", word: "House", urdu: "گھر", pron: "haus" },
  { letter: "I", word: "Ice", urdu: "برف", pron: "aais" },
  { letter: "J", word: "Juice", urdu: "رس", pron: "joos" },
  { letter: "K", word: "King", urdu: "بادشاہ", pron: "king" },
  { letter: "L", word: "Light", urdu: "روشنی", pron: "lait" },
  { letter: "M", word: "Moon", urdu: "چاند", pron: "moon" },
  { letter: "N", word: "Name", urdu: "نام", pron: "neim" },
  { letter: "O", word: "Orange", urdu: "سنگتره", pron: "or-inj" },
  { letter: "P", word: "Pen", urdu: "قلم", pron: "pen" },
  { letter: "Q", word: "Queen", urdu: "ملکہ", pron: "kween" },
  { letter: "R", word: "Rain", urdu: "بارش", pron: "rein" },
  { letter: "S", word: "Sun", urdu: "سورج", pron: "san" },
  { letter: "T", word: "Tree", urdu: "درخت", pron: "tree" },
  { letter: "U", word: "Umbrella", urdu: "چھتری", pron: "um-bre-la" },
  { letter: "V", word: "Van", urdu: "وین", pron: "van" },
  { letter: "W", word: "Water", urdu: "پانی", pron: "waa-ter" },
  { letter: "X", word: "X-Ray", urdu: "ایکس رے", pron: "eks-ray" },
  { letter: "Y", word: "Yellow", urdu: "پیلا", pron: "ye-lo" },
  { letter: "Z", word: "Zebra", urdu: "زیبرا", pron: "zee-bra" },
];

const chunkArray = (arr: any[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

const alphabetPages = chunkArray(alphabetData, 7);

const Lesson1Screen: React.FC = () => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [playingLetter, setPlayingLetter] = useState<string | null>(null);
  const [showFinishAnimation, setShowFinishAnimation] = useState(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

  useEffect(() => {
    // Initialize card animations
    const animations = alphabetPages[currentPageIndex].map(() => new Animated.Value(0));
    setCardAnimations(animations);

    // Animate header and content
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate cards with stagger
    animations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });

    // Start pulse animation for play buttons
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, [currentPageIndex]);

  const lessonPages = alphabetPages.map((pageData, pageIndex) => (
    <View key={`page${pageIndex}`} style={styles.pageContent}>
      {pageData.map(({ letter, word, urdu, pron }, cardIndex) => (
        <Animated.View 
          key={letter} 
          style={[
            styles.cardWrapper,
            {
              opacity: cardAnimations[cardIndex] || 0,
              transform: [
                { 
                  translateY: cardAnimations[cardIndex] ? 
                    cardAnimations[cardIndex].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    }) : 30
                },
                { scale: cardAnimations[cardIndex] || 0.8 }
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#E0F2F1', '#C8E6C9', '#DCEDC8']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardTextContainer}>
                <View style={styles.letterContainer}>
                  <LinearGradient
                    colors={['#58D68D', '#45B7A8']}
                    style={styles.letterGradient}
                  >
                    <Text style={styles.alphabetLetter}>{letter}</Text>
                  </LinearGradient>
                  <Text style={styles.pronText}>({pron})</Text>
                </View>
                <Text style={styles.englishWord}>{word}</Text>
                <Text style={styles.arabicWord}>{urdu}</Text>
              </View>
              
              <Animated.View
                style={[
                  styles.playButtonContainer,
                  {
                    transform: [{ scale: playingLetter === letter ? 1.1 : pulseAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.playButtonCircle}
                  disabled={playingLetter !== null}
                  onPress={async () => {
                    setPlayingLetter(letter);
                    await playAudioFromText(`${letter} for ${word}`, () => setPlayingLetter(null));
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={playingLetter === letter ? ['#45B7A8', '#58D68D'] : ['#58D68D', '#45B7A8']}
                    style={styles.playButtonGradient}
                  >
                    {playingLetter === letter ? (
                      <Ionicons name="pause" size={20} color="#FFFFFF" />
                    ) : (
                      <Ionicons name="play" size={20} color="#FFFFFF" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>
      ))}
    </View>
  ));

  const handleGoBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else {
      if (router.canGoBack()) router.back();
      console.log('Exiting Lesson 1');
    }
  };

  const handleNextOrFinish = () => {
    if (currentPageIndex < lessonPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      console.log('Lesson 1 Finished!');
      setShowFinishAnimation(true);
      setTimeout(() => {
        router.replace('/(tabs)/practice/stage0');
      }, 3000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <LinearGradient
              colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={24} color="#58D68D" />
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.headerIconGradient}
              >
                <Text style={styles.headerIcon}>🔤</Text>
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>The English Alphabet</Text>
            <Text style={styles.headerSubtitle}>Master the ABCs with confidence</Text>
          </View>
          
          <View style={{ width: 50 }} />
        </Animated.View>

        {/* Progress Indicator */}
        <Animated.View 
          style={[
            styles.progressContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#58D68D', '#45B7A8']}
              style={[
                styles.progressFill,
                { width: `${((currentPageIndex + 1) / lessonPages.length) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentPageIndex + 1} of {lessonPages.length}
          </Text>
        </Animated.View>

        {/* Main Content */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {lessonPages[currentPageIndex]}
          </ScrollView>
        </Animated.View>

        {/* Navigation Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={handleNextOrFinish}
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
                  <Text style={styles.buttonIcon}>
                    {currentPageIndex === lessonPages.length - 1 ? '🎉' : '→'}
                  </Text>
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonText}>
                    {currentPageIndex === lessonPages.length - 1 ? 'Complete Lesson' : 'Continue'}
                  </Text>
                  <Text style={styles.buttonSubtext}>
                    {currentPageIndex === lessonPages.length - 1 ? 'Great job! You did it!' : 'Next set of letters →'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
        <View style={styles.particle1} />
        <View style={styles.particle2} />
        <View style={styles.particle3} />

        {/* Finish Animation */}
        {showFinishAnimation && (
          <View style={styles.animationOverlay}>
            <LottieView
              source={require('../../../../assets/animations/sparkle.json')}
              autoPlay
              loop={false}
              style={styles.fullScreenAnimation}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
  },
  backButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  headerIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(88, 214, 141, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  pageContent: {
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.15)',
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextContainer: {
    flex: 1,
  },
  letterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  letterGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  alphabetLetter: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pronText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  englishWord: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  arabicWord: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },
  playButtonContainer: {
    marginLeft: 16,
  },
  playButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginBottom: -15,
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
  },
  buttonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonIcon: {
    fontSize: 20,
    marginTop: -10,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: -3,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.6,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.015)',
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
    top: height * 0.7,
    right: width * 0.15,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ADB5BD',
    opacity: 0.2,
  },
  particle3: {
    position: 'absolute',
    bottom: height * 0.4,
    left: width * 0.2,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CED4DA',
    opacity: 0.25,
  },
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenAnimation: {
    width: '100%',
    height: '100%',
  },
});

export default Lesson1Screen;