import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Message } from '../../types/app.types';
import { formatDate } from '../../lib/utils';
import { COLORS } from '../../lib/constants';

interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  isStreaming?: boolean;
}

export function MessageBubble({ 
  message, 
  showTimestamp = false,
  isStreaming = false,
}: Readonly<MessageBubbleProps>) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        isStreaming && styles.streamingBubble
      ]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        {showTimestamp && (
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
            {formatDate(message.timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: width * 0.8,
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    padding: 12,
    maxWidth: width * 0.75,
  },
  userBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderBottomLeftRadius: 4,
  },
  streamingBubble: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.TEXT.INVERSE,
  },
  assistantText: {
    color: COLORS.TEXT.PRIMARY,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: COLORS.TEXT.INVERSE + '80',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: COLORS.TEXT.SECONDARY,
  },
}); 