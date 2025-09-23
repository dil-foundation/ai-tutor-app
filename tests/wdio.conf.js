const { config } = require('@wdio/cli');
const { join } = require('path');

// Base configuration for all test suites
const baseConfig = {
  runner: 'local',
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
    retries: 2
  },
  maxInstances: 1,
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverScreenshots: false
    }]
  ],
  beforeSession: function (config, capabilities, specs, browser) {
    require('dotenv').config();
  },
  before: function (capabilities, specs) {
    // Global setup
    global.expect = require('chai').expect;
    global.chai = require('chai');
    global.chai.use(require('chai-as-promised'));
  },
  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (error) {
      // Take screenshot on failure
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${test.title.replace(/\s+/g, '-')}-${timestamp}.png`;
      browser.saveScreenshot(`./screenshots/${filename}`);
      console.log(`Screenshot saved: ${filename}`);
    }
  },
  afterSuite: function (suite) {
    // Cleanup after each suite
    console.log(`Suite "${suite.title}" completed`);
  },
  onComplete: function (exitCode, config, capabilities, results) {
    // Generate test report
    console.log('Test execution completed');
    console.log(`Total tests: ${results.tests}`);
    console.log(`Passed: ${results.passes}`);
    console.log(`Failed: ${results.failures}`);
  }
};

// Local Android configuration
const androidConfig = {
  ...baseConfig,
  specs: [
    './specs/**/*.spec.js'
  ],
  capabilities: [{
    platformName: 'Android',
    'appium:platformVersion': '13.0',
    'appium:deviceName': 'Android Emulator',
    'appium:automationName': 'UiAutomator2',
    'appium:app': process.env.ANDROID_APP_PATH || './apps/application-88a4b9a2-4e27-4c5a-bb69-a22275d44b90-new android build.apk',
    'appium:appWaitActivity': 'com.dil.lms.MainActivity',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': true,
    'appium:skipServerInstallation': false,
    'appium:skipDeviceInitialization': false,
    'appium:uiautomator2ServerInstallTimeout': 60000,
    'appium:systemPort': 8201
  }],
  services: [
    ['appium', {
      args: {
        address: 'localhost',
        port: 4723,
        log: './logs/appium.log',
        loglevel: 'info',
        'session-override': true,
        'relaxed-security': true
      },
      logPath: './logs/',
      command: 'appium'
    }]
  ]
};

// Local iOS configuration
const iosConfig = {
  ...baseConfig,
  specs: [
    './specs/**/*.spec.js'
  ],
  capabilities: [{
    platformName: 'iOS',
    'appium:platformVersion': '17.0',
    'appium:deviceName': 'iPhone 15',
    'appium:automationName': 'XCUITest',
    'appium:app': process.env.IOS_APP_PATH || './apps/application-3c9d64c2-1c28-4e00-8df4-aed8597e1b8c.ipa',
    'appium:bundleId': 'com.dil.lms',
    'appium:newCommandTimeout': 300,
    'appium:autoAcceptAlerts': true,
    'appium:noReset': false,
    'appium:fullReset': true,
    'appium:skipServerInstallation': false,
    'appium:skipDeviceInitialization': false,
    'appium:webDriverAgentUrl': 'http://localhost:8100'
  }],
  services: [
    ['appium', {
      args: {
        address: 'localhost',
        port: 4723,
        log: './logs/appium.log',
        loglevel: 'info',
        'session-override': true,
        'relaxed-security': true
      },
      logPath: './logs/',
      command: 'appium'
    }]
  ]
};

// BrowserStack Android configuration
const browserStackAndroidConfig = {
  ...baseConfig,
  specs: [
    './specs/**/*.spec.js'
  ],
  capabilities: [{
    'bstack:options': {
      userName: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      projectName: 'DIL Tutor App E2E Tests',
      buildName: process.env.BROWSERSTACK_BUILD_NAME || `DIL-Tutor-${new Date().toISOString().split('T')[0]}`,
      sessionName: 'Android E2E Tests',
      app: process.env.BROWSERSTACK_ANDROID_APP_ID || 'bs://781195bd435b9df13ba92bd587737e59f833151d',
      deviceName: 'Samsung Galaxy S23',
      osVersion: '13.0',
      debug: true,
      networkLogs: true,
      consoleLogs: 'info',
      video: true,
      local: false,
      timezone: 'UTC'
    },
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:appWaitActivity': 'com.dil.lms.MainActivity',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': true
  }],
  services: [
    ['browserstack', {
      browserstackLocal: false
    }]
  ]
};

// BrowserStack iOS configuration
const browserStackIOSConfig = {
  ...baseConfig,
  specs: [
    './specs/**/*.spec.js'
  ],
  capabilities: [{
    'bstack:options': {
      userName: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      projectName: 'DIL Tutor App E2E Tests',
      buildName: process.env.BROWSERSTACK_BUILD_NAME || `DIL-Tutor-${new Date().toISOString().split('T')[0]}`,
      sessionName: 'iOS E2E Tests',
      app: process.env.BROWSERSTACK_IOS_APP_ID,
      deviceName: 'iPhone 15',
      osVersion: '17.0',
      debug: true,
      networkLogs: true,
      consoleLogs: 'info',
      video: true,
      local: false,
      timezone: 'UTC'
    },
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:bundleId': 'com.dil.lms',
    'appium:newCommandTimeout': 300,
    'appium:autoAcceptAlerts': true,
    'appium:noReset': false,
    'appium:fullReset': true
  }],
  services: [
    ['browserstack', {
      browserstackLocal: false
    }]
  ]
};

// Parallel execution configuration
const parallelConfig = {
  ...baseConfig,
  specs: [
    './specs/**/*.spec.js'
  ],
  maxInstances: 4,
  capabilities: [
    // Android devices
    {
      'bstack:options': {
        userName: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        projectName: 'DIL Tutor App E2E Tests',
        buildName: process.env.BROWSERSTACK_BUILD_NAME || `DIL-Tutor-${new Date().toISOString().split('T')[0]}`,
        sessionName: 'Android Galaxy S23',
        app: process.env.BROWSERSTACK_ANDROID_APP_ID || 'bs://781195bd435b9df13ba92bd587737e59f833151d',
        deviceName: 'Samsung Galaxy S23',
        osVersion: '13.0',
        debug: true,
        networkLogs: true,
        consoleLogs: 'info',
        video: true,
        local: false,
        timezone: 'UTC'
      },
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:appWaitActivity': 'com.dil.lms.MainActivity',
      'appium:newCommandTimeout': 300,
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
      'appium:fullReset': true
    },
    {
      'bstack:options': {
        userName: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        projectName: 'DIL Tutor App E2E Tests',
        buildName: process.env.BROWSERSTACK_BUILD_NAME || `DIL-Tutor-${new Date().toISOString().split('T')[0]}`,
        sessionName: 'Android Pixel 7',
        app: process.env.BROWSERSTACK_ANDROID_APP_ID || 'bs://781195bd435b9df13ba92bd587737e59f833151d',
        deviceName: 'Google Pixel 7',
        osVersion: '13.0',
        debug: true,
        networkLogs: true,
        consoleLogs: 'info',
        video: true,
        local: false,
        timezone: 'UTC'
      },
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:appWaitActivity': 'com.dil.lms.MainActivity',
      'appium:newCommandTimeout': 300,
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
      'appium:fullReset': true
    },
    // iOS devices
    {
      'bstack:options': {
        userName: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        projectName: 'DIL Tutor App E2E Tests',
        buildName: process.env.BROWSERSTACK_BUILD_NAME || `DIL-Tutor-${new Date().toISOString().split('T')[0]}`,
        sessionName: 'iOS iPhone 15',
        app: process.env.BROWSERSTACK_IOS_APP_ID,
        deviceName: 'iPhone 15',
        osVersion: '17.0',
        debug: true,
        networkLogs: true,
        consoleLogs: 'info',
        video: true,
        local: false,
        timezone: 'UTC'
      },
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:bundleId': 'com.dil.lms',
      'appium:newCommandTimeout': 300,
      'appium:autoAcceptAlerts': true,
      'appium:noReset': false,
      'appium:fullReset': true
    },
    {
      'bstack:options': {
        userName: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        projectName: 'DIL Tutor App E2E Tests',
        buildName: process.env.BROWSERSTACK_BUILD_NAME || `DIL-Tutor-${new Date().toISOString().split('T')[0]}`,
        sessionName: 'iOS iPhone 14',
        app: process.env.BROWSERSTACK_IOS_APP_ID,
        deviceName: 'iPhone 14',
        osVersion: '16.0',
        debug: true,
        networkLogs: true,
        consoleLogs: 'info',
        video: true,
        local: false,
        timezone: 'UTC'
      },
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:bundleId': 'com.dil.lms',
      'appium:newCommandTimeout': 300,
      'appium:autoAcceptAlerts': true,
      'appium:noReset': false,
      'appium:fullReset': true
    }
  ],
  services: [
    ['browserstack', {
      browserstackLocal: false
    }]
  ]
};

// Smoke test configuration (quick tests)
const smokeConfig = {
  ...baseConfig,
  specs: [
    './specs/smoke/*.spec.js'
  ],
  capabilities: [{
    'bstack:options': {
      userName: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      projectName: 'DIL Tutor App Smoke Tests',
      buildName: process.env.BROWSERSTACK_BUILD_NAME || `DIL-Tutor-Smoke-${new Date().toISOString().split('T')[0]}`,
      sessionName: 'Smoke Tests',
      app: process.env.BROWSERSTACK_ANDROID_APP_ID || 'bs://781195bd435b9df13ba92bd587737e59f833151d',
      deviceName: 'Samsung Galaxy S23',
      osVersion: '13.0',
      debug: true,
      networkLogs: true,
      consoleLogs: 'info',
      video: true,
      local: false,
      timezone: 'UTC'
    },
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:appWaitActivity': 'com.dil.lms.MainActivity',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': true
  }],
  services: [
    ['browserstack', {
      browserstackLocal: false
    }]
  ]
};

// Debug configuration
const debugConfig = {
  ...baseConfig,
  specs: [
    './specs/debug/*.spec.js'
  ],
  capabilities: [{
    platformName: 'Android',
    'appium:platformVersion': '13.0',
    'appium:deviceName': 'Android Emulator',
    'appium:automationName': 'UiAutomator2',
    'appium:app': process.env.ANDROID_APP_PATH || './apps/application-88a4b9a2-4e27-4c5a-bb69-a22275d44b90-new android build.apk',
    'appium:appWaitActivity': 'com.dil.lms.MainActivity',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': true,
    'appium:skipServerInstallation': false,
    'appium:skipDeviceInitialization': false,
    'appium:uiautomator2ServerInstallTimeout': 60000,
    'appium:systemPort': 8201
  }],
  services: [
    ['appium', {
      args: {
        address: 'localhost',
        port: 4723,
        log: './logs/appium.log',
        loglevel: 'info',
        'session-override': true,
        'relaxed-security': true
      },
      logPath: './logs/',
      command: 'appium'
    }]
  ],
  logLevel: 'debug',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: 0
  }
};

// Export configurations
exports.config = androidConfig;
exports.android = androidConfig;
exports.ios = iosConfig;
exports.browserstack = browserStackAndroidConfig;
exports['android-browserstack'] = browserStackAndroidConfig;
exports['ios-browserstack'] = browserStackIOSConfig;
exports.parallel = parallelConfig;
exports.smoke = smokeConfig;
exports.debug = debugConfig;
