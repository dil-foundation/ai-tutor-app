import BASE_API_URL from '@/config/api';

let socket: WebSocket;

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
