import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

const appNavigationData = [
  { english: "Start", urdu: "شروع کریں", icon: "play-outline" },
  { english: "Next", urdu: "اگلا", icon: "arrow-forward-outline" },
  { english: "Submit", urdu: "جمع کرائیں", icon: "checkmark-done-outline" },
  { english: "Speak", urdu: "بولیں", icon: "mic-outline" },
  { english: "Listen", urdu: "سنیں", icon: "volume-medium-outline" },
  { english: "Finish", urdu: "ختم کریں", icon: "flag-outline" },
];

const Lesson5Screen: React.FC = () => {
    const [playingWord, setPlayingWord] = useState<string | null>(null);
    const [showFinishAnimation, setShowFinishAnimation] = useState(false);

    const lessonContent = (
        <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>📱 App Navigation Words</Text>
            <Text style={styles.pageSubtitle}>Learn the English words you'll see in app buttons and menus.</Text>
            <View style={styles.listContainer}>
                {appNavigationData.map(({ english, urdu, icon }) => (
                    <View key={english} style={styles.card}>
                        <View style={styles.cardTextContainer}>
                            <Text style={styles.englishText}>{english}</Text>
                            <Text style={styles.urduText}>{urdu}</Text>
                        </View>
                        <View style={styles.iconAndPlayContainer}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={icon as any} size={28} color="#4A90E2" />
                            </View>
                            <TouchableOpacity
                                style={styles.playButtonCircle}
                                disabled={playingWord !== null}
                                onPress={async () => {
                                    setPlayingWord(english);
                                    await playAudioFromText(english, () => setPlayingWord(null));
                                }}
                            >
                                {playingWord === english ? (
                                    <Ionicons name="pause" size={24} color="#fff" />
                                ) : (
                                    <Ionicons name="play" size={24} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const handleGoBack = () => {
        if (router.canGoBack()) router.back();
    };

    const handleFinish = () => {
        console.log('Lesson 5 Finished!');
        setShowFinishAnimation(true);
        // Wait for animation to complete before navigating
        setTimeout(() => {
            router.replace('/(tabs)/practice/stage0'); // Navigate back to Stage 0 lesson list
        }, 3000); // 3 seconds to allow animation to play
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

// Styles adapted from Lesson 1 for consistency
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
    iconAndPlayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 15,
    },
    englishText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111629',
        marginBottom: 2,
    },
    urduText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 0,
    },
    playButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#93E893', // AI Tutor theme green
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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

export default Lesson5Screen; 