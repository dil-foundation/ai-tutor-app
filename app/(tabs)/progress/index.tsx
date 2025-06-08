import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.content}>
          <Text style={styles.contentText}>Progress tracking will be implemented here.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111629', // Consistent background
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center', // Center content for placeholder
    justifyContent: 'center', // Center content for placeholder
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Lexend-Bold',
    color: '#93E893',
    marginBottom: 25,
  },
  content: {
    alignItems: 'center',
  },
  contentText: {
    fontSize: 18,
    color: '#D2D5E1',
    fontFamily: 'Lexend-Regular',
  },
}); 