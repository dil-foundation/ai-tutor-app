#!/usr/bin/env node

/**
 * iOS Deployment Setup Script
 * This script helps configure the project for iOS TestFlight deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, description) {
  log(`\n${colors.blue}Running: ${description}${colors.reset}`);
  log(`${colors.cyan}Command: ${command}${colors.reset}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`${colors.green}✓ Success${colors.reset}`);
    return output;
  } catch (error) {
    log(`${colors.red}✗ Failed: ${error.message}${colors.reset}`);
    return null;
  }
}

function promptUser(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer.trim());
    });
  });
}

async function updateEasConfig() {
  const easConfigPath = path.join(__dirname, '..', 'eas.json');
  
  if (!fs.existsSync(easConfigPath)) {
    log(`${colors.red}eas.json not found!${colors.reset}`);
    return false;
  }

  log(`\n${colors.bright}=== Updating EAS Configuration ===${colors.reset}`);
  
  const appleId = await promptUser('Enter your Apple ID email: ');
  const ascAppId = await promptUser('Enter your App Store Connect App ID: ');
  const appleTeamId = await promptUser('Enter your Apple Team ID: ');

  try {
    const easConfig = JSON.parse(fs.readFileSync(easConfigPath, 'utf8'));
    
    // Update submit configuration
    if (!easConfig.submit) easConfig.submit = {};
    if (!easConfig.submit.production) easConfig.submit.production = {};
    if (!easConfig.submit.preview) easConfig.submit.preview = {};
    
    const iosConfig = {
      appleId,
      ascAppId,
      appleTeamId
    };
    
    easConfig.submit.production.ios = iosConfig;
    easConfig.submit.preview.ios = iosConfig;
    
    fs.writeFileSync(easConfigPath, JSON.stringify(easConfig, null, 2));
    log(`${colors.green}✓ EAS configuration updated${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}✗ Failed to update EAS config: ${error.message}${colors.reset}`);
    return false;
  }
}

async function main() {
  log(`${colors.bright}${colors.magenta}`);
  log('╔══════════════════════════════════════════════════════════════╗');
  log('║                iOS TestFlight Deployment Setup              ║');
  log('║                     DIL Tutor App                           ║');
  log('╚══════════════════════════════════════════════════════════════╝');
  log(`${colors.reset}`);

  // Check prerequisites
  log(`\n${colors.bright}=== Checking Prerequisites ===${colors.reset}`);
  
  const prerequisites = [
    { command: 'node', name: 'Node.js' },
    { command: 'npm', name: 'npm' },
    { command: 'git', name: 'Git' }
  ];

  let allPrerequisitesMet = true;
  
  for (const prereq of prerequisites) {
    if (checkCommand(prereq.command)) {
      log(`${colors.green}✓ ${prereq.name} is installed${colors.reset}`);
    } else {
      log(`${colors.red}✗ ${prereq.name} is not installed${colors.reset}`);
      allPrerequisitesMet = false;
    }
  }

  if (!allPrerequisitesMet) {
    log(`${colors.red}\nPlease install missing prerequisites and run this script again.${colors.reset}`);
    process.exit(1);
  }

  // Check if EAS CLI is installed
  log(`\n${colors.bright}=== Checking EAS CLI ===${colors.reset}`);
  if (!checkCommand('eas')) {
    log(`${colors.yellow}EAS CLI not found. Installing...${colors.reset}`);
    const installResult = runCommand('npm install -g @expo/eas-cli', 'Installing EAS CLI');
    if (!installResult) {
      log(`${colors.red}Failed to install EAS CLI. Please install manually: npm install -g @expo/eas-cli${colors.reset}`);
      process.exit(1);
    }
  } else {
    log(`${colors.green}✓ EAS CLI is installed${colors.reset}`);
  }

  // Check Expo login status
  log(`\n${colors.bright}=== Checking Expo Authentication ===${colors.reset}`);
  const whoamiResult = runCommand('eas whoami', 'Checking Expo login status');
  
  if (!whoamiResult || whoamiResult.includes('Not logged in')) {
    log(`${colors.yellow}Not logged in to Expo. Please login:${colors.reset}`);
    log(`${colors.cyan}Run: eas login${colors.reset}`);
    
    const shouldLogin = await promptUser('Do you want to login now? (y/n): ');
    if (shouldLogin.toLowerCase() === 'y') {
      runCommand('eas login', 'Logging in to Expo');
    } else {
      log(`${colors.yellow}Please login to Expo manually before proceeding.${colors.reset}`);
    }
  } else {
    log(`${colors.green}✓ Logged in to Expo as: ${whoamiResult.trim()}${colors.reset}`);
  }

  // Update EAS configuration
  const configUpdated = await updateEasConfig();
  
  if (!configUpdated) {
    log(`${colors.yellow}EAS configuration not updated. You can update it manually later.${colors.reset}`);
  }

  // Project configuration check
  log(`\n${colors.bright}=== Project Configuration ===${colors.reset}`);
  
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    log(`${colors.green}✓ App name: ${appConfig.expo.name}${colors.reset}`);
    log(`${colors.green}✓ Bundle ID: ${appConfig.expo.ios.bundleIdentifier}${colors.reset}`);
    log(`${colors.green}✓ Version: ${appConfig.expo.version}${colors.reset}`);
  }

  // Next steps
  log(`\n${colors.bright}=== Next Steps ===${colors.reset}`);
  log(`${colors.cyan}1. Set up iOS credentials:${colors.reset}`);
  log(`   eas credentials:configure --platform ios`);
  log(`${colors.cyan}2. Create App Store Connect app with bundle ID: com.dil.lms${colors.reset}`);
  log(`${colors.cyan}3. Add EXPO_TOKEN to GitHub repository secrets${colors.reset}`);
  log(`${colors.cyan}4. Test build locally:${colors.reset}`);
  log(`   eas build --platform ios --profile preview`);
  log(`${colors.cyan}5. Create production release:${colors.reset}`);
  log(`   git tag v1.0.0 && git push origin v1.0.0`);

  log(`\n${colors.bright}=== Documentation ===${colors.reset}`);
  log(`${colors.cyan}📖 Full guide: deployment/IOS_TESTFLIGHT_DEPLOYMENT_GUIDE.md${colors.reset}`);
  log(`${colors.cyan}📚 All deployment docs: deployment/README.md${colors.reset}`);
  log(`${colors.cyan}🔧 GitHub workflow: .github/workflows/ios-testflight-deploy.yml${colors.reset}`);

  log(`\n${colors.green}${colors.bright}Setup completed! 🎉${colors.reset}`);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`${colors.red}Script failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { main };
