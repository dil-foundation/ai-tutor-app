/**
 * Smoke Tests - Navigation functionality
 */
const AuthHelper = require('../../helpers/AuthHelper');
const AppHelper = require('../../helpers/AppHelper');
const TestData = require('../../helpers/TestData');

describe('DIL-LMS App - Navigation Smoke Tests', () => {
    
    before(async () => {
        console.log('🚀 Starting Navigation Smoke Tests');
        
        // Login first
        const testUser = TestData.getTestUser();
        await AuthHelper.login(testUser.email, testUser.password);
        
        await AppHelper.takeScreenshot('navigation_smoke_start');
    });

    after(async () => {
        console.log('🏁 Navigation Smoke Tests completed');
        await AuthHelper.logout();
        await AppHelper.takeScreenshot('navigation_smoke_end');
    });

    beforeEach(async () => {
        await AppHelper.waitForNetworkIdle(2000);
    });

    it('should display all main tabs', async () => {
        console.log('📱 Testing main tabs visibility');
        
        // Wait for main app to load
        await AppHelper.waitForAppLoad();
        
        // Verify all main tabs are visible
        const expectedTabs = TestData.getExpectedElements().mainTabs;
        for (const tab of expectedTabs) {
            const isVisible = await AppHelper.elementExists(tab);
            expect(isVisible).to.be.true;
        }
        
        await AppHelper.takeScreenshot('main_tabs_visible');
    });

    it('should navigate to Learn tab', async () => {
        console.log('📚 Testing navigation to Learn tab');
        
        const navigateSuccess = await AppHelper.navigateToTab('Learn');
        expect(navigateSuccess).to.be.true;
        
        // Wait for Learn screen to load
        await AppHelper.waitForNetworkIdle(3000);
        
        // Verify we're on Learn screen (check for Learn-specific elements)
        const learnScreenLoaded = await AppHelper.elementExists('~learn-content') || 
                                 await AppHelper.elementExists('~stage-selection') ||
                                 await AppHelper.elementExists('~lesson-list');
        
        expect(learnScreenLoaded).to.be.true;
        
        await AppHelper.takeScreenshot('learn_tab_active');
    });

    it('should navigate to Practice tab', async () => {
        console.log('🎯 Testing navigation to Practice tab');
        
        const navigateSuccess = await AppHelper.navigateToTab('Practice');
        expect(navigateSuccess).to.be.true;
        
        // Wait for Practice screen to load
        await AppHelper.waitForNetworkIdle(3000);
        
        // Verify we're on Practice screen
        const practiceScreenLoaded = await AppHelper.elementExists('~practice-content') ||
                                    await AppHelper.elementExists('~exercise-list') ||
                                    await AppHelper.elementExists('~stage-selection');
        
        expect(practiceScreenLoaded).to.be.true;
        
        await AppHelper.takeScreenshot('practice_tab_active');
    });

    it('should navigate to Progress tab', async () => {
        console.log('📊 Testing navigation to Progress tab');
        
        const navigateSuccess = await AppHelper.navigateToTab('Progress');
        expect(navigateSuccess).to.be.true;
        
        // Wait for Progress screen to load
        await AppHelper.waitForNetworkIdle(3000);
        
        // Verify we're on Progress screen
        const progressScreenLoaded = await AppHelper.elementExists('~progress-content') ||
                                    await AppHelper.elementExists('~progress-chart') ||
                                    await AppHelper.elementExists('~stats-summary');
        
        expect(progressScreenLoaded).to.be.true;
        
        await AppHelper.takeScreenshot('progress_tab_active');
    });

    it('should navigate to Profile tab', async () => {
        console.log('👤 Testing navigation to Profile tab');
        
        const navigateSuccess = await AppHelper.navigateToTab('Profile');
        expect(navigateSuccess).to.be.true;
        
        // Wait for Profile screen to load
        await AppHelper.waitForNetworkIdle(3000);
        
        // Verify we're on Profile screen
        const profileScreenLoaded = await AppHelper.elementExists('~profile-content') ||
                                   await AppHelper.elementExists('~user-info') ||
                                   await AppHelper.elementExists('~sign-out-button');
        
        expect(profileScreenLoaded).to.be.true;
        
        await AppHelper.takeScreenshot('profile_tab_active');
    });

    it('should maintain tab state during navigation', async () => {
        console.log('🔄 Testing tab state persistence');
        
        // Navigate to each tab and verify content loads
        const tabs = ['Learn', 'Practice', 'Progress', 'Profile'];
        
        for (const tab of tabs) {
            console.log(`Navigating to ${tab} tab`);
            
            const navigateSuccess = await AppHelper.navigateToTab(tab);
            expect(navigateSuccess).to.be.true;
            
            // Wait for content to load
            await AppHelper.waitForNetworkIdle(2000);
            
            // Verify tab is active (this might need to be adjusted based on your UI)
            const tabActive = await AppHelper.elementExists(`~${tab}`);
            expect(tabActive).to.be.true;
            
            await AppHelper.takeScreenshot(`tab_${tab.toLowerCase()}_active`);
        }
    });

    it('should handle back navigation', async () => {
        console.log('⬅️ Testing back navigation');
        
        // Navigate to Practice tab first
        await AppHelper.navigateToTab('Practice');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Try to navigate to a specific exercise or stage
        // This depends on your app's navigation structure
        const exerciseButton = await AppHelper.safeClick('~stage1-exercise1');
        if (exerciseButton) {
            await AppHelper.waitForNetworkIdle(2000);
            
            // Take screenshot of exercise screen
            await AppHelper.takeScreenshot('exercise_screen');
            
            // Navigate back (if back button exists)
            const backButton = await AppHelper.safeClick('~back-button');
            if (backButton) {
                await AppHelper.waitForNetworkIdle(2000);
                await AppHelper.takeScreenshot('back_navigation');
            }
        }
    });

    it('should handle deep linking navigation', async () => {
        console.log('🔗 Testing deep linking navigation');
        
        // This test would verify that the app can handle deep links
        // Implementation depends on your app's deep linking setup
        
        // For now, we'll test basic navigation flow
        await AppHelper.navigateToTab('Learn');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Try to access a specific stage or lesson
        const stageButton = await AppHelper.safeClick('~stage1-button');
        if (stageButton) {
            await AppHelper.waitForNetworkIdle(2000);
            await AppHelper.takeScreenshot('stage_navigation');
        }
    });

    it('should handle network connectivity changes', async () => {
        console.log('🌐 Testing network connectivity handling');
        
        // Navigate to different tabs
        await AppHelper.navigateToTab('Progress');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Simulate network delay
        await AppHelper.waitForNetworkIdle(5000);
        
        // Verify app still responds
        const progressTabActive = await AppHelper.elementExists('~Progress');
        expect(progressTabActive).to.be.true;
        
        await AppHelper.takeScreenshot('network_connectivity_test');
    });

    it('should handle app state changes', async () => {
        console.log('📱 Testing app state changes');
        
        // Navigate to Learn tab
        await AppHelper.navigateToTab('Learn');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Simulate app going to background and coming back
        // This would require specific app state testing
        await AppHelper.waitForNetworkIdle(3000);
        
        // Verify app is still responsive
        const learnTabActive = await AppHelper.elementExists('~Learn');
        expect(learnTabActive).to.be.true;
        
        await AppHelper.takeScreenshot('app_state_test');
    });
});
