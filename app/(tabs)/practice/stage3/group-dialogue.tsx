import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
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
      <Ionicons 
        name={item.icon} 
        size={32} 
        color={selectedScenario.id === item.id ? Colors.textOnPrimary : Colors.primary} 
      />
      <Text style={[styles.scenarioTitle, selectedScenario.id === item.id && styles.selectedScenarioTitle]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Dialogue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleCard}>
          <Ionicons name="chatbubbles-outline" size={32} color={Colors.primary} />
          <Text style={styles.pageSubtitle}>Solve Real-Life Situations</Text>
        </View>
        
        <View style={styles.chatContainer}>
          <View style={styles.aiMessageContainer}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.aiMessageBox}>
              <Text style={styles.chatText}>{messages[0].text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.feedbackCard}>
          <View style={styles.feedbackIconContainer}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.feedbackContent}>
            <Text style={styles.feedbackTitle}>Well done!</Text>
            <Text style={styles.feedbackText}>
              Try: 'Could you please fix it today?' to sound more polite.
            </Text>
          </View>
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
          <Ionicons name="mic-outline" size={24} color={Colors.textOnPrimary} />
          <Text style={styles.speakButtonText}>Speak Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.base,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  titleCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
    alignItems: 'center',
  },
  pageSubtitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  chatContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  aiMessageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  aiMessageBox: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    maxWidth: "80%",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  feedbackIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  feedbackText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  scenarioSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.lg,
    marginBottom: Spacing.base,
    color: Colors.textPrimary,
  },
  scenarioList: {
    paddingHorizontal: Spacing.lg,
  },
  scenarioCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginRight: Spacing.base,
    alignItems: "center",
    justifyContent: 'center',
    width: 140,
    height: 140,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.base,
  },
  selectedScenarioCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  scenarioTitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  selectedScenarioTitle: {
    color: Colors.textOnPrimary,
  },
  bottomBar: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  speakButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.base,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.md,
  },
  speakButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
});

export default GroupDialogueScreen; 
