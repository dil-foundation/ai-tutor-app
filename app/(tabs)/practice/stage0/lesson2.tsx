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

const minimalPairsData = [
  {
    key: 'b-v',
    title: 'B as in Ball vs. V as in Van',
    examples: ['Ball vs. Van', 'Bat vs. Vast', 'Boy vs. Voice'],
    urdu: [
      'آواز لبوں کو بند کر کے ادا کی جاتی ہے. - B',
      'آواز دانتوں سے ہونٹ رگڑ کر ادا کی جاتی ہے. - V',
    ],
    icon: 'volume-high-outline',
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
    icon: 'target-outline',
  },
  {
    key: 'p-f',
    title: 'P as in Pen vs. F as in Fan',
    examples: ['Pen vs. Fan', 'Pin vs. Fin', 'Pop vs. Fun'],
    urdu: [
      'آواز ہونٹوں سے زوردار نکلتی ہے. - P',
      'آواز دانتوں اور ہونٹوں کے ہلکے رگڑ سے نکلتی ہے. - F',
    ],
    icon: 'create-outline',
  },
  {
    key: 'd-t',
    title: 'D as in Dog vs. T as in Top',
    examples: ['Dog vs. Top', 'Day vs. Toy', 'Dad vs. Tap'],
    urdu: [
      'آواز نرم اور گہری ہوتی ہے. - D',
      'آواز سخت اور تیز ادا کی جاتی ہے. - T',
    ],
    icon: 'paw-outline',
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
    icon: 'sunny-outline',
  },
  {
    key: 'k-g',
    title: 'K as in King vs. G as in Goat',
    examples: ['King vs. Goat', 'Kit vs. Gift', 'Cold vs. Gold'],
    urdu: [
      'آواز بغیر آواز کے ہوتی ہے، صرف سانس سے. - K',
      'آواز گلے سے آواز کے ساتھ نکلتی ہے. - G',
    ],
    icon: 'crown-outline',
  },
  {
    key: 'ch-sh',
    title: 'CH as in Chair vs. SH as in Ship',
    examples: ['Chair vs. Ship', 'Cheese vs. Sheet', 'Chat vs. Shine'],
    urdu: [
      "آواز 'چ' جیسی ہوتی ہے. - CH",
      "آواز 'ش' جیسی ہوتی ہے، زیادہ نرم اور لمبی. - SH",
    ],
    icon: 'desktop-outline',
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
    icon: 'fast-food-outline',
  },
  {
    key: 'l-r',
    title: 'L as in Lion vs. R as in Rain',
    examples: ['Lion vs. Rain', 'Light vs. Right', 'Lock vs. Rock'],
    urdu: [
      'آواز زبان کو دانتوں کے پیچھے لگا کر نکالی جاتی ہے. - L',
      'آواز زبان کو موڑ کر نکالی جاتی ہے، گول انداز میں. - R',
    ],
    icon: 'paw-outline',
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
    icon: 'eye-off-outline',
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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [showFinishAnimation, setShowFinishAnimation] = useState(false);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

  useEffect(() => {
    // Initialize card animations
    const animations = minimalPairsPages[currentPageIndex].map(() => new Animated.Value(0));
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
        delay: index * 150,
        useNativeDriver: true,
      })
    );

    Animated.parallel(cardAnimationSequence).start();
  }, [currentPageIndex]);

  const handlePlayAudio = (exampleText: string, key: string) => {
    if (playingKey === key) return;

    setPlayingKey(key);
    playAudioFromText(exampleText, () => setPlayingKey(null));
  };

  const handleGoBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else {
      router.back();
    }
  };

  const handleNextOrFinish = () => {
    if (currentPageIndex < minimalPairsPages.length - 1) {
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
          <Text style={styles.finishSubtext}>Great job on mastering pronunciation!</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentPage = minimalPairsPages[currentPageIndex];

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
            {currentPageIndex + 1} / {minimalPairsPages.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentPageIndex + 1) / minimalPairsPages.length) * 100}%`,
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
        <Text style={styles.title}>Pronunciation Practice</Text>
        <Text style={styles.subtitle}>Learn the difference between similar sounds</Text>
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
                key={item.key}
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
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.titleContainer}>
                      <Text style={styles.sectionTitle}>{item.title}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.playButtonContainer}
                      onPress={() => handlePlayAudio(item.examples.join(', '), item.key)}
                      disabled={playingKey === item.key}
                    >
                      <View style={styles.playButton}>
                        {playingKey === item.key ? (
                          <Ionicons name="refresh" size={16} color={Colors.textOnPrimary} />
                        ) : (
                          <Ionicons name="play" size={16} color={Colors.textOnPrimary} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Examples Section */}
                  <View style={styles.examplesBox}>
                    <View style={styles.examplesHeader}>
                      <View style={styles.examplesIconContainer}>
                        <Ionicons name="list-outline" size={16} color={Colors.primary} />
                      </View>
                      <Text style={styles.examplesLabel}>Examples</Text>
                    </View>
                    {item.examples.map((example: string, idx: number) => (
                      <View key={idx} style={styles.exampleItem}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.exampleText}>{example}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Urdu Explanation */}
                  <View style={styles.urduBox}>
                    <View style={styles.urduHeader}>
                      <View style={styles.urduIconContainer}>
                        <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
                      </View>
                      <Text style={styles.urduExplanationTitle}>Urdu Explanation</Text>
                    </View>
                    {item.urdu.map((explanation: string, idx: number) => (
                      <View key={idx} style={styles.urduItem}>
                        <View style={styles.urduBullet} />
                        <Text style={styles.urduExplanation}>{explanation}</Text>
                      </View>
                    ))}
                  </View>
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
                  name={currentPageIndex < minimalPairsPages.length - 1 ? "arrow-forward" : "checkmark"}
                  size={20}
                  color={Colors.textOnPrimary}
                />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>
                  {currentPageIndex < minimalPairsPages.length - 1 ? 'Next Page' : 'Complete Lesson'}
                </Text>
                <Text style={styles.buttonSubtext}>
                  {currentPageIndex < minimalPairsPages.length - 1 ? 'Continue learning' : 'Finish lesson'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Lesson2Screen;

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
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 44,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
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

  examplesBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  examplesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  examplesIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  examplesLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  exampleText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  urduBox: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  urduHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  urduIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  urduExplanationTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  urduItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  urduBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.info,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  urduExplanation: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.normal,
    flex: 1,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
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
