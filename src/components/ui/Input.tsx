import React from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import { COLORS } from "../../lib/constants";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  ...props
}: Readonly<InputProps>) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
          props.editable === false && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={COLORS.TEXT.TERTIARY}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.TEXT.SECONDARY,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: COLORS.TEXT.PRIMARY,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  iconLeft: {
    paddingLeft: 16,
  },
  iconRight: {
    paddingRight: 16,
  },
  inputError: {
    borderColor: COLORS.STATUS.ERROR,
  },
  inputDisabled: {
    backgroundColor: COLORS.BACKGROUND,
    opacity: 0.5,
  },
  error: {
    fontSize: 12,
    color: COLORS.STATUS.ERROR,
    marginTop: 4,
  },
});
