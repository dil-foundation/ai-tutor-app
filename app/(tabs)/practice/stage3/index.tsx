import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Stage3 = () => {
  const router = useRouter();

  const practiceOptions = [
    {
      title: "Storytelling Practice",
      description:
        "Practice describing your daily activities and personal experiences in detail.",
      icon: 'book-outline' as const,
      route: "/(tabs)/practice/stage3/storytelling" as any,
    },
    {
      title: "Group Dialogue with AI Persons",
      description:
        "Engage in group conversations with AI personas, discussing various topics and viewpoints.",
      icon: 'people-outline' as const,
      route: "/(tabs)/practice/stage3/group-dialogue" as any,
    },
    {
      title: "Problem-Solving Simulations",
      description:
        "Participate in simulations of real-world scenarios, practicing problem-solving and decision-making.",
      icon: 'bulb-outline' as const,
      route: "/(tabs)/practice/stage3/problem-solving" as any,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stage 3</Text>
      </View>
      <ScrollView>
        <View style={styles.goalContainer}>
          <Text style={styles.goalTitle}>B1 Intermediate</Text>
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

export default Stage3; 