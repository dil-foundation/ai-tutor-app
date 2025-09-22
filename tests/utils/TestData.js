/**
 * Test Data for DIL Tutor App E2E Tests
 * Centralized test data management
 */

class TestData {
  constructor() {
    this.loadTestData();
  }

  loadTestData() {
    // Load from environment variables or use defaults
    this.testUsers = {
      validStudent: {
        email: process.env.TEST_USER_EMAIL || 'test.student@example.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
        firstName: process.env.TEST_USER_FIRST_NAME || 'Test',
        lastName: process.env.TEST_USER_LAST_NAME || 'Student',
        grade: process.env.TEST_USER_GRADE || 'Grade 10',
        role: 'student'
      },
      validTeacher: {
        email: 'test.teacher@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'Teacher',
        grade: 'Grade 10',
        role: 'teacher'
      },
      validAdmin: {
        email: 'test.admin@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'Admin',
        grade: 'Grade 10',
        role: 'admin'
      },
      invalidUser: {
        email: 'invalid@example.com',
        password: 'WrongPassword123!',
        firstName: 'Invalid',
        lastName: 'User',
        grade: 'Grade 10',
        role: 'student'
      }
    };

    this.testPhrases = {
      repeatAfterMe: [
        {
          id: 1,
          phrase: 'Hello, how are you?',
          urduMeaning: 'ہیلو، آپ کیسے ہیں؟',
          difficulty: 'beginner'
        },
        {
          id: 2,
          phrase: 'Good morning, have a great day!',
          urduMeaning: 'صبح بخیر، آپ کا دن اچھا گزرے!',
          difficulty: 'beginner'
        },
        {
          id: 3,
          phrase: 'I am learning English.',
          urduMeaning: 'میں انگریزی سیکھ رہا ہوں۔',
          difficulty: 'intermediate'
        }
      ],
      quickResponse: [
        {
          id: 1,
          question: 'What is your name?',
          questionUrdu: 'آپ کا نام کیا ہے؟',
          expectedAnswers: ['My name is', 'I am', 'I\'m'],
          expectedAnswersUrdu: ['میرا نام ہے', 'میں ہوں', 'میں'],
          category: 'introduction',
          difficulty: 'beginner'
        },
        {
          id: 2,
          question: 'How old are you?',
          questionUrdu: 'آپ کی عمر کتنی ہے؟',
          expectedAnswers: ['I am', 'I\'m', 'years old'],
          expectedAnswersUrdu: ['میں ہوں', 'سال کا', 'عمر'],
          category: 'personal_info',
          difficulty: 'beginner'
        }
      ],
      listenAndReply: [
        {
          id: 1,
          aiPrompt: 'Tell me about your favorite hobby.',
          aiPromptUrdu: 'مجھے اپنے پسندیدہ شوق کے بارے میں بتائیں۔',
          expectedKeywords: ['hobby', 'favorite', 'like', 'enjoy'],
          expectedKeywordsUrdu: ['شوق', 'پسندیدہ', 'پسند', 'لطف'],
          category: 'hobbies',
          difficulty: 'intermediate',
          context: 'personal_conversation'
        }
      ]
    };

    this.testProgress = {
      stages: [
        {
          id: 1,
          name: 'Stage 1 - A1 Beginner',
          subtitle: 'Foundation Building',
          progress: 0,
          completed: false,
          unlocked: true
        },
        {
          id: 2,
          name: 'Stage 2 - A2 Elementary',
          subtitle: 'Basic Communication',
          progress: 0,
          completed: false,
          unlocked: false
        }
      ],
      achievements: [
        {
          name: 'First Steps',
          icon: '🎯',
          description: 'Complete your first exercise',
          color: '#58D68D'
        },
        {
          name: 'Streak Master',
          icon: '🔥',
          description: 'Maintain a 7-day learning streak',
          color: '#FF6B6B'
        }
      ]
    };

    this.testConversations = {
      englishOnly: [
        {
          userInput: 'Hello, I want to learn English',
          expectedResponse: 'Hello! I\'m excited to help you learn English. Let\'s start with some basic vocabulary.',
          learningPath: 'vocabulary',
          topic: 'greetings'
        },
        {
          userInput: 'How do I say "thank you" in English?',
          expectedResponse: 'You say "thank you" in English. Let\'s practice saying it together.',
          learningPath: 'vocabulary',
          topic: 'polite_expressions'
        }
      ],
      conversation: [
        {
          userInput: 'میں انگریزی سیکھنا چاہتا ہوں',
          expectedTranslation: 'I want to learn English',
          expectedResponse: 'Great! Let\'s start with basic English phrases.',
          learningPath: 'sentence_structure',
          topic: 'learning_goals'
        }
      ]
    };

    this.testErrors = {
      networkError: 'Network connection failed. Please check your internet connection.',
      authenticationError: 'Invalid email or password. Please try again.',
      permissionError: 'Microphone permission is required for this feature.',
      serverError: 'Server error occurred. Please try again later.'
    };

    this.testSettings = {
      languageMode: {
        english: 'English Only',
        urdu: 'English-Urdu'
      },
      audioSettings: {
        volume: 0.8,
        playbackSpeed: 1.0,
        voiceType: 'default'
      },
      notificationSettings: {
        dailyReminder: true,
        weeklyProgress: true,
        achievementAlerts: true,
        newContent: false
      }
    };

    this.testUrls = {
      api: process.env.API_BASE_URL || 'https://api.dil.lms-staging.com',
      supabase: process.env.SUPABASE_URL || 'https://yfaiauooxwvekdimfeuu.supabase.co',
      webDashboard: 'https://dil-dev.lms-staging.com',
      forgotPassword: 'https://dil-dev.lms-staging.com/auth/forgot-password'
    };

    this.testTimeouts = {
      short: 5000,
      medium: 10000,
      long: 30000,
      veryLong: 60000
    };

    this.testRetries = {
      low: 1,
      medium: 2,
      high: 3
    };
  }

