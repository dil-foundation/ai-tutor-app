import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Header } from "../../../../components/Header";

const Stage4Home = () => {
  const router = useRouter();

  const practiceOptions = [
    {
      title: "Abstract Topic Monologue",
      description: "Practice expressing complex ideas on abstract topics.",
      image: require("../../../../assets/images/abstract-topic.png"), // Placeholder path
      route: "/(tabs)/practice/stage4/abstract-topic" as any,
    },
    {
      title: "Mock Interview Practice",
      description: "Simulate real-world interviews to improve fluency and confidence.",
      image: require("../../../../assets/images/mock-interview.png"), // Placeholder path
      route: "/(tabs)/practice/stage4/mock-interview" as any,
    },
    {
      title: "News Summary Challenge",
      description: "Summarize news articles to enhance comprehension and expression.",
      image: require("../../../../assets/images/news-summary.png"), // Placeholder path
      route: "/(tabs)/practice/stage4/news-summary" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Stage 4" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.goalContainer}>
          <Text style={styles.goalTitle}>Confident Communication</Text>
          <Text style={styles.goalDescription}>
            Goal: Express complex ideas clearly, use nuanced vocabulary, and fluently manage discussions.
          </Text>
        </View>

        {practiceOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionContainer}
            onPress={() => router.push(option.route as any)}
          >
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
              <View style={styles.startButton}>
                <Text style={styles.startButtonText}>Start →</Text>
              </View>
            </View>
            <Image source={option.image} style={styles.optionImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  goalContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 26, // Adjusted size
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    textAlign: "left",
  },
  goalDescription: {
    fontSize: 16,
    color: "#555555", // Slightly darker grey
    textAlign: "left",
    lineHeight: 22,
  },
  optionContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA", // Light grey background for cards
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 17, // Adjusted size
    fontWeight: "600", // Semi-bold
    color: "#000000",
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 18,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9ECEF", // Lighter grey for button
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#343A40", // Darker text for button
  },
  optionImage: {
    width: 100,
    height: 110, // Adjusted height
    borderRadius: 8,
  },
});

export default Stage4Home; 