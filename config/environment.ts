import Constants from 'expo-constants';

/**
 * Environment configuration
 * Manages all environment variables for the app
 */
export const Environment = {
  // UXCam Configuration
  UXCAM_API_KEY: Constants.expoConfig?.extra?.UXCAM_API_KEY || process.env.UXCAM_API_KEY || '',
  
  // Supabase Configuration
  SUPABASE_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
                process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // App Configuration
  APP_ENV: Constants.expoConfig?.extra?.APP_ENV || process.env.APP_ENV || 'development',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  
  // Feature Flags
  ENABLE_UXCAM: Constants.expoConfig?.extra?.ENABLE_UXCAM !== 'false',
  ENABLE_ANALYTICS: Constants.expoConfig?.extra?.ENABLE_ANALYTICS !== 'false',
  
  // Debug Configuration
  DEBUG_MODE: Constants.expoConfig?.extra?.DEBUG_MODE === 'true' || 
              process.env.DEBUG_MODE === 'true',
};

/**
 * Validate required environment variables
 * @returns Object with validation results
 */
export const validateEnvironment = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  if (!Environment.SUPABASE_URL) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is required');
  }

  if (!Environment.SUPABASE_ANON_KEY) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  // Optional but recommended variables
  if (!Environment.UXCAM_API_KEY) {
    warnings.push('UXCAM_API_KEY is not set - UXCam tracking will be disabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get environment-specific configuration
 * @returns Configuration object for current environment
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = Environment.APP_ENV === 'development';
  const isProduction = Environment.APP_ENV === 'production';
  const isStaging = Environment.APP_ENV === 'staging';

  return {
    isDevelopment,
    isProduction,
    isStaging,
    enableUXCam: Environment.ENABLE_UXCAM && !!Environment.UXCAM_API_KEY,
    enableAnalytics: Environment.ENABLE_ANALYTICS,
    debugMode: Environment.DEBUG_MODE || isDevelopment,
  };
};

export default Environment;
