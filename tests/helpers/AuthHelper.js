/**
 * Authentication Helper - Handles login, signup, and auth-related operations
 */
const AppHelper = require('./AppHelper');

class AuthHelper {
    
    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     */
    async login(email, password) {
        console.log('🔐 Attempting login...');
        
        // Wait for login screen to load
        await AppHelper.waitForElement('~Sign In', 15000);
        
        // Enter email
        const emailEntered = await AppHelper.safeInput('~email-input', email);
        if (!emailEntered) {
            throw new Error('Failed to enter email');
        }
        
        // Enter password
        const passwordEntered = await AppHelper.safeInput('~password-input', password);
        if (!passwordEntered) {
            throw new Error('Failed to enter password');
        }
        
        // Click sign in button
        const signInClicked = await AppHelper.safeClick('~sign-in-button');
        if (!signInClicked) {
            throw new Error('Failed to click sign in button');
        }
        
        // Wait for navigation to main app
        const appLoaded = await AppHelper.waitForAppLoad();
        if (!appLoaded) {
            throw new Error('Failed to load main app after login');
        }
        
        console.log('✅ Login successful');
        return true;
    }

    /**
     * Sign up with user details
     * @param {Object} userData - User data object
     */
    async signup(userData) {
        console.log('📝 Attempting signup...');
        
        // Navigate to signup if not already there
        const signupButton = await AppHelper.safeClick('~sign-up-link');
        if (!signupButton) {
            throw new Error('Failed to navigate to signup');
        }
        
        // Wait for signup screen
        await AppHelper.waitForElement('~Create Account', 10000);
        
        // Fill form fields
        await AppHelper.safeInput('~first-name-input', userData.firstName);
        await AppHelper.safeInput('~last-name-input', userData.lastName);
        await AppHelper.safeInput('~email-input', userData.email);
        await AppHelper.safeInput('~password-input', userData.password);
        await AppHelper.safeInput('~confirm-password-input', userData.password);
        
        // Select grade if available
        if (userData.grade) {
            await AppHelper.safeClick('~grade-dropdown');
            await AppHelper.safeClick(`~${userData.grade}`);
        }
        
        // Enter English proficiency
        if (userData.englishProficiency) {
            await AppHelper.safeInput('~english-proficiency-input', userData.englishProficiency);
        }
        
        // Click create account button
        const createAccountClicked = await AppHelper.safeClick('~create-account-button');
        if (!createAccountClicked) {
            throw new Error('Failed to click create account button');
        }
        
        // Handle success message or navigation
        await AppHelper.waitForNetworkIdle(3000);
        
        console.log('✅ Signup completed');
        return true;
    }

    /**
     * Logout from the app
     */
    async logout() {
        console.log('🚪 Attempting logout...');
        
        // Navigate to profile tab
        await AppHelper.navigateToTab('Profile');
        
        // Click sign out button
        const signOutClicked = await AppHelper.safeClick('~sign-out-button');
        if (!signOutClicked) {
            throw new Error('Failed to click sign out button');
        }
        
        // Handle confirmation dialog
        await AppHelper.handleAlert('accept');
        
        // Wait for login screen
        await AppHelper.waitForElement('~Sign In', 10000);
        
        console.log('✅ Logout successful');
        return true;
    }

    /**
     * Check if user is logged in
     */
    async isLoggedIn() {
        try {
            // Check if main app elements are visible
            return await AppHelper.elementExists('~Learn');
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if user is on login screen
     */
    async isOnLoginScreen() {
        try {
            return await AppHelper.elementExists('~Sign In');
        } catch (error) {
            return false;
        }
    }

    /**
     * Handle forgot password flow
     * @param {string} email - User email
     */
    async forgotPassword(email) {
        console.log('🔑 Attempting forgot password...');
        
        // Click forgot password link
        const forgotPasswordClicked = await AppHelper.safeClick('~forgot-password-link');
        if (!forgotPasswordClicked) {
            throw new Error('Failed to click forgot password link');
        }
        
        // This might open external browser or show modal
        // Implementation depends on your app's behavior
        await AppHelper.waitForNetworkIdle(2000);
        
        console.log('✅ Forgot password initiated');
        return true;
    }

    /**
     * Get current user info from profile
     */
    async getCurrentUserInfo() {
        try {
            // Navigate to profile
            await AppHelper.navigateToTab('Profile');
            
            // Extract user information
            const userInfo = {
                name: await AppHelper.getText('~user-name'),
                email: await AppHelper.getText('~user-email'),
                grade: await AppHelper.getText('~user-grade'),
                level: await AppHelper.getText('~user-level')
            };
            
            return userInfo;
        } catch (error) {
            console.log('Failed to get user info:', error.message);
            return null;
        }
    }

    /**
     * Wait for authentication to complete
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForAuthComplete(timeout = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (await this.isLoggedIn()) {
                return true;
            }
            await browser.pause(1000);
        }
        
        return false;
    }

    /**
     * Clear app data (for testing)
     */
    async clearAppData() {
        try {
            // This would typically involve clearing app storage
            // Implementation depends on your testing needs
            console.log('🧹 Clearing app data...');
            await browser.pause(1000);
            return true;
        } catch (error) {
            console.log('Failed to clear app data:', error.message);
            return false;
        }
    }
}

module.exports = new AuthHelper();
