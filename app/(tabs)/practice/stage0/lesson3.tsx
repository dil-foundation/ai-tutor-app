import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
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
import { fetchAudioFromText } from '../../../../config/api';

const { width } = Dimensions.get('window');

const playAudioFromText = async (text: string, onPlaybackFinish: () => void) => {
  try {
    const fileUri = await fetchAudioFromText(text);
    if (fileUri) {
      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          onPlaybackFinish();
          sound.unloadAsync();
        }
      });
      await sound.playAsync();
    } else {
      onPlaybackFinish();
    }
  } catch (error) {
    console.error("Audio playback failed", error);
    onPlaybackFinish();
  }
};

const numbersData = [
  { number: "1", english: "One", urdu: "ایک", pron: "wun" },
  { number: "2", english: "Two", urdu: "دو", pron: "too" },
  { number: "3", english: "Three", urdu: "تین", pron: "three" },
  { number: "4", english: "Four", urdu: "چار", pron: "for" },
  { number: "5", english: "Five", urdu: "پانچ", pron: "faiv" },
  { number: "6", english: "Six", urdu: "چھ", pron: "siks" },
  { number: "7", english: "Seven", urdu: "سات", pron: "se-ven" },
  { number: "8", english: "Eight", urdu: "آٹھ", pron: "eit" },
  { number: "9", english: "Nine", urdu: "نو", pron: "nain" },
  { number: "10", english: "Ten", urdu: "دس", pron: "ten" },
];

const daysData = [
  { english: "Monday", urdu: "پیر", pron: "mun-day" },
  { english: "Tuesday", urdu: "منگل", pron: "tuz-day" },
  { english: "Wednesday", urdu: "بدھ", pron: "wenz-day" },
  { english: "Thursday", urdu: "جمعرات", pron: "thurz-day" },
  { english: "Friday", urdu: "جمعہ", pron: "frai-day" },
  { english: "Saturday", urdu: "ہفتہ", pron: "sa-tur-day" },
  { english: "Sunday", urdu: "اتوار", pron: "sun-day" },
];

const colorsData = [
  { english: "Red", urdu: "سرخ", pron: "red" },
  { english: "Blue", urdu: "نیلا", pron: "bloo" },
  { english: "Green", urdu: "سبز", pron: "green" },
  { english: "Yellow", urdu: "پیلا", pron: "ye-lo" },
  { english: "Black", urdu: "کالا", pron: "blak" },
  { english: "White", urdu: "سفید", pron: "wait" },
];

const classroomItemsData = [
  { english: "Book", urdu: "کتاب", pron: "buk" },
  { english: "Pen", urdu: "قلم", pron: "pen" },
  { english: "Chair", urdu: "کرسی", pron: "chair" },
  { english: "Table", urdu: "میز", pron: "tei-bl" },
  { english: "Bag", urdu: "بستہ", pron: "bag" },
];

const chunkArray = (arr: any[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

const numbersPages = chunkArray(numbersData, 10);
const daysPages = chunkArray(daysData, 7);
const colorsPages = chunkArray(colorsData, 6);
const classroomItemsPages = chunkArray(classroomItemsData, 5);

const Lesson3Screen: React.FC = () => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [playingItem, setPlayingItem] = useState<string | null>(null);
    const [showFinishAnimation, setShowFinishAnimation] = useState(false);
    const totalPages = 5; // Numbers, Days, Colors, Classroom Items, Summary

    const renderCards = (data: any[], pageData: any[], title: string, isNumber: boolean = false) => {
        return pageData.map((item, index) => (
            <View key={index} style={styles.card}>
                <View style={styles.cardTextContainer}>
                    {isNumber ? (
                        <Text style={styles.numberText}>{item.number} <Text style={styles.pronText}>({item.pron})</Text></Text>
                    ) : (
                        <Text style={styles.englishWord}>{item.english} <Text style={styles.pronText}>({item.pron})</Text></Text>
                    )}
                    {isNumber && <Text style={styles.englishWord}>{item.english}</Text>}
                    <Text style={styles.arabicWord}>{item.urdu}</Text>
                </View>
                <TouchableOpacity
                    style={styles.playButtonCircle}
                    disabled={playingItem !== null}
                    onPress={async () => {
                        const audioText = isNumber ? `${item.number} for ${item.english}` : item.english;
                        setPlayingItem(audioText);
                        await playAudioFromText(audioText, () => setPlayingItem(null));
                    }}
                >
                    {playingItem === (isNumber ? `${item.number} for ${item.english}` : item.english) ? (
                        <Ionicons name="pause" size={24} color="#fff" />
                    ) : (
                        <Ionicons name="play" size={24} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        ));
    };

    const vocabularyPages = [
        // Page 1: Learn Numbers 1-10
        <View key="page1_numbers" style={styles.pageContent}>
            <Text style={styles.stepTitle}>📚 Learn Numbers 1 - 10</Text>
            {numbersPages[0] && renderCards(numbersData, numbersPages[0], "Numbers", true)}
        </View>,
        // Page 2: Learn Days of the Week
        <View key="page2_days" style={styles.pageContent}>
            <Text style={styles.stepTitle}>🗓️ Learn Days of the Week</Text>
            {daysPages[0] && renderCards(daysData, daysPages[0], "Days")}
        </View>,
        // Page 3: Learn Basic Colors
        <View key="page3_colors" style={styles.pageContent}>
            <Text style={styles.stepTitle}>🎨 Learn Basic Colors</Text>
            {colorsPages[0] && renderCards(colorsData, colorsPages[0], "Colors")}
        </View>,
        // Page 4: Common Classroom Items
        <View key="page4_items" style={styles.pageContent}>
            <Text style={styles.stepTitle}>🎒 Common Classroom Items</Text>
            {classroomItemsPages[0] && renderCards(classroomItemsData, classroomItemsPages[0], "Classroom Items")}
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
            setShowFinishAnimation(true);
            // Wait for animation to complete before navigating
            setTimeout(() => {
                router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
            }, 3000); // 3 seconds to allow animation to play
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

                {/* 🎇 Full Screen Spark Animation when finishing lesson */}
                {showFinishAnimation && (
                    <View style={styles.animationOverlay}>
                        <LottieView
                            source={require('../../../../assets/animations/sparkle.json')}
                            autoPlay
                            loop={false}
                            style={styles.fullScreenAnimation}
                        />
                    </View>
                )}
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
        marginTop: 35,
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
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTextContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    numberText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111629',
        marginBottom: 2,
    },
    pronText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#6B7280',
    },
    englishWord: {
        fontSize: 18,
        color: '#111629',
        fontWeight: '600',
        marginBottom: 2,
    },
    arabicWord: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 0,
    },
    playButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#93E893',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
    animationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenAnimation: {
        width: '100%',
        height: '100%',
    },
});

export default Lesson3Screen; 