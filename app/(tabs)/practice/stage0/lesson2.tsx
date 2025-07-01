import { Ionicons } from '@expo/vector-icons';
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

import { Audio } from 'expo-av';
import { fetchAudioFromText } from '../../../../config/api';

const { width } = Dimensions.get('window');

const minimalPairsData = [
  {
    key: 'b-v',
    title: 'B as in Ball vs. V as in Van',
    examples: ['Ball vs. Van', 'Bat vs. Vast', 'Boy vs. Voice'],
    urdu: [
      'آواز لبوں کو بند کر کے ادا کی جاتی ہے. - B',
      'آواز دانتوں سے ہونٹ رگڑ کر ادا کی جاتی ہے. - V',
    ],
  },
  {
    key: 't-th',
    title: 'T as in Time vs. TH as in Think',
    examples: ['Time vs. Think', 'Ten vs. Thank', 'Toy vs. Thirst'],
    urdu: [
      'زبان کو دانتوں کے پیچھے رکھ کر بولتے ہیں. - T',
      'میں زبان کو دانتوں کے بیچ رگڑ کر نرم آواز',
      'نکالی جاتی ہے. - TH',
    ],
  },
  {
    key: 'p-f',
    title: 'P as in Pen vs. F as in Fan',
    examples: ['Pen vs. Fan', 'Pin vs. Fin', 'Pop vs. Fun'],
    urdu: [
      'آواز ہونٹوں سے زوردار نکلتی ہے. - P',
      'آواز دانتوں اور ہونٹوں کے ہلکے رگڑ سے نکلتی ہے. - F',
    ],
  },
  {
    key: 'd-t',
    title: 'D as in Dog vs. T as in Top',
    examples: ['Dog vs. Top', 'Day vs. Toy', 'Dad vs. Tap'],
    urdu: [
      'آواز نرم اور گہری ہوتی ہے. - D',
      'آواز سخت اور تیز ادا کی جاتی ہے. - T',
    ],
  },
  {
    key: 's-z',
    title: 'S as in Sun vs. Z as in Zoo',
    examples: ['Sun vs. Zoo', 'Sip vs. Zip', 'Sing vs. Zebra'],
    urdu: [
      'آواز بغیر آواز کے سانس سے آتی ہے. - S',
      'آواز سانس اور آواز کے ساتھ ہوتی ہے. - Z، جیسے مکھی',
      'کی بھنبھناہٹ.',
    ],
  },
  {
    key: 'k-g',
    title: 'K as in King vs. G as in Goat',
    examples: ['King vs. Goat', 'Kit vs. Gift', 'Cold vs. Gold'],
    urdu: [
      'آواز بغیر آواز کے ہوتی ہے، صرف سانس سے. - K',
      'آواز گلے سے آواز کے ساتھ نکلتی ہے. - G',
    ],
  },
  {
    key: 'ch-sh',
    title: 'CH as in Chair vs. SH as in Ship',
    examples: ['Chair vs. Ship', 'Cheese vs. Sheet', 'Chat vs. Shine'],
    urdu: [
      "آواز 'چ' جیسی ہوتی ہے. - CH",
      "آواز 'ش' جیسی ہوتی ہے، زیادہ نرم اور لمبی. - SH",
    ],
  },
  {
    key: 'j-z',
    title: 'J as in Jam vs. Z as in Zip',
    examples: ['Jam vs. Zip', 'Joke vs. Zone', 'Jump vs. Zebra'],
    urdu: [
      "آواز 'ج' جیسی ہوتی ہے. - J",
      'آواز سانس اور آواز کے ساتھ نکلتی ہے. - Z، جیسے',
      'بھنبھناہٹ.',
    ],
  },
  {
    key: 'l-r',
    title: 'L as in Lion vs. R as in Rain',
    examples: ['Lion vs. Rain', 'Light vs. Right', 'Lock vs. Rock'],
    urdu: [
      'آواز زبان کو دانتوں کے پیچھے لگا کر نکالی جاتی ہے. - L',
      'آواز زبان کو موڑ کر نکالی جاتی ہے، گول انداز میں. - R',
    ],
  },
  {
    key: 'silent',
    title: 'Silent Letters (K, B, L)',
    examples: [
      'K in "Knife" is silent → "نائف"',
      'B in "Lamb" is silent → "لیم"',
      'L in "Half" is silent → "ہاف"',
    ],
    urdu: [
      'کچھ انگریزی الفاظ میں حروف نظر آتے ہیں مگر',
      ' Silent Letters بولے نہیں جاتے. - ان کو',
      'کہتے ہیں.',
    ],
  },
];

const chunkArray = (arr: any[], chunkSize: number): any[][] => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

const minimalPairsPages = chunkArray(minimalPairsData, 2); // 2 cards per page

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
    console.error('Audio playback failed', error);
    onPlaybackFinish();
  }
};

const Lesson2Screen = () => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [showFinishAnimation, setShowFinishAnimation] = useState(false);

  const lessonPages = minimalPairsPages.map((pageData: any[], pageIndex: number) => (
    <View key={`page${pageIndex}`} style={styles.pageContent}>
      {pageData.map((pair: any) => (
        <View key={pair.key} style={styles.card}>
          {/* Title and Play Button Row */}
          <View style={styles.cardTitleRow}>
            <Text style={styles.sectionTitle}>{pair.title}</Text>
            <TouchableOpacity
              style={styles.playButtonCircle}
              disabled={playingKey !== null}
              onPress={async () => {
                setPlayingKey(pair.key);
                await playAudioFromText(pair.title, () => setPlayingKey(null));
              }}
            >
              {playingKey === pair.key ? (
                <Ionicons name="pause" size={24} color="#fff" />
              ) : (
                <Ionicons name="play" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          {/* Examples Nested Box */}
          <View style={styles.examplesBox}>
            <Text style={styles.examplesLabel}>Examples:</Text>
            {pair.examples.map((ex: string, i: number) => (
              <Text key={i} style={styles.exampleText}>• {ex}</Text>
            ))}
          </View>
          {/* Urdu Explanation */}
          <View style={styles.urduBox}>
            <Text style={styles.urduExplanationTitle}>Urdu Explanation:</Text>
            {pair.urdu.map((u: string, i: number) => (
              <Text key={i} style={styles.urduExplanation}>{u}</Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  ));

  const handleGoBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else {
      if (router.canGoBack()) router.back();
      console.log('Exiting Lesson 2');
    }
  };

  const handleNextOrFinish = () => {
    if (currentPageIndex < lessonPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      console.log('Lesson 2 Finished!');
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#D2D5E1" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Lesson 2: Phonics & Sound Confusion</Text>
          <View style={{ width: 24 }} />
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
    flexDirection: 'column',
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111629',
    marginBottom: 0,
    flex: 1,
  },
  examplesBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  examplesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  exampleText: {
    fontSize: 16,
    color: '#111629',
    marginLeft: 10,
    marginBottom: 2,
  },
  urduBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 0,
    marginTop: 8,
  },
  urduExplanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 6,
  },
  urduExplanation: {
    fontSize: 15,
    color: '#6B7280',
    marginLeft: 10,
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

export default Lesson2Screen; 