import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const CriticalOpinionBuilderScreen = () => {
  const router = useRouter();
  const [wordCount, setWordCount] = useState(0);
  const [text, setText] = useState("");

  const handleTextChange = (inputText: string) => {
    setText(inputText);
    // Basic word count: split by space and filter empty strings
    const words = inputText.split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Critical Opinion Builder</Text>
      </View>

      <ImageBackground
        source={require("../../../../assets/images/critical-opinion-background.png")} // Update path
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.overlayContent}>
          <Text style={styles.imageText}>
            In the context of global climate change, should governments
            prioritize economic growth or environmental sustainability? Discuss
            the trade-offs and propose a balanced approach.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.timerAndWordCountContainer}>
        <Text style={styles.timerText}>90 seconds</Text>
        <Text style={styles.wordCountText}>{wordCount}/100 words</Text>
      </View>

      <TextInput
        style={styles.textInput}
        multiline
        placeholder="Start typing your opinion here..."
        onChangeText={handleTextChange}
        value={text}
      />

      <TouchableOpacity style={styles.speakButton}>
        <Text style={styles.speakButtonText}>🎤 Speak</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50, // Adjust for status bar
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  imageBackground: {
    height: 200, // Adjust as needed
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  overlayContent: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay for text visibility
    padding: 15,
    borderRadius: 5,
    marginHorizontal: "5%", // Add some horizontal margin
  },
  imageText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  timerAndWordCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  wordCountText: {
    fontSize: 14,
    color: "#555",
  },
  textInput: {
    flex: 1, // Allow text input to take available space
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 20,
    fontSize: 16,
    textAlignVertical: "top", // Start text from the top
    minHeight: 100, // Minimum height
  },
  speakButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: "25%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  speakButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CriticalOpinionBuilderScreen; 