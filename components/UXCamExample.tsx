import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUXCam } from '../hooks/useUXCam';
import { UXCamWrapper } from './UXCamWrapper';

/**
 * Example component showing how to integrate UXCam tracking
 */
export const UXCamExample: React.FC = () => {
  const { 
    trackEvent, 
    trackUserInteraction, 
    trackLearningProgress, 
    trackAudioInteraction,
    trackError 
  } = useUXCam();

  const handleButtonPress = () => {
    // Track button interaction
    trackUserInteraction('button_press', {
      button_name: 'example_button',
      screen: 'LearnScreen',
    });
  };

  const handleLearningProgress = () => {
    // Track learning progress
    trackLearningProgress('conversation_completed', 85, {
      lesson_type: 'conversation',
      difficulty: 'intermediate',
    });
  };

  const handleAudioRecording = () => {
    // Track audio interaction
    trackAudioInteraction('recording_started', {
      recording_duration: 30,
      audio_quality: 'high',
    });
  };

  const handleErrorSimulation = () => {
    // Track error event
    trackError('network_error', 'Failed to connect to server', {
      error_code: 'NETWORK_001',
      retry_count: 3,
    });
  };

  const handleCustomEvent = () => {
    // Track custom event
    trackEvent('feature_discovery', {
      feature_name: 'conversation_mode',
      user_level: 'beginner',
      time_spent: 120,
    });
  };

  return (
    <UXCamWrapper 
      screenName="LearnScreen" 
      additionalProperties={{
        screen_type: 'main_learning_hub',
        user_segment: 'active_learner',
      }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>UXCam Integration Example</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
          <Text style={styles.buttonText}>Track Button Press</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLearningProgress}>
          <Text style={styles.buttonText}>Track Learning Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAudioRecording}>
          <Text style={styles.buttonText}>Track Audio Recording</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleErrorSimulation}>
          <Text style={styles.buttonText}>Track Error Event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCustomEvent}>
          <Text style={styles.buttonText}>Track Custom Event</Text>
        </TouchableOpacity>
      </View>
    </UXCamWrapper>
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
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * Example of how to wrap an existing screen component with UXCam
 */
export const withUXCamExample = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithUXCamExample: React.FC<P> = (props) => {
    const { trackScreenView, trackUserInteraction } = useUXCam();

    // Track screen view when component mounts
    React.useEffect(() => {
      trackScreenView('WrappedScreen', {
        screen_type: 'wrapped_component',
        component_name: WrappedComponent.name,
      });
    }, []);

    // Example of tracking user interactions
    const handleInteraction = (interactionType: string, details: any) => {
      trackUserInteraction(interactionType, {
        ...details,
        screen: 'WrappedScreen',
        timestamp: new Date().toISOString(),
      });
    };

    return (
      <WrappedComponent 
        {...props} 
        onUXCamInteraction={handleInteraction}
      />
    );
  };

  WithUXCamExample.displayName = `withUXCamExample(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithUXCamExample;
};
