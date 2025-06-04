import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Import router from expo-router
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

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

    const handleGoBack = () => {
        // router.back() navigates back in the history stack
        // If coming from practice/index, this will go back there.
        if (router.canGoBack()) {
            router.back();
        }
        console.log('Go back pressed');
    };

    const handleStartLesson = (lessonTitle: string, lessonId: string) => {
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#000" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Beginner Lessons</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>Welcome to your first steps in English</Text>
                        <Text style={styles.welcomeDescription}>
                            The lessons are designed to introduce you to the basics of English, focusing on essential
                            vocabulary and simple sentence structures.
                        </Text>
                    </View>

                    {/* Lesson 1: The English Alphabet */}
                    <View style={styles.lessonCard}>
                        <Image source={alphabetImage} style={styles.lessonImage} />
                        <View style={styles.lessonContent}>
                            <Text style={styles.lessonTitle}>Lesson 1: The English Alphabet</Text>
                            <Text style={styles.lessonDescription}>Learn the basics of the English alphabet.</Text>
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => handleStartLesson('The English Alphabet', '1')}
                            >
                                <Text style={styles.startButtonText}>Start</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Lesson 2: Phonics & Sounds */}
                    <View style={styles.lessonCard}>
                        <Image source={numbersImage} style={styles.lessonImage} />
                        <View style={styles.lessonContent}>
                            <Text style={styles.lessonTitle}>Lesson 2: Phonics & Sounds</Text>
                            <Text style={styles.lessonDescription}>Understand confusing English sounds</Text>
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => handleStartLesson('Phonics & Sounds', '2')}
                            >
                                <Text style={styles.startButtonText}>Start</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Lesson 3: Numbers & Days */}
                    <View style={styles.lessonCard}>
                        <Image source={lesson3Image} style={styles.lessonImage} />
                        <View style={styles.lessonContent}>
                            <Text style={styles.lessonTitle}>Lesson 3: Numbers & Days</Text>
                            <Text style={styles.lessonDescription}>Learn numbers, days, colors, and common words</Text>
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => handleStartLesson('Numbers & Days', '3')}
                            >
                                <Text style={styles.startButtonText}>Start</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Lesson 4: Sight Words & Phrases */}
                    <View style={styles.lessonCard}>
                        <Image source={lesson4Image} style={styles.lessonImage} />
                        <View style={styles.lessonContent}>
                            <Text style={styles.lessonTitle}>Lesson 4: Sight Words & Phrases</Text>
                            <Text style={styles.lessonDescription}>Know basic English phrases used every day</Text>
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => handleStartLesson('Sight Words & Phrases', '4')}
                            >
                                <Text style={styles.startButtonText}>Start</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Lesson 5: App Navigation Words */}
                    <View style={styles.lessonCard}>
                        <Image source={lesson5Image} style={styles.lessonImage} />
                        <View style={styles.lessonContent}>
                            <Text style={styles.lessonTitle}>Lesson 5: App Navigation Words</Text>
                            <Text style={styles.lessonDescription}>Learn English words used in the app UI</Text>
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => handleStartLesson('App Navigation Words', '5')}
                            >
                                <Text style={styles.startButtonText}>Start</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>

                {/* Custom Bottom Navigation was here, now removed */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F6F7', // Light gray background to match the image
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F6F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        // Add extra padding for Android status bar if not handled by SafeAreaView
        // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        flex: 1, // Allows the title to take available space
        textAlign: 'center', // Center the title
        marginRight: 24, // Account for the back button's width
    },
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 20, // Add space for bottom nav bar
    },
    welcomeSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    welcomeDescription: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    lessonCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3, // For Android shadow
        marginBottom: 20,
        overflow: 'hidden', // Ensures border radius clips image
    },
    lessonImage: {
        width: '100%',
        height: 180, // Fixed height for consistency
        resizeMode: 'cover',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    lessonContent: {
        padding: 15,
        flex: 1,
    },
    lessonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    lessonDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    startButton: {
        backgroundColor: '#E6F0FF', // Light blue background
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignSelf: 'flex-start', // Align button to the left
    },
    startButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // Styles for the bottom navigation bar are now removed
});

export default BeginnerLessonsScreen; 