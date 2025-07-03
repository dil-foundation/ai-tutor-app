import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

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
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    // Create individual scale animations for each lesson
    const [scaleAnims] = useState(() => 
        Array(5).fill(0).map(() => new Animated.Value(1))
    );

    useEffect(() => {
        // Animate elements on mount
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
        ]).start();
    }, []);

    const handleGoBack = () => {
        // router.back() navigates back in the history stack
        // If coming from practice/index, this will go back there.
        if (router.canGoBack()) {
            router.back();
        }
        console.log('Go back pressed');
    };

    const handleStartLesson = (lessonTitle: string, lessonId: string, index: number) => {
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
        router.push(`/(tabs)/practice/stage0/lesson${lessonId}` as any);
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
                            colors={['rgba(147, 232, 147, 0.2)', 'rgba(147, 232, 147, 0.1)']}
                            style={styles.backButtonGradient}
                        >
                            <Ionicons name="arrow-back" size={24} color="#93E893" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <LinearGradient
                            colors={['rgba(147, 232, 147, 0.1)', 'rgba(147, 232, 147, 0.05)']}
                            style={styles.headerTitleGradient}
                        >
                            <Ionicons name="library-outline" size={24} color="#93E893" />
                            <Text style={styles.headerTitle}>Beginner Lessons</Text>
                        </LinearGradient>
                    </View>
                    <View style={{ width: 56 }} />
                </Animated.View>

                <ScrollView 
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
                            colors={['rgba(147, 232, 147, 0.1)', 'rgba(147, 232, 147, 0.05)']}
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
                    {lessons.map((lesson, index) => (
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
                                onPress={() => handleStartLesson(lesson.title, lesson.id, index)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={lesson.gradient}
                                    style={styles.lessonGradient}
                                >
                                    <Image source={lesson.image} style={styles.lessonImage} />
                                    <View style={styles.lessonContent}>
                                        <View style={styles.lessonIconContainer}>
                                            <Ionicons name={lesson.icon as any} size={24} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.lessonTextContainer}>
                                            <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                            <Text style={styles.lessonDescription}>{lesson.description}</Text>
                                        </View>
                                        <View style={styles.startButtonContainer}>
                                            <LinearGradient
                                                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                                                style={styles.startButtonGradient}
                                            >
                                                <Text style={styles.startButtonText}>Start</Text>
                                                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                            </LinearGradient>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

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
                            colors={['rgba(147, 232, 147, 0.1)', 'rgba(147, 232, 147, 0.05)']}
                            style={styles.progressGradient}
                        >
                            <View style={styles.progressContent}>
                                <Ionicons name="trending-up" size={32} color="#93E893" />
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#111629',
    },
    container: {
        flex: 1,
        backgroundColor: '#111629',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        backgroundColor: '#111629',
        marginTop: 35,
    },
    backButton: {
        padding: 8,
    },
    backButtonGradient: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(147, 232, 147, 0.2)',
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
        borderColor: 'rgba(147, 232, 147, 0.2)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#93E893',
        marginLeft: 8,
    },
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    welcomeSection: {
        backgroundColor: '#1E293B',
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
    },
    welcomeGradient: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(147, 232, 147, 0.2)',
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
        color: '#93E893',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(147, 232, 147, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    welcomeDescription: {
        fontSize: 15,
        color: '#D2D5E1',
        lineHeight: 22,
        textAlign: 'center',
    },
    lessonCard: {
        backgroundColor: '#1E293B',
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden',
    },
    lessonButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
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
        padding: 15,
        flex: 1,
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
        marginLeft: 16,
    },
    startButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 6,
    },
    progressCard: {
        marginTop: 20,
    },
    progressGradient: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(147, 232, 147, 0.2)',
        alignItems: 'center',
    },
    progressContent: {
        alignItems: 'center',
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#93E893',
        marginTop: 12,
        marginBottom: 8,
    },
    progressDescription: {
        fontSize: 14,
        color: '#D2D5E1',
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
        backgroundColor: 'rgba(147, 232, 147, 0.05)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: height * 0.25,
        left: -40,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(147, 232, 147, 0.03)',
    },
    decorativeCircle3: {
        position: 'absolute',
        top: height * 0.7,
        right: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(147, 232, 147, 0.04)',
    },
    decorativeCircle4: {
        position: 'absolute',
        bottom: height * 0.1,
        right: width * 0.2,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(147, 232, 147, 0.06)',
    },
    particle1: {
        position: 'absolute',
        top: height * 0.3,
        left: width * 0.1,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#93E893',
        opacity: 0.3,
    },
    particle2: {
        position: 'absolute',
        top: height * 0.6,
        right: width * 0.15,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#58D68D',
        opacity: 0.2,
    },
    particle3: {
        position: 'absolute',
        bottom: height * 0.3,
        left: width * 0.2,
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#45B7A8',
        opacity: 0.25,
    },
});

export default BeginnerLessonsScreen; 