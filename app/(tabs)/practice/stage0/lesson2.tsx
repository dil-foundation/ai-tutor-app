import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchAudioFromText } from '../../../../config/api';

const { width, height } = Dimensions.get('window');

const minimalPairsData = [
  {
    key: 'b-v',
    title: 'B as in Ball vs. V as in Van',
    examples: ['Ball vs. Van', 'Bat vs. Vast', 'Boy vs. Voice'],
    urdu: [
      'آواز لبوں کو بند کر کے ادا کی جاتی ہے. - B',
      'آواز دانتوں سے ہونٹ رگڑ کر ادا کی جاتی ہے. - V',
    ],
    icon: '🔊',
    color: ['#FF6B6B', '#4ECDC4'],
  },
  {
    key: 't-th',
    title: 'T as in Time vs. TH as in Think',
    examples: ['Time vs. Think', 'Ten vs. Thank', 'Toy vs. Thirst'],
    urdu: [
      'زبان کو دانتوں کے پیچھے رکھ کر بولتے ہیں. - T',
      'میں زبان کو دانتوں کے بیچ رگڑ کر نرم آواز',
      'نکالی جاتی ہے. - TH',
    ],
    icon: '🎯',
    color: ['#45B7D1', '#96CEB4'],
  },
  {
    key: 'p-f',
    title: 'P as in Pen vs. F as in Fan',
    examples: ['Pen vs. Fan', 'Pin vs. Fin', 'Pop vs. Fun'],
    urdu: [
      'آواز ہونٹوں سے زوردار نکلتی ہے. - P',
      'آواز دانتوں اور ہونٹوں کے ہلکے رگڑ سے نکلتی ہے. - F',
    ],
    icon: '💨',
    color: ['#FFA07A', '#98D8C8'],
  },
  {
    key: 'd-t',
    title: 'D as in Dog vs. T as in Top',
    examples: ['Dog vs. Top', 'Day vs. Toy', 'Dad vs. Tap'],
    urdu: [
      'آواز نرم اور گہری ہوتی ہے. - D',
      'آواز سخت اور تیز ادا کی جاتی ہے. - T',
    ],
    icon: '🐕',
    color: ['#DDA0DD', '#F0E68C'],
  },
  {
    key: 's-z',
    title: 'S as in Sun vs. Z as in Zoo',
    examples: ['Sun vs. Zoo', 'Sip vs. Zip', 'Sing vs. Zebra'],
    urdu: [
      'آواز بغیر آواز کے سانس سے آتی ہے. - S',
      'آواز سانس اور آواز کے ساتھ ہوتی ہے. - Z، جیسے مکھی',
      'کی بھنبھناہٹ.',
    ],
    icon: '☀️',
    color: ['#FFD700', '#87CEEB'],
  },
  {
    key: 'k-g',
    title: 'K as in King vs. G as in Goat',
    examples: ['King vs. Goat', 'Kit vs. Gift', 'Cold vs. Gold'],
    urdu: [
      'آواز بغیر آواز کے ہوتی ہے، صرف سانس سے. - K',
      'آواز گلے سے آواز کے ساتھ نکلتی ہے. - G',
    ],
    icon: '👑',
    color: ['#FF6347', '#32CD32'],
  },
  {
    key: 'ch-sh',
    title: 'CH as in Chair vs. SH as in Ship',
    examples: ['Chair vs. Ship', 'Cheese vs. Sheet', 'Chat vs. Shine'],
    urdu: [
      "آواز 'چ' جیسی ہوتی ہے. - CH",
      "آواز 'ش' جیسی ہوتی ہے، زیادہ نرم اور لمبی. - SH",
    ],
    icon: '🪑',
    color: ['#8A2BE2', '#20B2AA'],
  },
  {
    key: 'j-z',
    title: 'J as in Jam vs. Z as in Zip',
    examples: ['Jam vs. Zip', 'Joke vs. Zone', 'Jump vs. Zebra'],
    urdu: [
      "آواز 'ج' جیسی ہوتی ہے. - J",
      'آواز سانس اور آواز کے ساتھ نکلتی ہے. - Z، جیسے',
      'بھنبھناہٹ.',
    ],
    icon: '🍯',
    color: ['#FF4500', '#00CED1'],
  },
  {
    key: 'l-r',
    title: 'L as in Lion vs. R as in Rain',
    examples: ['Lion vs. Rain', 'Light vs. Right', 'Lock vs. Rock'],
    urdu: [
      'آواز زبان کو دانتوں کے پیچھے لگا کر نکالی جاتی ہے. - L',
      'آواز زبان کو موڑ کر نکالی جاتی ہے، گول انداز میں. - R',
    ],
    icon: '🦁',
    color: ['#FF8C00', '#4169E1'],
  },
  {
    key: 'silent',
    title: 'Silent Letters (K, B, L)',
    examples: [
      'K in "Knife" is silent → "نائف"',
      'B in "Lamb" is silent → "لیم"',
      'L in "Half" is silent → "ہاف"',
    ],
    urdu: [
      'کچھ انگریزی الفاظ میں حروف نظر آتے ہیں مگر',
      ' Silent Letters بولے نہیں جاتے. - ان کو',
      'کہتے ہیں.',
    ],
    icon: '🤫',
    color: ['#9370DB', '#3CB371'],
  },
];

