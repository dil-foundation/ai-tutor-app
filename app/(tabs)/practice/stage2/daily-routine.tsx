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

const DailyRoutineNarrationScreen = () => {
  const router = useRouter();
  const [response, setResponse] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Routine</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.prompt}>
            Tell me about your morning routine. What do you do after you wake up?
          </Text>
          <View style={styles.responseContainer}>
            <TextInput
              style={styles.responseInput}
              multiline
              placeholder="Start writing or speaking..."
              placeholderTextColor="#666"
              value={response}
              onChangeText={setResponse}
            />
          </View>
          <View style={styles.feedbackBox}>
            <Ionicons name="information-circle-outline" size={24} color="#93E893" style={styles.feedbackIcon} />
            <Text style={styles.feedbackText}>
              Nice! Try saying it with time words like 'then' or 'after that'.
            </Text>
          </View>
        </ScrollView>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.retryButton}>
            <Ionicons name="refresh-outline" size={24} color="#D2D5E1" />
            <Text style={styles.retryButtonText}>Retry</Text>
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
  prompt: {
    fontSize: 18,
    color: "#D2D5E1",
    marginBottom: 24,
    lineHeight: 24,
    textAlign: "center",
  },
  responseContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    minHeight: 200,
    padding: 15,
    marginBottom: 24,
  },
  responseInput: {
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
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#111629",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
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

export default DailyRoutineNarrationScreen; 