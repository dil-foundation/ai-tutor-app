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

const alphabetData = [
  { letter: "A", word: "Apple", urdu: "سیب", pron: "ae-pl" },
  { letter: "B", word: "Book", urdu: "کتاب", pron: "buk" },
  { letter: "C", word: "Cat", urdu: "بلی", pron: "ket" },
  { letter: "D", word: "Door", urdu: "دروازہ", pron: "dor" },
  { letter: "E", word: "Elephant", urdu: "ہاتھی", pron: "e-le-fent" },
  { letter: "F", word: "Friend", urdu: "دوست", pron: "frend" },
  { letter: "G", word: "Guide", urdu: "رہنما", pron: "gaa-id" },
  { letter: "H", word: "House", urdu: "گھر", pron: "haus" },
  { letter: "I", word: "Ice", urdu: "برف", pron: "aais" },
  { letter: "J", word: "Juice", urdu: "رس", pron: "joos" },
  { letter: "K", word: "King", urdu: "بادشاہ", pron: "king" },
  { letter: "L", word: "Light", urdu: "روشنی", pron: "lait" },
  { letter: "M", word: "Moon", urdu: "چاند", pron: "moon" },
  { letter: "N", word: "Name", urdu: "نام", pron: "neim" },
  { letter: "O", word: "Orange", urdu: "سنگتره", pron: "or-inj" },
  { letter: "P", word: "Pen", urdu: "قلم", pron: "pen" },
  { letter: "Q", word: "Queen", urdu: "ملکہ", pron: "kween" },
  { letter: "R", word: "Rain", urdu: "بارش", pron: "rein" },
  { letter: "S", word: "Sun", urdu: "سورج", pron: "san" },
  { letter: "T", word: "Tree", urdu: "درخت", pron: "tree" },
  { letter: "U", word: "Umbrella", urdu: "چھتری", pron: "um-bre-la" },
  { letter: "V", word: "Van", urdu: "وین", pron: "van" },
  { letter: "W", word: "Water", urdu: "پانی", pron: "waa-ter" },
  { letter: "X", word: "X-Ray", urdu: "ایکس رے", pron: "eks-ray" },
  { letter: "Y", word: "Yellow", urdu: "پیلا", pron: "ye-lo" },
  { letter: "Z", word: "Zebra", urdu: "زیبرا", pron: "zee-bra" },
];

const chunkArray = (arr: any[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

const alphabetPages = chunkArray(alphabetData, 7);

const Lesson1Screen: React.FC = () => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [playingLetter, setPlayingLetter] = useState<string | null>(null);
  const [showFinishAnimation, setShowFinishAnimation] = useState(false);

  const lessonPages = alphabetPages.map((pageData, pageIndex) => (
    <View key={`page${pageIndex}`} style={styles.pageContent}>
      {pageData.map(({ letter, word, urdu, pron }) => (
        <View key={letter} style={styles.card}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.alphabetLetter}>{letter} <Text style={styles.pronText}>({pron})</Text></Text>
            <Text style={styles.englishWord}>{word}</Text>
            <Text style={styles.arabicWord}>{urdu}</Text>
          </View>
          <TouchableOpacity
            style={styles.playButtonCircle}
            disabled={playingLetter !== null}
            onPress={async () => {
              setPlayingLetter(letter);
              await playAudioFromText(`${letter} for ${word}`, () => setPlayingLetter(null));
            }}
          >
            {playingLetter === letter ? (
              <Ionicons name="pause" size={24} color="#fff" />
            ) : (
              <Ionicons name="play" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  ));

  const handleGoBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else {
      if (router.canGoBack()) router.back();
      console.log('Exiting Lesson 1');
    }
  };

  const handleNextOrFinish = () => {
    if (currentPageIndex < lessonPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      console.log('Lesson 1 Finished!');
      setShowFinishAnimation(true);
      // Wait for animation to complete before navigating
      setTimeout(() => {
        router.replace('/(tabs)/practice/stage0');
      }, 3000); // 3 seconds to allow animation to play
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111629" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lesson 1: The English Alphabet!</Text>
          <View style={{ width: 24 }} />
        </View>

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
  alphabetLetter: {
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
  wordSection: {
    // No longer used, but kept for reference
  },
  playRow: {
    // No longer used, but kept for reference
  },
  playButton: {
    // No longer used, but kept for reference
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

export default Lesson1Screen;