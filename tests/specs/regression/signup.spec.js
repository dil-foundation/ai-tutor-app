/**
 * Regression Tests - Signup functionality
 */
const AuthHelper = require('../../helpers/AuthHelper');
const AppHelper = require('../../helpers/AppHelper');
const TestData = require('../../helpers/TestData');

describe('DIL-LMS App - Signup Regression Tests', () => {
    
    before(async () => {
        console.log('🚀 Starting Signup Regression Tests');
        await AppHelper.takeScreenshot('signup_regression_start');
    });

    after(async () => {
        console.log('🏁 Signup Regression Tests completed');
        await AppHelper.takeScreenshot('signup_regression_end');
    });

    beforeEach(async () => {
        // Ensure we start from login screen
        if (await AuthHelper.isLoggedIn()) {
            await AuthHelper.logout();
        }
        await AppHelper.waitForNetworkIdle(2000);
    });

    it('should display signup screen elements', async () => {
        console.log('📝 Testing signup screen elements visibility');
        
        // Navigate to signup screen
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Verify all signup elements are visible
        const expectedElements = TestData.getExpectedElements().signup;
        for (const element of expectedElements) {
            const isVisible = await AppHelper.elementExists(element);
            expect(isVisible).to.be.true;
        }
        
        await AppHelper.takeScreenshot('signup_screen_elements');
    });

    it('should create new account with valid data', async () => {
        console.log('✅ Testing account creation with valid data');
        
        const newUser = TestData.getNewUser();
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Fill signup form
        const signupSuccess = await AuthHelper.signup(newUser);
        expect(signupSuccess).to.be.true;
        
        // Wait for navigation or success message
        await AppHelper.waitForNetworkIdle(5000);
        
        await AppHelper.takeScreenshot('signup_success');
    });

    it('should validate required fields', async () => {
        console.log('📋 Testing required field validation');
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Try to submit empty form
        const createAccountClicked = await AppHelper.safeClick('~create-account-button');
        
        if (createAccountClicked) {
            // Should show validation errors
            await AppHelper.waitForNetworkIdle(2000);
            const isOnSignupScreen = await AppHelper.elementExists('~Create Account');
            expect(isOnSignupScreen).to.be.true;
        }
        
        await AppHelper.takeScreenshot('required_fields_validation');
    });

    it('should validate email format', async () => {
        console.log('📧 Testing email format validation');
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Fill form with invalid email
        await AppHelper.safeInput('~first-name-input', 'Test');
        await AppHelper.safeInput('~last-name-input', 'User');
        await AppHelper.safeInput('~email-input', 'invalid-email-format');
        await AppHelper.safeInput('~password-input', 'ValidPassword123!');
        await AppHelper.safeInput('~confirm-password-input', 'ValidPassword123!');
        
        // Try to submit
        const createAccountClicked = await AppHelper.safeClick('~create-account-button');
        
        if (createAccountClicked) {
            await AppHelper.waitForNetworkIdle(2000);
            const isOnSignupScreen = await AppHelper.elementExists('~Create Account');
            expect(isOnSignupScreen).to.be.true;
        }
        
        await AppHelper.takeScreenshot('email_format_validation');
    });

    it('should validate password strength', async () => {
        console.log('🔒 Testing password strength validation');
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Fill form with weak password
        await AppHelper.safeInput('~first-name-input', 'Test');
        await AppHelper.safeInput('~last-name-input', 'User');
        await AppHelper.safeInput('~email-input', 'test@example.com');
        await AppHelper.safeInput('~password-input', '123');
        await AppHelper.safeInput('~confirm-password-input', '123');
        
        // Try to submit
        const createAccountClicked = await AppHelper.safeClick('~create-account-button');
        
        if (createAccountClicked) {
            await AppHelper.waitForNetworkIdle(2000);
            const isOnSignupScreen = await AppHelper.elementExists('~Create Account');
            expect(isOnSignupScreen).to.be.true;
        }
        
        await AppHelper.takeScreenshot('password_strength_validation');
    });

    it('should validate password confirmation match', async () => {
        console.log('🔐 Testing password confirmation validation');
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Fill form with mismatched passwords
        await AppHelper.safeInput('~first-name-input', 'Test');
        await AppHelper.safeInput('~last-name-input', 'User');
        await AppHelper.safeInput('~email-input', 'test@example.com');
        await AppHelper.safeInput('~password-input', 'ValidPassword123!');
        await AppHelper.safeInput('~confirm-password-input', 'DifferentPassword123!');
        
        // Try to submit
        const createAccountClicked = await AppHelper.safeClick('~create-account-button');
        
        if (createAccountClicked) {
            await AppHelper.waitForNetworkIdle(2000);
            const isOnSignupScreen = await AppHelper.elementExists('~Create Account');
            expect(isOnSignupScreen).to.be.true;
        }
        
        await AppHelper.takeScreenshot('password_confirmation_validation');
    });

    it('should handle existing email', async () => {
        console.log('📧 Testing existing email handling');
        
        const existingUser = TestData.getTestUser();
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Fill form with existing email
        await AppHelper.safeInput('~first-name-input', 'Test');
        await AppHelper.safeInput('~last-name-input', 'User');
        await AppHelper.safeInput('~email-input', existingUser.email);
        await AppHelper.safeInput('~password-input', 'ValidPassword123!');
        await AppHelper.safeInput('~confirm-password-input', 'ValidPassword123!');
        
        // Try to submit
        const createAccountClicked = await AppHelper.safeClick('~create-account-button');
        
        if (createAccountClicked) {
            await AppHelper.waitForNetworkIdle(3000);
            // Should show error or stay on signup screen
            const isOnSignupScreen = await AppHelper.elementExists('~Create Account');
            expect(isOnSignupScreen).to.be.true;
        }
        
        await AppHelper.takeScreenshot('existing_email_handling');
    });

    it('should handle grade selection', async () => {
        console.log('🎓 Testing grade selection');
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Fill basic form
        await AppHelper.safeInput('~first-name-input', 'Test');
        await AppHelper.safeInput('~last-name-input', 'User');
        await AppHelper.safeInput('~email-input', 'test@example.com');
        await AppHelper.safeInput('~password-input', 'ValidPassword123!');
        await AppHelper.safeInput('~confirm-password-input', 'ValidPassword123!');
        
        // Test grade selection
        const gradeDropdownClicked = await AppHelper.safeClick('~grade-dropdown');
        if (gradeDropdownClicked) {
            await AppHelper.waitForNetworkIdle(1000);
            
            // Select a grade
            const gradeSelected = await AppHelper.safeClick('~Grade 10');
            if (gradeSelected) {
                await AppHelper.waitForNetworkIdle(1000);
                await AppHelper.takeScreenshot('grade_selected');
            }
        }
    });

    it('should handle English proficiency input', async () => {
        console.log('🗣️ Testing English proficiency input');
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Fill basic form
        await AppHelper.safeInput('~first-name-input', 'Test');
        await AppHelper.safeInput('~last-name-input', 'User');
        await AppHelper.safeInput('~email-input', 'test@example.com');
        await AppHelper.safeInput('~password-input', 'ValidPassword123!');
        await AppHelper.safeInput('~confirm-password-input', 'ValidPassword123!');
        
        // Test English proficiency input
        const proficiencyText = 'I am learning English and want to improve my speaking skills.';
        const proficiencyEntered = await AppHelper.safeInput('~english-proficiency-input', proficiencyText);
        
        if (proficiencyEntered) {
            await AppHelper.takeScreenshot('proficiency_entered');
        }
    });

    it('should navigate back to login from signup', async () => {
        console.log('⬅️ Testing navigation back to login');
        
        // Navigate to signup
        await AppHelper.waitForElement('~Sign In', 15000);
        await AppHelper.safeClick('~sign-up-link');
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Look for back button or login link
        const backToLogin = await AppHelper.safeClick('~back-to-login') || 
                           await AppHelper.safeClick('~login-link');
        
        if (backToLogin) {
            await AppHelper.waitForElement('~Sign In', 10000);
            const isOnLoginScreen = await AuthHelper.isOnLoginScreen();
            expect(isOnLoginScreen).to.be.true;
        }
        
        await AppHelper.takeScreenshot('back_to_login');
    });
});
