import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const Stage6Home = () => {
  const router = useRouter();

  const practiceOptions = [
    {
      title: "AI-Guided Spontaneous Speech",
      description: "Practice real-time conversations with AI, focusing on natural flow and quick thinking.",
      icon: "rocket-outline" as const,
      route: "/(tabs)/practice/stage6/ai-guided-spontaneous-speech" as any,
    },
    {
      title: "Roleplay: Handle a Sensitive Scenario",
      description: "Simulate real-world interviews to improve fluency and confidence.",
      icon: "people-outline" as const,
      route: "/(tabs)/practice/stage6/roleplay-handle-sensitive-scenario" as any,
    },
    {
      title: "Critical Opinion Builder",
      description: "Develop and articulate complex opinions on various topics, supported by evidence and logic.",
      icon: "bulb-outline" as const,
      route: "/(tabs)/practice/stage6/critical-opinion-builder" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stage 6</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.goalContainer}>
          <Text style={styles.goalTitle}>C2 Proficiency</Text>
          <Text style={styles.goalDescription}>
            Goal: Master real-time fluency, advanced argumentation, and nuanced emotional communication.
          </Text>
        </View>

        {practiceOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionContainer}
            onPress={() => router.push(option.route as any)}
          >
            <Ionicons name={option.icon} size={32} color="#93E893" style={styles.optionIcon} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111629",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
    color: "#D2D5E1",
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 16,
    color: "#D2D5E1",
    lineHeight: 22,
  },
  optionContainer: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  optionIcon: {
    marginRight: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#93E893",
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: "#D2D5E1",
    lineHeight: 18,
  },
});

export default Stage6Home; 