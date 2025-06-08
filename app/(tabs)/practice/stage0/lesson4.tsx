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

const Lesson4Screen: React.FC = () => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-indexed
    const totalPages = 5; // Common Sight Words, Greetings, Useful Phrases, UI Sight Words, Exercises

    const lessonPages = [
        // Page 1: Common Sight Words
        <View key="page1_common_sight_words" style={styles.pageContent}>
            <Text style={styles.pageTitle}>Common Sight Words</Text>
            <Text style={styles.pageSubtitle}>Essential words for everyday communication, with Urdu translations.</Text>
            <View style={styles.listContainer}>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="text-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>I</Text>
                        <Text style={styles.urduText}>میں</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="text-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>You</Text>
                        <Text style={styles.urduText}>آپ</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="text-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>He</Text>
                        <Text style={styles.urduText}>وہ (مرد)</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="text-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>She</Text>
                        <Text style={styles.urduText}>وہ (عورت)</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="text-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>It</Text>
                        <Text style={styles.urduText}>یہ</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="text-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>We</Text>
                        <Text style={styles.urduText}>ہم</Text>
                    </View>
                </View>
            </View>
        </View>,
        // Page 2: Greetings & Introductions
        <View key="page2_greetings" style={styles.pageContent}>
            <Text style={styles.pageTitle}>Greetings & Introductions</Text>
            <Text style={styles.pageSubtitle}>Learn essential English greetings and introductory phrases with Urdu translations.</Text>
            <View style={styles.listContainer}>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="hand-left-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Hello</Text>
                        <Text style={styles.urduText}>السلام علیکم</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="help-circle-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>How are you?</Text>
                        <Text style={styles.urduText}>تم کیسے ہو؟</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="person-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>My name is Ali</Text>
                        <Text style={styles.urduText}>میرا نام علی ہے</Text>
                    </View>
                </View>
            </View>
        </View>,
        // Page 3: Useful Phrases
        <View key="page3_phrases" style={styles.pageContent}>
            <Text style={styles.pageTitle}>Useful Phrases</Text>
            <View style={styles.listContainer}>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="happy-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>How are you?</Text>
                        <Text style={styles.urduText}>آپ کیسے ہیں؟</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="happy-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>I'm doing well.</Text>
                        <Text style={styles.urduText}>میں ٹھیک ہوں-</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="person-circle-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>What's your name?</Text>
                        <Text style={styles.urduText}>تمہارا نام کیا ہے؟</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="person-circle-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>My name is Aaliyah.</Text>
                        <Text style={styles.urduText}>میرا نام عالیہ ہے-</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="diamond-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Nice to meet you.</Text>
                        <Text style={styles.urduText}>تم سے مل کر خوشی ہوئی-</Text>
                    </View>
                </View>
            </View>
        </View>,
        // Page 4: Sight Words (UI)
        <View key="page4_ui_sight_words" style={styles.pageContent}>
            <Text style={styles.pageTitle}>Sight Words</Text>
            <View style={styles.listContainer}>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="mail-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Inbox</Text>
                        <Text style={styles.urduText}>ان باکس</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="settings-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Settings</Text>
                        <Text style={styles.urduText}>سیٹنگز</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="notifications-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Notifications</Text>
                        <Text style={styles.urduText}>اطلاعات</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="list-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Options</Text>
                        <Text style={styles.urduText}>اختیارات</Text>
                    </View>
                </View>
                <View style={styles.listItem}>
                    <View style={styles.iconContainer}><Ionicons name="keypad-outline" size={28} color="#4A90E2" /></View>
                    <View style={styles.textPairContainer}>
                        <Text style={styles.englishText}>Select</Text>
                        <Text style={styles.urduText}>منتخب کریں</Text>
                    </View>
                </View>
            </View>
        </View>,
        // Page 5: Fill in the blanks Exercise
        <View key="page5_exercise" style={[styles.pageContent, styles.exercisePageContent]}>
            <Text style={styles.pageTitle}>Fill in the blanks</Text>
            <View style={styles.fillBlankContainer}>
                <View style={styles.fillBlankItem}>
                    <Text style={styles.fillBlankSentence}>_____ is a beautiful day.</Text>
                    <TouchableOpacity style={styles.optionButton}><Text style={styles.optionButtonText}>It</Text></TouchableOpacity>
                </View>
                <View style={styles.fillBlankItem}>
                    <Text style={styles.fillBlankSentence}>Can you _____ me?</Text>
                    <TouchableOpacity style={styles.optionButton}><Text style={styles.optionButtonText}>help</Text></TouchableOpacity>
                </View>
                <View style={styles.fillBlankItem}>
                    <Text style={styles.fillBlankSentence}>_____ is my name.</Text>
                    <TouchableOpacity style={styles.optionButton}><Text style={styles.optionButtonText}>This</Text></TouchableOpacity>
                </View>
            </View>
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
            console.log('Lesson 4 Finished!');
            router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
        }
    };

    // Determine the correct header title based on the current page
    let currentHeaderTitle = "Lesson 4";
    if (currentPageIndex === 0) currentHeaderTitle = "Lesson 4: Introduction to Sight Words";
    if (currentPageIndex === 1) currentHeaderTitle = "Lesson 4: Basic Greetings";
    if (currentPageIndex === 2) currentHeaderTitle = "Lesson 4: Everyday Phrases";
    if (currentPageIndex === 3) currentHeaderTitle = "Lesson 4: Sight Words"; // As per image
    if (currentPageIndex === 4) currentHeaderTitle = "Lesson 4: Exercises";


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#111629" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#D2D5E1" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>{currentHeaderTitle}</Text>
                    <View style={{ width: 24 }} />
                </View>

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

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Ensure that lessonPages is an array and currentPageIndex is a valid index */}
                    {Array.isArray(lessonPages) && lessonPages[currentPageIndex] ?
                        lessonPages[currentPageIndex] :
                        <View><Text>Content not available. Please check lessonPages structure.</Text></View>}
                </ScrollView>

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
        height: 8,
        width: 8,
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
    exercisePageContent: {
        alignItems: 'center',
    },
    fillBlankContainer: {
        width: '100%',
    },
    fillBlankItem: {
        marginBottom: 20,
    },
    fillBlankSentence: {
        fontSize: 18,
        color: '#D2D5E1',
        textAlign: 'center',
        marginBottom: 10,
    },
    optionButton: {
        backgroundColor: '#93E893',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignSelf: 'center',
    },
    optionButtonText: {
        color: '#111629',
        fontSize: 16,
        fontWeight: 'bold',
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

export default Lesson4Screen; 