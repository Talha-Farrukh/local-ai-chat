import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants';
import { useInternetConnection } from '../../hooks/useInternetConnection';

export function OfflineNotice() {
  const { isOffline } = useInternetConnection();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.STATUS.ERROR,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.TEXT.INVERSE,
    fontSize: 14,
    fontWeight: '500',
  },
}); 