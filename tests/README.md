# DIL Tutor App - End-to-End Tests

This directory contains comprehensive end-to-end tests for the DIL Tutor mobile application using Appium and BrowserStack App Automate.

## 🏗️ Architecture

The testing framework is built with:
- **WebdriverIO**: Test automation framework
- **Appium**: Mobile app automation
- **BrowserStack App Automate**: Cloud-based device testing
- **Mocha**: Test framework
- **Chai**: Assertion library
- **Allure**: Test reporting

## 📁 Directory Structure

```
tests/
├── specs/                    # Test specifications
│   ├── auth/                # Authentication tests
│   │   ├── login.spec.js
│   │   └── signup.spec.js
│   ├── learning/            # Learning feature tests
│   │   └── english-only.spec.js
│   ├── practice/            # Practice exercise tests
│   │   └── repeat-after-me.spec.js
│   ├── progress/            # Progress tracking tests
│   │   └── progress-tracking.spec.js
│   ├── smoke/               # Smoke tests
│   └── debug/               # Debug tests
├── utils/                   # Test utilities
│   ├── AppUtils.js          # App interaction utilities
│   └── TestData.js          # Test data management
├── scripts/                 # Setup and utility scripts
│   └── setup.js             # Environment setup script
├── screenshots/             # Test screenshots
├── logs/                    # Test logs
├── videos/                  # Test videos
├── allure-results/          # Allure test results
├── apps/                    # App files for local testing
├── wdio.conf.js             # WebdriverIO configuration
├── package.json             # Dependencies and scripts
├── env.example              # Environment variables template
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- BrowserStack account
- DIL Tutor app builds (APK/IPA)

### Setup

1. **Install dependencies:**
   ```bash
   cd tests
   npm install
   ```

2. **Run setup script:**
   ```bash
   npm run setup
   ```

3. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

4. **Upload apps to BrowserStack:**
   - Upload your APK/IPA files to BrowserStack
   - Get the app IDs and update `.env` file

### Running Tests

#### Local Testing
```bash
# Run tests locally (requires local APK/IPA files and Appium server)
npm run test

# Platform-specific local tests
npm run test:android
npm run test:ios
```

#### BrowserStack Testing
```bash
# Smoke tests (quick validation)
npm run test:smoke

# Regression tests (full test suite)
npm run test:regression

# Parallel tests (multiple devices)
npm run test:parallel

# Platform-specific tests
npm run test:android-browserstack
npm run test:ios-browserstack

# Debug mode
npm run test:debug
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# BrowserStack Configuration
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
BROWSERSTACK_BUILD_NAME=DIL-Tutor-Build-1.0.0

# App IDs (upload apps to BrowserStack first)
BROWSERSTACK_ANDROID_APP_ID=bs://your_android_app_id
BROWSERSTACK_IOS_APP_ID=bs://your_ios_app_id

# Test Configuration
TEST_ENVIRONMENT=staging
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!

# API Configuration
API_BASE_URL=https://api.dil.lms-staging.com
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Test Configurations

The framework supports multiple test configurations:

- **Local Testing**: Run tests on local devices/emulators
- **BrowserStack**: Run tests on cloud devices
- **Parallel**: Run tests on multiple devices simultaneously
- **Smoke**: Quick validation tests
- **Regression**: Full test suite

## 📱 Test Coverage

### Authentication Tests
- ✅ Login screen UI validation
- ✅ Form validation (email, password)
- ✅ Successful login flow
- ✅ Failed login scenarios
- ✅ Role-based access control
- ✅ Signup flow validation
- ✅ Password visibility toggle
- ✅ Navigation between auth screens

### Learning Feature Tests
- ✅ English Only mode UI
- ✅ Voice recording functionality
- ✅ AI response handling
- ✅ Conversation flow
- ✅ Learning paths (vocabulary, sentence structure, topics)
- ✅ Error handling (network, permissions)
- ✅ Navigation and exit

### Practice Exercise Tests
- ✅ Repeat After Me exercise
- ✅ Audio playback functionality
- ✅ Voice recording and evaluation
- ✅ Progress tracking
- ✅ Feedback and scoring
- ✅ Navigation between exercises

