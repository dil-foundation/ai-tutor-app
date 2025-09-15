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
    ActivityIndicator,
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

const appNavigationData = [
  { english: "Start", urdu: "شروع کریں", icon: "play-outline", color: ['#58D68D', '#45B7A8'] },
  { english: "Next", urdu: "اگلا", icon: "arrow-forward-outline", color: ['#FF6B6B', '#4ECDC4'] },
  { english: "Submit", urdu: "جمع کرائیں", icon: "checkmark-done-outline", color: ['#45B7D1', '#96CEB4'] },
  { english: "Speak", urdu: "بولیں", icon: "mic-outline", color: ['#FFA07A', '#98D8C8'] },
  { english: "Listen", urdu: "سنیں", icon: "volume-medium-outline", color: ['#DDA0DD', '#F0E68C'] },
  { english: "Finish", urdu: "ختم کریں", icon: "flag-outline", color: ['#FFD700', '#87CEEB'] },
];

const Lesson5Screen: React.FC = () => {
    const [playingWord, setPlayingWord] = useState<string | null>(null);
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
        const animations = appNavigationData.map(() => new Animated.Value(0));
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
                delay: index * 120,
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
    }, []);

    const lessonContent = (
        <View style={styles.pageContent}>
            <Animated.View
                style={[
                    styles.titleContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                                        <LinearGradient
                            colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)'] as const}
                            style={styles.titleGradient}
                        >
                            <View style={styles.titleIconContainer}>
                                <LinearGradient
                                    colors={['#58D68D', '#45B7A8'] as const}
                                    style={styles.titleIconGradient}
                                >
                                    <Ionicons name="phone-portrait" size={32} color="#FFFFFF" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.pageTitle}>📱 App Navigation Words</Text>
                            <Text style={styles.pageSubtitle}>Master the English words you'll encounter in app buttons and menus</Text>
                        </LinearGradient>
            </Animated.View>

            <View style={styles.listContainer}>
                {appNavigationData.map(({ english, urdu, icon, color }, index) => (
                    <Animated.View 
                        key={english} 
                        style={[
                            styles.cardWrapper,
                            {
                                opacity: cardAnimations[index] || 0,
                                transform: [
                                    { 
                                        translateY: cardAnimations[index] ? 
                                            cardAnimations[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [30, 0]
                                            }) : 30
                                    },
                                    { scale: cardAnimations[index] || 0.8 }
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FFFFFF', '#F8F9FA']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardContent}>
                                <View style={styles.cardTextContainer}>
                                    <View style={styles.wordContainer}>
                                        <LinearGradient
                                            colors={color as [string, string]}
                                            style={styles.wordGradient}
                                        >
                                            <Text style={styles.englishText}>{english}</Text>
                                        </LinearGradient>
                                        <Text style={styles.urduText}>{urdu}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.iconAndPlayContainer}>
                                    <View style={styles.iconContainer}>
                                        <LinearGradient
                                            colors={color as [string, string]}
                                            style={styles.iconGradient}
                                        >
                                            <Ionicons name={icon as any} size={24} color="#FFFFFF" />
                                        </LinearGradient>
                                    </View>
                                    
                                    <Animated.View
                                        style={[
                                            styles.playButtonContainer,
                                            {
                                                transform: [{ scale: playingWord === english ? 1.1 : pulseAnim }],
                                            },
                                        ]}
                                    >
                                        <TouchableOpacity
                                            style={styles.playButtonCircle}
                                            disabled={playingWord !== null || isAudioLoading !== null}
                                            onPress={async () => {
                                                setIsAudioLoading(english);
                                                setPlayingWord(english);
                                                await playAudioFromText(english, () => {
                                                    setPlayingWord(null)
                                                    setIsAudioLoading(null);
                                                });
                                            }}
                                        >
                                            <LinearGradient
                                                colors={['#58D68D', '#45B7A8']}
                                                style={styles.playButtonGradient}
                                            >
                                                {isAudioLoading === english ? (
                                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                                ) : playingWord === english ? (
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
                ))}
            </View>
        </View>
    );

    const handleGoBack = () => {
        if (router.canGoBack()) router.back();
    };

    const handleFinish = () => {
        console.log('Lesson 5 Finished!');
        setShowFinishAnimation(true);
        // Wait for animation to complete before navigating
        setTimeout(() => {
            router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
        }, 3000); // 3 seconds to allow animation to play
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#111629" />
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
                        <View style={styles.headerIconContainer}>
                            <LinearGradient
                                colors={['#58D68D', '#45B7A8']}
                                style={styles.headerIconGradient}
                            >
                                <Ionicons name="phone-portrait" size={28} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.headerTitle}>Lesson 5: App UI Words</Text>
                        <Text style={styles.headerSubtitle}>Master app navigation vocabulary</Text>
                    </View>
                    
                    <View style={{ width: 44 }} />
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
                        {lessonContent}
                    </ScrollView>
                </Animated.View>

                {/* Finish Button */}
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
                        onPress={handleFinish}
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
                                    <Text style={styles.buttonIcon}>🎉</Text>
                                </View>
                                <View style={styles.buttonTextContainer}>
                                    <Text style={styles.buttonText}>Complete Lesson</Text>
                                    <Text style={styles.buttonSubtext}>Excellent! You've mastered app navigation!</Text>
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

                {/* 🎇 Full Screen Spark Animation when finishing lesson */}
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

// Enhanced Styles with beautiful design patterns
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
        shadowColor: '#58D68D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
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
    titleContainer: {
        width: '100%',
        marginBottom: 30,
    },
    titleGradient: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(88, 214, 141, 0.15)',
        backgroundColor: '#F8F9FA',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 16,
        alignItems: 'center',
    },
    titleIconContainer: {
        marginBottom: 16,
    },
    titleIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#58D68D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
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
        lineHeight: 24,
    },
    listContainer: {
        width: '100%',
    },
    cardWrapper: {
        width: '100%',
        marginBottom: 20,
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
    wordContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    wordGradient: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    englishText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    urduText: {
        fontSize: 18,
        color: '#6C757D',
        fontWeight: '600',
        marginLeft: 4,
    },
    iconAndPlayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 16,
    },
    iconGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    playButtonContainer: {
        marginLeft: 8,
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

export default Lesson5Screen; 