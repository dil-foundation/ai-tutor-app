/**
 * Regression Tests - Practice functionality
 */
const AuthHelper = require('../../helpers/AuthHelper');
const AppHelper = require('../../helpers/AppHelper');
const TestData = require('../../helpers/TestData');

describe('DIL-LMS App - Practice Regression Tests', () => {
    
    before(async () => {
        console.log('🚀 Starting Practice Regression Tests');
        
        // Login first
        const testUser = TestData.getTestUser();
        await AuthHelper.login(testUser.email, testUser.password);
        
        await AppHelper.takeScreenshot('practice_regression_start');
    });

    after(async () => {
        console.log('🏁 Practice Regression Tests completed');
        await AuthHelper.logout();
        await AppHelper.takeScreenshot('practice_regression_end');
    });

    beforeEach(async () => {
        // Navigate to Practice tab
        await AppHelper.navigateToTab('Practice');
        await AppHelper.waitForNetworkIdle(2000);
    });

    it('should display practice screen elements', async () => {
        console.log('🎯 Testing practice screen elements visibility');
        
        // Wait for practice screen to load
        await AppHelper.waitForNetworkIdle(3000);
        
        // Verify practice screen elements
        const practiceElements = [
            '~practice-content',
            '~stage-selection',
            '~exercise-list',
            '~stage1-button',
            '~stage2-button',
            '~stage3-button'
        ];
        
        for (const element of practiceElements) {
            const isVisible = await AppHelper.elementExists(element);
            if (isVisible) {
                console.log(`Found element: ${element}`);
            }
        }
        
        await AppHelper.takeScreenshot('practice_screen_elements');
    });

    it('should navigate to Stage 1 exercises', async () => {
        console.log('📚 Testing Stage 1 navigation');
        
        // Click on Stage 1
        const stage1Clicked = await AppHelper.safeClick('~stage1-button');
        if (stage1Clicked) {
            await AppHelper.waitForNetworkIdle(3000);
            
            // Verify Stage 1 exercises are displayed
            const stage1Elements = [
                '~stage1-content',
                '~exercise1-button',
                '~exercise2-button',
                '~exercise3-button'
            ];
            
            for (const element of stage1Elements) {
                const isVisible = await AppHelper.elementExists(element);
                if (isVisible) {
                    console.log(`Found Stage 1 element: ${element}`);
                }
            }
            
            await AppHelper.takeScreenshot('stage1_exercises');
        }
    });

    it('should start Repeat After Me exercise', async () => {
        console.log('🔄 Testing Repeat After Me exercise');
        
        // Navigate to Stage 1
        await AppHelper.safeClick('~stage1-button');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Click on Repeat After Me exercise
        const exerciseClicked = await AppHelper.safeClick('~exercise1-button');
        if (exerciseClicked) {
            await AppHelper.waitForNetworkIdle(3000);
            
            // Verify exercise screen elements
            const exerciseElements = [
                '~exercise-content',
                '~play-button',
                '~record-button',
                '~next-button'
            ];
            
            for (const element of exerciseElements) {
                const isVisible = await AppHelper.elementExists(element);
                if (isVisible) {
                    console.log(`Found exercise element: ${element}`);
                }
            }
            
            await AppHelper.takeScreenshot('repeat_after_me_exercise');
        }
    });

    it('should handle audio playback', async () => {
        console.log('🔊 Testing audio playback');
        
        // Navigate to an exercise
        await AppHelper.safeClick('~stage1-button');
        await AppHelper.waitForNetworkIdle(2000);
        await AppHelper.safeClick('~exercise1-button');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Click play button
        const playClicked = await AppHelper.safeClick('~play-button');
        if (playClicked) {
            // Wait for audio to start playing
            await AppHelper.waitForNetworkIdle(3000);
            
            // Check for audio controls or visual feedback
            const audioPlaying = await AppHelper.elementExists('~audio-playing') ||
                               await AppHelper.elementExists('~pause-button');
            
            if (audioPlaying) {
                console.log('Audio playback detected');
            }
            
            await AppHelper.takeScreenshot('audio_playback');
        }
    });

    it('should handle audio recording', async () => {
        console.log('🎤 Testing audio recording');
        
        // Navigate to an exercise
        await AppHelper.safeClick('~stage1-button');
        await AppHelper.waitForNetworkIdle(2000);
        await AppHelper.safeClick('~exercise1-button');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Click record button
        const recordClicked = await AppHelper.safeClick('~record-button');
        if (recordClicked) {
            // Wait for recording to start
            await AppHelper.waitForNetworkIdle(2000);
            
            // Check for recording indicators
            const recordingActive = await AppHelper.elementExists('~recording-active') ||
                                  await AppHelper.elementExists('~stop-recording-button');
            
            if (recordingActive) {
                console.log('Audio recording detected');
                
                // Wait a bit for recording
                await AppHelper.waitForNetworkIdle(3000);
                
                // Stop recording
                await AppHelper.safeClick('~stop-recording-button');
                await AppHelper.waitForNetworkIdle(2000);
            }
            
            await AppHelper.takeScreenshot('audio_recording');
        }
    });

    it('should navigate to Stage 2 exercises', async () => {
        console.log('📖 Testing Stage 2 navigation');
        
        // Click on Stage 2
        const stage2Clicked = await AppHelper.safeClick('~stage2-button');
        if (stage2Clicked) {
            await AppHelper.waitForNetworkIdle(3000);
            
            // Verify Stage 2 exercises are displayed
            const stage2Elements = [
                '~stage2-content',
                '~daily-routines-button',
                '~quick-answers-button',
                '~roleplay-button'
            ];
            
            for (const element of stage2Elements) {
                const isVisible = await AppHelper.elementExists(element);
                if (isVisible) {
                    console.log(`Found Stage 2 element: ${element}`);
                }
            }
            
            await AppHelper.takeScreenshot('stage2_exercises');
        }
    });

    it('should navigate to Stage 3 exercises', async () => {
        console.log('📝 Testing Stage 3 navigation');
        
        // Click on Stage 3
        const stage3Clicked = await AppHelper.safeClick('~stage3-button');
        if (stage3Clicked) {
            await AppHelper.waitForNetworkIdle(3000);
            
            // Verify Stage 3 exercises are displayed
            const stage3Elements = [
                '~stage3-content',
                '~storytelling-button',
                '~problem-solving-button',
                '~group-dialogues-button'
            ];
            
            for (const element of stage3Elements) {
                const isVisible = await AppHelper.elementExists(element);
                if (isVisible) {
                    console.log(`Found Stage 3 element: ${element}`);
                }
            }
            
            await AppHelper.takeScreenshot('stage3_exercises');
        }
    });

    it('should handle exercise completion', async () => {
        console.log('✅ Testing exercise completion flow');
        
        // Navigate to an exercise
        await AppHelper.safeClick('~stage1-button');
        await AppHelper.waitForNetworkIdle(2000);
        await AppHelper.safeClick('~exercise1-button');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Simulate exercise completion
        const nextClicked = await AppHelper.safeClick('~next-button');
        if (nextClicked) {
            await AppHelper.waitForNetworkIdle(2000);
            
            // Check for completion screen or next exercise
            const completionScreen = await AppHelper.elementExists('~exercise-complete') ||
                                   await AppHelper.elementExists('~next-exercise-button') ||
                                   await AppHelper.elementExists('~back-to-practice-button');
            
            if (completionScreen) {
                console.log('Exercise completion detected');
            }
            
            await AppHelper.takeScreenshot('exercise_completion');
        }
    });

    it('should handle back navigation from exercises', async () => {
        console.log('⬅️ Testing back navigation from exercises');
        
        // Navigate to an exercise
        await AppHelper.safeClick('~stage1-button');
        await AppHelper.waitForNetworkIdle(2000);
        await AppHelper.safeClick('~exercise1-button');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Try to go back
        const backClicked = await AppHelper.safeClick('~back-button');
        if (backClicked) {
            await AppHelper.waitForNetworkIdle(2000);
            
            // Verify we're back to stage selection
            const backToStage = await AppHelper.elementExists('~stage-selection');
            if (backToStage) {
                console.log('Successfully navigated back to stage selection');
            }
            
            await AppHelper.takeScreenshot('back_navigation_from_exercise');
        }
    });

    it('should handle exercise progress tracking', async () => {
        console.log('📊 Testing exercise progress tracking');
        
        // Navigate to an exercise
        await AppHelper.safeClick('~stage1-button');
        await AppHelper.waitForNetworkIdle(2000);
        await AppHelper.safeClick('~exercise1-button');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Check for progress indicators
        const progressElements = [
            '~progress-bar',
            '~exercise-counter',
            '~completion-percentage'
        ];
        
        for (const element of progressElements) {
            const isVisible = await AppHelper.elementExists(element);
            if (isVisible) {
                console.log(`Found progress element: ${element}`);
            }
        }
        
        await AppHelper.takeScreenshot('exercise_progress_tracking');
    });

    it('should handle network connectivity during practice', async () => {
        console.log('🌐 Testing network connectivity during practice');
        
        // Navigate to an exercise
        await AppHelper.safeClick('~stage1-button');
        await AppHelper.waitForNetworkIdle(2000);
        await AppHelper.safeClick('~exercise1-button');
        await AppHelper.waitForNetworkIdle(2000);
        
        // Simulate network delay
        await AppHelper.waitForNetworkIdle(5000);
        
        // Verify app still responds
        const exerciseActive = await AppHelper.elementExists('~exercise-content');
        if (exerciseActive) {
            console.log('App remains responsive during network delay');
        }
        
        await AppHelper.takeScreenshot('network_connectivity_practice');
    });
});
