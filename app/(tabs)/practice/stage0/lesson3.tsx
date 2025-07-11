import { BorderRadius, Colors, Gradients, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
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

const vocabularyData = [
  {
    category: 'Numbers',
    icon: 'calculator-outline',
    items: [
      { number: "1", english: "One", urdu: "ایک", pron: "wun" },
      { number: "2", english: "Two", urdu: "دو", pron: "too" },
      { number: "3", english: "Three", urdu: "تین", pron: "three" },
      { number: "4", english: "Four", urdu: "چار", pron: "for" },
      { number: "5", english: "Five", urdu: "پانچ", pron: "faiv" },
      { number: "6", english: "Six", urdu: "چھ", pron: "siks" },
      { number: "7", english: "Seven", urdu: "سات", pron: "se-ven" },
      { number: "8", english: "Eight", urdu: "آٹھ", pron: "eit" },
      { number: "9", english: "Nine", urdu: "نو", pron: "nain" },
      { number: "10", english: "Ten", urdu: "دس", pron: "ten" },
    ]
  },
  {
    category: 'Days of the Week',
    icon: 'calendar-outline',
    items: [
      { english: "Monday", urdu: "پیر", pron: "mun-day" },
      { english: "Tuesday", urdu: "منگل", pron: "tuz-day" },
      { english: "Wednesday", urdu: "بدھ", pron: "wenz-day" },
      { english: "Thursday", urdu: "جمعرات", pron: "thurz-day" },
      { english: "Friday", urdu: "جمعہ", pron: "frai-day" },
      { english: "Saturday", urdu: "ہفتہ", pron: "sa-tur-day" },
      { english: "Sunday", urdu: "اتوار", pron: "sun-day" },
    ]
  },
  {
    category: 'Colors',
    icon: 'color-palette-outline',
    items: [
      { english: "Red", urdu: "سرخ", pron: "red" },
      { english: "Blue", urdu: "نیلا", pron: "bloo" },
      { english: "Green", urdu: "سبز", pron: "green" },
      { english: "Yellow", urdu: "پیلا", pron: "ye-lo" },
      { english: "Black", urdu: "کالا", pron: "blak" },
      { english: "White", urdu: "سفید", pron: "wait" },
    ]
  },
  {
    category: 'Classroom Items',
    icon: 'school-outline',
    items: [
      { english: "Book", urdu: "کتاب", pron: "buk" },
      { english: "Pen", urdu: "قلم", pron: "pen" },
      { english: "Chair", urdu: "کرسی", pron: "chair" },
      { english: "Table", urdu: "میز", pron: "tei-bl" },
      { english: "Bag", urdu: "بستہ", pron: "bag" },
    ]
  }
];

const chunkArray = (arr: any[], chunkSize: number): any[][] => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

const vocabularyPages = chunkArray(vocabularyData, 1); // 1 category per page

const Lesson3Screen: React.FC = () => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [playingItem, setPlayingItem] = useState<string | null>(null);
    const [showFinishAnimation, setShowFinishAnimation] = useState(false);

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));
    const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

    useEffect(() => {
        // Initialize card animations
        const currentCategory = vocabularyPages[currentPageIndex]?.[0];
        const animations = currentCategory?.items.map(() => new Animated.Value(0)) || [];
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
        if (animations.length > 0) {
            const cardAnimationSequence = animations.map((anim: Animated.Value, index: number) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 400,
                    delay: index * 100,
                    useNativeDriver: true,
                })
            );
            Animated.parallel(cardAnimationSequence).start();
        }
    }, [currentPageIndex]);

    const handlePlayAudio = (text: string, key: string) => {
        if (playingItem === key) return;

        setPlayingItem(key);
        playAudioFromText(text, () => setPlayingItem(null));
    };

    const handleGoBack = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else {
            router.back();
        }
    };

    const handleNextOrFinish = () => {
        if (currentPageIndex < vocabularyPages.length - 1) {
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
                    <Text style={styles.finishSubtext}>Great job learning vocabulary!</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentCategory = vocabularyPages[currentPageIndex]?.[0];

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
                        {currentPageIndex + 1} / {vocabularyPages.length}
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${((currentPageIndex + 1) / vocabularyPages.length) * 100}%`,
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
                <Text style={styles.title}>Basic Vocabulary</Text>
                <Text style={styles.subtitle}>Essential words for everyday use</Text>
            </Animated.View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Category Header */}
                    <View style={styles.categoryHeader}>
                        <View style={styles.categoryIconContainer}>
                            <Ionicons name={currentCategory?.icon as any} size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.categoryTitle}>{currentCategory?.category}</Text>
                    </View>

                    {/* Vocabulary Items */}
                    <View style={styles.pageContent}>
                        {currentCategory?.items.map((item: any, index: number) => (
                            <Animated.View
                                key={index}
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
                                    <View style={styles.cardContent}>
                                        {item.number && (
                                            <View style={styles.numberContainer}>
                                                <Text style={styles.numberText}>{item.number}</Text>
                                            </View>
                                        )}
                                        <View style={styles.textContainer}>
                                            <Text style={styles.englishText}>{item.english}</Text>
                                            <Text style={styles.urduText}>{item.urdu}</Text>
                                            <Text style={styles.pronText}>({item.pron})</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.playButtonContainer}
                                        onPress={() => handlePlayAudio(item.english, `${index}`)}
                                        disabled={playingItem === `${index}`}
                                    >
                                        <View style={styles.playButton}>
                                            {playingItem === `${index}` ? (
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
                                    name={currentPageIndex < vocabularyPages.length - 1 ? "arrow-forward" : "checkmark"}
                                    size={20}
                                    color={Colors.textOnPrimary}
                                />
                            </View>
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.buttonText}>
                                    {currentPageIndex < vocabularyPages.length - 1 ? 'Next Category' : 'Complete Lesson'}
                                </Text>
                                <Text style={styles.buttonSubtext}>
                                    {currentPageIndex < vocabularyPages.length - 1 ? 'Continue learning' : 'Finish lesson'}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

export default Lesson3Screen;

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
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.md,
    },
    categoryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.base,
    },
    categoryTitle: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textPrimary,
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
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    numberContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.base,
    },
    numberText: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textOnPrimary,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: Spacing.sm,
    },
    englishText: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    urduText: {
        fontSize: Typography.fontSize.base,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    pronText: {
        fontSize: Typography.fontSize.sm,
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
