import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Header } from "../../../../components/Header";

const AcademicPresentationScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Academic Presentation Challenge" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Presentation Challenge</Text>

        <ImageBackground
          source={require("../../../../assets/images/presentation-background.png")} // Placeholder
          style={styles.presentationCard}
          imageStyle={styles.presentationImage}
        >
          <View style={styles.presentationOverlay}>
            <Text style={styles.presentationText}>
              Explain the role of climate change in global economics.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.speechStructureContainer}>
          <Text style={styles.speechStructureTitle}>Speech Structure</Text>
          <Text style={styles.speechStructureItem}>Introduction</Text>
          <Text style={styles.speechStructureItem}>Key Points</Text>
          <Text style={styles.speechStructureItem}>Conclusion</Text>
        </View>
      </ScrollView>

      <View style={styles.speakButtonContainer}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic" size={24} color="#FFFFFF" />
          <Text style={styles.speakButtonText}>Speak</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: "center", // Center content horizontally
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left", // Align title to the left
    width: '100%', // Ensure it takes full width for left alignment
    marginBottom: 20,
    color: "#000000",
  },
  presentationCard: {
    width: "100%",
    height: 300, // Adjust height as needed
    borderRadius: 12,
    overflow: "hidden", // Ensure image respects border radius
    justifyContent: "center", // Center text vertically
    alignItems: "center", // Center text horizontally
    marginBottom: 30,
  },
  presentationImage: {
    borderRadius: 12,
  },
  presentationOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent overlay for text readability
    padding: 20,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  presentationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 32,
  },
  speechStructureContainer: {
    width: '100%', // Take full width
    alignItems: "flex-start", // Align items to the left
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
  },
  speechStructureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343A40",
    marginBottom: 12,
  },
  speechStructureItem: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 8,
    lineHeight: 22,
  },
  speakButtonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6",
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

export default AcademicPresentationScreen; 