# DIL LMS Mobile App Test Troubleshooting Guide

## Common Issues and Solutions

### 1. Appium Connection Refused Error

**Error:** `connect ECONNREFUSED 127.0.0.1:4723`

**Causes:**
- Appium server is not running
- Port 4723 is blocked or in use
- Appium service configuration issues

**Solutions:**

#### Step 1: Check Appium Installation
```bash
# Check if Appium is installed
appium --version

# If not installed, install it
npm install -g appium

# Install required drivers
appium driver install uiautomator2
appium driver install xcuitest
```

#### Step 2: Check Port Availability
```bash
# Check if port 4723 is in use
netstat -an | findstr :4723

# Kill any existing Appium processes
taskkill /f /im node.exe
```

#### Step 3: Run Appium Check Script
```bash
npm run check-appium
```

#### Step 4: Manual Appium Server Start
```bash
# Start Appium server manually
appium --address localhost --port 4723 --log ./logs/appium.log
```

### 2. Android SDK Issues

**Error:** `ANDROID_HOME is not set`

**Solutions:**
1. Install Android Studio
2. Set environment variables:
   ```bash
   set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
   ```

### 3. App File Not Found

**Error:** `App file not found`

**Solutions:**
1. Ensure the APK file exists in the `apps/` directory
2. Check the file name matches the configuration
3. Current app file: `application-88a4b9a2-4e27-4c5a-bb69-a22275d44b90-new android build.apk`

### 4. Test Execution Steps

#### Option 1: Use Simple Configuration
```bash
npm run test:simple
```

#### Option 2: Use Debug Mode
```bash
npm run test:debug
```

#### Option 3: Manual Setup
1. Start Appium server manually:
   ```bash
   appium --address localhost --port 4723
   ```
2. In another terminal, run tests:
   ```bash
   npm test
   ```

### 5. Environment Setup

#### Create .env file:
```bash
# Copy from example
copy env.example .env

# Edit .env with your values
notepad .env
```

#### Required Environment Variables:
- `ANDROID_APP_PATH` - Path to your APK file
- `IOS_APP_PATH` - Path to your IPA file
- `BROWSERSTACK_USERNAME` - BrowserStack username
- `BROWSERSTACK_ACCESS_KEY` - BrowserStack access key

### 6. Logs and Debugging

#### Check Appium Logs:
```bash
# View Appium logs
type logs\appium.log

# View test logs
type logs\appium-test.log
```

#### Enable Debug Mode:
```bash
# Run with debug logging
npm run test:debug
```

### 7. Common Commands

```bash
# Setup test environment
npm run setup

# Check Appium installation
npm run check-appium

# Run simple tests
npm run test:simple

# Run debug tests
npm run test:debug

# Clean logs and screenshots
npm run clean
```

### 8. Platform-Specific Issues

#### Windows:
- Ensure Windows Defender allows Node.js and Appium
- Run PowerShell as Administrator if needed
- Check firewall settings

#### macOS:
- Grant permissions to Terminal for accessibility
- Install Xcode command line tools

#### Linux:
- Install required packages for Android development
- Set proper permissions for Android SDK

### 9. Getting Help

1. Check the logs in `./logs/` directory
2. Run `npm run check-appium` for diagnostics
3. Review WebdriverIO documentation
4. Check Appium documentation
5. Verify your app builds successfully

### 10. Quick Fix Checklist

- [ ] Appium is installed (`appium --version`)
- [ ] Required drivers are installed (`appium driver list`)
- [ ] Port 4723 is available
- [ ] Android SDK is properly configured
- [ ] App files exist in `./apps/` directory
- [ ] Environment variables are set
- [ ] No other Appium processes are running
- [ ] Firewall allows connections on port 4723
