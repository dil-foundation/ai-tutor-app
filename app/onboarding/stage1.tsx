import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
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

const LevelOneScreen = () => {
    // You would typically use useNavigation from '@react-navigation/native'
    // if this screen is part of a navigation stack to make the back button functional.
    const handleGoBack = () => {
        console.log('Go back pressed');
        // navigation.goBack(); // Uncomment this line if using React Navigation
    };

    const handleActivityStart = (activityName: string) => {
        console.log(`Starting ${activityName}`);
        // Implement navigation or other logic specific to each activity
    };

    // Placeholder for bottom navigation handler
    const handleBottomNavPress = (tabName: string) => {
        console.log(`Navigating to ${tabName}`);
        // Implement actual navigation logic here
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Stage 1</Text>
                    <View style={{ width: 24 }} /> {/* Spacer to balance title */}
                </View>

                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {/* Level Title and Goal */}
                    <View style={styles.topSection}>
                        <Text style={styles.levelHeading}>A1 Beginner</Text>
                        <Text style={styles.goalText}>
                            Goal: Build confidence in using basic phrases and pronunciation
                        </Text>
                    </View>

                    {/* Repeat After Me Card */}
                    <View style={styles.activityCard}>
                        <View style={styles.activityTextContent}>
                            <Text style={styles.activityTitle}>Repeat After Me</Text>
                            <Text style={styles.activityDescription}>
                                Practice speaking by repeating phrases
                            </Text>
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => handleActivityStart('Repeat After Me')}
                            >
                                <Text style={styles.startButtonText}>Start</Text>
                                <Ionicons name="arrow-forward" size={16} color="#007AFF" style={styles.startButtonIcon} />
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={require('./../../assets/images/s1.png')} // Replace with your image URI or local asset
                            style={styles.activityImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Quick Response Card */}
                    <View style={styles.activityCard}>
                        <View style={styles.activityTextContent}>
                            <Text style={styles.activityTitle}>Quick Response</Text>
                            <Text style={styles.activityDescription}>
                                Answer simple questions quickly
                            </Text>
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => handleActivityStart('Quick Response')}
                            >
                                <Text style={styles.startButtonText}>Start</Text>
                                <Ionicons name="arrow-forward" size={16} color="#007AFF" style={styles.startButtonIcon} />
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={require('./../../assets/images/s2.png')} // Replace with your image URI or local asset
                            style={styles.activityImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Listen and Reply Card */}
                    <View style={styles.activityCard}>
                        <View style={styles.activityTextContent}>
                            <Text style={styles.activityTitle}>Listen and Reply</Text>
                            <Text style={styles.activityDescription}>
                                Improve listening skills by responding to audio
                            </Text>
                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={() => handleActivityStart('Listen and Reply')}
                            >
                                <Text style={styles.startButtonText}>Start</Text>
                                <Ionicons name="arrow-forward" size={16} color="#007AFF" style={styles.startButtonIcon} />
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={require('./../../assets/images/s3.png')} // Replace with your image URI or local asset
                            style={styles.activityImage}
                            resizeMode="contain"
                        />
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNavBar}>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleBottomNavPress('Learn')}>
                        <Ionicons name="school-outline" size={24} color="#666" />
                        <Text style={styles.navText}>Learn</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleBottomNavPress('Practice')}>
                        <MaterialCommunityIcons name="chat-processing-outline" size={24} color="#007AFF" />
                        <Text style={[styles.navText, styles.activeNavText]}>Practice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleBottomNavPress('Progress')}>
                        <Ionicons name="stats-chart-outline" size={24} color="#666" />
                        <Text style={styles.navText}>Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleBottomNavPress('Profile')}>
                        <Ionicons name="person-outline" size={24} color="#666" />
                        <Text style={styles.navText}>Profile</Text>
                    </TouchableOpacity>
                </View>
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
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 20, // Add some padding at the bottom of the scroll view
    },
    topSection: {
        marginTop: 20,
        marginBottom: 30,
    },
    levelHeading: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    goalText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3, // For Android shadow
        marginBottom: 20,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activityTextContent: {
        flex: 1,
        marginRight: 15,
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    activityDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        lineHeight: 20,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F0FF', // Light blue background for the button
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: 'flex-start', // Align button to the start
    },
    startButtonText: {
        color: '#007AFF', // Blue text color
        fontSize: 14,
        fontWeight: '600',
        marginRight: 5,
    },
    startButtonIcon: {
        // No additional styling needed, color is set inline
    },
    activityImage: {
        width: 100, // Fixed width for the image
        height: 100, // Fixed height for the image
        borderRadius: 10,
        // borderWidth: 1, // Optional: for debugging image bounds
        // borderColor: 'red', // Optional: for debugging image bounds
    },
    bottomNavBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
    },
    navItem: {
        alignItems: 'center',
        paddingVertical: 5,
        flex: 1,
    },
    navText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    activeNavText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default LevelOneScreen;