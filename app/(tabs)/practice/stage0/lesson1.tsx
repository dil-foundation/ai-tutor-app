import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Gradients, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Audio } from 'expo-av';
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
  const [slideAnim] = useState(new Animated.Value(20));
  const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

  useEffect(() => {
    // Initialize card animations
    const animations = alphabetPages[currentPageIndex].map(() => new Animated.Value(0));
    setCardAnimations(animations);

    // Subtle animations for professional feel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate cards with stagger
    const cardAnimationSequence = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.parallel(cardAnimationSequence).start();
  }, [currentPageIndex]);

  const handlePlayAudio = (letter: string, word: string) => {
    if (playingLetter === letter) return;

    setPlayingLetter(letter);
    playAudioFromText(`${letter} for ${word}`, () => setPlayingLetter(null));
  };

  const handleGoBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else {
      router.back();
    }
  };

  const handleNextOrFinish = () => {
    if (currentPageIndex < alphabetPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      setShowFinishAnimation(true);
      setTimeout(() => {
        router.push('/practice/stage0');
      }, 2000);
    }
  };

  if (showFinishAnimation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishContainer}>
          <View style={styles.completionIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
          <Text style={styles.finishText}>Lesson Complete!</Text>
          <Text style={styles.finishSubtext}>Great job learning the alphabet!</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentPage = alphabetPages[currentPageIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentPageIndex + 1} / {alphabetPages.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentPageIndex + 1) / alphabetPages.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>English Alphabet</Text>
        <Text style={styles.subtitle}>Learn each letter with pronunciation</Text>
      </Animated.View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageContent}>
            {currentPage.map((item, index) => (
              <Animated.View
                key={item.letter}
                style={[
                  styles.cardWrapper,
                  {
                    opacity: cardAnimations[index] || 0,
                    transform: [
                      {
                        translateY: cardAnimations[index]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }) || 0,
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.card}>
                  <View style={styles.cardTextContainer}>
                    <View style={styles.letterContainer}>
                      <View style={styles.letterCircle}>
                        <Text style={styles.alphabetLetter}>{item.letter}</Text>
                      </View>
                      <Text style={styles.pronText}>({item.pron})</Text>
                    </View>
                    <Text style={styles.englishWord}>{item.word}</Text>
                    <Text style={styles.urduWord}>{item.urdu}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.playButtonContainer}
                    onPress={() => handlePlayAudio(item.letter, item.word)}
                    disabled={playingLetter === item.letter}
                  >
                    <View style={styles.playButton}>
                      {playingLetter === item.letter ? (
                        <Ionicons name="refresh" size={16} color={Colors.textOnPrimary} />
                      ) : (
                        <Ionicons name="play" size={16} color={Colors.textOnPrimary} />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </View>

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
        <TouchableOpacity style={styles.navigationButton} onPress={handleNextOrFinish}>
          <LinearGradient colors={Gradients.success} style={styles.buttonGradient}>
            <View style={styles.buttonContent}>
              <View style={styles.buttonIconContainer}>
                <Ionicons
                  name={currentPageIndex < alphabetPages.length - 1 ? "arrow-forward" : "checkmark"}
                  size={20}
                  color={Colors.textOnPrimary}
                />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>
                  {currentPageIndex < alphabetPages.length - 1 ? 'Next Letters' : 'Complete Lesson'}
                </Text>
                <Text style={styles.buttonSubtext}>
                  {currentPageIndex < alphabetPages.length - 1 ? 'Continue learning' : 'Finish lesson'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Lesson1Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  finishContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  completionIconContainer: {
    marginBottom: Spacing.lg,
  },
  finishText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  finishSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  pageContent: {
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    marginBottom: Spacing.base,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
    ...Shadows.base,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: Spacing.sm,
  },
  letterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  letterCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  alphabetLetter: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textOnPrimary,
  },
  pronText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  englishWord: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  urduWord: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  playButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  navigationButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  buttonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  buttonSubtext: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.sm,
    opacity: 0.9,
  },
});