const chunkArray = (arr: any[], chunkSize: number): any[][] => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

const minimalPairsPages = chunkArray(minimalPairsData, 2); // 2 cards per page

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
    console.error('Audio playback failed', error);
    onPlaybackFinish();
  }
};

const Lesson2Screen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
  const [showFinishAnimation, setShowFinishAnimation] = useState(false);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

  useEffect(() => {
    // Initialize card animations
    const animations = minimalPairsPages[currentPageIndex].map(() => new Animated.Value(0));
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
        delay: index * 150,
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

  const lessonPages = minimalPairsPages.map((pageData: any[], pageIndex: number) => (
    <View key={`page${pageIndex}`} style={styles.pageContent}>
      {pageData.map((pair: any, cardIndex: number) => (
        <Animated.View 
          key={pair.key} 
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
            colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              {/* Header with Icon and Title */}
              <View style={styles.cardHeader}>
                <LinearGradient
                  colors={pair.color}
                  style={styles.iconGradient}
                >
                  <Text style={styles.cardIcon}>{pair.icon}</Text>
                </LinearGradient>
                <View style={styles.titleContainer}>
                  <Text style={styles.sectionTitle}>{pair.title}</Text>
                </View>
                <Animated.View
                  style={[
                    styles.playButtonContainer,
                    {
                      transform: [{ scale: playingKey === pair.key ? 1.1 : pulseAnim }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.playButtonCircle}
                    disabled={playingKey !== null || isAudioLoading !== null}
                    onPress={async () => {
                      setIsAudioLoading(pair.key);
                      setPlayingKey(pair.key);
                      await playAudioFromText(pair.title, () => {
                        setPlayingKey(null);
                        setIsAudioLoading(null);
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={playingKey === pair.key ? ['#45B7A8', '#58D68D'] : ['#58D68D', '#45B7A8']}
                      style={styles.playButtonGradient}
                    >
                      {isAudioLoading === pair.key ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : playingKey === pair.key ? (
                        <Ionicons name="pause" size={20} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="play" size={20} color="#FFFFFF" />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Examples Section */}
              <View style={styles.examplesBox}>
                <View style={styles.examplesHeader}>
                  <LinearGradient
                    colors={['#58D68D', '#45B7A8']}
                    style={styles.examplesIconGradient}
                  >
                    <Text style={styles.examplesIcon}>📝</Text>
                  </LinearGradient>
                  <Text style={styles.examplesLabel}>Examples:</Text>
                </View>
                {pair.examples.map((ex: string, i: number) => (
                  <View key={i} style={styles.exampleItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.exampleText}>{ex}</Text>
                  </View>
                ))}
              </View>

              {/* Urdu Explanation Section */}
              <View style={styles.urduBox}>
                <View style={styles.urduHeader}>
                  <LinearGradient
                    colors={['#FF6B6B', '#4ECDC4']}
                    style={styles.urduIconGradient}
                  >
                    <Text style={styles.urduIcon}>📖</Text>
                  </LinearGradient>
                  <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
                </View>
                {pair.urdu.map((u: string, i: number) => (
                  <View key={i} style={styles.urduItem}>
                    <View style={styles.urduBullet} />
                    <Text style={styles.urduExplanation}>{u}</Text>
                  </View>
                ))}
              </View>
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
      console.log('Exiting Lesson 2');
    }
  };

  const handleNextOrFinish = () => {
    if (currentPageIndex < lessonPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      // Scroll to top when moving to next page
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      console.log('Lesson 2 Finished!');
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
                <Text style={styles.headerIcon}>🎵</Text>
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Phonics & Sound Confusion</Text>
            <Text style={styles.headerSubtitle}>Master tricky sound differences</Text>
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
            ref={scrollViewRef}
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
                    {currentPageIndex === lessonPages.length - 1 ? 'Great job! You did it!' : 'Next set of sounds →'}
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
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
  },
  cardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F8F9FA',
  },
  cardContent: {
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardIcon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 24,
  },
  playButtonContainer: {
    marginLeft: 12,
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
  examplesBox: {
    backgroundColor: 'rgba(88, 214, 141, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.15)',
  },
  examplesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  examplesIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  examplesIcon: {
    fontSize: 16,
  },
  examplesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#58D68D',
    marginTop: 8,
    marginRight: 12,
  },
  exampleText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  urduBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.15)',
  },
  urduHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  urduIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  urduIcon: {
    fontSize: 16,
  },
  urduExplanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  urduItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  urduBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
    marginTop: 8,
    marginRight: 12,
  },
  urduExplanation: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginBottom: -10,
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#000000',
    fontSize: 14,
    opacity: 0.8,
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

export default Lesson2Screen; 