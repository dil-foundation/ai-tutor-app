import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { clearAuthData } from '../../utils/authStorage';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuthData();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.content}>
          <Text style={styles.contentText}>User profile information will be displayed here.</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    justifyContent: 'flex-start',
    paddingTop: 50,
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
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#93E893',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#111629',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
}); 