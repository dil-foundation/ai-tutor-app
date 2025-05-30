import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const QuickResponseScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>2. Quick Response</Text>
        </View>
        <Text style={styles.subHeaderTitle}>Respond to the AI's with a short phrase.</Text>

        {/* Chat bubbles */}
        <View style={styles.chatContainer}>
          <View style={styles.aiBubbleContainer}>
            <Image source={require('../../../../assets/images/ai_tutor_avatar.png')} style={styles.avatar} />
            <View style={styles.aiBubble}>
              <Text style={styles.chatText}>How are you today?</Text>
            </View>
          </View>
          <View style={styles.userBubbleContainer}>
            <View style={styles.userBubble}>
              <Text style={styles.userChatText}>I am fine.</Text>
            </View>
            <Image source={require('../../../../assets/images/user_avatar.png')} style={styles.avatar} />
          </View>
        </View>

        <Image source={require('../../../../assets/images/robot.png')} style={styles.mainImage} />
        <Text style={styles.suggestionText}>'Great! Try saying, 'I'm fine,Thank you'.</Text>

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
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    width: '90%',
  },
  chatContainer: {
    width: '100%',
    marginBottom: 20,
  },
  aiBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  aiBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxWidth: '80%',
    marginLeft: 8,
  },
  userBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    maxWidth: '80%',
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
  },
  userChatText: {
    fontSize: 16,
    color: '#fff',
  },
  mainImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 60,
    fontStyle: 'italic',
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

export default QuickResponseScreen; 