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

const StorytellingPracticeScreen = () => {
  const router = useRouter();
  const [story, setStory] = useState(
    "I went to the beach with my family. We played in the sand and swam in the ocean. It was a lot of fun."
  );
  const [speakingDuration, setSpeakingDuration] = useState(18);
  const maxDuration = 30;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Storytelling</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Share a Special Day</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Speaking Time</Text>
              <Text style={styles.durationValue}>
                {speakingDuration}s / {maxDuration}s
              </Text>
            </View>
            <Progress.Bar
              progress={speakingDuration / maxDuration}
              width={null}
              style={styles.progressBar}
              color="#93E893"
              unfilledColor="#1E293B"
              borderWidth={0}
            />
          </View>

          <View style={styles.storyContainer}>
            <TextInput
              style={styles.storyInput}
              multiline
              value={story}
              onChangeText={setStory}
              placeholder="Start writing or speaking your story..."
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.feedbackBox}>
             <Ionicons name="information-circle-outline" size={24} color="#93E893" style={styles.feedbackIcon} />
            <Text style={styles.feedbackText}>
              Great storytelling! Try adding sequence words like 'First, then, after that'.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
           <TouchableOpacity style={styles.ideaButton}>
            <Ionicons name="bulb-outline" size={24} color="#D2D5E1" />
            <Text style={styles.ideaButtonText}>Idea?</Text>
          </TouchableOpacity>
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
  flex: {
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#D2D5E1",
    marginBottom: 24,
    textAlign: "center",
  },
  progressContainer: {
    marginBottom: 24,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 14,
    color: "#D2D5E1",
  },
  durationValue: {
    fontSize: 14,
    color: "#D2D5E1",
    fontWeight: "bold",
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  storyContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    minHeight: 250,
    padding: 15,
    marginBottom: 24,
  },
  storyInput: {
    fontSize: 16,
    color: "#D2D5E1",
    textAlignVertical: "top",
    flex: 1,
  },
  feedbackBox: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackIcon: {
    marginRight: 15,
  },
  feedbackText: {
    fontSize: 16,
    color: "#D2D5E1",
    flex: 1,
    fontStyle: 'italic',
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#111629",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ideaButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ideaButtonText: {
    fontSize: 16,
    color: "#D2D5E1",
    fontWeight: "600",
    marginLeft: 8,
  },
  speakButton: {
    backgroundColor: "#93E893",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 25,
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

export default StorytellingPracticeScreen; 