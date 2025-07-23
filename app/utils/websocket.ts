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
    const wsUrl = BASE_API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    const fullUrl = `${wsUrl}/api/ws/english-only`;
  
    console.log("English-Only WebSocket connecting to:", fullUrl);
  
    englishOnlySocket = new WebSocket(fullUrl);
    englishOnlySocket.binaryType = "arraybuffer";
    
    // Add connection timeout for faster failure detection
    const connectionTimeout = setTimeout(() => {
      if (englishOnlySocket.readyState !== WebSocket.OPEN) {
        console.error("English-Only WebSocket connection timeout");
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
    };
  
    englishOnlySocket.onclose = () => {
      console.log("English-Only WebSocket closed");
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

export const closeEnglishOnlySocket = () => {
  if (englishOnlySocket) {
    englishOnlySocket.close();
  }
};

export const isEnglishOnlySocketConnected = () => {
  return englishOnlySocket && englishOnlySocket.readyState === WebSocket.OPEN;
};
