import { Platform } from 'react-native';

// Define BASE_API_URL based on Platform
const BASE_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export default BASE_API_URL; 