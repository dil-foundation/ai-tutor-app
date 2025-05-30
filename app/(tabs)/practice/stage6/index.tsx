import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Stage6Screen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stage 6</Text>
      </View>
      <Text style={styles.title}>Native-like Fluency & Precision</Text>
      <Text style={styles.goal}>
        Goal: Master real-time fluency, advanced argumentation, and nuanced
        emotional communication.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>AI-Guided Spontaneous Speech</Text>
          <Text style={styles.cardDescription}>
            Practice real-time conversations with AI, focusing on natural flow
            and quick thinking.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/(tabs)/practice/stage6/ai-guided-spontaneous-speech" as any)}
          >
            <Text style={styles.startButtonText}>Start →</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require("../../../../assets/images/abstract-topic.png")}
          style={styles.cardImage}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Roleplay: Handle a Sensitive Scenario</Text>
          <Text style={styles.cardDescription}>
            Simulate real-world interviews to improve fluency and confidence.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/(tabs)/practice/stage6/roleplay-handle-sensitive-scenario" as any)}
          >
            <Text style={styles.startButtonText}>Start →</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require("../../../../assets/images/mock-interview.png")}
          style={styles.cardImage}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Critical Opinion Builder</Text>
          <Text style={styles.cardDescription}>
            Develop and articulate complex opinions on various topics, supported
            by evidence and logic.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/(tabs)/practice/stage6/critical-opinion-builder" as any)}
          >
            <Text style={styles.startButtonText}>Start →</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require("../../../../assets/images/news-summary.png")}
          style={styles.cardImage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  goal: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  startButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default Stage6Screen; 