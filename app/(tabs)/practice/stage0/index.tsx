import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
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
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import { ProgressHelpers, ProgressData } from '../../../../utils/progressTracker';

const { width, height } = Dimensions.get('window');

// Import your local images
// IMPORTANT: Adjust these paths to correctly point to your image files
// The paths in require() are relative to the current file.
// For example, if your images are in 'assets' folder at the root of your project
// and this file is in 'app/lessons/index.tsx', paths would be '../../assets/image.png'
const alphabetImage = require('../../../../assets/images/01.png'); // Adjusted path
const numbersImage = require('../../../../assets/images/02.png');   // Adjusted path
const lesson3Image = require('../../../../assets/images/03.png');   // Adjusted path
const lesson4Image = require('../../../../assets/images/04.png');   // Adjusted path
const lesson5Image = require('../../../../assets/images/05.png');   // Adjusted path

const BeginnerLessonsScreen: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [scaleAnim] = useState(new Animated.Value(0.8));
    // Create individual scale animations for each lesson
    const [scaleAnims] = useState(() => 
        Array(5).fill(0).map(() => new Animated.Value(1))
    );

    useFocusEffect(
        useCallback(() => {
            const fetchProgress = async () => {
                if (!user) {
                    setIsLoading(false);
                    return;
                }
                try {
                    // Force a refresh to bypass cache and get the latest progress
                    const result = await ProgressHelpers.forceRefreshProgress();
                    if (result.success && result.data) {
                        // Define types for clarity
                        type Stage = ProgressData['stages'][0];
                        type Exercise = Stage['exercises'][0];

                        const stage0 = result.data.stages.find((stage: Stage) => stage.stage_id === 0);

                        if (stage0 && stage0.exercises) {
                            const completed: string[] = [];
                            // The exercises from the backend are missing an 'exercise_id'.
                            // We can reliably use the array index since the order is guaranteed.
                            stage0.exercises.forEach((exercise: Exercise, index: number) => {
                                if (exercise.status === 'completed') {
                                    // Lesson IDs are 1-based, so add 1 to the 0-based index.
                                    completed.push(String(index + 1));
                                }
                            });
                            setCompletedLessons(completed);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch Stage 0 progress:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchProgress();
        }, [user])
    );

    useEffect(() => {
        // Animate elements on mount
        if (!isLoading) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isLoading]);

    const handleGoBack = () => {
        // router.back() navigates back in the history stack
        // If coming from practice/index, this will go back there.
        if (router.canGoBack()) {
            router.push({ pathname: '/practice' });
        }
        console.log('Go back pressed');
    };

    const handleStartLesson = (lessonTitle: string, lessonId: string, index: number, alreadyCompleted: boolean) => {
        // Add a small scale animation on press for the specific card
        Animated.sequence([
            Animated.timing(scaleAnims[index], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[index], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        console.log(`Starting lesson: ${lessonTitle} (ID: ${lessonId})`);
        router.push({
            pathname: `/(tabs)/practice/stage0/lesson${lessonId}` as any,
            params: { alreadyCompleted: alreadyCompleted ? '1' : '0' }
        });
        // Example: navigate to a dynamic route like '/learnUnits/1'
        // You would need a file at app/learnUnits/[id].tsx for this to work.


        // Or if you have a specific learn unit detail page like 'learn-unit-detail.tsx'
        // router.push({ pathname: '/learn-unit-detail', params: { id: learnUnitId } });
    };

    // This custom bottom nav press handler will be removed later or its usage re-evaluated.
    const handleBottomNavPress = (path: string) => {
        console.log(`Navigating to ${path}`);
        // For bottom navigation, you typically want to replace the current screen
        // or push to a new tab route depending on your layout.
        // If these are tabs defined in `app/(tabs)/_layout.tsx`, use their direct paths.

    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#58D68D" />
                <Text style={styles.loadingText}>Loading Lessons...</Text>
            </View>
        );
    }

    const lessons = [
        {
            id: '1',
            title: 'Lesson 1: The English Alphabet',
            description: 'Learn the basics of the English alphabet.',
            image: alphabetImage,
            gradient: ['#58D68D', '#45B7A8'] as const,
            icon: 'text-outline'
        },
        {
            id: '2',
            title: 'Lesson 2: Phonics & Sounds',
            description: 'Understand confusing English sounds',
            image: numbersImage,
            gradient: ['#45B7A8', '#3A8B9F'] as const,
            icon: 'volume-high-outline'
        },
        {
            id: '3',
            title: 'Lesson 3: Numbers & Days',
            description: 'Learn numbers, days, colors, and common words',
            image: lesson3Image,
            gradient: ['#3A8B9F', '#2E7D8F'] as const,
            icon: 'calendar-outline'
        },
        {
            id: '4',
            title: 'Lesson 4: Sight Words & Phrases',
            description: 'Know basic English phrases used every day',
            image: lesson4Image,
            gradient: ['#2E7D8F', '#236F7F'] as const,
            icon: 'chatbubbles-outline'
        },
        {
            id: '5',
            title: 'Lesson 5: App Navigation Words',
            description: 'Learn English words used in the app UI',
            image: lesson5Image,
            gradient: ['#236F7F', '#18616F'] as const,
            icon: 'navigate-outline'
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Header */}
            <View style={styles.header}>
                <Animated.View 
                    style={[
                        styles.headerContent,
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
                    <View style={styles.headerTitleContainer}>
                        <LinearGradient
                            colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                            style={styles.headerTitleGradient}
                        >
                            <Ionicons name="library-outline" size={24} color="#58D68D" />
                            <Text style={styles.headerTitle}>Beginner Lessons</Text>
                        </LinearGradient>
                    </View>
                    <View style={{ width: 56 }} />
                </Animated.View>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Section */}
                <Animated.View 
                    style={[
                        styles.welcomeSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                        style={styles.welcomeGradient}
                    >
                        <View style={styles.welcomeIconContainer}>
                            <LinearGradient
                                colors={['#58D68D', '#45B7A8']}
                                style={styles.welcomeIconGradient}
                            >
                                <Ionicons name="school" size={32} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.welcomeTitle}>Welcome to your first steps in English</Text>
                        <Text style={styles.welcomeDescription}>
                            The lessons are designed to introduce you to the basics of English, focusing on essential
                            vocabulary and simple sentence structures.
                        </Text>
                    </LinearGradient>
                </Animated.View>

                {/* Lessons */}
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    return (
                    <Animated.View
                        key={lesson.id}
                        style={[
                            styles.lessonCard,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnims[index] }
                                ],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.lessonButton}
                            onPress={() => handleStartLesson(lesson.title, lesson.id, index, isCompleted)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={lesson.gradient}
                                style={styles.lessonGradient}
                            >
                                <Image source={lesson.image} style={styles.lessonImage} />
                                <View style={styles.lessonContent}>
                                    <View style={styles.lessonHeader}>
                                        <View style={styles.lessonIconContainer}>
                                            <Ionicons name={lesson.icon as any} size={24} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.lessonTextContainer}>
                                            <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                            <Text style={styles.lessonDescription}>{lesson.description}</Text>
                                        </View>
                                    </View>
                                    {!isCompleted && (
                                        <View style={styles.startButtonContainer}>
                                            <LinearGradient
                                                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                                                style={styles.startButtonGradient}
                                            >
                                                <Text style={styles.startButtonText}>Start</Text>
                                                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                            </LinearGradient>
                                        </View>
                                    )}
                                </View>
                                {isCompleted && (
                                    <View style={styles.completedOverlay}>
                                        <Ionicons name="checkmark-circle" size={64} color="rgba(255, 255, 255, 0.9)" />
                                        <Text style={styles.completedText}>Completed</Text>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                )})}

                {/* Progress Info Card */}
                <Animated.View
                    style={[
                        styles.progressCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(88, 214, 141, 0.1)', 'rgba(69, 183, 168, 0.05)']}
                        style={styles.progressGradient}
                    >
                        <View style={styles.progressContent}>
                            <Ionicons name="trending-up" size={32} color="#58D68D" />
                            <Text style={styles.progressTitle}>Track Your Progress</Text>
                            <Text style={styles.progressDescription}>
                                Complete all 5 lessons to unlock advanced stages
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </ScrollView>

            {/* Decorative Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeCircle3} />
            <View style={styles.decorativeCircle4} />
            
            {/* Floating Particles */}
            <View style={styles.particle1} />
            <View style={styles.particle2} />
            <View style={styles.particle3} />
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6C757D',
    },
    container: {
        flex: 1,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    backButton: {
        padding: 8,
    },
    backButtonGradient: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(88, 214, 141, 0.2)',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitleGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(88, 214, 141, 0.2)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#58D68D',
        marginLeft: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    welcomeSection: {
        marginBottom: 30,
    },
    welcomeGradient: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(88, 214, 141, 0.2)',
        backgroundColor: '#F8F9FA',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        alignItems: 'center',
    },
    welcomeIconContainer: {
        marginBottom: 16,
    },
    welcomeIconGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(88, 214, 141, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    welcomeDescription: {
        fontSize: 15,
        color: '#6C757D',
        lineHeight: 22,
        textAlign: 'center',
    },
    lessonCard: {
        marginBottom: 16,
    },
    lessonButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    lessonGradient: {
        borderRadius: 20,
    },
    lessonImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    lessonContent: {
        padding: 20,
        flex: 1,
    },
    lessonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    lessonIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    lessonTextContainer: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    lessonDescription: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        lineHeight: 20,
    },
    startButtonContainer: {
        alignItems: 'flex-end',
    },
    startButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    completedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(46, 204, 113, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    completedText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    progressCard: {
        marginTop: 20,
    },
    progressGradient: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(88, 214, 141, 0.2)',
        backgroundColor: '#F8F9FA',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    progressContent: {
        alignItems: 'center',
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginTop: 12,
        marginBottom: 8,
    },
    progressDescription: {
        fontSize: 14,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 20,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: height * 0.15,
        right: -60,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: height * 0.25,
        left: -40,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    decorativeCircle3: {
        position: 'absolute',
        top: height * 0.7,
        right: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.015)',
    },
    decorativeCircle4: {
        position: 'absolute',
        bottom: height * 0.1,
        right: width * 0.2,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.025)',
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
        top: height * 0.6,
        right: width * 0.15,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#ADB5BD',
        opacity: 0.2,
    },
    particle3: {
        position: 'absolute',
        bottom: height * 0.3,
        left: width * 0.2,
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#CED4DA',
        opacity: 0.25,
    },
});

export default BeginnerLessonsScreen; 