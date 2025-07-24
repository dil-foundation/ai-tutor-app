import * as FileSystem from 'expo-file-system';

let BASE_API_URL: string;

if (__DEV__) {
  // Development URL - update to your local IP and 
  //added.
  BASE_API_URL = 'http://192.168.1.3:8000';
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


export default BASE_API_URL;
