// components/core/Button/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { ButtonProps } from './Button.types';
import { styles } from './Button.styles';
import { useTheme } from '../../../contexts/ThemeContext';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  onPress,
  testID,
  ...rest
}) => {
  const { colors } = useTheme();

  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  // Get variant-specific styles using theme colors
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1.5,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'destructive':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
        };
      default:
        return {};
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'destructive':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  // Get loading indicator color
  const getLoadingColor = () => {
    switch (variant) {
      case 'primary':
      case 'destructive':
        return '#FFFFFF';
      default:
        return colors.primary;
    }
  };

  // Build button styles
  const buttonStyles = [
    styles.base,
    styles[size],
    getVariantStyles(),
    fullWidth && styles.fullWidth,
    isDisabled && { opacity: colors.disabledOpacity },
    style,
  ];

  // Build text styles
  const buttonTextStyles = [
    styles.textBase,
    styles[
      `text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles
    ],
    { color: getTextColor() },
    textStyle,
  ];

  const handlePress = (event: import('react-native').GestureResponderEvent) => {
    if (!isDisabled && onPress) {
      onPress(event);
    }
  };

  const renderIcon = () => {
    if (!icon || loading) return null;

    return (
      <View
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      >
        {icon}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={getLoadingColor()}
            testID={`${testID}-loading`}
          />
          {typeof children === 'string' && (
            <Text style={[buttonTextStyles, styles.loadingText]}>
              {children}
            </Text>
          )}
        </View>
      );
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        {typeof children === 'string' ? (
          <Text style={buttonTextStyles} numberOfLines={1}>
            {children}
          </Text>
        ) : (
          children
        )}
        {iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : colors.activeOpacity}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};
