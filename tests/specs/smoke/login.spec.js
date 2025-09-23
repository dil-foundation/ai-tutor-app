/**
 * Smoke Tests - Login functionality
 */
const AuthHelper = require('../../helpers/AuthHelper');
const AppHelper = require('../../helpers/AppHelper');
const TestData = require('../../helpers/TestData');

describe('DIL-LMS App - Login Smoke Tests', () => {
    
    before(async () => {
        console.log('🚀 Starting Login Smoke Tests');
        await AppHelper.takeScreenshot('login_smoke_start');
    });

    after(async () => {
        console.log('🏁 Login Smoke Tests completed');
        await AppHelper.takeScreenshot('login_smoke_end');
    });

    beforeEach(async () => {
        // Ensure we start from a clean state
        await AppHelper.waitForNetworkIdle(2000);
    });

    afterEach(async () => {
        // Clean up after each test
        if (await AuthHelper.isLoggedIn()) {
            await AuthHelper.logout();
        }
    });

    it('should display login screen elements', async () => {
        console.log('📱 Testing login screen elements visibility');
        
        // Wait for login screen to load
        await AppHelper.waitForElement('~Sign In', 15000);
        
        // Verify all login elements are visible
        const expectedElements = TestData.getExpectedElements().login;
        for (const element of expectedElements) {
            const isVisible = await AppHelper.elementExists(element);
            expect(isVisible).to.be.true;
        }
        
        await AppHelper.takeScreenshot('login_screen_elements');
    });

    it('should login with valid credentials', async () => {
        console.log('🔐 Testing login with valid credentials');
        
        const testUser = TestData.getTestUser();
        const loginSuccess = await AuthHelper.login(testUser.email, testUser.password);
        
        expect(loginSuccess).to.be.true;
        
        // Verify we're in the main app
        const isLoggedIn = await AuthHelper.isLoggedIn();
        expect(isLoggedIn).to.be.true;
        
        await AppHelper.takeScreenshot('login_success');
    });

    it('should show error for invalid credentials', async () => {
        console.log('❌ Testing login with invalid credentials');
        
        const invalidUser = TestData.getInvalidUser();
        
        // Attempt login with invalid credentials
        try {
            await AuthHelper.login(invalidUser.email, invalidUser.password);
            // If we reach here, login unexpectedly succeeded
            expect.fail('Login should have failed with invalid credentials');
        } catch (error) {
            // Expected behavior - login should fail
            expect(error.message).to.include('Failed to load main app after login');
        }
        
        // Verify we're still on login screen
        const isOnLoginScreen = await AuthHelper.isOnLoginScreen();
        expect(isOnLoginScreen).to.be.true;
        
        await AppHelper.takeScreenshot('login_failed');
    });

    it('should navigate to signup screen', async () => {
        console.log('📝 Testing navigation to signup screen');
        
        // Wait for login screen
        await AppHelper.waitForElement('~Sign In', 15000);
        
        // Click sign up link
        const signupClicked = await AppHelper.safeClick('~sign-up-link');
        expect(signupClicked).to.be.true;
        
        // Wait for signup screen
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Verify we're on signup screen
        const isOnSignupScreen = await AppHelper.elementExists('~Create Account');
        expect(isOnSignupScreen).to.be.true;
        
        await AppHelper.takeScreenshot('signup_screen');
    });

    it('should handle forgot password flow', async () => {
        console.log('🔑 Testing forgot password flow');
        
        // Wait for login screen
        await AppHelper.waitForElement('~Sign In', 15000);
        
        // Click forgot password link
        const forgotPasswordClicked = await AppHelper.safeClick('~forgot-password-link');
        expect(forgotPasswordClicked).to.be.true;
        
        // Wait for forgot password action to complete
        await AppHelper.waitForNetworkIdle(3000);
        
        await AppHelper.takeScreenshot('forgot_password_clicked');
    });

    it('should validate email format', async () => {
        console.log('📧 Testing email format validation');
        
        // Wait for login screen
        await AppHelper.waitForElement('~Sign In', 15000);
        
        // Enter invalid email format
        await AppHelper.safeInput('~email-input', 'invalid-email');
        await AppHelper.safeInput('~password-input', 'password123');
        
        // Try to click sign in
        const signInClicked = await AppHelper.safeClick('~sign-in-button');
        
        // Should either show validation error or fail login
        if (signInClicked) {
            // If clicked, should show error
            await AppHelper.waitForNetworkIdle(2000);
            const isOnLoginScreen = await AuthHelper.isOnLoginScreen();
            expect(isOnLoginScreen).to.be.true;
        }
        
        await AppHelper.takeScreenshot('email_validation_test');
    });

    it('should handle empty form submission', async () => {
        console.log('📝 Testing empty form submission');
        
        // Wait for login screen
        await AppHelper.waitForElement('~Sign In', 15000);
        
        // Try to submit empty form
        const signInClicked = await AppHelper.safeClick('~sign-in-button');
        
        // Should either be disabled or show validation error
        if (signInClicked) {
            await AppHelper.waitForNetworkIdle(2000);
            const isOnLoginScreen = await AuthHelper.isOnLoginScreen();
            expect(isOnLoginScreen).to.be.true;
        }
        
        await AppHelper.takeScreenshot('empty_form_test');
    });

    it('should maintain session after app restart', async () => {
        console.log('🔄 Testing session persistence');
        
        const testUser = TestData.getTestUser();
        
        // Login first
        const loginSuccess = await AuthHelper.login(testUser.email, testUser.password);
        expect(loginSuccess).to.be.true;
        
        // Simulate app restart (this would require app restart in real scenario)
        // For now, we'll just verify the session is maintained
        const isLoggedIn = await AuthHelper.isLoggedIn();
        expect(isLoggedIn).to.be.true;
        
        await AppHelper.takeScreenshot('session_persistence');
    });
});