### Progress Tracking Tests
- ✅ Progress screen UI elements
- ✅ Progress visualization (circular progress, bars)
- ✅ Learning roadmap display
- ✅ Achievements system
- ✅ Statistics display (streak, practice time)
- ✅ Progress updates after exercises
- ✅ Error handling and fallback data

## 🎯 Test Scenarios

### Smoke Tests
Quick validation tests that verify core functionality:
- App launch and login
- Basic navigation
- Core learning features
- Progress tracking

### Regression Tests
Comprehensive test suite covering:
- All authentication flows
- Complete learning workflows
- All practice exercises
- Progress tracking features
- Error handling scenarios
- Accessibility features

### Parallel Tests
Run tests simultaneously on multiple devices:
- Android devices (Samsung Galaxy S23, Google Pixel 7)
- iOS devices (iPhone 15, iPhone 14)
- Different OS versions
- Various screen sizes

## 🔍 Debugging

### Debug Mode
Run tests in debug mode for troubleshooting:
```bash
npm run test:debug
```

### Screenshots
Screenshots are automatically captured on test failures and saved to `screenshots/` directory.

### Logs
Detailed logs are available in `logs/` directory:
- Appium logs
- WebdriverIO logs
- Test execution logs

### Videos
Test execution videos are recorded on BrowserStack and available in the dashboard.

## 📊 Reporting

### Allure Reports
Generate detailed test reports:
```bash
# After running tests
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

### BrowserStack Dashboard
View test results, videos, and logs on BrowserStack dashboard.

## 🚀 Test Execution

### Manual Test Execution
Run tests manually using npm scripts:
- **Smoke tests**: Quick validation tests
- **Regression tests**: Full test suite
- **Parallel tests**: Multiple devices simultaneously
- **Platform-specific**: Android or iOS only

## 🛠️ Utilities

### AppUtils
Common app interaction utilities:
- Element waiting and interaction
- Screenshot capture
- Navigation helpers
- Permission handling
- Error handling

### TestData
Centralized test data management:
- User credentials
- Test phrases and exercises
- API endpoints
- Timeout configurations
- Error messages

## 🔒 Security

### Credentials Management
- Environment variables for sensitive data
- No hardcoded credentials in code

### Test Data
- Separate test user accounts
- Isolated test data
- Cleanup after tests

## 📈 Performance

### Test Execution
- Parallel execution for faster results
- Optimized wait times
- Efficient element locators
- Minimal test data setup

### Resource Management
- Automatic cleanup after tests
- Memory optimization
- Network usage monitoring

## 🐛 Troubleshooting

### Common Issues

1. **npm install fails with ETARGET error**
   - The `@appium/doctor` package has been deprecated and removed from dependencies
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then run `npm install` again
   - Use `npm install --legacy-peer-deps` if peer dependency issues persist

2. **App not found on BrowserStack**
   - Verify app ID is correct
   - Check app upload status
   - Ensure app is accessible

3. **Test timeouts**
   - Check network connectivity
   - Verify API endpoints
   - Increase timeout values if needed

4. **Element not found**
   - Verify element locators
   - Check app version compatibility
   - Update locators if UI changed

5. **Authentication failures**
   - Verify test user credentials
   - Check Supabase configuration
   - Ensure test environment is accessible

### Debug Steps

1. Run tests in debug mode
2. Check screenshots and logs
3. Verify environment configuration
4. Test individual components
5. Check BrowserStack dashboard

## 📚 Resources

- [WebdriverIO Documentation](https://webdriver.io/)
- [Appium Documentation](https://appium.io/)
- [BrowserStack App Automate](https://www.browserstack.com/app-automate)
- [Mocha Testing Framework](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Allure Reporting](https://docs.qameta.io/allure/)

## 🤝 Contributing

1. Follow the existing test structure
2. Add proper test descriptions
3. Include error handling
4. Update documentation
5. Run tests before submitting

## 📄 License

This testing framework is part of the DIL Tutor App project and follows the same license terms.
