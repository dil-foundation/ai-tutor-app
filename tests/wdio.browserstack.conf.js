const { config } = require('@wdio/cli');

// BrowserStack App Automate configuration for testing
exports.config = {
  runner: 'local',
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
    retries: 1
  },
  maxInstances: 1,
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  reporters: ['spec'],
  
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
      timezone: 'UTC',
      appiumVersion: '2.0.0'
    },
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:appWaitActivity': 'com.dil.lms.MainActivity',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': true,
    'appium:skipServerInstallation': true,
    'appium:skipDeviceInitialization': true
  }],
  
  services: [
    ['browserstack', {
      browserstackLocal: false,
      testObservability: true,
      testObservabilityOptions: {
        projectName: 'DIL Tutor App E2E Tests',
        buildName: process.env.BROWSERSTACK_BUILD_NAME || `DIL-Tutor-${new Date().toISOString().split('T')[0]}`,
        buildTag: ['e2e', 'android', 'app-automate']
      }
    }]
  ],
  
  beforeSession: function (config, capabilities, specs, browser) {
    require('dotenv').config();
  },
  
  before: function (capabilities, specs) {
    global.expect = require('chai').expect;
    global.chai = require('chai');
    global.chai.use(require('chai-as-promised'));
  },
  
  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (error) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${test.title.replace(/\s+/g, '-')}-${timestamp}.png`;
      browser.saveScreenshot(`./screenshots/${filename}`);
      console.log(`Screenshot saved: ${filename}`);
    }
  },
  
  onComplete: function (exitCode, config, capabilities, results) {
    console.log('Test execution completed');
    console.log(`Total tests: ${results.tests}`);
    console.log(`Passed: ${results.passes}`);
    console.log(`Failed: ${results.failures}`);
  }
};
