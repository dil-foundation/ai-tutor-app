import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const NewsSummaryChallengeScreen = () => {
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const wordLimit = 100;
  const currentWordCount = summary.trim().split(/\s+/).filter(Boolean).length;
  const progress = 1;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
       <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>News Summary</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>Listen, Summarize & Speak</Text>

          <View style={styles.newsClipContainer}>
            <View style={styles.newsTextContainer}>
              <Text style={styles.newsLevel}>B2 Level</Text>
              <Text style={styles.newsTitle}>School closures due to weather</Text>
              <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={24} color="#111629" />
              </TouchableOpacity>
            </View>
            <View style={styles.progressBarContainer}>
                <Progress.Bar
                progress={progress}
                width={null}
                style={styles.progressBar}
                color="#93E893"
                unfilledColor="rgba(147, 232, 147, 0.2)"
                borderWidth={0}
                />
                <Text style={styles.progressTime}>1:00</Text>
            </View>
          </View>

           <View style={styles.summaryContainer}>
                <TextInput
                    style={styles.summaryInput}
                    multiline
                    placeholder="Start writing your summary..."
                    placeholderTextColor="#666"
                    value={summary}
                    onChangeText={setSummary}
                    maxLength={wordLimit * 6}
                />
                <Text style={styles.wordCount}>
                    {currentWordCount}/{wordLimit} words
                </Text>
           </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.speakButton}>
            <Ionicons name="mic-outline" size={28} color="#111629" />
            <Text style={styles.speakButtonText}>Speak Now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111629",
  },
  flexContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#111629',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#93E893',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 20,
    color: "#D2D5E1",
  },
  newsClipContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 15,
    padding: 20,
    marginBottom: 24,
  },
  newsTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  newsLevel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111629",
    backgroundColor: "#93E893",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: 'hidden',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D2D5E1",
    flex: 1,
    marginHorizontal: 15,
  },
  playButton: {
    backgroundColor: '#93E893',
    padding: 10,
    borderRadius: 30,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    marginRight: 10,
    height: 8,
    borderRadius: 4,
  },
  progressTime: {
    fontSize: 12,
    color: "#D2D5E1",
  },
  summaryContainer: {
      backgroundColor: '#1E293B',
      borderRadius: 15,
      padding: 15,
  },
  summaryInput: {
    minHeight: 150,
    fontSize: 16,
    color: "#D2D5E1",
    textAlignVertical: "top",
  },
  wordCount: {
    fontSize: 12,
    color: "#D2D5E1",
    textAlign: "right",
    marginTop: 10,
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#111629',
  },
  speakButton: {
    backgroundColor: "#93E893",
    borderRadius: 30,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  speakButtonText: {
    color: "#111629",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
});

export default NewsSummaryChallengeScreen; 