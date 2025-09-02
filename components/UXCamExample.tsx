import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useUXCamContext } from '../context/UXCamContext';
import { useUXCamEvents } from '../utils/uxcamEvents';

/**
 * Example component demonstrating UXCam integration usage
 * This component shows how to use various UXCam features
 */
const UXCamExample: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<string>('');
  
  // UXCam context hook
  const {
    isInitialized,
    isRecording,
    isEnabled,
    privacyMode,
    error,
    startSession,
    stopSession,
    pauseRecording,
    resumeRecording,
    optIn,
    optOut,
    setPrivacyMode,
    setIsEnabled,
    getSessionUrl,
    getCurrentSessionId,
    clearError,
  } = useUXCamContext();

  // UXCam events hook
  const {
    trackLessonStarted,
    trackLessonCompleted,
    trackButtonClick,
    trackError,
    trackFeatureUsed,
  } = useUXCamEvents();

  // Handle session management
  const handleStartSession = async () => {
    try {
      await startSession({
        userId: 'example_user',
        userRole: 'student',
        userLevel: 'intermediate',
        userLanguage: 'en',
      });
      
      await trackButtonClick('start_session', 'UXCamExample');
      Alert.alert('Success', 'UXCam session started!');
    } catch (err) {
      await trackError('session_start_failed', 'Failed to start session', 'UXCamExample');
      Alert.alert('Error', 'Failed to start session');
    }
  };

  const handleStopSession = async () => {
    try {
      await stopSession();
      await trackButtonClick('stop_session', 'UXCamExample');
      Alert.alert('Success', 'UXCam session stopped!');
    } catch (err) {
      await trackError('session_stop_failed', 'Failed to stop session', 'UXCamExample');
      Alert.alert('Error', 'Failed to stop session');
    }
  };

  // Handle recording control
  const handlePauseRecording = async () => {
    try {
      await pauseRecording();
      await trackButtonClick('pause_recording', 'UXCamExample');
      Alert.alert('Success', 'Recording paused!');
    } catch (err) {
      Alert.alert('Error', 'Failed to pause recording');
    }
  };

  const handleResumeRecording = async () => {
    try {
      await resumeRecording();
      await trackButtonClick('resume_recording', 'UXCamExample');
      Alert.alert('Success', 'Recording resumed!');
    } catch (err) {
      Alert.alert('Error', 'Failed to resume recording');
    }
  };

  // Handle privacy controls
  const handleOptIn = async () => {
    try {
      await optIn();
      setPrivacyMode(false);
      await trackButtonClick('opt_in', 'UXCamExample');
      Alert.alert('Success', 'Opted into UXCam recording!');
    } catch (err) {
      Alert.alert('Error', 'Failed to opt in');
    }
  };

  const handleOptOut = async () => {
    try {
      await optOut();
      setPrivacyMode(true);
      await trackButtonClick('opt_out', 'UXCamExample');
      Alert.alert('Success', 'Opted out of UXCam recording!');
    } catch (err) {
      Alert.alert('Error', 'Failed to opt out');
    }
  };

  // Handle event tracking examples
  const handleTrackLessonEvent = async () => {
    try {
      await trackLessonStarted('example_lesson_123', 'grammar', {
        difficulty: 'intermediate',
        language: 'en',
        topic: 'present_perfect',
      });
      
      // Simulate lesson completion after 2 seconds
      setTimeout(async () => {
        await trackLessonCompleted('example_lesson_123', 'grammar', 85, {
          timeSpent: 120, // 2 minutes
          mistakes: 2,
          accuracy: 0.85,
        });
        Alert.alert('Success', 'Lesson completed event tracked!');
      }, 2000);
      
      Alert.alert('Success', 'Lesson started event tracked!');
    } catch (err) {
      Alert.alert('Error', 'Failed to track lesson event');
    }
  };

  const handleTrackFeatureUsage = async () => {
    try {
      await trackFeatureUsed('example_feature', {
        featureType: 'interactive',
        usageCount: 1,
        userLevel: 'intermediate',
      });
      Alert.alert('Success', 'Feature usage tracked!');
    } catch (err) {
      Alert.alert('Error', 'Failed to track feature usage');
    }
  };

  // Get session information
  const handleGetSessionInfo = async () => {
    try {
      const sessionUrl = await getSessionUrl();
      const sessionId = getCurrentSessionId();
      
      setSessionInfo(`Session ID: ${sessionId || 'N/A'}\nSession URL: ${sessionUrl || 'N/A'}`);
    } catch (err) {
      setSessionInfo('Failed to get session info');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>UXCam Integration Example</Text>
      
      {/* Status Information */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Status:</Text>
        <Text style={styles.statusText}>Initialized: {isInitialized ? 'Yes' : 'No'}</Text>
        <Text style={styles.statusText}>Recording: {isRecording ? 'Yes' : 'No'}</Text>
        <Text style={styles.statusText}>Enabled: {isEnabled ? 'Yes' : 'No'}</Text>
        <Text style={styles.statusText}>Privacy Mode: {privacyMode ? 'Yes' : 'No'}</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.errorButton} onPress={clearError}>
              <Text style={styles.errorButtonText}>Clear Error</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Session Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Management</Text>
        <TouchableOpacity style={styles.button} onPress={handleStartSession}>
          <Text style={styles.buttonText}>Start Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleStopSession}>
          <Text style={styles.buttonText}>Stop Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleGetSessionInfo}>
          <Text style={styles.buttonText}>Get Session Info</Text>
        </TouchableOpacity>
      </View>

      {/* Recording Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recording Control</Text>
        <TouchableOpacity style={styles.button} onPress={handlePauseRecording}>
          <Text style={styles.buttonText}>Pause Recording</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleResumeRecording}>
          <Text style={styles.buttonText}>Resume Recording</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Controls</Text>
        <TouchableOpacity style={styles.button} onPress={handleOptIn}>
          <Text style={styles.buttonText}>Opt In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleOptOut}>
          <Text style={styles.buttonText}>Opt Out</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setIsEnabled(!isEnabled)}
        >
          <Text style={styles.buttonText}>
            {isEnabled ? 'Disable UXCam' : 'Enable UXCam'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Event Tracking Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Tracking Examples</Text>
        <TouchableOpacity style={styles.button} onPress={handleTrackLessonEvent}>
          <Text style={styles.buttonText}>Track Lesson Event</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleTrackFeatureUsage}>
          <Text style={styles.buttonText}>Track Feature Usage</Text>
        </TouchableOpacity>
      </View>

      {/* Session Information Display */}
      {sessionInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Information</Text>
          <Text style={styles.sessionInfo}>{sessionInfo}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  errorButton: {
    backgroundColor: '#c62828',
    padding: 5,
    borderRadius: 3,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionInfo: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
  },
});

export default UXCamExample;
