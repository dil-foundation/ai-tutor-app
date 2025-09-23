const { config } = require('@wdio/cli');
require('dotenv').config();

exports.config = {
    runner: 'local',
    specs: [
        './specs/**/*.js'
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
        'browserstack.build': `${process.env.BROWSERSTACK_BUILD_NAME}-Android`,
        'browserstack.debug': process.env.DEBUG_MODE === 'true',
        'browserstack.console': 'info',
        'browserstack.networkLogs': process.env.VERBOSE_LOGGING === 'true',
        'browserstack.appiumLogs': process.env.VERBOSE_LOGGING === 'true',
        'browserstack.deviceLogs': process.env.VERBOSE_LOGGING === 'true',
        
        // Android specific configuration
        'app': process.env.BROWSERSTACK_ANDROID_APP_ID,
        'platformName': 'Android',
        'deviceName': 'Google Pixel 7',
        'platformVersion': '13.0',
        'automationName': 'UiAutomator2',
        
        // Android specific settings
        'browserstack.timezone': 'UTC',
        'browserstack.geoLocation': 'IN',
        'browserstack.local': false,
        'browserstack.idleTimeout': 300,
        'browserstack.appiumVersion': '2.0.0',
        
        // Android permissions
        'autoGrantPermissions': true,
        'noReset': false,
        'fullReset': false,
        
        // Custom capabilities
        'browserstack.customData': {
            'testEnvironment': process.env.TEST_ENVIRONMENT,
            'testSuite': 'android',
            'platform': 'android'
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
                localIdentifier: `${process.env.BROWSERSTACK_BUILD_NAME}-Android`
            }
        }]
    ],
    hostname: 'hub.browserstack.com',
    port: 443,
    protocol: 'https',
    framework: 'mocha',
    reporters: [
        'spec',
        ['allure', {
            outputDir: `${process.env.ALLURE_RESULTS_DIR || './allure-results'}/android`,
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
        console.log('🤖 Starting Android test session');
    },
    before: function (capabilities, specs) {
        console.log('📱 Android Test Environment:', process.env.TEST_ENVIRONMENT);
    }
};
