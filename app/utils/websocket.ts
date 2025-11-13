import BASE_API_URL from '@/config/api';

let socket: WebSocket;
let englishOnlySocket: WebSocket;

export const connectLearnSocket = (
    onMessage: (msg: any) => void,
    onAudioData?: (audioBuffer: ArrayBuffer) => void,
    onClose?: () => void
  ) => {
    const wsUrl = BASE_API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    const fullUrl = `${wsUrl}/api/ws/learn`;
  
    console.log("WebSocket connecting to:", fullUrl);
  
    socket = new WebSocket(fullUrl);
    socket.binaryType = "arraybuffer";
    
    // Add connection timeout for faster failure detection
    const connectionTimeout = setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        console.error("WebSocket connection timeout");
        onClose?.();
      }
    }, 5000); // 5 second timeout
  
    socket.onopen = () => {
      console.log("Learn WebSocket Connected");
      clearTimeout(connectionTimeout); // Clear timeout on successful connection
    };
  
    socket.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
            onAudioData?.(event.data); // Send ArrayBuffer directly to conversation.tsx
        } else {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      }
    };
  
    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
    };
  
    socket.onclose = () => {
      console.log("WebSocket closed");
      onClose?.();
    };
  };

export const sendLearnMessage = (message: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    // console.log("Sending message:", message);
    console.log("sending message");
    socket.send(message);
  } else {
    console.error("WebSocket is not open. Current state:", socket?.readyState);
  }
};

export const closeLearnSocket = () => {
  if (socket) {
    socket.close();
  }
};

export const isSocketConnected = () => {
  return socket && socket.readyState === WebSocket.OPEN;
};

// English-Only WebSocket functions
export const connectEnglishOnlySocket = (
    onMessage: (msg: any) => void,
    onAudioData?: (audioBuffer: ArrayBuffer) => void,
    onClose?: () => void
  ) => {
    // Close any existing connection before creating a new one
    if (englishOnlySocket) {
      console.log("🔌 Closing existing English-Only WebSocket before reconnecting...");
      closeEnglishOnlySocket();
    }
    
    const wsUrl = BASE_API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    const fullUrl = `${wsUrl}/api/ws/english-only`;
  
    console.log("English-Only WebSocket connecting to:", fullUrl);
  
    englishOnlySocket = new WebSocket(fullUrl);
    englishOnlySocket.binaryType = "arraybuffer";
    
    // Add connection timeout for faster failure detection
    const connectionTimeout = setTimeout(() => {
      if (englishOnlySocket && englishOnlySocket.readyState !== WebSocket.OPEN) {
        console.error("English-Only WebSocket connection timeout");
        if (englishOnlySocket) {
          englishOnlySocket.close();
        }
        onClose?.();
      } else {
        console.log("✅ English-Only WebSocket connection successful, timeout cleared");
      }
    }, 15000); // 15 second timeout (increased from 5 seconds)
  
    englishOnlySocket.onopen = () => {
      console.log("English-Only WebSocket Connected");
      clearTimeout(connectionTimeout); // Clear timeout on successful connection
    };
  
    englishOnlySocket.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
            onAudioData?.(event.data); // Send ArrayBuffer directly to english-only.tsx
        } else {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error("Failed to parse English-Only WebSocket message:", error);
        }
      }
    };
  
    englishOnlySocket.onerror = (e) => {
      console.error("English-Only WebSocket error:", e);
      clearTimeout(connectionTimeout);
    };
  
    englishOnlySocket.onclose = (event) => {
      console.log(`English-Only WebSocket closed (code: ${event.code}, reason: ${event.reason || 'none'})`);
      clearTimeout(connectionTimeout);
      onClose?.();
    };
  };

export const sendEnglishOnlyMessage = (message: string) => {
  if (englishOnlySocket && englishOnlySocket.readyState === WebSocket.OPEN) {
    console.log("sending english-only message");
    englishOnlySocket.send(message);
  } else {
    console.error("English-Only WebSocket is not open. Current state:", englishOnlySocket?.readyState);
  }
};

/**
 * Send binary audio directly via WebSocket for optimized performance.
 * This eliminates ~33% Base64 encoding overhead and reduces transmission time.
 * 
 * @param audioBuffer - ArrayBuffer containing raw audio data
 * @param user_name - Optional user name to include in metadata (sent as separate JSON message first)
 */
export const sendEnglishOnlyBinaryAudio = (audioBuffer: ArrayBuffer, user_name?: string) => {
  if (englishOnlySocket && englishOnlySocket.readyState === WebSocket.OPEN) {
    // If user_name is provided, send metadata first as JSON
    if (user_name) {
      const metadata = JSON.stringify({
        type: "audio_binary_metadata",
        user_name: user_name,
        audio_size: audioBuffer.byteLength
      });
      englishOnlySocket.send(metadata);
    }
    
    // Send binary audio directly
    console.log(`📤 Sending binary audio: ${audioBuffer.byteLength} bytes`);
    englishOnlySocket.send(audioBuffer);
  } else {
    console.error("English-Only WebSocket is not open. Current state:", englishOnlySocket?.readyState);
  }
};

export const closeEnglishOnlySocket = () => {
  if (englishOnlySocket) {
    // Remove all event listeners to prevent memory leaks
    englishOnlySocket.onopen = null;
    englishOnlySocket.onmessage = null;
    englishOnlySocket.onerror = null;
    englishOnlySocket.onclose = null;
    
    // Close the socket if it's not already closed
    if (englishOnlySocket.readyState === WebSocket.OPEN || 
        englishOnlySocket.readyState === WebSocket.CONNECTING) {
      englishOnlySocket.close();
    }
    
    // Clear the socket reference
    englishOnlySocket = null as any;
    console.log("🔌 English-Only WebSocket closed and cleared");
  }
};

export const isEnglishOnlySocketConnected = () => {
  return englishOnlySocket && englishOnlySocket.readyState === WebSocket.OPEN;
};
