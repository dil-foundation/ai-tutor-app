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

import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
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

// Data for each page
const sightWordsData = [
  { english: "I", urdu: "میں", pron: "aai" },
  { english: "You", urdu: "آپ", pron: "yoo" },
  { english: "He", urdu: "وہ (مرد)", pron: "hee" },
  { english: "She", urdu: "وہ (عورت)", pron: "shee" },
  { english: "It", urdu: "یہ", pron: "it" },
  { english: "We", urdu: "ہم", pron: "wee" },
];

const greetingsData = [
  { english: "Hello", urdu: "السلام علیکم", pron: "he-lo" },
  { english: "How are you?", urdu: "تم کیسے ہو؟", pron: "how ar yoo" },
  { english: "My name is Ali", urdu: "میرا نام علی ہے", pron: "mai neim iz aa-lee" },
];

const phrasesData = [
  { english: "How are you?", urdu: "آپ کیسے ہیں؟", pron: "how ar yoo" },
  { english: "I'm doing well.", urdu: "میں ٹھیک ہوں-", pron: "aaim doo-ing wel" },
  { english: "What's your name?", urdu: "تمہارا نام کیا ہے؟", pron: "wats yor neim" },
  { english: "My name is Aaliyah.", urdu: "میرا نام عالیہ ہے-", pron: "mai neim iz aa-lee-ya" },
  { english: "Nice to meet you.", urdu: "تم سے مل کر خوشی ہوئی-", pron: "nais to meet yoo" },
];

const uiWordsData = [
  { english: "Inbox", urdu: "ان باکس", pron: "in-boks" },
  { english: "Settings", urdu: "سیٹنگز", pron: "set-ings" },
  { english: "Notifications", urdu: "اطلاعات", pron: "no-ti-fi-ka-shuns" },
  { english: "Options", urdu: "اختیارات", pron: "op-shuns" },
  { english: "Select", urdu: "منتخب کریں", pron: "se-lekt" },
];

const chunkArray = (arr: any[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

const Lesson4Screen: React.FC = () => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [playingItem, setPlayingItem] = useState<string | null>(null);
    const [showFinishAnimation, setShowFinishAnimation] = useState(false);

    const lessonPages = [
        // Page 1: Common Sight Words
        <View key="page1_common_sight_words" style={styles.pageContent}>
            <Text style={styles.pageTitle}>Common Sight Words</Text>
            <Text style={styles.pageSubtitle}>Essential words for everyday communication, with Urdu translations.</Text>
            {sightWordsData.map(({ english, urdu, pron }) => (
                <View key={english} style={styles.card}>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.englishWord}>{english} <Text style={styles.pronText}>({pron})</Text></Text>
                        <Text style={styles.arabicWord}>{urdu}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.playButtonCircle}
                        disabled={playingItem !== null}
                        onPress={async () => {
                            setPlayingItem(english);
                            await playAudioFromText(english, () => setPlayingItem(null));
                        }}
                    >
                        {playingItem === english ? (
                            <Ionicons name="pause" size={24} color="#fff" />
                        ) : (
                            <Ionicons name="play" size={24} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            ))}
        </View>,
        
        // Page 2: Greetings & Introductions
        <View key="page2_greetings" style={styles.pageContent}>
            <Text style={styles.pageTitle}>Greetings & Introductions</Text>
            <Text style={styles.pageSubtitle}>Learn essential English greetings and introductory phrases with Urdu translations.</Text>
            {greetingsData.map(({ english, urdu, pron }) => (
                <View key={english} style={styles.card}>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.englishWord}>{english} <Text style={styles.pronText}>({pron})</Text></Text>
                        <Text style={styles.arabicWord}>{urdu}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.playButtonCircle}
                        disabled={playingItem !== null}
                        onPress={async () => {
                            setPlayingItem(english);
                            await playAudioFromText(english, () => setPlayingItem(null));
                        }}
                    >
                        {playingItem === english ? (
                            <Ionicons name="pause" size={24} color="#fff" />
                        ) : (
                            <Ionicons name="play" size={24} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            ))}
        </View>,
        
        // Page 3: Useful Phrases
        <View key="page3_phrases" style={styles.pageContent}>
            <Text style={styles.pageTitle}>Useful Phrases</Text>
            <Text style={styles.pageSubtitle}>Everyday phrases for better communication.</Text>
            {phrasesData.map(({ english, urdu, pron }) => (
                <View key={english} style={styles.card}>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.englishWord}>{english} <Text style={styles.pronText}>({pron})</Text></Text>
                        <Text style={styles.arabicWord}>{urdu}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.playButtonCircle}
                        disabled={playingItem !== null}
                        onPress={async () => {
                            setPlayingItem(english);
                            await playAudioFromText(english, () => setPlayingItem(null));
                        }}
                    >
                        {playingItem === english ? (
                            <Ionicons name="pause" size={24} color="#fff" />
                        ) : (
                            <Ionicons name="play" size={24} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            ))}
        </View>,
        
        // Page 4: Sight Words (UI)
        <View key="page4_ui_sight_words" style={styles.pageContent}>
            <Text style={styles.pageTitle}>Sight Words</Text>
            <Text style={styles.pageSubtitle}>Common UI words you'll encounter in apps and websites.</Text>
            {uiWordsData.map(({ english, urdu, pron }) => (
                <View key={english} style={styles.card}>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.englishWord}>{english} <Text style={styles.pronText}>({pron})</Text></Text>
                        <Text style={styles.arabicWord}>{urdu}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.playButtonCircle}
                        disabled={playingItem !== null}
                        onPress={async () => {
                            setPlayingItem(english);
                            await playAudioFromText(english, () => setPlayingItem(null));
                        }}
                    >
                        {playingItem === english ? (
                            <Ionicons name="pause" size={24} color="#fff" />
                        ) : (
                            <Ionicons name="play" size={24} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            ))}
        </View>,
        
        // Page 5: Fill in the blanks Exercise
        <View key="page5_exercise" style={[styles.pageContent, styles.exercisePageContent]}>
            <Text style={styles.pageTitle}>Fill in the blanks</Text>
            <Text style={styles.pageSubtitle}>Practice what you've learned with these exercises.</Text>
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

    const totalPages = lessonPages.length;

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
            setShowFinishAnimation(true);
            // Wait for animation to complete before navigating
            setTimeout(() => {
                router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
            }, 3000); // 3 seconds to allow animation to play
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
        // Remove alignItems: 'center' for left alignment
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
    pronText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#6B7280',
    },
    playButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#93E893', // AI Tutor theme green
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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

export default Lesson4Screen; 