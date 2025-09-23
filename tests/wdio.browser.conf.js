const { config } = require('@wdio/cli');
require('dotenv').config();

exports.config = {
    runner: 'local',
    specs: [
        './specs/browser/*.js'
    ],
    maxInstances: 1,
    capabilities: [{
        'browserstack.user': process.env.BROWSERSTACK_USERNAME,
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
        'browserstack.build': process.env.BROWSERSTACK_BUILD_NAME,
        'browserstack.debug': 'true',
        'browserstack.console': 'info',
        'browserstack.networkLogs': 'true',
        
        // Browser configuration
        'browserName': 'Chrome',
        'browserVersion': 'latest',
        'os': 'Windows',
        'osVersion': '10',
        
        // Test configuration
        'browserstack.timezone': 'UTC',
        'browserstack.geoLocation': 'IN',
        'browserstack.local': false,
        'browserstack.idleTimeout': 300,
        
        // Custom capabilities
        'browserstack.customData': {
            'testEnvironment': process.env.TEST_ENVIRONMENT,
            'testSuite': 'browser'
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
    hostname: 'hub.browserstack.com',
    port: 443,
    protocol: 'https',
    framework: 'mocha',
    reporters: [
        'spec'
    ],
    mochaOpts: {
        ui: 'bdd',
        timeout: parseInt(process.env.TEST_TIMEOUT) || 60000,
        retries: parseInt(process.env.TEST_RETRIES) || 2
    },
    beforeSession: function (config, capabilities, specs, cid) {
        console.log('🚀 Starting browser test session');
    },
    before: function (capabilities, specs) {
        console.log('🌐 Browser Test Environment:', process.env.TEST_ENVIRONMENT);
    }
};
