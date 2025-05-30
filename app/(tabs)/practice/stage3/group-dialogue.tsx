import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Header } from "../../../../components/Header";

const scenarios = [
  {
    id: "1",
    title: "Explain why you missed school",
    image: require("../../../../assets/images/school-scenario.png"), // Replace with actual image path
  },
  {
    id: "2",
    title: "Ask a doctor for help",
    image: require("../../../../assets/images/doctor-scenario.png"), // Replace with actual image path
  },
  {
    id: "3",
    title: "Buy something at a pharmacy",
    image: require("../../../../assets/images/pharmacy-scenario.png"), // Replace with actual image path
  },
];

const GroupDialogueScreen = () => {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);

  // Dummy chat messages
  const messages = [
    { id: "1", text: "Hello, what's the problem?", sender: "ai" },
    // Add more messages as needed for the dialogue flow
  ];

  const renderScenario = ({ item }: { item: typeof scenarios[0] }) => (
    <TouchableOpacity
      style={styles.scenarioCard}
      onPress={() => setSelectedScenario(item)}
    >
      <Image source={item.image} style={styles.scenarioImage} />
      <Text style={styles.scenarioTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Group Dialogue with AI" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageSubtitle}>Solve Real-Life Situations</Text>
        <Text style={styles.scenarioPrompt}>
          You're talking to your landlord about a problem.
        </Text>

        {/* Chat Interface */}
        <View style={styles.chatContainer}>
          <View style={styles.aiMessageContainer}>
            <Image 
              source={require("../../../../assets/images/landlord-avatar.png")} // Replace with actual AI avatar
              style={styles.avatar} 
            />
            <View style={styles.aiMessageBox}>
              <Text style={styles.chatText}>{messages[0].text}</Text>
            </View>
          </View>
          {/* User messages would go here, potentially dynamically added */}
        </View>

        <Text style={styles.feedbackText}>
          Well done! Try: 'Could you please fix it today?' to sound polite.
        </Text>

        <Text style={styles.scenarioSectionTitle}>Scenario</Text>
        <FlatList
          data={scenarios}
          renderItem={renderScenario}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scenarioList}
        />
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
    backgroundColor: "#FFFFFF", // White background as per image
  },
  scrollContent: {
    paddingBottom: 20, // For content below the fold
  },
  pageSubtitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  scenarioPrompt: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  chatContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  aiMessageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  aiMessageBox: {
    backgroundColor: "#F0F0F0", // Light grey for AI messages
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxWidth: "80%", // Max width for message bubbles
  },
  chatText: {
    fontSize: 16,
    color: "#000",
  },
  feedbackText: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#E6F7FF", // Light blueish background for feedback
    borderRadius: 8,
  },
  scenarioSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 10,
  },
  scenarioList: {
    paddingHorizontal: 16,
  },
  scenarioCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
    marginRight: 10, // Spacing between cards
    alignItems: "center",
    width: 150, // Fixed width for scenario cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scenarioImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  speakButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
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

export default GroupDialogueScreen; 