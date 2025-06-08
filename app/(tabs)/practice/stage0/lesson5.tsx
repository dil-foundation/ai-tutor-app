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
            <StatusBar barStyle="light-content" backgroundColor="#111629" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#D2D5E1" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Lesson 5: App UI Words</Text>
                    <View style={{ width: 24 }} />
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
        backgroundColor: '#111629',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#93E893',
        flex: 1,
        textAlign: 'center',
        marginRight: 32,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContentContainer: {
        padding: 20,
    },
    pageContent: {
        padding: 20,
        backgroundColor: '#1E293B',
        borderRadius: 15,
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#93E893',
        textAlign: 'center',
        marginBottom: 10,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#D2D5E1',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContainer: {
        marginTop: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111629',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    iconContainer: {
        marginRight: 15,
    },
    textPairContainer: {
        flex: 1,
    },
    englishText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#93E893',
    },
    urduText: {
        fontSize: 16,
        color: '#D2D5E1',
        marginTop: 4,
    },
    nextButton: {
        backgroundColor: '#93E893',
        paddingVertical: 16,
        marginHorizontal: 20,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    nextButtonText: {
        color: '#111629',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Lesson5Screen; 