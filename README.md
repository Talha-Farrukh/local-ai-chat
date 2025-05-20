# Offgrid AI 🤖

A powerful React Native Expo application that enables users to download and interact with Large Language Models (LLMs) directly on their device. Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev), using [Typescript](https://www.typescriptlang.org/), [Yarn](https://yarnpkg.com/), [Jotai](https://jotai.org/), [Prettier](https://prettier.io/), and [ESLint](https://eslint.org/).

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Development Tools

### Jotai

[Jotai](https://jotai.org/) is used for state management with an atomic approach.

### Prettier

[Prettier](https://prettier.io/) is configured for consistent code formatting.

### ESLint

[ESLint](https://eslint.org/) ensures code quality and catches potential issues.

### Husky

[Husky](https://typicode.github.io/husky/#/) manages git hooks for pre-commit checks.

### Expo Router

[Expo Router](https://docs.expo.dev/router/introduction) handles navigation with file-based routing.

## Resources

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [Jotai documentation](https://jotai.org/)
- [TypeScript documentation](https://www.typescriptlang.org/)
- [Hugging Face](https://huggingface.co/) - Source for LLM models

## Features

### 🤖 LLM Integration

Offgrid AI provides a comprehensive platform for interacting with LLMs:

#### Model Management

- Browse and download models directly from Hugging Face
- Track download progress
- Manage downloaded models
- Persistent storage of models on device
- Model metadata storage and caching

#### Chat Interface

- Modern ChatGPT-like design
- Real-time message streaming
- Markdown rendering for AI responses
- Message history persistence
- Conversation management
- Model switching capability

#### Data Persistence

- Models stored in app's file system
- Chat history stored using AsyncStorage
- Model metadata cached for quick access
- Download state persistence

### 🎨 UI Components

The app includes a set of pre-built, customizable UI components:

#### Typography

- Customizable text components with various variants (h1-h6, p1-p3)
- Multiple font weights (regular, medium, semiBold, bold)
- Built-in text styles using Urbanist font family
- Responsive text sizing for different platforms

#### Buttons

- Multiple variants (default, secondary, outline, destructive)
- Loading state support with customizable loading text
- Disabled state styling
- Platform-specific touch feedback

#### Message Bubble

- User and AI message differentiation
- Markdown rendering for AI responses
- Timestamp display
- Streaming indicator
- Responsive design

### 🛠 Technical Features

- **LLM Integration**: Uses llama.rn for model inference
- **Hugging Face API**: Fetch and download models from Hugging Face
- **File System**: Implements expo-file-system for model downloads and storage
- **State Management**: Jotai for global state with persistent storage
- **Type Safety**: Full TypeScript support with strict type checking
- **Streaming**: Real-time response streaming from models
- **Error Handling**: Comprehensive error handling and recovery
- **Performance**: Optimized for mobile devices with background processing

## Main Screens

### Model Library

```tsx
// Browse available models from Hugging Face
<ModelLibrary
  onSelectModel={handleModelSelect}
  onDownloadModel={handleDownloadModel}
/>
```

### Downloaded Models

```tsx
// View and manage downloaded models
<DownloadedModels
  models={downloadedModels}
  onDeleteModel={handleDeleteModel}
  onSelectModel={handleSelectForChat}
/>
```

### Chat Screen

```tsx
// Interact with selected model
<ChatScreen
  modelId={selectedModel.id}
  conversation={activeConversation}
  onSendMessage={handleSendMessage}
/>
```

## Project Structure

The project follows a well-organized structure:

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
