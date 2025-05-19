import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../lib/constants';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorMessage({
  message,
  onRetry,
  fullScreen = false,
}: ErrorMessageProps) {
  const content = (
    <>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.STATUS.ERROR,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  message: {
    color: COLORS.TEXT.INVERSE,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.STATUS.ERROR,
    fontSize: 14,
    fontWeight: '600',
  },
}); 