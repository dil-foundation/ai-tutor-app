import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const QuickResponseScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quick Response</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.instructionText}>Respond to the AI's question.</Text>

          {/* Chat bubbles */}
          <View style={styles.chatContainer}>
            <View style={styles.aiBubbleContainer}>
              <Ionicons name="hardware-chip-outline" size={28} color="#93E893" style={styles.avatar} />
              <View style={styles.aiBubble}>
                <Text style={styles.chatText}>How are you today?</Text>
              </View>
            </View>
            <View style={styles.userBubbleContainer}>
              <View style={styles.userBubble}>
                <Text style={styles.userChatText}>I am fine.</Text>
              </View>
              <Ionicons name="person-outline" size={28} color="#93E893" style={styles.avatar} />
            </View>
          </View>

          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>Great! Now try saying, "I'm fine, thank you."</Text>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="mic-outline" size={28} color="#111629" />
          <Text style={styles.speakButtonText}>Speak Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111629',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#111629',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#D2D5E1',
    textAlign: 'center',
    marginBottom: 30,
  },
  chatContainer: {
    width: '100%',
    marginBottom: 30,
  },
  aiBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  aiBubble: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: '80%',
    marginLeft: 8,
  },
  userBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  userBubble: {
    backgroundColor: '#93E893',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: '80%',
    marginRight: 8,
  },
  avatar: {
    // Icons replace the images
  },
  chatText: {
    fontSize: 16,
    color: '#D2D5E1',
  },
  userChatText: {
    fontSize: 16,
    color: '#111629',
  },
  suggestionBox: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  suggestionText: {
    fontSize: 16,
    color: '#D2D5E1',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  speakButton: {
    backgroundColor: '#93E893',
    paddingVertical: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    marginBottom: 40,
  },
  speakButtonText: {
    color: '#111629',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default QuickResponseScreen; 