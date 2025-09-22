/**
 * App Utilities for DIL Tutor App E2E Tests
 * Common utility functions for app interactions
 */

class AppUtils {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Wait for element to be visible
   * @param {string} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<WebdriverIO.Element>}
   */
  async waitForElement(locator, timeout = 10000) {
    try {
      const element = await this.driver.$(locator);
      await element.waitForDisplayed({ timeout });
      return element;
    } catch (error) {
      throw new Error(`Element not found: ${locator}. Error: ${error.message}`);
    }
  }

  /**
   * Wait for element to be clickable
   * @param {string} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<WebdriverIO.Element>}
   */
  async waitForClickable(locator, timeout = 10000) {
    try {
      const element = await this.driver.$(locator);
      await element.waitForClickable({ timeout });
      return element;
    } catch (error) {
      throw new Error(`Element not clickable: ${locator}. Error: ${error.message}`);
    }
  }

  /**
   * Click element with retry
   * @param {string} locator - Element locator
   * @param {number} retries - Number of retries
   */
  async clickWithRetry(locator, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const element = await this.waitForClickable(locator);
        await element.click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.driver.pause(1000);
      }
    }
  }

  /**
   * Type text with clear
   * @param {string} locator - Element locator
   * @param {string} text - Text to type
   */
  async typeText(locator, text) {
    const element = await this.waitForElement(locator);
    await element.clearValue();
    await element.setValue(text);
  }

  /**
   * Get element text
   * @param {string} locator - Element locator
   * @returns {Promise<string>}
   */
  async getText(locator) {
    const element = await this.waitForElement(locator);
    return await element.getText();
  }

  /**
   * Check if element exists
   * @param {string} locator - Element locator
   * @returns {Promise<boolean>}
   */
  async isElementPresent(locator) {
    try {
      const element = await this.driver.$(locator);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for text to appear
   * @param {string} text - Text to wait for
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForText(text, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const element = await this.driver.$(`//*[contains(@text, "${text}")]`);
        if (await element.isDisplayed()) {
          return true;
        }
      } catch (error) {
        // Continue waiting
      }
      await this.driver.pause(500);
    }
    throw new Error(`Text "${text}" not found within ${timeout}ms`);
  }

  /**
   * Scroll to element
   * @param {string} locator - Element locator
   */
  async scrollToElement(locator) {
    const element = await this.driver.$(locator);
    await element.scrollIntoView();
  }

  /**
   * Swipe in direction
   * @param {string} direction - 'up', 'down', 'left', 'right'
   * @param {number} distance - Swipe distance
   */
  async swipe(direction, distance = 500) {
    const { width, height } = await this.driver.getWindowSize();
    let startX, startY, endX, endY;

    switch (direction.toLowerCase()) {
      case 'up':
        startX = width / 2;
        startY = height * 0.8;
        endX = width / 2;
        endY = height * 0.2;
        break;
      case 'down':
        startX = width / 2;
        startY = height * 0.2;
        endX = width / 2;
        endY = height * 0.8;
        break;
      case 'left':
        startX = width * 0.8;
        startY = height / 2;
        endX = width * 0.2;
        endY = height / 2;
        break;
      case 'right':
        startX = width * 0.2;
        startY = height / 2;
        endX = width * 0.8;
        endY = height / 2;
        break;
      default:
        throw new Error(`Invalid swipe direction: ${direction}`);
    }

    await this.driver.touchAction([
      { action: 'press', x: startX, y: startY },
      { action: 'wait', ms: 100 },
      { action: 'moveTo', x: endX, y: endY },
      { action: 'release' }
    ]);
  }

  /**
   * Take screenshot
   * @param {string} filename - Screenshot filename
   */
  async takeScreenshot(filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = filename ? `${filename}-${timestamp}.png` : `screenshot-${timestamp}.png`;
    await this.driver.saveScreenshot(`./screenshots/${screenshotName}`);
    return screenshotName;
  }

  /**
   * Wait for app to load
   */
  async waitForAppLoad() {
    // Wait for main app elements to appear
    await this.waitForElement('~Learn', 15000);
    await this.driver.pause(2000); // Additional wait for animations
  }

  /**
   * Handle permission dialogs
   */
  async handlePermissions() {
    try {
      // Handle microphone permission
      const micPermission = await this.driver.$('~Allow');
      if (await micPermission.isDisplayed()) {
        await micPermission.click();
        await this.driver.pause(1000);
      }
    } catch (error) {
      // Permission dialog not present or already handled
    }

    try {
      // Handle camera permission
      const cameraPermission = await this.driver.$('~Allow');
      if (await cameraPermission.isDisplayed()) {
        await cameraPermission.click();
        await this.driver.pause(1000);
      }
    } catch (error) {
      // Permission dialog not present or already handled
    }
  }

  /**
   * Navigate to tab
   * @param {string} tabName - Tab name ('Learn', 'Practice', 'Progress', 'Profile')
   */
  async navigateToTab(tabName) {
    const tabLocator = `~${tabName}`;
    await this.clickWithRetry(tabLocator);
    await this.driver.pause(1000); // Wait for navigation
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    // Wait for loading indicators to disappear
    const loadingSelectors = [
      '~Loading...',
      '~Loading',
      '//*[contains(@text, "Loading")]',
      '//*[contains(@text, "Please wait")]'
    ];

    for (const selector of loadingSelectors) {
      try {
        const element = await this.driver.$(selector);
        if (await element.isDisplayed()) {
          await element.waitForDisplayed({ reverse: true, timeout: 10000 });
        }
      } catch (error) {
        // Loading indicator not present, continue
      }
    }
  }

  /**
   * Get current screen name
   * @returns {Promise<string>}
   */
  async getCurrentScreen() {
    try {
      // Try to identify current screen based on visible elements
      const screens = {
        'Login': '~Login',
        'Signup': '~Sign Up',
        'Learn': '~Start English Tutoring',
        'Practice': '~Practice Stages',
        'Progress': '~Progress',
        'Profile': '~Profile'
      };

      for (const [screenName, locator] of Object.entries(screens)) {
        if (await this.isElementPresent(locator)) {
          return screenName;
        }
      }

      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Wait for network request to complete
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForNetworkIdle(timeout = 5000) {
    await this.driver.pause(timeout);
  }

  /**
   * Restart app
   */
  async restartApp() {
    await this.driver.closeApp();
    await this.driver.pause(2000);
    await this.driver.launchApp();
    await this.waitForAppLoad();
  }

  /**
   * Clear app data
   */
  async clearAppData() {
    await this.driver.reset();
    await this.waitForAppLoad();
  }

  /**
   * Get device info
   * @returns {Promise<Object>}
   */
  async getDeviceInfo() {
    const capabilities = await this.driver.getSession();
    return {
      platform: capabilities.platformName,
      version: capabilities.platformVersion,
      device: capabilities.deviceName,
      automation: capabilities.automationName
    };
  }

  /**
   * Log test step
   * @param {string} step - Test step description
   */
  async logStep(step) {
    console.log(`[TEST STEP] ${step}`);
    await this.driver.pause(500); // Small pause for better test flow
  }
}

module.exports = AppUtils;
