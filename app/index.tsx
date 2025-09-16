import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

export default function Index() {
  // This screen is displayed while the root layout determines the navigation state.
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#58D68D" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 18,
    color: '#111827',
    marginTop: 16,
    fontWeight: '600',
  },
}); 