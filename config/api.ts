import { Platform } from 'react-native';

let BASE_API_URL: string;


if (__DEV__) {
  // Development URLs
  BASE_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
} else {
  // Production URL
  BASE_API_URL = 'https://api.dil.lms-staging.com';
}

export const WORDPRESS_API_URL = 'https://dil.lms-staging.com';

export default BASE_API_URL; 