import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import LottieView from 'lottie-react-native';
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

// Enhanced data structure with icons and colors
const sightWordsData = [
  { english: "I", urdu: "میں", pron: "aai", icon: "👤", color: ['#FF6B6B', '#4ECDC4'] },
  { english: "You", urdu: "آپ", pron: "yoo", icon: "🤝", color: ['#45B7D1', '#96CEB4'] },
  { english: "He", urdu: "وہ (مرد)", pron: "hee", icon: "👨", color: ['#FFA07A', '#98D8C8'] },
  { english: "She", urdu: "وہ (عورت)", pron: "shee", icon: "👩", color: ['#DDA0DD', '#F0E68C'] },
  { english: "It", urdu: "یہ", pron: "it", icon: "🔍", color: ['#FFD700', '#87CEEB'] },
  { english: "We", urdu: "ہم", pron: "wee", icon: "👥", color: ['#FF6347', '#32CD32'] },
];

const greetingsData = [
  { english: "Hello", urdu: "السلام علیکم", pron: "he-lo", icon: "👋", color: ['#58D68D', '#45B7A8'] },
  { english: "How are you?", urdu: "تم کیسے ہو؟", pron: "how ar yoo", icon: "❓", color: ['#FF6B6B', '#4ECDC4'] },
  { english: "My name is Ali", urdu: "میرا نام علی ہے", pron: "mai neim iz aa-lee", icon: "📝", color: ['#45B7D1', '#96CEB4'] },
];

const phrasesData = [
  { english: "How are you?", urdu: "آپ کیسے ہیں؟", pron: "how ar yoo", icon: "💬", color: ['#FFA07A', '#98D8C8'] },
  { english: "I'm doing well.", urdu: "میں ٹھیک ہوں-", pron: "aaim doo-ing wel", icon: "😊", color: ['#DDA0DD', '#F0E68C'] },
  { english: "What's your name?", urdu: "تمہارا نام کیا ہے؟", pron: "wats yor neim", icon: "🏷️", color: ['#FFD700', '#87CEEB'] },
  { english: "My name is Aaliyah.", urdu: "میرا نام عالیہ ہے-", pron: "mai neim iz aa-lee-ya", icon: "👤", color: ['#FF6347', '#32CD32'] },
  { english: "Nice to meet you.", urdu: "تم سے مل کر خوشی ہوئی-", pron: "nais to meet yoo", icon: "🤗", color: ['#8A2BE2', '#20B2AA'] },
];