  /**
   * Get test user by role
   * @param {string} role - User role ('student', 'teacher', 'admin')
   * @returns {Object} Test user data
   */
  getTestUser(role = 'student') {
    const userKey = `valid${role.charAt(0).toUpperCase() + role.slice(1)}`;
    return this.testUsers[userKey] || this.testUsers.validStudent;
  }

  /**
   * Get test phrase by exercise type
   * @param {string} exerciseType - Exercise type ('repeatAfterMe', 'quickResponse', 'listenAndReply')
   * @param {number} index - Phrase index
   * @returns {Object} Test phrase data
   */
  getTestPhrase(exerciseType, index = 0) {
    return this.testPhrases[exerciseType][index] || this.testPhrases[exerciseType][0];
  }

  /**
   * Get test conversation data
   * @param {string} conversationType - Conversation type ('englishOnly', 'conversation')
   * @param {number} index - Conversation index
   * @returns {Object} Test conversation data
   */
  getTestConversation(conversationType, index = 0) {
    return this.testConversations[conversationType][index] || this.testConversations[conversationType][0];
  }

  /**
   * Get test error message
   * @param {string} errorType - Error type
   * @returns {string} Error message
   */
  getTestError(errorType) {
    return this.testErrors[errorType] || this.testErrors.serverError;
  }

  /**
   * Get test timeout
   * @param {string} timeoutType - Timeout type ('short', 'medium', 'long', 'veryLong')
   * @returns {number} Timeout in milliseconds
   */
  getTestTimeout(timeoutType = 'medium') {
    return this.testTimeouts[timeoutType] || this.testTimeouts.medium;
  }

  /**
   * Get test retry count
   * @param {string} retryType - Retry type ('low', 'medium', 'high')
   * @returns {number} Retry count
   */
  getTestRetries(retryType = 'medium') {
    return this.testRetries[retryType] || this.testRetries.medium;
  }

  /**
   * Generate random test data
   * @param {string} type - Data type ('email', 'name', 'phrase')
   * @returns {string} Random test data
   */
  generateRandomData(type) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    switch (type) {
      case 'email':
        return `test.user.${timestamp}.${random}@example.com`;
      case 'name':
        return `TestUser${timestamp}`;
      case 'phrase':
        return `Test phrase ${timestamp}`;
      default:
        return `test_data_${timestamp}_${random}`;
    }
  }

  /**
   * Get all test users
   * @returns {Object} All test users
   */
  getAllTestUsers() {
    return this.testUsers;
  }

  /**
   * Get all test phrases
   * @returns {Object} All test phrases
   */
  getAllTestPhrases() {
    return this.testPhrases;
  }

  /**
   * Get all test conversations
   * @returns {Object} All test conversations
   */
  getAllTestConversations() {
    return this.testConversations;
  }

  /**
   * Get test settings
   * @returns {Object} Test settings
   */
  getTestSettings() {
    return this.testSettings;
  }

  /**
   * Get test URLs
   * @returns {Object} Test URLs
   */
  getTestUrls() {
    return this.testUrls;
  }

  /**
   * Validate test data
   * @returns {boolean} Validation result
   */
  validateTestData() {
    try {
      // Check if required test users exist
      if (!this.testUsers.validStudent || !this.testUsers.validStudent.email) {
        throw new Error('Valid student test user is missing');
      }

      // Check if test phrases exist
      if (!this.testPhrases.repeatAfterMe || this.testPhrases.repeatAfterMe.length === 0) {
        throw new Error('Repeat after me test phrases are missing');
      }

      // Check if test URLs exist
      if (!this.testUrls.api || !this.testUrls.supabase) {
        throw new Error('Test URLs are missing');
      }

      return true;
    } catch (error) {
      console.error('Test data validation failed:', error.message);
      return false;
    }
  }
}

module.exports = TestData;
