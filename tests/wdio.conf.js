const { config } = require('@wdio/cli');
const path = require('path');
require('dotenv').config();

exports.config = {
    runner: 'local',
    specs: [
        './specs/**/*.js'
    ],
    exclude: [
        // 'path/to/excluded/files'
    ],
    suites: {
        smoke: [
            './specs/smoke/**/*.js'
        ],
        regression: [
            './specs/regression/**/*.js'
        ],
        all: [
            './specs/**/*.js'
        ]
    },
    maxInstances: 1,
    capabilities: [{
        'browserstack.user': process.env.BROWSERSTACK_USERNAME,
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
        'browserstack.build': process.env.BROWSERSTACK_BUILD_NAME,
        'browserstack.debug': 'true',
        'browserstack.console': 'info',
        'browserstack.networkLogs': 'true',
        'browserstack.appiumLogs': 'true',
        'browserstack.deviceLogs': 'true',
        
        // App configuration
        'app': process.env.BROWSERSTACK_ANDROID_APP_ID,
        'platformName': 'Android',
        'deviceName': 'Google Pixel 4',
        'platformVersion': '10.0',
        'automationName': 'UiAutomator2',
        
        // Test configuration
        'browserstack.timezone': 'UTC',
        'browserstack.geoLocation': 'IN',
        'browserstack.local': false,
        'browserstack.idleTimeout': 300,
        'browserstack.appiumVersion': '2.0.0',
        
        // Additional debugging capabilities
        'autoGrantPermissions': true,
        'noReset': false,
        'fullReset': false,
        'skipDeviceInitialization': false,
        'skipServerInstallation': false,
        
        // Custom capabilities
        'browserstack.customData': {
            'testEnvironment': process.env.TEST_ENVIRONMENT,
            'testSuite': 'regression'
        }
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: process.env.API_BASE_URL,
    waitforTimeout: parseInt(process.env.TEST_TIMEOUT) || 60000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: parseInt(process.env.TEST_RETRIES) || 2,
    services: [
        ['browserstack', {
            browserstackLocal: false,
            opts: {
                forcelocal: false,
                localIdentifier: process.env.BROWSERSTACK_BUILD_NAME
            }
        }]
    ],
    hostname: 'hub-cloud.browserstack.com',
    port: 443,
    protocol: 'https',
    framework: 'mocha',
    reporters: [
        'spec',
        ['allure', {
            outputDir: process.env.ALLURE_RESULTS_DIR || './allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
        }]
    ],
    mochaOpts: {
        ui: 'bdd',
        timeout: parseInt(process.env.TEST_TIMEOUT) || 60000,
        retries: parseInt(process.env.TEST_RETRIES) || 2
    },
    beforeSession: function (config, capabilities, specs, cid) {
        console.log('🚀 Starting test session for:', capabilities.deviceName);
    },
    before: function (capabilities, specs) {
        console.log('📱 Test environment:', process.env.TEST_ENVIRONMENT);
        console.log('🔧 API Base URL:', process.env.API_BASE_URL);
    },
    afterTest: function (test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log('❌ Test failed:', test.title);
            if (process.env.SCREENSHOT_ON_FAILURE === 'true') {
                browser.saveScreenshot(`./screenshots/failed_${Date.now()}.png`);
            }
        } else {
            console.log('✅ Test passed:', test.title);
        }
    },
    afterSuite: function (suite) {
        console.log('📊 Suite completed:', suite.title);
    },
    onComplete: function (exitCode, config, capabilities, results) {
        console.log('🏁 Test run completed with exit code:', exitCode);
    }
};
