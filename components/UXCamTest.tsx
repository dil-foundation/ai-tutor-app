import React, { useEffect } from 'react';
import { useUXCamContext } from '../context/UXCamContext';

/**
 * UXCam Test Component
 * Simple component to test UXCam functionality
 */
const UXCamTest: React.FC = () => {
  const {
    isInitialized,
    isRecording,
    error,
    initialize,
    startSession,
    trackEvent,
  } = useUXCamContext();

  useEffect(() => {
    const testUXCam = async () => {
      try {
        console.log('🧪 [UXCam Test] Testing UXCam functionality...');
        console.log('🧪 [UXCam Test] Is initialized:', isInitialized);
        console.log('🧪 [UXCam Test] Is recording:', isRecording);
        console.log('🧪 [UXCam Test] Error:', error);

        if (!isInitialized) {
          console.log('🧪 [UXCam Test] Initializing UXCam...');
          await initialize();
        }

        if (isInitialized && !isRecording) {
          console.log('🧪 [UXCam Test] Starting test session...');
          await startSession({
            userId: 'test-user',
            userRole: 'student',
            userLevel: 'beginner',
          });
        }

        // Test event tracking
        console.log('🧪 [UXCam Test] Testing event tracking...');
        await trackEvent('uxcam_test', {
          testType: 'integration_test',
          timestamp: Date.now(),
        });

        console.log('🧪 [UXCam Test] UXCam test completed successfully!');
      } catch (error) {
        console.error('🧪 [UXCam Test] Test failed:', error);
      }
    };

    testUXCam();
  }, [isInitialized, isRecording, error, initialize, startSession, trackEvent]);

  return null; // This component doesn't render anything
};

export default UXCamTest;
