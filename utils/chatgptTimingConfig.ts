import { Platform } from 'react-native';

/**
 * 🎯 CHATGPT VOICE MODE TIMING STANDARDIZATION
 * 
 * This configuration is based on ChatGPT Voice mode's optimized timing for natural conversation flow.
 * ChatGPT has extensively tested and optimized these timings for the most natural user experience.
 * 
 * Key principles:
 * - More generous initial silence time to allow users to think and start speaking
 * - Longer post-speech silence to allow for natural pauses and thinking
 * - Natural pause after AI finishes speaking before starting to listen
 * - Grace period after user finishes speaking before processing
 */

export const CHATGPT_TIMING_CONFIG = {
  // Initial silence before user starts speaking (more generous than current)
  // This gives users time to think and formulate their response
  INITIAL_SILENCE_DURATION: Platform.OS === 'ios' ? 12000 : 10000, // 12s iOS, 10s Android (increased from 8s/6s)
  
  // Silence duration after user stops speaking (allows for natural pauses)
  // This accounts for natural speech patterns, thinking pauses, and sentence endings
  POST_SPEECH_SILENCE_DURATION: Platform.OS === 'ios' ? 4000 : 3000, // 4s iOS, 3s Android
  
  // Minimum speech duration to be considered valid
  // Ensures we don't process very short audio clips
  MIN_SPEECH_DURATION: 200, // 500ms minimum speech
  
  // Grace period after AI finishes speaking before starting to listen
  // This mimics the natural pause in human conversation
  POST_AI_SPEECH_DELAY: 1200, // 1.2 seconds (ChatGPT's natural pause)
  
  // Time to wait after user finishes speaking before processing
  // Allows for natural speech endings and prevents cutting off users
  POST_USER_SPEECH_DELAY: 800, // 800ms (allows for natural speech endings)
  
  // Voice Activity Detection thresholds (platform-specific)
  VAD_THRESHOLD: Platform.OS === 'ios' ? -70 : -45, // More sensitive for iOS
  
  // First recording preparation delay (for audio system warm-up)
  FIRST_RECORDING_DELAY: 2000, // 2 second delay for first recording to clear buffers
} as const;

/**
 * Helper function to get the appropriate silence duration based on speech state
 */
export const getSilenceDuration = (hasStartedSpeaking: boolean): number => {
  return hasStartedSpeaking 
    ? CHATGPT_TIMING_CONFIG.POST_SPEECH_SILENCE_DURATION  // After speech started
    : CHATGPT_TIMING_CONFIG.INITIAL_SILENCE_DURATION;     // Before speech started
};

/**
 * Helper function to log timing information for debugging
 */
export const logTimingInfo = (context: string, duration: number, type: 'initial' | 'post-speech' | 'ai-delay' | 'user-delay') => {
  console.log(`🎯 [${context}] ${type} timer: ${duration}ms`);
};

export default CHATGPT_TIMING_CONFIG; 