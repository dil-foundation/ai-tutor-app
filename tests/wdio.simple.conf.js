const { config } = require('@wdio/cli');

// Simple configuration for local testing
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
    platformName: 'Android',
    'appium:platformVersion': '13.0',
    'appium:deviceName': 'Android Emulator',
    'appium:automationName': 'UiAutomator2',
    'appium:app': './apps/application-88a4b9a2-4e27-4c5a-bb69-a22275d44b90-new android build.apk',
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
