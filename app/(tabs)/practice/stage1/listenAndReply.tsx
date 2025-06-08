import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ListenAndReplyScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listen and Reply</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.dialogueContainer}>
            <Ionicons name="person-circle-outline" size={100} color="#93E893" style={styles.avatar} />
            <Text style={styles.dialogueText}>Hi! My name is Sarah. What is your name?</Text>
            <TouchableOpacity style={styles.listenButton}>
              <Ionicons name="volume-high-outline" size={32} color="#111629" />
            </TouchableOpacity>
          </View>

          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>
              Try saying: <Text style={styles.suggestionBoldText}>My name is Amina.</Text>
            </Text>
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
    alignItems: 'center',
  },
  dialogueContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  avatar: {
    marginBottom: 20,
  },
  dialogueText: {
    fontSize: 20,
    color: '#D2D5E1',
    textAlign: 'center',
    marginBottom: 20,
  },
  listenButton: {
    backgroundColor: '#93E893',
    padding: 20,
    borderRadius: 50,
  },
  suggestionBox: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  suggestionText: {
    fontSize: 16,
    color: '#D2D5E1',
    textAlign: 'center',
  },
  suggestionBoldText: {
    fontWeight: 'bold',
    color: '#93E893',
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

export default ListenAndReplyScreen; 