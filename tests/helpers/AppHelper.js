/**
 * App Helper - Common app interactions and utilities
 */
class AppHelper {
    
    /**
     * Wait for element to be displayed
     * @param {string} selector - Element selector
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForElement(selector, timeout = 10000) {
        try {
            await $(selector).waitForDisplayed({ timeout });
            return true;
        } catch (error) {
            console.log(`Element not found: ${selector}`);
            return false;
        }
    }

    /**
     * Wait for element to be clickable
     * @param {string} selector - Element selector
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForClickable(selector, timeout = 10000) {
        try {
            await $(selector).waitForClickable({ timeout });
            return true;
        } catch (error) {
            console.log(`Element not clickable: ${selector}`);
            return false;
        }
    }

    /**
     * Safe click with wait
     * @param {string} selector - Element selector
     * @param {number} timeout - Timeout in milliseconds
     */
    async safeClick(selector, timeout = 10000) {
        const isClickable = await this.waitForClickable(selector, timeout);
        if (isClickable) {
            await $(selector).click();
            return true;
        }
        return false;
    }

    /**
     * Safe input with clear and type
     * @param {string} selector - Element selector
     * @param {string} text - Text to input
     * @param {number} timeout - Timeout in milliseconds
     */
    async safeInput(selector, text, timeout = 10000) {
        const isDisplayed = await this.waitForElement(selector, timeout);
        if (isDisplayed) {
            await $(selector).clearValue();
            await $(selector).setValue(text);
            return true;
        }
        return false;
    }

    /**
     * Get element text safely
     * @param {string} selector - Element selector
     * @param {number} timeout - Timeout in milliseconds
     */
    async getText(selector, timeout = 10000) {
        const isDisplayed = await this.waitForElement(selector, timeout);
        if (isDisplayed) {
            return await $(selector).getText();
        }
        return null;
    }

    /**
     * Check if element exists
     * @param {string} selector - Element selector
     */
    async elementExists(selector) {
        try {
            return await $(selector).isDisplayed();
        } catch (error) {
            return false;
        }
    }

    /**
     * Take screenshot with timestamp
     * @param {string} name - Screenshot name
     */
    async takeScreenshot(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `./screenshots/${name}_${timestamp}.png`;
        await browser.saveScreenshot(filename);
        console.log(`Screenshot saved: ${filename}`);
        return filename;
    }

    /**
     * Wait for app to load
     */
    async waitForAppLoad() {
        // Wait for main app elements to be visible
        const selectors = [
            '~Learn', // Tab bar
            '~Practice', // Tab bar
            '~Progress', // Tab bar
            '~Profile' // Tab bar
        ];

        for (const selector of selectors) {
            try {
                await $(selector).waitForDisplayed({ timeout: 15000 });
                console.log(`App loaded - found: ${selector}`);
                return true;
            } catch (error) {
                console.log(`App loading - waiting for: ${selector}`);
            }
        }
        return false;
    }

    /**
     * Navigate to tab
     * @param {string} tabName - Tab name (Learn, Practice, Progress, Profile)
     */
    async navigateToTab(tabName) {
        const tabSelector = `~${tabName}`;
        return await this.safeClick(tabSelector);
    }

    /**
     * Handle alerts/dialogs
     * @param {string} action - Action to take (accept, dismiss)
     */
    async handleAlert(action = 'accept') {
        try {
            if (action === 'accept') {
                await browser.acceptAlert();
            } else {
                await browser.dismissAlert();
            }
            return true;
        } catch (error) {
            console.log('No alert to handle');
            return false;
        }
    }

    /**
     * Scroll to element
     * @param {string} selector - Element selector
     * @param {string} direction - Scroll direction (up, down, left, right)
     */
    async scrollToElement(selector, direction = 'down') {
        const maxScrolls = 10;
        let scrolls = 0;

        while (scrolls < maxScrolls) {
            if (await this.elementExists(selector)) {
                return true;
            }

            const { width, height } = await browser.getWindowSize();
            const centerX = width / 2;
            const centerY = height / 2;

            switch (direction) {
                case 'down':
                    await browser.touchAction([
                        { action: 'press', x: centerX, y: centerY + 100 },
                        { action: 'moveTo', x: centerX, y: centerY - 100 },
                        { action: 'release' }
                    ]);
                    break;
                case 'up':
                    await browser.touchAction([
                        { action: 'press', x: centerX, y: centerY - 100 },
                        { action: 'moveTo', x: centerX, y: centerY + 100 },
                        { action: 'release' }
                    ]);
                    break;
            }

            scrolls++;
            await browser.pause(1000);
        }

        return false;
    }

    /**
     * Wait for network requests to complete
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForNetworkIdle(timeout = 5000) {
        await browser.pause(timeout);
    }

    /**
     * Get current screen name
     */
    async getCurrentScreen() {
        try {
            // Try to identify current screen based on visible elements
            if (await this.elementExists('~Learn')) {
                return 'MainTabs';
            }
            if (await this.elementExists('~Sign In')) {
                return 'Login';
            }
            if (await this.elementExists('~Create Account')) {
                return 'Signup';
            }
            return 'Unknown';
        } catch (error) {
            return 'Unknown';
        }
    }
}

module.exports = new AppHelper();
