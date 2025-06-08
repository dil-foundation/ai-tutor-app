import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stage1Screen = () => {
  const router = useRouter();

  const activities = [
    {
      id: 'repeatAfterMe',
      title: 'Repeat After Me',
      description: 'Practice speaking by repeating phrases',
      icon: 'mic-outline' as const,
      screen: '/(tabs)/practice/stage1/repeatAfterMe' as any,
    },
    {
      id: 'quickResponse',
      title: 'Quick Response',
      description: 'Answer simple questions quickly',
      icon: 'flash-outline' as const,
      screen: '/(tabs)/practice/stage1/quickResponse' as any,
    },
    {
      id: 'listenAndReply',
      title: 'Listen and Reply',
      description: 'Improve listening skills by responding to audio',
      icon: 'ear-outline' as const,
      screen: '/(tabs)/practice/stage1/listenAndReply' as any,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#D2D5E1" />
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
            <Ionicons name={activity.icon} size={32} color="#93E893" style={styles.activityIcon} />
            <View style={styles.textContainer}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#93E893',
  },
  levelTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D2D5E1',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  goalText: {
    fontSize: 16,
    color: '#D2D5E1',
    textAlign: 'center',
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityIcon: {
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#93E893',
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 14,
    color: '#D2D5E1',
  },
});

export default Stage1Screen; 