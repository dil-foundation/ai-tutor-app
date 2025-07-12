import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Cross-platform utility for converting audio blob to playable URI
 * Works on both Android and iOS
 */
export const convertBlobToAudioUri = async (blob: Blob): Promise<string> => {
  console.log('🔄 convertBlobToAudioUri: Converting blob to audio URI...');
  console.log('📊 Blob details:', {
    size: blob.size,
    type: blob.type,
    platform: Platform.OS
  });

  try {
    if (Platform.OS === 'web') {
      // Web platform - use blob URL
      console.log('🌐 Web platform detected, using blob URL');
      const audioUri = URL.createObjectURL(blob);
      console.log('✅ Web audio URI created:', audioUri);
      return audioUri;
    } else {
      // Mobile platforms (iOS/Android) - use base64 data URI
      console.log('📱 Mobile platform detected, using base64 data URI');
      
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));
      
      // Create data URI
      const audioUri = `data:audio/mpeg;base64,${base64Audio}`;
      console.log('✅ Mobile audio URI created (base64):', audioUri.substring(0, 50) + '...');
      
      return audioUri;
    }
  } catch (error) {
    console.error('❌ convertBlobToAudioUri: Error converting blob:', error);
    
    // Fallback: try to save to file system and return file URI
    try {
      console.log('🔄 convertBlobToAudioUri: Trying file system fallback...');
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));
      
      // Save to temporary file
      const tempFileUri = `${FileSystem.documentDirectory}temp_audio_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(tempFileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('✅ Fallback audio URI created:', tempFileUri);
      return tempFileUri;
    } catch (fallbackError) {
      console.error('❌ convertBlobToAudioUri: Fallback also failed:', fallbackError);
      throw new Error('Failed to convert audio blob to playable URI');
    }
  }
};

/**
 * Alternative method using direct fetch to file system
 * More reliable for mobile platforms
 */
export const fetchAudioToFile = async (url: string): Promise<string> => {
  console.log('🔄 fetchAudioToFile: Fetching audio to file system...');
  console.log('📡 URL:', url);
  
  try {
    // Generate unique filename
    const filename = `audio_${Date.now()}.mp3`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
    console.log('📁 Saving to:', fileUri);
    
    // Download file directly to file system
    const downloadResult = await FileSystem.downloadAsync(url, fileUri);
    
    console.log('✅ Audio downloaded successfully:', {
      uri: downloadResult.uri,
      status: downloadResult.status,
      headers: downloadResult.headers
    });
    
    return downloadResult.uri;
  } catch (error) {
    console.error('❌ fetchAudioToFile: Error downloading audio:', error);
    throw new Error('Failed to download audio file');
  }
};

/**
 * Clean up temporary audio files
 */
export const cleanupAudioFiles = async (): Promise<void> => {
  try {
    console.log('🧹 cleanupAudioFiles: Cleaning up temporary audio files...');
    
    const documentDir = FileSystem.documentDirectory;
    if (!documentDir) return;
    
    const files = await FileSystem.readDirectoryAsync(documentDir);
    const audioFiles = files.filter(file => 
      file.startsWith('temp_audio_') || file.startsWith('audio_')
    );
    
    for (const file of audioFiles) {
      try {
        await FileSystem.deleteAsync(`${documentDir}${file}`);
        console.log('🗑️ Deleted:', file);
      } catch (e) {
        console.log('⚠️ Could not delete:', file, e);
      }
    }
    
    console.log('✅ Audio cleanup completed');
  } catch (error) {
    console.error('❌ cleanupAudioFiles: Error during cleanup:', error);
  }
}; 