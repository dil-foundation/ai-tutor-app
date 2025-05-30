import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { useRouter } from 'expo-router';
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

const EnglishLevelScreen = () => {
    const router = useRouter();

    // You would typically use useNavigation from '@react-navigation/native'
    // if this screen is part of a navigation stack to make the back button functional.
    const handleGoBack = () => {
        console.log('Go back pressed');
        router.back();
    };

    const handleViewLearningPlan = () => {
        console.log('View My Learning Plan pressed');
        // Implement navigation or other logic here
        router.push('/(tabs)/practice' as any);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView style={styles.scrollViewContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your English Level</Text>
                    <View style={{ width: 24 }} /> {/* Spacer to balance title */}
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.levelHeading}>A1</Text>
                    <Text style={styles.levelDescription}>
                        Based on your test, you're at the intermediate
                        level.
                    </Text>

                    <Text style={styles.cefrLabel}>CEFR Level</Text>
                    <View style={styles.cefrLevelContainer}>
                        <Text style={styles.cefrLevelText}>1</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>What you can do at this level</Text>
                    <Text style={styles.sectionText}>
                        You can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc. You can deal with most situations likely to arise whilst travelling in an area where the language is spoken. You can produce simple connected text on topics which are familiar or of personal interest. You can describe experiences and events, dreams, hopes & ambitions and briefly give reasons and explanations for opinions and plans.
                    </Text>

                    <Text style={styles.sectionTitle}>What you will learn next</Text>
                    <Text style={styles.sectionText}>
                        You will be able to understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in your field of specialisation. You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party. You can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue giving the advantages and disadvantages of various options.
                    </Text>

                    <TouchableOpacity
                        style={styles.learningPlanButton}
                        onPress={handleViewLearningPlan}
                    >
                        <Text style={styles.learningPlanButtonText}>View My Learning Plan</Text>
                    </TouchableOpacity>

                    <Image
                        source={require('./../../assets/images/illus2.png')} // Replace with a more stable URI or local asset
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollViewContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    levelHeading: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    levelDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 30,
    },
    cefrLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    cefrLevelContainer: {
        width: 30, // Adjust as needed
        height: 30, // Adjust as needed
        borderRadius: 15, // Half of width/height for a circle
        backgroundColor: '#E0E0E0', // Light grey background
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    cefrLevelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    sectionText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginBottom: 20,
    },
    learningPlanButton: {
        backgroundColor: '#007AFF', // Blue button color
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 40, // Space before the image
    },
    learningPlanButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    illustration: {
        width: '100%',
        height: 300, // Adjust height as needed
        alignSelf: 'center',
        marginBottom: 20,
    },
});

export default EnglishLevelScreen;