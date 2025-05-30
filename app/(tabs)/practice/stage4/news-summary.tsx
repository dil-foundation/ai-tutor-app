import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";

import { Header } from "../../../../components/Header";

const NewsSummaryChallengeScreen = () => {
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const wordLimit = 100;
  const currentWordCount = summary.trim().split(/\s+/).filter(Boolean).length;
  const progress = 1; // Example: clip is 1:00 long, assuming it's fully played for now

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="News Summary Challenge" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>Listen & Speak</Text>

          <View style={styles.newsClipContainer}>
            <View style={styles.newsTextContainer}>
              <Text style={styles.newsLevel}>B2 Level</Text>
              <Text style={styles.newsTitle}>School closures due to weather</Text>
              <Text style={styles.newsInstruction}>
                Listen to the news clip and summarize it in your own words.
              </Text>
            </View>
            <Image
              source={require("../../../../assets/images/news-clip-image.png")} // Placeholder
              style={styles.newsImage}
            />
          </View>

          <View style={styles.progressBarContainer}>
            <Progress.Bar
              progress={progress}
              width={null} // Full width
              style={styles.progressBar}
              color="#000000" // Black progress bar
              unfilledColor="#E0E0E0"
              borderWidth={0}
              height={4} // Slimmer progress bar
            />
            <Text style={styles.progressTime}>1:00</Text>
          </View>

          <View style={styles.timerContainer}>
            <View style={styles.timerBox}>
              <Text style={styles.timerTextLg}>01</Text>
              <Text style={styles.timerLabelSm}>Minutes</Text>
            </View>
            <View style={styles.timerBox}>
              <Text style={styles.timerTextLg}>00</Text>
              <Text style={styles.timerLabelSm}>Seconds</Text>
            </View>
          </View>

          <TextInput
            style={styles.summaryInput}
            multiline
            placeholder="Start writing your summary..."
            value={summary}
            onChangeText={setSummary}
            maxLength={wordLimit * 6} // Approx max characters
          />
          <Text style={styles.wordCount}>
            Word count: {currentWordCount}/{wordLimit}
          </Text>
        </ScrollView>

        <View style={styles.speakButtonContainer}>
          <TouchableOpacity style={styles.speakButton}>
            <Ionicons name="mic" size={24} color="#FFFFFF" />
            <Text style={styles.speakButtonText}>Speak</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left", // Align left as per image
    marginBottom: 20,
    color: "#000000",
  },
  newsClipContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Align items to the top
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
  },
  newsTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  newsLevel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 4,
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start", // Make background only fit text
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  newsInstruction: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 18,
  },
  newsImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#CED4DA", // Placeholder bg
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    marginRight: 8,
  },
  progressTime: {
    fontSize: 12,
    color: "#495057",
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  timerBox: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 20, // Adjusted padding
    borderRadius: 8,
    alignItems: "center",
    flex: 1, // Make boxes take equal width
    marginHorizontal: 5, // Add some space between boxes
  },
  timerTextLg: {
    fontSize: 28, // Large timer text
    fontWeight: "bold",
    color: "#343A40",
  },
  timerLabelSm: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 2, // Reduced margin
  },
  summaryInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    minHeight: 120, // Adjusted height
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DEE2E6",
  },
  wordCount: {
    fontSize: 12,
    color: "#6C757D",
    textAlign: "right",
    marginBottom: 20,
  },
  speakButtonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  speakButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default NewsSummaryChallengeScreen; 