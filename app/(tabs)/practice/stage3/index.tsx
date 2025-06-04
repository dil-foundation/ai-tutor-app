import { Stack, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../../../../components/Header";

const Stage3 = () => {
  const router = useRouter();

  const practiceOptions = [
    {
      title: "Storytelling Practice",
      description:
        "Practice describing your daily activities and personal experiences in detail.",
      image: require("../../../../assets/images/storytelling.png"),
      route: "/(tabs)/practice/stage3/storytelling" as any,
    },
    {
      title: "Group Dialogue with AI Persons",
      description:
        "Engage in group conversations with AI personas, discussing various topics and viewpoints.",
      image: require("../../../../assets/images/group-dialogue.png"),
      route: "/(tabs)/practice/stage3/group-dialogue" as any,
    },
    {
      title: "Problem-Solving Simulations",
      description:
        "Participate in simulations of real-world scenarios, practicing problem-solving and decision-making.",
      image: require("../../../../assets/images/problem-solving.png"),
      route: "/(tabs)/practice/stage3/problem-solving" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Stage 3" />
      <View style={styles.goalContainer}>
        <Text style={styles.goalTitle}>Intermediate Fluency</Text>
        <Text style={styles.goalDescription}>
          Goal: Describe experiences, share opinions, and handle familiar topics
          confidently.
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginRight: 4,
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  optionImage: {
    width: 100,
    height: 100,
    marginLeft: 16,
    borderRadius: 8,
  },
});

export default Stage3; 