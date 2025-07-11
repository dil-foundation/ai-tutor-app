import { Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Import your local images
const alphabetImage = require('../../../../assets/images/01.png');
const numbersImage = require('../../../../assets/images/02.png');
const lesson3Image = require('../../../../assets/images/03.png');
const lesson4Image = require('../../../../assets/images/04.png');
const lesson5Image = require('../../../../assets/images/05.png');

const BeginnerLessonsScreen: React.FC = () => {
    const router = useRouter();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    // Create individual scale animations for each lesson
    const [scaleAnims] = useState(() => 
        Array(5).fill(0).map(() => new Animated.Value(1))
    );

    useEffect(() => {
        // Animate elements on mount with subtle animations
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
    }, []);

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        }
    };

    const handleStartLesson = (lessonTitle: string, lessonId: string, index: number) => {
        // Subtle press animation
        Animated.sequence([
            Animated.timing(scaleAnims[index], {
                toValue: 0.98,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[index], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        router.push(`/(tabs)/practice/stage0/lesson${lessonId}` as any);
    };

    const lessons = [
        {
            id: '1',
            title: 'English Alphabet',
            description: 'Master the fundamentals of English letters and pronunciation',
            image: alphabetImage,
            icon: 'text-outline',
            duration: '15 min'
        },
        {
            id: '2',
            title: 'Phonics & Sounds',
            description: 'Learn correct pronunciation and sound patterns',
            image: numbersImage,
            icon: 'volume-high-outline',
            duration: '20 min'
        },
        {
            id: '3',
            title: 'Numbers & Days',
            description: 'Essential vocabulary for daily communication',
            image: lesson3Image,
            icon: 'calendar-outline',
            duration: '18 min'
        },
        {
            id: '4',
            title: 'Common Phrases',
            description: 'Frequently used expressions in English conversation',
            image: lesson4Image,
            icon: 'chatbubbles-outline',
            duration: '25 min'
        },
        {
            id: '5',
            title: 'Navigation Terms',
            description: 'Technical vocabulary for app and digital interfaces',
            image: lesson5Image,
            icon: 'navigate-outline',
            duration: '12 min'
        }
    ];

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
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <View style={styles.backButtonCircle}>
                            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                        </View>
                    </TouchableOpacity>
                    
                    <View style={styles.titleContainer}>
                        <View style={styles.titleCircle}>
                            <Ionicons name="school" size={32} color={Colors.background} />
                        </View>
                        <Text style={styles.headerTitle}>Foundation Course</Text>
                        <Text style={styles.headerSubtitle}>English Basics • Stage 0</Text>
                    </View>
                </View>
            </Animated.View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Introduction Section */}
                <Animated.View 
                    style={[
                        styles.introSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.introTitle}>Build Your Foundation</Text>
                    <Text style={styles.introDescription}>
                        Master essential English skills through structured lessons designed for beginners. Each lesson builds upon the previous one to ensure steady progress.
                    </Text>
                </Animated.View>

                {/* Lessons Grid */}
                <Animated.View
                    style={[
                        styles.lessonsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {lessons.map((lesson, index) => (
                        <Animated.View
                            key={lesson.id}
                            style={[
                                styles.lessonCard,
                                {
                                    transform: [{ scale: scaleAnims[index] }],
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.lessonButton}
                                onPress={() => handleStartLesson(lesson.title, lesson.id, index)}
                                activeOpacity={1}
                            >
                                <View style={styles.lessonImageContainer}>
                                    <Image source={lesson.image} style={styles.lessonImage} />
                                    <View style={styles.lessonOverlay}>
                                        <View style={styles.lessonIconContainer}>
                                            <Ionicons name={lesson.icon as any} size={20} color="#22C55E" />
                                        </View>
                                    </View>
                                </View>
                                
                                <View style={styles.lessonContent}>
                                    <View style={styles.lessonHeader}>
                                        <Text style={styles.lessonNumber}>Lesson {lesson.id}</Text>
                                        <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                                    </View>
                                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                                </View>

                                <View style={styles.startButtonContainer}>
                                    <LinearGradient
                                        colors={['#22C55E', '#22C55E']}
                                        style={styles.startButton}
                                    >
                                        <Text style={styles.startButtonText}>Start</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                    </LinearGradient>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </Animated.View>

                {/* Progress Section */}
                <Animated.View
                    style={[
                        styles.progressSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.progressHeader}>
                        <View style={styles.progressIconContainer}>
                            <Ionicons name="trending-up" size={24} color="#22C55E" />
                        </View>
                        <View style={styles.progressTextContainer}>
                            <Text style={styles.progressTitle}>Your Learning Journey</Text>
                            <Text style={styles.progressDescription}>
                                Complete all lessons to unlock intermediate content
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginBottom: 20,
    },
    headerContent: {
        alignItems: 'center',
        width: '100%',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 10,
    },
    backButtonCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    titleCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.base,
        ...Shadows.md,
    },
    headerTitle: {
        fontSize: Typography.fontSize['4xl'],
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        fontSize: Typography.fontSize.base,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontWeight: Typography.fontWeight.normal,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 32,
    },
    introSection: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    introTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#04060D',
        marginBottom: 12,
        lineHeight: 34,
    },
    introDescription: {
        fontSize: 16,
        color: '#5A636E',
        lineHeight: 24,
        fontWeight: '400',
    },
    lessonsContainer: {
        paddingHorizontal: 24,
    },
    lessonCard: {
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DBE2EA',
        overflow: 'hidden',
        shadowColor: '#04060D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    lessonButton: {
        overflow: 'hidden',
    },
    lessonImageContainer: {
        position: 'relative',
        height: 120,
    },
    lessonImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    lessonOverlay: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    lessonIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#04060D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lessonContent: {
        padding: 20,
    },
    lessonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    lessonNumber: {
        fontSize: 12,
        fontWeight: '600',
        color: '#22C55E',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    lessonDuration: {
        fontSize: 12,
        color: '#5A636E',
        fontWeight: '500',
    },
    lessonTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#04060D',
        marginBottom: 6,
        lineHeight: 26,
    },
    lessonDescription: {
        fontSize: 14,
        color: '#5A636E',
        lineHeight: 20,
        fontWeight: '400',
        marginBottom: 16,
    },
    startButtonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    startButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    progressSection: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        marginTop: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DBE2EA',
    },
    progressIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8FDF9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    progressTextContainer: {
        flex: 1,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#04060D',
        marginBottom: 4,
    },
    progressDescription: {
        fontSize: 14,
        color: '#5A636E',
        lineHeight: 20,
        fontWeight: '400',
    },
});

export default BeginnerLessonsScreen; 
