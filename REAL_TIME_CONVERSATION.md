# Real-time AI Tutor Conversation Feature

This document explains the new real-time conversation feature that implements a ChatGPT-like voice conversation interface for the AI Tutor app.

## Overview

The real-time conversation feature allows users to have natural, voice-based conversations with the AI tutor using WebSocket connections. The system supports:

- Real-time voice recording and transcription
- AI responses with text-to-speech audio
- Chat-like interface with message history
- Connection status indicators
- Both voice and text input methods

## Architecture

### Frontend Components

1. **Conversation Screen** (`app/(tabs)/learn/conversation.tsx`)
   - Main conversation interface
   - Handles WebSocket communication
   - Manages audio recording and playback
   - Displays message history

2. **WebSocket Utility** (`app/utils/websocket.ts`)
   - Manages WebSocket connections
   - Handles both text and binary (audio) messages
   - Provides connection status

3. **Learn Layout** (`app/(tabs)/learn/_layout.tsx`)
   - Updated to include conversation screen
   - Manages navigation between learn features

### Backend Integration

The frontend expects the backend to implement the following WebSocket endpoint:

```
ws://<BACKEND_URL>/api/ws/learn
```

#### Expected Backend Flow

1. **Receive Urdu Text/Audio**: Backend receives user input (text or audio transcription)
2. **Translate to English**: Convert Urdu to English
3. **Generate AI Response**: Create contextual response
4. **Send Text Response**: Send JSON message with response text
5. **Generate Audio**: Create TTS audio for the response
6. **Send Audio**: Send binary audio data via WebSocket

#### Message Format

**Text Messages (JSON)**:
```json
{
  "response": "The English sentence is 'Hello, how are you?'. Can you repeat after me?",
  "step": "repeat_prompt"
}
```

**Audio Messages (Binary)**:
- Raw MP3 audio data sent as binary WebSocket message

## Usage

### Starting a Conversation

1. Navigate to the Learn tab
2. Click "Start Real-time Conversation" button
3. The app will connect to the WebSocket server
4. Once connected, you can start speaking or typing

### Voice Input

1. Press and hold the microphone button to start recording
2. Speak in Urdu
3. Release the button to stop recording
4. The app will upload the audio and send the transcription
5. Wait for AI response with audio playback

### Text Input

1. Type your message in the text input field
2. Press the send button
3. The message will be sent via WebSocket
4. Wait for AI response

### Conversation Flow

1. **User speaks in Urdu** → Audio uploaded and transcribed
2. **Backend translates** → Urdu to English translation
3. **AI responds** → Contextual response with audio
4. **User repeats** → Practice pronunciation
5. **Feedback given** → Correct/incorrect feedback
6. **Continue** → Next sentence or retry

## Configuration

### Backend URL

Update the backend URL in `config/api.ts`:

```typescript
if (__DEV__) {
  BASE_API_URL = 'http://YOUR_LOCAL_IP:8000';
} else {
  BASE_API_URL = 'https://your-production-api.com';
}
```

### WebSocket Connection

The WebSocket URL is automatically derived from the HTTP API URL:
- `http://` → `ws://`
- `https://` → `wss://`

## Features

### Real-time Communication
- Instant message delivery via WebSocket
- Binary audio streaming
- Connection status monitoring

### Voice Interface
- High-quality audio recording
- Automatic audio playback
- Visual feedback during recording/playback

### Chat Interface
- Message bubbles with timestamps
- Auto-scrolling conversation
- Status indicators for different states

### Error Handling
- Connection failure recovery
- Audio upload fallbacks
- Graceful error messages

## Development Notes

### Audio Handling
- Uses Expo AV for recording and playback
- Supports both iOS and Android audio formats
- Automatic audio file management

### WebSocket Management
- Automatic reconnection handling
- Binary message support for audio
- Connection state monitoring

### State Management
- React hooks for local state
- Proper cleanup on component unmount
- Optimistic UI updates

## Testing

### Local Development
1. Start your backend server
2. Update the API URL in `config/api.ts`
3. Run the app in development mode
4. Test WebSocket connection
5. Test audio recording and playback

### Production Deployment
1. Update production API URL
2. Test WebSocket over WSS
3. Verify audio streaming works
4. Test on both iOS and Android

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check backend server is running
   - Verify API URL configuration
   - Check network connectivity

2. **Audio Not Playing**
   - Check audio permissions
   - Verify audio file format
   - Test with different audio sources

3. **Recording Not Working**
   - Request microphone permissions
   - Check device audio settings
   - Test on different devices

### Debug Information

Enable console logging to debug issues:
- WebSocket connection status
- Audio upload progress
- Message flow tracking

## Future Enhancements

1. **Continuous Listening**: Always-on voice input
2. **Voice Activity Detection**: Automatic recording start/stop
3. **Offline Support**: Local processing capabilities
4. **Multi-language Support**: Support for other languages
5. **Conversation History**: Persistent chat history
6. **Voice Customization**: Different AI voices
7. **Advanced Feedback**: Detailed pronunciation analysis 