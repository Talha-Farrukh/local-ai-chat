# Offgrid AI - Implementation Documentation

## Overview

Offgrid AI is a React Native Expo application that enables users to download and interact with Large Language Models (LLMs) directly on their device. The app provides a modern, efficient interface for model management and conversations.

## Architecture

### Directory Structure

```
src/
├── app/                    # Expo Router app directory
├── assets/                 # Static assets (images, fonts)
├── components/
│   ├── ui/                # Reusable UI components
│   ├── model/             # Model-related components
│   └── chat/              # Chat interface components
├── config/                # App configuration
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
├── types/                 # TypeScript type definitions
├── constants/             # App constants
└── providers/             # Context providers
```

### Key Features

1. Model Management

   - Browse available LLMs from Hugging Face
   - Download models using expo-file-system
   - Persist downloaded models
   - Track download progress
   - Model metadata storage

2. Chat Interface

   - Modern ChatGPT-like design
   - Real-time message streaming
   - Message history persistence
   - Conversation management
   - Model switching capability

3. State Management
   - Using Jotai for global state
   - Persistent storage for models and chats
   - Download queue management

## Technical Implementation

### Model Management

- Uses Hugging Face API to fetch available models
- Implements expo-file-system for model downloads
- Stores models in app's persistent storage
- Maintains model metadata in local storage
- Implements download progress tracking

### Chat System

- Uses llama.rn for model inference
- Implements streaming responses
- Maintains conversation history
- Handles model loading/unloading
- Implements error handling and recovery

### Data Persistence

- Models stored in app's file system
- Chat history stored using AsyncStorage
- Model metadata cached for quick access
- Download state persistence

### UI/UX

- Modern, responsive design
- Smooth animations and transitions
- Loading states and progress indicators
- Error handling and user feedback
- Accessibility considerations

## Screens

### 1. Model Library Screen

- Displays available models from Hugging Face
- Shows download status and progress
- Provides model information and size
- Handles download queue

### 2. Downloaded Models Screen

- Lists locally available models
- Shows model details and storage usage
- Provides options to delete models
- Quick access to start chat

### 3. Chat Screen

- Modern chat interface
- Message input with send button
- Real-time response streaming
- Model information display
- Conversation management

## State Management

### Model State

```typescript
interface ModelState {
  availableModels: Model[];
  downloadedModels: DownloadedModel[];
  downloadProgress: Record<string, number>;
  activeModel: string | null;
}
```

### Chat State

```typescript
interface ChatState {
  conversations: Record<string, Conversation>;
  activeConversation: string | null;
  messageQueue: Message[];
}
```

## Data Flow

1. Model Download:

   ```
   User Selection → Download Queue → Progress Tracking → Storage → Model Ready
   ```

2. Chat Flow:
   ```
   User Input → Model Processing → Stream Response → UI Update → History Storage
   ```

## Performance Considerations

- Lazy loading of models
- Efficient memory management
- Background download handling
- Response streaming optimization
- UI performance optimization

## Security

- Secure storage of downloaded models
- API key management
- Input validation
- Error handling

## Testing

- Unit tests for utilities
- Component testing
- Integration testing
- E2E testing with Jest

## Future Improvements

- Multiple model chat
- Custom model import
- Advanced chat features
- Performance optimizations
- Cross-platform enhancements
