import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
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
    ActivityIndicator,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchAudioFromText, API_ENDPOINTS } from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Supabase image base for lesson 3
const SUPABASE_STAGE0_LESSON3_BASE = 'https://otobfhnqafoyqinjenle.supabase.co/storage/v1/object/public/dil-lms-public/stage-0/lesson-3';
const getLesson3ImageUrl = (category: string, item: any): string => {
  // Determine folder
  let folder = '';
  if (category === 'Numbers') folder = 'numbers';
  else if (category === 'Days of the Week') folder = 'week';
  else if (category === 'Colors') folder = 'colors';
  else if (category === 'Classroom Items') folder = 'class-room-items';

  // Determine filename
  let filename = '';
  if (category === 'Numbers') filename = `${item.number}.png`;
  else filename = `${(item.english || '').toString().trim().replace(/\s+/g, '_')}.png`;

  return `${SUPABASE_STAGE0_LESSON3_BASE}/${folder}/${filename}`;
};

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
    icon: '🔢',
    color: ['#58D68D', '#45B7A8'],
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
    icon: '🗓️',
    color: ['#FF6B6B', '#4ECDC4'],
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
    icon: '🎨',
    color: ['#45B7D1', '#96CEB4'],
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
    icon: '🎒',
    color: ['#FFA07A', '#98D8C8'],
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
    const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
    const [showFinishAnimation, setShowFinishAnimation] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const { user, session } = useAuth();

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [scaleAnim] = useState(new Animated.Value(0.9));
    const [pulseAnim] = useState(new Animated.Value(1));
    const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);
    const [imageStatus, setImageStatus] = useState<Record<string, 'loaded' | 'error' | undefined>>({});

    useEffect(() => {
        // Initialize card animations
        const currentCategory = vocabularyPages[currentPageIndex]?.[0];
        const animations = currentCategory?.items.map(() => new Animated.Value(0)) || [];
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
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Animate cards with stagger
        if (animations.length > 0) {
            const cardAnimations = animations.map((anim: Animated.Value, index: number) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 600,
                    delay: index * 100,
                    useNativeDriver: true,
                })
            );
            Animated.stagger(100, cardAnimations).start();
        }

        // Pulse animation for play buttons
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [currentPageIndex]);

    const renderVocabularyCard = (item: any, index: number, isNumber: boolean = false) => {
        const currentCategory = vocabularyPages[currentPageIndex]?.[0];
        const cardAnim = cardAnimations[index] || new Animated.Value(0);
        const imageKey = isNumber ? String(item.number) : String(item.english);
        const imageUrl = currentCategory ? getLesson3ImageUrl(currentCategory.category, item) : '';

        return (
            <Animated.View
                key={index}
                style={[
                    styles.cardWrapper,
                    {
                        opacity: cardAnim,
                        transform: [
                            { translateY: cardAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0]
                            })},
                            { scale: cardAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1]
                            })}
                        ]
                    }
                ]}
            >
                <View style={styles.cardContainer}>
                    <View style={styles.cardContent}>
                        {/* Banner image like lesson1/lesson2 */}
                        {imageStatus[imageKey] !== 'error' ? (
                            <View style={styles.bannerWrapper}>
                                {imageStatus[imageKey] !== 'loaded' && (
                                    <View style={styles.bannerSkeleton}>
                                        <ActivityIndicator size="small" color="#58D68D" />
                                    </View>
                                )}
                                <Image
                                    source={{ uri: imageUrl }}
                                    onLoad={() => setImageStatus(prev => ({ ...prev, [imageKey]: 'loaded' }))}
                                    onError={() => setImageStatus(prev => ({ ...prev, [imageKey]: 'error' }))}
                                    style={styles.bannerImage}
                                />
                            </View>
                        ) : (
                            <View style={styles.bannerFallback}>
                                <Text style={styles.bannerFallbackText}>{isNumber ? item.number : item.english}</Text>
                            </View>
                        )}
                        <View style={styles.cardHeader}>
                            <View style={styles.cardTextContainer}>
                                {isNumber ? (
                                    <Text style={styles.numberText}>
                                        {item.number} <Text style={styles.pronText}>({item.pron})</Text>
                                    </Text>
                                ) : (
                                    <Text style={styles.englishWord}>
                                        {item.english} <Text style={styles.pronText}>({item.pron})</Text>
                                    </Text>
                                )}
                                {isNumber && <Text style={styles.englishWord}>{item.english}</Text>}
                                <Text style={styles.urduWord}>{item.urdu}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.playButtonContainer}
                                disabled={playingItem !== null || isAudioLoading !== null}
                                onPress={async () => {
                                    const audioText = isNumber ? `${item.number} for ${item.english}` : item.english;
                                    setIsAudioLoading(audioText);
                                    setPlayingItem(audioText);
                                    await playAudioFromText(audioText, () => {
                                      setPlayingItem(null)
                                      setIsAudioLoading(null);
                                    });
                                }}
                                activeOpacity={0.8}
                            >
                                <Animated.View
                                    style={[
                                        styles.playButtonCircle,
                                        {
                                            transform: [{ scale: pulseAnim }]
                                        }
                                    ]}
                                >
                                    <LinearGradient
                                        colors={currentCategory?.color || ['#58D68D', '#45B7A8']}
                                        style={styles.playButtonGradient}
                                    >
                                        {isAudioLoading === (isNumber ? `${item.number} for ${item.english}` : item.english) ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : playingItem === (isNumber ? `${item.number} for ${item.english}` : item.english) ? (
                                            <Ionicons name="pause" size={20} color="#FFFFFF" />
                                        ) : (
                                            <Ionicons name="play" size={20} color="#FFFFFF" />
                                        )}
                                    </LinearGradient>
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Animated.View>
        );
    };

    const renderVocabularyPage = (category: any) => {
        const isNumber = category.category === 'Numbers';
        
        return (
            <View style={styles.pageContent}>
                <View style={styles.categoryHeader}>
                    <LinearGradient
                        colors={category.color}
                        style={styles.categoryIconGradient}
                    >
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </LinearGradient>
                    <View style={styles.categoryTextContainer}>
                        <Text style={styles.categoryTitle}>{category.category}</Text>
                        <Text style={styles.categorySubtitle}>
                            {category.items.length} words to learn
                        </Text>
                    </View>
                </View>
                
                <View style={styles.vocabularyGrid}>
                    {category.items.map((item: any, index: number) => 
                        renderVocabularyCard(item, index, isNumber)
                    )}
                </View>
            </View>
        );
    };

    const renderSummaryPage = () => (
        <View style={styles.summaryPage}>
            <LinearGradient
                colors={['#58D68D', '#45B7A8']}
                style={styles.summaryIconGradient}
            >
                <Text style={styles.summaryIcon}>🎉</Text>
            </LinearGradient>
            
            <Text style={styles.summaryTitle}>Amazing Progress!</Text>
            <Text style={styles.summarySubtitle}>You've learned essential vocabulary</Text>
            
            <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>28</Text>
                    <Text style={styles.statLabel}>Words Learned</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>4</Text>
                    <Text style={styles.statLabel}>Categories</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>100%</Text>
                    <Text style={styles.statLabel}>Completion</Text>
                </View>
            </View>
            
            <View style={styles.achievementList}>
                <Text style={styles.achievementTitle}>What You've Mastered:</Text>
                <View style={styles.achievementItem}>
                    <Text style={styles.achievementIcon}>🔢</Text>
                    <Text style={styles.achievementText}>Numbers 1-10</Text>
                </View>
                <View style={styles.achievementItem}>
                    <Text style={styles.achievementIcon}>🗓️</Text>
                    <Text style={styles.achievementText}>Days of the Week</Text>
                </View>
                <View style={styles.achievementItem}>
                    <Text style={styles.achievementIcon}>🎨</Text>
                    <Text style={styles.achievementText}>Basic Colors</Text>
                </View>
                <View style={styles.achievementItem}>
                    <Text style={styles.achievementIcon}>🎒</Text>
                    <Text style={styles.achievementText}>Classroom Items</Text>
                </View>
            </View>
            
            <Text style={styles.summaryEncouragement}>
                🌟 You're doing fantastic! You now have a solid foundation of essential English vocabulary. 
                Keep practicing and you'll be speaking with confidence in no time!
            </Text>
        </View>
    );

    const lessonPages = [
        ...vocabularyPages.map((page, index) => renderVocabularyPage(page[0])),
        renderSummaryPage()
    ];

    const handleGoBack = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else {
            if (router.canGoBack()) router.back();
        }
    };

    const handleNextOrFinish = async () => {
        if (currentPageIndex < lessonPages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        } else {
            if (isCompleting) return;

            console.log('Lesson 3 Finished! Recording progress...');
            setIsCompleting(true);

            try {
                if (!user || !session) {
                    throw new Error("User not authenticated");
                }
                
                const response = await fetch(API_ENDPOINTS.COMPLETE_LESSON, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        stage_id: 0,
                        exercise_id: 3,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to record progress");
                }
                
                console.log("Progress recorded successfully for Lesson 3!");

            } catch (error) {
                console.error("Error recording lesson completion:", error);
            } finally {
                setShowFinishAnimation(true);
                setTimeout(() => {
                    router.replace('/(tabs)/practice/stage0');
                    setIsCompleting(false);
                }, 3000);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.container}>
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
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <LinearGradient
                            colors={['#58D68D', '#45B7A8']}
                            style={styles.backButtonGradient}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                    
                    <View style={styles.headerContent}>
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={['#58D68D', '#45B7A8']}
                                style={styles.headerIconGradient}
                            >
                                <Text style={styles.headerIcon}>📚</Text>
                            </LinearGradient>
                        </View>
                        <Text style={styles.headerTitle}>Vocabulary Basics</Text>
                        <Text style={styles.headerSubtitle}>Essential words for everyday use</Text>
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
                        disabled={isCompleting}
                    >
                        <LinearGradient
                            colors={isCompleting ? ['#B0B0B0', '#909090'] : ['#58D68D', '#45B7A8', '#58D68D']}
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
                                        {currentPageIndex === lessonPages.length - 1 
                                            ? (isCompleting ? 'Saving...' : 'Complete Lesson') 
                                            : 'Continue'}
                                    </Text>
                                    <Text style={styles.buttonSubtext}>
                                        {currentPageIndex === lessonPages.length - 1 ? 'Great job! You did it!' : 'Next vocabulary set →'}
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
        marginBottom: 20,
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
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
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
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryIconGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    categoryIcon: {
        fontSize: 28,
    },
    categoryTextContainer: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    categorySubtitle: {
        fontSize: 14,
        color: '#6C757D',
    },
    vocabularyGrid: {
        width: '100%',
    },
    cardWrapper: {
        width: '100%',
        marginBottom: 16,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    cardContent: {
        flexDirection: 'column',
    },
    bannerWrapper: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F2F4F5',
        marginBottom: 16,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerSkeleton: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    bannerFallback: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(88, 214, 141, 0.12)',
        marginBottom: 16,
    },
    bannerFallbackText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#58D68D',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTextContainer: {
        flex: 1,
    },
    numberText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    pronText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#6C757D',
    },
    englishWord: {
        fontSize: 20,
        color: '#000000',
        fontWeight: '600',
        marginBottom: 4,
    },
    urduWord: {
        fontSize: 18,
        color: '#6C757D',
        fontWeight: '500',
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
    summaryPage: {
        alignItems: 'center',
        padding: 20,
    },
    summaryIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 12,
    },
    summaryIcon: {
        fontSize: 40,
    },
    summaryTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
    },
    summarySubtitle: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
        marginBottom: 30,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#58D68D',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6C757D',
        textAlign: 'center',
    },
    achievementList: {
        width: '100%',
        marginBottom: 30,
    },
    achievementTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
        textAlign: 'center',
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    achievementIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    achievementText: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '500',
    },
    summaryEncouragement: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 24,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
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

export default Lesson3Screen; 