import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ListenAndReplyScreen = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    // Animate elements on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color="#58D68D" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listen and Reply</Text>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dialogue Container */}
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.dialogueContainer}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#58D68D', '#45B7A8']}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="person-circle-outline" size={48} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.dialogueText}>Hi! My name is Sarah. What is your name?</Text>
              <TouchableOpacity style={styles.listenButton}>
                <LinearGradient
                  colors={['#58D68D', '#45B7A8']}
                  style={styles.listenButtonGradient}
                >
                  <Ionicons name="volume-high-outline" size={28} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Suggestion Box */}
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.suggestionContainer}>
              <Ionicons name="bulb-outline" size={20} color="#58D68D" />
              <Text style={styles.suggestionText}>
                Try saying: <Text style={styles.suggestionBoldText}>My name is Amina.</Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Speak Button */}
        <Animated.View
          style={[
            styles.speakButtonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.speakButton}>
            <LinearGradient
              colors={['#58D68D', '#45B7A8']}
              style={styles.speakButtonGradient}
            >
              <Ionicons name="mic-outline" size={28} color="#FFFFFF" />
              <Text style={styles.speakButtonText}>Speak Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      <View style={styles.particle1} />
      <View style={styles.particle2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(88, 214, 141, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(88, 214, 141, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },

  dialogueContainer: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 32,
    marginHorizontal: 8,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  dialogueText: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  listenButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  listenButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
    marginHorizontal: 8,
  },
  suggestionText: {
    fontSize: 16,
    color: '#6C757D',
    marginLeft: 12,
    flex: 1,
  },
  suggestionBoldText: {
    fontWeight: 'bold',
    color: '#58D68D',
  },
  speakButtonContainer: {
    width: '100%',
    paddingBottom: 32,
  },
  speakButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  speakButtonGradient: {
    paddingVertical: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  speakButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.2,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(88, 214, 141, 0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.35,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(69, 183, 168, 0.03)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.65,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(88, 214, 141, 0.04)',
  },
  particle1: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(88, 214, 141, 0.3)',
  },
  particle2: {
    position: 'absolute',
    bottom: height * 0.45,
    right: width * 0.15,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(69, 183, 168, 0.25)',
  },
});

export default ListenAndReplyScreen; 