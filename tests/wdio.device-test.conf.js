const { config } = require('@wdio/cli');

// Device compatibility test configuration
exports.config = {
  runner: 'local',
  specs: [
    './specs/auth/login.spec.js'
  ],
  exclude: [],
  maxInstances: 1,
  capabilities: [{
    'bstack:options': {
      userName: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      projectName: 'DIL-Device-Test',
      buildName: 'Device-Test-' + new Date().toISOString().split('T')[0],
      sessionName: 'Device Compatibility Test',
      app: process.env.BROWSERSTACK_ANDROID_APP_ID || 'bs://781195bd435b9df13ba92bd587737e59f833151d',
      deviceName: 'Google Pixel 6',
      osVersion: '12.0',
      debug: true,
      networkLogs: true,
      consoleLogs: 'info',
      video: true,
      local: false,
      timezone: 'UTC'
    },
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true
  }],
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    ['browserstack', {
      browserstackLocal: false
    }]
  ],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
  reporters: ['spec'],
  onPrepare: function (config, capabilities) {
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
  }
};
