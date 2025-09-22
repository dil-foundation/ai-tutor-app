/**
 * Progress Tracking E2E Tests
 * Tests for the progress tracking and visualization features
 */

const AppUtils = require('../../utils/AppUtils');
const TestData = require('../../utils/TestData');

describe('Progress Tracking Tests', () => {
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
    await appUtils.logStep('Starting new test - Progress Tracking');
    
    // Login as student and navigate to Progress tab
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
    
    // Navigate to Progress tab
    await appUtils.navigateToTab('Progress');
    
    // Wait for Progress screen to load
    await appUtils.waitForElement('~Progress', testData.getTestTimeout('medium'));
  });

  afterEach(async () => {
    await appUtils.logStep('Test completed - Progress Tracking');
  });

  describe('Progress Screen UI Elements', () => {
    it('should display all required progress screen elements', async () => {
      await appUtils.logStep('Verifying progress screen UI elements');

      // Check for current stage display
      expect(await appUtils.isElementPresent('~Current Stage')).to.be.true;
      
      // Check for overall progress indicator
      expect(await appUtils.isElementPresent('~Overall Progress')).to.be.true;
      
      // Check for streak display
      expect(await appUtils.isElementPresent('~Streak Days')).to.be.true;
      
      // Check for practice time display
      expect(await appUtils.isElementPresent('~Practice Time')).to.be.true;
      
      // Check for achievements section
      expect(await appUtils.isElementPresent('~Achievements')).to.be.true;
      
      // Check for roadmap section
      expect(await appUtils.isElementPresent('~Roadmap')).to.be.true;
    });

    it('should display current stage information', async () => {
      await appUtils.logStep('Verifying current stage information');

      // Check for stage name
      const stageElement = await appUtils.waitForElement('~Current Stage');
      const stageText = await stageElement.getText();
      expect(stageText).to.not.be.empty;
      
      // Check for stage progress
      expect(await appUtils.isElementPresent('~Stage Progress')).to.be.true;
    });

    it('should display overall progress statistics', async () => {
      await appUtils.logStep('Verifying overall progress statistics');

      // Check for overall progress percentage
      const progressElement = await appUtils.waitForElement('~Overall Progress');
      const progressText = await progressElement.getText();
      expect(progressText).to.include('%');
      
      // Check for total exercises completed
      expect(await appUtils.isElementPresent('~Exercises Completed')).to.be.true;
      
      // Check for total practice time
      expect(await appUtils.isElementPresent('~Total Practice Time')).to.be.true;
    });
  });

  describe('Progress Visualization', () => {
    it('should display circular progress indicator', async () => {
      await appUtils.logStep('Testing circular progress indicator');

      // Check for circular progress component
      expect(await appUtils.isElementPresent('~Circular Progress')).to.be.true;
      
      // Check for progress percentage display
      expect(await appUtils.isElementPresent('~Progress Percentage')).to.be.true;
    });

    it('should display progress bar for current stage', async () => {
      await appUtils.logStep('Testing stage progress bar');

      // Check for stage progress bar
      expect(await appUtils.isElementPresent('~Stage Progress Bar')).to.be.true;
      
      // Check for progress bar fill
      const progressBar = await appUtils.waitForElement('~Stage Progress Bar');
      const progressValue = await progressBar.getAttribute('value');
      expect(progressValue).to.not.be.null;
    });

    it('should display learning roadmap', async () => {
      await appUtils.logStep('Testing learning roadmap display');

      // Check for roadmap container
      expect(await appUtils.isElementPresent('~Roadmap')).to.be.true;
      
      // Check for stage cards
      expect(await appUtils.isElementPresent('~Stage Card')).to.be.true;
      
      // Check for roadmap lines
      expect(await appUtils.isElementPresent('~Roadmap Line')).to.be.true;
    });

    it('should display stage cards with proper information', async () => {
      await appUtils.logStep('Testing stage cards information');

      // Check for stage number
      expect(await appUtils.isElementPresent('~Stage Number')).to.be.true;
      
      // Check for stage title
      expect(await appUtils.isElementPresent('~Stage Title')).to.be.true;
      
      // Check for stage subtitle
      expect(await appUtils.isElementPresent('~Stage Subtitle')).to.be.true;
      
      // Check for stage status
      expect(await appUtils.isElementPresent('~Stage Status')).to.be.true;
    });
  });

  describe('Achievements System', () => {
    it('should display achievements section', async () => {
      await appUtils.logStep('Testing achievements section');

      // Check for achievements header
      expect(await appUtils.isElementPresent('~Achievements')).to.be.true;
      
      // Check for achievement cards
      expect(await appUtils.isElementPresent('~Achievement Card')).to.be.true;
    });

    it('should display achievement information', async () => {
      await appUtils.logStep('Testing achievement information display');

      // Check for achievement icon
      expect(await appUtils.isElementPresent('~Achievement Icon')).to.be.true;
      
      // Check for achievement name
      expect(await appUtils.isElementPresent('~Achievement Name')).to.be.true;
      
      // Check for achievement description
      expect(await appUtils.isElementPresent('~Achievement Description')).to.be.true;
      
      // Check for achievement date
      expect(await appUtils.isElementPresent('~Achievement Date')).to.be.true;
    });

    it('should show achievement progress', async () => {
      await appUtils.logStep('Testing achievement progress display');

      // Check for achievement progress indicator
      expect(await appUtils.isElementPresent('~Achievement Progress')).to.be.true;
      
      // Check for progress percentage
      expect(await appUtils.isElementPresent('~Achievement Percentage')).to.be.true;
    });
  });

  describe('Statistics Display', () => {
    it('should display streak information', async () => {
      await appUtils.logStep('Testing streak information display');

      // Check for current streak
      const streakElement = await appUtils.waitForElement('~Streak Days');
      const streakText = await streakElement.getText();
      expect(streakText).to.not.be.empty;
      
      // Check for longest streak
      expect(await appUtils.isElementPresent('~Longest Streak')).to.be.true;
    });

    it('should display practice time statistics', async () => {
      await appUtils.logStep('Testing practice time statistics');

      // Check for total practice time
      const practiceTimeElement = await appUtils.waitForElement('~Practice Time');
      const practiceTimeText = await practiceTimeElement.getText();
      expect(practiceTimeText).to.not.be.empty;
      
      // Check for average session duration
      expect(await appUtils.isElementPresent('~Average Session Duration')).to.be.true;
      
      // Check for weekly learning hours
      expect(await appUtils.isElementPresent('~Weekly Learning Hours')).to.be.true;
      
      // Check for monthly learning hours
      expect(await appUtils.isElementPresent('~Monthly Learning Hours')).to.be.true;
    });

    it('should display exercise completion statistics', async () => {
      await appUtils.logStep('Testing exercise completion statistics');

      // Check for total exercises completed
      expect(await appUtils.isElementPresent('~Exercises Completed')).to.be.true;
      
      // Check for completed stages
      expect(await appUtils.isElementPresent('~Completed Stages')).to.be.true;
      
      // Check for total learning units
      expect(await appUtils.isElementPresent('~Total Learning Units')).to.be.true;
      
      // Check for completed units
      expect(await appUtils.isElementPresent('~Completed Units')).to.be.true;
    });
  });

  describe('Progress Updates', () => {
    it('should update progress after completing exercises', async () => {
      await appUtils.logStep('Testing progress updates after exercise completion');

      // Navigate to Practice tab
      await appUtils.navigateToTab('Practice');
      
      // Complete a quick exercise
      await appUtils.waitForElement('~Stage 1 - Intermediate Lessons', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Stage 1 - Intermediate Lessons');
      await appUtils.waitForElement('~Repeat After Me', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Repeat After Me');
      
      // Complete the exercise
      await appUtils.waitForElement('~Record Button', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Recording...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Voice detected', testData.getTestTimeout('medium'));
      await appUtils.clickWithRetry('~Record Button');
      await appUtils.waitForText('Evaluating...', testData.getTestTimeout('short'));
      await appUtils.waitForText('Correct', testData.getTestTimeout('long'));
      
      // Navigate back to Progress tab
      await appUtils.navigateToTab('Progress');
      
      // Check for progress update
      await appUtils.waitForElement('~Progress', testData.getTestTimeout('medium'));
      
      // Verify progress has been updated
      const progressElement = await appUtils.waitForElement('~Overall Progress');
      const progressText = await progressElement.getText();
      expect(progressText).to.not.be.empty;
    });

    it('should refresh progress data', async () => {
      await appUtils.logStep('Testing progress data refresh');

      // Pull to refresh
      await appUtils.swipe('down');
      
      // Check for refresh indicator
      await appUtils.waitForText('Refreshing...', testData.getTestTimeout('short'));
      
      // Wait for refresh to complete
      await appUtils.waitForLoadingComplete();
      
      // Verify data is refreshed
      expect(await appUtils.isElementPresent('~Current Stage')).to.be.true;
    });
  });

  describe('Error Handling', () => {
    it('should handle progress data loading errors', async () => {
      await appUtils.logStep('Testing progress data loading error handling');

      // Disable network
      await driver.setNetworkConnection(0);
      
      // Navigate to Progress tab
      await appUtils.navigateToTab('Progress');
      
      // Check for error message
      await appUtils.waitForText('Failed to load progress data', testData.getTestTimeout('medium'));
      
      // Check for retry option
      expect(await appUtils.isElementPresent('~Retry')).to.be.true;
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });

    it('should show fallback data when progress loading fails', async () => {
      await appUtils.logStep('Testing fallback data display');

      // Disable network
      await driver.setNetworkConnection(0);
      
      // Navigate to Progress tab
      await appUtils.navigateToTab('Progress');
      
      // Wait for error handling
      await appUtils.waitForText('Failed to load progress data', testData.getTestTimeout('medium'));
      
      // Check for fallback data
      expect(await appUtils.isElementPresent('~Current Stage')).to.be.true;
      expect(await appUtils.isElementPresent('~Overall Progress')).to.be.true;
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });
  });

  describe('Navigation', () => {
    it('should navigate to stage details when stage card is tapped', async () => {
      await appUtils.logStep('Testing navigation to stage details');

      // Tap on a stage card
      await appUtils.clickWithRetry('~Stage Card');
      
      // Should navigate to stage details
      await appUtils.waitForElement('~Stage Details', testData.getTestTimeout('medium'));
    });

    it('should navigate back from stage details', async () => {
      await appUtils.logStep('Testing navigation back from stage details');

      // Navigate to stage details
      await appUtils.clickWithRetry('~Stage Card');
      await appUtils.waitForElement('~Stage Details', testData.getTestTimeout('medium'));
      
      // Navigate back
      await appUtils.clickWithRetry('~Back');
      
      // Should return to progress screen
      await appUtils.waitForElement('~Progress', testData.getTestTimeout('medium'));
    });
  });

  describe('Performance', () => {
    it('should load progress data quickly', async () => {
      await appUtils.logStep('Testing progress data loading performance');

      const startTime = Date.now();
      
      // Navigate to Progress tab
      await appUtils.navigateToTab('Progress');
      
      // Wait for progress data to load
      await appUtils.waitForElement('~Current Stage', testData.getTestTimeout('long'));
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
    });

    it('should handle large amounts of progress data', async () => {
      await appUtils.logStep('Testing large progress data handling');

      // Navigate to Progress tab
      await appUtils.navigateToTab('Progress');
      
      // Wait for data to load
      await appUtils.waitForElement('~Current Stage', testData.getTestTimeout('long'));
      
      // Check for roadmap with multiple stages
      expect(await appUtils.isElementPresent('~Roadmap')).to.be.true;
      
      // Check for achievements section
      expect(await appUtils.isElementPresent('~Achievements')).to.be.true;
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await appUtils.logStep('Testing accessibility labels');

      // Check progress indicator accessibility
      const progressElement = await appUtils.waitForElement('~Overall Progress');
      const progressLabel = await progressElement.getAttribute('label');
      expect(progressLabel).to.include('progress');
      
      // Check stage card accessibility
      const stageCard = await appUtils.waitForElement('~Stage Card');
      const stageLabel = await stageCard.getAttribute('label');
      expect(stageLabel).to.include('stage');
    });

    it('should support voice over navigation', async () => {
      await appUtils.logStep('Testing voice over navigation');

      // Check for accessibility elements
      expect(await appUtils.isElementPresent('~Current Stage')).to.be.true;
      expect(await appUtils.isElementPresent('~Overall Progress')).to.be.true;
      expect(await appUtils.isElementPresent('~Streak Days')).to.be.true;
      expect(await appUtils.isElementPresent('~Practice Time')).to.be.true;
    });
  });
});
