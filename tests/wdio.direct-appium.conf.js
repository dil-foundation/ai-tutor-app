const { config } = require('@wdio/cli');

// Direct Appium connection configuration
exports.config = {
  runner: 'local',
  specs: [
    './specs/auth/login.spec.js'
  ],
  exclude: [],
  maxInstances: 1,
  capabilities: [{
    platformName: 'Android',
    'appium:platformVersion': '13.0',
    'appium:deviceName': 'Android Emulator',
    'appium:automationName': 'UiAutomator2',
    'appium:app': process.env.ANDROID_APP_PATH || './apps/application-88a4b9a2-4e27-4c5a-bb69-a22275d44b90-new android-build.apk',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': true
  }],
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  hostname: 'localhost',
  port: 4723,
  path: '/',
  services: [],
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
