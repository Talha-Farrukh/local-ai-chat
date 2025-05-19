import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useConversation } from '../hooks/useConversation';
import { Header } from '../components/ui/Header';
import { MessageBubble } from '../components/chat/MessageBubble';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { COLORS } from '../lib/constants';
import { FlatList } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { modelId } = useLocalSearchParams<{ modelId: string }>();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const messageToSend = useRef<string>('');
  const router = useRouter();
  
  const {
    conversation,
    messages,
    isLoading,
    error,
    currentResponse,
    sendMessage,
    clearConversation,
  } = useConversation(modelId);

  // Reset submitting state when loading state changes
  useEffect(() => {
    if (!isLoading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [isLoading]);

  const handleBack = () => {
    router.back();
  };

  const handleClear = () => {
    clearConversation();
  };

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || isSubmitting) return;

    try {
      setIsSubmitting(true);
      messageToSend.current = trimmedMessage;
      
      // Clear input immediately for better UX
      setMessage('');
      inputRef.current?.clear();

      // Send message
      await sendMessage(messageToSend.current);
      messageToSend.current = '';
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally restore message if send fails
      setMessage(messageToSend.current);
      messageToSend.current = '';
    } finally {
      setIsSubmitting(false);
    }
  }, [message, isLoading, isSubmitting, sendMessage]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Combine messages with current response for display
  const displayMessages = [...messages];
  if (currentResponse) {
    displayMessages.push({
      id: 'current-response',
      role: 'assistant',
      content: currentResponse,
      timestamp: Date.now(),
    });
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={clearConversation}
        fullScreen
      />
    );
  }

  if (!conversation) {
    return (
      <LoadingSpinner
        text="Loading conversation..."
        fullScreen
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={conversation.name}
        leftIcon="back"
        onLeftPress={handleBack}
        rightIcon={
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={24} color={COLORS.STATUS.ERROR} />
          </TouchableOpacity>
        }
      />

      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            showTimestamp
            isStreaming={item.id === 'current-response'}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No messages yet"
            description="Start a conversation by sending a message"
            icon={<Ionicons name="chatbubble-outline" size={48} color={COLORS.TEXT.SECONDARY} />}
          />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.TEXT.TERTIARY}
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSend}
              editable={!isLoading && !isSubmitting}
              multiline
              maxLength={1000}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || isLoading || isSubmitting) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!message.trim() || isLoading || isSubmitting}
            >
              <Ionicons
                name="send"
                size={24}
                color={!message.trim() || isLoading || isSubmitting ? COLORS.TEXT.TERTIARY : COLORS.PRIMARY}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.SURFACE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    color: COLORS.TEXT.PRIMARY,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.BORDER,
  },
  clearButton: {
    padding: 8,
  },
}); 