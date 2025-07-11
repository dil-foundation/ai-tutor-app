import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get('window');

const DailyRoutineNarrationScreen = () => {
  const router = useRouter();
  const [response, setResponse] = useState("");
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
          <Text style={styles.headerTitle}>Daily Routine</Text>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Prompt Section */}
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.promptContainer}>
                <Ionicons name="sunny-outline" size={24} color="#2ECC71" />
                <Text style={styles.prompt}>
                  Tell me about your morning routine. What do you do after you wake up?
                </Text>
              </View>
            </Animated.View>

            {/* Response Container */}
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.responseContainer}>
                <TextInput
                  style={styles.responseInput}
                  multiline
                  placeholder="Start writing or speaking..."
                  placeholderTextColor="#6C757D"
                  value={response}
                  onChangeText={setResponse}
                />
              </View>
            </Animated.View>

            {/* Feedback Box */}
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.feedbackContainer}>
                <Ionicons name="information-circle-outline" size={24} color="#2ECC71" />
                <Text style={styles.feedbackText}>
                  Nice! Try saying it with time words like 'then' or 'after that'.
                </Text>
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
            <TouchableOpacity style={styles.retryButton}>
              <Ionicons name="refresh-outline" size={24} color="#6C757D" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
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
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
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
    flexGrow: 1,
    paddingTop: 20,
  },
  promptContainer: {
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
  prompt: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  responseContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    minHeight: 200,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    marginHorizontal: 8,
  },
  responseInput: {
    fontSize: 16,
    color: "#000000",
    textAlignVertical: "top",
    flex: 1,
  },
  feedbackContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
    marginHorizontal: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: "#6C757D",
    flex: 1,
    marginLeft: 12,
    lineHeight: 22,
  },
  bottomBar: {
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  retryButtonText: {
    fontSize: 16,
    color: "#6C757D",
    fontWeight: "600",
    marginLeft: 8,
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
    paddingVertical: 18,
    paddingHorizontal: 28,
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

export default DailyRoutineNarrationScreen; 