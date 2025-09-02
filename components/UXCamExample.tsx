import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useUXCamContext } from '../context/UXCamContext';

/**
 * Example component demonstrating UXCam integration
 * This component shows various ways to use UXCam for analytics
 */
const UXCamExample: React.FC = () => {
  const {
    isInitialized,
    isEnabled,
    addEvent,
    setUserProperty,
    tagScreen,
    startNewSession,
    stopRecording,
    resumeRecording,
    optIn,
    optOut,
    getSessionUrl,
    getCurrentUser,
  } = useUXCamContext();

  // Tag this screen when component mounts
  useEffect(() => {
    tagScreen('UXCamExample');
  }, [tagScreen]);

  const handleTrackEvent = () => {
    addEvent('example_button_pressed', {
      buttonName: 'track_event',
      timestamp: new Date().toISOString(),
      screen: 'UXCamExample',
    });
    Alert.alert('Event Tracked', 'Custom event has been tracked!');
  };

  const handleSetUserProperty = () => {
    setUserProperty('example_property', 'example_value');
    setUserProperty('last_action', 'set_property');
    Alert.alert('Property Set', 'User property has been set!');
  };

  const handleStartNewSession = () => {
    startNewSession();
    Alert.alert('New Session', 'New UXCam session started!');
  };

  const handleToggleRecording = () => {
    if (isEnabled) {
      stopRecording();
      Alert.alert('Recording Stopped', 'UXCam recording has been stopped.');
    } else {
      resumeRecording();
      Alert.alert('Recording Resumed', 'UXCam recording has been resumed.');
    }
  };

  const handlePrivacyToggle = () => {
    if (isEnabled) {
      optOut();
      Alert.alert('Privacy Updated', 'UXCam tracking has been disabled.');
    } else {
      optIn();
      Alert.alert('Privacy Updated', 'UXCam tracking has been enabled.');
    }
  };

  const handleGetSessionUrl = async () => {
    try {
      const url = await getSessionUrl();
      if (url) {
        Alert.alert('Session URL', `Current session URL: ${url}`);
      } else {
        Alert.alert('Session URL', 'No session URL available.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get session URL.');
    }
  };

  const handleGetUserInfo = () => {
    const user = getCurrentUser();
    const userInfo = user ? JSON.stringify(user, null, 2) : 'No user data';
    Alert.alert('User Info', userInfo);
  };

  const ExampleButton: React.FC<{
    title: string;
    onPress: () => void;
    color?: string;
  }> = ({ title, onPress, color = '#007AFF' }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>UXCam Integration Example</Text>
        <Text style={styles.subtitle}>
          This component demonstrates various UXCam features
        </Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Initialized:</Text>
          <Text style={[styles.statusValue, { color: isInitialized ? '#4CAF50' : '#F44336' }]}>
            {isInitialized ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Enabled:</Text>
          <Text style={[styles.statusValue, { color: isEnabled ? '#4CAF50' : '#F44336' }]}>
            {isEnabled ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Tracking</Text>
        <ExampleButton
          title="Track Custom Event"
          onPress={handleTrackEvent}
          color="#4CAF50"
        />
        <ExampleButton
          title="Set User Property"
          onPress={handleSetUserProperty}
          color="#2196F3"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Management</Text>
        <ExampleButton
          title="Start New Session"
          onPress={handleStartNewSession}
          color="#FF9800"
        />
        <ExampleButton
          title={isEnabled ? "Stop Recording" : "Resume Recording"}
          onPress={handleToggleRecording}
          color={isEnabled ? "#F44336" : "#4CAF50"}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Controls</Text>
        <ExampleButton
          title={isEnabled ? "Disable Tracking" : "Enable Tracking"}
          onPress={handlePrivacyToggle}
          color={isEnabled ? "#F44336" : "#4CAF50"}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <ExampleButton
          title="Get Session URL"
          onPress={handleGetSessionUrl}
          color="#9C27B0"
        />
        <ExampleButton
          title="Get User Info"
          onPress={handleGetUserInfo}
          color="#607D8B"
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How to Use</Text>
        <Text style={styles.infoText}>
          1. Press buttons to test different UXCam features{'\n'}
          2. Check the console for detailed logs{'\n'}
          3. Monitor your UXCam dashboard for events{'\n'}
          4. Test privacy controls to ensure user choice
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default UXCamExample;
