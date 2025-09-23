const { config } = require('@wdio/cli');

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
      projectName: 'DIL-Tests',
      buildName: 'Automate-Test-Build-' + new Date().toISOString().split('T')[0],
      sessionName: 'Automate Test',
      browserName: 'Chrome',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '10',
      debug: true,
      networkLogs: true,
      consoleLogs: 'info',
      video: true,
      local: false,
      timezone: 'UTC'
    },
    browserName: 'Chrome'
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
