import * as FileSystem from 'expo-file-system';

let BASE_API_URL: string;
let FRONTEND_URL: string;

if (__DEV__) {
  // Development URL - update to your local IP and 
  //added.
  BASE_API_URL = 'https://dtqiibdxbx6tm.cloudfront.net';

  // BASE_API_URL = 'http://192.168.1.9:8000';

  FRONTEND_URL = 'https://dtqiibdxbx6tm.cloudfront.net';

  // BASE_API_URL = 'https://learn.dil.org';

  // FRONTEND_URL = 'https://learn.dil.org';

  // BASE_API_URL = 'https://bda6-2401-4900-4df1-bc03-f029-886d-1f7c-9add.ngrok-free.app';
} else {
  // Production URL
  BASE_API_URL = 'https://learn.dil.org';

  FRONTEND_URL = 'https://learn.dil.org';
  // BASE_API_URL = 'https://api.dil.lms-staging.com';

  // FRONTEND_URL = 'https://dil-dev.lms-staging.com';
}

export const WORDPRESS_API_URL = FRONTEND_URL;

// Export frontend URL for authentication flows
export { FRONTEND_URL };

/**
 * Send text to backend and receive TTS audio (.wav) file
 * @param text - Word to convert to audio (e.g. "Apple")
 * @returns audio URL as blob object URL or null on error
 */
