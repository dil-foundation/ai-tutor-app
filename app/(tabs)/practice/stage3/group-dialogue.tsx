import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const scenarios = [
  {
    id: "1",
    title: "Explain why you missed school",
    icon: 'school-outline' as const,
  },
  {
    id: "2",
    title: "Ask a doctor for help",
    icon: 'medkit-outline' as const,
  },
  {
    id: "3",
    title: "Buy something at a pharmacy",
    icon: 'pulse-outline' as const,
  },
];

const GroupDialogueScreen = () => {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);

  const messages = [
    { id: "1", text: "Hello, what's the problem?", sender: "ai" },
  ];

  const renderScenario = ({ item }: { item: typeof scenarios[0] }) => (
    <TouchableOpacity
      style={[styles.scenarioCard, selectedScenario.id === item.id && styles.selectedScenarioCard]}
      onPress={() => setSelectedScenario(item)}
    >
      <Ionicons name={item.icon} size={40} color={selectedScenario.id === item.id ? '#111629' : "#93E893"} />
      <Text style={[styles.scenarioTitle, selectedScenario.id === item.id && styles.selectedScenarioTitle]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Dialogue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageSubtitle}>Solve Real-Life Situations</Text>
        
        <View style={styles.chatContainer}>
          <View style={styles.aiMessageContainer}>
            <Ionicons name="person-circle-outline" size={40} color="#93E893" style={styles.avatar} />
            <View style={styles.aiMessageBox}>
              <Text style={styles.chatText}>{messages[0].text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.feedbackBox}>
            <Ionicons name="information-circle-outline" size={24} color="#93E893" style={styles.feedbackIcon} />
            <Text style={styles.feedbackText}>
              Well done! Try: 'Could you please fix it today?' to sound polite.
            </Text>
        </View>

        <Text style={styles.scenarioSectionTitle}>Choose a Scenario</Text>
        <FlatList
          data={scenarios}
          renderItem={renderScenario}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scenarioList}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic-outline" size={28} color="#111629" />
          <Text style={styles.speakButtonText}>Speak Now</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#111629',
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
  pageSubtitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: '#D2D5E1',
  },
  chatContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  aiMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    marginRight: 10,
  },
  aiMessageBox: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: "85%",
  },
  chatText: {
    fontSize: 16,
    color: "#D2D5E1",
  },
  feedbackBox: {
    backgroundColor: 'rgba(147, 232, 147, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  feedbackIcon: {
    marginRight: 15,
  },
  feedbackText: {
    fontSize: 16,
    color: "#93E893",
    flex: 1,
    fontStyle: 'italic',
  },
  scenarioSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 15,
    color: '#D2D5E1',
  },
  scenarioList: {
    paddingHorizontal: 16,
  },
  scenarioCard: {
    backgroundColor: "#1E293B",
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    alignItems: "center",
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  selectedScenarioCard: {
    backgroundColor: "#93E893",
  },
  scenarioTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    color: '#93E893',
    marginTop: 10,
  },
  selectedScenarioTitle: {
    color: '#111629'
  },
  bottomBar: {
    padding: 16,
    backgroundColor: "#111629",
  },
  speakButton: {
    backgroundColor: "#93E893",
    borderRadius: 30,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  speakButtonText: {
    color: "#111629",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
});

export default GroupDialogueScreen; 