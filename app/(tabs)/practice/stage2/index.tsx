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

import { Header } from "../../../../components/Header"; // Assuming Header is in components folder

const Stage2Home = () => {
  const router = useRouter();

  const practiceOptions = [
    {
      title: "Daily Routine Narration",
      description: "Describe your daily activities in detail",
      image: require("../../../../assets/images/daily-routine.png"), // Replace with actual image path
      route: "/(tabs)/practice/stage2/daily-routine" as any,
    },
    {
      title: "Quick & Answer Practice",
      description: "Engage in interactive Q&A sessions",
      image: require("../../../../assets/images/quick-answer.png"), // Replace with actual image path
      route: "/(tabs)/practice/stage2/quick-answer" as any,
    },
    {
      title: "Roleplay Simulation",
      description: "Practice ordering food in a restaurant",
      image: require("../../../../assets/images/roleplay-simulation.png"), // Replace with actual image path
      route: "/(tabs)/practice/stage2/roleplay-simulation" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Stage 2" />
      <ScrollView>
        <View style={styles.goalContainer}>
          <Text style={styles.goalTitle}>A2 Elementary</Text>
          <Text style={styles.goalDescription}>
            Goal: Communicate routing tasks in familiar, real-life contexts
            using basic English
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
              <Text style={styles.optionDescription}>
                {option.description}
              </Text>
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
  goalContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "flex-start", // Align to the left as per image
  },
  goalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    textAlign: "left",
  },
  goalDescription: {
    fontSize: 16,
    color: "#666666",
    textAlign: "left",
    lineHeight: 22,
  },
  optionContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8", // Slightly off-white background for cards
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "600", // Semi-bold
    color: "#000000",
    marginRight: 6,
  },
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: "#000000",
  },
  optionImage: {
    width: 100,
    height: 120, // Adjusted height
    borderRadius: 8,
  },
});

export default Stage2Home; 