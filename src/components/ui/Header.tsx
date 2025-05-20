import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../lib/constants";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  title: string;
  leftIcon?: "back" | "close";
  onLeftPress?: () => void;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
}

export function Header({
  title,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {leftIcon && onLeftPress && (
        <TouchableOpacity style={styles.leftButton} onPress={onLeftPress}>
          <Ionicons
            name={leftIcon === "back" ? "chevron-back" : "close"}
            size={24}
            color={COLORS.TEXT.PRIMARY}
          />
        </TouchableOpacity>
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {rightIcon && onRightPress ? (
        <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
          {rightIcon}
        </TouchableOpacity>
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingHorizontal: 16,
  },
  leftButton: {
    marginRight: 16,
  },
  rightButton: {
    marginLeft: 16,
  },
  rightPlaceholder: {
    width: 40,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.TEXT.PRIMARY,
    textAlign: "center",
  },
});
