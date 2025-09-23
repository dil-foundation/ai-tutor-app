/**
 * Test Data - Centralized test data management
 */
require('dotenv').config();

class TestData {
    
    /**
     * Get test user data from environment variables
     */
    static getTestUser() {
        return {
            email: process.env.TEST_USER_EMAIL || 'test@example.com',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
            firstName: process.env.TEST_USER_FIRST_NAME || 'Test',
            lastName: process.env.TEST_USER_LAST_NAME || 'User',
            grade: process.env.TEST_USER_GRADE || 'Grade 10',
            englishProficiency: 'I am learning English and want to improve my speaking skills.'
        };
    }

    /**
     * Get invalid test user data
     */
    static getInvalidUser() {
        return {
            email: 'invalid@example.com',
            password: 'wrongpassword',
            firstName: 'Invalid',
            lastName: 'User',
            grade: 'Grade 10',
            englishProficiency: 'Test proficiency text.'
        };
    }

    /**
     * Get new user data for signup tests
     */
    static getNewUser() {
        const timestamp = Date.now();
        return {
            email: `testuser${timestamp}@example.com`,
            password: 'NewUser123!',
            firstName: 'New',
            lastName: 'User',
            grade: 'Grade 8',
            englishProficiency: 'I am a beginner in English and want to learn basic conversation skills.'
        };
    }

    /**
     * Get API configuration
     */
    static getApiConfig() {
        return {
            baseUrl: process.env.API_BASE_URL || 'https://api.dil.lms-staging.com',
            supabaseUrl: process.env.SUPABASE_URL || 'https://yfaiauooxwvekdimfeuu.supabase.co',
            supabaseKey: process.env.SUPABASE_ANON_KEY || '',
            timeout: parseInt(process.env.TEST_TIMEOUT) || 60000
        };
    }

    /**
     * Get BrowserStack configuration
     */
    static getBrowserStackConfig() {
        return {
            username: process.env.BROWSERSTACK_USERNAME || '',
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY || '',
            buildName: process.env.BROWSERSTACK_BUILD_NAME || 'DIL-Tutor-Build-1.0.0',
            androidAppId: process.env.BROWSERSTACK_ANDROID_APP_ID || '',
            iosAppId: process.env.BROWSERSTACK_IOS_APP_ID || ''
        };
    }

    /**
     * Get test environment configuration
     */
    static getTestConfig() {
        return {
            environment: process.env.TEST_ENVIRONMENT || 'staging',
            timeout: parseInt(process.env.TEST_TIMEOUT) || 60000,
            retries: parseInt(process.env.TEST_RETRIES) || 2,
            debugMode: process.env.DEBUG_MODE === 'true',
            verboseLogging: process.env.VERBOSE_LOGGING === 'true',
            screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE === 'true',
            videoRecording: process.env.VIDEO_RECORDING === 'true'
        };
    }

    /**
     * Get test phrases for audio testing
     */
    static getTestPhrases() {
        return [
            'Hello, how are you?',
            'What is your name?',
            'Where are you from?',
            'How old are you?',
            'What do you like to do?',
            'Can you help me?',
            'Thank you very much',
            'Have a nice day',
            'Good morning',
            'Good evening'
        ];
    }

    /**
     * Get test scenarios for different stages
     */
    static getTestScenarios() {
        return {
            stage1: {
                name: 'A1 Beginner',
                exercises: ['Repeat After Me', 'Quick Response', 'Listen and Reply'],
                topics: ['Greetings', 'Numbers', 'Colors', 'Family']
            },
            stage2: {
                name: 'A2 Elementary',
                exercises: ['Daily Routines', 'Quick Answers', 'Roleplay'],
                topics: ['Daily Activities', 'Shopping', 'Food', 'Travel']
            },
            stage3: {
                name: 'B1 Intermediate',
                exercises: ['Storytelling', 'Problem Solving', 'Group Dialogues'],
                topics: ['Work', 'Education', 'Health', 'Environment']
            },
            stage4: {
                name: 'B2 Upper Intermediate',
                exercises: ['News Summaries', 'Mock Interviews', 'Abstract Topics'],
                topics: ['Technology', 'Culture', 'Politics', 'Science']
            },
            stage5: {
                name: 'C1 Advanced',
                exercises: ['Academic Presentations', 'Critical Thinking'],
                topics: ['Research', 'Analysis', 'Debate', 'Leadership']
            },
            stage6: {
                name: 'C2 Proficient',
                exercises: ['Spontaneous Speech', 'Sensitive Scenarios', 'Critical Opinion'],
                topics: ['Complex Issues', 'Ethics', 'Philosophy', 'Innovation']
            }
        };
    }

    /**
     * Get expected UI elements for validation
     */
    static getExpectedElements() {
        return {
            login: [
                '~Sign In',
                '~email-input',
                '~password-input',
                '~sign-in-button',
                '~sign-up-link',
                '~forgot-password-link'
            ],
            signup: [
                '~Create Account',
                '~first-name-input',
                '~last-name-input',
                '~email-input',
                '~password-input',
                '~confirm-password-input',
                '~grade-dropdown',
                '~english-proficiency-input',
                '~create-account-button'
            ],
            mainTabs: [
                '~Learn',
                '~Practice',
                '~Progress',
                '~Profile'
            ],
            profile: [
                '~user-name',
                '~user-email',
                '~user-grade',
                '~user-level',
                '~sign-out-button'
            ]
        };
    }

    /**
     * Get test timeouts for different operations
     */
    static getTimeouts() {
        return {
            short: 5000,
            medium: 15000,
            long: 30000,
            veryLong: 60000,
            network: 10000,
            animation: 2000
        };
    }

    /**
     * Get error messages for validation
     */
    static getErrorMessages() {
        return {
            login: {
                invalidCredentials: 'Invalid email or password',
                networkError: 'Network error occurred',
                serverError: 'Server error occurred'
            },
            signup: {
                emailExists: 'Email already exists',
                weakPassword: 'Password is too weak',
                invalidEmail: 'Invalid email format',
                requiredField: 'This field is required'
            },
            general: {
                networkError: 'Please check your internet connection',
                serverError: 'Something went wrong. Please try again.',
                timeoutError: 'Request timed out'
            }
        };
    }

    /**
     * Get test data for different test suites
     */
    static getTestSuiteData(suiteName) {
        const suites = {
            smoke: {
                user: this.getTestUser(),
                scenarios: ['login', 'navigation', 'logout'],
                timeout: this.getTimeouts().medium
            },
            regression: {
                user: this.getTestUser(),
                scenarios: ['login', 'signup', 'navigation', 'practice', 'progress', 'profile', 'logout'],
                timeout: this.getTimeouts().long
            },
            performance: {
                user: this.getTestUser(),
                scenarios: ['app_load', 'navigation_speed', 'audio_processing'],
                timeout: this.getTimeouts().veryLong
            }
        };

        return suites[suiteName] || suites.smoke;
    }
}

module.exports = TestData;
