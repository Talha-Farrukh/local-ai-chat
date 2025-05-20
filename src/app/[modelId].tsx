import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { MessageBubble } from "../components/chat/MessageBubble";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { Header } from "../components/ui/Header";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useConversation } from "../hooks/useConversation";
import { COLORS } from "../lib/constants";
import { Message } from "../types/app.types";

// Add a type for the date separator messages
interface DateSeparator {
  id: string;
  role: "separator";
  content: string;
  timestamp: number;
}

// Type for the display messages which can be either Message or DateSeparator
type DisplayMessage = Message | DateSeparator;

// Function to format a date in a human-readable way showing if it's today, yesterday, or full date
const formatDisplayDate = (timestamp: number): string => {
  const today = new Date();
  const date = new Date(timestamp);

  // Check if date is today
  if (today.toDateString() === date.toDateString()) {
    return "Today";
  }

  // Check if date was yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return "Yesterday";
  }

  // Return full date for older messages
  return date.toLocaleDateString();
};

export default function ChatScreen() {
  const { modelId } = useLocalSearchParams<{ modelId: string }>();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const messageToSend = useRef<string>("");
  const router = useRouter();

  const {
    conversation,
    messages,
    isLoading,
    error,
    currentResponse,
    sendMessage,
    deleteMessage,
    clearConversation,
    refreshConversation,
    stopResponseGeneration,
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
      // Set submitting state immediately to prevent double submission
      setIsSubmitting(true);
      messageToSend.current = trimmedMessage;

      // Clear input immediately for better UX
      setMessage("");
      inputRef.current?.clear();

      // Send message
      await sendMessage(messageToSend.current);
      messageToSend.current = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally restore message if send fails
      setMessage(messageToSend.current);
      messageToSend.current = "";
    } finally {
      // Small delay before allowing new submissions to prevent accidental double taps
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  }, [message, isLoading, isSubmitting, sendMessage]);

  const handleLongPress = useCallback(
    (messageId: string) => {
      Alert.alert(
        "Delete Message",
        "Do you want to delete this message and its response?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteMessage(messageId),
          },
        ],
      );
    },
    [deleteMessage],
  );

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Process messages for display
  const processMessagesForDisplay = useCallback(() => {
    const displayMessages = [...messages];

    if (currentResponse) {
      displayMessages.push({
        id: "current-response",
        role: "assistant",
        content: currentResponse,
        timestamp: Date.now(),
      });
    }

    // Add date separators between messages from different days
    const messagesWithSeparators: DisplayMessage[] = [];
    let lastMessageDate = "";

    displayMessages.forEach((msg, index) => {
      const messageDate = new Date(msg.timestamp).toDateString();

      if (messageDate !== lastMessageDate) {
        lastMessageDate = messageDate;

        if (index > 0) {
          messagesWithSeparators.push({
            id: `date-separator-${msg.timestamp}`,
            role: "separator",
            content: formatDisplayDate(msg.timestamp),
            timestamp: msg.timestamp,
          });
        }
      }

      messagesWithSeparators.push(msg);
    });

    return messagesWithSeparators;
  }, [messages, currentResponse]);

  const displayMessages = processMessagesForDisplay();

  // Add a refreshing state and useEffect to check conversation status
  const [refreshing, setRefreshing] = useState(false);

  // Add this function in the component
  const handleRefresh = useCallback(async () => {
    console.log("Pull-to-refresh triggered");
    setRefreshing(true);
    try {
      await refreshConversation();
    } finally {
      setRefreshing(false);
    }
  }, [refreshConversation]);

  // Add this useEffect to refresh conversation when the screen is focused
  useEffect(() => {
    // This will run when the component mounts
    console.log("ChatScreen mounted, refreshing conversation");
    refreshConversation();

    // We could add an event listener for app state changes here
    // to refresh when the app comes back to the foreground
  }, [refreshConversation]);

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={clearConversation} fullScreen />
    );
  }

  if (!conversation) {
    return <LoadingSpinner text="Loading conversation..." fullScreen />;
  }

  const lastUpdated = formatDisplayDate(conversation.updatedAt);

  return (
    <View style={styles.container}>
      <Header
        title={conversation.name}
        subtitle={`Last updated: ${lastUpdated}`}
        leftIcon="back"
        onLeftPress={handleBack}
        rightIcon={
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={refreshConversation}
              style={[styles.clearButton, { marginRight: 8 }]}
            >
              <Ionicons
                name="refresh-outline"
                size={24}
                color={COLORS.PRIMARY}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons
                name="trash-outline"
                size={24}
                color={COLORS.STATUS.ERROR}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        renderItem={({ item }) => {
          if (item.role === "separator") {
            return (
              <View style={styles.dateSeparator}>
                <View style={styles.dateLine} />
                <Text style={styles.dateText}>{item.content}</Text>
                <View style={styles.dateLine} />
              </View>
            );
          }

          return (
            <MessageBubble
              message={item}
              showTimestamp
              isStreaming={item.id === "current-response"}
              onLongPress={handleLongPress}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No messages yet"
            description="Start a conversation by sending a message"
            icon={
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={COLORS.TEXT.SECONDARY}
              />
            }
          />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
            {isLoading ? (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopResponseGeneration}
              >
                <Ionicons
                  name="stop-circle"
                  size={30}
                  color={COLORS.STATUS.ERROR}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!message.trim() || isSubmitting) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!message.trim() || isSubmitting}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={
                    !message.trim() || isSubmitting
                      ? COLORS.TEXT.TERTIARY
                      : COLORS.PRIMARY
                  }
                />
              </TouchableOpacity>
            )}
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
    flexDirection: "row",
    alignItems: "center",
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
    textAlignVertical: "center",
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.BORDER,
  },
  clearButton: {
    padding: 8,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.TEXT.SECONDARY,
    marginHorizontal: 8,
    paddingHorizontal: 8,
  },
  stopButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.STATUS.ERROR + "10",
    justifyContent: "center",
    alignItems: "center",
  },
});
