/**
 * Signup Screen E2E Tests
 * Tests for user registration flow
 */

const AppUtils = require('../../utils/AppUtils');
const TestData = require('../../utils/TestData');

describe('Signup Screen Tests', () => {
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
    await appUtils.logStep('Starting new test - Signup Screen');
    
    // Navigate to signup screen
    await appUtils.restartApp();
    await appUtils.handlePermissions();
    
    // Wait for login screen and navigate to signup
    await appUtils.waitForElement('~Login', testData.getTestTimeout('long'));
    await appUtils.clickWithRetry('~Sign Up');
    
    // Wait for signup screen to load
    await appUtils.waitForElement('~Sign Up', testData.getTestTimeout('medium'));
  });

  afterEach(async () => {
    await appUtils.logStep('Test completed - Signup Screen');
  });

  describe('Signup Screen UI Elements', () => {
    it('should display all required signup screen elements', async () => {
      await appUtils.logStep('Verifying signup screen UI elements');

      // Check for first name input field
      expect(await appUtils.isElementPresent('~First Name')).to.be.true;
      
      // Check for last name input field
      expect(await appUtils.isElementPresent('~Last Name')).to.be.true;
      
      // Check for email input field
      expect(await appUtils.isElementPresent('~Email')).to.be.true;
      
      // Check for grade selection
      expect(await appUtils.isElementPresent('~Grade')).to.be.true;
      
      // Check for password input field
      expect(await appUtils.isElementPresent('~Password')).to.be.true;
      
      // Check for confirm password input field
      expect(await appUtils.isElementPresent('~Confirm Password')).to.be.true;
      
      // Check for signup button
      expect(await appUtils.isElementPresent('~Sign Up')).to.be.true;
      
      // Check for login link
      expect(await appUtils.isElementPresent('~Login')).to.be.true;
    });

    it('should display app branding and welcome message', async () => {
      await appUtils.logStep('Verifying app branding elements');

      // Check for app logo or title
      expect(await appUtils.isElementPresent('~DIL Tutor')).to.be.true;
      
      // Check for welcome message
      expect(await appUtils.isElementPresent('~Create Account')).to.be.true;
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty first name', async () => {
      await appUtils.logStep('Testing empty first name validation');

      // Click signup button without entering first name
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for validation error
      await appUtils.waitForText('Please enter your first name', testData.getTestTimeout('short'));
    });

    it('should show validation error for empty last name', async () => {
      await appUtils.logStep('Testing empty last name validation');

      const testUser = testData.getTestUser('student');
      
      // Enter first name only
      await appUtils.typeText('~First Name', testUser.firstName);
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for validation error
      await appUtils.waitForText('Please enter your last name', testData.getTestTimeout('short'));
    });

    it('should show validation error for empty email', async () => {
      await appUtils.logStep('Testing empty email validation');

      const testUser = testData.getTestUser('student');
      
      // Enter name fields only
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for validation error
      await appUtils.waitForText('Please enter your email', testData.getTestTimeout('short'));
    });

    it('should show validation error for invalid email format', async () => {
      await appUtils.logStep('Testing invalid email format validation');

      const testUser = testData.getTestUser('student');
      
      // Enter invalid email
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', 'invalid-email');
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.typeText('~Confirm Password', testUser.password);
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for validation error
      await appUtils.waitForText('Please enter a valid email', testData.getTestTimeout('short'));
    });

    it('should show validation error for empty password', async () => {
      await appUtils.logStep('Testing empty password validation');

      const testUser = testData.getTestUser('student');
      
      // Enter all fields except password
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', testUser.email);
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for validation error
      await appUtils.waitForText('Please enter your password', testData.getTestTimeout('short'));
    });

    it('should show validation error for short password', async () => {
      await appUtils.logStep('Testing short password validation');

      const testUser = testData.getTestUser('student');
      
      // Enter all fields with short password
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', '123');
      await appUtils.typeText('~Confirm Password', '123');
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for validation error
      await appUtils.waitForText('Password must be at least 6 characters', testData.getTestTimeout('short'));
    });

    it('should show validation error for password mismatch', async () => {
      await appUtils.logStep('Testing password mismatch validation');

      const testUser = testData.getTestUser('student');
      
      // Enter all fields with mismatched passwords
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.typeText('~Confirm Password', 'DifferentPassword123!');
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for validation error
      await appUtils.waitForText('Passwords do not match', testData.getTestTimeout('short'));
    });

    it('should show validation error for weak password', async () => {
      await appUtils.logStep('Testing weak password validation');

      const testUser = testData.getTestUser('student');
      
      // Enter all fields with weak password
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', testUser.email);
      await appUtils.typeText('~Password', 'password');
      await appUtils.typeText('~Confirm Password', 'password');
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for validation error
      await appUtils.waitForText('Password must contain at least one uppercase letter, one lowercase letter, and one number', testData.getTestTimeout('short'));
    });
  });

  describe('Grade Selection', () => {
    it('should allow grade selection', async () => {
      await appUtils.logStep('Testing grade selection');

      // Click grade dropdown
      await appUtils.clickWithRetry('~Grade');
      
      // Wait for grade options to appear
      await appUtils.waitForElement('~Grade 10', testData.getTestTimeout('short'));
      
      // Select a grade
      await appUtils.clickWithRetry('~Grade 10');
      
      // Verify grade is selected
      const gradeField = await appUtils.waitForElement('~Grade');
      const selectedGrade = await gradeField.getText();
      expect(selectedGrade).to.include('Grade 10');
    });

    it('should show all available grade options', async () => {
      await appUtils.logStep('Testing grade options display');

      // Click grade dropdown
      await appUtils.clickWithRetry('~Grade');
      
      // Check for various grade options
      const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
                     'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
      
      for (const grade of grades) {
        expect(await appUtils.isElementPresent(`~${grade}`)).to.be.true;
      }
    });
  });

  describe('Successful Signup', () => {
    it('should signup successfully with valid data', async () => {
      await appUtils.logStep('Testing successful signup');

      const testUser = testData.getTestUser('student');
      const randomEmail = testData.generateRandomData('email');
      
      // Enter all valid data
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', randomEmail);
      
      // Select grade
      await appUtils.clickWithRetry('~Grade');
      await appUtils.waitForElement('~Grade 10', testData.getTestTimeout('short'));
      await appUtils.clickWithRetry('~Grade 10');
      
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.typeText('~Confirm Password', testUser.password);
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Wait for success message
      await appUtils.waitForText('Please check your email for verification', testData.getTestTimeout('long'));
      
      // Should navigate back to login screen
      await appUtils.waitForElement('~Login', testData.getTestTimeout('medium'));
    });

    it('should show loading state during signup', async () => {
      await appUtils.logStep('Testing signup loading state');

      const testUser = testData.getTestUser('student');
      const randomEmail = testData.generateRandomData('email');
      
      // Enter all valid data
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', randomEmail);
      
      // Select grade
      await appUtils.clickWithRetry('~Grade');
      await appUtils.waitForElement('~Grade 10', testData.getTestTimeout('short'));
      await appUtils.clickWithRetry('~Grade 10');
      
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.typeText('~Confirm Password', testUser.password);
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Check for loading indicator
      expect(await appUtils.isElementPresent('~Loading')).to.be.true;
      
      // Wait for loading to complete
      await appUtils.waitForLoadingComplete();
    });
  });

  describe('Failed Signup', () => {
    it('should show error for existing email', async () => {
      await appUtils.logStep('Testing existing email error');

      const testUser = testData.getTestUser('student');
      
      // Enter existing email
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', testUser.email);
      
      // Select grade
      await appUtils.clickWithRetry('~Grade');
      await appUtils.waitForElement('~Grade 10', testData.getTestTimeout('short'));
      await appUtils.clickWithRetry('~Grade 10');
      
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.typeText('~Confirm Password', testUser.password);
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Wait for error message
      await appUtils.waitForText('Email already exists', testData.getTestTimeout('medium'));
      
      // Verify we're still on signup screen
      expect(await appUtils.isElementPresent('~Sign Up')).to.be.true;
    });

    it('should show error for network issues', async () => {
      await appUtils.logStep('Testing network error handling');

      const testUser = testData.getTestUser('student');
      const randomEmail = testData.generateRandomData('email');
      
      // Enter all valid data
      await appUtils.typeText('~First Name', testUser.firstName);
      await appUtils.typeText('~Last Name', testUser.lastName);
      await appUtils.typeText('~Email', randomEmail);
      
      // Select grade
      await appUtils.clickWithRetry('~Grade');
      await appUtils.waitForElement('~Grade 10', testData.getTestTimeout('short'));
      await appUtils.clickWithRetry('~Grade 10');
      
      await appUtils.typeText('~Password', testUser.password);
      await appUtils.typeText('~Confirm Password', testUser.password);
      
      // Disable network (simulate network error)
      await driver.setNetworkConnection(0);
      
      // Click signup button
      await appUtils.clickWithRetry('~Sign Up');
      
      // Wait for network error message
      await appUtils.waitForText('Network error', testData.getTestTimeout('medium'));
      
      // Re-enable network
      await driver.setNetworkConnection(6);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to login screen', async () => {
      await appUtils.logStep('Testing navigation back to login screen');

      // Click login link
      await appUtils.clickWithRetry('~Login');
      
      // Should navigate to login screen
      await appUtils.waitForElement('~Login', testData.getTestTimeout('medium'));
      expect(await appUtils.isElementPresent('~Email')).to.be.true;
      expect(await appUtils.isElementPresent('~Password')).to.be.true;
    });
  });

  describe('Password Visibility', () => {
    it('should toggle password visibility for password field', async () => {
      await appUtils.logStep('Testing password visibility toggle for password field');

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

    it('should toggle password visibility for confirm password field', async () => {
      await appUtils.logStep('Testing password visibility toggle for confirm password field');

      const testUser = testData.getTestUser('student');
      
      // Enter confirm password
      await appUtils.typeText('~Confirm Password', testUser.password);
      
      // Check if password is hidden by default
      const confirmPasswordField = await appUtils.waitForElement('~Confirm Password');
      const isPasswordHidden = await confirmPasswordField.getAttribute('password');
      expect(isPasswordHidden).to.be.true;
      
      // Click confirm password visibility toggle
      await appUtils.clickWithRetry('~Confirm Password Visibility Toggle');
      
      // Check if password is now visible
      const isPasswordVisible = await confirmPasswordField.getAttribute('password');
      expect(isPasswordVisible).to.be.false;
    });
  });

  describe('Keyboard Handling', () => {
    it('should handle keyboard interactions properly', async () => {
      await appUtils.logStep('Testing keyboard interactions');

      const testUser = testData.getTestUser('student');
      const randomEmail = testData.generateRandomData('email');
      
      // Focus on first name field
      await appUtils.clickWithRetry('~First Name');
      
      // Type first name
      await appUtils.typeText('~First Name', testUser.firstName);
      
      // Move to last name field
      await appUtils.clickWithRetry('~Last Name');
      
      // Type last name
      await appUtils.typeText('~Last Name', testUser.lastName);
      
      // Move to email field
      await appUtils.clickWithRetry('~Email');
      
      // Type email
      await appUtils.typeText('~Email', randomEmail);
      
      // Move to password field
      await appUtils.clickWithRetry('~Password');
      
      // Type password
      await appUtils.typeText('~Password', testUser.password);
      
      // Move to confirm password field
      await appUtils.clickWithRetry('~Confirm Password');
      
      // Type confirm password
      await appUtils.typeText('~Confirm Password', testUser.password);
      
      // Submit form
      await appUtils.clickWithRetry('~Sign Up');
      
      // Should proceed with signup
      await appUtils.waitForText('Please check your email for verification', testData.getTestTimeout('long'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await appUtils.logStep('Testing accessibility labels');

      // Check first name field accessibility
      const firstNameField = await appUtils.waitForElement('~First Name');
      const firstNameLabel = await firstNameField.getAttribute('label');
      expect(firstNameLabel).to.include('first name');
      
      // Check last name field accessibility
      const lastNameField = await appUtils.waitForElement('~Last Name');
      const lastNameLabel = await lastNameField.getAttribute('label');
      expect(lastNameLabel).to.include('last name');
      
      // Check email field accessibility
      const emailField = await appUtils.waitForElement('~Email');
      const emailLabel = await emailField.getAttribute('label');
      expect(emailLabel).to.include('email');
      
      // Check password field accessibility
      const passwordField = await appUtils.waitForElement('~Password');
      const passwordLabel = await passwordField.getAttribute('label');
      expect(passwordLabel).to.include('password');
      
      // Check signup button accessibility
      const signupButton = await appUtils.waitForElement('~Sign Up');
      const signupLabel = await signupButton.getAttribute('label');
      expect(signupLabel).to.include('sign up');
    });
  });
});