const uiWordsData = [
  { english: "Inbox", urdu: "ان باکس", pron: "in-boks", icon: "📥", color: ['#58D68D', '#45B7A8'] },
  { english: "Settings", urdu: "سیٹنگز", pron: "set-ings", icon: "⚙️", color: ['#FF6B6B', '#4ECDC4'] },
  { english: "Notifications", urdu: "اطلاعات", pron: "no-ti-fi-ka-shuns", icon: "🔔", color: ['#45B7D1', '#96CEB4'] },
  { english: "Options", urdu: "اختیارات", pron: "op-shuns", icon: "📋", color: ['#FFA07A', '#98D8C8'] },
  { english: "Select", urdu: "منتخب کریں", pron: "se-lekt", icon: "✅", color: ['#DDA0DD', '#F0E68C'] },
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
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [playingItem, setPlayingItem] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
    const [showFinishAnimation, setShowFinishAnimation] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [scaleAnim] = useState(new Animated.Value(0.9));
    const [pulseAnim] = useState(new Animated.Value(1));
    const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

    useEffect(() => {
        // Initialize card animations based on current page
        let animations: Animated.Value[] = [];
        
        if (currentPageIndex === 0) animations = sightWordsData.map(() => new Animated.Value(0));
        else if (currentPageIndex === 1) animations = greetingsData.map(() => new Animated.Value(0));
        else if (currentPageIndex === 2) animations = phrasesData.map(() => new Animated.Value(0));
        else if (currentPageIndex === 3) animations = uiWordsData.map(() => new Animated.Value(0));
        else if (currentPageIndex === 4) animations = exerciseData.map(() => new Animated.Value(0));
        
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
                            { scale: cardAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1]
                            })}
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardContent}>
                        {/* Header with Icon and Word */}
                        <View style={styles.cardHeader}>
                            <LinearGradient
                                colors={item.color}
                                style={styles.iconGradient}
                            >
                                <Text style={styles.cardIcon}>{item.icon}</Text>
                            </LinearGradient>
                            <View style={styles.wordContainer}>
                                <Text style={styles.englishWord}>
                                    {item.english} 
                                    <Text style={styles.pronText}> ({item.pron})</Text>
                                </Text>
                                <Text style={styles.urduWord}>{item.urdu}</Text>
                            </View>
                            <Animated.View
                                style={[
                                    styles.playButtonContainer,
                                    {
                                        transform: [{ scale: playingItem === item.english ? 1.1 : pulseAnim }],
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.playButtonCircle}
                                    disabled={playingItem !== null || isAudioLoading !== null}
                                    onPress={async () => {
                                        setIsAudioLoading(item.english);
                                        setPlayingItem(item.english);
                                        await playAudioFromText(item.english, () => {
                                          setPlayingItem(null);
                                          setIsAudioLoading(null);
                                        });
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={playingItem === item.english ? ['#45B7A8', '#58D68D'] : ['#58D68D', '#45B7A8']}
                                        style={styles.playButtonGradient}
                                    >
                                        {isAudioLoading === item.english ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : playingItem === item.english ? (
                                            <Ionicons name="pause" size={20} color="#FFFFFF" />
                                        ) : (
                                            <Ionicons name="play" size={20} color="#FFFFFF" />
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    const renderExerciseCard = (exercise: any, index: number) => {
        const cardAnim = cardAnimations[index] || new Animated.Value(0);
        const isCorrect = selectedAnswers[exercise.sentence] === exercise.answer;
        
        return (
            <Animated.View
                key={index}
                style={[
                    styles.exerciseCardWrapper,
                    {
                        opacity: cardAnim,
                        transform: [
                            { 
                                translateY: cardAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            },
                            { scale: cardAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1]
                            })}
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                    style={styles.exerciseCardGradient}
                >
                    <View style={styles.exerciseCardContent}>
                        <View style={styles.exerciseHeader}>
                            <LinearGradient
                                colors={['#58D68D', '#45B7A8']}
                                style={styles.exerciseIconGradient}
                            >
                                <Text style={styles.exerciseIcon}>✏️</Text>
                            </LinearGradient>
                            <Text style={styles.exerciseTitle}>Exercise {index + 1}</Text>
                        </View>
                        
                        <Text style={styles.exerciseSentence}>{exercise.sentence}</Text>
                        
                        <View style={styles.optionsContainer}>
                            {exercise.options.map((option: string, optionIndex: number) => (
                                <TouchableOpacity
                                    key={optionIndex}
                                    style={[
                                        styles.optionButton,
                                        selectedAnswers[exercise.sentence] === option && {
                                            backgroundColor: isCorrect ? '#58D68D' : '#FF6B6B',
                                        }
                                    ]}
                                    onPress={() => setSelectedAnswers({
                                        ...selectedAnswers,
                                        [exercise.sentence]: option
                                    })}
                                >
                                    <Text style={[
                                        styles.optionButtonText,
                                        selectedAnswers[exercise.sentence] === option && {
                                            color: '#FFFFFF'
                                        }
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        {selectedAnswers[exercise.sentence] && (
                            <View style={[
                                styles.feedbackContainer,
                                { backgroundColor: isCorrect ? 'rgba(88, 214, 141, 0.1)' : 'rgba(255, 107, 107, 0.1)' }
                            ]}>
                                <Text style={[
                                    styles.feedbackText,
                                    { color: isCorrect ? '#58D68D' : '#FF6B6B' }
                                ]}>
                                    {isCorrect ? '✅ Correct!' : '❌ Try again!'}
                                </Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    const lessonPages = [
        // Page 1: Common Sight Words
        <View key="page1_common_sight_words" style={styles.pageContent}>
            <View style={styles.pageHeader}>
                <LinearGradient
                    colors={['#58D68D', '#45B7A8']}
                    style={styles.pageIconGradient}
                >
                    <Text style={styles.pageIcon}>👁️</Text>
                </LinearGradient>
                <Text style={styles.pageTitle}>Common Sight Words</Text>
                <Text style={styles.pageSubtitle}>Essential words for everyday communication, with Urdu translations.</Text>
            </View>
            {sightWordsData.map((item, index) => renderWordCard(item, index))}
        </View>,
        
        // Page 2: Greetings & Introductions
        <View key="page2_greetings" style={styles.pageContent}>
            <View style={styles.pageHeader}>
                <LinearGradient
                    colors={['#FF6B6B', '#4ECDC4']}
                    style={styles.pageIconGradient}
                >
                    <Text style={styles.pageIcon}>🤝</Text>
                </LinearGradient>
                <Text style={styles.pageTitle}>Greetings & Introductions</Text>
                <Text style={styles.pageSubtitle}>Learn essential English greetings and introductory phrases with Urdu translations.</Text>
            </View>
            {greetingsData.map((item, index) => renderWordCard(item, index))}
        </View>,
        
        // Page 3: Useful Phrases
        <View key="page3_phrases" style={styles.pageContent}>
            <View style={styles.pageHeader}>
                <LinearGradient
                    colors={['#45B7D1', '#96CEB4']}
                    style={styles.pageIconGradient}
                >
                    <Text style={styles.pageIcon}>💬</Text>
                </LinearGradient>
                <Text style={styles.pageTitle}>Useful Phrases</Text>
                <Text style={styles.pageSubtitle}>Everyday phrases for better communication.</Text>
            </View>
            {phrasesData.map((item, index) => renderWordCard(item, index))}
        </View>,
        
        // Page 4: Sight Words (UI)
        <View key="page4_ui_sight_words" style={styles.pageContent}>
            <View style={styles.pageHeader}>
                <LinearGradient
                    colors={['#FFA07A', '#98D8C8']}
                    style={styles.pageIconGradient}
                >
                    <Text style={styles.pageIcon}>📱</Text>
                </LinearGradient>
                <Text style={styles.pageTitle}>Sight Words</Text>
                <Text style={styles.pageSubtitle}>Common UI words you'll encounter in apps and websites.</Text>
            </View>
            {uiWordsData.map((item, index) => renderWordCard(item, index))}
        </View>,
        
        // Page 5: Fill in the blanks Exercise
        <View key="page5_exercise" style={styles.pageContent}>
            <View style={styles.pageHeader}>
                <LinearGradient
                    colors={['#DDA0DD', '#F0E68C']}
                    style={styles.pageIconGradient}
                >
                    <Text style={styles.pageIcon}>🧩</Text>
                </LinearGradient>
                <Text style={styles.pageTitle}>Practice Exercises</Text>
                <Text style={styles.pageSubtitle}>Test your knowledge with these interactive exercises.</Text>
            </View>
            {exerciseData.map((exercise, index) => renderExerciseCard(exercise, index))}
        </View>,
    ];

    const totalPages = lessonPages.length;

    const handleGoBack = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else {
            if (router.canGoBack()) router.back();
        }
    };

    const handleNextOrFinish = () => {
        if (currentPageIndex < totalPages - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
            // Scroll to top when moving to next page
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else {
            console.log('Lesson 4 Finished!');
            setShowFinishAnimation(true);
            setTimeout(() => {
                router.replace('/(tabs)/practice/stage0');
            }, 3000);
        }
    };

    // Determine the correct header title based on the current page
    let currentHeaderTitle = "Lesson 4";
    if (currentPageIndex === 0) currentHeaderTitle = "Sight Words";
    if (currentPageIndex === 1) currentHeaderTitle = "Greetings";
    if (currentPageIndex === 2) currentHeaderTitle = "Useful Phrases";
    if (currentPageIndex === 3) currentHeaderTitle = "UI Words";
    if (currentPageIndex === 4) currentHeaderTitle = "Exercises";

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
                        <View style={styles.headerIconContainer}>
                            <LinearGradient
                                colors={['#58D68D', '#45B7A8']}
                                style={styles.headerIconGradient}
                            >
                                <Text style={styles.headerIcon}>📚</Text>
                            </LinearGradient>
                        </View>
                        <Text style={styles.headerTitle}>{currentHeaderTitle}</Text>
                        <Text style={styles.headerSubtitle}>Essential English Vocabulary</Text>
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
                                { width: `${((currentPageIndex + 1) / totalPages) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {currentPageIndex + 1} of {totalPages}
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
                                        {currentPageIndex === totalPages - 1 ? '🎉' : '→'}
                                    </Text>
                                </View>
                                <View style={styles.buttonTextContainer}>
                                    <Text style={styles.buttonText}>
                                        {currentPageIndex === totalPages - 1 ? 'Complete Lesson' : 'Continue'}
                                    </Text>
                                    <Text style={styles.buttonSubtext}>
                                        {currentPageIndex === totalPages - 1 ? 'Great job! You did it!' : 'Next section →'}
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
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
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
    headerIconContainer: {
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
    pageHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    pageIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    pageIcon: {
        fontSize: 36,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
        textShadowColor: 'rgba(88, 214, 141, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 22,
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
    wordContainer: {
        flex: 1,
    },
    englishWord: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    urduWord: {
        fontSize: 18,
        color: '#6C757D',
        fontWeight: '500',
    },
    pronText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#58D68D',
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
    exerciseCardWrapper: {
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
    exerciseCardGradient: {
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        backgroundColor: '#F8F9FA',
    },
    exerciseCardContent: {
        flexDirection: 'column',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    exerciseIconGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    exerciseIcon: {
        fontSize: 20,
    },
    exerciseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    exerciseSentence: {
        fontSize: 18,
        color: '#000000',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
    },
    optionButton: {
        backgroundColor: 'rgba(88, 214, 141, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(88, 214, 141, 0.3)',
        minWidth: 80,
    },
    optionButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    feedbackContainer: {
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    feedbackText: {
        fontSize: 16,
        fontWeight: 'bold',
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

export default Lesson4Screen; 