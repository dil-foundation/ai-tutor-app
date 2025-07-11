import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get('window');

const feedbackItems = [
  { id: "1", label: "Pronunciation", iconName: "microphone-outline", checked: true },
  { id: "2", label: "Grammar", iconName: "alphabetical-variant", checked: true },
  { id: "3", label: "Answer Match", iconName: "help-circle-outline", checked: true },
];

const QuestionsAnswersPracticeScreen = () => {
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
      <Stack.Screen options={{ headerShown: false }} />
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
              <Ionicons name="arrow-back" size={24} color="#2ECC71" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quick Answer</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.titleContainer}>
              <Ionicons name="flash-outline" size={24} color="#2ECC71" />
              <Text style={styles.title}>Responding to WH-questions</Text>
            </View>
          </Animated.View>

          {/* Chat Container */}
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.chatContainer}>
              <View style={styles.messageRowAI}>
                <View style={styles.aiAvatarContainer}>
                  <LinearGradient
                    colors={['#2ECC71', '#27AE60']}
                    style={styles.aiAvatarGradient}
                  >
                    <Ionicons name="hardware-chip-outline" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.aiMessageBubble}>
                  <Text style={styles.messageSender}>AI Tutor</Text>
                  <Text style={styles.messageText}>Where do you live?</Text>
                </View>
              </View>

              <View style={styles.messageRowUser}>
                <LinearGradient
                  colors={['#2ECC71', '#27AE60']}
                  style={styles.userMessageBubble}
                >
                  <Text style={styles.userMessageText}>
                    I live in Karachi.
                  </Text>
                </LinearGradient>
                <View style={styles.userAvatarContainer}>
                  <LinearGradient
                    colors={['rgba(46, 204, 113, 0.2)', 'rgba(39, 174, 96, 0.1)']}
                    style={styles.userAvatarGradient}
                  >
                    <Ionicons name="person-outline" size={24} color="#2ECC71" />
                  </LinearGradient>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Feedback Container */}
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.feedbackContainer}>
              <View style={styles.feedbackHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#2ECC71" />
                <Text style={styles.feedbackTitle}>Feedback</Text>
              </View>
              {feedbackItems.map((item) => (
                <View key={item.id} style={styles.feedbackItem}>
                  <View style={styles.feedbackIconLabelContainer}>
                    <MaterialCommunityIcons
                      name={item.iconName as any}
                      size={20}
                      color="#6C757D"
                      style={styles.feedbackIcon}
                    />
                    <Text style={styles.feedbackLabel}>{item.label}</Text>
                  </View>
                  {item.checked && (
                    <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Bar */}
        <Animated.View
          style={[
            styles.bottomBar,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.speakButton}>
            <LinearGradient
              colors={['#2ECC71', '#27AE60']}
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  titleContainer: {
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 12,
  },
  chatContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    marginHorizontal: 8,
  },
  messageRowAI: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  messageRowUser: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  aiAvatarContainer: {
    marginRight: 12,
  },
  aiAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: "75%",
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  userMessageBubble: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: "75%",
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatarContainer: {
    marginLeft: 12,
  },
  userAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  messageSender: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 4,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 22,
  },
  userMessageText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  feedbackContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginHorizontal: 8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 8,
  },
  feedbackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  feedbackIconLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackIcon: {
    marginRight: 12,
  },
  feedbackLabel: {
    fontSize: 16,
    color: "#000000",
  },
  bottomBar: {
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  speakButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  speakButtonGradient: {
    borderRadius: 30,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.2,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(46, 204, 113, 0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.35,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(39, 174, 96, 0.03)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.65,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(46, 204, 113, 0.04)',
  },
  particle1: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(46, 204, 113, 0.3)',
  },
  particle2: {
    position: 'absolute',
    bottom: height * 0.45,
    right: width * 0.15,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(39, 174, 96, 0.25)',
  },
});

export default QuestionsAnswersPracticeScreen; 