export const fetchAudioFromText = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch(`${BASE_API_URL}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const blob = await response.blob();

    const reader = new FileReader();
    return await new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (base64data) {
          const fileUri = FileSystem.cacheDirectory + `${text}.mp3`;
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve(fileUri);
        } else {
          reject("Base64 conversion failed");
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching audio:", error);
    return null;
  }
};


export default BASE_API_URL; 

// API endpoints with authentication
export const API_ENDPOINTS = {
  // Progress tracking
  INITIALIZE_PROGRESS: `${BASE_API_URL}/api/progress/initialize-progress`,
  RECORD_TOPIC_ATTEMPT: `${BASE_API_URL}/api/progress/record-topic-attempt`,
  COMPLETE_LESSON: `${BASE_API_URL}/api/progress/complete-lesson`,
  GET_USER_PROGRESS: (userId: string) => `${BASE_API_URL}/api/progress/user-progress/${userId}`,
  CHECK_UNLOCKS: (userId: string) => `${BASE_API_URL}/api/progress/check-unlocks/${userId}`,
  GET_CURRENT_TOPIC: `${BASE_API_URL}/api/progress/get-current-topic`,
  COMPREHENSIVE_PROGRESS: `${BASE_API_URL}/api/progress/comprehensive-progress`,
  
  // New Auth endpoint
  SIGNUP: `${BASE_API_URL}/api/auth/signup`,

  // User management
  GET_USER_PROFILE: (userId: string) => `${BASE_API_URL}/user/profile/${userId}`,
  UPDATE_USER_PROFILE: (userId: string) => `${BASE_API_URL}/user/profile/${userId}`,
  
  // Exercise endpoints
  IN_DEPTH_INTERVIEW: (promptId: number) => `${BASE_API_URL}/api/in-depth-interview/${promptId}`,
  EVALUATE_IN_DEPTH_INTERVIEW: `${BASE_API_URL}/api/evaluate-in-depth-interview`,
  IN_DEPTH_INTERVIEW_PROMPTS: `${BASE_API_URL}/api/in-depth-interview-prompts`,
  IN_DEPTH_INTERVIEW_PROMPT: (promptId: number) => `${BASE_API_URL}/api/in-depth-interview-prompts/${promptId}`,
  
  // Repeat After Me endpoints
  PHRASES: `${BASE_API_URL}/api/phrases`,
  PHRASE: (phraseId: number) => `${BASE_API_URL}/api/phrases/${phraseId}`,
  REPEAT_AFTER_ME: (topicId: number) => `${BASE_API_URL}/api/repeat-after-me/${topicId}`,
  EVALUATE_REPEAT_AFTER_ME: `${BASE_API_URL}/api/evaluate-audio`,
  
  // Quick Response endpoints
  PROMPTS: `${BASE_API_URL}/api/prompts`,
  PROMPT: (promptId: number) => `${BASE_API_URL}/api/prompts/${promptId}`,
  QUICK_RESPONSE: (promptId: number) => `${BASE_API_URL}/api/quick-response/${promptId}`,
  EVALUATE_QUICK_RESPONSE: `${BASE_API_URL}/api/evaluate-quick-response`,
  
  // Listen and Reply endpoints
  DIALOGUES: `${BASE_API_URL}/api/dialogues`,
  DIALOGUE: (dialogueId: number) => `${BASE_API_URL}/api/dialogues/${dialogueId}`,
  LISTEN_AND_REPLY: (topicId: number) => `${BASE_API_URL}/api/listen-and-reply/${topicId}`,
  EVALUATE_LISTEN_REPLY: `${BASE_API_URL}/api/evaluate-listen-reply`,
  
  // Stage 2 endpoints
  DAILY_ROUTINES: `${BASE_API_URL}/api/daily-routine-phrases`,
  DAILY_ROUTINE_PHRASE: (phraseId: number) => `${BASE_API_URL}/api/daily-routine-phrases/${phraseId}`,
  DAILY_ROUTINE: (routineId: number) => `${BASE_API_URL}/api/daily-routine/${routineId}`,
  EVALUATE_DAILY_ROUTINE: `${BASE_API_URL}/api/evaluate-daily-routine`,
  
  QUICK_ANSWERS: `${BASE_API_URL}/api/quick-answer-questions`,
  QUICK_ANSWER_QUESTION: (questionId: number) => `${BASE_API_URL}/api/quick-answer-questions/${questionId}`,
  QUICK_ANSWER: (answerId: number) => `${BASE_API_URL}/api/quick-answer/${answerId}`,
  EVALUATE_QUICK_ANSWER: `${BASE_API_URL}/api/evaluate-quick-answer`,
  
  ROLEPLAY_SCENARIOS: `${BASE_API_URL}/api/roleplay-scenarios`,
  ROLEPLAY_SCENARIO: (scenarioId: number) => `${BASE_API_URL}/api/roleplay-scenarios/${scenarioId}`,
  EVALUATE_ROLEPLAY_SIMULATION: `${BASE_API_URL}/api/roleplay/evaluate`,
  
  ROLEPLAY_CHATS: `${BASE_API_URL}/api/roleplay-chats`,
  ROLEPLAY_CHAT: (chatId: number) => `${BASE_API_URL}/api/roleplay-chats/${chatId}`,
  EVALUATE_ROLEPLAY_CHAT: `${BASE_API_URL}/api/evaluate-roleplay-chat`,
  
  // Stage 3 endpoints
  STORYTELLING_PROMPTS: `${BASE_API_URL}/api/storytelling-prompts`,
  STORYTELLING_PROMPT: (promptId: number) => `${BASE_API_URL}/api/storytelling-prompts/${promptId}`,
  STORYTELLING_AUDIO: (promptId: number) => `${BASE_API_URL}/api/storytelling/${promptId}`,
  EVALUATE_STORYTELLING: `${BASE_API_URL}/api/evaluate-storytelling`,
  
  PROBLEM_SOLVING_SCENARIOS: `${BASE_API_URL}/api/problem-solving-scenarios`,
  PROBLEM_SOLVING_SCENARIO: (scenarioId: number) => `${BASE_API_URL}/api/problem-solving-scenarios/${scenarioId}`,
  PROBLEM_SOLVING_AUDIO: (scenarioId: number) => `${BASE_API_URL}/api/problem-solving/${scenarioId}`,
  PROBLEM_SOLVING_PROGRESS: (userId: string) => `${BASE_API_URL}/api/problem-solving-progress/${userId}`,
  PROBLEM_SOLVING_CURRENT_TOPIC: (userId: string) => `${BASE_API_URL}/api/problem-solving-current-topic/${userId}`,
  EVALUATE_PROBLEM_SOLVING: `${BASE_API_URL}/api/evaluate-problem-solving`,
  
  GROUP_DIALOGUES: `${BASE_API_URL}/api/group-dialogue-scenarios`,
  GROUP_DIALOGUE: (dialogueId: number) => `${BASE_API_URL}/api/group-dialogue-scenarios/${dialogueId}`,
  EVALUATE_GROUP_DIALOGUE: `${BASE_API_URL}/api/evaluate-group-dialogue`,
  
  // Stage 4 endpoints
  NEWS_SUMMARIES: `${BASE_API_URL}/api/news-summary-items`,
  NEWS_SUMMARY: (summaryId: number) => `${BASE_API_URL}/api/news-summary-items/${summaryId}`,
  EVALUATE_NEWS_SUMMARY: `${BASE_API_URL}/api/evaluate-news-summary`,
  
  MOCK_INTERVIEWS: `${BASE_API_URL}/api/mock-interview-questions`,
  MOCK_INTERVIEW: (interviewId: number) => `${BASE_API_URL}/api/mock-interview-questions/${interviewId}`,
  MOCK_INTERVIEW_AUDIO: (interviewId: number) => `${BASE_API_URL}/api/mock-interview/${interviewId}`,
  EVALUATE_MOCK_INTERVIEW: `${BASE_API_URL}/api/evaluate-mock-interview`,
  
  ABSTRACT_TOPICS: `${BASE_API_URL}/api/abstract-topics`,
  ABSTRACT_TOPIC: (topicId: number) => `${BASE_API_URL}/api/abstract-topics/${topicId}`,
  ABSTRACT_TOPIC_AUDIO: (topicId: number) => `${BASE_API_URL}/api/abstract-topic/${topicId}`,
  EVALUATE_ABSTRACT_TOPIC: `${BASE_API_URL}/api/evaluate-abstract-topic`,
  
  // Stage 5 endpoints
  ACADEMIC_PRESENTATIONS: `${BASE_API_URL}/api/academic-presentation-topics`,
  ACADEMIC_PRESENTATION: (presentationId: number) => `${BASE_API_URL}/api/academic-presentation-topics/${presentationId}`,
  EVALUATE_ACADEMIC_PRESENTATION: `${BASE_API_URL}/api/evaluate-academic-presentation`,
  
  CRITICAL_THINKING_DIALOGUES: `${BASE_API_URL}/api/critical-thinking-topics`,
  CRITICAL_THINKING_DIALOGUE: (dialogueId: number) => `${BASE_API_URL}/api/critical-thinking-topics/${dialogueId}`,
  EVALUATE_CRITICAL_THINKING: `${BASE_API_URL}/api/evaluate-critical-thinking`,
  
  // Stage 6 endpoints
  SPONTANEOUS_SPEECH_TOPICS: `${BASE_API_URL}/api/spontaneous-speech-topics`,
  SPONTANEOUS_SPEECH_TOPIC: (topicId: number) => `${BASE_API_URL}/api/spontaneous-speech-topics/${topicId}`,
  SPONTANEOUS_SPEECH: (topicId: number) => `${BASE_API_URL}/api/spontaneous-speech/${topicId}`,
  EVALUATE_SPONTANEOUS_SPEECH: `${BASE_API_URL}/api/evaluate-spontaneous-speech`,
  
  // Stage 6 Exercise 2 - Sensitive Scenario endpoints
  SENSITIVE_SCENARIO_SCENARIOS: `${BASE_API_URL}/api/sensitive-scenario-scenarios`,
  SENSITIVE_SCENARIO_SCENARIO: (scenarioId: number) => `${BASE_API_URL}/api/sensitive-scenario-scenarios/${scenarioId}`,
  SENSITIVE_SCENARIO: (scenarioId: number) => `${BASE_API_URL}/api/sensitive-scenario/${scenarioId}`,
  EVALUATE_SENSITIVE_SCENARIO: `${BASE_API_URL}/api/evaluate-sensitive-scenario`,
  
  // Stage 6 Exercise 3 - Critical Opinion Builder endpoints
  CRITICAL_OPINION_TOPICS: `${BASE_API_URL}/api/critical-opinion-topics`,
  CRITICAL_OPINION_TOPIC: (topicId: number) => `${BASE_API_URL}/api/critical-opinion-topics/${topicId}`,
  CRITICAL_OPINION_BUILDER: (topicId: number) => `${BASE_API_URL}/api/critical-opinion-builder/${topicId}`,
  EVALUATE_CRITICAL_OPINION: `${BASE_API_URL}/api/evaluate-critical-opinion`,
  
  // Health check
  HEALTH_CHECK: `${BASE_API_URL}/api/healthcheck`,
  
  // Account deletion endpoints
  DELETE_ACCOUNT: `${BASE_API_URL}/api/account/delete-account`,
  DELETION_STATUS: `${BASE_API_URL}/api/account/deletion-status`,
  CANCEL_DELETION: `${BASE_API_URL}/api/account/cancel-deletion`,

  // User
  GET_ME: `${BASE_API_URL}/user/me`,
} as const;
