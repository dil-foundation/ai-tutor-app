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

// Enhanced data structure with icons
const sightWordsData = [
  { english: "I", urdu: "میں", pron: "aai", icon: "person-outline" },
  { english: "You", urdu: "آپ", pron: "yoo", icon: "people-outline" },
  { english: "He", urdu: "وہ (مرد)", pron: "hee", icon: "man-outline" },
  { english: "She", urdu: "وہ (عورت)", pron: "shee", icon: "woman-outline" },
  { english: "It", urdu: "یہ", pron: "it", icon: "locate-outline" },
  { english: "We", urdu: "ہم", pron: "wee", icon: "people-outline" },
];

const greetingsData = [
  { english: "Hello", urdu: "السلام علیکم", pron: "he-lo", icon: "hand-right-outline" },
  { english: "How are you?", urdu: "تم کیسے ہو؟", pron: "how ar yoo", icon: "help-outline" },
  { english: "My name is Ali", urdu: "میرا نام علی ہے", pron: "mai neim iz aa-lee", icon: "person-add-outline" },
];

const phrasesData = [
  { english: "How are you?", urdu: "آپ کیسے ہیں؟", pron: "how ar yoo", icon: "chatbox-outline" },
  { english: "I'm doing well.", urdu: "میں ٹھیک ہوں-", pron: "aaim doo-ing wel", icon: "happy-outline" },
  { english: "What's your name?", urdu: "تمہارا نام کیا ہے؟", pron: "wats yor neim", icon: "text-outline" },
  { english: "My name is Aaliyah.", urdu: "میرا نام عالیہ ہے-", pron: "mai neim iz aa-lee-ya", icon: "person-outline" },
  { english: "Nice to meet you.", urdu: "تم سے مل کر خوشی ہوئی-", pron: "nais to meet yoo", icon: "handshake-outline" },
];

const uiWordsData = [
  { english: "Inbox", urdu: "ان باکس", pron: "in-boks", icon: "mail-outline" },
  { english: "Settings", urdu: "سیٹنگز", pron: "set-ings", icon: "settings-outline" },
  { english: "Notifications", urdu: "اطلاعات", pron: "no-ti-fi-ka-shuns", icon: "notifications-outline" },
  { english: "Options", urdu: "اختیارات", pron: "op-shuns", icon: "options-outline" },
  { english: "Select", urdu: "منتخب کریں", pron: "se-lekt", icon: "checkmark-outline" },
];

const exerciseData = [
  { sentence: "_____ is a beautiful day.", answer: "It", options: ["It", "I", "You", "We"] },
  { sentence: "Can you _____ me?", answer: "help", options: ["help", "see", "call", "find"] },
  { sentence: "_____ is my name.", answer: "This", options: ["This", "That", "It", "What"] },
];

const chunkArray = (arr: any[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

const Lesson4Screen: React.FC = () => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [playingItem, setPlayingItem] = useState<string | null>(null);
    const [showFinishAnimation, setShowFinishAnimation] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));
    const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

    const pageData = [sightWordsData, greetingsData, phrasesData, uiWordsData, exerciseData];
    const pageTitle = ["Sight Words", "Greetings", "Common Phrases", "UI Words", "Practice"];

    useEffect(() => {
        // Initialize card animations based on current page
        const animations = pageData[currentPageIndex].map(() => new Animated.Value(0));
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

    const handlePlayAudio = (text: string, key: string) => {
        if (playingItem === key) return;

        setPlayingItem(key);
        playAudioFromText(text, () => setPlayingItem(null));
    };

    const handleAnswerSelect = (exerciseIndex: number, selectedOption: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [exerciseIndex]: selectedOption
        }));
    };

    const handleGoBack = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else {
            router.back();
        }
    };

    const handleNextOrFinish = () => {
        if (currentPageIndex < pageData.length - 1) {
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
                    <Text style={styles.finishSubtext}>Great job learning phrases!</Text>
                </View>
            </SafeAreaView>
        );
    }

    const renderWordCard = (item: any, index: number) => {
        const cardAnim = cardAnimations[index] || new Animated.Value(0);
        
        return (
            <Animated.View
                key={item.english}
                style={[
                    styles.cardWrapper,
                    {
                        opacity: cardAnim,
                        transform: [
                            { 
                                translateY: cardAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.englishText}>{item.english}</Text>
                            <Text style={styles.urduText}>{item.urdu}</Text>
                            <Text style={styles.pronText}>({item.pron})</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.playButtonContainer}
                        onPress={() => handlePlayAudio(item.english, item.english)}
                        disabled={playingItem === item.english}
                    >
                        <View style={styles.playButton}>
                            {playingItem === item.english ? (
                                <Ionicons name="refresh" size={16} color={Colors.textOnPrimary} />
                            ) : (
                                <Ionicons name="play" size={16} color={Colors.textOnPrimary} />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const renderExerciseCard = (exercise: any, index: number) => {
        const cardAnim = cardAnimations[index] || new Animated.Value(0);
        const isCorrect = selectedAnswers[index] === exercise.answer;

        return (
            <Animated.View
                key={index}
                style={[
                    styles.cardWrapper,
                    {
                        opacity: cardAnim,
                        transform: [
                            { 
                                translateY: cardAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.exerciseCard}>
                    <Text style={styles.exerciseText}>{exercise.sentence}</Text>
                    <View style={styles.optionsContainer}>
                        {exercise.options.map((option: string, optionIndex: number) => (
                            <TouchableOpacity
                                key={optionIndex}
                                style={[
                                    styles.optionButton,
                                    selectedAnswers[index] === option && styles.selectedOption,
                                    selectedAnswers[index] === option && isCorrect && styles.correctOption,
                                    selectedAnswers[index] === option && !isCorrect && styles.incorrectOption,
                                ]}
                                onPress={() => handleAnswerSelect(index, option)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    selectedAnswers[index] === option && styles.selectedOptionText,
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Animated.View>
        );
    };

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
                        {currentPageIndex + 1} / {pageData.length}
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${((currentPageIndex + 1) / pageData.length) * 100}%`,
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
                <Text style={styles.title}>{pageTitle[currentPageIndex]}</Text>
                <Text style={styles.subtitle}>Essential words and phrases for communication</Text>
            </Animated.View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.pageContent}>
                        {currentPageIndex === 4 ? (
                            // Exercise page
                            pageData[currentPageIndex].map((item: any, index: number) => 
                                renderExerciseCard(item, index)
                            )
                        ) : (
                            // Word/phrase pages
                            pageData[currentPageIndex].map((item: any, index: number) => 
                                renderWordCard(item, index)
                            )
                        )}
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
                                    name={currentPageIndex < pageData.length - 1 ? "arrow-forward" : "checkmark"}
                                    size={20}
                                    color={Colors.textOnPrimary}
                                />
                            </View>
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.buttonText}>
                                    {currentPageIndex < pageData.length - 1 ? 'Next Section' : 'Complete Lesson'}
                                </Text>
                                <Text style={styles.buttonSubtext}>
                                    {currentPageIndex < pageData.length - 1 ? 'Continue learning' : 'Finish lesson'}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

export default Lesson4Screen;

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
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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

    exerciseCard: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.base,
    },
    exerciseText: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    optionButton: {
        width: '48%',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    correctOption: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    incorrectOption: {
        backgroundColor: Colors.error,
        borderColor: Colors.error,
    },
    optionText: {
        fontSize: Typography.fontSize.base,
        color: Colors.textPrimary,
        fontWeight: Typography.fontWeight.medium,
    },
    selectedOptionText: {
        color: Colors.textOnPrimary,
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
