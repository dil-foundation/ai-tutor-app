import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const Lesson3Screen: React.FC = () => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-indexed
    const totalPages = 5; // Numbers, Days, Colors, Classroom Items, Summary

    const vocabularyPages = [
        // Page 1: Learn Numbers 1-10
        <View key="page1_numbers" style={styles.pageContent}>
            <Text style={styles.stepTitle}>📚 Learn Numbers 1 - 10</Text>
            <View style={styles.vocabGrid}>
                <View style={styles.vocabRow}>
                    <Text style={[styles.vocabCell, styles.vocabHeader]}>English</Text>
                    <Text style={[styles.vocabCell, styles.vocabHeader]}>Urdu</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>One</Text>
                    <Text style={styles.vocabCell}>ایک</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Two</Text>
                    <Text style={styles.vocabCell}>دو</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Three</Text>
                    <Text style={styles.vocabCell}>تین</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Four</Text>
                    <Text style={styles.vocabCell}>چار</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Five</Text>
                    <Text style={styles.vocabCell}>پانچ</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Six</Text>
                    <Text style={styles.vocabCell}>چھ</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Seven</Text>
                    <Text style={styles.vocabCell}>سات</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Eight</Text>
                    <Text style={styles.vocabCell}>آٹھ</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Nine</Text>
                    <Text style={styles.vocabCell}>نو</Text>
                </View>
                <View style={styles.vocabRow}>
                    <Text style={styles.vocabCell}>Ten</Text>
                    <Text style={styles.vocabCell}>دس</Text>
                </View>
            </View>
        </View>,
        // Page 2: Learn Days of the Week
        <View key="page2_days" style={styles.pageContent}>
            <Text style={styles.stepTitle}>🗓️ Learn Days of the Week</Text>
            <View style={styles.vocabGrid}>
                <View style={styles.vocabRow}>
                    <Text style={[styles.vocabCell, styles.vocabHeader]}>English</Text>
                    <Text style={[styles.vocabCell, styles.vocabHeader]}>Urdu</Text>
                </View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Monday</Text><Text style={styles.vocabCell}>پیر</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Tuesday</Text><Text style={styles.vocabCell}>منگل</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Wednesday</Text><Text style={styles.vocabCell}>بدھ</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Thursday</Text><Text style={styles.vocabCell}>جمعرات</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Friday</Text><Text style={styles.vocabCell}>جمعہ</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Saturday</Text><Text style={styles.vocabCell}>ہفتہ</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Sunday</Text><Text style={styles.vocabCell}>اتوار</Text></View>
            </View>
        </View>,
        // Page 3: Learn Basic Colors
        <View key="page3_colors" style={styles.pageContent}>
            <Text style={styles.stepTitle}>🎨 Learn Basic Colors</Text>
            <View style={styles.vocabGrid}>
                <View style={styles.vocabRow}>
                    <Text style={[styles.vocabCell, styles.vocabHeader]}>English</Text>
                    <Text style={[styles.vocabCell, styles.vocabHeader]}>Urdu</Text>
                </View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Red</Text><Text style={styles.vocabCell}>سرخ</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Blue</Text><Text style={styles.vocabCell}>نیلا</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Green</Text><Text style={styles.vocabCell}>سبز</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Yellow</Text><Text style={styles.vocabCell}>پیلا</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Black</Text><Text style={styles.vocabCell}>کالا</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>White</Text><Text style={styles.vocabCell}>سفید</Text></View>
            </View>
        </View>,
        // Page 4: Common Classroom Items
        <View key="page4_items" style={styles.pageContent}>
            <Text style={styles.stepTitle}>🎒 Common Classroom Items</Text>
            <View style={styles.vocabGrid}>
                <View style={styles.vocabRow}>
                    <Text style={[styles.vocabCell, styles.vocabHeader]}>English</Text>
                    <Text style={[styles.vocabCell, styles.vocabHeader]}>Urdu</Text>
                </View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Book</Text><Text style={styles.vocabCell}>کتاب</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Pen</Text><Text style={styles.vocabCell}>قلم</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Chair</Text><Text style={styles.vocabCell}>کرسی</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Table</Text><Text style={styles.vocabCell}>میز</Text></View>
                <View style={styles.vocabRow}><Text style={styles.vocabCell}>Bag</Text><Text style={styles.vocabCell}>بستہ</Text></View>
            </View>
        </View>,
        // Page 5: Summary
        <View key="page5_summary" style={[styles.pageContent, styles.summaryPage]}>
            <Text style={styles.stepTitle}>✅ Great Job! Here's What You've Learned:</Text>
            <View style={styles.summaryList}>
                <Text style={styles.summaryItem}>🔢 Numbers: One - Ten</Text>
                <Text style={styles.summaryItem}>📅 Days: Monday - Sunday</Text>
                <Text style={styles.summaryItem}>🎨 Colors: Red, Blue, Green, Yellow, Black, White</Text>
                <Text style={styles.summaryItem}>📚 Objects: Book, Pen, Chair, Table, Bag</Text>
            </View>
            <Text style={styles.summaryEncouragement}>
                🌟 You're doing amazing! You now know many English words.
                You are ready to move to the next lesson in Stage 0.
                Keep going—you're one step closer to speaking English with confidence!
            </Text>
        </View>,
    ];

    const handleGoBack = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else {
            if (router.canGoBack()) router.back();
        }
    };

    const handleNextOrFinish = () => {
        if (currentPageIndex < totalPages - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        } else {
            // Handle lesson completion
            console.log('Lesson 3 Finished!');
            router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#111629" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#D2D5E1" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Lesson 3: Vocabulary Basics</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentPageIndex ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>

                {/* Scrollable Content Area */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {vocabularyPages[currentPageIndex] || <View><Text>Loading page...</Text></View>}
                </ScrollView>

                {/* Navigation Button */}
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNextOrFinish}
                >
                    <Text style={styles.nextButtonText}>
                        {currentPageIndex === totalPages - 1 ? 'Finish' : 'Next'}
                    </Text>
                </TouchableOpacity>
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
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#93E893',
    },
    inactiveDot: {
        backgroundColor: '#D2D5E1',
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
    stepTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#93E893',
        textAlign: 'center',
        marginBottom: 20,
    },
    vocabGrid: {
        width: '100%',
    },
    vocabRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#111629',
    },
    vocabCell: {
        fontSize: 18,
        color: '#D2D5E1',
        width: '48%',
        textAlign: 'center',
    },
    vocabHeader: {
        fontWeight: 'bold',
        color: '#93E893',
    },
    summaryPage: {
        alignItems: 'center',
    },
    summaryList: {
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    summaryItem: {
        fontSize: 18,
        color: '#D2D5E1',
        marginBottom: 10,
    },
    summaryEncouragement: {
        fontSize: 16,
        color: '#D2D5E1',
        textAlign: 'center',
        lineHeight: 24,
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

export default Lesson3Screen; 