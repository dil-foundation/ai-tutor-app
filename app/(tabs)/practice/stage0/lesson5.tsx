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

const appNavigationData = [
  { english: "Start", urdu: "شروع کریں", icon: "play-outline" },
  { english: "Next", urdu: "اگلا", icon: "arrow-forward-outline" },
  { english: "Submit", urdu: "جمع کرائیں", icon: "checkmark-done-outline" },
  { english: "Speak", urdu: "بولیں", icon: "mic-outline" },
  { english: "Listen", urdu: "سنیں", icon: "volume-medium-outline" },
  { english: "Finish", urdu: "ختم کریں", icon: "flag-outline" },
];

const Lesson5Screen: React.FC = () => {
    const [playingWord, setPlayingWord] = useState<string | null>(null);
    const [showFinishAnimation, setShowFinishAnimation] = useState(false);
    
    // Animation values
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));
    const [cardAnimations, setCardAnimations] = useState<Animated.Value[]>([]);

    useEffect(() => {
        // Initialize card animations
        const animations = appNavigationData.map(() => new Animated.Value(0));
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
                delay: index * 120,
                useNativeDriver: true,
            })
        );

        Animated.parallel(cardAnimationSequence).start();
    }, []);

    const handlePlayAudio = (text: string, key: string) => {
        if (playingWord === key) return;

        setPlayingWord(key);
        playAudioFromText(text, () => setPlayingWord(null));
    };

    const handleGoBack = () => {
        router.back();
    };

    const handleFinish = () => {
        setShowFinishAnimation(true);
        setTimeout(() => {
            router.push('/practice/stage0');
        }, 2000);
    };

    if (showFinishAnimation) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.finishContainer}>
                    <View style={styles.completionIconContainer}>
                        <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
                    </View>
                    <Text style={styles.finishText}>Lesson Complete!</Text>
                    <Text style={styles.finishSubtext}>Great job learning app navigation!</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                <View style={styles.headerTitle}>
                    <Text style={styles.headerText}>App Navigation Words</Text>
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
                <View style={styles.titleIconContainer}>
                    <Ionicons name="phone-portrait" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.title}>App Navigation Words</Text>
                <Text style={styles.subtitle}>Master the English words you'll encounter in app buttons and menus</Text>
            </Animated.View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.pageContent}>
                        {appNavigationData.map((item, index) => (
                            <Animated.View 
                                key={item.english} 
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
                                        </View>
                                    </View>
                                    
                                    <TouchableOpacity
                                        style={styles.playButtonContainer}
                                        onPress={() => handlePlayAudio(item.english, item.english)}
                                        disabled={playingWord === item.english}
                                    >
                                        <View style={styles.playButton}>
                                            {playingWord === item.english ? (
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
                <TouchableOpacity style={styles.navigationButton} onPress={handleFinish}>
                    <LinearGradient colors={Gradients.success} style={styles.buttonGradient}>
                        <View style={styles.buttonContent}>
                            <View style={styles.buttonIconContainer}>
                                <Ionicons name="checkmark" size={20} color={Colors.textOnPrimary} />
                            </View>
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.buttonText}>Complete Lesson</Text>
                                <Text style={styles.buttonSubtext}>Finish app navigation lesson</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

export default Lesson5Screen;

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
    headerTitle: {
        flex: 1,
        alignItems: 'center',
    },
    headerText: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        color: Colors.textPrimary,
    },
    titleContainer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,
    },
    titleIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.base,
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
        lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
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
        padding: Spacing.lg,
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
        width: 50,
        height: 50,
        borderRadius: 25,
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
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    urduText: {
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
        width: 40,
        height: 40,
        borderRadius: 20,
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
