# DIL-LMS Mobile App - End-to-End Testing

This directory contains end-to-end tests for the DIL-LMS mobile application using BrowserStack App Automate with WebdriverIO and Appium.

## 🏗️ Test Architecture

- **Framework**: WebdriverIO with Appium
- **Cloud Platform**: BrowserStack App Automate
- **Test Runner**: Mocha
- **Reporting**: Allure Reports
- **Language**: JavaScript/Node.js

## 📁 Directory Structure

```
tests/
├── helpers/                 # Test helper classes
│   ├── AppHelper.js        # Common app interactions
│   ├── AuthHelper.js       # Authentication operations
│   └── TestData.js         # Test data management
├── specs/                  # Test specifications
│   ├── smoke/              # Smoke tests (quick validation)
│   │   ├── login.spec.js
│   │   └── navigation.spec.js
│   └── regression/         # Regression tests (comprehensive)
│       ├── signup.spec.js
│       └── practice.spec.js
├── screenshots/            # Test screenshots (auto-generated)
├── allure-results/         # Allure test results (auto-generated)
├── logs/                   # Test logs (auto-generated)
├── package.json            # Test dependencies
├── wdio.conf.js           # Main WebdriverIO configuration
├── wdio.android.conf.js   # Android-specific configuration
├── wdio.ios.conf.js       # iOS-specific configuration
└── .env                   # Environment variables
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16 or higher)
2. **BrowserStack Account** with App Automate access
3. **App Files** uploaded to BrowserStack

### Installation

1. Navigate to the tests directory:
   ```bash
   cd tests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env` file:
   ```bash
   # Copy and update the .env file with your BrowserStack credentials
   cp .env.example .env
   ```

### Environment Configuration

Update the `.env` file with your BrowserStack credentials and app IDs:

```env
# BrowserStack Configuration
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
BROWSERSTACK_BUILD_NAME=DIL-Tutor-Build-1.0.0

# BrowserStack App IDs
BROWSERSTACK_ANDROID_APP_ID=bs://your_android_app_id
BROWSERSTACK_IOS_APP_ID=bs://your_ios_app_id

# Test Configuration
TEST_ENVIRONMENT=staging
TEST_TIMEOUT=60000
TEST_RETRIES=2

# Test Data
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

## 🧪 Running Tests

### Smoke Tests (Quick Validation)
```bash
npm run test:smoke
```

### Regression Tests (Comprehensive)
```bash
npm run test:regression
```

### Platform-Specific Tests
```bash
# Android only
npm run test:android

# iOS only
npm run test:ios
```

### Parallel Testing
```bash
npm run test:parallel
```

### Debug Mode
```bash
npm run test:debug
```

### Local Testing (if configured)
```bash
npm run test:local
```

## 📊 Test Reports

### Allure Reports
```bash
# Generate and open Allure report
npm run report
```

### Screenshots
- Screenshots are automatically captured on test failures
- Screenshots are saved in the `screenshots/` directory
- Each screenshot includes a timestamp

## 🔧 Test Configuration

### WebdriverIO Configuration Files

1. **`wdio.conf.js`** - Main configuration for Android
2. **`wdio.android.conf.js`** - Android-specific settings
3. **`wdio.ios.conf.js`** - iOS-specific settings

### Key Configuration Options

- **Capabilities**: Device selection, app configuration
- **Services**: BrowserStack integration
- **Reporters**: Spec and Allure reporting
- **Timeouts**: Test and element wait times
- **Retries**: Automatic test retry configuration

## 📱 Test Coverage

### Smoke Tests
- ✅ Login functionality
- ✅ Navigation between tabs
- ✅ Basic app loading

### Regression Tests
- ✅ User registration/signup
- ✅ Practice exercises
- ✅ Audio recording/playback
- ✅ Progress tracking
- ✅ Profile management

### Test Scenarios Covered

1. **Authentication**
   - Login with valid/invalid credentials
   - User registration
   - Password reset
   - Session management

2. **Navigation**
   - Tab navigation
   - Screen transitions
   - Back navigation
   - Deep linking

3. **Practice Features**
   - Stage selection
   - Exercise execution
   - Audio interactions
   - Progress tracking

4. **Error Handling**
   - Network connectivity
   - Invalid inputs
   - App state changes

## 🛠️ Helper Classes

### AppHelper
- Common app interactions
- Element waiting and clicking
- Screenshot capture
- Navigation utilities

### AuthHelper
- Login/logout operations
- User registration
- Session management
- Authentication validation

### TestData
- Centralized test data
- Environment configuration
- Test scenarios
- Expected elements

## 🐛 Debugging

### Debug Mode
```bash
npm run test:debug
```

### Verbose Logging
Set `VERBOSE_LOGGING=true` in `.env` file

### Screenshots on Failure
Set `SCREENSHOT_ON_FAILURE=true` in `.env` file

### BrowserStack Debug
Set `DEBUG_MODE=true` in `.env` file

## 📈 Continuous Integration

### GitHub Actions Integration
The tests can be integrated with GitHub Actions for automated testing:

```yaml
- name: Run E2E Tests
  run: |
    cd tests
    npm install
    npm run test:regression
```

### Test Results
- Allure reports for detailed analysis
- Screenshots for visual debugging
- Test logs for troubleshooting

## 🔒 Security

- Environment variables are used for sensitive data
- BrowserStack credentials are not committed to version control
- Test data uses staging environment

## 📞 Support

For issues or questions:
1. Check the test logs in `logs/` directory
2. Review screenshots in `screenshots/` directory
3. Check BrowserStack dashboard for device logs
4. Review Allure reports for detailed test results

## 🚀 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Data Management**: Use TestData class for consistent test data
3. **Error Handling**: Implement proper error handling and cleanup
4. **Screenshots**: Capture screenshots for debugging
5. **Logging**: Use descriptive console logs
6. **Timeouts**: Set appropriate timeouts for different operations
7. **Retries**: Configure retries for flaky tests

## 📝 Adding New Tests

1. Create test file in appropriate directory (`smoke/` or `regression/`)
2. Import required helpers
3. Follow existing test structure
4. Add descriptive test names and console logs
5. Include screenshot capture for debugging
6. Update this README if adding new test categories
