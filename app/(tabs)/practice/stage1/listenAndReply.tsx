import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ListenAndReplyScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>3. Listen and Reply</Text>
        </View>
        <Text style={styles.subHeaderTitle}>Functional Dialogue</Text>

        <Image source={require('../../../../assets/images/sarah.png')} style={styles.dialogueImage} />
        <Text style={styles.dialogueText}>Hi! My name is Sarah. What is your name?</Text>

        <Text style={styles.suggestionText}>
          Try Saying...
          <Text style={styles.suggestionBoldText}> My name is Amina.</Text>
        </Text>

        <TouchableOpacity style={styles.speakButton}>
          <Text style={styles.speakButtonText}>🎤 Speak</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
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
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subHeaderTitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  dialogueImage: {
    width: 200,
    height: 200,
    borderRadius: 100, // Make it a circle
    marginBottom: 20,
    resizeMode: 'cover',
  },
  dialogueText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20, 
  },
  suggestionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 60,
  },
  suggestionBoldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  speakButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  speakButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ListenAndReplyScreen; 