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

const Lesson2Screen: React.FC = () => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-indexed

    const lessonPages = [
        // Lesson 2 - Page 1 Content
        <View key="page1" style={styles.pageContent}>
            <Text style={styles.sectionTitle}>1. B vs. V</Text>
            <Text style={styles.entryTitle}>🗣️ B as in Ball vs. V as in Van</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• Ball vs. Van</Text>
            <Text style={styles.exampleText}>• Bat vs. Vast</Text>
            <Text style={styles.exampleText}>• Boy vs. Voice</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>آواز لبوں کو بند کر کے ادا کی جاتی ہے. - B</Text>
            <Text style={styles.urduExplanation}>آواز دانتوں سے ہونٹ رگڑ کر ادا کی جاتی ہے. - V</Text>

            <Text style={styles.sectionTitle}>2. T vs. TH</Text>
            <Text style={styles.entryTitle}>🗣️ T as in Time vs. TH as in Think</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• Time vs. Think</Text>
            <Text style={styles.exampleText}>• Ten vs. Thank</Text>
            <Text style={styles.exampleText}>• Toy vs. Thirst</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>زبان کو دانتوں کے پیچھے رکھ کر بولتے ہیں. - T</Text>
            <Text style={styles.urduExplanation}>میں زبان کو دانتوں کے بیچ رگڑ کر نرم آواز</Text>
            <Text style={styles.urduExplanation}>نکالی جاتی ہے. - TH</Text>
        </View>,

        // Lesson 2 - Page 2 Content
        <View key="page2" style={styles.pageContent}>
            <Text style={styles.sectionTitle}>3. P vs. F</Text>
            <Text style={styles.entryTitle}>🗣️ P as in Pen vs. F as in Fan</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• Pen vs. Fan</Text>
            <Text style={styles.exampleText}>• Pin vs. Fin</Text>
            <Text style={styles.exampleText}>• Pop vs. Fun</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>آواز ہونٹوں سے زوردار نکلتی ہے. - P</Text>
            <Text style={styles.urduExplanation}>آواز دانتوں اور ہونٹوں کے ہلکے رگڑ سے نکلتی ہے. - F</Text>

            <Text style={styles.sectionTitle}>4. D vs. T</Text>
            <Text style={styles.entryTitle}>🗣️ D as in Dog vs. T as in Top</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• Dog vs. Top</Text>
            <Text style={styles.exampleText}>• Day vs. Toy</Text>
            <Text style={styles.exampleText}>• Dad vs. Tap</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>آواز نرم اور گہری ہوتی ہے. - D</Text>
            <Text style={styles.urduExplanation}>آواز سخت اور تیز ادا کی جاتی ہے. - T</Text>
        </View>,

        // Lesson 2 - Page 3 Content
        <View key="page3" style={styles.pageContent}>
            <Text style={styles.sectionTitle}>5. S vs. Z</Text>
            <Text style={styles.entryTitle}>🗣️ S as in Sun vs. Z as in Zoo</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• Sun vs. Zoo</Text>
            <Text style={styles.exampleText}>• Sip vs. Zip</Text>
            <Text style={styles.exampleText}>• Sing vs. Zebra</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>آواز بغیر آواز کے سانس سے آتی ہے. - S</Text>
            <Text style={styles.urduExplanation}>آواز سانس اور آواز کے ساتھ ہوتی ہے. - Z، جیسے مکھی</Text>
            <Text style={styles.urduExplanation}>کی بھنبھناہٹ.</Text>

            <Text style={styles.sectionTitle}>6. K vs. G</Text>
            <Text style={styles.entryTitle}>🗣️ K as in King vs. G as in Goat</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• King vs. Goat</Text>
            <Text style={styles.exampleText}>• Kit vs. Gift</Text>
            <Text style={styles.exampleText}>• Cold vs. Gold</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>آواز بغیر آواز کے ہوتی ہے، صرف سانس سے. - K</Text>
            <Text style={styles.urduExplanation}>آواز گلے سے آواز کے ساتھ نکلتی ہے. - G</Text>
        </View>,

        // Lesson 2 - Page 4 Content
        <View key="page4" style={styles.pageContent}>
            <Text style={styles.sectionTitle}>7. CH vs. SH</Text>
            <Text style={styles.entryTitle}>🗣️ CH as in Chair vs. SH as in Ship</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• Chair vs. Ship</Text>
            <Text style={styles.exampleText}>• Cheese vs. Sheet</Text>
            <Text style={styles.exampleText}>• Chat vs. Shine</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>آواز 'چ' جیسی ہوتی ہے. - CH</Text>
            <Text style={styles.urduExplanation}>آواز 'ش' جیسی ہوتی ہے، زیادہ نرم اور لمبی. - SH</Text>

            <Text style={styles.sectionTitle}>8. J vs. Z</Text>
            <Text style={styles.entryTitle}>🗣️ J as in Jam vs. Z as in Zip</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• Jam vs. Zip</Text>
            <Text style={styles.exampleText}>• Joke vs. Zone</Text>
            <Text style={styles.exampleText}>• Jump vs. Zebra</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>آواز 'ج' جیسی ہوتی ہے. - J</Text>
            <Text style={styles.urduExplanation}>آواز سانس اور آواز کے ساتھ نکلتی ہے. - Z، جیسے</Text>
            <Text style={styles.urduExplanation}>بھنبھناہٹ.</Text>
        </View>,

        // Lesson 2 - Page 5 Content (Last Page)
        <View key="page5" style={styles.pageContent}>
            <Text style={styles.sectionTitle}>9. L vs. R</Text>
            <Text style={styles.entryTitle}>🗣️ L as in Lion vs. R as in Rain</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• Lion vs. Rain</Text>
            <Text style={styles.exampleText}>• Light vs. Right</Text>
            <Text style={styles.exampleText}>• Lock vs. Rock</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>آواز زبان کو دانتوں کے پیچھے لگا کر نکالی جاتی ہے. - L</Text>
            <Text style={styles.urduExplanation}>آواز زبان کو موڑ کر نکالی جاتی ہے، گول انداز میں. - R</Text>

            <Text style={styles.sectionTitle}>10. Silent Letters (K, B, L)</Text>
            <Text style={styles.entryTitle}>🗣️ Silent Letters in Words</Text>
            <Text style={styles.entryTitle}>📖 Examples:</Text>
            <Text style={styles.exampleText}>• K in "Knife" is silent → "نائف"</Text>
            <Text style={styles.exampleText}>• B in "Lamb" is silent → "لیم"</Text>
            <Text style={styles.exampleText}>• L in "Half" is silent → "ہاف"</Text>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            <Text style={styles.urduExplanation}>کچھ انگریزی الفاظ میں حروف نظر آتے ہیں مگر</Text>
            <Text style={styles.urduExplanation}> Silent Letters بولے نہیں جاتے. - ان کو</Text>
            <Text style={styles.urduExplanation}>کہتے ہیں.</Text>
        </View>,
    ];

    const handleGoBack = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else {
            if(router.canGoBack()) router.back();
            console.log('Exiting Lesson 2');
        }
    };

    const handleNextOrFinish = () => {
        if (currentPageIndex < lessonPages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        } else {
            console.log('Lesson 2 Finished!');
            router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
        }
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
                    <Text style={styles.headerTitle}>Lesson 2: Phonics & Sound Confusion</Text>
                    <View style={{ width: 24 }} /> {/* Spacer */}
                </View>

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                    {lessonPages.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentPageIndex ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {lessonPages[currentPageIndex]}
                </ScrollView>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNextOrFinish}
                >
                    <Text style={styles.nextButtonText}>
                        {currentPageIndex === lessonPages.length - 1 ? 'Finish' : 'Next'}
                    </Text>
                </TouchableOpacity>
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
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
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
        borderBottomColor: '#E0E0E0',
    },
    paginationDot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#007AFF',
    },
    inactiveDot: {
        backgroundColor: '#C7C7CC',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContentContainer: {
        paddingVertical: 20,
    },
    pageContent: {
        paddingHorizontal: 20,
        width: width, 
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
        marginTop: 15,
        marginBottom: 10,
    },
    entryTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    exampleText: {
        fontSize: 16,
        color: '#444',
        marginLeft: 15,
        marginBottom: 3,
        lineHeight: 22,
    },
    urduExplanationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginTop: 8,
        marginBottom: 3,
    },
    urduExplanation: {
        fontSize: 15,
        color: '#555',
        marginLeft: 15,
        marginBottom: 3,
        textAlign: 'right', 
        lineHeight: 24,
    },
    nextButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 25,
        marginHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Lesson2Screen; 