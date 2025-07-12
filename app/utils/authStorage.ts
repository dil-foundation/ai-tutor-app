import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'accessToken';
const USER_ID_KEY = 'userId';

export const saveAuthData = async (token: string, userId: string) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
  } catch (error) {
    console.error('Error saving auth data', error);
  }
};

export const getAuthData = async () => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userId = await SecureStore.getItemAsync(USER_ID_KEY);
    return { token, userId };
  } catch (error) {
    console.error('Error getting auth data', error);
    return { token: null, userId: null };
  }
};

export const clearAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    await AsyncStorage.removeItem('hasVisitedLearn');
  } catch (error) {
    console.error('Error clearing auth data', error);
  }
};

 