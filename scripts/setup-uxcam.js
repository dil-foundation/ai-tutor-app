#!/usr/bin/env node

/**
 * UXCam Setup Script
 * 
 * This script helps set up UXCam integration for the DIL Tutor app.
 * It installs dependencies, validates configuration, and provides setup guidance.
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
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = readJsonFile(packageJsonPath);
  
  if (!packageJson) {
    log.error('Could not read package.json');
    return false;
  }

  // Check if react-native-uxcam is already installed
  if (packageJson.dependencies && packageJson.dependencies['react-native-uxcam']) {
    log.info('react-native-uxcam is already installed');
    return true;
  }

  log.info('Adding react-native-uxcam to dependencies...');
  
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  
  packageJson.dependencies['react-native-uxcam'] = '^5.5.0';
  
  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success('Updated package.json');
    return true;
  } catch (error) {
    log.error('Failed to update package.json');
    return false;
  }
}

function validateEnvironment() {
  log.title('\n🔍 Validating Environment Configuration');
  
  const envPath = path.join(process.cwd(), '.env');
  const appJsonPath = path.join(process.cwd(), 'app.json');
  
  // Check .env file
  if (checkFileExists(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasUXCamKey = envContent.includes('UXCAM_API_KEY');
    
    if (hasUXCamKey) {
      log.success('UXCAM_API_KEY found in .env file');
    } else {
      log.warning('UXCAM_API_KEY not found in .env file');
      log.info('Please add: UXCAM_API_KEY="your_api_key_here"');
    }
  } else {
    log.warning('.env file not found');
    log.info('Please create .env file with: UXCAM_API_KEY="your_api_key_here"');
  }
  
  // Check app.json
  const appJson = readJsonFile(appJsonPath);
  if (appJson && appJson.expo && appJson.expo.extra) {
    const hasUXCamConfig = appJson.expo.extra.UXCAM_API_KEY !== undefined;
    
    if (hasUXCamConfig) {
      log.success('UXCam configuration found in app.json');
    } else {
      log.warning('UXCam configuration not found in app.json');
    }
  } else {
    log.warning('app.json configuration incomplete');
  }
}

function checkRequiredFiles() {
  log.title('\n📁 Checking Required Files');
  
  const requiredFiles = [
    'utils/uxcamService.ts',
    'hooks/useUXCam.ts',
    'context/UXCamContext.tsx',
    'components/UXCamPrivacyControls.tsx',
    'config/environment.ts',
    'components/UXCamExample.tsx',
    'UXCAM_INTEGRATION_GUIDE.md'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (checkFileExists(filePath)) {
      log.success(`${file} exists`);
    } else {
      log.error(`${file} missing`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function installDependencies() {
  log.title('\n📦 Installing Dependencies');
  
  try {
    log.info('Installing react-native-uxcam...');
    execSync('npm install react-native-uxcam', { stdio: 'inherit' });
    log.success('Dependencies installed successfully');
    return true;
  } catch (error) {
    log.error('Failed to install dependencies');
    return false;
  }
}

function generateEnvTemplate() {
  const envTemplate = `# UXCam Configuration
UXCAM_API_KEY=""

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=""
EXPO_PUBLIC_SUPABASE_ANON_KEY=""

# App Configuration
APP_ENV="development"
DEBUG_MODE="false"

# Feature Flags
ENABLE_UXCAM="true"
ENABLE_ANALYTICS="true"
`;

  const envPath = path.join(process.cwd(), '.env.example');
  
  if (!checkFileExists(envPath)) {
    try {
      fs.writeFileSync(envPath, envTemplate);
      log.success('Created .env.example template');
    } catch (error) {
      log.error('Failed to create .env.example');
    }
  }
}

function showNextSteps() {
  log.title('\n🚀 Next Steps');
  
  console.log(`
${colors.cyan}1.${colors.reset} Add your UXCam API key to the .env file:
   UXCAM_API_KEY="your_actual_api_key_here"

${colors.cyan}2.${colors.reset} Update app.json with your configuration:
   - Set UXCAM_API_KEY in the extra section
   - Configure other environment variables

${colors.cyan}3.${colors.reset} Test the integration:
   - Run: npm start
   - Navigate to the UXCamExample component
   - Check console for initialization logs

${colors.cyan}4.${colors.reset} Review the documentation:
   - Read UXCAM_INTEGRATION_GUIDE.md
   - Check UXCam dashboard for events

${colors.cyan}5.${colors.reset} Customize privacy controls:
   - Add UXCamPrivacyControls to your settings screen
   - Configure data masking as needed

${colors.yellow}Note:${colors.reset} Make sure to test on both iOS and Android devices.
`);
}

function main() {
  log.title('🎯 UXCam Integration Setup');
  log.info('Setting up UXCam for DIL Tutor app...\n');
  
  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!checkFileExists(packageJsonPath)) {
    log.error('Please run this script from the dil-tutor-app directory');
    process.exit(1);
  }
  
  // Update package.json
  const packageJsonUpdated = updatePackageJson();
  if (!packageJsonUpdated) {
    log.error('Failed to update package.json');
    process.exit(1);
  }
  
  // Install dependencies
  const dependenciesInstalled = installDependencies();
  if (!dependenciesInstalled) {
    log.error('Failed to install dependencies');
    process.exit(1);
  }
  
  // Check required files
  const filesExist = checkRequiredFiles();
  if (!filesExist) {
    log.error('Some required files are missing');
    log.info('Please ensure all UXCam integration files are present');
  }
  
  // Validate environment
  validateEnvironment();
  
  // Generate environment template
  generateEnvTemplate();
  
  // Show next steps
  showNextSteps();
  
  log.success('UXCam setup completed!');
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = {
  checkFileExists,
  readJsonFile,
  updatePackageJson,
  validateEnvironment,
  checkRequiredFiles,
  installDependencies,
  generateEnvTemplate,
};
