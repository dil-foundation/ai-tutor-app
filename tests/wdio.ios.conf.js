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
        'browserstack.build': `${process.env.BROWSERSTACK_BUILD_NAME}-iOS`,
        'browserstack.debug': process.env.DEBUG_MODE === 'true',
        'browserstack.console': 'info',
        'browserstack.networkLogs': process.env.VERBOSE_LOGGING === 'true',
        'browserstack.appiumLogs': process.env.VERBOSE_LOGGING === 'true',
        'browserstack.deviceLogs': process.env.VERBOSE_LOGGING === 'true',
        
        // iOS specific configuration
        'app': process.env.BROWSERSTACK_IOS_APP_ID,
        'platformName': 'iOS',
        'deviceName': 'iPhone 14',
        'platformVersion': '16.0',
        'automationName': 'XCUITest',
        
        // iOS specific settings
        'browserstack.timezone': 'UTC',
        'browserstack.geoLocation': 'IN',
        'browserstack.local': false,
        'browserstack.idleTimeout': 300,
        'browserstack.appiumVersion': '2.0.0',
        
        // iOS permissions and settings
        'autoAcceptAlerts': true,
        'autoDismissAlerts': false,
        'noReset': false,
        'fullReset': false,
        'bundleId': 'com.dil.lms',
        
        // Custom capabilities
        'browserstack.customData': {
            'testEnvironment': process.env.TEST_ENVIRONMENT,
            'testSuite': 'ios',
            'platform': 'ios'
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
                localIdentifier: `${process.env.BROWSERSTACK_BUILD_NAME}-iOS`
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
            outputDir: `${process.env.ALLURE_RESULTS_DIR || './allure-results'}/ios`,
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
        console.log('🍎 Starting iOS test session');
    },
    before: function (capabilities, specs) {
        console.log('📱 iOS Test Environment:', process.env.TEST_ENVIRONMENT);
    }
};
