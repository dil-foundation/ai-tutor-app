/**
 * Login Screen E2E Tests
 * Tests for user authentication flow
 */

const AppUtils = require('../../utils/AppUtils');
const TestData = require('../../utils/TestData');

describe('Login Screen Tests', () => {
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
    await appUtils.logStep('Starting new test - Login Screen');
    
    // Ensure we're on login screen
    await appUtils.restartApp();
    await appUtils.handlePermissions();
    
    // Wait for login screen to load
    await appUtils.waitForElement('~Login', testData.getTestTimeout('long'));
  });

  afterEach(async () => {
    await appUtils.logStep('Test completed - Login Screen');
  });

  describe('Login Screen UI Elements', () => {
    it('should display all required login screen elements', async () => {
      await appUtils.logStep('Verifying login screen UI elements');

      // Check for email input field
      expect(await appUtils.isElementPresent('~Email')).to.be.true;
      
      // Check for password input field
      expect(await appUtils.isElementPresent('~Password')).to.be.true;
      
      // Check for login button
      expect(await appUtils.isElementPresent('~Login')).to.be.true;
      
      // Check for sign up link
      expect(await appUtils.isElementPresent('~Sign Up')).to.be.true;
      
      // Check for forgot password link
      expect(await appUtils.isElementPresent('~Forgot Password')).to.be.true;
    });

    it('should display app branding and welcome message', async () => {
      await appUtils.logStep('Verifying app branding elements');

      // Check for app logo or title
      expect(await appUtils.isElementPresent('~DIL Tutor')).to.be.true;
      
      // Check for welcome message
      expect(await appUtils.isElementPresent('~Welcome')).to.be.true;
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty email', async () => {
      await appUtils.logStep('Testing empty email validation');

      // Click login button without entering email
      await appUtils.clickWithRetry('~Login');
      
      // Check for validation error
      await appUtils.waitForText('Please enter your email', testData.getTestTimeout('short'));
    });

    it('should show validation error for empty password', async () => {
      await appUtils.logStep('Testing empty password validation');

      const testUser = testData.getTestUser('student');
      
      // Enter email only
      await appUtils.typeText('~Email', testUser.email);
      
      // Click login button
      await appUtils.clickWithRetry('~Login');
      
      // Check for validation error
      await appUtils.waitForText('Please enter your password', testData.getTestTimeout('short'));
    });

    it('should show validation error for invalid email format', async () => {
      await appUtils.logStep('Testing invalid email format validation');

      // Enter invalid email
      await appUtils.typeText('~Email', 'invalid-email');
      await appUtils.typeText('~Password', 'password123');
      
      // Click login button
      await appUtils.clickWithRetry('~Login');
      
      // Check for validation error
      await appUtils.waitForText('Please enter a valid email', testData.getTestTimeout('short'));
    });

    it('should show validation error for short password', async () => {
      await appUtils.logStep('Testing short password validation');

      const testUser = testData.getTestUser('student');
      
      // Enter valid email and short password
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', '123');
      
      // Click login button
      await appUtils.clickWithRetry('~Login');
      
      // Check for validation error
      await appUtils.waitForText('Password must be at least 6 characters', testData.getTestTimeout('short'));
    });
  });

  describe('Successful Login', () => {
    it('should login successfully with valid student credentials', async () => {
      await appUtils.logStep('Testing successful student login');

      const testUser = testData.getTestUser('student');
      
      // Enter valid credentials
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', testUser.password);
      
      // Click login button
      await appUtils.clickWithRetry('~Login');
      
      // Wait for successful login and navigation to main app
      await appUtils.waitForElement('~Learn', testData.getTestTimeout('long'));
      
      // Verify we're on the main app (Learn tab should be visible)
      expect(await appUtils.isElementPresent('~Learn')).to.be.true;
      expect(await appUtils.isElementPresent('~Practice')).to.be.true;
      expect(await appUtils.isElementPresent('~Progress')).to.be.true;
      expect(await appUtils.isElementPresent('~Profile')).to.be.true;
    });

    it('should show loading state during login', async () => {
      await appUtils.logStep('Testing login loading state');

      const testUser = testData.getTestUser('student');
      
      // Enter valid credentials
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', testUser.password);
      
      // Click login button
      await appUtils.clickWithRetry('~Login');
      
      // Check for loading indicator
      expect(await appUtils.isElementPresent('~Loading')).to.be.true;
      
      // Wait for loading to complete
      await appUtils.waitForLoadingComplete();
    });
  });

  describe('Failed Login', () => {
    it('should show error for invalid credentials', async () => {
      await appUtils.logStep('Testing invalid credentials error');

      const invalidUser = testData.getTestUser('invalid');
      
      // Enter invalid credentials
      await appUtils.typeText('~Email', invalidUser.email);
      await appUtils.typeText('~Password', invalidUser.password);
      
      // Click login button
      await appUtils.clickWithRetry('~Login');
      
      // Wait for error message
      await appUtils.waitForText('Invalid email or password', testData.getTestTimeout('medium'));
      
      // Verify we're still on login screen
      expect(await appUtils.isElementPresent('~Login')).to.be.true;
    });

    it('should show error for network issues', async () => {
      await appUtils.logStep('Testing network error handling');

      const testUser = testData.getTestUser('student');
      
      // Enter valid credentials
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', testUser.password);
      
      // Disable network (simulate network error)
      await driver.setNetworkConnection(0);
      
      // Click login button
      await appUtils.clickWithRetry('~Login');
      
      // Wait for network error message
      await appUtils.waitForText('Network error', testData.getTestTimeout('medium'));
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow access for student users', async () => {
      await appUtils.logStep('Testing student access');

      const testUser = testData.getTestUser('student');
      
      // Login as student
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.clickWithRetry('~Login');
      
      // Should navigate to main app
      await appUtils.waitForElement('~Learn', testData.getTestTimeout('long'));
      expect(await appUtils.isElementPresent('~Learn')).to.be.true;
    });

    it('should deny access for teacher users', async () => {
      await appUtils.logStep('Testing teacher access restriction');

      const testUser = testData.getTestUser('teacher');
      
      // Login as teacher
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.clickWithRetry('~Login');
      
      // Should show access restricted message
      await appUtils.waitForText('Access Restricted', testData.getTestTimeout('medium'));
      await appUtils.waitForText('Only students can access this mobile app', testData.getTestTimeout('short'));
      
      // Should be signed out and returned to login screen
      await appUtils.waitForElement('~Login', testData.getTestTimeout('medium'));
    });

    it('should deny access for admin users', async () => {
      await appUtils.logStep('Testing admin access restriction');

      const testUser = testData.getTestUser('admin');
      
      // Login as admin
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.clickWithRetry('~Login');
      
      // Should show access restricted message
      await appUtils.waitForText('Access Restricted', testData.getTestTimeout('medium'));
      await appUtils.waitForText('Only students can access this mobile app', testData.getTestTimeout('short'));
      
      // Should be signed out and returned to login screen
      await appUtils.waitForElement('~Login', testData.getTestTimeout('medium'));
    });
  });

  describe('Navigation', () => {
    it('should navigate to signup screen', async () => {
      await appUtils.logStep('Testing navigation to signup screen');

      // Click sign up link
      await appUtils.clickWithRetry('~Sign Up');
      
      // Should navigate to signup screen
      await appUtils.waitForElement('~Sign Up', testData.getTestTimeout('medium'));
      expect(await appUtils.isElementPresent('~First Name')).to.be.true;
      expect(await appUtils.isElementPresent('~Last Name')).to.be.true;
      expect(await appUtils.isElementPresent('~Email')).to.be.true;
    });

    it('should navigate to forgot password screen', async () => {
      await appUtils.logStep('Testing navigation to forgot password screen');

      // Click forgot password link
      await appUtils.clickWithRetry('~Forgot Password');
      
      // Should navigate to forgot password screen or open web browser
      await appUtils.driver.pause(2000);
      
      // Check if web browser opened or if we're on forgot password screen
      const currentScreen = await appUtils.getCurrentScreen();
      expect(['Forgot Password', 'Web Browser']).to.include(currentScreen);
    });
  });

  describe('Password Visibility', () => {
    it('should toggle password visibility', async () => {
      await appUtils.logStep('Testing password visibility toggle');

      const testUser = testData.getTestUser('student');
      
      // Enter password
      await appUtils.typeText('~Password', testUser.password);
      
      // Check if password is hidden by default
      const passwordField = await appUtils.waitForElement('~Password');
      const isPasswordHidden = await passwordField.getAttribute('password');
      expect(isPasswordHidden).to.be.true;
      
      // Click password visibility toggle
      await appUtils.clickWithRetry('~Password Visibility Toggle');
      
      // Check if password is now visible
      const isPasswordVisible = await passwordField.getAttribute('password');
      expect(isPasswordVisible).to.be.false;
    });
  });

  describe('Keyboard Handling', () => {
    it('should handle keyboard interactions properly', async () => {
      await appUtils.logStep('Testing keyboard interactions');

      const testUser = testData.getTestUser('student');
      
      // Focus on email field
      await appUtils.clickWithRetry('~Email');
      
      // Type email
      await appUtils.typeText('~Email', testUser.email);
      
      // Move to password field (Tab or Next button)
      await appUtils.clickWithRetry('~Password');
      
      // Type password
      await appUtils.typeText('~Password', testUser.password);
      
      // Submit form (Enter key or Login button)
      await appUtils.clickWithRetry('~Login');
      
      // Should proceed with login
      await appUtils.waitForElement('~Learn', testData.getTestTimeout('long'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await appUtils.logStep('Testing accessibility labels');

      // Check email field accessibility
      const emailField = await appUtils.waitForElement('~Email');
      const emailLabel = await emailField.getAttribute('label');
      expect(emailLabel).to.include('email');
      
      // Check password field accessibility
      const passwordField = await appUtils.waitForElement('~Password');
      const passwordLabel = await passwordField.getAttribute('label');
      expect(passwordLabel).to.include('password');
      
      // Check login button accessibility
      const loginButton = await appUtils.waitForElement('~Login');
      const loginLabel = await loginButton.getAttribute('label');
      expect(loginLabel).to.include('login');
    });
  });
});
