import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { COLORS } from "../../lib/constants";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "large",
  color = COLORS.PRIMARY,
  text,
  fullScreen = false,
}: Readonly<LoadingSpinnerProps>) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.TEXT.SECONDARY,
  },
});
