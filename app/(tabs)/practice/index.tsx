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
                <Ionicons name="library-outline" size={24} color="#93E893" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 0 - Beginner Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage1')}
            >
                <Ionicons name="library-outline" size={24} color="#93E893" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 1 - Intermediate Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage2')}
            >
                <Ionicons name="library-outline" size={24} color="#93E893" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 2 - Upper Intermediate</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
            </TouchableOpacity>

            <Text style={styles.subHeader}>Advanced Stages</Text>
            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage3')}
            >
                <Ionicons name="library-outline" size={24} color="#93E893" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 3 - Advanced Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage4')}
            >
                <Ionicons name="library-outline" size={24} color="#93E893" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 4 - Expert Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage5')}
            >
                <Ionicons name="library-outline" size={24} color="#93E893" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 5 - Master Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToStage('./practice/stage6')}
            >
                <Ionicons name="library-outline" size={24} color="#93E893" style={styles.menuIcon} />
                <Text style={styles.menuText}>Stage 6 - Fluency Lessons</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#D2D5E1" />
            </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111629', // Consistent background
    paddingTop: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Lexend-Bold',
    color: '#93E893',
    marginBottom: 25,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  subHeader: {
    fontSize: 20,
    fontFamily: 'Lexend-SemiBold',
    color: '#D2D5E1',
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: '#1E293B',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 17,
    color: '#D2D5E1',
    flex: 1, // Allow text to take remaining space
    fontFamily: 'Lexend-Regular',
  },
}); 