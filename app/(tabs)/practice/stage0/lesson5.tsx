import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react'; // No need for useState if it's a single page
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// const { width } = Dimensions.get('window'); // Not strictly needed for this layout

const Lesson5Screen: React.FC = () => {

    const lessonContent = (
        <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>📱 App Navigation Words</Text>
            <Text style={styles.pageSubtitle}>Learn the English words you'll see in app buttons and menus.</Text>
            <View style={styles.listContainer}>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="play-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Start</Text>
                        <Text style={styles.urduText}>شروع کریں</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="arrow-forward-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Next</Text>
                        <Text style={styles.urduText}>اگلا</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="checkmark-done-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Submit</Text>
                        <Text style={styles.urduText}>جمع کرائیں</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="mic-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Speak</Text>
                        <Text style={styles.urduText}>بولیں</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="volume-medium-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Listen</Text>
                        <Text style={styles.urduText}>سنیں</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="flag-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Finish</Text>
                        <Text style={styles.urduText}>ختم کریں</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const handleGoBack = () => {
        if (router.canGoBack()) router.back();
    };

    const handleFinish = () => {
        console.log('Lesson 5 Finished!');
        router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lesson 5: App UI Words</Text>
                    <View style={{ width: 24 }} /> {/* Spacer for centering title */}
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {lessonContent}
                </ScrollView>

                <TouchableOpacity
                    style={styles.nextButton} // Reusing nextButton style for Finish button
                    onPress={handleFinish}
                >
                    <Text style={styles.nextButtonText}>Finish</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Styles adapted from Lesson 4 for consistency
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1, // Ensure title centers with spacer
        marginRight: 24 + 5, // Width of icon + padding
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContentContainer: {
        paddingBottom: 20, // Space for the finish button not to overlap
    },
    pageContent: {
        paddingVertical: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8, // Reduced margin as subtitle follows directly
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    listContainer: {
        width: '100%',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#E9EFF7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textPairContainer: {
        flex: 1,
    },
    englishText: {
        fontSize: 17,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    urduText: {
        fontSize: 15,
        color: '#4A90E2',
        textAlign: 'left'
    },
    nextButton: { // Reused for the "Finish" button
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        marginHorizontal: 20, // Ensure it has horizontal margins if container doesn't provide them
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Lesson5Screen; 