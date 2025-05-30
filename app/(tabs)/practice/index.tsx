import { Ionicons } from '@expo/vector-icons'; // For potential icons
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PracticeLandingScreen() {
  const router = useRouter();

  const navigateToStage = (stagePath: string) => {
    router.push(stagePath as any); // Using 'as any' to bypass strict typing for now, ensure paths are valid
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Practice Your English</Text>
        <ScrollView style={styles.scrollView}>
            <Text style={styles.subHeader}>Beginner Stages</Text>
            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage0')}
            >
                <Ionicons name="library-outline" size={24} color="#007AFF" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 0 - Beginner Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage1')}
            >
                <Ionicons name="library-outline" size={24} color="#007AFF" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 1 - Intermediate Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage2')}
            >
                <Ionicons name="library-outline" size={24} color="#007AFF" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 2 - Upper Intermediate</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#C7C7CC" />
            </TouchableOpacity>

            <Text style={styles.subHeader}>Advanced Stages</Text>
            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage3')}
            >
                <Ionicons name="library-outline" size={24} color="#007AFF" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 3 - Advanced Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage4')}
            >
                <Ionicons name="library-outline" size={24} color="#007AFF" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 4 - Expert Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage5')}
            >
                <Ionicons name="library-outline" size={24} color="#007AFF" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 5 - Master Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage6')}
            >
                <Ionicons name="library-outline" size={24} color="#007AFF" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 6 - Fluency Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#C7C7CC" />
            </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6F7', // Consistent background
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 25,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 17,
    color: '#333',
    flex: 1, // Allow text to take remaining space
  },
}); 