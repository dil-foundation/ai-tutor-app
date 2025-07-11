import * as FileSystem from 'expo-file-system';

let BASE_API_URL: string;

if (__DEV__) {
  // Development URL - update to your local IP and 
  //added.
  BASE_API_URL = 'http://172.31.115.11:8000';
  // BASE_API_URL = 'https://bda6-2401-4900-4df1-bc03-f029-886d-1f7c-9add.ngrok-free.app';
} else {
  // Production URL
  BASE_API_URL = 'https://api.dil.lms-staging.com';
}

export const WORDPRESS_API_URL = 'https://dil.lms-staging.com';

/**
 * Send text to backend and receive TTS audio (.wav) file
 * @param text - Word to convert to audio (e.g. "Apple")
 * @returns audio URL as blob object URL or null on error
 */
export const fetchAudioFromText = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch(`${BASE_API_URL}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const blob = await response.blob();

    const reader = new FileReader();
    return await new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (base64data) {
          const fileUri = FileSystem.cacheDirectory + `${text}.mp3`;
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve(fileUri);
        } else {
          reject("Base64 conversion failed");
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching audio:", error);
    return null;
  }
};

/**
 * Fetch user profile data from the backend
 * @param userId - User ID from auth data
 * @param token - Auth token for authenticated requests
 * @returns User profile data or null on error
 */
export const fetchUserProfile = async (userId: string, token: string): Promise<any | null> => {
  try {
    const response = await fetch(`${BASE_API_URL}/user/profile/${userId}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Update user profile data in the backend
 * @param userId - User ID from auth data
 * @param token - Auth token for authenticated requests
 * @param profileData - Updated profile data
 * @returns Updated profile data or null on error
 */
export const updateUserProfile = async (userId: string, token: string, profileData: any): Promise<any | null> => {
  try {
    const response = await fetch(`${BASE_API_URL}/user/profile/${userId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

/**
 * Fetch user progress and statistics
 * @param userId - User ID from auth data
 * @param token - Auth token for authenticated requests
 * @returns User progress data or null on error
 */
export const fetchUserProgress = async (userId: string, token: string): Promise<any | null> => {
  try {
    const response = await fetch(`${BASE_API_URL}/user/progress/${userId}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return null;
  }
};

export default BASE_API_URL;
