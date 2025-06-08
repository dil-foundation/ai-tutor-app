import { Ionicons } from '@expo/vector-icons';
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

const Stage2Home = () => {
  const router = useRouter();

  const practiceOptions = [
    {
      title: "Daily Routine Narration",
      description: "Describe your daily activities in detail",
      icon: 'sunny-outline' as const,
      route: "/(tabs)/practice/stage2/daily-routine" as any,
    },
    {
      title: "Quick & Answer Practice",
      description: "Engage in interactive Q&A sessions",
      icon: 'flash-outline' as const,
      route: "/(tabs)/practice/stage2/quick-answer" as any,
    },
    {
      title: "Roleplay Simulation",
      description: "Practice ordering food in a restaurant",
      icon: 'restaurant-outline' as const,
      route: "/(tabs)/practice/stage2/roleplay-simulation" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stage 2</Text>
      </View>
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
            <Ionicons name={option.icon} size={32} color="#93E893" style={styles.optionIcon} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>
                {option.description}
              </Text>
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
  goalContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "flex-start",
  },
  goalTitle: {
    fontSize: 28,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#93E893",
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: "#D2D5E1",
    lineHeight: 18,
  },
});

export default Stage2Home; 