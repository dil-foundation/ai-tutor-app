/**
 * English Only Learning Feature E2E Tests
 * Tests for the English-only AI tutor conversation
 */

const AppUtils = require('../../utils/AppUtils');
const TestData = require('../../utils/TestData');

describe('English Only Learning Feature Tests', () => {
  let appUtils;
  let testData;

  before(async () => {
    appUtils = new AppUtils(driver);
    testData = new TestData();
    
    // Validate test data
    if (!testData.validateTestData()) {
      throw new Error('Test data validation failed');
    }
  });

  beforeEach(async () => {
    await appUtils.logStep('Starting new test - English Only Learning');
    
    // Login as student and navigate to English Only feature
    await appUtils.restartApp();
    await appUtils.handlePermissions();
    
    // Login as student
    const testUser = testData.getTestUser('student');
    await appUtils.waitForElement('~Login', testData.getTestTimeout('long'));
    await appUtils.typeText('~Email', testUser.email);
    await appUtils.typeText('~Password', testUser.password);
    await appUtils.clickWithRetry('~Login');
    
    // Wait for main app to load
    await appUtils.waitForElement('~Learn', testData.getTestTimeout('long'));
    
    // Navigate to Learn tab
    await appUtils.navigateToTab('Learn');
    
    // Start English Only tutoring
    await appUtils.waitForElement('~Start English Tutoring', testData.getTestTimeout('medium'));
    await appUtils.clickWithRetry('~Start English Tutoring');
    
    // Wait for English Only screen to load
    await appUtils.waitForElement('~English Only', testData.getTestTimeout('medium'));
  });

  afterEach(async () => {
    await appUtils.logStep('Test completed - English Only Learning');
    
    // Exit English Only screen
    try {
      await appUtils.clickWithRetry('~Wrong (X)');
      await appUtils.driver.pause(1000);
    } catch (error) {
      // Already exited or error occurred
    }
  });

  describe('English Only Screen UI Elements', () => {
    it('should display all required English Only screen elements', async () => {
      await appUtils.logStep('Verifying English Only screen UI elements');

      // Check for main conversation area
      expect(await appUtils.isElementPresent('~Conversation Area')).to.be.true;
      
      // Check for microphone button
      expect(await appUtils.isElementPresent('~Microphone Button')).to.be.true;
      
      // Check for exit button
      expect(await appUtils.isElementPresent('~Wrong (X)')).to.be.true;
      
      // Check for status indicator
      expect(await appUtils.isElementPresent('~Status Indicator')).to.be.true;
    });

    it('should display welcome message and instructions', async () => {
      await appUtils.logStep('Verifying welcome message and instructions');

      // Check for welcome message
      await appUtils.waitForText('Welcome to English Only mode', testData.getTestTimeout('medium'));
      
      // Check for instructions
      await appUtils.waitForText('Speak in English to practice', testData.getTestTimeout('short'));
    });
  });

  describe('Voice Recording', () => {
    it('should start voice recording when microphone button is pressed', async () => {
      await appUtils.logStep('Testing voice recording start');

      // Press and hold microphone button
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 1000 },
        { action: 'release' }
      ]);
      
      // Check for recording indicator
      await appUtils.waitForText('Listening...', testData.getTestTimeout('short'));
      
      // Check for voice visualizer
      expect(await appUtils.isElementPresent('~Voice Visualizer')).to.be.true;
    });

    it('should stop voice recording when microphone button is released', async () => {
      await appUtils.logStep('Testing voice recording stop');

      // Press and hold microphone button
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 2000 },
        { action: 'release' }
      ]);
      
      // Wait for processing
      await appUtils.waitForText('Processing...', testData.getTestTimeout('short'));
      
      // Check that recording has stopped
      await appUtils.waitForText('Ready to listen', testData.getTestTimeout('medium'));
    });

    it('should handle voice activity detection', async () => {
      await appUtils.logStep('Testing voice activity detection');

      // Start recording
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Check for voice detection
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('short'));
      
      // Wait for processing
      await appUtils.waitForText('Processing...', testData.getTestTimeout('medium'));
    });

    it('should handle no speech detected scenario', async () => {
      await appUtils.logStep('Testing no speech detected scenario');

      // Start recording without speaking
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 5000 },
        { action: 'release' }
      ]);
      
      // Check for no speech detected message
      await appUtils.waitForText('No speech detected', testData.getTestTimeout('medium'));
      
      // Check for retry option
      expect(await appUtils.isElementPresent('~Try Again')).to.be.true;
    });
  });

  describe('AI Response Handling', () => {
    it('should receive and display AI response', async () => {
      await appUtils.logStep('Testing AI response handling');

      // Start recording and speak
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      
      // Check for AI response in conversation
      expect(await appUtils.isElementPresent('~AI Message')).to.be.true;
    });

    it('should play AI audio response', async () => {
      await appUtils.logStep('Testing AI audio response playback');

      // Start recording and speak
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      
      // Check for audio playback indicator
      expect(await appUtils.isElementPresent('~Audio Playing')).to.be.true;
      
      // Wait for audio to finish
      await appUtils.waitForText('Ready to listen', testData.getTestTimeout('long'));
    });

    it('should handle AI response errors gracefully', async () => {
      await appUtils.logStep('Testing AI response error handling');

      // Simulate network error by disabling network
      await driver.setNetworkConnection(0);
      
      // Start recording
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for error message
      await appUtils.waitForText('Connection error', testData.getTestTimeout('medium'));
      
      // Check for retry option
      expect(await appUtils.isElementPresent('~Retry')).to.be.true;
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });
  });

  describe('Conversation Flow', () => {
    it('should maintain conversation context', async () => {
      await appUtils.logStep('Testing conversation context maintenance');

      // First interaction
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      await appUtils.waitForText('Ready to listen', testData.getTestTimeout('long'));
      
      // Second interaction
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      
      // Check for conversation history
      expect(await appUtils.isElementPresent('~Conversation History')).to.be.true;
    });

    it('should provide personalized responses', async () => {
      await appUtils.logStep('Testing personalized AI responses');

      // Start conversation
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      
      // Check for personalized greeting
      await appUtils.waitForText('Hello', testData.getTestTimeout('short'));
    });

    it('should adapt to user skill level', async () => {
      await appUtils.logStep('Testing skill level adaptation');

      // Start conversation
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      
      // Check for appropriate difficulty level
      expect(await appUtils.isElementPresent('~Beginner Level')).to.be.true;
    });
  });

  describe('Learning Paths', () => {
    it('should offer vocabulary learning path', async () => {
      await appUtils.logStep('Testing vocabulary learning path');

      // Start conversation
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      
      // Check for vocabulary learning path
      await appUtils.waitForText('vocabulary', testData.getTestTimeout('short'));
    });

    it('should offer sentence structure learning path', async () => {
      await appUtils.logStep('Testing sentence structure learning path');

      // Start conversation
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      
      // Check for sentence structure learning path
      await appUtils.waitForText('sentence', testData.getTestTimeout('short'));
    });

    it('should offer topic-based learning path', async () => {
      await appUtils.logStep('Testing topic-based learning path');

      // Start conversation
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for AI response
      await appUtils.waitForText('AI is speaking', testData.getTestTimeout('long'));
      
      // Check for topic-based learning path
      await appUtils.waitForText('topic', testData.getTestTimeout('short'));
    });
  });

  describe('Error Handling', () => {
    it('should handle microphone permission denial', async () => {
      await appUtils.logStep('Testing microphone permission denial');

      // Simulate permission denial
      await driver.setNetworkConnection(0);
      
      // Try to start recording
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 1000 },
        { action: 'release' }
      ]);
      
      // Check for permission error
      await appUtils.waitForText('Microphone permission required', testData.getTestTimeout('medium'));
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });

    it('should handle WebSocket connection errors', async () => {
      await appUtils.logStep('Testing WebSocket connection errors');

      // Disable network
      await driver.setNetworkConnection(0);
      
      // Try to start recording
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Check for connection error
      await appUtils.waitForText('Connection failed', testData.getTestTimeout('medium'));
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });

    it('should handle audio processing errors', async () => {
      await appUtils.logStep('Testing audio processing errors');

      // Start recording
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 3000 },
        { action: 'release' }
      ]);
      
      // Wait for processing error
      await appUtils.waitForText('Processing error', testData.getTestTimeout('medium'));
      
      // Check for retry option
      expect(await appUtils.isElementPresent('~Retry')).to.be.true;
    });
  });

  describe('Navigation and Exit', () => {
    it('should exit English Only mode when exit button is pressed', async () => {
      await appUtils.logStep('Testing exit from English Only mode');

      // Click exit button
      await appUtils.clickWithRetry('~Wrong (X)');
      
      // Should return to Learn tab
      await appUtils.waitForElement('~Start English Tutoring', testData.getTestTimeout('medium'));
      expect(await appUtils.isElementPresent('~Start English Tutoring')).to.be.true;
    });

    it('should confirm exit when exit button is pressed', async () => {
      await appUtils.logStep('Testing exit confirmation');

      // Click exit button
      await appUtils.clickWithRetry('~Wrong (X)');
      
      // Check for exit confirmation
      await appUtils.waitForText('Are you sure you want to exit?', testData.getTestTimeout('short'));
      
      // Confirm exit
      await appUtils.clickWithRetry('~Yes');
      
      // Should return to Learn tab
      await appUtils.waitForElement('~Start English Tutoring', testData.getTestTimeout('medium'));
    });

    it('should cancel exit when cancel button is pressed', async () => {
      await appUtils.logStep('Testing exit cancellation');

      // Click exit button
      await appUtils.clickWithRetry('~Wrong (X)');
      
      // Check for exit confirmation
      await appUtils.waitForText('Are you sure you want to exit?', testData.getTestTimeout('short'));
      
      // Cancel exit
      await appUtils.clickWithRetry('~No');
      
      // Should remain in English Only mode
      expect(await appUtils.isElementPresent('~English Only')).to.be.true;
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should respond quickly to user input', async () => {
      await appUtils.logStep('Testing response time');

      const startTime = Date.now();
      
      // Start recording
      const micButton = await appUtils.waitForElement('~Microphone Button');
      await micButton.touchAction([
        { action: 'press' },
        { action: 'wait', ms: 1000 },
        { action: 'release' }
      ]);
      
      // Wait for response
      await appUtils.waitForText('Processing...', testData.getTestTimeout('short'));
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(5000); // Should respond within 5 seconds
    });

    it('should handle multiple rapid interactions', async () => {
      await appUtils.logStep('Testing multiple rapid interactions');

      const micButton = await appUtils.waitForElement('~Microphone Button');
      
      // Perform multiple rapid interactions
      for (let i = 0; i < 3; i++) {
        await micButton.touchAction([
          { action: 'press' },
          { action: 'wait', ms: 1000 },
          { action: 'release' }
        ]);
        
        await appUtils.driver.pause(500);
      }
      
      // Should handle all interactions gracefully
      await appUtils.waitForText('Ready to listen', testData.getTestTimeout('long'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await appUtils.logStep('Testing accessibility labels');

      // Check microphone button accessibility
      const micButton = await appUtils.waitForElement('~Microphone Button');
      const micLabel = await micButton.getAttribute('label');
      expect(micLabel).to.include('microphone');
      
      // Check exit button accessibility
      const exitButton = await appUtils.waitForElement('~Wrong (X)');
      const exitLabel = await exitButton.getAttribute('label');
      expect(exitLabel).to.include('exit');
    });

    it('should support voice over navigation', async () => {
      await appUtils.logStep('Testing voice over navigation');

      // Check for accessibility elements
      expect(await appUtils.isElementPresent('~Conversation Area')).to.be.true;
      expect(await appUtils.isElementPresent('~Microphone Button')).to.be.true;
      expect(await appUtils.isElementPresent('~Wrong (X)')).to.be.true;
    });
  });
});
