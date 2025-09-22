/**
 * Repeat After Me Exercise E2E Tests
 * Tests for the Repeat After Me practice exercise
 */

const AppUtils = require('../../utils/AppUtils');
const TestData = require('../../utils/TestData');

describe('Repeat After Me Exercise Tests', () => {
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
    await appUtils.logStep('Starting new test - Repeat After Me Exercise');
    
    // Login as student and navigate to Repeat After Me exercise
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
    
    // Navigate to Practice tab
    await appUtils.navigateToTab('Practice');
    
    // Navigate to Stage 1
    await appUtils.waitForElement('~Stage 1 - Intermediate Lessons', testData.getTestTimeout('medium'));
    await appUtils.clickWithRetry('~Stage 1 - Intermediate Lessons');
    
    // Navigate to Repeat After Me exercise
    await appUtils.waitForElement('~Repeat After Me', testData.getTestTimeout('medium'));
    await appUtils.clickWithRetry('~Repeat After Me');
    
    // Wait for Repeat After Me screen to load
    await appUtils.waitForElement('~Repeat After Me', testData.getTestTimeout('medium'));
  });

  afterEach(async () => {
    await appUtils.logStep('Test completed - Repeat After Me Exercise');
    
    // Exit Repeat After Me exercise
    try {
      await appUtils.clickWithRetry('~Back');
      await appUtils.driver.pause(1000);
    } catch (error) {
      // Already exited or error occurred
    }
  });

  describe('Repeat After Me Screen UI Elements', () => {
    it('should display all required Repeat After Me screen elements', async () => {
      await appUtils.logStep('Verifying Repeat After Me screen UI elements');

      // Check for phrase display area
      expect(await appUtils.isElementPresent('~Phrase Display')).to.be.true;
      
      // Check for Urdu meaning display
      expect(await appUtils.isElementPresent('~Urdu Meaning')).to.be.true;
      
      // Check for play button
      expect(await appUtils.isElementPresent('~Play Button')).to.be.true;
      
      // Check for record button
      expect(await appUtils.isElementPresent('~Record Button')).to.be.true;
      
      // Check for progress indicator
      expect(await appUtils.isElementPresent('~Progress Indicator')).to.be.true;
      
      // Check for back button
      expect(await appUtils.isElementPresent('~Back')).to.be.true;
    });

    it('should display current phrase and Urdu meaning', async () => {
      await appUtils.logStep('Verifying phrase and meaning display');

      // Check for phrase text
      const phraseElement = await appUtils.waitForElement('~Phrase Display');
      const phraseText = await phraseElement.getText();
      expect(phraseText).to.not.be.empty;
      
      // Check for Urdu meaning
      const urduElement = await appUtils.waitForElement('~Urdu Meaning');
      const urduText = await urduElement.getText();
      expect(urduText).to.not.be.empty;
    });

    it('should display progress information', async () => {
      await appUtils.logStep('Verifying progress information display');

      // Check for progress indicator
      expect(await appUtils.isElementPresent('~Progress Indicator')).to.be.true;
      
      // Check for progress text
      await appUtils.waitForText('1 of', testData.getTestTimeout('short'));
    });
  });

  describe('Audio Playback', () => {
    it('should play phrase audio when play button is clicked', async () => {
      await appUtils.logStep('Testing phrase audio playback');

      // Click play button
      await appUtils.clickWithRetry('~Play Button');
      
      // Check for audio playing indicator
      await appUtils.waitForText('Playing...', testData.getTestTimeout('short'));
      
      // Wait for audio to finish
      await appUtils.waitForText('Ready to record', testData.getTestTimeout('long'));
    });

    it('should show audio playback controls', async () => {
      await appUtils.logStep('Testing audio playback controls');

      // Click play button
      await appUtils.clickWithRetry('~Play Button');
      
      // Check for playback controls
      expect(await appUtils.isElementPresent('~Pause Button')).to.be.true;
      expect(await appUtils.isElementPresent('~Stop Button')).to.be.true;
    });

    it('should allow pausing audio playback', async () => {
      await appUtils.logStep('Testing audio pause functionality');

      // Start playback
      await appUtils.clickWithRetry('~Play Button');
      await appUtils.waitForText('Playing...', testData.getTestTimeout('short'));
      
      // Pause playback
      await appUtils.clickWithRetry('~Pause Button');
      
      // Check for paused state
      await appUtils.waitForText('Paused', testData.getTestTimeout('short'));
    });

    it('should allow stopping audio playback', async () => {
      await appUtils.logStep('Testing audio stop functionality');

      // Start playback
      await appUtils.clickWithRetry('~Play Button');
      await appUtils.waitForText('Playing...', testData.getTestTimeout('short'));
      
      // Stop playback
      await appUtils.clickWithRetry('~Stop Button');
      
      // Check for stopped state
      await appUtils.waitForText('Ready to record', testData.getTestTimeout('short'));
    });
  });

  describe('Voice Recording', () => {
    it('should start recording when record button is clicked', async () => {
      await appUtils.logStep('Testing recording start');

      // Click record button
      await appUtils.clickWithRetry('~Record Button');
      
      // Check for recording indicator
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      
      // Check for voice visualizer
      expect(await appUtils.isElementPresent('~Voice Visualizer')).to.be.true;
    });

    it('should stop recording when record button is clicked again', async () => {
      await appUtils.logStep('Testing recording stop');

      // Start recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      
      // Stop recording
      await appUtils.clickWithRetry('~Record Button');
      
      // Check for processing state
      await appUtils.waitForText('Processing...', testData.getTestTimeout('short'));
    });

    it('should handle voice activity detection', async () => {
      await appUtils.logStep('Testing voice activity detection');

      // Start recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      
      // Wait for voice detection
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      
      // Stop recording
      await appUtils.clickWithRetry('~Record Button');
      
      // Check for processing
      await appUtils.waitForText('Processing...', testData.getTestTimeout('short'));
    });

    it('should handle no speech detected scenario', async () => {
      await appUtils.logStep('Testing no speech detected scenario');

      // Start recording without speaking
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      
      // Wait for no speech detection
      await appUtils.waitForText('No speech detected', testData.getTestTimeout('long'));
      
      // Check for retry option
      expect(await appUtils.isElementPresent('~Try Again')).to.be.true;
    });
  });

  describe('Evaluation and Feedback', () => {
    it('should evaluate user pronunciation', async () => {
      await appUtils.logStep('Testing pronunciation evaluation');

      // Start recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      
      // Wait for voice detection
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      
      // Stop recording
      await appUtils.clickWithRetry('~Record Button');
      
      // Wait for evaluation
      await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
      
      // Check for evaluation result
      await appUtils.waitForText('Correct', testData.getTestTimeout('long'));
    });

    it('should show correct answer feedback', async () => {
      await appUtils.logStep('Testing correct answer feedback');

      // Complete a recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
      
      // Check for correct feedback
      await appUtils.waitForText('Correct', testData.getTestTimeout('long'));
      
      // Check for success animation
      expect(await appUtils.isElementPresent('~Success Animation')).to.be.true;
    });

    it('should show incorrect answer feedback', async () => {
      await appUtils.logStep('Testing incorrect answer feedback');

      // Complete a recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
      
      // Check for incorrect feedback
      await appUtils.waitForText('Incorrect', testData.getTestTimeout('long'));
      
      // Check for retry option
      expect(await appUtils.isElementPresent('~Try Again')).to.be.true;
    });

    it('should provide pronunciation tips', async () => {
      await appUtils.logStep('Testing pronunciation tips');

      // Complete a recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
      
      // Check for pronunciation tips
      await appUtils.waitForText('Tip:', testData.getTestTimeout('long'));
    });
  });

  describe('Progress Tracking', () => {
    it('should track exercise progress', async () => {
      await appUtils.logStep('Testing exercise progress tracking');

      // Complete a recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Correct', testData.getTestTimeout('long'));
      
      // Check for progress update
      await appUtils.waitForText('2 of', testData.getTestTimeout('short'));
    });

    it('should show completion status', async () => {
      await appUtils.logStep('Testing completion status');

      // Complete multiple recordings
      for (let i = 0; i < 3; i++) {
        await appUtils.clickWithRetry('~Record Button');
        await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
        await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
        await appUtils.clickWithRetry('~Record Button');
        await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
        await appUtils.waitForText('Correct', testData.getTestTimeout('long'));
      }
      
      // Check for completion message
      await appUtils.waitForText('Exercise completed', testData.getTestTimeout('short'));
    });

    it('should unlock next content on completion', async () => {
      await appUtils.logStep('Testing content unlocking');

      // Complete exercise
      for (let i = 0; i < 3; i++) {
        await appUtils.clickWithRetry('~Record Button');
        await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
        await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
        await appUtils.clickWithRetry('~Record Button');
        await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
        await appUtils.waitForText('Correct', testData.getTestTimeout('long'));
      }
      
      // Check for unlock message
      await appUtils.waitForText('New content unlocked', testData.getTestTimeout('short'));
    });
  });

  describe('Navigation', () => {
    it('should navigate to next phrase', async () => {
      await appUtils.logStep('Testing navigation to next phrase');

      // Complete current phrase
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Correct', testData.getTestTimeout('long'));
      
      // Check for next phrase
      await appUtils.waitForText('Next', testData.getTestTimeout('short'));
      
      // Click next
      await appUtils.clickWithRetry('~Next');
      
      // Verify new phrase is displayed
      const phraseElement = await appUtils.waitForElement('~Phrase Display');
      const newPhraseText = await phraseElement.getText();
      expect(newPhraseText).to.not.be.empty;
    });

    it('should navigate back to stage selection', async () => {
      await appUtils.logStep('Testing navigation back to stage selection');

      // Click back button
      await appUtils.clickWithRetry('~Back');
      
      // Should return to stage selection
      await appUtils.waitForElement('~Stage 1 - Intermediate Lessons', testData.getTestTimeout('medium'));
      expect(await appUtils.isElementPresent('~Repeat After Me')).to.be.true;
    });
  });

  describe('Error Handling', () => {
    it('should handle audio playback errors', async () => {
      await appUtils.logStep('Testing audio playback error handling');

      // Disable network
      await driver.setNetworkConnection(0);
      
      // Try to play audio
      await appUtils.clickWithRetry('~Play Button');
      
      // Check for error message
      await appUtils.waitForText('Audio playback error', testData.getTestTimeout('medium'));
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });

    it('should handle recording errors', async () => {
      await appUtils.logStep('Testing recording error handling');

      // Start recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      
      // Simulate recording error
      await driver.setNetworkConnection(0);
      
      // Stop recording
      await appUtils.clickWithRetry('~Record Button');
      
      // Check for error message
      await appUtils.waitForText('Recording error', testData.getTestTimeout('medium'));
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });

    it('should handle evaluation errors', async () => {
      await appUtils.logStep('Testing evaluation error handling');

      // Start recording
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      
      // Disable network before stopping
      await driver.setNetworkConnection(0);
      
      // Stop recording
      await appUtils.clickWithRetry('~Record Button');
      
      // Check for evaluation error
      await appUtils.waitForText('Evaluation error', testData.getTestTimeout('medium'));
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await appUtils.logStep('Testing accessibility labels');

      // Check play button accessibility
      const playButton = await appUtils.waitForElement('~Play Button');
      const playLabel = await playButton.getAttribute('label');
      expect(playLabel).to.include('play');
      
      // Check record button accessibility
      const recordButton = await appUtils.waitForElement('~Record Button');
      const recordLabel = await recordButton.getAttribute('label');
      expect(recordLabel).to.include('record');
      
      // Check back button accessibility
      const backButton = await appUtils.waitForElement('~Back');
      const backLabel = await backButton.getAttribute('label');
      expect(backLabel).to.include('back');
    });

    it('should support voice over navigation', async () => {
      await appUtils.logStep('Testing voice over navigation');

      // Check for accessibility elements
      expect(await appUtils.isElementPresent('~Phrase Display')).to.be.true;
      expect(await appUtils.isElementPresent('~Urdu Meaning')).to.be.true;
      expect(await appUtils.isElementPresent('~Play Button')).to.be.true;
      expect(await appUtils.isElementPresent('~Record Button')).to.be.true;
    });
  });
});
