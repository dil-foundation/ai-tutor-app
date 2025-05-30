import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stage1Screen = () => {
  const router = useRouter();

  const activities = [
    {
      id: 'repeatAfterMe',
      title: 'Repeat After Me',
      description: 'Practice speaking by repeating phrases',
      image: require('../../../../assets/images/repeat_after_me.png'), // Placeholder - replace with actual image
      screen: '/(tabs)/practice/stage1/repeatAfterMe' as any,
    },
    {
      id: 'quickResponse',
      title: 'Quick Response',
      description: 'Answer simple questions quickly',
      image: require('../../../../assets/images/quick_response.png'), // Placeholder - replace with actual image
      screen: '/(tabs)/practice/stage1/quickResponse' as any,
    },
    {
      id: 'listenAndReply',
      title: 'Listen and Reply',
      description: 'Improve listening skills by responding to audio',
      image: require('../../../../assets/images/listen_and_reply.png'), // Placeholder - replace with actual image
      screen: '/(tabs)/practice/stage1/listenAndReply' as any,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stage 1</Text>
        </View>
        <Text style={styles.levelTitle}>A1 Beginner</Text>
        <Text style={styles.goalText}>Goal: Build confidence in using basic phrases and pronunciation</Text>

        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={styles.activityCard}
            onPress={() => router.push(activity.screen)}
          >
            <View style={styles.textContainer}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <View style={styles.startButton}>
                <Text style={styles.startButtonText}>Start →</Text>
              </View>
            </View>
            <Image source={activity.image} style={styles.activityImage} />
          </TouchableOpacity>
        ))}
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
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
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
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  goalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    marginRight: 15,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#eee'
  },
  startButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  activityImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default Stage1Screen; 