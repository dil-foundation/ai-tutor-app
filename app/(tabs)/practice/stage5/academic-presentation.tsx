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

const AcademicPresentationScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Academic Presentation</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Presentation Challenge</Text>

        <View style={styles.presentationCard}>
            <Ionicons name="school-outline" size={60} color="#93E893" />
            <Text style={styles.presentationText}>
              Explain the role of climate change in global economics.
            </Text>
        </View>

        <View style={styles.speechStructureContainer}>
          <Text style={styles.speechStructureTitle}>Speech Structure</Text>
          <View style={styles.structureRow}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#93E893" style={styles.structureIcon}/>
              <Text style={styles.speechStructureItem}>Introduction</Text>
          </View>
          <View style={styles.structureRow}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#93E893" style={styles.structureIcon}/>
              <Text style={styles.speechStructureItem}>Key Points & Evidence</Text>
          </View>
          <View style={styles.structureRow}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#93E893" style={styles.structureIcon}/>
              <Text style={styles.speechStructureItem}>Conclusion & Q&A</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic-outline" size={28} color="#111629" />
          <Text style={styles.speakButtonText}>Start Presenting</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#D2D5E1",
  },
  presentationCard: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  presentationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D2D5E1",
    textAlign: "center",
    lineHeight: 32,
    marginTop: 20,
  },
  speechStructureContainer: {
    width: '100%',
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 15,
  },
  speechStructureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#93E893",
    marginBottom: 15,
  },
  structureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
  },
  structureIcon: {
      marginRight: 15,
  },
  speechStructureItem: {
    fontSize: 16,
    color: "#D2D5E1",
    lineHeight: 22,
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#111629',
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

export default AcademicPresentationScreen; 