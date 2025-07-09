// components/core/Input/Input.tsx
import React, { useState, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { InputProps } from './Input.types';
import { styles } from './Input.styles';
import { useTheme } from '../../../contexts/ThemeContext';

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      size = 'medium',
      state = 'default',
      prefixIcon,
      suffixIcon,
      fullWidth = true,
      style,
      inputStyle,
      labelStyle,
      onPrefixPress,
      onSuffixPress,
      testID,
      multiline = false,
      ...rest
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Determine current state (error takes precedence)
    const currentState = errorText ? 'error' : state;

    // Get container styles based on state and focus
    const getContainerStyles = () => {
      // Start with base styles
      const baseStyles = [
        styles.inputContainer,
        styles[size],
        multiline && styles.multiline,
      ];

      // Create dynamic style object for colors and state-specific properties
      let dynamicStyles: any = {};

      // Border and background colors based on state
      switch (currentState) {
        case 'error':
          dynamicStyles = {
            borderColor: colors.error,
            backgroundColor: `${colors.error}10`, // 10% opacity
          };
          break;
        case 'success':
          dynamicStyles = {
            borderColor: colors.success,
            backgroundColor: `${colors.success}08`, // 8% opacity
          };
          break;
        case 'disabled':
          dynamicStyles = {
            borderColor: colors.border,
            backgroundColor: colors.fill,
            opacity: colors.disabledOpacity,
          };
          break;
        default:
          dynamicStyles = {
            borderColor: isFocused ? colors.primary : colors.border,
            backgroundColor: isFocused ? `${colors.primary}05` : 'transparent',
          };
      }

      return [...baseStyles, dynamicStyles];
    };

    // Get input text styles
    const getInputStyles = () => {
      const inputSizeStyle =
        `input${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles;

      return [
        styles.input,
        styles[inputSizeStyle],
        {
          color:
            currentState === 'disabled' ? colors.textTertiary : colors.text,
        },
        multiline && { textAlignVertical: 'top' as const },
        inputStyle,
      ];
    };

    // Get label styles
    const getLabelStyles = () => {
      return [
        styles.label,
        {
          color:
            currentState === 'error'
              ? colors.error
              : isFocused
                ? colors.primary
                : colors.textSecondary,
        },
        labelStyle,
      ];
    };

    // Get helper text styles
    const getHelperTextStyles = () => {
      return [
        styles.helperText,
        {
          color:
            currentState === 'error'
              ? colors.error
              : currentState === 'success'
                ? colors.success
                : colors.textSecondary,
        },
      ];
    };

    const handleFocus = (e: any) => {
      setIsFocused(true);
      rest.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      rest.onBlur?.(e);
    };

    const renderIcon = (
      icon: React.ReactNode,
      onPress?: () => void,
      position: 'prefix' | 'suffix' = 'prefix'
    ) => {
      if (!icon) return null;

      const IconComponent = onPress ? TouchableOpacity : View;
      const iconStyles = [
        styles.iconContainer,
        position === 'prefix' ? styles.prefixIcon : styles.suffixIcon,
      ];

      return (
        <IconComponent
          style={iconStyles}
          onPress={onPress}
          disabled={currentState === 'disabled'}
          activeOpacity={colors.activeOpacity}
          testID={`${testID}-${position}-icon`}
        >
          {icon}
        </IconComponent>
      );
    };

    return (
      <View style={[styles.container, fullWidth && styles.fullWidth, style]}>
        {/* Label */}
        {label && (
          <Text style={getLabelStyles()} testID={`${testID}-label`}>
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View style={getContainerStyles()}>
          {/* Prefix Icon */}
          {renderIcon(prefixIcon, onPrefixPress, 'prefix')}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={getInputStyles()}
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.primary}
            editable={currentState !== 'disabled'}
            multiline={multiline}
            onFocus={handleFocus}
            onBlur={handleBlur}
            testID={testID}
            {...rest}
          />

          {/* Suffix Icon */}
          {renderIcon(suffixIcon, onSuffixPress, 'suffix')}
        </View>

        {/* Helper/Error Text */}
        {(helperText || errorText) && (
          <Text style={getHelperTextStyles()} testID={`${testID}-helper-text`}>
            {errorText || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
