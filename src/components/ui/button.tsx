import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS } from '../../lib/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const getContainerStyle = (): ViewStyle[] => {
    const styles: ViewStyle[] = [baseStyles.container];

    // Add size styles
    switch (size) {
      case 'sm':
        styles.push(baseStyles.containerSm);
        break;
      case 'lg':
        styles.push(baseStyles.containerLg);
        break;
      default:
        styles.push(baseStyles.containerMd);
    }

    // Add variant styles
    switch (variant) {
      case 'secondary':
        styles.push(baseStyles.containerSecondary);
        break;
      case 'outline':
        styles.push(baseStyles.containerOutline);
        break;
      case 'ghost':
        styles.push(baseStyles.containerGhost);
        break;
      default:
        styles.push(baseStyles.containerPrimary);
    }

    // Add disabled state
    if (disabled || isLoading) {
      styles.push(baseStyles.containerDisabled);
    }

    return styles;
  };

  const getTextStyle = (): TextStyle[] => {
    const styles: TextStyle[] = [baseStyles.text];

    // Add size styles
    switch (size) {
      case 'sm':
        styles.push(baseStyles.textSm);
        break;
      case 'lg':
        styles.push(baseStyles.textLg);
        break;
      default:
        styles.push(baseStyles.textMd);
    }

    // Add variant styles
    switch (variant) {
      case 'secondary':
        styles.push(baseStyles.textSecondary);
        break;
      case 'outline':
        styles.push(baseStyles.textOutline);
        break;
      case 'ghost':
        styles.push(baseStyles.textGhost);
        break;
      default:
        styles.push(baseStyles.textPrimary);
    }

    // Add disabled state
    if (disabled || isLoading) {
      styles.push(baseStyles.textDisabled);
    }

    return styles;
  };

  return (
    <TouchableOpacity
      style={[...getContainerStyle(), style]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.TEXT.INVERSE : COLORS.TEXT.PRIMARY}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={getTextStyle()}>{children}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  containerSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  containerMd: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  containerLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  containerPrimary: {
    backgroundColor: COLORS.PRIMARY,
  },
  containerSecondary: {
    backgroundColor: COLORS.SECONDARY,
  },
  containerOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  containerGhost: {
    backgroundColor: 'transparent',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 14,
  },
  textMd: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 18,
  },
  textPrimary: {
    color: COLORS.TEXT.INVERSE,
  },
  textSecondary: {
    color: COLORS.TEXT.INVERSE,
  },
  textOutline: {
    color: COLORS.PRIMARY,
  },
  textGhost: {
    color: COLORS.PRIMARY,
  },
  textDisabled: {
    color: COLORS.TEXT.TERTIARY,
  },
});
