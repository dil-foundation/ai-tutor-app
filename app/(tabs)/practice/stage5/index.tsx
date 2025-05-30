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

const Stage5Home = () => {
  const router = useRouter();

  const practiceOptions = [
    {
      title: "Abstract & Critical Thinking Dialogues",
      description: "Engage in thought-provoking conversations on complex topics.",
      image: require("../../../../assets/images/critical-thinking-dialogues.png"), // Placeholder
      route: "/(tabs)/practice/stage5/critical-thinking-dialogues" as any,
    },
    {
      title: "Academic Presentations",
      description: "Practice delivering polished presentations on academic subjects.",
      image: require("../../../../assets/images/academic-presentations.png"), // Placeholder
      route: "/(tabs)/practice/stage5/academic-presentation" as any,
    },
    {
      title: "In-Depth Interview Simulation",
      description: "Simulate challenging interviews to refine your communication skills.",
      image: require("../../../../assets/images/in-depth-interview.png"), // Placeholder
      route: "/(tabs)/practice/stage5/in-depth-interview" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Stage 5" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.goalContainer}>
          <Text style={styles.goalTitle}>Fluent & Thoughtful Communication</Text>
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    textAlign: "left",
  },
  goalDescription: {
    fontSize: 16,
    color: "#555555",
    textAlign: "left",
    lineHeight: 22,
  },
  optionContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
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
    fontSize: 17,
    fontWeight: "600",
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
    backgroundColor: "#E9ECEF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#343A40",
  },
  optionImage: {
    width: 100,
    height: 110,
    borderRadius: 8,
  },
});

export default Stage5Home; 